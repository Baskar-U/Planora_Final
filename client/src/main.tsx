import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { db, auth } from './lib/firebase';
import { collection, addDoc, getDocs, getDoc, setDoc, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';

// Do NOT expose Firebase instances in production
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Comment out or remove these lines if you never want exposure even in dev
  // (window as any).db = db;
  // (window as any).auth = auth;
  // (window as any).collection = collection;
  // (window as any).addDoc = addDoc;
  // (window as any).getDocs = getDocs;
  // (window as any).query = query;
  // (window as any).where = where;
  // (window as any).orderBy = orderBy;
  // (window as any).doc = doc;
  // (window as any).updateDoc = updateDoc;
  // (window as any).getDoc = getDoc;
  // (window as any).setDoc = setDoc;
}

// Silence non-error console output globally
try {
  const noop = () => {};
  // Suppress verbose logs; keep errors
  (console as any).log = noop;
  (console as any).debug = noop;
  (console as any).info = noop;
  (console as any).warn = noop;
  (console as any).trace = noop;
} catch {}
createRoot(document.getElementById("root")!).render(<App />);
