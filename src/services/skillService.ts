import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { SkillEntry, SkillSummary } from '../types.js';

/**
 * Skill service adapted for modo-dev-framework format.
 * Skills are stored as skills/{name}/SKILL.md with YAML frontmatter.
 */
export class SkillService {
  private readonly skillsDir: string;
  private readonly cache: Map<string, SkillEntry> = new Map();

  constructor(skillsDir?: string) {
    this.skillsDir = skillsDir || join(process.cwd(), 'skills');
  }

  async load(): Promise<void> {
    try {
      const entries = await fs.readdir(this.skillsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const skillPath = join(this.skillsDir, entry.name, 'SKILL.md');
        try {
          const content = await fs.readFile(skillPath, 'utf-8');
          const parsed = matter(content);
          const data = parsed.data as Record<string, unknown>;
          const id = (data.name as string) || entry.name;
          const skill: SkillEntry = {
            id,
            title: id.charAt(0).toUpperCase() + id.slice(1).replaceAll('-', ' '),
            description: typeof data.description === 'string'
              ? data.description.substring(0, 200)
              : '',
            tags: Array.isArray(data.tags) ? data.tags as string[] : [],
            content: parsed.content.trim(),
          };
          this.cache.set(id, skill);
        } catch {
          // Skip skills without SKILL.md
        }
      }
    } catch {
      // Skills directory may not exist
    }
  }

  async listSummaries(): Promise<SkillSummary[]> {
    return Array.from(this.cache.values()).map(s => ({
      id: s.id, title: s.title, description: s.description, tags: s.tags,
    }));
  }

  async get(id: string): Promise<SkillEntry | null> {
    return this.cache.get(id) || null;
  }

  async searchByTags(tags: string[]): Promise<SkillSummary[]> {
    const skills = Array.from(this.cache.values());
    const filtered = skills.filter(s => s.tags.some(t => tags.includes(t)));
    return filtered.map(s => ({
      id: s.id, title: s.title, description: s.description, tags: s.tags,
    }));
  }
}
