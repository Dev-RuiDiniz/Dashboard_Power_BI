#!/bin/bash
set -euo pipefail

PASSWORD="${MSSQL_SA_PASSWORD:-${SA_PASSWORD:-}}"
DATABASE_NAME="${SQLSERVER_DATABASE:-DashboardPowerBI}"

/opt/mssql/bin/sqlservr &
SQL_PID=$!

until sqlcmd -S localhost -U sa -P "$PASSWORD" -C -Q "SELECT 1" >/dev/null 2>&1; do
  sleep 2
done

sed "s/__DB_NAME__/${DATABASE_NAME}/g" /docker-entrypoint-initdb.d/init-demo.sql > /tmp/init-demo.sql
sqlcmd -S localhost -U sa -P "$PASSWORD" -C -i /tmp/init-demo.sql

wait "$SQL_PID"
