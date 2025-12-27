import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User as AppUser, UserRole } from '@/types';

export class AuthService {
  /**
   * Connexion avec email et mot de passe
   */
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Mettre à jour la dernière connexion
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLoginAt: serverTimestamp(),
      });
      
      return userCredential.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Création d'un nouveau compte
   */
  static async signUp(
    email: string,
    password: string,
    userData: Partial<AppUser>
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Créer le profil utilisateur dans Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userData,
        email,
        role: UserRole.RESIDENT,
        isActive: true,
        emailVerified: false,
        phoneVerified: false,
        notificationPreferences: {
          email: true,
          sms: false,
          push: true,
        },
        newsletterSubscribed: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return userCredential.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Déconnexion
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Réinitialisation du mot de passe
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Mise à jour du mot de passe
   */
  static async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('Utilisateur non connecté');
      
      // Ré-authentifier l'utilisateur
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Mettre à jour le mot de passe
      await updatePassword(user, newPassword);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Mise à jour de l'email
   */
  static async updateEmail(
    password: string,
    newEmail: string
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('Utilisateur non connecté');
      
      // Ré-authentifier l'utilisateur
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Mettre à jour l'email
      await updateEmail(user, newEmail);
      
      // Mettre à jour dans Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        email: newEmail,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Gestion des erreurs Firebase Auth
   */
  private static handleAuthError(error: any): Error {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
      'auth/invalid-email': 'Adresse email invalide',
      'auth/operation-not-allowed': 'Opération non autorisée',
      'auth/weak-password': 'Le mot de passe est trop faible',
      'auth/user-disabled': 'Ce compte a été désactivé',
      'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/invalid-credential': 'Identifiants invalides',
      'auth/too-many-requests': 'Trop de tentatives, veuillez réessayer plus tard',
      'auth/network-request-failed': 'Erreur de connexion réseau',
    };

    const message = errorMessages[error.code] || 'Une erreur est survenue';
    return new Error(message);
  }
}
