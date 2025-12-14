import { SignJWT, importPKCS8, generateKeyPair, exportJWK } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { ICredentialService } from '../../domain/interfaces/ICredentialService';
import { VerifiableCredential, CredentialIssuanceRequest } from '../../domain/entities/VerifiableCredential';

export class CryptoService implements ICredentialService {
    private privateKey: string;

    constructor() {
        this.privateKey = process.env.DID_PRIVATE_KEY || '';
        if (!this.privateKey) {
            console.warn('DID_PRIVATE_KEY is missing. Signing will fail.');
        }
    }

    async issueCredential(request: CredentialIssuanceRequest): Promise<VerifiableCredential> {
        if (!this.privateKey) throw new Error('Cannot issue VC: Private key missing');

        // Import private key
        // NOTE: In a real system, we'd handle key management more securely
        // Assuming the private key is a hex string or PEM. For simplicity using a generated secret for HS256 or similar for now?
        // Actually, let's use a proper key pair if possible, or just a secret for HMAC signature for MVP speed.
        // User requested "production-ready" but also "MVP".
        // Let's use a secret key for HS256 signatures for simplicity in this MVP, 
        // or if we want asymmetric, we need a PEM. 
        // The previous step generated a hex string. Let's treat it as a secret for HS256.

        const secret = new TextEncoder().encode(this.privateKey);
        const alg = 'HS256';

        const jwt = await new SignJWT(request.data)
            .setProtectedHeader({ alg })
            .setIssuedAt()
            .setIssuer('did:web:trust-verifier')
            .setSubject(request.subjectDid)
            .setExpirationTime(request.expiresIn || '1y')
            .setJti(uuidv4())
            .sign(secret);

        const vc: VerifiableCredential = {
            id: uuidv4(), // JTI is better but using UUID for the wrapper
            type: ['VerifiableCredential', ...request.type],
            issuer: 'did:web:trust-verifier',
            issuanceDate: new Date().toISOString(),
            credentialSubject: request.data,
            proof: {
                type: 'JwtProof2020',
                created: new Date().toISOString(),
                verificationMethod: 'did:web:trust-verifier#key-1',
                proofPurpose: 'assertionMethod',
                jws: jwt
            }
        };

        return vc;
    }

    async verifyCredential(credential: VerifiableCredential): Promise<{ valid: boolean; error?: string }> {
        if (!credential.proof?.jws) {
            return { valid: false, error: 'No JWS proof found' };
        }

        // For this MVP, we verify our OWN credentials (HS256)
        // Real DID resolution would let us verify others' signatures (RS256/ES256) using their public keys.
        const secret = new TextEncoder().encode(this.privateKey);
        const jwt = credential.proof.jws;

        try {
            // Basic verification of the JWT signature
            // Implementation detail: we'd need 'jose' jwtVerify here
            const { jwtVerify } = await import('jose');
            await jwtVerify(jwt, secret);
            return { valid: true };
        } catch (e: any) {
            return { valid: false, error: e.message };
        }
    }

    async resolveDid(did: string): Promise<{ didDocument: any } | null> {
        // Mock DID resolution for MVP
        // In production, fetch .well-known/did.json from the domain
        const domain = did.split(':')[2];

        return {
            didDocument: {
                id: did,
                verificationMethod: [{
                    id: `${did}#key-1`,
                    type: 'JsonWebKey2020',
                    controller: did,
                    publicKeyJwk: {
                        kty: 'RSA', // Mock
                        n: 'mock-key',
                        e: 'AQAB'
                    }
                }]
            }
        };
    }
}
