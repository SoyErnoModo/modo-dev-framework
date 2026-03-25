export interface Prompt {
    id: string;
    title: string;
    description: string;
    category: string;
    content: string;
    tags: string[];
    variables?: PromptVariable[];
}
export interface PromptVariable {
    name: string;
    description: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required: boolean;
    defaultValue?: unknown;
}
export interface PromptSummary {
    id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    variables?: PromptVariable[];
}
export interface AgentEntry {
    id: string;
    title: string;
    description: string;
    tags: string[];
    content: string;
}
export interface AgentSummary {
    id: string;
    title: string;
    description: string;
    tags: string[];
}
export interface SkillEntry {
    id: string;
    title: string;
    description: string;
    tags: string[];
    content: string;
}
export interface SkillSummary {
    id: string;
    title: string;
    description: string;
    tags: string[];
}
export interface InstructionSummary {
    id: string;
    name: string;
    description: string;
    tags: string[];
}
export interface SearchResult {
    type: 'prompt' | 'agent' | 'skill' | 'instruction';
    id: string;
    title: string;
    description: string;
    tags: string[];
}
