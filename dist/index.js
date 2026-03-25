#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { PromptService } from './services/promptService.js';
import { AgentService } from './services/agentService.js';
import { SkillService } from './services/skillService.js';
import { InstructionsService } from './services/instructionsService.js';
import { SearchService } from './services/searchService.js';
const TAGS_INPUT = {
    type: 'object',
    properties: {
        tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags to search for (OR logic)',
        },
    },
};
class ModoDevFrameworkServer {
    server;
    prompts;
    agents;
    skills;
    instructions;
    search;
    constructor() {
        this.server = new Server({
            name: 'modo-dev-framework',
            version: '1.1.0',
            description: 'MODO Dev Framework — prompts, agents, skills, and instructions',
        }, { capabilities: { tools: {}, prompts: {}, resources: {} } });
        this.prompts = new PromptService(process.env.MCP_PROMPTS_DIR);
        this.agents = new AgentService(process.env.MCP_AGENTS_DIR);
        this.skills = new SkillService(process.env.MCP_SKILLS_DIR);
        this.instructions = new InstructionsService(process.env.MCP_INSTRUCTIONS_DIR);
        this.search = new SearchService(this.prompts, this.agents, this.skills, this.instructions);
        this.setupToolHandlers();
        this.setupPromptHandlers();
        this.setupResourceHandlers();
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'search_prompts',
                    description: 'Search MODO prompts by tags, query, or category',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: { type: 'string', description: 'Search query (title, description)' },
                            category: { type: 'string', description: 'Filter by category' },
                            tags: { type: 'array', items: { type: 'string' }, description: 'Tags (OR logic)' },
                        },
                    },
                },
                {
                    name: 'get_prompt',
                    description: 'Get a prompt by ID and render with variable substitution',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'Prompt ID' },
                            variables: { type: 'object', additionalProperties: true, description: 'Variables for substitution' },
                        },
                        required: ['id'],
                    },
                },
                {
                    name: 'search_agents',
                    description: 'Search MODO agents by tags',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tags: { type: 'array', items: { type: 'string' }, description: 'Tags (OR logic)' },
                            match: { type: 'string', enum: ['or', 'and'], description: 'Match mode (default: or)' },
                        },
                    },
                },
                {
                    name: 'search_skills',
                    description: 'Search MODO skills by tags',
                    inputSchema: TAGS_INPUT,
                },
                {
                    name: 'search_instructions',
                    description: 'Search MODO instructions by tags',
                    inputSchema: TAGS_INPUT,
                },
                {
                    name: 'get_instruction',
                    description: 'Get instruction content by ID (e.g., "quality-standards", "react/components")',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'Instruction ID' },
                        },
                        required: ['id'],
                    },
                },
                {
                    name: 'search_all',
                    description: 'Search across all MODO content types (prompts, agents, skills, instructions) by tags',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tags: { type: 'array', items: { type: 'string' }, description: 'Tags (OR logic)' },
                            query: { type: 'string', description: 'Filter results by text query' },
                        },
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'search_prompts': return await this.handleSearchPrompts(args);
                    case 'get_prompt': return await this.handleGetPrompt(args);
                    case 'search_agents': return await this.handleSearchAgents(args);
                    case 'search_skills': return await this.handleSearchSkills(args);
                    case 'search_instructions': return await this.handleSearchInstructions(args);
                    case 'get_instruction': return await this.handleGetInstruction(args);
                    case 'search_all': return await this.handleSearchAll(args);
                    default: throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
                    isError: true,
                };
            }
        });
    }
    setupPromptHandlers() {
        this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
            const summaries = await this.prompts.listSummaries();
            return {
                prompts: summaries.map(p => ({
                    name: p.id,
                    description: p.description,
                    arguments: p.variables?.map(v => ({
                        name: v.name, description: v.description, required: v.required,
                    })) || [],
                })),
            };
        });
        this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const rendered = await this.prompts.render(name, args || {});
            if (!rendered)
                throw new Error(`Prompt '${name}' not found`);
            return {
                description: rendered.description,
                messages: [{ role: 'user', content: { type: 'text', text: rendered.content } }],
            };
        });
    }
    setupResourceHandlers() {
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            const [promptList, agentList, skillList, instructionList] = await Promise.all([
                this.prompts.listSummaries(),
                this.agents.listSummaries(),
                this.skills.listSummaries(),
                this.instructions.listAll(),
            ]);
            return {
                resources: [
                    ...promptList.map(p => ({ uri: `prompts://${p.id}`, name: p.title, description: p.description, mimeType: 'text/markdown' })),
                    ...agentList.map(a => ({ uri: `agents://${a.id}`, name: a.title, description: a.description, mimeType: 'text/markdown' })),
                    ...skillList.map(s => ({ uri: `skills://${s.id}`, name: s.title, description: s.description, mimeType: 'text/markdown' })),
                    ...instructionList.map(i => ({ uri: `instructions://${i.id}`, name: i.name, description: i.description, mimeType: 'text/markdown' })),
                ],
            };
        });
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;
            let text;
            if (uri.startsWith('prompts://')) {
                const prompt = await this.prompts.get(uri.replace('prompts://', ''));
                if (!prompt)
                    throw new Error(`Prompt not found: ${uri}`);
                text = prompt.content;
            }
            else if (uri.startsWith('agents://')) {
                const agent = await this.agents.get(uri.replace('agents://', ''));
                if (!agent)
                    throw new Error(`Agent not found: ${uri}`);
                text = agent.content;
            }
            else if (uri.startsWith('skills://')) {
                const skill = await this.skills.get(uri.replace('skills://', ''));
                if (!skill)
                    throw new Error(`Skill not found: ${uri}`);
                text = skill.content;
            }
            else if (uri.startsWith('instructions://')) {
                text = await this.instructions.get(uri.replace('instructions://', ''));
            }
            else {
                throw new Error(`Unknown resource URI scheme: ${uri}`);
            }
            return { contents: [{ uri, mimeType: 'text/markdown', text }] };
        });
    }
    // Tool handlers
    async handleSearchPrompts(args) {
        const tags = args?.tags;
        const query = args?.query;
        const category = args?.category;
        let results;
        if (tags && tags.length > 0) {
            results = await this.prompts.searchByTags(tags, category);
        }
        else if (query) {
            results = await this.prompts.searchByQuery(query, category);
        }
        else {
            results = await this.prompts.listSummaries(category);
        }
        return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    }
    async handleGetPrompt(args) {
        if (!args?.id)
            throw new Error('Prompt ID is required');
        const rendered = await this.prompts.render(args.id, args.variables || {});
        if (!rendered)
            throw new Error(`Prompt '${args.id}' not found`);
        return { content: [{ type: 'text', text: JSON.stringify(rendered, null, 2) }] };
    }
    async handleSearchAgents(args) {
        const tags = args?.tags;
        const match = args?.match || 'or';
        const results = (!tags || tags.length === 0)
            ? await this.agents.listSummaries()
            : await this.agents.searchByTags(tags, match);
        return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    }
    async handleSearchSkills(args) {
        const tags = args?.tags;
        const results = (!tags || tags.length === 0)
            ? await this.skills.listSummaries()
            : await this.skills.searchByTags(tags);
        return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    }
    async handleSearchInstructions(args) {
        const tags = args?.tags;
        const results = await this.instructions.searchByTags(tags || []);
        return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    }
    async handleGetInstruction(args) {
        if (!args?.id)
            throw new Error('Instruction ID is required');
        const content = await this.instructions.get(args.id);
        return { content: [{ type: 'text', text: content }] };
    }
    async handleSearchAll(args) {
        const tags = args?.tags;
        const query = args?.query;
        const results = await this.search.searchAll(tags || [], query);
        return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    }
    async run() {
        await Promise.all([
            this.prompts.load(),
            this.agents.load(),
            this.skills.load(),
        ]);
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}
const server = new ModoDevFrameworkServer();
server.run().catch(error => {
    console.error('Failed to start MODO Dev Framework MCP server:', error);
    process.exit(1);
});
