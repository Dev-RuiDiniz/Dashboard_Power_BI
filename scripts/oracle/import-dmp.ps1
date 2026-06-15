param(
  [string]$EnvFile = "infra/env/.env.oracle",
  [switch]$SkipStartup
)

$ErrorActionPreference = "Stop"

function Read-EnvFile {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Arquivo de ambiente não encontrado: $Path"
  }

  $values = @{}

  foreach ($line in Get-Content -LiteralPath $Path) {
    $trimmed = $line.Trim()

    if ($trimmed.Length -eq 0 -or $trimmed.StartsWith("#")) {
      continue
    }

    $separatorIndex = $trimmed.IndexOf("=")

    if ($separatorIndex -lt 1) {
      continue
    }

    $key = $trimmed.Substring(0, $separatorIndex).Trim()
    $value = $trimmed.Substring($separatorIndex + 1).Trim()
    $values[$key] = $value
  }

  return $values
}

function Get-RequiredValue {
  param(
    [hashtable]$Values,
    [string]$Key
  )

  if (-not $Values.ContainsKey($Key) -or [string]::IsNullOrWhiteSpace($Values[$Key])) {
    throw "Variavel obrigatoria ausente em ${EnvFile}: $Key"
  }

  return $Values[$Key]
}

function Wait-ForContainerHealth {
  param(
    [string]$ContainerName,
    [int]$TimeoutSeconds = 1200
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    $status = docker inspect --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" $ContainerName 2>$null

    if ($LASTEXITCODE -eq 0) {
      $status = $status.Trim()

      if ($status -eq "healthy") {
        return
      }
    }

    Start-Sleep -Seconds 10
  }

  throw "Timeout aguardando o container $ContainerName ficar saudavel."
}

$envValues = Read-EnvFile -Path $EnvFile

$composeFile = "infra/docker/docker-compose.oracle-import.yml"
$containerName = Get-RequiredValue -Values $envValues -Key "ORACLE_CONTAINER_NAME"
$oraclePassword = Get-RequiredValue -Values $envValues -Key "ORACLE_PASSWORD"
$oracleDatabase = Get-RequiredValue -Values $envValues -Key "ORACLE_DATABASE"
$hostDumpDir = Get-RequiredValue -Values $envValues -Key "ORACLE_DUMP_DIR_HOST"
$dumpFile = Get-RequiredValue -Values $envValues -Key "ORACLE_DUMP_FILE"
$importMode = (Get-RequiredValue -Values $envValues -Key "ORACLE_IMPORT_MODE").ToLowerInvariant()
$directoryName = Get-RequiredValue -Values $envValues -Key "ORACLE_IMPORT_DIRECTORY"
$logFile = Get-RequiredValue -Values $envValues -Key "ORACLE_IMPORT_LOGFILE"
$tableExistsAction = Get-RequiredValue -Values $envValues -Key "ORACLE_IMPORT_TABLE_EXISTS_ACTION"
$extraParams = $envValues["ORACLE_IMPORT_EXTRA_PARAMS"]
$schemas = $envValues["ORACLE_IMPORT_SCHEMAS"]

$resolvedDumpDir = [System.IO.Path]::GetFullPath($hostDumpDir)
$resolvedDumpPath = Join-Path $resolvedDumpDir $dumpFile

if (-not (Test-Path -LiteralPath $resolvedDumpDir)) {
  throw "Diretorio do dump nao encontrado: $resolvedDumpDir"
}

if (-not (Test-Path -LiteralPath $resolvedDumpPath)) {
  throw "Arquivo dump nao encontrado: $resolvedDumpPath"
}

if (-not $SkipStartup) {
  docker compose --env-file $EnvFile -f $composeFile up -d oracle

  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao subir o container Oracle."
  }
}

Wait-ForContainerHealth -ContainerName $containerName

$directorySql = @"
WHENEVER SQLERROR EXIT SQL.SQLCODE
CREATE OR REPLACE DIRECTORY $directoryName AS '/opt/oracle/dumpfiles';
EXIT;
"@

$directorySql | docker exec -i $containerName sqlplus -s "system/$oraclePassword@//$containerName`:1521/$oracleDatabase"

if ($LASTEXITCODE -ne 0) {
  throw "Falha ao criar ou atualizar o DIRECTORY Oracle para importacao."
}

$importArguments = @(
  "system/$oraclePassword@//$containerName`:1521/$oracleDatabase"
  "DIRECTORY=$directoryName"
  "DUMPFILE=$dumpFile"
  "LOGFILE=$logFile"
  "TABLE_EXISTS_ACTION=$tableExistsAction"
)

switch ($importMode) {
  "full" {
    $importArguments += "FULL=Y"
  }
  "schema" {
    if ([string]::IsNullOrWhiteSpace($schemas)) {
      throw "ORACLE_IMPORT_SCHEMAS precisa ser preenchida quando ORACLE_IMPORT_MODE=schema."
    }

    $importArguments += "SCHEMAS=$schemas"
  }
  default {
    throw "ORACLE_IMPORT_MODE invalido: $importMode. Use full ou schema."
  }
}

if (-not [string]::IsNullOrWhiteSpace($extraParams)) {
  foreach ($token in ($extraParams -split "\s+")) {
    if (-not [string]::IsNullOrWhiteSpace($token)) {
      $importArguments += $token
    }
  }
}

Write-Host "Importando $dumpFile para $oracleDatabase usando modo $importMode..."
docker exec -i $containerName impdp @importArguments

if ($LASTEXITCODE -ne 0) {
  throw "A importacao Data Pump falhou. Verifique o logfile dentro do container: /opt/oracle/admin/$oracleDatabase/dpdump/$logFile ou rode docker logs $containerName."
}

Write-Host ""
Write-Host "Importacao concluida."
Write-Host "Container: $containerName"
Write-Host "Banco/PDB: $oracleDatabase"
Write-Host "Dump: $resolvedDumpPath"
Write-Host "Logico Oracle DIRECTORY: $directoryName -> /opt/oracle/dumpfiles"
