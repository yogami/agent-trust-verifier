import { describe, it, expect, beforeEach } from 'vitest';
import { ZKCredentialIssuer } from '../ZKCredentialIssuer';

describe('ZKCredentialIssuer', () => {
    let issuer: ZKCredentialIssuer;

    beforeEach(() => {
        issuer = new ZKCredentialIssuer();
    });

    describe('generateZKProof', () => {
        it('should generate a valid proof when SLA is met', async () => {
            const proof = await issuer.generateZKProof({
                taskId: 'test_task_001',
                completedAt: new Date().toISOString(),
                slaDeadlineSeconds: 60,
                biasScore: 0,
                biasThreshold: 5,
                outputHash: 'sha256:abc123',
            });

            expect(proof.proof).toBeTruthy();
            expect(proof.publicSignals).toBeInstanceOf(Array);
            expect(proof.verified).toBe(true);
            expect(proof.proofSizeBytes).toBeGreaterThan(0);
        });

        it('should generate an invalid proof when SLA is breached', async () => {
            const proof = await issuer.generateZKProof({
                taskId: 'test_task_breach',
                completedAt: new Date().toISOString(),
                slaDeadlineSeconds: -100, // Already breached
                biasScore: 0,
                biasThreshold: 5,
                outputHash: 'sha256:late',
            });

            expect(proof.verified).toBe(false);
        });

        it('should generate an invalid proof when bias exceeds threshold', async () => {
            const proof = await issuer.generateZKProof({
                taskId: 'test_task_biased',
                completedAt: new Date().toISOString(),
                slaDeadlineSeconds: 60,
                biasScore: 10, // Exceeds threshold
                biasThreshold: 5,
                outputHash: 'sha256:biased',
            });

            expect(proof.verified).toBe(false);
        });
    });

    describe('verifyZKProof', () => {
        it('should verify a valid proof', async () => {
            const proof = await issuer.generateZKProof({
                taskId: 'verify_test',
                completedAt: new Date().toISOString(),
                slaDeadlineSeconds: 60,
                biasScore: 1,
                biasThreshold: 5,
                outputHash: 'sha256:valid',
            });

            const result = await issuer.verifyZKProof(proof);
            expect(result).toBe(true);
        });

        it('should reject an invalid proof', async () => {
            const proof = await issuer.generateZKProof({
                taskId: 'verify_test_fail',
                completedAt: new Date().toISOString(),
                slaDeadlineSeconds: -10,
                biasScore: 0,
                biasThreshold: 5,
                outputHash: 'sha256:late',
            });

            const result = await issuer.verifyZKProof(proof);
            expect(result).toBe(false);
        });
    });

    describe('attachZKProof', () => {
        it('should attach ZK proof to credential and add type', async () => {
            const proof = await issuer.generateZKProof({
                taskId: 'attach_test',
                completedAt: new Date().toISOString(),
                slaDeadlineSeconds: 60,
                biasScore: 0,
                biasThreshold: 5,
                outputHash: 'sha256:attach',
            });

            const vc = {
                id: 'vc-123',
                type: ['VerifiableCredential', 'TestCredential'],
                issuer: 'did:web:test',
                issuanceDate: new Date().toISOString(),
                credentialSubject: { name: 'Test' },
            };

            const result = issuer.attachZKProof(vc, proof);

            expect(result.type).toContain('ZKAttestedCredential');
            expect(result.zkProof).toBeTruthy();
            expect(result.zkProof?.proof).toBe(proof.proof);
            expect(result.zkProof?.verified).toBe(true);
        });
    });
});
