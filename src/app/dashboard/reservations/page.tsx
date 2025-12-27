'use client';

import React, { useState } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Users,
    Plus,
    ChevronLeft,
    ChevronRight,
    Filter,
    CheckCircle2,
    XCircle,
    MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

// Mock Data
const RESOURCES = [
    { id: 1, name: 'Salle des Fêtes', capacity: 200, color: 'bg-purple-500' },
    { id: 2, name: 'Salle de Réunion', capacity: 20, color: 'bg-blue-500' },
    { id: 3, name: 'Terrain de Tennis', capacity: 4, color: 'bg-emerald-500' },
];

const RESERVATIONS = [
    {
        id: 1,
        resourceId: 1,
        title: "Anniversaire Mme. Saidi",
        user: "Famille Saidi (A-12-04)",
        date: new Date(2024, 5, 25), // June 25, 2024
        startTime: "14:00",
        endTime: "22:00",
        status: "confirmed",
        guests: 80
    },
    {
        id: 2,
        resourceId: 2,
        title: "Réunion Syndic",
        user: "Administration",
        date: new Date(2024, 5, 26),
        startTime: "10:00",
        endTime: "12:00",
        status: "confirmed",
        guests: 12
    },
    {
        id: 3,
        resourceId: 3,
        title: "Match Tennis",
        user: "Karim M.",
        date: new Date(2024, 5, 25),
        startTime: "18:00",
        endTime: "19:30",
        status: "pending",
        guests: 2
    }
];

export default function ReservationsPage() {
    const [currentDate, setCurrentDate] = useState(new Date(2024, 5, 25)); // Mocking current date to match data
    const [selectedDate, setSelectedDate] = useState(new Date(2024, 5, 25));
    const [view, setView] = useState<'calendar' | 'list'>('calendar');

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const getDayReservations = (date: Date) => {
        return RESERVATIONS.filter(res => isSameDay(res.date, date));
    };

    return (
        <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
                        Réservations
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Planning des espaces communs (Salle des fêtes, Réunions...)
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-gray-100 p-1 rounded-xl flex items-center">
                        <button
                            onClick={() => setView('calendar')}
                            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", view === 'calendar' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                        >
                            Calendrier
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", view === 'list' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                        >
                            Liste
                        </button>
                    </div>
                    <button className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all">
                        <Plus className="h-5 w-5" />
                        <span className="hidden sm:inline">Nouvelle Réservation</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-8 min-h-0">
                {/* Calendar Section */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">

                    {/* Calendar Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-900 capitalize">
                                {format(currentDate, 'MMMM yyyy', { locale: fr })}
                            </h2>
                            <div className="flex gap-1">
                                <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const now = new Date();
                                setCurrentDate(now);
                                setSelectedDate(now);
                            }}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 bg-primary-50 rounded-lg transition-colors"
                        >
                            Aujourd'hui
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="grid grid-cols-7 gap-px mb-2">
                            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                                <div key={day} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {daysInMonth.map((date, idx) => {
                                const dayRes = getDayReservations(date);
                                const isSelected = isSameDay(date, selectedDate);
                                const isCurrentDay = isToday(date);

                                // Adjust start column for first day of month
                                const style = idx === 0 ? { gridColumnStart: date.getDay() === 0 ? 7 : date.getDay() } : {};

                                return (
                                    <button
                                        key={date.toString()}
                                        style={style}
                                        onClick={() => setSelectedDate(date)}
                                        className={cn(
                                            "aspect-square rounded-xl p-2 relative flex flex-col items-center transition-all hover:bg-gray-50",
                                            isSelected ? "bg-primary-50 ring-2 ring-primary-500 ring-offset-2" : "border border-transparent",
                                            isCurrentDay && !isSelected && "bg-gray-50 font-bold text-primary-600"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                                            isSelected ? "bg-primary-600 text-white" : "text-gray-700"
                                        )}>
                                            {format(date, 'd')}
                                        </span>

                                        {/* Dots for reservations */}
                                        <div className="flex gap-1 mt-auto">
                                            {dayRes.map((res, i) => (
                                                <div
                                                    key={i}
                                                    className={cn("w-1.5 h-1.5 rounded-full", RESOURCES.find(r => r.id === res.resourceId)?.color)}
                                                />
                                            ))}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Details for Selected Date */}
                <div className="w-96 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 capitalize flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-primary-500" />
                            {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {getDayReservations(selectedDate).length} réservation(s) prévue(s)
                        </p>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {getDayReservations(selectedDate).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                                <CalendarIcon className="h-12 w-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">Aucune réservation</p>
                                <p className="text-xs mt-1">Aucun événement prévu pour cette date.</p>
                            </div>
                        ) : (
                            getDayReservations(selectedDate).map((res) => {
                                const resource = RESOURCES.find(r => r.id === res.resourceId);
                                return (
                                    <motion.div
                                        key={res.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white", resource?.color)}>
                                                {resource?.name}
                                            </span>
                                            <span className={cn(
                                                "h-2 w-2 rounded-full",
                                                res.status === 'confirmed' ? "bg-emerald-500" : "bg-amber-500"
                                            )} />
                                        </div>

                                        <h4 className="font-bold text-gray-900 mb-1">{res.title}</h4>
                                        <p className="text-sm text-gray-600 flex items-center mb-3">
                                            <Users className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                            {res.user}
                                        </p>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                            <div className="flex items-center text-xs text-gray-500 font-medium">
                                                <Clock className="h-3.5 w-3.5 mr-1.5" />
                                                {res.startTime} - {res.endTime}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1 hover:bg-gray-200 rounded text-gray-500"><MoreVertical className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
