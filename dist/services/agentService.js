import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
/**
 * Agent service adapted for flat .md files with YAML frontmatter.
 * Unlike mcp-prompts (which uses agent.json + AGENT.md subdirectories),
 * modo-dev-framework stores agents as flat agents/*.md files.
 */
export class AgentService {
    agentsDir;
    cache = new Map();
    constructor(agentsDir) {
        this.agentsDir = agentsDir || join(process.cwd(), 'agents');
    }
    async load() {
        try {
            const files = await fs.readdir(this.agentsDir);
            for (const file of files.filter(f => f.endsWith('.md'))) {
                try {
                    const content = await fs.readFile(join(this.agentsDir, file), 'utf-8');
                    const parsed = matter(content);
                    const data = parsed.data;
                    const id = data.name || file.replace('.md', '');
                    const agent = {
                        id,
                        title: id.charAt(0).toUpperCase() + id.slice(1).replaceAll('-', ' '),
                        description: typeof data.description === 'string'
                            ? data.description.substring(0, 200)
                            : '',
                        tags: Array.isArray(data.tags) ? data.tags : [],
                        content: parsed.content.trim(),
                    };
                    this.cache.set(id, agent);
                }
                catch {
                    // Skip invalid agent files
                }
            }
        }
        catch {
            // Agents directory may not exist
        }
    }
    async listSummaries() {
        return Array.from(this.cache.values()).map(a => ({
            id: a.id, title: a.title, description: a.description, tags: a.tags,
        }));
    }
    async get(id) {
        return this.cache.get(id) || null;
    }
    async searchByTags(tags, match = 'or') {
        const agents = Array.from(this.cache.values());
        const filtered = agents.filter(a => {
            if (match === 'and') {
                return tags.every(t => a.tags.includes(t));
            }
            return a.tags.some(t => tags.includes(t));
        });
        return filtered.map(a => ({
            id: a.id, title: a.title, description: a.description, tags: a.tags,
        }));
    }
}
