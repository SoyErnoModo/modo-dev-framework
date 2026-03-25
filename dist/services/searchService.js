/**
 * Unified cross-type search service.
 * Queries all content types (prompts, agents, skills, instructions) by tags
 * and returns a merged result set.
 */
export class SearchService {
    prompts;
    agents;
    skills;
    instructions;
    constructor(prompts, agents, skills, instructions) {
        this.prompts = prompts;
        this.agents = agents;
        this.skills = skills;
        this.instructions = instructions;
    }
    async searchAll(tags, query) {
        const results = [];
        if (tags.length > 0) {
            const [promptResults, agentResults, skillResults, instructionResults] = await Promise.all([
                this.prompts.searchByTags(tags),
                this.agents.searchByTags(tags),
                this.skills.searchByTags(tags),
                this.instructions.searchByTags(tags),
            ]);
            for (const p of promptResults) {
                results.push({ type: 'prompt', id: p.id, title: p.title, description: p.description, tags: p.tags });
            }
            for (const a of agentResults) {
                results.push({ type: 'agent', id: a.id, title: a.title, description: a.description, tags: a.tags });
            }
            for (const s of skillResults) {
                results.push({ type: 'skill', id: s.id, title: s.title, description: s.description, tags: s.tags });
            }
            for (const i of instructionResults) {
                results.push({ type: 'instruction', id: i.id, title: i.name, description: i.description, tags: i.tags });
            }
        }
        // Filter by query if provided
        if (query) {
            const q = query.toLowerCase();
            return results.filter(r => r.title.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q) ||
                r.tags.some(t => t.toLowerCase().includes(q)));
        }
        return results;
    }
}
