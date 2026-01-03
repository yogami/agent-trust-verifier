import { describe, it, expect, vi } from 'vitest';
import { IssueCredential } from '../../lib/trust-verifier/application/usecases/IssueCredential';
import { ICredentialService } from '../../lib/trust-verifier/domain/ports/ICredentialService';

describe('IssueCredential', () => {
    it('should issue a credential when request is valid', async () => {
        const mockCredentialService: ICredentialService = {
            resolveDid: vi.fn(),
            issueCredential: vi.fn().mockResolvedValue({
                id: 'vc-1',
                issuer: 'me',
                credentialSubject: { foo: 'bar' }
            }),
            verifyCredential: vi.fn(),
        };

        const useCase = new IssueCredential(mockCredentialService);

        const result = await useCase.execute({
            subjectDid: 'did:web:subject',
            type: ['TestCredential'],
            data: { foo: 'bar' }
        });

        expect(result.id).toBe('vc-1');
        expect(mockCredentialService.issueCredential).toHaveBeenCalled();
    });

    it('should throw if subjectDid is missing', async () => {
        const useCase = new IssueCredential({} as any);
        await expect(useCase.execute({} as any)).rejects.toThrow('Subject DID is required');
    });
});
