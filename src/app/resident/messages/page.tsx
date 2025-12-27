'use client';

import React, { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Loader2 } from 'lucide-react';

export default function ResidentMessagesPage() {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) setUserId(user.uid);
        });
        return () => unsubscribe();
    }, []);

    if (!userId) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="h-full space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900">Messagerie</h1>
                    <p className="text-gray-500 text-sm">Contactez le syndic directement.</p>
                </div>
            </div>
            <ChatInterface currentUserRole="resident" currentUserId={userId} />
        </div>
    );
}
