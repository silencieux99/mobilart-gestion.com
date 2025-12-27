'use client';

import React, { useState } from 'react';
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

    // Mock data pour démonstration
    const payments = [
        { id: '1', amount: 1500, date: new Date(), status: 'paid', type: 'Charges mensuelles', method: 'Virement' },
        { id: '2', amount: 1500, date: new Date(2024, 10, 1), status: 'paid', type: 'Charges mensuelles', method: 'CB' },
        { id: '3', amount: 1500, date: new Date(2024, 9, 1), status: 'late', type: 'Charges mensuelles', method: 'Chèque' },
    ];

    const incidents = [
        { id: '1', title: 'Fuite d\'eau', status: 'resolved', priority: 'high', date: new Date(2024, 11, 15) },
        { id: '2', title: 'Problème ascenseur', status: 'in_progress', priority: 'medium', date: new Date(2024, 11, 20) },
    ];

    const activities = [
        { id: '1', type: 'login', description: 'Connexion', date: new Date() },
        { id: '2', type: 'document', description: 'Document téléchargé', date: new Date(2024, 11, 25) },
        { id: '3', type: 'payment', description: 'Paiement effectué', date: new Date(2024, 11, 1) },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Tabs Navigation */}
            <div className="border-b border-gray-100">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
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
                            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="p-6">
                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={editedData.firstName || ''}
                                            onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{resident.firstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={editedData.lastName || ''}
                                            onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{resident.lastName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <p className="text-gray-900 flex items-center gap-2">
                                        {resident.email}
                                        {resident.emailVerified && (
                                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                    {editing ? (
                                        <input
                                            type="tel"
                                            value={editedData.phone || ''}
                                            onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{resident.phone || 'Non renseigné'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dates & Préférences</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date d'inscription</label>
                                    <p className="text-gray-900">
                                        {resident.createdAt && format(
                                            resident.createdAt.toDate ? resident.createdAt.toDate() : new Date(resident.createdAt),
                                            'dd MMMM yyyy',
                                            { locale: fr }
                                        )}
                                    </p>
                                </div>
                                {resident.validatedAt && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de validation</label>
                                        <p className="text-gray-900">
                                            {format(
                                                resident.validatedAt.toDate ? resident.validatedAt.toDate() : new Date(resident.validatedAt),
                                                'dd MMMM yyyy',
                                                { locale: fr }
                                            )}
                                        </p>
                                    </div>
                                )}
                                
                                <div className="pt-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Notifications</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={resident.notificationPreferences?.email || false}
                                                disabled={!editing}
                                                className="h-4 w-4 text-primary-600 rounded"
                                            />
                                            <span className="text-sm text-gray-700">Email</span>
                                        </label>
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={resident.notificationPreferences?.sms || false}
                                                disabled={!editing}
                                                className="h-4 w-4 text-primary-600 rounded"
                                            />
                                            <span className="text-sm text-gray-700">SMS</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Apartment Tab */}
                {activeTab === 'apartment' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Building className="h-5 w-5 text-primary-600" />
                                Informations logement
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Appartement</span>
                                    <span className="font-medium text-gray-900">
                                        {resident.tempApartmentDetails || 'Non assigné'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Type</span>
                                    <span className="font-medium text-gray-900">
                                        {resident.apartment?.occupancyType === 'owner' ? 'Propriétaire' : 'Locataire'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Surface</span>
                                    <span className="font-medium text-gray-900">85 m²</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pièces</span>
                                    <span className="font-medium text-gray-900">3 pièces</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Car className="h-5 w-5 text-primary-600" />
                                Équipements
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Parking</span>
                                    <span className="font-medium text-gray-900">Place n°42</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cave</span>
                                    <span className="font-medium text-gray-900">Cave n°12</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Balcon</span>
                                    <span className="font-medium text-gray-900">Oui (8m²)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-emerald-50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-emerald-600 text-sm font-medium">Payés</span>
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                </div>
                                <p className="text-2xl font-bold text-emerald-900">
                                    {payments.filter(p => p.status === 'paid').length}
                                </p>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-orange-600 text-sm font-medium">En attente</span>
                                    <Clock className="h-5 w-5 text-orange-600" />
                                </div>
                                <p className="text-2xl font-bold text-orange-900">
                                    {payments.filter(p => p.status === 'pending').length}
                                </p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-red-600 text-sm font-medium">En retard</span>
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                </div>
                                <p className="text-2xl font-bold text-red-900">
                                    {payments.filter(p => p.status === 'late').length}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {format(payment.date, 'dd/MM/yyyy')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{payment.type}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {payment.amount.toFixed(2)} €
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                    payment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {payment.status === 'paid' ? 'Payé' :
                                                     payment.status === 'pending' ? 'En attente' : 'En retard'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Incidents Tab */}
                {activeTab === 'incidents' && (
                    <div className="space-y-4">
                        {incidents.map((incident) => (
                            <div key={incident.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{incident.title}</h4>
                                    <p className="text-sm text-gray-600">
                                        {format(incident.date, 'dd MMMM yyyy', { locale: fr })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        incident.priority === 'high' ? 'bg-red-100 text-red-700' :
                                        incident.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {incident.priority === 'high' ? 'Urgent' :
                                         incident.priority === 'medium' ? 'Moyen' : 'Faible'}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        incident.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                        incident.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {incident.status === 'resolved' ? 'Résolu' :
                                         incident.status === 'in_progress' ? 'En cours' : 'Nouveau'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="text-center py-12 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Aucun document disponible</p>
                    </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <div className="space-y-3">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                    activity.type === 'login' ? 'bg-blue-100 text-blue-600' :
                                    activity.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {activity.type === 'login' ? <User className="h-4 w-4" /> :
                                     activity.type === 'payment' ? <DollarSign className="h-4 w-4" /> :
                                     <FileText className="h-4 w-4" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                                    <p className="text-xs text-gray-500">
                                        {format(activity.date, 'dd/MM/yyyy à HH:mm', { locale: fr })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
