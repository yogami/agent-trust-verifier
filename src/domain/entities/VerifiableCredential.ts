export interface VerifiableCredential {
    id: string;
    type: string[];
    issuer: string;
    issuanceDate: string;
    expirationDate?: string;
    credentialSubject: Record<string, any>;
    proof?: {
        type: string;
        created: string;
        verificationMethod: string;
        proofPurpose: string;
        jws: string;
    };
}

export interface CredentialIssuanceRequest {
    subjectDid: string;
    type: string[];
    data: Record<string, any>;
    expiresIn?: string; // e.g., '1y', '30d'
}
