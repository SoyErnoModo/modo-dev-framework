import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { AgentEntry, AgentSummary } from '../types.js';

/**
 * Agent service adapted for flat .md files with YAML frontmatter.
 * Unlike mcp-prompts (which uses agent.json + AGENT.md subdirectories),
 * modo-dev-framework stores agents as flat agents/*.md files.
 */
export class AgentService {
  private readonly agentsDir: string;
  private readonly cache: Map<string, AgentEntry> = new Map();

  constructor(agentsDir?: string) {
    this.agentsDir = agentsDir || join(process.cwd(), 'agents');
  }

  async load(): Promise<void> {
    try {
      const files = await fs.readdir(this.agentsDir);
      for (const file of files.filter(f => f.endsWith('.md'))) {
        try {
          const content = await fs.readFile(join(this.agentsDir, file), 'utf-8');
          const parsed = matter(content);
          const data = parsed.data as Record<string, unknown>;
          const id = (data.name as string) || file.replace('.md', '');
          const agent: AgentEntry = {
            id,
            title: id.charAt(0).toUpperCase() + id.slice(1).replaceAll('-', ' '),
            description: typeof data.description === 'string'
              ? data.description.substring(0, 200)
              : '',
            tags: Array.isArray(data.tags) ? data.tags as string[] : [],
            content: parsed.content.trim(),
          };
          this.cache.set(id, agent);
        } catch {
          // Skip invalid agent files
        }
      }
    } catch {
      // Agents directory may not exist
    }
  }

  async listSummaries(): Promise<AgentSummary[]> {
    return Array.from(this.cache.values()).map(a => ({
      id: a.id, title: a.title, description: a.description, tags: a.tags,
    }));
  }

  async get(id: string): Promise<AgentEntry | null> {
    return this.cache.get(id) || null;
  }

  async searchByTags(tags: string[], match: 'or' | 'and' = 'or'): Promise<AgentSummary[]> {
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
