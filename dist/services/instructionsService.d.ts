import { InstructionSummary } from '../types.js';
/**
 * Simplified instructions service for modo-dev-framework.
 * Reads instructions/ directory with:
 * - Root .md files with frontmatter tags
 * - Subdirectories with metadata.json + *.instructions.md files
 */
export declare class InstructionsService {
    private readonly dir;
    constructor(instructionsDir?: string);
    searchByTags(tags: string[]): Promise<InstructionSummary[]>;
    get(id: string): Promise<string>;
    listAll(): Promise<InstructionSummary[]>;
    private loadAll;
    private loadTechDir;
    private parseFile;
    private loadDirectory;
    private tryRead;
}
