import { SkillEntry, SkillSummary } from '../types.js';
/**
 * Skill service adapted for modo-dev-framework format.
 * Skills are stored as skills/{name}/SKILL.md with YAML frontmatter.
 */
export declare class SkillService {
    private readonly skillsDir;
    private readonly cache;
    constructor(skillsDir?: string);
    load(): Promise<void>;
    listSummaries(): Promise<SkillSummary[]>;
    get(id: string): Promise<SkillEntry | null>;
    searchByTags(tags: string[]): Promise<SkillSummary[]>;
}
