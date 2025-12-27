import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin/config';

export async function GET(request: Request) {
    try {
        const adminDb = getAdminDb();

        if (!adminDb) {
            return NextResponse.json(
                { error: 'Firebase Admin not initialized' },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = adminDb.collection('documents').orderBy('createdAt', 'desc');

        if (category) {
            query = query.where('category', '==', category) as any;
        }

        query = query.limit(limit) as any;

        const snapshot = await query.get();
        const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({
            success: true,
            documents,
        });

    } catch (error: any) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
