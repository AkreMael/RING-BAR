import { Reservation, SelectedDrink } from '../types';

const SHEET_NAME = 'Le Ring Bar - Réservations';

/**
 * Searches for a spreadsheet named "Le Ring Bar - Réservations".
 * If not found, creates it and initializes headers.
 * Returns the spreadsheet ID.
 */
export async function findOrCreateSpreadsheet(accessToken: string): Promise<string> {
  try {
    // 1. Search Google Drive for the file
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(SHEET_NAME)}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name)`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!searchRes.ok) {
      throw new Error(`Erreur recherche Google Drive: ${searchRes.statusText}`);
    }

    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // 2. If not found, create a new spreadsheet
    const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: SHEET_NAME,
        },
        sheets: [
          {
            properties: {
              title: 'Réservations',
              gridProperties: {
                rowCount: 1000,
                columnCount: 12,
                frozenRowCount: 1,
              },
            },
          },
        ],
      }),
    });

    if (!createRes.ok) {
      throw new Error(`Erreur création Google Sheet: ${createRes.statusText}`);
    }

    const createData = await createRes.json();
    const spreadsheetId = createData.spreadsheetId;

    // 3. Initialize headers
    const appendHeadersUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Réservations!A1:L1:append?valueInputOption=USER_ENTERED`;
    const headersRes = await fetch(appendHeadersUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [
          [
            'ID Réservation',
            'Date Réservation',
            'Heure d\'arrivée',
            'ID Salon',
            'Nom du Salon',
            'Nom Client',
            'Téléphone',
            'Nombre de personnes',
            'Boissons commandées',
            'Prix Total (F CFA)',
            'Commentaire',
            'Date Création',
            'Statut'
          ],
        ],
      }),
    });

    if (!headersRes.ok) {
      console.error('Erreur initialisation en-têtes:', headersRes.statusText);
    }

    return spreadsheetId;
  } catch (error) {
    console.error('findOrCreateSpreadsheet failed:', error);
    throw error;
  }
}

/**
 * Appends a new reservation row to the spreadsheet.
 */
export async function appendReservation(
  accessToken: string,
  spreadsheetId: string,
  reservation: Reservation
): Promise<void> {
  try {
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Réservations!A2:L2:append?valueInputOption=USER_ENTERED`;

    // Format drinks into a readable string
    const drinksStr = reservation.drinks
      .map((d) => `${d.quantity}x ${d.drink.name} (${d.drink.price} F CFA/u)`)
      .join(', ') || 'Aucune boisson';

    const rowValue = [
      reservation.id,
      reservation.date,
      reservation.time,
      reservation.salonId.toString(),
      reservation.salonName,
      reservation.clientName,
      reservation.clientPhone,
      reservation.guestsCount.toString(),
      drinksStr,
      reservation.totalPrice.toString(),
      reservation.comment || '',
      reservation.createdAt,
      reservation.status,
    ];

    const response = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValue],
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur enregistrement de la réservation: ${response.statusText}`);
    }
  } catch (error) {
    console.error('appendReservation failed:', error);
    throw error;
  }
}

/**
 * Fetches all reservations from the spreadsheet to detect already booked salons.
 */
export async function fetchReservationsFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<Reservation[]> {
  try {
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Réservations!A2:M1000`;
    const response = await fetch(readUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Erreur de lecture Google Sheet: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.values || data.values.length === 0) {
      return [];
    }

    return data.values.map((row: any[]) => {
      // Reconstruct drinks from string format if needed (or just save the description string)
      // Since drinks list is used for display, let's mock reconstruct selectedDrinks or store them in a simplified form
      const id = row[0] || '';
      const date = row[1] || '';
      const time = row[2] || '';
      const salonId = parseInt(row[3] || '0', 10);
      const salonName = row[4] || '';
      const clientName = row[5] || '';
      const clientPhone = row[6] || '';
      const guestsCount = parseInt(row[7] || '0', 10);
      const drinksStr = row[8] || '';
      const totalPrice = parseFloat(row[9] || '0');
      const comment = row[10] || '';
      const createdAt = row[11] || '';
      const status = (row[12] || 'pending') as 'pending' | 'confirmed' | 'cancelled';

      // Simple reconstruction of drinks for type-safety
      const reconstructedDrinks: SelectedDrink[] = [];
      if (drinksStr && drinksStr !== 'Aucune boisson') {
        const parts = drinksStr.split(', ');
        parts.forEach((part, index) => {
          const match = part.match(/^(\d+)x (.+?) \((.+?)(?:€|F\s*CFA|FCFA)\/u\)$/i);
          if (match) {
            reconstructedDrinks.push({
              drink: {
                id: `sheet-${index}`,
                name: match[2],
                price: parseFloat(match[3]),
                category: 'Cocktail', // Placeholder category
                description: '',
                image: '',
              },
              quantity: parseInt(match[1], 10),
            });
          } else {
            // fallback
            reconstructedDrinks.push({
              drink: {
                id: `sheet-fallback-${index}`,
                name: part,
                price: 0,
                category: 'Cocktail',
                description: '',
                image: '',
              },
              quantity: 1,
            });
          }
        });
      }

      return {
        id,
        salonId,
        salonName,
        drinks: reconstructedDrinks,
        totalPrice,
        clientName,
        clientPhone,
        date,
        time,
        guestsCount,
        comment,
        createdAt,
        status,
      };
    });
  } catch (error) {
    console.error('fetchReservationsFromSheet failed:', error);
    return []; // Return empty if error occurs, safe degradation
  }
}

/**
 * Updates the status of a specific reservation in column M of the Google Sheet.
 */
export async function updateReservationStatusInSheet(
  accessToken: string,
  spreadsheetId: string,
  reservationId: string,
  newStatus: 'pending' | 'confirmed' | 'cancelled'
): Promise<void> {
  try {
    // 1. Fetch all reservations to find the matching row
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Réservations!A2:A1000`;
    const response = await fetch(readUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Erreur lecture des IDs pour mise à jour: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.values || data.values.length === 0) {
      throw new Error('Aucune réservation trouvée dans la feuille.');
    }

    // 2. Find row index (0-based list)
    const rowIdx = data.values.findIndex((row: any[]) => row[0] === reservationId);
    if (rowIdx === -1) {
      throw new Error(`Réservation avec l'ID ${reservationId} introuvable.`);
    }

    // Row number in Google Sheet is index + 2 (since row 1 is header, list starts at row 2)
    const rowNumber = rowIdx + 2;

    // 3. Update column M (13th column)
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Réservations!M${rowNumber}?valueInputOption=USER_ENTERED`;
    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[newStatus]],
      }),
    });

    if (!updateRes.ok) {
      throw new Error(`Erreur lors de la mise à jour du statut: ${updateRes.statusText}`);
    }
  } catch (error) {
    console.error('updateReservationStatusInSheet failed:', error);
    throw error;
  }
}

