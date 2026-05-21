import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'README.md',
  'docs/setup.md',
  'docs/architecture.md',
  'docs/api.md',
  'docs/web.md',
  'docs/design-system.md',
  'docs/devops.md',
  'docs/environment.md',
  'docs/quality.md',
  'docs/decisions/README.md',
  'docs/decisions/ADR-0001-monorepo.md',
  'docs/decisions/ADR-0002-tooling-qualidade.md',
  'docs/decisions/ADR-0003-nestjs-api.md',
  'docs/decisions/ADR-0004-nextjs-web.md',
  'docs/decisions/ADR-0005-design-system-base.md',
  'docs/decisions/ADR-0006-docker-compose-dev.md',
];

const missingFiles = requiredFiles.filter((file) => !existsSync(resolve(root, file)));

if (missingFiles.length > 0) {
  console.error('Documentação obrigatória ausente:');
  for (const file of missingFiles) console.error(`- ${file}`);
  process.exit(1);
}

const readme = readFileSync(resolve(root, 'README.md'), 'utf8');

const requiredReadmeSections = [
  '## Setup rápido',
  '## Checklist de setup local',
  '## Desenvolvimento sem Docker',
  '## Desenvolvimento com Docker',
  '## Arquitetura e monorepo',
  '## Decisões arquiteturais',
  '## Troubleshooting',
  '## Segurança',
];

const missingSections = requiredReadmeSections.filter((section) => !readme.includes(section));

if (missingSections.length > 0) {
  console.error('README sem seções obrigatórias:');
  for (const section of missingSections) console.error(`- ${section}`);
  process.exit(1);
}

const requiredCommands = [
  'pnpm install',
  'pnpm verify:workspace',
  'pnpm verify:docker',
  'pnpm verify:docs',
  'pnpm quality',
  'pnpm dev:api',
  'pnpm dev:web',
  'pnpm docker:dev',
];

const missingCommands = requiredCommands.filter((command) => !readme.includes(command));

if (missingCommands.length > 0) {
  console.error('README sem comandos obrigatórios:');
  for (const command of missingCommands) console.error(`- ${command}`);
  process.exit(1);
}

console.log('Documentação inicial validada com sucesso.');
