'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { UserRole, Tower } from '@/types';
import { toast } from 'sonner';

interface AddResidentModalProps {
    isOpen: boolean;
    onClose: () => void;
    residentToEdit?: any;
}

export function AddResidentModal({ isOpen, onClose, residentToEdit }: AddResidentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        tower: 'A',
        floor: '1',
        number: '',
        role: 'owner' as 'owner' | 'tenant'
    });

    useEffect(() => {
        if (isOpen && residentToEdit) {
            setFormData({
                firstName: residentToEdit.firstName || '',
                lastName: residentToEdit.lastName || '',
                email: residentToEdit.email || '',
                phone: residentToEdit.phone || '',
                tower: residentToEdit.tempApartmentDetails?.tower || 'A',
                floor: residentToEdit.tempApartmentDetails?.floor?.toString() || '1',
                number: residentToEdit.tempApartmentDetails?.number || '',
                role: residentToEdit.tempApartmentDetails?.occupancyType || 'owner'
            });
        } else if (isOpen) {
            // Reset if adding new
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                tower: 'A',
                floor: '1',
                number: '',
                role: 'owner'
            });
        }
    }, [isOpen, residentToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {

            if (residentToEdit) {
                // Update - keeping this client side for now as it's simpler and doesn't require password/auth changes usually
                const dataToSave = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    role: UserRole.RESIDENT,
                    tempApartmentDetails: {
                        tower: formData.tower,
                        floor: parseInt(formData.floor),
                        number: formData.number,
                        occupancyType: formData.role
                    },
                    updatedAt: serverTimestamp(),
                };

                const userRef = doc(db, 'users', residentToEdit.id);
                await updateDoc(userRef, dataToSave);
                toast.success('Résident mis à jour avec succès');
            } else {
                // Create via API (handles Auth + Email)
                const response = await fetch('/api/residents/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        role: UserRole.RESIDENT,
                        tempApartmentDetails: {
                            tower: formData.tower,
                            floor: parseInt(formData.floor),
                            number: formData.number,
                            occupancyType: formData.role
                        }
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Erreur lors de la création");
                }

                if (result.warning) {
                    toast.warning(result.message);
                } else {
                    toast.success('Résident créé et identifiants envoyés par email');
                }
            }

            onClose();
            // Form is reset by useEffect on next open
        } catch (error) {
            console.error('Error saving resident:', error);
            toast.error(residentToEdit ? "Erreur lors de la mise à jour" : "Erreur lors de l'ajout");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{residentToEdit ? 'Modifier Résident' : 'Nouveau Résident'}</h2>
                            <p className="text-sm text-gray-500">{residentToEdit ? 'Mettre à jour les informations' : 'Ajouter un occupant ou propriétaire'}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary-500" />
                                    Informations Personnelles
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Nom</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            placeholder="Ex: Benali"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Prénom</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            placeholder="Ex: Ahmed"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="exemple@email.com"
                                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Téléphone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                required
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="05 XX XX XX XX"
                                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            {/* Apartment Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Building className="h-4 w-4 text-primary-500" />
                                    Logement & Rôle
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Tour</label>
                                        <select
                                            value={formData.tower}
                                            onChange={(e) => setFormData({ ...formData, tower: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer"
                                        >
                                            <option value="A">Tour A</option>
                                            <option value="B">Tour B</option>
                                            <option value="C">Tour C</option>
                                            <option value="D">Tour D</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Étage</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={formData.floor}
                                            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                            placeholder="1-30"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Porte</label>
                                        <input
                                            type="text"
                                            value={formData.number}
                                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                            placeholder="Ex: 04"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Rôle</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all group ${formData.role === 'owner' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-500 hover:bg-primary-50'}`}>
                                            <span className="font-medium text-gray-700 group-hover:text-primary-700">Propriétaire</span>
                                            <input
                                                type="radio"
                                                name="role"
                                                className="text-primary-600 focus:ring-primary-500"
                                                checked={formData.role === 'owner'}
                                                onChange={() => setFormData({ ...formData, role: 'owner' })}
                                            />
                                        </label>
                                        <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all group ${formData.role === 'tenant' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-500 hover:bg-primary-50'}`}>
                                            <span className="font-medium text-gray-700 group-hover:text-primary-700">Locataire</span>
                                            <input
                                                type="radio"
                                                name="role"
                                                className="text-primary-600 focus:ring-primary-500"
                                                checked={formData.role === 'tenant'}
                                                onChange={() => setFormData({ ...formData, role: 'tenant' })}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all"
                                    disabled={isLoading}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {residentToEdit ? 'Mettre à jour' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
