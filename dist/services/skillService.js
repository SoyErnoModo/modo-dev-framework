import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
/**
 * Skill service adapted for modo-dev-framework format.
 * Skills are stored as skills/{name}/SKILL.md with YAML frontmatter.
 */
export class SkillService {
    skillsDir;
    cache = new Map();
    constructor(skillsDir) {
        this.skillsDir = skillsDir || join(process.cwd(), 'skills');
    }
    async load() {
        try {
            const entries = await fs.readdir(this.skillsDir, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isDirectory())
                    continue;
                const skillPath = join(this.skillsDir, entry.name, 'SKILL.md');
                try {
                    const content = await fs.readFile(skillPath, 'utf-8');
                    const parsed = matter(content);
                    const data = parsed.data;
                    const id = data.name || entry.name;
                    const skill = {
                        id,
                        title: id.charAt(0).toUpperCase() + id.slice(1).replaceAll('-', ' '),
                        description: typeof data.description === 'string'
                            ? data.description.substring(0, 200)
                            : '',
                        tags: Array.isArray(data.tags) ? data.tags : [],
                        content: parsed.content.trim(),
                    };
                    this.cache.set(id, skill);
                }
                catch {
                    // Skip skills without SKILL.md
                }
            }
        }
        catch {
            // Skills directory may not exist
        }
    }
    async listSummaries() {
        return Array.from(this.cache.values()).map(s => ({
            id: s.id, title: s.title, description: s.description, tags: s.tags,
        }));
    }
    async get(id) {
        return this.cache.get(id) || null;
    }
    async searchByTags(tags) {
        const skills = Array.from(this.cache.values());
        const filtered = skills.filter(s => s.tags.some(t => tags.includes(t)));
        return filtered.map(s => ({
            id: s.id, title: s.title, description: s.description, tags: s.tags,
        }));
    }
}
