import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// You should put your service account key in a .env file or similar secure storage
// For this environment, we might need to rely on standard method or mock if credentials aren't available.
// However, assuming user has a way to provide SERVICE_ACCOUNT or we use default creds if on GCP.
// For Vercel/Local with specific key:
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

// If we don't have service account, we can't fully run admin auth in local dev without it.
// We will try to initialize.

let adminApp: App | null = null;
let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;

export function getAdminApp(): App | null {
    // Skip initialization during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return null;
    }

    if (!adminApp && !getApps().length && serviceAccount) {
        adminApp = initializeApp({
            credential: cert(serviceAccount)
        });
    } else if (!adminApp && getApps().length) {
        adminApp = getApps()[0];
    }
    return adminApp;
}

export function getAdminAuth(): Auth | null {
    if (!adminAuthInstance) {
        const app = getAdminApp();
        if (app) {
            adminAuthInstance = getAuth(app);
        }
    }
    return adminAuthInstance;
}

export function getAdminDb(): Firestore | null {
    if (!adminDbInstance) {
        const app = getAdminApp();
        if (app) {
            adminDbInstance = getFirestore(app);
        }
    }
    return adminDbInstance;
}

// Legacy exports for backward compatibility
export const adminAuth = getAdminAuth();
export const adminDb = getAdminDb();
