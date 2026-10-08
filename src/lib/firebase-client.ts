// 관리자 페이지(브라우저)에서 쓰는 Firebase 인스턴스.
import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage, type FirebaseStorage } from 'firebase/storage';
import { FIRESTORE_DATABASE_ID, firebaseConfig, emulatorsEnabled } from './firebase-config';

interface FirebaseClient {
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
}

const cache = globalThis as typeof globalThis & { __firebaseClient?: FirebaseClient };

export function firebaseClient(): FirebaseClient {
  if (!cache.__firebaseClient) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const client = { auth: getAuth(app), db: getFirestore(app, FIRESTORE_DATABASE_ID), storage: getStorage(app) };
    if (emulatorsEnabled) {
      connectAuthEmulator(client.auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(client.db, '127.0.0.1', 8080);
      connectStorageEmulator(client.storage, '127.0.0.1', 9199);
    }
    cache.__firebaseClient = client;
  }
  return cache.__firebaseClient;
}
