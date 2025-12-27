import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// ============================================
// Triggers pour les Incidents
// ============================================

/**
 * Déclenché lors de la création d'un incident
 * - Envoie une notification aux admins
 * - Crée une entrée dans l'audit log
 */
export const onIncidentCreated = functions
  .region('europe-west1')
  .firestore
  .document('incidents/{incidentId}')
  .onCreate(async (snapshot, context) => {
    const incident = snapshot.data();
    const incidentId = context.params.incidentId;

    try {
      // 1. Notifier les admins et gardiens
      const adminsQuery = await db
        .collection('users')
        .where('role', 'in', ['super_admin', 'syndic', 'gardien'])
        .get();

      const notifications = adminsQuery.docs.map(doc => ({
        userId: doc.id,
        type: 'incident',
        title: 'Nouvel incident déclaré',
        message: `${incident.reporterName} a déclaré un incident: ${incident.title}`,
        data: {
          incidentId,
          priority: incident.priority,
          category: incident.category,
        },
        isRead: false,
        createdAt: Timestamp.now(),
      }));

      // Batch write notifications
      const batch = db.batch();
      notifications.forEach(notif => {
        const notifRef = db.collection('notifications').doc();
        batch.set(notifRef, notif);
      });
      await batch.commit();

      // 2. Créer un log d'audit
      await db.collection('auditLogs').add({
        userId: incident.reporterId,
        userName: incident.reporterName,
        userRole: 'resident',
        action: 'CREATE_INCIDENT',
        entity: 'incidents',
        entityId: incidentId,
        changes: { incident },
        createdAt: Timestamp.now(),
      });

      // 3. Envoyer un email au résident (confirmation)
      // TODO: Implémenter l'envoi d'email via SendGrid

      console.log(`Incident ${incidentId} créé avec succès`);
    } catch (error) {
      console.error('Erreur lors du traitement de l\'incident:', error);
    }
  });

/**
 * Déclenché lors de la mise à jour d'un incident
 * - Notifie le résident du changement de statut
 */
export const onIncidentUpdated = functions
  .region('europe-west1')
  .firestore
  .document('incidents/{incidentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const incidentId = context.params.incidentId;

    // Vérifier si le statut a changé
    if (before.status !== after.status) {
      try {
        // Notifier le résident
        await db.collection('notifications').add({
          userId: after.reporterId,
          type: 'incident',
          title: 'Mise à jour de votre incident',
          message: `Votre incident "${after.title}" est maintenant: ${getStatusLabel(after.status)}`,
          data: {
            incidentId,
            oldStatus: before.status,
            newStatus: after.status,
          },
          isRead: false,
          createdAt: Timestamp.now(),
        });

        // Log d'audit
        await db.collection('auditLogs').add({
          userId: after.assignedToId || 'system',
          userName: after.assignedToName || 'Système',
          userRole: 'staff',
          action: 'UPDATE_INCIDENT_STATUS',
          entity: 'incidents',
          entityId: incidentId,
          changes: {
            before: { status: before.status },
            after: { status: after.status },
          },
          createdAt: Timestamp.now(),
        });
      } catch (error) {
        console.error('Erreur lors de la notification:', error);
      }
    }
  });

// ============================================
// Triggers pour les Factures
// ============================================

/**
 * Déclenché lors de la création d'une facture
 * - Notifie le résident
 */
export const onInvoiceCreated = functions
  .region('europe-west1')
  .firestore
  .document('invoices/{invoiceId}')
  .onCreate(async (snapshot, context) => {
    const invoice = snapshot.data();
    const invoiceId = context.params.invoiceId;

    try {
      // Notifier le résident
      await db.collection('notifications').add({
        userId: invoice.userId,
        type: 'facture',
        title: 'Nouvelle facture disponible',
        message: `Une nouvelle facture de ${invoice.totalAmount} DZD est disponible`,
        data: {
          invoiceId,
          amount: invoice.totalAmount,
          dueDate: invoice.dueDate,
        },
        isRead: false,
        createdAt: Timestamp.now(),
      });

      // TODO: Envoyer un email
    } catch (error) {
      console.error('Erreur lors de la notification de facture:', error);
    }
  });

// ============================================
// Scheduled Functions (Cron Jobs)
// ============================================

