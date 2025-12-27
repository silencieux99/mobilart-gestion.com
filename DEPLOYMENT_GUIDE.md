# 🚀 Guide de Déploiement - Mobilart Gestion

## 📋 Prérequis

### Comptes et Services Requis
- ✅ Compte Google (pour Firebase)
- ✅ Compte Vercel (pour le déploiement Next.js) ou serveur Node.js
- ✅ Compte SendGrid (pour les emails) - optionnel
- ✅ Nom de domaine (mobilart-gestion.com)

### Outils Locaux
- ✅ Node.js 18+ et npm/yarn
- ✅ Firebase CLI (`npm install -g firebase-tools`)
- ✅ Git
- ✅ Éditeur de code (VS Code recommandé)

## 🔧 Configuration Firebase

### 1. Créer un Projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Cliquer sur "Créer un projet"
3. Nom du projet : `mobilart-gestion`
4. Activer Google Analytics (optionnel)

### 2. Activer les Services

#### Authentication
1. Dans Firebase Console → Authentication
2. Cliquer "Commencer"
3. Activer "Email/Mot de passe"
4. (Optionnel) Activer "Numéro de téléphone" pour OTP

#### Firestore Database
1. Dans Firebase Console → Firestore Database
2. Cliquer "Créer une base de données"
3. Choisir le mode "Production"
4. Sélectionner la région `europe-west3` (Frankfurt)
5. Cliquer "Activer"

#### Storage
1. Dans Firebase Console → Storage
2. Cliquer "Commencer"
3. Accepter les règles par défaut (on les modifiera après)
4. Sélectionner la même région `europe-west3`

### 3. Obtenir les Clés de Configuration

1. Dans Firebase Console → Paramètres du projet → Général
2. Faire défiler jusqu'à "Vos applications"
3. Cliquer sur l'icône Web `</>`
4. Nom de l'app : `Mobilart Web`
5. Cocher "Configurer Firebase Hosting"
6. Enregistrer l'application
7. Copier la configuration Firebase

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};
```

### 4. Générer la Clé Privée Admin SDK

1. Paramètres du projet → Comptes de service
2. Cliquer "Générer une nouvelle clé privée"
3. Télécharger le fichier JSON
4. Extraire les valeurs pour `.env.local`

## 📦 Installation Locale

### 1. Cloner le Projet

```bash
# Si vous avez un repository Git
git clone https://github.com/votre-org/mobilart-gestion.git
cd mobilart-gestion.com

# Ou utiliser les fichiers fournis
cd mobilart-gestion.com
```

### 2. Installer les Dépendances

```bash
# Installer les dépendances du projet principal
npm install

# Installer les dépendances des Cloud Functions
cd firebase/functions
npm install
cd ../..
```

### 3. Configurer l'Environnement

```bash
# Copier le fichier d'environnement
cp .env.example .env.local

# Éditer .env.local avec vos vraies clés Firebase
# Utiliser les valeurs obtenues précédemment
```

### 4. Initialiser Firebase

```bash
# Se connecter à Firebase
firebase login

# Initialiser le projet
firebase init

# Sélectionner :
# - Firestore
# - Functions
# - Storage
# - Hosting (optionnel)
# Choisir le projet créé précédemment
```

## 🔐 Déployer les Règles de Sécurité

### 1. Règles Firestore

```bash
# Déployer les règles Firestore
firebase deploy --only firestore:rules
```

### 2. Règles Storage

Créer le fichier `firebase/storage.rules` :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images des incidents
    match /incidents/{incidentId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    
    // Documents officiels
    match /documents/{documentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.auth.token.role in ['super_admin', 'syndic'];
    }
    
    // Avatars utilisateurs
    match /avatars/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

Déployer :

```bash
firebase deploy --only storage:rules
```

## ☁️ Déployer les Cloud Functions

```bash
cd firebase/functions

# Compiler TypeScript
npm run build

# Déployer
npm run deploy

# Ou déployer une fonction spécifique
firebase deploy --only functions:onIncidentCreated
```

## 🌐 Déploiement de l'Application Next.js

### Option 1 : Vercel (Recommandé)

1. Créer un compte sur [Vercel](https://vercel.com)
2. Installer Vercel CLI : `npm i -g vercel`
3. Déployer :

```bash
# À la racine du projet
vercel

# Suivre les instructions :
# - Link to existing project? No
# - What's your project's name? mobilart-gestion
# - In which directory is your code located? ./
# - Override settings? No
```

4. Configurer les variables d'environnement dans Vercel Dashboard
5. Ajouter le domaine personnalisé

### Option 2 : Firebase Hosting

```bash
# Build l'application
npm run build

# Exporter en statique (si possible)
npm run export

# Déployer
firebase deploy --only hosting
```

### Option 3 : Serveur VPS

```bash
# Sur votre serveur
# Installer Node.js 18+, npm, PM2

# Cloner le projet
git clone https://github.com/votre-org/mobilart-gestion.git
cd mobilart-gestion

# Installer les dépendances
npm install

# Build
npm run build

# Démarrer avec PM2
pm2 start npm --name "mobilart" -- start
pm2 save
pm2 startup
```

## 🗂️ Initialisation des Données

### 1. Créer le Super Admin Initial

```javascript
// Script à exécuter une fois dans la console Firebase ou via un script Node.js
const admin = require('firebase-admin');
admin.initializeApp();

