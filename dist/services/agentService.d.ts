import { AgentEntry, AgentSummary } from '../types.js';
/**
 * Agent service adapted for flat .md files with YAML frontmatter.
 * Unlike mcp-prompts (which uses agent.json + AGENT.md subdirectories),
 * modo-dev-framework stores agents as flat agents/*.md files.
 */
export declare class AgentService {
    private readonly agentsDir;
    private readonly cache;
    constructor(agentsDir?: string);
    load(): Promise<void>;
    listSummaries(): Promise<AgentSummary[]>;
    get(id: string): Promise<AgentEntry | null>;
    searchByTags(tags: string[], match?: 'or' | 'and'): Promise<AgentSummary[]>;
}
