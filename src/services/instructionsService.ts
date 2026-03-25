import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { InstructionSummary } from '../types.js';

const INSTRUCTIONS_EXT = '.instructions.md';
const SKIP_FILES = new Set(['README.md', 'CHANGELOG.md', 'DEPRECATED.md', 'metadata.json']);

/**
 * Simplified instructions service for modo-dev-framework.
 * Reads instructions/ directory with:
 * - Root .md files with frontmatter tags
 * - Subdirectories with metadata.json + *.instructions.md files
 */
export class InstructionsService {
  private readonly dir: string;

  constructor(instructionsDir?: string) {
    this.dir = instructionsDir || join(process.cwd(), 'instructions');
  }

  async searchByTags(tags: string[]): Promise<InstructionSummary[]> {
    if (!tags || tags.length === 0) return [];
    const all = await this.loadAll();
    return all.filter(i => i.tags.some(t => tags.includes(t)));
  }

  async get(id: string): Promise<string> {
    if (id.includes('..') || id.startsWith('/')) {
      throw new Error('Invalid instruction path');
    }

    // Try direct file: instructions/{id}.md
    const directPath = join(this.dir, `${id}.md`);
    const direct = await this.tryRead(directPath);
    if (direct !== null) return direct;

    // Try sub-path: instructions/{dir}/{topic}.instructions.md
    const segments = id.split('/');
    if (segments.length === 2) {
      const [dir, topic] = segments;
      for (const ext of [INSTRUCTIONS_EXT, '.md']) {
        const subPath = join(this.dir, dir, `${topic}${ext}`);
        const content = await this.tryRead(subPath);
        if (content !== null) return content;
      }
    }

    // Try loading all files from directory
    const dirPath = join(this.dir, id);
    try {
      const stat = await fs.stat(dirPath);
      if (stat.isDirectory()) {
        return await this.loadDirectory(dirPath);
      }
    } catch {
      // Not a directory
    }

    throw new Error(`Instruction not found: ${id}`);
  }

  async listAll(): Promise<InstructionSummary[]> {
    return this.loadAll();
  }

  private async loadAll(): Promise<InstructionSummary[]> {
    const results: InstructionSummary[] = [];
    try {
      const entries = await fs.readdir(this.dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.md') && !SKIP_FILES.has(entry.name)) {
          const parsed = await this.parseFile(join(this.dir, entry.name), entry.name.replace('.md', ''));
          if (parsed) results.push(parsed);
        } else if (entry.isDirectory()) {
          const fileResults = await this.loadTechDir(entry.name);
          results.push(...fileResults);
        }
      }
    } catch {
      // Directory may not exist
    }
    return results;
  }

  private async loadTechDir(dirName: string): Promise<InstructionSummary[]> {
    const results: InstructionSummary[] = [];
    const dirPath = join(this.dir, dirName);

    // Read metadata.json for shared tags
    let dirTags: string[] = [];
    try {
      const meta = JSON.parse(await fs.readFile(join(dirPath, 'metadata.json'), 'utf-8'));
      dirTags = Array.isArray(meta.tags) ? meta.tags : [];
    } catch {
      // No metadata.json — scan .md files directly
      try {
        const files = await fs.readdir(dirPath);
        for (const f of files.filter(f => f.endsWith('.md') && !SKIP_FILES.has(f))) {
          const parsed = await this.parseFile(join(dirPath, f), `${dirName}/${f.replace('.md', '')}`);
          if (parsed) results.push(parsed);
        }
      } catch { /* skip */ }
      return results;
    }

    // Scan *.instructions.md files
    try {
      const files = await fs.readdir(dirPath);
      for (const f of files.filter(f => f.endsWith(INSTRUCTIONS_EXT))) {
        const filePath = join(dirPath, f);
        const topic = f.replace(INSTRUCTIONS_EXT, '');
        try {
          const raw = await fs.readFile(filePath, 'utf-8');
          const parsed = matter(raw);
          const fm = parsed.data as Record<string, unknown>;
          const title = (fm.title as string) || topic.charAt(0).toUpperCase() + topic.slice(1).replaceAll('-', ' ');
          const fileTags = Array.isArray(fm.tags) ? fm.tags as string[] : [];
          results.push({
            id: `${dirName}/${topic}`,
            name: title,
            description: (fm.description as string) || title,
            tags: [...new Set([...dirTags, ...fileTags])],
          });
        } catch { /* skip */ }
      }
    } catch { /* skip */ }

    return results;
  }

  private async parseFile(filePath: string, id: string): Promise<InstructionSummary | null> {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(raw);
      const fm = parsed.data as Record<string, unknown>;
      return {
        id: (fm.id as string) || id,
        name: (fm.title as string) || (fm.name as string) || id,
        description: (fm.description as string) || '',
        tags: Array.isArray(fm.tags) ? fm.tags as string[] : [],
      };
    } catch {
      return null;
    }
  }

  private async loadDirectory(dirPath: string): Promise<string> {
    const files = await fs.readdir(dirPath);
    const mdFiles = files
      .filter(f => f.endsWith(INSTRUCTIONS_EXT) || (f.endsWith('.md') && !SKIP_FILES.has(f)))
      .sort();
    if (mdFiles.length === 0) throw new Error('No instruction files found');
    const contents = await Promise.all(
      mdFiles.map(async f => {
        const content = await fs.readFile(join(dirPath, f), 'utf-8');
        return `<!-- Source: ${f} -->\n${content}`;
      })
    );
    return contents.join('\n\n---\n\n');
  }

  private async tryRead(filePath: string): Promise<string | null> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }
}
