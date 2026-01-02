import { NextResponse } from 'next/server';
import { CryptoService } from '@/infrastructure/services/CryptoService';
import { zkCredentialIssuer } from '@/infrastructure/services/ZKCredentialIssuer';

// Dependency Injection
const cryptoService = new CryptoService();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { credential } = body;

        if (!credential) {
            return NextResponse.json({ error: 'Missing credential' }, { status: 400 });
        }

        // Verify standard JWS proof
        const jwsResult = await cryptoService.verifyCredential(credential);

        // If credential has ZK proof, verify that too
        let zkVerified: boolean | undefined;
        if (credential.zkProof) {
            zkVerified = await zkCredentialIssuer.verifyZKProof(credential.zkProof);
        }

        return NextResponse.json({
            valid: jwsResult.valid,
            zkVerified,
            error: jwsResult.error,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
