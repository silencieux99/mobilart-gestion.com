// ============================================
// Types principaux pour Mobilart Gestion
// ============================================

import { Timestamp } from 'firebase/firestore';

// ============================================
// Énumérations
// ============================================

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SYNDIC = 'syndic',
  GARDIEN = 'gardien',
  TECHNICIEN = 'technicien',
  RESIDENT = 'resident',
  COMPTABLE = 'comptable',
}

export enum IncidentStatus {
  NOUVEAU = 'nouveau',
  EN_COURS = 'en_cours',
  EN_ATTENTE = 'en_attente',
  RESOLU = 'resolu',
  FERME = 'ferme',
  ANNULE = 'annule',
}

export enum IncidentPriority {
  URGENTE = 'urgente',
  HAUTE = 'haute',
  MOYENNE = 'moyenne',
  BASSE = 'basse',
}

export enum IncidentCategory {
  PLOMBERIE = 'plomberie',
  ELECTRICITE = 'electricite',
  ASCENSEUR = 'ascenseur',
  SECURITE = 'securite',
  NETTOYAGE = 'nettoyage',
  ESPACES_VERTS = 'espaces_verts',
  PARKING = 'parking',
  AUTRE = 'autre',
}

export enum InvoiceStatus {
  BROUILLON = 'brouillon',
  ENVOYEE = 'envoyee',
  PAYEE = 'payee',
  EN_RETARD = 'en_retard',
  ANNULEE = 'annulee',
}

export enum InvoiceType {
  CHARGES_MENSUELLES = 'charges_mensuelles',
  CHARGES_EXCEPTIONNELLES = 'charges_exceptionnelles',
  TRAVAUX = 'travaux',
  PENALITE = 'penalite',
  AUTRE = 'autre',
}

export enum DocumentCategory {
  REGLEMENT = 'reglement',
  PV_AG = 'pv_ag',
  CONTRAT = 'contrat',
  PLAN = 'plan',
  FACTURE = 'facture',
  ATTESTATION = 'attestation',
  AUTRE = 'autre',
}

export enum ReservationStatus {
  EN_ATTENTE = 'en_attente',
  CONFIRMEE = 'confirmee',
  ANNULEE = 'annulee',
  TERMINEE = 'terminee',
}

export enum NotificationType {
  INCIDENT = 'incident',
  FACTURE = 'facture',
  ANNONCE = 'annonce',
  RESERVATION = 'reservation',
  SYSTEME = 'systeme',
}

export enum Tower {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

// ============================================
// Interfaces principales
// ============================================

export interface Residence {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  towers: Tower[];
  floorsPerTower: number;
  apartmentsPerFloor: number;
  totalApartments: number;
  amenities: string[];
  contactEmail: string;
  contactPhone: string;
  logo?: string;
  coverImage?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  apartments: string[]; // IDs des appartements
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  newsletterSubscribed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

export interface Apartment {
  id: string;
  residenceId: string;
  tower: Tower;
  floor: number;
  number: string; // Ex: "A-15-03"
  surface: number; // en m²
  rooms: number;
  bathrooms: number;
  balconies: number;
  parkingSpots: number;
  ownerIds: string[]; // IDs des propriétaires
  residentIds: string[]; // IDs des résidents actuels
  isOccupied: boolean;
  occupancyType: 'owner' | 'tenant' | 'vacant';
  monthlyCharges: number;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Incident {
  id: string;
  residenceId: string;
  reporterId: string; // User ID
  reporterName: string;
  apartmentId?: string;
  tower?: Tower;
  floor?: number;
  location: string; // Description de la localisation
  category: IncidentCategory;
  priority: IncidentPriority;
  status: IncidentStatus;
  title: string;
  description: string;
  images: string[]; // URLs des images
  assignedToId?: string; // ID du technicien/gardien
  assignedToName?: string;
  comments: IncidentComment[];
  resolution?: string;
  resolvedAt?: Timestamp;
  estimatedResolutionDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface IncidentComment {
  id: string;
  incidentId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  images?: string[];
  isInternal: boolean; // Visible uniquement par l'admin
  createdAt: Timestamp;
}

export interface Invoice {
  id: string;
  residenceId: string;
  apartmentId: string;
  userId: string; // ID du résident/propriétaire
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  dueDate: Timestamp;
  paidAt?: Timestamp;
  paymentMethod?: string;
  description: string;
  items: InvoiceItem[];
  documentUrl?: string;
  remindersSent: number;
  lastReminderAt?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Announcement {
  id: string;
  residenceId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: 'general' | 'maintenance' | 'security' | 'event' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: {
    allResidents: boolean;
    towers?: Tower[];
    floors?: number[];
    apartmentIds?: string[];
  };
  images?: string[];
  attachments?: string[];
  isPublished: boolean;
  publishedAt?: Timestamp;
  expiresAt?: Timestamp;
  viewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Document {
  id: string;
  residenceId: string;
  uploadedById: string;
  uploadedByName: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  fileUrl: string;
  fileName: string;
  fileSize: number; // en bytes
  mimeType: string;
  isPublic: boolean;
  accessRoles: UserRole[];
  tags: string[];
  downloadCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Reservation {
  id: string;
  residenceId: string;
  userId: string;
  userName: string;
  apartmentId: string;
  spaceId: string; // ID de l'espace commun
  spaceName: string;
  date: Timestamp;
  startTime: string; // Format: "14:00"
  endTime: string; // Format: "18:00"
  status: ReservationStatus;
  purpose: string;
  numberOfGuests?: number;
  specialRequests?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: Timestamp;
  cancellationReason?: string;
  cancelledAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CommonSpace {
  id: string;
  residenceId: string;
  name: string;
  description: string;
  capacity: number;
  location: string;
  amenities: string[];
  rules: string[];
  pricePerHour?: number;
  images: string[];
  isAvailable: boolean;
  requiresApproval: boolean;
  minReservationHours: number;
  maxReservationHours: number;
  advanceBookingDays: number; // Combien de jours à l'avance
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Timestamp;
  createdAt: Timestamp;
}

export interface NewsletterSubscription {
  id: string;
  userId: string;
  email: string;
  isActive: boolean;
  categories: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  lastSentAt?: Timestamp;
  subscribedAt: Timestamp;
  unsubscribedAt?: Timestamp;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Timestamp;
}

export interface Settings {
  id: string;
  residenceId: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  emailSettings: {
    provider: string;
    fromEmail: string;
    fromName: string;
  };
  smsSettings: {
    enabled: boolean;
    provider?: string;
  };
  paymentSettings: {
    currency: string;
    vatRate: number;
    lateFeePercentage: number;
    reminderDays: number[];
  };
  notificationSettings: {
    autoNotifyIncidents: boolean;
    autoNotifyInvoices: boolean;
    autoNotifyAnnouncements: boolean;
  };
  brandingSettings: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    favicon?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// Types utilitaires
// ============================================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface DashboardStats {
  totalResidents: number;
  totalApartments: number;
  occupancyRate: number;
  openIncidents: number;
  resolvedIncidentsThisMonth: number;
  averageResolutionTime: number; // en heures
  unpaidInvoices: number;
  totalUnpaidAmount: number;
  collectionRate: number;
  upcomingReservations: number;
  activeAnnouncements: number;
  newsletterSubscribers: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}
