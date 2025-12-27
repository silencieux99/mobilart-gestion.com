# 🗺️ Architecture des Pages et Routes - Mobilart Gestion

## 📐 Structure des Routes (Next.js App Router)

```
src/app/
├── (public)/                    # Routes publiques (sans auth)
│   ├── page.tsx                # Landing page
│   ├── login/
│   │   └── page.tsx            # Page de connexion
│   ├── register/
│   │   └── page.tsx            # Inscription (si autorisé)
│   ├── forgot-password/
│   │   └── page.tsx            # Récupération mot de passe
│   ├── reset-password/
│   │   └── page.tsx            # Réinitialisation mot de passe
│   ├── contact/
│   │   └── page.tsx            # Formulaire de contact
│   └── layout.tsx              # Layout public
│
├── (auth)/                      # Routes protégées (avec auth)
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard principal (adapté par rôle)
│   │   └── layout.tsx          # Layout avec sidebar
│   │
│   ├── incidents/
│   │   ├── page.tsx            # Liste des incidents
│   │   ├── new/
│   │   │   └── page.tsx        # Créer un incident
│   │   ├── [id]/
│   │   │   ├── page.tsx        # Détail d'un incident
│   │   │   └── edit/
│   │   │       └── page.tsx    # Modifier un incident
│   │   └── layout.tsx
│   │
│   ├── factures/
│   │   ├── page.tsx            # Liste des factures
│   │   ├── [id]/
│   │   │   └── page.tsx        # Détail d'une facture
│   │   └── layout.tsx
│   │
│   ├── annonces/
│   │   ├── page.tsx            # Liste des annonces
│   │   ├── [id]/
│   │   │   └── page.tsx        # Détail d'une annonce
│   │   └── layout.tsx
│   │
│   ├── documents/
│   │   ├── page.tsx            # Centre de documents
│   │   ├── [category]/
│   │   │   └── page.tsx        # Documents par catégorie
│   │   └── layout.tsx
│   │
│   ├── reservations/
│   │   ├── page.tsx            # Mes réservations
│   │   ├── new/
│   │   │   └── page.tsx        # Nouvelle réservation
│   │   ├── [id]/
│   │   │   └── page.tsx        # Détail réservation
│   │   └── espaces/
│   │       └── page.tsx        # Liste des espaces
│   │
│   ├── profil/
│   │   ├── page.tsx            # Mon profil
│   │   ├── edit/
│   │   │   └── page.tsx        # Modifier profil
│   │   ├── notifications/
│   │   │   └── page.tsx        # Préférences notifications
│   │   └── securite/
│   │       └── page.tsx        # Sécurité compte
│   │
│   ├── (admin)/                # Routes admin uniquement
│   │   ├── residents/
│   │   │   ├── page.tsx        # Gestion résidents
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Ajouter résident
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx    # Détail résident
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │   └── import/
│   │   │       └── page.tsx    # Import CSV
│   │   │
│   │   ├── appartements/
│   │   │   ├── page.tsx        # Gestion appartements
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx    # Détail appartement
│   │   │   └── tours/
│   │   │       └── [tower]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── facturation/
│   │   │   ├── page.tsx        # Gestion facturation
│   │   │   ├── generer/
│   │   │   │   └── page.tsx    # Générer factures
│   │   │   ├── impayes/
│   │   │   │   └── page.tsx    # Gestion impayés
│   │   │   └── exports/
│   │   │       └── page.tsx    # Exports comptables
│   │   │
│   │   ├── communication/
│   │   │   ├── page.tsx        # Centre communication
│   │   │   ├── annonces/
│   │   │   │   ├── page.tsx    # Gestion annonces
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── newsletter/
│   │   │   │   ├── page.tsx    # Newsletter
│   │   │   │   └── composer/
│   │   │   │       └── page.tsx
│   │   │   └── sms/
│   │   │       └── page.tsx    # Campagnes SMS
│   │   │
│   │   ├── statistiques/
│   │   │   ├── page.tsx        # Tableau de bord stats
│   │   │   ├── incidents/
│   │   │   │   └── page.tsx    # Stats incidents
│   │   │   ├── financier/
│   │   │   │   └── page.tsx    # Stats financières
│   │   │   └── occupation/
│   │   │       └── page.tsx    # Stats occupation
│   │   │
│   │   ├── parametres/
│   │   │   ├── page.tsx        # Paramètres généraux
│   │   │   ├── residence/
│   │   │   │   └── page.tsx    # Config résidence
│   │   │   ├── roles/
│   │   │   │   └── page.tsx    # Gestion rôles
│   │   │   ├── emails/
│   │   │   │   └── page.tsx    # Templates emails
│   │   │   └── maintenance/
│   │   │       └── page.tsx    # Mode maintenance
│   │   │
│   │   └── audit/
│   │       └── page.tsx        # Logs d'audit
│   │
│   └── layout.tsx              # Layout authentifié
│
├── api/                         # API Routes
│   ├── auth/
│   │   ├── [...nextauth]/
│   │   │   └── route.ts        # NextAuth si utilisé
│   │   └── logout/
│   │       └── route.ts
│   │
│   ├── webhooks/
│   │   ├── stripe/
│   │   │   └── route.ts        # Webhook Stripe
│   │   └── sendgrid/
│   │       └── route.ts        # Webhook SendGrid
│   │
│   └── cron/
│       ├── reminders/
│       │   └── route.ts        # Rappels automatiques
│       └── statistics/
│           └── route.ts        # Calcul stats
│
├── layout.tsx                   # Layout racine
├── loading.tsx                  # Loading global
├── error.tsx                    # Error boundary
└── not-found.tsx               # 404 page
```

