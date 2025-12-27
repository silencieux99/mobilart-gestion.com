# 🏢 Mobilart Gestion - Plateforme de Gestion de Copropriété

## 📋 Vue d'ensemble

**Mobilart Gestion** est une plateforme SaaS moderne de gestion de copropriété pour la résidence Mobilart à Oran, Algérie. La résidence comprend 4 tours de 30 étages chacune.

## 🎯 Fonctionnalités principales

### Pour les Résidents
- **Dashboard personnel** avec vue d'ensemble des incidents, factures et annonces
- **Gestion des incidents** : déclaration, suivi en temps réel avec photos
- **Espace factures** : consultation, téléchargement, historique des paiements
- **Centre de documents** : règlement, PV d'AG, planning maintenance
- **Réservation d'espaces** : salle polyvalente, parking visiteurs
- **Messagerie** : notifications et communication avec le syndic

### Pour l'Administration
- **Gestion complète des résidents** et appartements
- **Suivi des incidents** avec assignation aux techniciens
- **Gestion financière** : factures, charges, impayés
- **Communication** : annonces, newsletter segmentée
- **Statistiques** : tableaux de bord avec KPIs
- **Gestion documentaire** centralisée

## 🛠️ Stack Technique

### Frontend
- **Next.js 14** avec App Router
- **TypeScript** pour la sécurité du typage
- **Tailwind CSS** pour le styling
- **Radix UI** pour les composants accessibles
- **React Query** pour la gestion du cache
- **React Hook Form + Zod** pour les formulaires
- **Recharts** pour les graphiques
- **Framer Motion** pour les animations

### Backend
- **Firebase Auth** : authentification sécurisée
- **Firestore** : base de données NoSQL temps réel
- **Firebase Storage** : stockage des documents et images
- **Cloud Functions** : logique métier serverless
- **Firebase Admin SDK** : opérations côté serveur

## 🎨 Design System