/**
 * Vérifier les factures en retard tous les jours à 9h
 */
export const checkOverdueInvoices = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 9 * * *')
  .timeZone('Africa/Algiers')
  .onRun(async (context) => {
    const now = Timestamp.now();
    
    try {
      // Récupérer les factures non payées dont la date d'échéance est dépassée
      const overdueQuery = await db
        .collection('invoices')
        .where('status', '==', 'envoyee')
        .where('dueDate', '<', now)
        .get();

      const batch = db.batch();
      
      overdueQuery.docs.forEach(doc => {
        // Mettre à jour le statut en "en_retard"
        batch.update(doc.ref, {
          status: 'en_retard',
          updatedAt: now,
        });
      });

      await batch.commit();
      
      console.log(`${overdueQuery.size} factures marquées en retard`);

      // Envoyer des rappels
      for (const doc of overdueQuery.docs) {
        const invoice = doc.data();
        
        // Notification
        await db.collection('notifications').add({
          userId: invoice.userId,
          type: 'facture',
          title: 'Rappel: Facture en retard',
          message: `Votre facture de ${invoice.totalAmount} DZD est en retard de paiement`,
          data: {
            invoiceId: doc.id,
            amount: invoice.totalAmount,
            daysOverdue: Math.floor((now.toMillis() - invoice.dueDate.toMillis()) / (1000 * 60 * 60 * 24)),
          },
          isRead: false,
          createdAt: now,
        });

        // Incrémenter le compteur de rappels
        await doc.ref.update({
          remindersSent: admin.firestore.FieldValue.increment(1),
          lastReminderAt: now,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des factures en retard:', error);
    }
  });

/**
 * Calculer les statistiques mensuelles le 1er de chaque mois
 */
export const calculateMonthlyStats = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 2 1 * *')
  .timeZone('Africa/Algiers')
  .onRun(async (context) => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const period = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    try {
      // Calculer les statistiques des incidents
      const incidentsQuery = await db
        .collection('incidents')
        .where('createdAt', '>=', Timestamp.fromDate(lastMonth))
        .where('createdAt', '<', Timestamp.fromDate(now))
        .get();

      const incidentStats = {
        total: incidentsQuery.size,
        resolved: incidentsQuery.docs.filter(d => d.data().status === 'resolu').length,
        averageResolutionHours: 0, // TODO: Calculer
      };

      // Calculer les statistiques financières
      const invoicesQuery = await db
        .collection('invoices')
        .where('createdAt', '>=', Timestamp.fromDate(lastMonth))
        .where('createdAt', '<', Timestamp.fromDate(now))
        .get();

      let totalInvoiced = 0;
      let totalCollected = 0;
      let unpaidCount = 0;

      invoicesQuery.docs.forEach(doc => {
        const invoice = doc.data();
        totalInvoiced += invoice.totalAmount;
        if (invoice.status === 'payee') {
          totalCollected += invoice.totalAmount;
        } else {
          unpaidCount++;
        }
      });

      // Calculer le taux d'occupation
      const apartmentsQuery = await db.collection('apartments').get();
      const totalApartments = apartmentsQuery.size;
      const occupiedApartments = apartmentsQuery.docs.filter(d => d.data().isOccupied).length;

      // Sauvegarder les statistiques
      await db.collection('statistics').add({
        residenceId: 'mobilart-oran',
        period,
        type: 'monthly',
        metrics: {
          incidents: incidentStats,
          financial: {
            totalInvoiced,
            totalCollected,
            collectionRate: totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0,
            unpaidCount,
          },
          occupancy: {
            occupied: occupiedApartments,
            vacant: totalApartments - occupiedApartments,
            rate: (occupiedApartments / totalApartments) * 100,
          },
        },
        createdAt: Timestamp.now(),
      });

      console.log(`Statistiques du mois ${period} calculées avec succès`);
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
    }
  });

// ============================================
// HTTP Functions (API Endpoints)
// ============================================

/**
 * Endpoint pour créer un utilisateur avec un rôle spécifique
 * Accessible uniquement aux super admins
 */
export const createUserWithRole = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Vérifier l'authentification
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Vous devez être connecté pour effectuer cette action'
      );
    }

    // Vérifier le rôle de l'utilisateur appelant
    const callerDoc = await db.collection('users').doc(context.auth.uid).get();
    const callerData = callerDoc.data();
    
    if (!callerData || callerData.role !== 'super_admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Seuls les super admins peuvent créer des utilisateurs'
      );
    }

    const { email, password, firstName, lastName, role, apartments } = data;

    try {
      // Créer l'utilisateur dans Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });

      // Créer le profil dans Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email,
        firstName,
        lastName,
        role,
        apartments: apartments || [],
        isActive: true,
        emailVerified: false,
        phoneVerified: false,
        notificationPreferences: {
          email: true,
          sms: false,
          push: true,
        },
        newsletterSubscribed: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Log d'audit
      await db.collection('auditLogs').add({
        userId: context.auth.uid,
        userName: `${callerData.firstName} ${callerData.lastName}`,
        userRole: callerData.role,
        action: 'CREATE_USER',
        entity: 'users',
        entityId: userRecord.uid,
        changes: { email, role },
        createdAt: Timestamp.now(),
      });

      return { success: true, userId: userRecord.uid };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        'internal',
        `Erreur lors de la création de l'utilisateur: ${error.message}`
      );
    }
  });

