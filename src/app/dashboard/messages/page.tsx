'use client';

import React, { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Loader2 } from 'lucide-react';

export default function AdminMessagesPage() {
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
        <div className="h-full">
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-6">Messagerie</h1>
            <ChatInterface currentUserRole="admin" currentUserId={userId} />
        </div>
    );
}
