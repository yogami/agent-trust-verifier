import { NextResponse } from 'next/server';
import { VerifyAgent } from '@/application/usecases/VerifyAgent';
import { TemboTrustRepository } from '@/infrastructure/repositories/TemboTrustRepository';
import { CryptoService } from '@/infrastructure/services/CryptoService';

// Dependency Injection
const trustRepo = new TemboTrustRepository();
const cryptoService = new CryptoService();
const verifyAgentUseCase = new VerifyAgent(trustRepo, cryptoService);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { did } = body;

        if (!did) {
            return NextResponse.json({ error: 'Missing DID' }, { status: 400 });
        }

        const result = await verifyAgentUseCase.execute(did);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
