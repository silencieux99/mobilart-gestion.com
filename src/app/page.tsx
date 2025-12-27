'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  AlertCircle
} from 'lucide-react';
import { AuthService } from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await AuthService.signIn(email, password);
      
      // Récupérer le rôle de l'utilisateur depuis Firestore
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      // Redirection selon le rôle
      if (userData?.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/resident');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Une erreur est survenue lors de la connexion');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans">
      {/* Immersive Background HD */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/tours.png"
          alt="Tours Mobilart - Résidence Oran"
          fill
          priority
          className="object-cover"
          quality={100}
          sizes="100vw"
        />
        {/* Gradient Overlay léger pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {/* Content Container - Responsive pour clavier mobile */}
      <div className="relative z-10 min-h-screen flex items-end sm:items-center justify-center p-4 sm:p-6 lg:p-8 pb-safe">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Glass Card Ultra Compact Mobile */}
          <div className="backdrop-blur-xl bg-black/30 border border-white/10 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
            <div className="p-5 sm:p-10">
              {/* Header Ultra Compact */}
              <div className="text-center mb-4 sm:mb-8">
                <h1 className="text-xl sm:text-3xl font-display font-bold text-white mb-1 sm:mb-2 tracking-tight">
                  Mobilart Gestion
                </h1>
                <p className="text-white/70 text-sm sm:text-lg">
                  Espace Résident
                </p>
              </div>

              {/* Error Message Compact */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 sm:mb-6 overflow-hidden"
                  >
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center space-x-2 text-red-200">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <p className="text-xs sm:text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Form Ultra Compact */}
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-6">
                <div className="space-y-2.5 sm:space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-white/50 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Email"
                      className="block w-full pl-12 pr-4 py-2.5 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/20 transition-all text-base"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-white/50 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Mot de passe"
                      className="block w-full pl-12 pr-12 py-2.5 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/20 transition-all text-base"
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Link
                  href="/forgot-password"
                  className="block text-center text-xs sm:text-sm text-primary-300 hover:text-white transition-colors"
                >
                  Mot de passe oublié ?
                </Link>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-400 text-white py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-lg shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Se connecter</span>
                  )}
                </button>
              </form>
            </div>

            {/* Card Footer Ultra Compact */}
            <div className="px-5 py-3 sm:px-8 sm:py-6 bg-white/5 border-t border-white/10 text-center">
              <p className="text-white/60 text-[11px] sm:text-sm">
                Pas de compte ? 
                <Link href="/inscription" className="text-white font-medium hover:underline ml-1">
                  S'inscrire
                </Link>
                <span className="mx-2">•</span>
                <a href="mailto:contact@mobilart-gestion.com" className="text-primary-300 font-medium hover:underline">
                  Contact
                </a>
              </p>
            </div>
          </div>

          {/* Copyright Mobile Only - Hidden on Desktop */}
          <p className="text-center text-white/30 text-[10px] mt-3 sm:hidden">
            © 2025 Mobilart Gestion
          </p>
        </motion.div>
      </div>
    </div>
  );
}