async function createSuperAdmin() {
  // Créer l'utilisateur dans Auth
  const userRecord = await admin.auth().createUser({
    email: 'admin@mobilart-gestion.com',
    password: 'ChangezMoiImmediatement123!',
    displayName: 'Super Admin',
  });

  // Créer le profil dans Firestore
  await admin.firestore().collection('users').doc(userRecord.uid).set({
    email: 'admin@mobilart-gestion.com',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    apartments: [],
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log('Super Admin créé avec succès!');
  console.log('Email: admin@mobilart-gestion.com');
  console.log('Mot de passe: ChangezMoiImmediatement123!');
  console.log('⚠️  IMPORTANT: Changez ce mot de passe immédiatement!');
}

createSuperAdmin();
```

### 2. Initialiser la Résidence

```javascript
// Créer la résidence dans Firestore
await admin.firestore().collection('residences').doc('mobilart-oran').set({
  name: 'Résidence Mobilart',
  address: 'Boulevard Front de Mer',
  city: 'Oran',
  country: 'Algérie',
  postalCode: '31000',
  towers: ['A', 'B', 'C', 'D'],
  floorsPerTower: 30,
  apartmentsPerFloor: 8,
  totalApartments: 960,
  amenities: [
    'Piscine',
    'Salle de sport',
    'Salle polyvalente',
    'Parking souterrain',
    'Espaces verts',
    'Aire de jeux',
    'Sécurité 24/7'
  ],
  contactEmail: 'contact@mobilart-gestion.com',
  contactPhone: '+213 41 XX XX XX',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
});
```

### 3. Générer les Appartements

```javascript
// Script pour générer tous les appartements
const towers = ['A', 'B', 'C', 'D'];
const floorsPerTower = 30;
const apartmentsPerFloor = 8;

for (const tower of towers) {
  for (let floor = 1; floor <= floorsPerTower; floor++) {
    for (let apt = 1; apt <= apartmentsPerFloor; apt++) {
      const apartmentNumber = `${tower}-${floor.toString().padStart(2, '0')}-${apt.toString().padStart(2, '0')}`;
      
      await admin.firestore().collection('apartments').doc(`apt-${apartmentNumber.toLowerCase()}`).set({
        residenceId: 'mobilart-oran',
        tower: tower,
        floor: floor,
        number: apartmentNumber,
        surface: 100 + Math.floor(Math.random() * 50), // 100-150 m²
        rooms: 2 + Math.floor(Math.random() * 3), // 2-4 pièces
        bathrooms: 1 + Math.floor(Math.random() * 2), // 1-2 SDB
        balconies: Math.floor(Math.random() * 2), // 0-1 balcon
        parkingSpots: 1 + Math.floor(Math.random() * 2), // 1-2 places
        ownerIds: [],
        residentIds: [],
        isOccupied: false,
        occupancyType: 'vacant',
        monthlyCharges: 15000 + (floor * 100), // Charges selon l'étage
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
}
```

## 🔍 Vérification du Déploiement

### Checklist de Validation

- [ ] L'application est accessible via l'URL
- [ ] La page de connexion fonctionne
- [ ] Le super admin peut se connecter
- [ ] Les règles Firestore sont actives
- [ ] Les Cloud Functions répondent
- [ ] Les uploads d'images fonctionnent
- [ ] Les emails sont envoyés (si configuré)
- [ ] Les notifications temps réel fonctionnent
- [ ] Le responsive mobile est OK
- [ ] Les performances sont acceptables

### Tests de Base

1. **Test de Connexion**
   - Se connecter avec le super admin
   - Vérifier l'accès au dashboard

2. **Test CRUD Incident**
   - Créer un incident test
   - Vérifier la notification
   - Modifier le statut
   - Supprimer l'incident

3. **Test de Performance**
   - Lighthouse score > 90
   - Time to Interactive < 3s
   - Bundle size < 200KB gzipped

## 📊 Monitoring

### Firebase Console
- Performance Monitoring
- Crashlytics
- Analytics
- Cloud Functions logs

### Outils Externes (Optionnel)
- Sentry pour error tracking
- LogRocket pour session replay
- Hotjar pour heatmaps
- Google Analytics pour métriques

## 🆘 Troubleshooting

### Erreurs Communes

#### "Permission Denied" dans Firestore
- Vérifier les règles de sécurité
- Vérifier l'authentification de l'utilisateur
- Vérifier le rôle de l'utilisateur

#### Cloud Functions timeout
- Augmenter le timeout dans les paramètres
- Optimiser le code
- Utiliser des fonctions asynchrones

#### Build Next.js échoue
- Vérifier les variables d'environnement
- Nettoyer le cache : `rm -rf .next node_modules`
- Réinstaller : `npm install`

## 📞 Support

Pour toute question sur le déploiement :
- Documentation Firebase : https://firebase.google.com/docs
- Documentation Next.js : https://nextjs.org/docs
- Documentation Vercel : https://vercel.com/docs

## ✅ Conclusion

Une fois toutes ces étapes complétées, votre instance de Mobilart Gestion sera opérationnelle et prête à accueillir les résidents de la copropriété !
