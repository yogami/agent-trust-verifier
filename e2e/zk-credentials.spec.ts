import { test, expect } from '@playwright/test';

/**
 * E2E Tests for ZK-Attested Verifiable Credentials
 * 
 * ATDD: Acceptance tests written FIRST, then implementation.
 * Tests the /api/vc/issue-zk endpoint for issuing credentials with ZK proofs.
 */

test.describe('ZK-Attested Credentials E2E', () => {
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

    test.describe('POST /api/vc/issue-zk', () => {
        test('should issue a credential with ZK-SLA proof attached', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/vc/issue-zk`, {
                data: {
                    subjectDid: 'did:web:agent.example.com',
                    type: ['SLAComplianceCredential'],
                    data: {
                        taskId: 'task_zk_001',
                        agentId: 'agent_test_001',
                        completedAt: new Date().toISOString(),
                        slaDeadlineSeconds: 60,
                        outputHash: 'sha256:abc123',
                    },
                    zkProof: {
                        enabled: true,
                        biasScore: 0,
                        biasThreshold: 5,
                    },
                },
            });

            expect(response.ok()).toBeTruthy();
            const vc = await response.json();

            // Verify VC structure
            expect(vc.id).toBeTruthy();
            expect(vc.type).toContain('SLAComplianceCredential');
            expect(vc.type).toContain('ZKAttestedCredential');
            expect(vc.issuer).toBeTruthy();
            expect(vc.credentialSubject).toBeTruthy();
            expect(vc.credentialSubject.taskId).toBe('task_zk_001');

            // Verify ZK proof is attached
            expect(vc.zkProof).toBeTruthy();
            expect(vc.zkProof.proof).toBeTruthy();
            expect(vc.zkProof.publicSignals).toBeInstanceOf(Array);
            expect(vc.zkProof.verified).toBe(true);

            // Verify standard JWS proof also exists
            expect(vc.proof).toBeTruthy();
            expect(vc.proof.jws).toBeTruthy();
        });

        test('should reject ZK credential when SLA is breached', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/vc/issue-zk`, {
                data: {
                    subjectDid: 'did:web:agent.example.com',
                    type: ['SLAComplianceCredential'],
                    data: {
                        taskId: 'task_zk_breach',
                        agentId: 'agent_test_001',
                        completedAt: new Date().toISOString(),
                        slaDeadlineSeconds: -100, // Already breached
                        outputHash: 'sha256:late',
                    },
                    zkProof: {
                        enabled: true,
                        biasScore: 0,
                        biasThreshold: 5,
                    },
                },
            });

            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.error).toContain('SLA');
        });

        test('should fallback to standard VC when zkProof.enabled is false', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/vc/issue-zk`, {
                data: {
                    subjectDid: 'did:web:agent.example.com',
                    type: ['StandardCredential'],
                    data: {
                        taskId: 'task_no_zk',
                        status: 'completed',
                    },
                    zkProof: {
                        enabled: false,
                    },
                },
            });

            expect(response.ok()).toBeTruthy();
            const vc = await response.json();

            // Should have standard proof but no zkProof
            expect(vc.proof).toBeTruthy();
            expect(vc.zkProof).toBeUndefined();
        });
    });

    test.describe('POST /api/vc/verify', () => {
        test('should verify a ZK-attested credential', async ({ request }) => {
            // First, issue a ZK credential
            const issueResponse = await request.post(`${BASE_URL}/api/vc/issue-zk`, {
                data: {
                    subjectDid: 'did:web:agent.verify.test',
                    type: ['SLAComplianceCredential'],
                    data: {
                        taskId: 'task_verify_zk',
                        agentId: 'agent_test_001',
                        completedAt: new Date().toISOString(),
                        slaDeadlineSeconds: 60,
                        outputHash: 'sha256:verify',
                    },
                    zkProof: {
                        enabled: true,
                        biasScore: 1,
                        biasThreshold: 5,
                    },
                },
            });

            const vc = await issueResponse.json();

            // Now verify it
            const verifyResponse = await request.post(`${BASE_URL}/api/vc/verify`, {
                data: { credential: vc },
            });

            expect(verifyResponse.ok()).toBeTruthy();
            const result = await verifyResponse.json();
            expect(result.valid).toBe(true);
            expect(result.zkVerified).toBe(true);
        });
    });
});
