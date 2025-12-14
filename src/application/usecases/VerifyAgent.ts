import { ITrustRepository } from '../../domain/interfaces/ITrustRepository';
import { ICredentialService } from '../../domain/interfaces/ICredentialService';
import { AgentIdentity } from '../../domain/entities/AgentIdentity';

export class VerifyAgent {
    constructor(
        private trustRepository: ITrustRepository,
        private credentialService: ICredentialService
    ) { }

    async execute(did: string): Promise<{ identity: AgentIdentity | null; isUnknown: boolean; verificationResult: any }> {
        // 1. Check if we already know this agent
        const existingIdentity = await this.trustRepository.getIdentity(did);

        // 2. Resolve DID to get latest document
        const resolution = await this.credentialService.resolveDid(did);

        if (!resolution) {
            return { identity: null, isUnknown: true, verificationResult: { valid: false, error: 'DID not found' } };
        }

        // 3. Logic to verify trust (simplified for MVP: valid DID = trusted enough to start)
        // In future, we would check VCs issued to this DID

        if (!existingIdentity) {
            // Auto-register new valid DIDs with 0 trust score
            const newIdentity: AgentIdentity = {
                did,
                publicKey: resolution.didDocument.verificationMethod[0]?.publicKeyJwk || '',
                domain: did.split(':')[2] || 'unknown',
                trustScore: 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await this.trustRepository.saveIdentity(newIdentity);
            return { identity: newIdentity, isUnknown: true, verificationResult: { valid: true } };
        }

        return { identity: existingIdentity, isUnknown: false, verificationResult: { valid: true } };
    }
}
