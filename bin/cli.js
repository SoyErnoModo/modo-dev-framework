#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, '..');
const HOME = process.env.HOME || process.env.USERPROFILE || '';

const AI_CLIENTS = {
  claude: {
    name: 'Claude Code',
    detect: () => existsSync(join(HOME, '.claude')),
    skillsDir: (global) => global ? join(HOME, '.claude', 'skills') : '.claude/skills',
    pluginDir: () => join(HOME, '.claude', 'plugins', 'modo-dev-framework'),
  },
  copilot: {
    name: 'GitHub Copilot',
    detect: () => existsSync(join(HOME, '.vscode')) || existsSync('.github'),
    skillsDir: (global) => global ? join(HOME, '.github', 'copilot-chat') : '.github/copilot-chat',
    pluginDir: () => null,
  },
  cursor: {
    name: 'Cursor',
    detect: () => existsSync(join(HOME, '.cursor')),
    skillsDir: (global) => global ? join(HOME, '.cursor', 'rules') : '.cursor/rules',
    pluginDir: () => null,
  },
};

function printUsage() {
  console.log(`
MODO Dev Framework CLI

Usage:
  modo-dev-framework install [--claude] [--copilot] [--cursor]
  modo-dev-framework list-prompts
  modo-dev-framework list-agents
  modo-dev-framework list-skills
  modo-dev-framework list-instructions
  modo-dev-framework detect

Options:
  --claude    Install for Claude Code
  --copilot   Install for GitHub Copilot
  --cursor    Install for Cursor
`);
}

function detect() {
  console.log('Detecting installed AI tools...\n');
  for (const [key, client] of Object.entries(AI_CLIENTS)) {
    const found = client.detect();
    console.log(`  ${found ? '✅' : '❌'} ${client.name} (${key})`);
  }
  console.log('');
}

async function listContent(type) {
  const { PromptService } = await import('../dist/services/promptService.js');
  const { AgentService } = await import('../dist/services/agentService.js');
  const { SkillService } = await import('../dist/services/skillService.js');
  const { InstructionsService } = await import('../dist/services/instructionsService.js');

  switch (type) {
    case 'prompts': {
      const svc = new PromptService(join(PLUGIN_ROOT, 'prompts'));
      await svc.load();
      const items = await svc.listSummaries();
      console.log(`\n📝 Prompts (${items.length}):\n`);
      for (const p of items) {
        console.log(`  ${p.id} [${p.category}]`);
        console.log(`    ${p.description}`);
        console.log(`    Tags: ${p.tags.join(', ')}`);
        if (p.variables?.length) {
          console.log(`    Variables: ${p.variables.map(v => v.required ? v.name : `${v.name}?`).join(', ')}`);
        }
        console.log('');
      }
      break;
    }
    case 'agents': {
      const svc = new AgentService(join(PLUGIN_ROOT, 'agents'));
      await svc.load();
      const items = await svc.listSummaries();
      console.log(`\n🤖 Agents (${items.length}):\n`);
      for (const a of items) {
        console.log(`  ${a.id} — ${a.tags.join(', ')}`);
      }
      console.log('');
      break;
    }
    case 'skills': {
      const svc = new SkillService(join(PLUGIN_ROOT, 'skills'));
      await svc.load();
      const items = await svc.listSummaries();
      console.log(`\n⚡ Skills (${items.length}):\n`);
      for (const s of items) {
        console.log(`  ${s.id} — ${s.tags.join(', ')}`);
      }
      console.log('');
      break;
    }
    case 'instructions': {
      const svc = new InstructionsService(join(PLUGIN_ROOT, 'instructions'));
      const items = await svc.listAll();
      console.log(`\n📖 Instructions (${items.length}):\n`);
      for (const i of items) {
        console.log(`  ${i.id} — ${i.tags.join(', ')}`);
      }
      console.log('');
      break;
    }
  }
}

function install(targets) {
  if (targets.length === 0) {
    // Auto-detect
    targets = Object.entries(AI_CLIENTS)
      .filter(([, client]) => client.detect())
      .map(([key]) => key);
    if (targets.length === 0) {
      console.log('No AI tools detected. Use --claude, --copilot, or --cursor flags.');
      return;
    }
  }

  for (const target of targets) {
    const client = AI_CLIENTS[target];
    if (!client) {
      console.log(`Unknown target: ${target}`);
      continue;
    }

    console.log(`\nInstalling for ${client.name}...`);

    if (target === 'claude') {
      const pluginDir = client.pluginDir();
      if (pluginDir) {
        mkdirSync(pluginDir, { recursive: true });
        cpSync(PLUGIN_ROOT, pluginDir, {
          recursive: true,
          filter: (src) => !src.includes('node_modules') && !src.includes('.git'),
        });
        console.log(`  ✅ Plugin copied to ${pluginDir}`);
        console.log('  💡 Run: claude plugins add modo-dev-framework --local');
      }
    } else {
      console.log(`  ℹ️  For ${client.name}, use the skills directly from the plugin directory`);
      console.log(`  📁 Skills at: ${join(PLUGIN_ROOT, 'skills')}`);
      console.log(`  📁 Agents at: ${join(PLUGIN_ROOT, 'agents')}`);
    }
  }
  console.log('\nDone!');
}

// Parse args
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'install':
    install(args.slice(1).filter(a => a.startsWith('--')).map(a => a.replace('--', '')));
    break;
  case 'list-prompts':
    await listContent('prompts');
    break;
  case 'list-agents':
    await listContent('agents');
    break;
  case 'list-skills':
    await listContent('skills');
    break;
  case 'list-instructions':
    await listContent('instructions');
    break;
  case 'detect':
    detect();
    break;
  default:
    printUsage();
}
