import { describe, it, expect } from 'vitest';
import { VerifyAgent } from '../../src/lib/trust-verifier/application/usecases/VerifyAgent';
import { ITrustRepository } from '../../src/lib/trust-verifier/domain/ports/ITrustRepository';
import { ICredentialService } from '../../src/lib/trust-verifier/domain/ports/ICredentialService';

describe('Trust Verifier Characterization', () => {
    it('should auto-register unknown but valid DIDs with zero trust score', async () => {
        // 1. Setup Mocks
        const agents: any[] = [];

        const mockRepo: ITrustRepository = {
            getIdentity: async (did) => agents.find(a => a.did === did) || null,
            saveIdentity: async (identity) => {
                agents.push(identity);
                return identity;
            },
            updateTrustScore: async (did, score) => {
                const a = agents.find(x => x.did === did);
                if (a) a.trustScore = score;
                return a || null;
            }
        };

        const mockService: ICredentialService = {
            resolveDid: async (did) => {
                if (did.startsWith('did:web:valid')) {
                    return {
                        didDocument: {
                            id: did,
                            verificationMethod: [{ publicKeyJwk: { kty: 'OKP', crv: 'Ed25519', x: 'abc' } }]
                        },
                        didDocumentMetadata: {}
                    };
                }
                return null;
            },
            verifyCredential: async () => ({ valid: true }),
            issueCredential: async () => ({} as any)
        };

        const useCase = new VerifyAgent(mockRepo, mockService);

        // 2. Execute with new DID
        const result = await useCase.execute('did:web:valid-agent');

        // 3. Verify Auto-Registration Logic
        expect(result.isUnknown).toBe(true);
        expect(result.identity).not.toBeNull();
        expect(result.identity?.trustScore).toBe(0);
        expect(result.verificationResult.valid).toBe(true);

        // 4. Verify Persistence
        expect(agents).toHaveLength(1);
        expect(agents[0].did).toBe('did:web:valid-agent');

        // 5. Execute Again (Should be known now)
        const result2 = await useCase.execute('did:web:valid-agent');
        expect(result2.isUnknown).toBe(false);
    });
});