### Palette de couleurs
- **Primaire** : Turquoise méditerranéen (#06B6D4)
- **Secondaire** : Bleu nuit profond (#0F172A)
- **Neutre** : Sable clair (#F5F5F4)
- **Succès** : Vert émeraude (#10B981)
- **Avertissement** : Ambre (#F59E0B)
- **Erreur** : Rouge corail (#EF4444)

### Typographie
- **Titres** : Manrope (font-display)
- **Corps** : Inter (font-sans)

## 🔐 Rôles et Permissions

### 1. SuperAdmin Plateforme
- Configuration globale de la résidence
- Gestion des administrateurs
- Accès complet à tous les modules
- Paramètres de sécurité

### 2. Syndic/Gestionnaire
- Gestion des habitants
- Gestion financière (factures, charges)
- Publication d'annonces
- Validation des incidents
- Statistiques globales
- Newsletter

### 3. Gardien/Concierge
- Gestion des incidents assignés
- Mise à jour des statuts
- Ajout de commentaires et photos
- Création de tickets pour résidents

### 4. Technicien/Prestataire
- Vue des tickets assignés
- Mise à jour des interventions
- Ajout de preuves de résolution

### 5. Résident
- Dashboard personnel
- Déclaration d'incidents
- Consultation des factures
- Téléchargement de documents
- Lecture des annonces
- Gestion du profil

### 6. Comptabilité (optionnel)
- Accès lecture/écriture aux données financières
- Export CSV/PDF
- Pas d'accès aux données personnelles

## 📁 Architecture du Projet

```
mobilart-gestion.com/
├── src/
│   ├── app/                      # Routes Next.js (App Router)
│   │   ├── (auth)/               # Routes d'authentification
│   │   ├── (dashboard)/          # Routes du dashboard
│   │   ├── (public)/             # Routes publiques
│   │   └── api/                  # API Routes
│   ├── components/               # Composants React
│   │   ├── ui/                   # Composants UI de base
│   │   ├── forms/                # Composants de formulaires
│   │   ├── charts/               # Composants de graphiques
│   │   └── layout/               # Composants de layout
│   ├── lib/                      # Utilitaires et configuration
│   │   ├── firebase/             # Configuration Firebase
│   │   ├── hooks/                # React Hooks personnalisés
│   │   ├── utils/                # Fonctions utilitaires
│   │   └── validators/           # Schémas de validation Zod
│   ├── services/                 # Services métier
│   ├── stores/                   # État global (Zustand/Context)
│   ├── styles/                   # Styles globaux
│   └── types/                    # Types TypeScript
├── public/                       # Assets statiques
├── firebase/                     # Configuration Firebase
│   ├── functions/               # Cloud Functions
│   ├── firestore.rules         # Règles de sécurité
│   └── storage.rules           # Règles de stockage
└── docs/                        # Documentation
```

## 🗄️ Structure de la Base de Données

### Collections principales

#### `residences`
- Informations générales de la résidence
- Configuration globale
- Métadonnées

#### `users`
- Profils utilisateurs
- Informations de contact
- Préférences

#### `apartments`
- Tours (A, B, C, D)
- Étages (1-30)
- Numéros d'appartements
- Occupants

#### `incidents`
- Tickets de support
- Statuts et priorités
- Historique des actions
- Pièces jointes

#### `invoices`
- Factures et charges
- Statuts de paiement
- Historique

#### `announcements`
- Annonces publiques
- Segmentation par tour/étage
- Dates de publication

#### `documents`
- Documents officiels
- Catégorisation
- Permissions d'accès

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+ et npm/yarn
- Compte Firebase avec projet configuré
- Variables d'environnement configurées

### Installation

```bash
# Cloner le repository
git clone https://github.com/votre-org/mobilart-gestion.git

# Installer les dépendances
cd mobilart-gestion.com
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Firebase

# Lancer en développement
npm run dev

# Build pour production
npm run build
npm start
```

### Configuration Firebase

1. Créer un projet Firebase
2. Activer Authentication, Firestore, Storage
3. Copier les clés de configuration dans `.env.local`
4. Déployer les règles de sécurité
5. Déployer les Cloud Functions

## 📊 Métriques et KPIs

### Pour le Syndic
- Taux de résolution des incidents
- Temps moyen de résolution
- Taux de recouvrement des charges
- Satisfaction des résidents

### Pour les Résidents
- Nombre d'incidents ouverts
- Statut des factures
- Prochaines échéances

## 🔒 Sécurité

- Authentification Firebase avec MFA optionnel
- Règles Firestore granulaires par rôle
- Chiffrement des données sensibles
- Audit log des actions critiques
- Protection CSRF et XSS
- Rate limiting sur les API

## 📱 Responsive Design

- **Desktop** : Interface complète avec sidebar
- **Tablet** : Layout adaptatif avec menu collapsible
- **Mobile** : Navigation bottom tab, gestes tactiles

## 🌐 Internationalisation

Structure prête pour le multilingue :
- Français par défaut
- Architecture i18n préparée
- Formats de dates et devises localisés

## 📧 Notifications

### Types
- **Email** : via SendGrid/Firebase
- **In-app** : notifications temps réel
- **SMS** : optionnel via Twilio

### Déclencheurs
- Nouvel incident créé/résolu
- Nouvelle facture disponible
- Annonce importante
- Rappel de paiement

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📝 Documentation API

Documentation Swagger disponible à `/api-docs` en développement.

## 🤝 Contribution

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines.

## 📄 Licence

Propriétaire - © 2024 Mobilart Gestion

## 👥 Équipe

- **Product Owner** : [Nom]
- **Tech Lead** : [Nom]
- **Développeurs** : [Équipe]
- **UX/UI Designer** : [Nom]

## 📞 Support

- Email : support@mobilart-gestion.com
- Documentation : [docs.mobilart-gestion.com](https://docs.mobilart-gestion.com)
- Status : [status.mobilart-gestion.com](https://status.mobilart-gestion.com)
