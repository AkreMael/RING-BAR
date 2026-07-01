import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, collection, setDoc, updateDoc, getDocFromServer, onSnapshot, getDocs, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Request Google Drive and Sheets scopes
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('google_sheets_access_token') : null;

// Error handler according to firebase-integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection Validation on boot (Prerequisite check)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Listen for auth state changes
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // Provide user session even if Google Sheets access token is not yet requested or cached
      const token = cachedAccessToken || localStorage.getItem('google_sheets_access_token');
      if (onAuthSuccess) onAuthSuccess(user, token);
    } else {
      cachedAccessToken = null;
      localStorage.removeItem('google_sheets_access_token');
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Impossible de récupérer le jeton d\'accès Google Sheets.');
    }

    cachedAccessToken = credential.accessToken;
    localStorage.setItem('google_sheets_access_token', cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erreur de connexion:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken || localStorage.getItem('google_sheets_access_token');
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  if (token) {
    localStorage.setItem('google_sheets_access_token', token);
  } else {
    localStorage.removeItem('google_sheets_access_token');
  }
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  localStorage.removeItem('google_sheets_access_token');
};

// --- Firestore Helpers ---

// Save a reservation to Firestore (real-time shared database)
export async function saveReservationToFirestore(reservation: any): Promise<void> {
  const path = `reservations/${reservation.id}`;
  try {
    await setDoc(doc(db, 'reservations', reservation.id), reservation);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update status of reservation in Firestore
export async function updateReservationStatusInFirestore(reservationId: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<void> {
  const path = `reservations/${reservationId}`;
  try {
    await updateDoc(doc(db, 'reservations', reservationId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Update sync status of reservation in Firestore
export async function updateReservationSyncStatusInFirestore(reservationId: string, syncedToSheet: boolean): Promise<void> {
  const path = `reservations/${reservationId}`;
  try {
    await updateDoc(doc(db, 'reservations', reservationId), { syncedToSheet });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Real-time listener for reservations
export function subscribeToReservations(onUpdate: (reservations: any[]) => void): () => void {
  const path = 'reservations';
  return onSnapshot(
    collection(db, 'reservations'),
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data());
      });
      // Sort by creation date (newest first)
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

