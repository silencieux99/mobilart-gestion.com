'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Building,
    Calendar,
    Shield,
    Activity,
    FileText,
    MessageSquare,
    CreditCard,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Edit,
    Save,
    X,
    Home,
    MapPin,
    Users,
    Settings,
    Bell,
    Wifi,
    Car,
    Key,
    DollarSign,
    TrendingUp,
    TrendingDown,
    MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ResidentProfileTabs from '@/components/dashboard/residents/ResidentProfileTabs';

interface Resident {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    status?: string;
    isActive: boolean;
    tempApartmentDetails?: string;
    createdAt: any;
    updatedAt?: any;
    validatedAt?: any;
    validatedBy?: string;
    lastLogin?: any;
    emailVerified?: boolean;
    notificationPreferences?: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
}

export default function ResidentProfilePage() {
    const params = useParams();
    const router = useRouter();
    const residentId = params.id as string;

    const [resident, setResident] = useState<Resident | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editedData, setEditedData] = useState<Partial<Resident>>({});

    useEffect(() => {
        fetchResident();
    }, [residentId]);

    const fetchResident = async () => {
        try {
            const docRef = doc(db, 'users', residentId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as Resident;
                setResident(data);
                setEditedData(data);
            } else {
                toast.error('Résident non trouvé');
                router.push('/dashboard/residents');
            }
        } catch (error) {
            console.error('Error fetching resident:', error);
            toast.error('Erreur lors du chargement du profil');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await updateDoc(doc(db, 'users', residentId), {
                ...editedData,
                updatedAt: new Date()
            });
            setResident({ ...resident, ...editedData } as Resident);
            setEditing(false);
            toast.success('Profil mis à jour avec succès');
        } catch (error) {
            console.error('Error updating resident:', error);
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleToggleStatus = async () => {
        try {
            const newStatus = !resident?.isActive;
            await updateDoc(doc(db, 'users', residentId), {
                isActive: newStatus,
                updatedAt: new Date()
            });
            setResident({ ...resident!, isActive: newStatus });
            toast.success(newStatus ? 'Compte activé' : 'Compte désactivé');
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Erreur lors du changement de statut');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!resident) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-emerald-600 bg-emerald-50';
            case 'pending': return 'text-orange-600 bg-orange-50';
            case 'rejected': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <button
                        onClick={() => router.push('/dashboard/residents')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors self-start p-2 -ml-2 sm:ml-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Retour</span>
                    </button>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {!editing ? (
                            <>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium"
                                >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                </button>
                                <button
                                    onClick={handleToggleStatus}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium ${resident.isActive
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                                        }`}
                                >
                                    {resident.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                    {resident.isActive ? 'Désactiver' : 'Activer'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setEditedData(resident);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium"
                                >
                                    <X className="h-4 w-4" />
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors text-sm font-medium shadow-lg shadow-primary-600/20"
                                >
                                    <Save className="h-4 w-4" />
                                    Enregistrer
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl shadow-primary-600/20 ring-4 ring-white"
                    >
                        {resident.firstName?.[0]}{resident.lastName?.[0]}
                    </motion.div>
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                                {resident.firstName} {resident.lastName}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(resident.status || '')}`}>
                                    {resident.status === 'pending' ? 'En attente' :
                                        resident.status === 'approved' ? 'Approuvé' :
                                            resident.status === 'rejected' ? 'Rejeté' : 'Actif'}
                                </span>
                                {resident.isActive ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                        Actif
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                                        Inactif
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <Mail className="h-4 w-4 text-gray-400" />
                                {resident.email}
                            </div>
                            {resident.phone && (
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    {resident.phone}
                                </div>
                            )}
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <Shield className="h-4 w-4 text-gray-400" />
                                {resident.role === 'admin' ? 'Administrateur' : 'Résident'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Component */}
            <ResidentProfileTabs
                resident={resident}
                editing={editing}
                editedData={editedData}
                setEditedData={setEditedData}
            />
        </div>
    );
}