## 📄 Description Détaillée des Pages

### 🏠 Pages Publiques

#### `/` - Landing Page
**Contenu:**
- Hero section avec image de la résidence
- Présentation de Mobilart (4 tours, 30 étages)
- Fonctionnalités clés en cards
- Témoignages résidents
- CTA "Accéder à mon espace"
- Footer avec infos contact

**Composants:**
- `HeroSection`
- `FeaturesGrid`
- `TestimonialsCarousel`
- `CTASection`

#### `/login` - Connexion
**Contenu:**
- Logo Mobilart centré
- Formulaire email/mot de passe
- Option "Se souvenir de moi"
- Lien "Mot de passe oublié"
- Bouton connexion avec loading state
- Message d'erreur si échec

**Composants:**
- `LoginForm`
- `SocialLogin` (futur)

### 🔐 Pages Authentifiées

#### `/dashboard` - Tableau de Bord

**Version Résident:**
```
┌─────────────────────────────────────┐
│         Bonjour Jean Dupont         │
│      Appartement A-15-03             │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐ ┌──────────┐         │
│  │ Incidents│ │ Factures │         │
│  │    3     │ │    2     │         │
│  │ En cours │ │ En attente│         │
│  └──────────┘ └──────────┘         │
│                                     │
│  Dernières Annonces                │
│  ┌─────────────────────────────┐   │
│  │ 📢 Coupure d'eau Tour A     │   │
│  │ 📅 AG le 15/02/2024         │   │
│  └─────────────────────────────┘   │
│                                     │
│  Mes Incidents Récents             │
│  ┌─────────────────────────────┐   │
│  │ • Fuite salle de bain       │   │
│  │   Status: En cours           │   │
│  │ • Ascenseur en panne        │   │
│  │   Status: Résolu             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Version Admin/Syndic:**
```
┌─────────────────────────────────────┐
│      Dashboard Administrateur       │
├─────────────────────────────────────┤
│                                     │
│  Statistiques Globales              │
│  ┌────────┐ ┌────────┐ ┌────────┐ │
│  │Résidents│ │Incidents│ │Impayés │ │
│  │  2,450  │ │   23    │ │  48    │ │
│  └────────┘ └────────┘ └────────┘ │
│                                     │
│  Graphique Incidents (30 jours)    │
│  ┌─────────────────────────────┐   │
│  │     📊 [Graphique ligne]     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Actions Rapides                   │
│  [+ Nouvel Incident] [+ Annonce]   │
│                                     │
│  Incidents Prioritaires            │
│  ┌─────────────────────────────┐   │
│  │ 🔴 Ascenseur Tour B - Urgent │   │
│  │ 🟡 Fuite parking - Haute    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### `/incidents` - Gestion des Incidents

