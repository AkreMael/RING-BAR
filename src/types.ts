export interface Salon {
  id: number;
  name: string;
  location: string;
  capacity: string;
  description: string;
  priceMin: number; // Minimum spend or booking fee
  color: string;
}

export interface Drink {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
}

export interface SelectedDrink {
  drink: Drink;
  quantity: number;
}

export interface Reservation {
  id: string;
  salonId: number;
  salonName: string;
  drinks: SelectedDrink[];
  totalPrice: number;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  guestsCount: number;
  comment?: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  syncedToSheet?: boolean;
}

export interface Message {
  id: string;
  title: string;
  content: string;
  reservation: Reservation;
  isRead: boolean;
  createdAt: string;
}
