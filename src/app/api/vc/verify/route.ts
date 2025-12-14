import { NextResponse } from 'next/server';
import { CryptoService } from '@/infrastructure/services/CryptoService';

// Dependency Injection
const cryptoService = new CryptoService();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { credential } = body;

        if (!credential) {
            return NextResponse.json({ error: 'Missing credential' }, { status: 400 });
        }

        const result = await cryptoService.verifyCredential(credential);

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
