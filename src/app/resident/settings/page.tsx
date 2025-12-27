'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Shield, User, LogOut, Save, Loader2, Check } from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ResidentSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    // Profile form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    // Password form
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData(data);
                        setFirstName(data.firstName || '');
                        setLastName(data.lastName || '');
                        setPhone(data.phone || '');
                    }
                } catch (error) {
                    console.error('Error fetching user:', error);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSaveProfile = async () => {
        if (!auth.currentUser) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                firstName,
                lastName,
                phone
            });
            toast.success('Profil mis à jour');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!auth.currentUser || !auth.currentUser.email) return;
        if (newPassword !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setChangingPassword(true);
        try {
            // Re-authenticate
            const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);

            // Update password
            await updatePassword(auth.currentUser, newPassword);

            toast.success('Mot de passe modifié');
            setShowPasswordForm(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            if (error.code === 'auth/wrong-password') {
                toast.error('Mot de passe actuel incorrect');
            } else {
                toast.error('Erreur lors du changement de mot de passe');
            }
        } finally {
            setChangingPassword(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success('Déconnexion réussie');
            router.push('/');
        } catch (error) {
            toast.error('Erreur lors de la déconnexion');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Paramètres</h1>
                <p className="text-sm text-gray-500">Gérez votre compte</p>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm text-gray-900">Profil</span>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Prénom</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Nom</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Email</label>
                        <input
                            type="email"
                            value={userData?.email || ''}
                            disabled
                            className="w-full px-3 py-2 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-500"
                        />
                    </div>
                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Enregistrer
                    </button>
                </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm text-gray-900">Sécurité</span>
                </div>
                <div className="p-4">
                    {!showPasswordForm ? (
                        <button
                            onClick={() => setShowPasswordForm(true)}
                            className="text-primary-600 text-sm font-medium hover:underline"
                        >
                            Changer le mot de passe
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Mot de passe actuel</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Confirmer</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleChangePassword}
                                    disabled={changingPassword}
                                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 flex items-center gap-2"
                                >
                                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    Confirmer
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }}
                                    className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
                <LogOut className="h-4 w-4" />
                Se déconnecter
            </button>
        </div>
    );
}
