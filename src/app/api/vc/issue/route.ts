import { NextResponse } from 'next/server';
import { IssueCredential } from '@/application/usecases/IssueCredential';
import { CryptoService } from '@/infrastructure/services/CryptoService';

// Dependency Injection
const cryptoService = new CryptoService();
const issueCredentialUseCase = new IssueCredential(cryptoService);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { subjectDid, data, type, expiresIn } = body;

        if (!subjectDid || !data) {
            return NextResponse.json({ error: 'Missing subjectDid or data' }, { status: 400 });
        }

        const vc = await issueCredentialUseCase.execute({
            subjectDid,
            data,
            type: type || [],
            expiresIn
        });

        return NextResponse.json(vc);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
