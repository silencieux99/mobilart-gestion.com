'use client';

import React, { useState, useEffect } from 'react';
import {
    User,
    Building,
    CreditCard,
    AlertCircle,
    FileText,
    Activity,
    CheckCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Car,
    Home,
    Calendar,
    DollarSign,
    MessageSquare,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface ResidentProfileTabsProps {
    resident: any;
    editing: boolean;
    editedData: any;
    setEditedData: (data: any) => void;
}

export default function ResidentProfileTabs({
    resident,
    editing,
    editedData,
    setEditedData
}: ResidentProfileTabsProps) {
    const [activeTab, setActiveTab] = useState('general');
    const [payments, setPayments] = useState<any[]>([]);
    const [incidents, setIncidents] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!resident?.id) return;

        const fetchData = async () => {
            try {
                // Fetch Invoices (Payments)
                const qInv = query(collection(db, 'invoices'), where('userId', '==', resident.id), orderBy('createdAt', 'desc'));
                const snapInv = await getDocs(qInv);
                const loadedPayments = snapInv.docs.map(d => {
                    const data = d.data();
                    return {
                        id: d.id,
                        ...data,
                        date: data.createdAt || data.date, // Handle variations
                        amount: Number(data.amount || 0),
                        type: data.type || 'Paiement',
                        status: data.status || 'pending'
                    };
                });
                setPayments(loadedPayments);

                // Fetch Incidents
                const qInc = query(collection(db, 'incidents'), where('reporterId', '==', resident.id), orderBy('createdAt', 'desc'));
                const snapInc = await getDocs(qInc);
                const loadedIncidents = snapInc.docs.map(d => {
                    const data = d.data();
                    return {
                        id: d.id,
                        ...data,
                        date: data.createdAt || new Date(),
                        title: data.type || 'Incident', // Fallback to type if title missing
                        priority: data.priority || 'medium',
                        status: data.status || 'new'
                    };
                });
                setIncidents(loadedIncidents);

                // Activities - Empty for now as requested to remove fake data
                // Could be populated from logs collection later
                setActivities([]);
            } catch (e) {
                console.error("Error loading resident sub-data", e);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [resident?.id]);

    // Safe Date Helper
    const formatSafeDate = (date: any, formatStr: string = 'dd MMMM yyyy') => {
        if (!date) return 'Date inconnue';
        try {
            const d = date.toDate ? date.toDate() : new Date(date);
            // Check if date is valid
            if (isNaN(d.getTime())) return 'Date invalide';
            return format(d, formatStr, { locale: fr });
        } catch (e) {
            return 'Erreur date';
        }
    };

    // Safe Apartment Details Helper
    const formatApartmentDetails = (details: any) => {
        if (!details) return "Non assigné";
        if (typeof details === 'string') return details;
        if (typeof details === 'object') {
            const { tower, floor, number, apartmentNumber } = details;
            const num = number || apartmentNumber || '?';
            return `Tour ${tower || '?'} - Étage ${floor || '?'} - Appt ${num}`;
        }
        return "Format inconnu";
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full max-w-full">
            {/* Tabs Navigation - Scrollable on mobile & Sticky */}
            <div className="border-b border-gray-100 overflow-x-auto scrollbar-hide sticky top-0 z-20 bg-white backdrop-blur-xl bg-white/95 w-full">
                <nav className="flex px-4 sm:px-6 min-w-max" aria-label="Tabs">
                    {[
                        { id: 'general', label: 'Général', icon: User },
                        { id: 'apartment', label: 'Appartement', icon: Building },
                        { id: 'payments', label: 'Paiements', icon: CreditCard },
                        { id: 'incidents', label: 'Incidents', icon: AlertCircle },
                        { id: 'documents', label: 'Documents', icon: FileText },
                        { id: 'activity', label: 'Activité', icon: Activity },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`group flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                                }`}
                        >
                            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="p-4 sm:p-6">
                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-gray-400" />
                                Informations personnelles
                            </h3>
                            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Prénom</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={editedData.firstName || ''}
                                            onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-base sm:text-sm"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{resident.firstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nom</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={editedData.lastName || ''}
                                            onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-base sm:text-sm"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{resident.lastName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</label>
                                    <p className="text-gray-900 font-medium flex items-center gap-2 break-all">
                                        {resident.email}
                                        {resident.emailVerified && (
                                            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Téléphone</label>
                                    {editing ? (
                                        <input
                                            type="tel"
                                            value={editedData.phone || ''}
                                            onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-base sm:text-sm"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{resident.phone || 'Non renseigné'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                Dates & Préférences
                            </h3>
                            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date d'inscription</label>
                                    <p className="text-gray-900 font-medium">
                                        {formatSafeDate(resident.createdAt)}
                                    </p>
                                </div>
                                {resident.validatedAt && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date de validation</label>
                                        <p className="text-gray-900 font-medium">
                                            {formatSafeDate(resident.validatedAt)}
                                        </p>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-200 mt-4">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3">Notifications</h4>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={resident.notificationPreferences?.email || false}
                                                disabled={!editing}
                                                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Email</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={resident.notificationPreferences?.sms || false}
                                                disabled={!editing}
                                                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">SMS</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Apartment Tab */}
                {activeTab === 'apartment' && (
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Building className="h-5 w-5 text-primary-600" />
                                Informations logement
                            </h3>

                            {editing ? (
                                <div className="space-y-6">
                                    {/* Localisation */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Localisation</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Tour</label>
                                                <select
                                                    value={typeof editedData.tempApartmentDetails === 'object' ? editedData.tempApartmentDetails?.tower : ''}
                                                    onChange={(e) => {
                                                        const current = typeof editedData.tempApartmentDetails === 'object' ? editedData.tempApartmentDetails : {};
                                                        setEditedData({ ...editedData, tempApartmentDetails: { ...current, tower: e.target.value } });
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base sm:text-sm bg-white focus:ring-2 focus:ring-primary-500"
                                                >
                                                    <option value="">Choisir...</option>
                                                    <option value="A">Tour A</option>
                                                    <option value="B">Tour B</option>
                                                    <option value="C">Tour C</option>
                                                    <option value="D">Tour D</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Étage</label>
                                                <input
                                                    type="number"
                                                    placeholder="Ex: 12"
                                                    value={typeof editedData.tempApartmentDetails === 'object' ? editedData.tempApartmentDetails?.floor : ''}
                                                    onChange={(e) => {
                                                        const current = typeof editedData.tempApartmentDetails === 'object' ? editedData.tempApartmentDetails : {};
                                                        setEditedData({ ...editedData, tempApartmentDetails: { ...current, floor: e.target.value } });
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base sm:text-sm bg-white focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Numéro Porte</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex: 04"
                                                    value={typeof editedData.tempApartmentDetails === 'object' ? (editedData.tempApartmentDetails?.number || editedData.tempApartmentDetails?.apartmentNumber) : ''}
                                                    onChange={(e) => {
                                                        const current = typeof editedData.tempApartmentDetails === 'object' ? editedData.tempApartmentDetails : {};
                                                        setEditedData({ ...editedData, tempApartmentDetails: { ...current, number: e.target.value } });
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base sm:text-sm bg-white focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Annexes */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Annexes & Stationnement</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Place de Parking</label>
                                                <div className="relative">
                                                    <Car className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: P-102"
                                                        value={typeof editedData.tempApartmentDetails === 'object' ? editedData.tempApartmentDetails?.parking : ''}
                                                        onChange={(e) => {
                                                            const current = typeof editedData.tempApartmentDetails === 'object' ? editedData.tempApartmentDetails : {};
                                                            setEditedData({ ...editedData, tempApartmentDetails: { ...current, parking: e.target.value } });
                                                        }}
                                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-base sm:text-sm bg-white focus:ring-2 focus:ring-primary-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Cave / Box</label>
                                                <div className="relative">
                                                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: C-54"
                                                        value={typeof editedData.tempApartmentDetails === 'object' ? editedData.tempApartmentDetails?.cellar : ''}
                                                        onChange={(e) => {
                                                            const current = typeof editedData.tempApartmentDetails === 'object' ? editedData.tempApartmentDetails : {};
                                                            setEditedData({ ...editedData, tempApartmentDetails: { ...current, cellar: e.target.value } });
                                                        }}
                                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-base sm:text-sm bg-white focus:ring-2 focus:ring-primary-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Type */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Statut d'occupation</h4>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                                            <select
                                                value={editedData.occupancyType || ''}
                                                onChange={(e) => setEditedData({ ...editedData, occupancyType: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base sm:text-sm bg-white focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="">Sélectionner...</option>
                                                <option value="owner">Propriétaire</option>
                                                <option value="tenant">Locataire</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                                        <span className="text-gray-500 text-sm">Appartement</span>
                                        <span className="font-bold text-gray-900 text-lg">
                                            {formatApartmentDetails(resident.tempApartmentDetails)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                                            <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Parking</span>
                                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                                <Car className="h-4 w-4 text-primary-500" />
                                                {(typeof resident.tempApartmentDetails === 'object' && resident.tempApartmentDetails?.parking) || 'Non assigné'}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                                            <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Cave</span>
                                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                                <Building className="h-4 w-4 text-primary-500" />
                                                {(typeof resident.tempApartmentDetails === 'object' && resident.tempApartmentDetails?.cellar) || 'Non assignée'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center border-b border-gray-200 py-3">
                                        <span className="text-gray-600">Type d'occupation</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${(resident.occupancyType === 'owner')
                                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                                            }`}>
                                            {(resident.occupancyType === 'owner') ? 'Propriétaire' : 'Locataire'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-emerald-700 text-sm font-bold uppercase tracking-wider">Payés</span>
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-emerald-900">
                                    {payments.filter(p => p.status === 'paid').length}
                                </p>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-orange-700 text-sm font-bold uppercase tracking-wider">En attente</span>
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Clock className="h-5 w-5 text-orange-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-orange-900">
                                    {payments.filter(p => p.status === 'pending').length}
                                </p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-red-700 text-sm font-bold uppercase tracking-wider">En retard</span>
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-red-900">
                                    {payments.filter(p => p.status === 'late').length}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full whitespace-nowrap">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Montant</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {payments.length > 0 ? (
                                            payments.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                        {formatSafeDate(payment.date, 'dd/MM/yyyy')}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                                            {payment.type}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                        {payment.amount.toFixed(2)} DA
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${payment.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                                                            payment.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {payment.status === 'paid' ? 'Payé' :
                                                                payment.status === 'pending' ? 'En attente' : 'En retard'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                    Aucun paiement enregistré
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Incidents Tab */}
                {activeTab === 'incidents' && (
                    <div className="space-y-4">
                        {incidents.length > 0 ? (
                            incidents.map((incident) => (
                                <div key={incident.id} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${incident.priority === 'high' ? 'bg-red-50 text-red-600' :
                                            incident.priority === 'medium' ? 'bg-orange-50 text-orange-600' :
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                            <AlertCircle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg">{incident.title}</h4>
                                            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                <Calendar className="h-4 w-4" />
                                                {formatSafeDate(incident.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pl-14 sm:pl-0">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${incident.priority === 'high' ? 'bg-red-100 text-red-700' :
                                            incident.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {incident.priority === 'high' ? 'Urgent' :
                                                incident.priority === 'medium' ? 'Moyen' : 'Faible'}
                                        </span>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${incident.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                            incident.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {incident.status === 'resolved' ? 'Résolu' :
                                                incident.status === 'in_progress' ? 'En cours' : 'Nouveau'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <div className="p-3 bg-white rounded-full mb-3 shadow-sm">
                                    <AlertCircle className="h-6 w-6 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">Aucun incident signalé</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Aucun document</h3>
                        <p className="text-gray-500 mt-1">Les documents associés à ce résident apparaîtront ici.</p>
                    </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <div className="space-y-4">
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'login' ? 'bg-blue-100 text-blue-600' :
                                        activity.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                        {activity.type === 'login' ? <User className="h-5 w-5" /> :
                                            activity.type === 'payment' ? <DollarSign className="h-5 w-5" /> :
                                                <FileText className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900">{activity.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatSafeDate(activity.date, 'dd/MM/yyyy à HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <div className="p-3 bg-white rounded-full mb-3 shadow-sm">
                                    <Activity className="h-6 w-6 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">Aucune activité récente</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
