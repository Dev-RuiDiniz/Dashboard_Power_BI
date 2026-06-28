import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const requiredPaths = [
  'apps',
  'apps/api',
  'apps/web',
  'packages',
  'packages/shared',
  'packages/ui',
  'docs',
  'docs/decisions',
  'infra',
  'scripts',
  '.github',
  'package.json',
  'pnpm-workspace.yaml',
  'README.md',
  'docs/ARQUITETURA.md',
  'docs/decisions/ADR-0001-monorepo.md',
];

const missing = requiredPaths.filter((path) => !existsSync(resolve(root, path)));

if (missing.length > 0) {
  console.error('Workspace inválido. Caminhos ausentes:');
  for (const path of missing) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

const workspace = readFileSync(resolve(root, 'pnpm-workspace.yaml'), 'utf8');

const requiredWorkspaceEntries = ['apps/*', 'packages/*'];
const missingWorkspaceEntries = requiredWorkspaceEntries.filter(
  (entry) => !workspace.includes(entry),
);

if (missingWorkspaceEntries.length > 0) {
  console.error('pnpm-workspace.yaml sem entradas obrigatórias:');
  for (const entry of missingWorkspaceEntries) {
    console.error(`- ${entry}`);
  }
  process.exit(1);
}

console.log('Workspace validado com sucesso.');
