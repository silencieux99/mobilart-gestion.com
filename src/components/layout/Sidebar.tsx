'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/types';
import {
  Home,
  AlertCircle,
  FileText,
  Megaphone,
  FolderOpen,
  Calendar,
  Users,
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  User,
  Mail,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];
  badge?: number;
}

const navItems: NavItem[] = [
  {
    label: 'Tableau de bord',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Incidents',
    href: '/incidents',
    icon: AlertCircle,
  },
  {
    label: 'Factures',
    href: '/factures',
    icon: FileText,
    roles: [UserRole.RESIDENT, UserRole.SYNDIC, UserRole.SUPER_ADMIN, UserRole.COMPTABLE],
  },
  {
    label: 'Annonces',
    href: '/annonces',
    icon: Megaphone,
  },
  {
    label: 'Documents',
    href: '/documents',
    icon: FolderOpen,
  },
  {
    label: 'Réservations',
    href: '/reservations',
    icon: Calendar,
  },
];

const adminNavItems: NavItem[] = [
  {
    label: 'Résidents',
    href: '/residents',
    icon: Users,
    roles: [UserRole.SYNDIC, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Appartements',
    href: '/appartements',
    icon: Building2,
    roles: [UserRole.SYNDIC, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Facturation',
    href: '/facturation',
    icon: CreditCard,
    roles: [UserRole.SYNDIC, UserRole.SUPER_ADMIN, UserRole.COMPTABLE],
  },
  {
    label: 'Statistiques',
    href: '/statistiques',
    icon: BarChart3,
    roles: [UserRole.SYNDIC, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Paramètres',
    href: '/parametres',
    icon: Settings,
    roles: [UserRole.SUPER_ADMIN],
  },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, hasAnyRole, isStaff } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return hasAnyRole(item.roles);
  });

  const filteredAdminItems = adminNavItems.filter(item => {
    if (!item.roles) return true;
    return hasAnyRole(item.roles);
  });

  const getUserRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.SYNDIC]: 'Syndic',
      [UserRole.GARDIEN]: 'Gardien',
      [UserRole.TECHNICIEN]: 'Technicien',
      [UserRole.RESIDENT]: 'Résident',
      [UserRole.COMPTABLE]: 'Comptable',
    };
    return labels[role] || role;
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-secondary-900 text-white transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-secondary-800 px-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-lg font-display font-bold">Mobilart</span>
            </Link>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 hover:bg-secondary-800 rounded-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="border-b border-secondary-800 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-secondary-400">
                    {getUserRoleLabel(user.role)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {/* Main Navigation */}
            <div className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Admin Navigation */}
            {isStaff() && filteredAdminItems.length > 0 && (
              <>
                <div className="mt-6 mb-2">
                  <p className="px-3 text-xs font-semibold text-secondary-400 uppercase tracking-wider">
                    Administration
                  </p>
                </div>
                <div className="space-y-1">
                  {filteredAdminItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary-500 text-white'
                            : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="border-t border-secondary-800 p-4">
            <Link
              href="/profil"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-secondary-300 hover:bg-secondary-800 hover:text-white transition-colors"
            >
              <User className="h-5 w-5" />
              <span>Mon Profil</span>
            </Link>
            <button
              onClick={() => {/* TODO: Implement logout */}}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-secondary-300 hover:bg-secondary-800 hover:text-white transition-colors mt-1"
            >
              <LogOut className="h-5 w-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
