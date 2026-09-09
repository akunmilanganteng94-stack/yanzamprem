import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyApNJVKdysPl5TT0PJYVmmXN-3CUvPaT-g",
  authDomain: "ampremyanz-652ad.firebaseapp.com",
  projectId: "ampremyanz-652ad",
  storageBucket: "ampremyanz-652ad.firebasestorage.app",
  messagingSenderId: "611421453306",
  appId: "1:611421453306:web:5f51de21b745e32f700243",
  measurementId: "G-ZW4JB4C56D"
};

// Initialize Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initial admin email list from environment metadata
export const BOOTSTRAP_ADMIN_EMAILS = [
  'apriliazril67@gmail.com',
  'apriliansyahazril10@gmail.com',
  'admin@yanzstr.com'
];

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.warn(`[Firestore Permission/Access] ${operationType} on ${path || 'unknown'}:`, errInfo.error);
  return errInfo;
}

export const RECOMMENDED_FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email in [
          'apriliazril67@gmail.com',
          'apriliansyahazril10@gmail.com',
          'admin@yanzstr.com'
        ] ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
    }

    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /stock/{stockId} {
      allow read: if true;
      allow create, delete: if isAdmin();
      allow update: if isAdmin() || (isSignedIn() && request.resource.data.status == 'SOLD');
    }

    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow list: if isAdmin();
    }

    match /deposits/{depositId} {
      allow read: if (isSignedIn() && resource.data.userId == request.auth.uid) || isAdmin();
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAdmin();
      allow list: if isSignedIn();
    }

    match /orders/{orderId} {
      allow read: if (isSignedIn() && resource.data.userId == request.auth.uid) || isAdmin();
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAdmin();
      allow list: if isSignedIn();
    }

    match /transactions/{transactionId} {
      allow read: if (isSignedIn() && resource.data.userId == request.auth.uid) || isAdmin();
      allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || isAdmin());
      allow update, delete: if isAdmin();
      allow list: if isSignedIn();
    }

    match /auditLogs/{logId} {
      allow read, write: if isAdmin();
    }
  }
}`;
