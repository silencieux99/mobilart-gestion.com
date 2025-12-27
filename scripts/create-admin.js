// Script pour créer un compte administrateur
// Usage: node scripts/create-admin.js

const admin = require('firebase-admin');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('\n🔧 Création d\'un compte administrateur\n');

    const email = await question('Email admin: ');
    const password = await question('Mot de passe (min 6 caractères): ');
    const firstName = await question('Prénom: ');
    const lastName = await question('Nom: ');

    console.log('\n⏳ Création du compte...\n');

    // Initialiser Firebase Admin
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : require('../mobilart-gestion-firebase-adminsdk-fbsvc-91c5b856e2.json');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    const auth = admin.auth();
    const db = admin.firestore();

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: `${firstName} ${lastName}`,
      emailVerified: true,
      disabled: false
    });

    console.log(`✅ Utilisateur créé dans Auth: ${userRecord.uid}`);

    // Créer le document dans Firestore
    await db.collection('users').doc(userRecord.uid).set({
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: 'admin',
      isActive: true,
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      notificationPreferences: {
        email: true,
        sms: false,
        push: true
      }
    });

    console.log('✅ Document créé dans Firestore');
    console.log('\n🎉 Compte administrateur créé avec succès!\n');
    console.log(`Email: ${email}`);
    console.log(`Rôle: admin\n`);

    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
