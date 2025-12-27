'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    Building,
    User as UserIcon,
    Trash2,
    Edit2,
    Loader2,
    MessageSquare,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { AddResidentModal } from '@/components/dashboard/residents/AddResidentModal';
import { collection, query, where, onSnapshot, doc, deleteDoc, orderBy, getDocs, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ResidentsPage() {
    const router = useRouter();
    const [selectedResident, setSelectedResident] = useState<any>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [residents, setResidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'users'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setResidents(usersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching residents:", error);
            toast.error("Erreur lors du chargement des résidents");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleEdit = (resident: any) => {
        setSelectedResident(resident);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce résident ?')) {
            try {
                await deleteDoc(doc(db, 'users', id));
                toast.success('Résident supprimé');
            } catch (error) {
                console.error("Error deleting resident:", error);
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    const handleValidateResident = async (residentId: string) => {
        try {
            // Récupérer les infos du résident
            const resident = residents.find(r => r.id === residentId);
            if (!resident) {
                throw new Error('Résident non trouvé');
            }

            // Mettre à jour le statut dans Firestore
            await setDoc(doc(db, 'users', residentId), {
                status: 'approved',
                isActive: true,
                validatedAt: new Date(),
                validatedBy: auth.currentUser?.uid || 'admin',
            }, { merge: true });

            // Envoyer l'email de confirmation
            await fetch('/api/residents/validate-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    residentEmail: resident.email,
                    residentName: `${resident.firstName} ${resident.lastName}`,
                    action: 'approve' 
                })
            });

            toast.success('Résident validé avec succès');
        } catch (error: any) {
            console.error('Error validating resident:', error);
            toast.error(error.message || 'Erreur lors de la validation');
        }
    };

    const handleRejectResident = async (residentId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) return;

        try {
            // Récupérer les infos du résident
            const resident = residents.find(r => r.id === residentId);
            if (!resident) {
                throw new Error('Résident non trouvé');
            }

            // Envoyer l'email de notification
            await fetch('/api/residents/validate-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    residentEmail: resident.email,
                    residentName: `${resident.firstName} ${resident.lastName}`,
                    action: 'reject' 
                })
            });

            // Supprimer le document Firestore
            await deleteDoc(doc(db, 'users', residentId));

            toast.success('Demande rejetée');
        } catch (error: any) {
            console.error('Error rejecting resident:', error);
            toast.error(error.message || 'Erreur lors du rejet');
        }
    };

    const handleSendMessage = async (residentId: string) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                toast.error("Vous devez être connecté");
                return;
            }

            // Check if conversation exists (participants array contains both)
            // Firestore hack for two array-contains: 
            // We can only do one. So let's query for resident's conversations and filter in memory.
            const q = query(
                collection(db, 'conversations'),
                where('participants', 'array-contains', residentId)
            );

            const snapshot = await getDocs(q);
            let conversationId = null;

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.participants.includes(currentUser.uid)) {
                    conversationId = doc.id;
                }
            });

            if (!conversationId) {
                // Create new conversation
                const newConvRef = doc(collection(db, 'conversations'));
                await setDoc(newConvRef, {
                    participants: [currentUser.uid, residentId],
                    lastMessage: 'Nouvelle conversation',
                    lastMessageTime: serverTimestamp(),
                    unreadCount: 0
                });
                conversationId = newConvRef.id;
            }

            router.push(`/dashboard/messages?conversationId=${conversationId}`);
        } catch (error) {
            console.error("Error starting chat:", error);
            toast.error("Erreur impossible d'ouvrir la messagerie");
        }
    };



    const filteredResidents = residents.filter(resident => {
        const matchesSearch = 
            resident.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resident.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resident.email?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        if (filterType === 'pending') {
            matchesFilter = resident.status === 'pending';
        } else if (filterType === 'active') {
            matchesFilter = resident.status !== 'pending' && resident.isActive !== false;
        } else if (filterType !== 'all') {
            matchesFilter = resident.tempApartmentDetails?.occupancyType === filterType;
        }

        return matchesSearch && matchesFilter;
    });

    const pendingCount = residents.filter(r => r.status === 'pending').length;

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
                        Résidents
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Gérez les occupants, propriétaires et locataires de la résidence.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="h-5 w-5" />
                    <span>Ajouter un résident</span>
                </button>
            </div>

            {/* Quick Stats - Calculated from real data */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <UserIcon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Actif</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Résidents</p>
                        <h3 className="text-3xl font-bold text-gray-900">{residents.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Building className="h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Propriétaires</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                            {residents.filter(r => r.tempApartmentDetails?.occupancyType === 'owner').length}
                        </h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <Clock className="h-6 w-6" />
                        </div>
                        {pendingCount > 0 && (
                            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                                {pendingCount} nouveau{pendingCount > 1 ? 'x' : ''}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">En attente</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                            {pendingCount}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="px-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="active">Actifs</option>
                        <option value="owner">Propriétaires</option>
                        <option value="tenant">Locataires</option>
                    </select>
                    <button className="p-2.5 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                        <Filter className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Residents List */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Résident</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Appartement</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Statut</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredResidents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        Aucun résident trouvé.
                                    </td>
                                </tr>
                            ) : (
                                filteredResidents.map((resident, index) => {
                                    const apartment = resident.tempApartmentDetails;
                                    const occupancy = apartment?.occupancyType || 'resident';

                                    return (
                                        <motion.tr
                                            key={resident.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                            onClick={(e) => {
                                                // Ne pas naviguer si on clique sur un bouton d'action
                                                if (!(e.target as HTMLElement).closest('button')) {
                                                    router.push(`/dashboard/residents/${resident.id}`);
                                                }
                                            }}
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold border-2 border-white shadow-sm shrink-0">
                                                        {(resident.firstName?.[0] || '')}{(resident.lastName?.[0] || '')}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                            {resident.firstName} {resident.lastName}
                                                        </p>
                                                        <span className={cn(
                                                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-0.5",
                                                            occupancy === 'owner'
                                                                ? "bg-purple-100 text-purple-700"
                                                                : "bg-blue-100 text-blue-700"
                                                        )}>
                                                            {occupancy === 'owner' ? 'Propriétaire' : 'Locataire'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 hidden md:table-cell">
                                                <div className="space-y-1">
                                                    {resident.email && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Mail className="h-3.5 w-3.5 mr-2 text-gray-400" />
                                                            {resident.email}
                                                        </div>
                                                    )}
                                                    {resident.phone && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Phone className="h-3.5 w-3.5 mr-2 text-gray-400" />
                                                            {resident.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 hidden lg:table-cell">
                                                {apartment ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                                            <Building className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Tour {apartment.tower}</p>
                                                            <p className="text-xs text-gray-500">Étage {apartment.floor} • Porte {apartment.number}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Non assigné</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 hidden sm:table-cell">
                                                <span className={cn(
                                                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                                    resident.status === 'pending' ? "bg-orange-100 text-orange-700" :
                                                    resident.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                                                )}>
                                                    <span className={cn(
                                                        "h-1.5 w-1.5 rounded-full mr-1.5",
                                                        resident.status === 'pending' ? "bg-orange-500" :
                                                        resident.isActive ? "bg-emerald-500" : "bg-gray-500"
                                                    )} />
                                                    {resident.status === 'pending' ? 'En attente' : resident.isActive ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {resident.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleValidateResident(resident.id)}
                                                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                                            title="Valider"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Valider
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectResident(resident.id)}
                                                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Rejeter"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            Rejeter
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleSendMessage(resident.id)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Envoyer un message"
                                                        >
                                                            <MessageSquare className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(resident)}
                                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(resident.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    )
                                })
                            )
                            }
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simplified for now as Firestore pagination is complex) */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        {residents.length} résidents au total
                    </p>
                </div>
            </div>

            {/* Modal */}
            <AddResidentModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setSelectedResident(null);
                }}
                residentToEdit={selectedResident}
            />
        </div>
    );
}
