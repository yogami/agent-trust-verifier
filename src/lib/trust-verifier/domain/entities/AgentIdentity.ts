export interface AgentIdentity {
    did: string;
    publicKey: string;
    domain: string;
    trustScore: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateAgentInput = Omit<AgentIdentity, 'createdAt' | 'updatedAt' | 'trustScore' | 'isActive'>;