/**
 * Endpoint pour générer les factures mensuelles
 * Accessible uniquement aux admins et comptables
 */
export const generateMonthlyInvoices = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Vérifier l'authentification et les permissions
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Non authentifié');
    }

    const callerDoc = await db.collection('users').doc(context.auth.uid).get();
    const callerData = callerDoc.data();
    
    if (!callerData || !['super_admin', 'syndic', 'comptable'].includes(callerData.role)) {
      throw new functions.https.HttpsError('permission-denied', 'Permission refusée');
    }

    const { month, year } = data;

    try {
      // Récupérer tous les appartements occupés
      const apartmentsQuery = await db
        .collection('apartments')
        .where('isOccupied', '==', true)
        .get();

      const batch = db.batch();
      let invoiceCount = 0;

      for (const apartmentDoc of apartmentsQuery.docs) {
        const apartment = apartmentDoc.data();
        
        // Pour chaque résident de l'appartement
        for (const residentId of apartment.residentIds) {
          const invoiceRef = db.collection('invoices').doc();
          
          batch.set(invoiceRef, {
            residenceId: 'mobilart-oran',
            apartmentId: apartmentDoc.id,
            userId: residentId,
            invoiceNumber: `FAC-${year}-${String(month).padStart(2, '0')}-${String(invoiceCount + 1).padStart(3, '0')}`,
            type: 'charges_mensuelles',
            status: 'envoyee',
            amount: apartment.monthlyCharges,
            vatAmount: apartment.monthlyCharges * 0.19,
            totalAmount: apartment.monthlyCharges * 1.19,
            dueDate: Timestamp.fromDate(new Date(year, month, 10)), // Échéance le 10 du mois suivant
            description: `Charges mensuelles ${month}/${year}`,
            items: [
              {
                description: 'Charges communes',
                quantity: 1,
                unitPrice: apartment.monthlyCharges * 0.6,
                totalPrice: apartment.monthlyCharges * 0.6,
              },
              {
                description: 'Eau et assainissement',
                quantity: 1,
                unitPrice: apartment.monthlyCharges * 0.25,
                totalPrice: apartment.monthlyCharges * 0.25,
              },
              {
                description: 'Entretien et maintenance',
                quantity: 1,
                unitPrice: apartment.monthlyCharges * 0.15,
                totalPrice: apartment.monthlyCharges * 0.15,
              },
            ],
            remindersSent: 0,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          
          invoiceCount++;
        }
      }

      await batch.commit();

      return { 
        success: true, 
        message: `${invoiceCount} factures générées pour ${month}/${year}` 
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        'internal',
        `Erreur lors de la génération des factures: ${error.message}`
      );
    }
  });

// ============================================
// Fonctions utilitaires
// ============================================

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    nouveau: 'Nouveau',
    en_cours: 'En cours',
    en_attente: 'En attente',
    resolu: 'Résolu',
    ferme: 'Fermé',
    annule: 'Annulé',
  };
  return labels[status] || status;
}
