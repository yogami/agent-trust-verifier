import { NextResponse } from 'next/server';
import { IssueCredential } from '@/application/usecases/IssueCredential';
import { CryptoService } from '@/infrastructure/services/CryptoService';
import { ZKCredentialIssuer, zkCredentialIssuer } from '@/infrastructure/services/ZKCredentialIssuer';

// Dependency Injection
const cryptoService = new CryptoService();
const issueCredentialUseCase = new IssueCredential(cryptoService);

/**
 * POST /api/vc/issue-zk
 * 
 * Issue a Verifiable Credential with optional ZK-SLA proof attachment.
 * 
 * Request Body:
 * {
 *   subjectDid: string;
 *   type: string[];
 *   data: {
 *     taskId: string;
 *     agentId: string;
 *     completedAt: string;
 *     slaDeadlineSeconds: number;
 *     outputHash: string;
 *     ... other fields
 *   };
 *   zkProof?: {
 *     enabled: boolean;
 *     biasScore?: number;
 *     biasThreshold?: number;
 *   };
 *   expiresIn?: string;
 * }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { subjectDid, data, type, expiresIn, zkProof: zkOptions } = body;

        if (!subjectDid || !data) {
            return NextResponse.json(
                { error: 'Missing subjectDid or data' },
                { status: 400 }
            );
        }

        // If ZK proof is requested, validate required fields
        if (zkOptions?.enabled) {
            const requiredFields = ['taskId', 'completedAt', 'slaDeadlineSeconds', 'outputHash'];
            for (const field of requiredFields) {
                if (!data[field]) {
                    return NextResponse.json(
                        { error: `ZK proof requires data.${field}` },
                        { status: 400 }
                    );
                }
            }

            // Generate ZK proof
            const zkProofResult = await zkCredentialIssuer.generateZKProof({
                taskId: data.taskId,
                completedAt: data.completedAt,
                slaDeadlineSeconds: data.slaDeadlineSeconds,
                biasScore: zkOptions.biasScore ?? 0,
                biasThreshold: zkOptions.biasThreshold ?? 5,
                outputHash: data.outputHash,
            });

            // If ZK proof fails (SLA breached or bias exceeded), reject
            if (!zkProofResult.verified) {
                return NextResponse.json(
                    { error: 'ZK-SLA proof failed: SLA breached or bias threshold exceeded' },
                    { status: 400 }
                );
            }

            // Issue standard VC first
            const vc = await issueCredentialUseCase.execute({
                subjectDid,
                data,
                type: type || [],
                expiresIn,
            });

            // Attach ZK proof to VC
            const zkAttestedVC = zkCredentialIssuer.attachZKProof(vc, zkProofResult);

            return NextResponse.json(zkAttestedVC);
        }

        // Standard VC issuance (no ZK proof)
        const vc = await issueCredentialUseCase.execute({
            subjectDid,
            data,
            type: type || [],
            expiresIn,
        });

        return NextResponse.json(vc);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
