import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getAdminDb } from '@/lib/firebase-admin/config';

export async function POST(request: Request) {
    try {
        const adminDb = getAdminDb();

        if (!adminDb) {
            return NextResponse.json(
                { error: 'Firebase Admin not initialized' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const isPublic = formData.get('isPublic') === 'true';
        const uploadedById = formData.get('uploadedById') as string;
        const uploadedByName = formData.get('uploadedByName') as string;
        const residenceId = formData.get('residenceId') as string || 'default-residence';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
            addRandomSuffix: true,
        });

        // Create document record in Firestore
        const documentData = {
            residenceId,
            uploadedById: uploadedById || 'admin',
            uploadedByName: uploadedByName || 'Admin',
            title: title || file.name,
            description: description || '',
            category: category || 'autre',
            fileUrl: blob.url,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            isPublic,
            accessRoles: ['admin', 'syndic', 'resident'],
            tags: [],
            downloadCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = await adminDb.collection('documents').add(documentData);

        return NextResponse.json({
            success: true,
            document: {
                id: docRef.id,
                ...documentData,
            },
            blob,
        });

    } catch (error: any) {
        console.error('Error uploading document:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
