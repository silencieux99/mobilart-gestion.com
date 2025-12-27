'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    Users,
    Plus,
    ChevronLeft,
    ChevronRight,
    Loader2,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';

const RESOURCES = [
    { id: 'salle_fetes', name: 'Salle des Fêtes', color: 'bg-purple-500' },
    { id: 'salle_reunion', name: 'Salle de Réunion', color: 'bg-blue-500' },
    { id: 'terrain_tennis', name: 'Terrain de Tennis', color: 'bg-emerald-500' },
];

export default function ReservationsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        resourceId: 'salle_fetes',
        startTime: '10:00',
        endTime: '12:00',
        user: ''
    });

    useEffect(() => {
        const q = query(collection(db, 'reservations'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate ? data.date.toDate() : new Date()
                };
            });
            setReservations(fetched);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    });

    const getDayReservations = (date: Date) => {
        return reservations.filter(res => isSameDay(res.date, date));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Veuillez remplir le titre');
            return;
        }

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'reservations'), {
                ...formData,
                date: Timestamp.fromDate(selectedDate),
                status: 'confirmed',
                createdAt: serverTimestamp()
            });
            toast.success('Réservation créée');
            setIsModalOpen(false);
            setFormData({ title: '', resourceId: 'salle_fetes', startTime: '10:00', endTime: '12:00', user: '' });
        } catch (error) {
            console.error('Error creating reservation:', error);
            toast.error('Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cette réservation ?')) return;
        try {
            await deleteDoc(doc(db, 'reservations', id));
            toast.success('Réservation supprimée');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
                    <p className="text-sm text-gray-500">Planning des espaces communs</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium"
                >
                    <Plus className="h-4 w-4" />
                    Nouvelle Réservation
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="font-semibold text-gray-900 capitalize">
                                {format(currentDate, 'MMMM yyyy', { locale: fr })}
                            </h2>
                            <div className="flex gap-1">
                                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg">
                                    <ChevronLeft className="h-4 w-4 text-gray-500" />
                                </button>
                                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg">
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 px-2 py-1 bg-primary-50 rounded-lg"
                        >
                            Aujourd'hui
                        </button>
                    </div>

                    <div className="p-4">
                        <div className="grid grid-cols-7 gap-px mb-2">
                            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                                <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {daysInMonth.map((date, idx) => {
                                const dayRes = getDayReservations(date);
                                const isSelected = isSameDay(date, selectedDate);
                                const style = idx === 0 ? { gridColumnStart: date.getDay() === 0 ? 7 : date.getDay() } : {};

                                return (
                                    <button
                                        key={date.toString()}
                                        style={style}
                                        onClick={() => setSelectedDate(date)}
                                        className={cn(
                                            "aspect-square rounded-lg p-1 flex flex-col items-center text-sm transition-all hover:bg-gray-50",
                                            isSelected ? "bg-primary-50 ring-2 ring-primary-500" : "",
                                            isToday(date) && !isSelected && "bg-gray-100 font-bold"
                                        )}
                                    >
                                        <span className={cn(
                                            "w-6 h-6 flex items-center justify-center rounded-full text-xs",
                                            isSelected ? "bg-primary-600 text-white" : "text-gray-700"
                                        )}>
                                            {format(date, 'd')}
                                        </span>
                                        <div className="flex gap-0.5 mt-1">
                                            {dayRes.slice(0, 3).map((res, i) => (
                                                <div key={i} className={cn("w-1 h-1 rounded-full", RESOURCES.find(r => r.id === res.resourceId)?.color || 'bg-gray-400')} />
                                            ))}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Day Details */}
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 capitalize flex items-center gap-2 text-sm">
                            <CalendarIcon className="h-4 w-4 text-primary-500" />
                            {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {getDayReservations(selectedDate).length} réservation(s)
                        </p>
                    </div>

                    <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                        {getDayReservations(selectedDate).length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-xs">Aucune réservation</p>
                            </div>
                        ) : (
                            getDayReservations(selectedDate).map((res) => {
                                const resource = RESOURCES.find(r => r.id === res.resourceId);
                                return (
                                    <div key={res.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white transition-all group">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white", resource?.color || 'bg-gray-500')}>
                                                {resource?.name || res.resourceId}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(res.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <h4 className="font-medium text-gray-900 text-sm">{res.title}</h4>
                                        {res.user && <p className="text-xs text-gray-500 mt-1">{res.user}</p>}
                                        <div className="flex items-center text-xs text-gray-400 mt-2">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {res.startTime} - {res.endTime}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900">Nouvelle Réservation</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Date sélectionnée</label>
                                    <p className="text-sm font-medium text-gray-900 capitalize">
                                        {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Titre</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ex: Anniversaire, Réunion..."
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Espace</label>
                                    <select
                                        value={formData.resourceId}
                                        onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500"
                                    >
                                        {RESOURCES.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Début</label>
                                        <input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Fin</label>
                                        <input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Réservé par</label>
                                    <input
                                        type="text"
                                        value={formData.user}
                                        onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                                        placeholder="Nom du résident"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-500 flex items-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                        Créer
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
