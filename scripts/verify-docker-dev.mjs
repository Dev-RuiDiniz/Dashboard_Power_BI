import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'infra/docker/docker-compose.dev.yml',
  'infra/docker/api.Dockerfile',
  'infra/docker/web.Dockerfile',
  'infra/env/.env.example',
  'docs/devops.md',
  'docs/environment.md',
];

const missingFiles = requiredFiles.filter((path) => !existsSync(resolve(root, path)));

if (missingFiles.length > 0) {
  console.error('Infraestrutura Docker inválida. Arquivos ausentes:');
  for (const file of missingFiles) console.error(`- ${file}`);
  process.exit(1);
}

const compose = readFileSync(resolve(root, 'infra/docker/docker-compose.dev.yml'), 'utf8');
const envExample = readFileSync(resolve(root, 'infra/env/.env.example'), 'utf8');

const requiredServices = ['api:', 'web:', 'redis:'];
const missingServices = requiredServices.filter((service) => !compose.includes(service));

if (missingServices.length > 0) {
  console.error('docker-compose.dev.yml sem serviços obrigatórios:');
  for (const service of missingServices) console.error(`- ${service}`);
  process.exit(1);
}

const requiredVariables = [
  'API_PORT',
  'WEB_PORT',
  'NEXT_PUBLIC_API_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  'SQLSERVER_HOST',
  'SQLSERVER_PORT',
  'SQLSERVER_DATABASE',
  'SQLSERVER_USER',
  'SQLSERVER_PASSWORD',
  'SQLSERVER_ENCRYPT',
  'SQLSERVER_TRUST_SERVER_CERTIFICATE',
];

const missingVariables = requiredVariables.filter((variable) => !envExample.includes(`${variable}=`));

if (missingVariables.length > 0) {
  console.error('.env.example sem variáveis obrigatórias:');
  for (const variable of missingVariables) console.error(`- ${variable}`);
  process.exit(1);
}

console.log('Docker Compose de desenvolvimento validado com sucesso.');
