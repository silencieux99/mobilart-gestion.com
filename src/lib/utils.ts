import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistance, formatRelative, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Combine les classes Tailwind de manière sûre
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formater une date en français
 */
export function formatDate(date: Date | string | number, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (!isValid(dateObj)) {
    return 'Date invalide';
  }

  return format(dateObj, formatStr, { locale: fr });
}

/**
 * Formater une date relative (il y a X temps)
 */
export function formatRelativeDate(date: Date | string | number | any): string {
  let dateObj: Date;

  // Handle Firebase Timestamp
  if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    return 'Date invalide';
  }

  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: fr });
}

/**
 * Formater un montant en DZD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formater un pourcentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formater la taille d'un fichier
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Générer un ID unique
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
}

/**
 * Tronquer un texte
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Capitaliser la première lettre
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Obtenir les initiales d'un nom
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Valider une adresse email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valider un numéro de téléphone algérien
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+213|0)(5|6|7)[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Formater un numéro de téléphone
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('213')) {
    return `+213 ${cleaned.slice(3, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
  }

  if (cleaned.startsWith('0')) {
    return `0${cleaned.slice(1, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }

  return phone;
}

/**
 * Obtenir la couleur du statut
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    nouveau: 'bg-blue-100 text-blue-800',
    en_cours: 'bg-yellow-100 text-yellow-800',
    en_attente: 'bg-orange-100 text-orange-800',
    resolu: 'bg-green-100 text-green-800',
    ferme: 'bg-gray-100 text-gray-800',
    annule: 'bg-red-100 text-red-800',
    urgent: 'bg-red-100 text-red-800',
    haute: 'bg-orange-100 text-orange-800',
    moyenne: 'bg-yellow-100 text-yellow-800',
    basse: 'bg-green-100 text-green-800',
    payee: 'bg-green-100 text-green-800',
    en_retard: 'bg-red-100 text-red-800',
    envoyee: 'bg-blue-100 text-blue-800',
  };

  return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

/**
 * Obtenir l'icône du statut
 */
export function getStatusIcon(status: string): string {
  const statusIcons: Record<string, string> = {
    nouveau: '🆕',
    en_cours: '⏳',
    en_attente: '⏸️',
    resolu: '✅',
    ferme: '🔒',
    annule: '❌',
    urgent: '🚨',
    haute: '⚠️',
    moyenne: '📌',
    basse: '📍',
  };

  return statusIcons[status.toLowerCase()] || '📋';
}

/**
 * Débounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sleep/Delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Vérifier si on est en développement
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Vérifier si on est en production
 */
export const isProduction = process.env.NODE_ENV === 'production';
