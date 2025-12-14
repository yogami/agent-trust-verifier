import prisma from '../db';
import { ITrustRepository } from '../../domain/interfaces/ITrustRepository';
import { AgentIdentity } from '../../domain/entities/AgentIdentity';

export class TemboTrustRepository implements ITrustRepository {
    async saveIdentity(identity: AgentIdentity): Promise<AgentIdentity> {
        const saved = await prisma.agent.upsert({
            where: { did: identity.did },
            update: {
                trustScore: identity.trustScore,
                isActive: identity.isActive,
            },
            create: {
                did: identity.did,
                publicKey: identity.publicKey,
                domain: identity.domain,
                trustScore: identity.trustScore,
                isActive: identity.isActive,
            },
        });

        return this.mapToEntity(saved);
    }

    async getIdentity(did: string): Promise<AgentIdentity | null> {
        const agent = await prisma.agent.findUnique({
            where: { did },
        });

        if (!agent) return null;
        return this.mapToEntity(agent);
    }

    async getAllIdentities(): Promise<AgentIdentity[]> {
        const agents = await prisma.agent.findMany();
        return agents.map(this.mapToEntity);
    }

    async updateTrustScore(did: string, newScore: number): Promise<void> {
        await prisma.agent.update({
            where: { did },
            data: { trustScore: newScore },
        });
    }

    private mapToEntity(dbAgent: any): AgentIdentity {
        return {
            did: dbAgent.did,
            publicKey: dbAgent.publicKey,
            domain: dbAgent.domain,
            trustScore: dbAgent.trustScore,
            isActive: dbAgent.isActive,
            createdAt: dbAgent.createdAt,
            updatedAt: dbAgent.updatedAt,
        };
    }
}
