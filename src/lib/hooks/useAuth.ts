import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User as AppUser, UserRole } from '@/types';

interface AuthState {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Récupérer les données utilisateur depuis Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as AppUser;
            setAuthState({
              user: { ...userData, id: firebaseUser.uid },
              firebaseUser,
              loading: false,
              error: null,
            });
          } else {
            // L'utilisateur Firebase existe mais pas dans Firestore
            setAuthState({
              user: null,
              firebaseUser,
              loading: false,
              error: new Error('Profil utilisateur non trouvé'),
            });
          }
        } else {
          setAuthState({
            user: null,
            firebaseUser: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: error as Error,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const isAuthenticated = !!authState.user;
  
  const hasRole = (role: UserRole): boolean => {
    return authState.user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(authState.user?.role as UserRole);
  };

  const isAdmin = (): boolean => {
    return hasAnyRole([UserRole.SUPER_ADMIN, UserRole.SYNDIC]);
  };

  const isStaff = (): boolean => {
    return hasAnyRole([
      UserRole.SUPER_ADMIN,
      UserRole.SYNDIC,
      UserRole.GARDIEN,
      UserRole.TECHNICIEN,
      UserRole.COMPTABLE,
    ]);
  };

  return {
    ...authState,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isStaff,
  };
}
