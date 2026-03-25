import { Prompt, PromptSummary } from '../types.js';
export declare class PromptService {
    private readonly promptsDir;
    private readonly cache;
    constructor(promptsDir?: string);
    load(): Promise<void>;
    private loadCategory;
    listSummaries(category?: string): Promise<PromptSummary[]>;
    get(id: string): Promise<Prompt | null>;
    searchByTags(tags: string[], category?: string): Promise<PromptSummary[]>;
    searchByQuery(query: string, category?: string): Promise<PromptSummary[]>;
    render(id: string, variables?: Record<string, unknown>): Promise<{
        id: string;
        title: string;
        description: string;
        category: string;
        content: string;
        variablesUsed: string[];
    } | null>;
}
