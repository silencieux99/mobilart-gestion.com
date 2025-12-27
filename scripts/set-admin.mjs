import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccountPath = 'mobilart-gestion-firebase-adminsdk-fbsvc-91c5b856e2.json';
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const auth = admin.auth();

async function setAdmin(email) {
    try {
        let userRecord;
        try {
            // 1. Try to find user in Auth
            userRecord = await auth.getUserByEmail(email);
            console.log(`Utilisateur trouvé dans Auth: ${userRecord.uid}`);
        } catch (authError) {
            if (authError.code === 'auth/user-not-found') {
                console.log('L\'utilisateur n\'existe pas dans Auth. Création en cours...');
                userRecord = await auth.createUser({
                    email: email,
                    emailVerified: true,
                    password: 'TemporaryPassword123!', // User should change this
                    displayName: 'Admin Mobilart'
                });
                console.log(`Utilisateur créé avec UID: ${userRecord.uid}`);
            } else {
                throw authError;
            }
        }

        // 2. Set custom claims
        await auth.setCustomUserClaims(userRecord.uid, { role: 'super_admin' });
        console.log('Custom claims définis sur super_admin');

        // 3. Update or Create Firestore document
        const userRef = db.collection('users').doc(userRecord.uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            await userRef.update({
                role: 'super_admin',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('Document Firestore mis à jour sur super_admin');
        } else {
            console.log('Création du document Firestore...');
            await userRef.set({
                id: userRecord.uid,
                email: email,
                firstName: 'Admin',
                lastName: 'Mobilart',
                role: 'super_admin',
                isActive: true,
                emailVerified: true,
                notificationPreferences: {
                    email: true,
                    sms: false,
                    push: true
                },
                newsletterSubscribed: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('Document Firestore créé avec succès');
        }

        console.log(`\nSUCCÈS: ${email} est maintenant Super Admin.`);
        console.log(`Note: Si le compte a été créé par ce script, le mot de passe temporaire est: TemporaryPassword123!`);
    } catch (error) {
        console.error('ERREUR:', error.message);
    } finally {
        process.exit();
    }
}

const targetEmail = 'contact@mobilart-gestion.com';
setAdmin(targetEmail);
