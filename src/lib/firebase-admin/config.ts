import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// You should put your service account key in a .env file or similar secure storage
// For this environment, we might need to rely on standard method or mock if credentials aren't available.
// However, assuming user has a way to provide SERVICE_ACCOUNT or we use default creds if on GCP.
// For Vercel/Local with specific key:
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

// If we don't have service account, we can't fully run admin auth in local dev without it.
// We will try to initialize.

export function getAdminApp() {
    if (!getApps().length) {
        initializeApp({
            credential: serviceAccount ? cert(serviceAccount) : undefined
        });
    }
    return getApps()[0];
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb = getFirestore(getAdminApp());
