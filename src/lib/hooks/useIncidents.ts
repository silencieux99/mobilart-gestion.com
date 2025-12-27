import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Incident, IncidentStatus, IncidentPriority, FilterParams, PaginatedResponse } from '@/types';
import { useAuth } from './useAuth';

interface UseIncidentsParams extends FilterParams {
  userId?: string;
  assignedToId?: string;
  tower?: string;
  pageSize?: number;
}

export function useIncidents(params: UseIncidentsParams = {}) {
  const { user, isStaff } = useAuth();
  
  return useQuery({
    queryKey: ['incidents', params],
    queryFn: async (): Promise<PaginatedResponse<Incident>> => {
      const constraints: QueryConstraint[] = [];
      
      // Filtrer par utilisateur si non-staff
      if (!isStaff() && user) {
        constraints.push(where('reporterId', '==', user.id));
      }
      
      // Appliquer les filtres
      if (params.status) {
        constraints.push(where('status', '==', params.status));
      }
      if (params.assignedToId) {
        constraints.push(where('assignedToId', '==', params.assignedToId));
      }
      if (params.tower) {
        constraints.push(where('tower', '==', params.tower));
      }
      if (params.category) {
        constraints.push(where('category', '==', params.category));
      }
      
      // Tri et pagination
      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(params.pageSize || 20));
      
      const q = query(collection(db, 'incidents'), ...constraints);
      const snapshot = await getDocs(q);
      
      const incidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Incident[];
      
      return {
        items: incidents,
        total: incidents.length,
        page: params.page || 1,
        totalPages: 1,
        hasMore: incidents.length === (params.pageSize || 20),
      };
    },
    enabled: !!user,
  });
}

export function useIncident(incidentId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['incident', incidentId],
    queryFn: async (): Promise<Incident | null> => {
      const docRef = doc(db, 'incidents', incidentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Incident;
      }
      return null;
    },
    enabled: !!user && !!incidentId,
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: Partial<Incident>) => {
      if (!user) throw new Error('Utilisateur non connecté');
      
      const incidentData = {
        ...data,
        reporterId: user.id,
        reporterName: `${user.firstName} ${user.lastName}`,
        status: IncidentStatus.NOUVEAU,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        comments: [],
        images: data.images || [],
      };
      
      const docRef = await addDoc(collection(db, 'incidents'), incidentData);
      return { id: docRef.id, ...incidentData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      incidentId, 
      data 
    }: { 
      incidentId: string; 
      data: Partial<Incident> 
    }) => {
      const docRef = doc(db, 'incidents', incidentId);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(docRef, updateData);
      return { id: incidentId, ...updateData };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incident', variables.incidentId] });
    },
  });
}

export function useDeleteIncident() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (incidentId: string) => {
      await deleteDoc(doc(db, 'incidents', incidentId));
      return incidentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

export function useIncidentStats() {
  const { user, isStaff } = useAuth();
  
  return useQuery({
    queryKey: ['incident-stats'],
    queryFn: async () => {
      const constraints: QueryConstraint[] = [];
      
      if (!isStaff() && user) {
        constraints.push(where('reporterId', '==', user.id));
      }
      
      // Récupérer tous les incidents pour calculer les stats
      const q = query(collection(db, 'incidents'), ...constraints);
      const snapshot = await getDocs(q);
      
      const incidents = snapshot.docs.map(doc => doc.data() as Incident);
      
      const stats = {
        total: incidents.length,
        nouveau: incidents.filter(i => i.status === IncidentStatus.NOUVEAU).length,
        enCours: incidents.filter(i => i.status === IncidentStatus.EN_COURS).length,
        resolu: incidents.filter(i => i.status === IncidentStatus.RESOLU).length,
        urgent: incidents.filter(i => i.priority === IncidentPriority.URGENTE).length,
      };
      
      return stats;
    },
    enabled: !!user,
  });
}
