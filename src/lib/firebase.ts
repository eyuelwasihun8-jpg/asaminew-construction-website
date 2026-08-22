import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCJaXe4tCdfEdrJUb6hh5MmyMhkQ1PK1sE",
  authDomain: "asamnew-df63c.firebaseapp.com",
  projectId: "asamnew-df63c",
  storageBucket: "asamnew-df63c.firebasestorage.app",
  messagingSenderId: "963108395355",
  appId: "1:963108395355:web:77c9c7b4df3f966171a27e",
  measurementId: "G-VCW4WWF73B",
};

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
}

export function getAuthInstance(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

// Real instances (not Proxies) for backward compatibility
export const firebaseDb: Firestore = getDb();
export const firebaseAuth: Auth = getAuthInstance();

// ------- Cache helpers for instant UI ----------
type CacheEntry<T> = { data: T; timestamp: number };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`fb_cache_${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(`fb_cache_${key}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      `fb_cache_${key}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // Storage quota or other errors — ignore
  }
}

export function invalidateCache(key?: string): void {
  if (typeof window === "undefined") return;
  if (key) {
    sessionStorage.removeItem(`fb_cache_${key}`);
  } else {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("fb_cache_"))
      .forEach((k) => sessionStorage.removeItem(k));
  }
}

export default getFirebaseApp;