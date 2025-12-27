'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Clock,
    AlertCircle,
    CheckCircle2,
    Calendar,
    MapPin,
    Camera,
    X,
    Loader2,
    Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import { IncidentCategory, IncidentPriority } from '@/types';

export default function ResidentIncidentsPage() {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'autre',
        location: '',
        description: '',
        priority: 'moyenne' // Default for resident, maybe hidden or simplified
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const q = query(
                    collection(db, 'incidents'),
                    where('reporterId', '==', currentUser.uid),
                    orderBy('createdAt', 'desc')
                );

                const unsubscribeData = onSnapshot(q, (snapshot) => {
                    const fetchedIncidents = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setIncidents(fetchedIncidents);
                    setLoading(false);
                });
                return () => unsubscribeData();
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (!user) return;

            await addDoc(collection(db, 'incidents'), {
                ...formData,
                reporterId: user.uid,
                reporterName: user.displayName || 'Résident', // Fetch real name if possible from user doc
                status: 'nouveau',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                images: [] // TODO: Image upload
            });

            toast.success("Incident signalé avec succès");
            setIsModalOpen(false);
            setFormData({ title: '', category: 'autre', location: '', description: '', priority: 'moyenne' });
        } catch (error) {
            console.error("Error creating incident:", error);
            toast.error("Erreur, veuillez réessayer.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900">
                        Mes Signalements
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Suivez l'état de vos demandes et signalez de nouveaux problèmes.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all w-full sm:w-auto"
                >
                    <Plus className="h-5 w-5" />
                    <span>Signaler un problème</span>
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {incidents.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Tout va bien !</h3>
                        <p className="text-gray-500">Vous n'avez aucun incident en cours.</p>
                    </div>
                ) : (
                    incidents.map((incident, index) => (
                        <motion.div
                            key={incident.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-xl",
                                        incident.category === 'plomberie' ? "bg-blue-100 text-blue-600" :
                                            incident.category === 'electricite' ? "bg-yellow-100 text-yellow-600" :
                                                "bg-gray-100 text-gray-600"
                                    )}>
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{incident.title}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                            <MapPin className="h-3 w-3" /> {incident.location}
                                        </p>
                                    </div>
                                </div>
                                <StatusBadge status={incident.status} />
                            </div>

                            <p className="text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                {incident.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                                <span className="flex items-center">
                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                    {incident.createdAt?.toDate ? incident.createdAt.toDate().toLocaleDateString() : 'Récemment'}
                                </span>
                                <span className="font-medium uppercase tracking-wider text-gray-500">
                                    {incident.category}
                                </span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Signaler un Incident</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Titre</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Ex: Fuite d'eau cuisine"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Catégorie</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        >
                                            <option value="autre">Autre</option>
                                            <option value="plomberie">Plomberie</option>
                                            <option value="electricite">Électricité</option>
                                            <option value="ascenseur">Ascenseur</option>
                                            <option value="nettoyage">Nettoyage</option>
                                            <option value="parking">Parking</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Lieu précis</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="Ex: 2ème étage, couloir gauche"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Décrivez le problème en détail..."
                                            rows={4}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Camera className="h-5 w-5" />
                                            <span>Ajouter une photo (Optionnel)</span>
                                        </button>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
                                        >
                                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            Envoyer le signalement
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        nouveau: "bg-blue-100 text-blue-700",
        en_cours: "bg-amber-100 text-amber-700",
        resolu: "bg-emerald-100 text-emerald-700",
        ferme: "bg-gray-100 text-gray-700",
        annule: "bg-red-100 text-red-700",
    };

    const labels: Record<string, string> = {
        nouveau: "Reçu",
        en_cours: "En cours",
        resolu: "Résolu",
        ferme: "Fermé",
        annule: "Annulé",
    };

    return (
        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide", styles[status] || "bg-gray-100")}>
            {labels[status] || status}
        </span>
    );
}