**Liste des incidents:**
```
┌─────────────────────────────────────┐
│         Gestion des Incidents       │
├─────────────────────────────────────┤
│                                     │
│ [+ Nouveau] [Filtres ▼] [Export]   │
│                                     │
│ Filtres actifs: Tour A, En cours   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ID      │ Titre      │ Status  │ │
│ ├─────────┼────────────┼─────────┤ │
│ │ INC-001 │ Fuite eau  │ 🟡 En.. │ │
│ │ INC-002 │ Ascenseur  │ ✅ Rés. │ │
│ │ INC-003 │ Éclairage  │ 🔴 Urg. │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [← Précédent] Page 1/5 [Suivant →] │
└─────────────────────────────────────┘
```

**Détail incident:**
```
┌─────────────────────────────────────┐
│     Incident #INC-2024-001          │
├─────────────────────────────────────┤
│                                     │
│ Fuite d'eau importante              │
│ 🔴 Priorité: Urgente                │
│ 📍 Tour A - Étage 15 - Apt 03       │
│                                     │
│ Description:                        │
│ ┌─────────────────────────────────┐ │
│ │ Fuite importante au niveau du   │ │
│ │ lavabo de la salle de bain...   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Photos:                             │
│ [📷 Image 1] [📷 Image 2]           │
│                                     │
│ Assigné à: Ahmed Technicien         │
│ Créé le: 15/01/2024 14:30          │
│                                     │
│ ─────── Historique ─────────        │
│                                     │
│ • 15/01 14:30 - Incident créé      │
│ • 15/01 15:00 - Assigné à Ahmed    │
│ • 15/01 16:30 - Intervention prévue│
│                                     │
│ [💬 Ajouter commentaire]            │
│ [📎 Joindre fichier]                │
│ [✅ Marquer résolu]                 │
└─────────────────────────────────────┘
```

#### `/factures` - Gestion des Factures

**Liste des factures (Résident):**
```
┌─────────────────────────────────────┐
│         Mes Factures                │
├─────────────────────────────────────┤
│                                     │
│ Solde à payer: 35,700 DZD          │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Période  │ Montant │ Status    │ │
│ ├──────────┼─────────┼───────────┤ │
│ │ Jan 2024 │ 17,850  │ ✅ Payée  │ │
│ │ Fév 2024 │ 17,850  │ ⏳ En att.│ │
│ │ Mar 2024 │ 17,850  │ ⏳ En att.│ │
│ └─────────────────────────────────┘ │
│                                     │
│ [💳 Payer en ligne] [📥 Télécharger]│
└─────────────────────────────────────┘
```

#### `/annonces` - Annonces

