import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerifyAgent } from '../../application/usecases/VerifyAgent';
import { ITrustRepository } from '../../domain/interfaces/ITrustRepository';
import { ICredentialService } from '../../domain/interfaces/ICredentialService';

describe('VerifyAgent', () => {
    let verifyAgent: VerifyAgent;
    let mockTrustRepo: ITrustRepository;
    let mockCredentialService: ICredentialService;

    beforeEach(() => {
        mockTrustRepo = {
            getIdentity: vi.fn(),
            saveIdentity: vi.fn(),
            getAllIdentities: vi.fn(),
            updateTrustScore: vi.fn(),
        };
        mockCredentialService = {
            resolveDid: vi.fn(),
            issueCredential: vi.fn(),
            verifyCredential: vi.fn(),
        };
        verifyAgent = new VerifyAgent(mockTrustRepo, mockCredentialService);
    });

    it('should verify an existing agent', async () => {
        const did = 'did:web:existing';
        const existingIdentity = {
            did,
            publicKey: 'key-1',
            domain: 'existing',
            trustScore: 0.8,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        vi.mocked(mockTrustRepo.getIdentity).mockResolvedValue(existingIdentity);
        vi.mocked(mockCredentialService.resolveDid).mockResolvedValue({ didDocument: {} });

        const result = await verifyAgent.execute(did);

        expect(result.identity).toEqual(existingIdentity);
        expect(result.isUnknown).toBe(false);
        expect(result.verificationResult.valid).toBe(true);
    });

    it('should auto-register a new valid agent', async () => {
        const did = 'did:web:new-agent';

        vi.mocked(mockTrustRepo.getIdentity).mockResolvedValue(null);
        vi.mocked(mockCredentialService.resolveDid).mockResolvedValue({
            didDocument: { verificationMethod: [{ publicKeyJwk: 'pk' }] }
        });

        const result = await verifyAgent.execute(did);

        expect(result.identity?.did).toBe(did);
        expect(result.isUnknown).toBe(true);
        expect(mockTrustRepo.saveIdentity).toHaveBeenCalled();
    });

    it('should fail if DID cannot be resolved', async () => {
        const did = 'did:web:invalid';

        vi.mocked(mockTrustRepo.getIdentity).mockResolvedValue(null);
        vi.mocked(mockCredentialService.resolveDid).mockResolvedValue(null);

        const result = await verifyAgent.execute(did);

        expect(result.identity).toBeNull();
        expect(result.verificationResult.valid).toBe(false);
    });
});
