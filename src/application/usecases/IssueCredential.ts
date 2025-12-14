import { ICredentialService } from '../../domain/interfaces/ICredentialService';
import { CredentialIssuanceRequest, VerifiableCredential } from '../../domain/entities/VerifiableCredential';

export class IssueCredential {
    constructor(
        private credentialService: ICredentialService
    ) { }

    async execute(request: CredentialIssuanceRequest): Promise<VerifiableCredential> {
        // 1. Validate request (basic)
        if (!request.subjectDid) {
            throw new Error('Subject DID is required');
        }

        // 2. Issue VC via service
        return this.credentialService.issueCredential(request);
    }
}
