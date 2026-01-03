import { AgentIdentity } from '../entities/AgentIdentity';

export interface ITrustRepository {
    saveIdentity(identity: AgentIdentity): Promise<AgentIdentity>;
    getIdentity(did: string): Promise<AgentIdentity | null>;
    getAllIdentities(): Promise<AgentIdentity[]>;
    updateTrustScore(did: string, newScore: number): Promise<void>;
}
