import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { Prompt, PromptSummary } from '../types.js';

export class PromptService {
  private readonly promptsDir: string;
  private readonly cache: Map<string, Prompt> = new Map();

  constructor(promptsDir?: string) {
    this.promptsDir = promptsDir || join(process.cwd(), 'prompts');
  }

  async load(): Promise<void> {
    try {
      const categories = await fs.readdir(this.promptsDir, { withFileTypes: true });
      for (const cat of categories) {
        if (cat.isDirectory()) {
          await this.loadCategory(cat.name);
        }
      }
    } catch {
      // Prompts directory may not exist — graceful degradation
    }
  }

  private async loadCategory(categoryName: string): Promise<void> {
    const dir = join(this.promptsDir, categoryName);
    try {
      const files = await fs.readdir(dir);
      for (const file of files.filter(f => f.endsWith('.md'))) {
        try {
          const content = await fs.readFile(join(dir, file), 'utf-8');
          const parsed = matter(content);
          const prompt: Prompt = {
            ...(parsed.data as Partial<Prompt>),
            content: parsed.content.trim(),
            category: categoryName,
          } as Prompt;
          if (prompt.id && prompt.title) {
            this.cache.set(prompt.id, prompt);
          }
        } catch {
          // Skip invalid files
        }
      }
    } catch {
      // Skip missing categories
    }
  }

  async listSummaries(category?: string): Promise<PromptSummary[]> {
    let prompts = Array.from(this.cache.values());
    if (category) prompts = prompts.filter(p => p.category === category);
    return prompts.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      tags: p.tags || [],
      variables: p.variables || [],
    }));
  }

  async get(id: string): Promise<Prompt | null> {
    return this.cache.get(id) || null;
  }

  async searchByTags(tags: string[], category?: string): Promise<PromptSummary[]> {
    let prompts = Array.from(this.cache.values());
    if (category) prompts = prompts.filter(p => p.category === category);
    const filtered = prompts.filter(p => p.tags?.some(t => tags.includes(t)));
    return filtered.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      tags: p.tags || [],
      variables: p.variables || [],
    }));
  }

  async searchByQuery(query: string, category?: string): Promise<PromptSummary[]> {
    const q = query.toLowerCase();
    let prompts = Array.from(this.cache.values());
    if (category) prompts = prompts.filter(p => p.category === category);
    const filtered = prompts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
    return filtered.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      tags: p.tags || [],
      variables: p.variables || [],
    }));
  }

  async render(id: string, variables?: Record<string, unknown>): Promise<{
    id: string; title: string; description: string; category: string;
    content: string; variablesUsed: string[];
  } | null> {
    const prompt = this.cache.get(id);
    if (!prompt) return null;

    const provided = variables || {};
    const defined = prompt.variables || [];
    const resolved: Record<string, unknown> = {};

    for (const v of defined) {
      if (v.name in provided) {
        resolved[v.name] = provided[v.name];
      } else if (v.defaultValue !== undefined) {
        resolved[v.name] = v.defaultValue;
      } else if (v.required) {
        throw new Error(`Missing required variable: ${v.name}`);
      }
    }
    // Include extra provided variables
    for (const key of Object.keys(provided)) {
      if (!(key in resolved)) resolved[key] = provided[key];
    }

    const variablesUsed: string[] = [];
    const content = prompt.content.replace(/\{(\w+)\}/g, (_match, varName: string) => {
      variablesUsed.push(varName);
      if (varName in resolved) {
        const val = resolved[varName];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
        return JSON.stringify(val);
      }
      return `{${varName}}`;
    });

    return {
      id: prompt.id, title: prompt.title, description: prompt.description,
      category: prompt.category, content, variablesUsed,
    };
  }
}
