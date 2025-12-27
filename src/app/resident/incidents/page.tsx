'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Clock, AlertCircle, CheckCircle2, MapPin, Camera, X, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';

export default function ResidentIncidentsPage() {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: '',
        category: 'autre',
        location: '',
        description: ''
    });
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Get user data for name
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }

                const q = query(
                    collection(db, 'incidents'),
                    where('reporterId', '==', currentUser.uid),
                    orderBy('createdAt', 'desc')
                );

                const unsubscribeData = onSnapshot(q, (snapshot) => {
                    setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    setLoading(false);
                });
                return () => unsubscribeData();
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image trop lourde (max 5MB)');
            return;
        }

        setUploading(true);
        try {
            const filename = `incidents/${Date.now()}_${file.name}`;
            const response = await fetch(`/api/upload/chat?filename=${encodeURIComponent(filename)}`, {
                method: 'POST',
                body: file
            });
            if (!response.ok) throw new Error('Upload failed');
            const blob = await response.json();
            setImages(prev => [...prev, blob.url]);
        } catch (error) {
            toast.error("Erreur d'upload");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !formData.title.trim()) return;

        setSubmitting(true);
        try {
            const reporterName = userData?.firstName && userData?.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : 'Résident';

            await addDoc(collection(db, 'incidents'), {
                title: formData.title.trim(),
                category: formData.category,
                location: formData.location.trim(),
                description: formData.description.trim(),
                priority: 'moyenne',
                reporterId: user.uid,
                reporterName,
                status: 'nouveau',
                images,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            toast.success("Signalement envoyé");
            setIsModalOpen(false);
            setFormData({ title: '', category: 'autre', location: '', description: '' });
            setImages([]);
        } catch (error) {
            toast.error("Erreur, réessayez");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Signalements</h1>
                    <p className="text-xs text-gray-500">{incidents.length} demande(s)</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 bg-primary-600 text-white px-3 py-2 rounded-xl text-sm font-medium"
                >
                    <Plus className="h-4 w-4" />
                    <span>Signaler</span>
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {incidents.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                        <CheckCircle2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Aucun signalement</p>
                    </div>
                ) : (
                    incidents.map((incident, i) => (
                        <motion.div
                            key={incident.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="bg-white p-3 rounded-xl border border-gray-100"
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className={cn("p-1.5 rounded-lg shrink-0",
                                        incident.category === 'plomberie' ? "bg-blue-100 text-blue-600" :
                                            incident.category === 'electricite' ? "bg-yellow-100 text-yellow-600" :
                                                "bg-gray-100 text-gray-600"
                                    )}>
                                        <AlertCircle className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">{incident.title}</h3>
                                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <MapPin className="h-2.5 w-2.5" /> {incident.location || 'Non précisé'}
                                        </p>
                                    </div>
                                </div>
                                <StatusBadge status={incident.status} />
                            </div>
                            {incident.description && (
                                <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 mb-2 line-clamp-2">
                                    {incident.description}
                                </p>
                            )}
                            {incident.images?.length > 0 && (
                                <div className="flex gap-1 mb-2 overflow-x-auto">
                                    {incident.images.slice(0, 3).map((img: string, idx: number) => (
                                        <img key={idx} src={img} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {incident.createdAt?.toDate?.().toLocaleDateString() || 'Récent'}
                                </span>
                                <span className="uppercase font-medium">{incident.category}</span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal - Mobile optimized */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                                <h3 className="text-sm font-semibold text-gray-900">Signaler un problème</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
                                <div>
                                    <label className="text-[11px] text-gray-500 mb-1 block">Titre *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ex: Fuite d'eau"
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] text-gray-500 mb-1 block">Catégorie</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary-500"
                                        >
                                            <option value="autre">Autre</option>
                                            <option value="plomberie">Plomberie</option>
                                            <option value="electricite">Électricité</option>
                                            <option value="ascenseur">Ascenseur</option>
                                            <option value="nettoyage">Nettoyage</option>
                                            <option value="parking">Parking</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-gray-500 mb-1 block">Lieu</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="Ex: Hall A"
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] text-gray-500 mb-1 block">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Détails du problème..."
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary-500 resize-none"
                                    />
                                </div>

                                {/* Images */}
                                <div>
                                    <label className="text-[11px] text-gray-500 mb-1 block">Photos (optionnel)</label>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

                                    <div className="flex gap-2 flex-wrap">
                                        {images.map((img, i) => (
                                            <div key={i} className="relative">
                                                <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {images.length < 3 && (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="h-16 w-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-500"
                                            >
                                                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={submitting || !formData.title.trim()}
                                    className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    Envoyer
                                </button>
                            </form>
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
        ferme: "bg-gray-100 text-gray-600",
    };
    const labels: Record<string, string> = {
        nouveau: "Reçu",
        en_cours: "En cours",
        resolu: "Résolu",
        ferme: "Fermé",
    };

    return (
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0", styles[status] || "bg-gray-100")}>
            {labels[status] || status}
        </span>
    );
}
