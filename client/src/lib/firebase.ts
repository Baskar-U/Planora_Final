import { initializeApp } from 'firebase/app';
import { getAuth, signInWithRedirect, signInWithPopup, getRedirectResult, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { WhereFilterOp } from 'firebase/firestore';

// Firebase configuration for hosting (planora-events project) - HOSTING ONLY
const firebaseConfigHosting = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD8U4uASAbqN99EgOnLW5bE4nJxPCfXdag",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "planora-events.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "planora-events",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "planora-events.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "776617695485",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:776617695485:web:8370e20b38bdb824f38694",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ESK3JXPN0S"
  };

// Firebase configuration for all features (planora-ce3a5 project) - AUTH, DB, STORAGE
const firebaseConfig = {
    apiKey: "AIzaSyBBHdkoD3yYCe9gLCs8zV9_QpL7f0P34ag",
    authDomain: "planora-ce3a5.firebaseapp.com",
    projectId: "planora-ce3a5",
    storageBucket: "planora-ce3a5.appspot.com",
    messagingSenderId: "681139972771",
    appId: "1:681139972771:web:5e17d10a3549c1abe52d16",
    measurementId: "G-HTHPBGY2GQ"
  };

// Initialize Firebase for hosting (planora-events project) - HOSTING ONLY
const appHosting = initializeApp(firebaseConfigHosting, 'hosting');

// Initialize Firebase for all features (planora-ce3a5 project) - AUTH, DB, STORAGE
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service (using planora-ce3a5)
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service (using planora-ce3a5)
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service (using planora-ce3a5)
export const storage = getStorage(app);

// TEMPORARY: Make Firebase globally accessible for setup script
// Remove this after setup is complete
if (typeof window !== 'undefined') {
  (window as any).firebase = {
    firestore: () => ({
      collection: (collectionName: string) => ({
        doc: (docId: string) => ({
          set: async (data: any) => {
            const { doc, setDoc } = await import('firebase/firestore');
            const docRef = doc(db, collectionName, docId);
            return setDoc(docRef, data);
          }
        }),
        where: (field: string, operator: WhereFilterOp, value: any) => ({
          get: async () => {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const q = query(collection(db, collectionName), where(field, operator, value));
            return getDocs(q);
          }
        }),
        orderBy: (field: string, direction: 'asc' | 'desc' = 'desc') => ({
          get: async () => {
            const { collection, query, orderBy, getDocs } = await import('firebase/firestore');
            const q = query(collection(db, collectionName), orderBy(field, direction));
            return getDocs(q);
          }
        })
      })
    })
  };
  
  console.log('✅ Firebase (planora-ce3a5) made globally accessible for setup script');
}

export default app;

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

export const signInWithGoogleRedirect = () => {
  return signInWithRedirect(auth, provider);
};

export const handleRedirectResult = () => {
  return getRedirectResult(auth);
};

export const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => {
  return signOut(auth);
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};
