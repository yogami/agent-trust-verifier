import { VerifiableCredential, CredentialIssuanceRequest } from '../entities/VerifiableCredential';

export interface ICredentialService {
    issueCredential(request: CredentialIssuanceRequest): Promise<VerifiableCredential>;
    verifyCredential(credential: VerifiableCredential): Promise<{ valid: boolean; error?: string }>;
    resolveDid(did: string): Promise<{ didDocument: any } | null>;
}
