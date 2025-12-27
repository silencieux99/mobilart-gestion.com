'use client';

import React from 'react';
import Link from 'next/link';
import { formatRelativeDate, getStatusColor, getStatusIcon } from '@/lib/utils';
import { Incident, IncidentStatus, IncidentPriority } from '@/types';
import {
  Clock,
  MapPin,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
} from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  showActions?: boolean;
  onStatusChange?: (status: IncidentStatus) => void;
}

export function IncidentCard({ incident, showActions = false, onStatusChange }: IncidentCardProps) {
  const getPriorityIcon = (priority: IncidentPriority) => {
    switch (priority) {
      case IncidentPriority.URGENTE:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case IncidentPriority.HAUTE:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case IncidentPriority.MOYENNE:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case IncidentPriority.BASSE:
        return <AlertCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    const statusConfig = {
      [IncidentStatus.NOUVEAU]: { label: 'Nouveau', color: 'bg-blue-100 text-blue-800' },
      [IncidentStatus.EN_COURS]: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
      [IncidentStatus.EN_ATTENTE]: { label: 'En attente', color: 'bg-orange-100 text-orange-800' },
      [IncidentStatus.RESOLU]: { label: 'Résolu', color: 'bg-green-100 text-green-800' },
      [IncidentStatus.FERME]: { label: 'Fermé', color: 'bg-gray-100 text-gray-800' },
      [IncidentStatus.ANNULE]: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 font-mono">#{incident.id}</span>
              {getStatusBadge(incident.status)}
              {getPriorityIcon(incident.priority)}
            </div>
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
              {incident.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {incident.description}
        </p>

        {/* Metadata */}
        <div className="space-y-2 mb-3">
          {incident.location && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>
                {incident.tower && `Tour ${incident.tower}`}
                {incident.floor && ` - Étage ${incident.floor}`}
                {incident.location && ` - ${incident.location}`}
              </span>
            </div>
          )}

          {incident.assignedToName && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User className="h-4 w-4" />
              <span>Assigné à {incident.assignedToName}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{formatRelativeDate(incident.createdAt)}</span>
          </div>
        </div>

        {/* Images preview */}
        {incident.images && incident.images.length > 0 && (
          <div className="flex gap-2 mb-3">
            {incident.images.slice(0, 3).map((image, index) => (
              <div
                key={index}
                className="h-12 w-12 rounded-md bg-gray-100 overflow-hidden"
              >
                <img
                  src={image}
                  alt={`Photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            {incident.images.length > 3 && (
              <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                +{incident.images.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Comments count */}
        {incident.comments && incident.comments.length > 0 && (
          <div className="text-sm text-gray-500 mb-3">
            💬 {incident.comments.length} commentaire{incident.comments.length > 1 ? 's' : ''}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Link
            href={`/incidents/${incident.id}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            Voir détails
            <ChevronRight className="h-4 w-4" />
          </Link>

          {showActions && onStatusChange && (
            <div className="flex gap-2">
              {incident.status === IncidentStatus.EN_COURS && (
                <button
                  onClick={() => onStatusChange(IncidentStatus.RESOLU)}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="Marquer comme résolu"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
              {incident.status === IncidentStatus.NOUVEAU && (
                <button
                  onClick={() => onStatusChange(IncidentStatus.EN_COURS)}
                  className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                  title="Prendre en charge"
                >
                  <Clock className="h-4 w-4" />
                </button>
              )}
              {incident.status !== IncidentStatus.ANNULE && incident.status !== IncidentStatus.FERME && (
                <button
                  onClick={() => onStatusChange(IncidentStatus.ANNULE)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Annuler"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