```
┌─────────────────────────────────────┐
│      Annonces de la Résidence       │
├─────────────────────────────────────┤
│                                     │
│ 🔴 Annonces Urgentes                │
│ ┌─────────────────────────────────┐ │
│ │ Coupure d'eau - Tour A & B      │ │
│ │ Demain de 9h à 12h              │ │
│ │ [Voir détails →]                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📢 Annonces Récentes                │
│ ┌─────────────────────────────────┐ │
│ │ • AG Extraordinaire - 15/02     │ │
│ │ • Travaux parking - Mars 2024   │ │
│ │ • Nouveau gardien Tour C        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 👥 Pages Administration

#### `/residents` - Gestion des Résidents

```
┌─────────────────────────────────────┐
│      Gestion des Résidents          │
├─────────────────────────────────────┤
│                                     │
│ [+ Nouveau] [⬆ Import CSV] [Export]│
│                                     │
│ 🔍 Recherche: [_______________] 🔎  │
│                                     │
│ Filtres: [Tour ▼] [Étage ▼] [Type ▼]│
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Nom      │ Apt    │ Contact    │ │
│ ├──────────┼────────┼────────────┤ │
│ │ Dupont J.│ A-15-03│ 0555...    │ │
│ │ Martin S.│ B-20-05│ 0556...    │ │
│ │ Ahmed K. │ C-10-12│ 0557...    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Total: 2,450 résidents              │
└─────────────────────────────────────┘
```

#### `/statistiques` - Tableau de Bord Statistiques

```
┌─────────────────────────────────────┐
│    Statistiques de la Résidence     │
├─────────────────────────────────────┤
│                                     │
│ Période: [Jan 2024 ▼] [Actualiser] │
│                                     │
│ ┌──────────────┬──────────────────┐ │
│ │ KPIs         │ Évolution        │ │
│ ├──────────────┼──────────────────┤ │
│ │ Occupation   │ 📊 Graphique     │ │
│ │ 95.8%        │    Donut         │ │
│ │ ↑ +2.3%      │                  │ │
│ ├──────────────┼──────────────────┤ │
│ │ Incidents    │ 📈 Graphique     │ │
│ │ 23 ouverts   │    Ligne         │ │
│ │ Moy: 48h     │                  │ │
│ ├──────────────┼──────────────────┤ │
│ │ Recouvrement │ 📊 Graphique     │ │
│ │ 95%          │    Barres        │ │
│ │ 720K DZD     │                  │ │
│ └──────────────┴──────────────────┘ │
│                                     │
│ [📥 Export PDF] [📊 Export Excel]   │
└─────────────────────────────────────┘
```

## 🎨 Composants Réutilisables

### Layout Components
- `AppShell` - Structure principale avec sidebar
- `Sidebar` - Navigation latérale adaptative
- `Header` - En-tête avec notifications
- `Footer` - Pied de page
- `MobileNav` - Navigation mobile (bottom tabs)

### Data Display
- `DataTable` - Tableau avec tri/filtre/pagination
- `StatCard` - Carte de statistique
- `IncidentCard` - Carte incident
- `InvoiceCard` - Carte facture
- `AnnouncementCard` - Carte annonce
- `ResidentCard` - Carte résident

### Forms
- `IncidentForm` - Formulaire incident
- `LoginForm` - Formulaire connexion
- `ProfileForm` - Formulaire profil
- `FilterForm` - Formulaire de filtres
- `SearchBar` - Barre de recherche

### Feedback
- `Toast` - Notifications toast
- `Alert` - Messages d'alerte
- `Modal` - Modales
- `Drawer` - Tiroirs latéraux
- `LoadingSpinner` - Indicateur de chargement
- `EmptyState` - État vide
- `ErrorBoundary` - Gestion d'erreurs

### Charts
- `LineChart` - Graphique en ligne
- `BarChart` - Graphique en barres
- `DonutChart` - Graphique donut
- `AreaChart` - Graphique en aires

## 🔄 Flux de Navigation

### Résident Type
```
Landing → Login → Dashboard Résident
                      ↓
            ┌─────────┴─────────┐
            ↓         ↓         ↓
        Incidents  Factures  Annonces
            ↓         ↓         ↓
        Détails   Paiement  Lecture
```

### Admin Type
```
Login → Dashboard Admin
            ↓
    ┌───────┴────────┐
    ↓                ↓
Résidents      Statistiques
    ↓                ↓
Gestion         Rapports
```

## 📱 Responsive Design

### Desktop (>1024px)
- Sidebar fixe à gauche (250px)
- Contenu principal centré (max 1200px)
- Header avec actions à droite

### Tablet (768-1024px)
- Sidebar collapsible
- Contenu adaptatif
- Navigation simplifiée

### Mobile (<768px)
- Bottom navigation
- Contenu pleine largeur
- Modales fullscreen
- Swipe gestures pour actions

## 🔐 Protection des Routes

### Middleware d'Authentification
```typescript
// Toutes les routes sous /(auth) nécessitent une connexion
// Routes sous /(auth)/(admin) nécessitent role admin
// Redirection automatique selon le rôle après login
```

### Règles d'Accès par Rôle
- **Public**: Landing, Login, Contact
- **Resident**: Dashboard, Incidents (ses), Factures (ses)
- **Gardien**: Incidents (assignés), pas de factures
- **Syndic/Admin**: Accès complet
- **SuperAdmin**: Accès total + audit

## ⚡ Optimisations

### Performance
- Code splitting par route
- Lazy loading des composants lourds
- Images optimisées avec next/image
- Prefetch des routes probables
- Service Worker pour offline

### SEO
- Metadata dynamique par page
- Sitemap.xml généré
- Robots.txt configuré
- Open Graph tags
- Schema.org markup

### Accessibilité
- Navigation au clavier
- ARIA labels
- Contrast ratio AAA
- Focus indicators
- Screen reader compatible
