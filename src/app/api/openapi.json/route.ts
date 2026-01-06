/**
 * OpenAPI JSON Endpoint for Agent Trust Verifier
 * GET /api/openapi.json
 */

import { NextResponse } from 'next/server';

export async function GET() {
    const spec = {
        openapi: '3.0.3',
        info: {
            title: 'Agent Trust Verifier API',
            version: '1.0.0',
            description: 'DID resolution, Zero-Trust enrollment, and ZK-Credential verification for agent trust.'
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Local development' }
        ],
        paths: {
            '/api/vc/issue': {
                post: {
                    summary: 'Issue a Verifiable Credential',
                    operationId: 'issueVC',
                    tags: ['Credentials'],
                    responses: { '200': { description: 'Issued credential' } }
                }
            },
            '/api/vc/verify': {
                post: {
                    summary: 'Verify a Verifiable Credential',
                    operationId: 'verifyVC',
                    tags: ['Credentials'],
                    responses: { '200': { description: 'Verification result' } }
                }
            },
            '/api/verify-agent': {
                post: {
                    summary: 'Verify agent identity',
                    operationId: 'verifyAgent',
                    tags: ['Agent'],
                    responses: { '200': { description: 'Agent verification result' } }
                }
            }
        }
    };

    return NextResponse.json(spec, {
        headers: { 'Content-Type': 'application/json' }
    });
}
