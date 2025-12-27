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
      await AuthService.signIn(email, password);
      // Redirection vers le dashboard après succès
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Une erreur est survenue lors de la connexion');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans">
      {/* Immersive Background HD */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/tours.png"
          alt="Tours Mobilart - Résidence Oran"
          fill
          priority
          className="object-cover scale-105"
          quality={100}
          sizes="100vw"
        />
        {/* Gradient Overlay moderne */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 via-black/50 to-slate-900/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.15),transparent_50%)]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen items-end sm:items-center justify-center p-4 sm:p-6 lg:p-8 pb-8 sm:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Glass Card Premium - Compact sur mobile */}
          <div className="backdrop-blur-2xl bg-white/5 border border-white/20 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/10">
            <div className="p-6 sm:p-10">
              {/* Header - Compact sur mobile */}
              <div className="text-center mb-6 sm:mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                  className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-primary-500/90 flex items-center justify-center shadow-lg mb-4 sm:mb-6"
                >
                  <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1 sm:mb-2 tracking-tight drop-shadow-lg">
                  Mobilart Gestion
                </h1>
                <p className="text-primary-100/90 text-base sm:text-lg font-medium">
                  Espace Résident
                </p>
                <p className="text-white/60 text-xs sm:text-sm mt-1 sm:mt-2">
                  Résidence Mobilart • Oran, Algérie
                </p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center space-x-3 text-red-200">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Form - Compact sur mobile */}
              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
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
                      className="block w-full pl-12 pr-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 transition-all font-medium text-base"
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
                      className="block w-full pl-12 pr-12 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 transition-all font-medium text-base"
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

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-offset-0 focus:ring-primary-500/50 transition-colors"
                    />
                    <span className="text-white/70 group-hover:text-white transition-colors">Se souvenir</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-primary-300 hover:text-white transition-colors font-medium"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-400 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-primary-900/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Card Footer - Compact sur mobile */}
            <div className="px-6 py-4 sm:px-8 sm:py-6 bg-white/5 border-t border-white/10 text-center">
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-white/60 text-xs sm:text-sm">
                  Vous n'avez pas de compte ?{' '}
                  <Link href="/inscription" className="text-white font-semibold hover:underline decoration-primary-400 decoration-2 underline-offset-4 transition-all">
                    S'inscrire
                  </Link>
                </p>
                <p className="text-white/60 text-xs sm:text-sm">
                  Besoin d'aide ?{' '}
                  <a href="mailto:contact@mobilart-gestion.com" className="text-primary-300 font-semibold hover:underline decoration-primary-400 decoration-2 underline-offset-4 transition-all">
                    Contactez le syndic
                  </a>
                </p>
              </div>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-white/40 text-[10px] sm:text-xs mt-4 sm:mt-8 px-4"
          >
            © 2025 Mobilart Gestion • Résidence Mobilart, Oran, Algérie • Tous droits réservés.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
