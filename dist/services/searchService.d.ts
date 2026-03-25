import { SearchResult } from '../types.js';
import { PromptService } from './promptService.js';
import { AgentService } from './agentService.js';
import { SkillService } from './skillService.js';
import { InstructionsService } from './instructionsService.js';
/**
 * Unified cross-type search service.
 * Queries all content types (prompts, agents, skills, instructions) by tags
 * and returns a merged result set.
 */
export declare class SearchService {
    private readonly prompts;
    private readonly agents;
    private readonly skills;
    private readonly instructions;
    constructor(prompts: PromptService, agents: AgentService, skills: SkillService, instructions: InstructionsService);
    searchAll(tags: string[], query?: string): Promise<SearchResult[]>;
}
