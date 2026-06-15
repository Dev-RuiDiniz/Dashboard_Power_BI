# Importar `.dmp` Oracle localmente via Docker

Este fluxo sobe um Oracle Database Free local para receber um arquivo `.dmp` Oracle Data Pump, como:

- `C:\Users\RUI FRANCISCO\Desktop\exp_full_xecdb_20260612-1215.dmp`

## O que este setup faz

- sobe um container Oracle dedicado e isolado da stack atual do dashboard
- monta a pasta do dump do Windows dentro do container
- cria um `DIRECTORY` Oracle para o Data Pump
- executa `impdp` em modo `full` ou `schema`

## Arquivos envolvidos

- [infra/docker/docker-compose.oracle-import.yml](</C:/Users/RUI%20FRANCISCO/Documents/GitHub/Dashboard%20(Gusm%C3%A3o)/Dashboard_Power_BI/infra/docker/docker-compose.oracle-import.yml>)
- [infra/env/.env.oracle.example](</C:/Users/RUI%20FRANCISCO/Documents/GitHub/Dashboard%20(Gusm%C3%A3o)/Dashboard_Power_BI/infra/env/.env.oracle.example>)
- [scripts/oracle/import-dmp.ps1](</C:/Users/RUI%20FRANCISCO/Documents/GitHub/Dashboard%20(Gusm%C3%A3o)/Dashboard_Power_BI/scripts/oracle/import-dmp.ps1>)

## 1. Criar o arquivo de ambiente

Copie:

```powershell
Copy-Item infra/env/.env.oracle.example infra/env/.env.oracle
```

Ajuste os campos mais importantes em `infra/env/.env.oracle`:

```env
ORACLE_DUMP_DIR_HOST=C:/Users/RUI FRANCISCO/Desktop
ORACLE_DUMP_FILE=exp_full_xecdb_20260612-1215.dmp
ORACLE_PASSWORD=Oracle123!
ORACLE_DATABASE=FREEPDB1
ORACLE_IMPORT_MODE=full
```

## 2. Subir o Oracle local

```powershell
docker compose --env-file infra/env/.env.oracle -f infra/docker/docker-compose.oracle-import.yml up -d
```

Acesso esperado:

- Oracle Listener: `localhost:1521`
- Oracle Enterprise Manager Express: `https://localhost:5500/em`
- Service/PDB sugerido: `FREEPDB1`

## 3. Rodar a importacao do dump

```powershell
.\scripts\oracle\import-dmp.ps1
```

Se quiser usar outro arquivo env:

```powershell
.\scripts\oracle\import-dmp.ps1 -EnvFile infra/env/.env.oracle
```

## 4. Quando usar `full` e quando usar `schema`

`full`:

- tenta importar o dump inteiro
- util quando o dump foi feito para restauracao ampla
- pode falhar se o dump tiver objetos administrativos, tablespaces ou schemas de sistema nao compativeis com Oracle Free

`schema`:

- mais seguro para onboarding
- exige preencher:

```env
ORACLE_IMPORT_MODE=schema
ORACLE_IMPORT_SCHEMAS=MEU_SCHEMA
```

## 5. Validar o que entrou

Entrar no SQL\*Plus:

```powershell
docker exec -it dashboard-power-bi-oracle-import sqlplus system/Oracle123!@//dashboard-power-bi-oracle-import:1521/FREEPDB1
```

Exemplos de consulta:

```sql
SELECT username FROM all_users ORDER BY username;
SELECT owner, table_name FROM all_tables ORDER BY owner, table_name;
SELECT owner, object_name, object_type FROM all_objects WHERE owner NOT IN ('SYS', 'SYSTEM') ORDER BY owner, object_type, object_name;
```

## 6. Observacoes importantes

- Este projeto hoje consome SQL Server, nao Oracle, entao esta etapa serve para abrir e inspecionar o dump localmente.
- Muitos dumps `exp_full` nao importam 100% em um ambiente Free sem ajustes.
- Se o `full` falhar, o proximo passo recomendado costuma ser:
  - identificar o schema de negocio
  - trocar para `schema`
  - importar apenas o necessario

## 7. Proximo passo depois da importacao

Depois que o dump abrir corretamente, podemos seguir por um destes caminhos:

1. mapear tabelas/views e migrar para o SQL Server do projeto
2. adaptar a API para ler Oracle diretamente
3. montar uma sincronizacao Oracle -> SQL Server
