FROM mcr.microsoft.com/mssql/server:2022-latest

USER root

RUN apt-get update \
  && apt-get install -y curl gnupg apt-transport-https \
  && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
  && curl https://packages.microsoft.com/config/ubuntu/22.04/prod.list > /etc/apt/sources.list.d/mssql-release.list \
  && apt-get update \
  && ACCEPT_EULA=Y apt-get install -y mssql-tools18 unixodbc-dev \
  && ln -s /opt/mssql-tools18/bin/sqlcmd /usr/local/bin/sqlcmd \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

COPY infra/docker/sqlserver/entrypoint.sh /usr/local/bin/demo-sql-entrypoint.sh
COPY infra/docker/sqlserver/init-demo.sql /docker-entrypoint-initdb.d/init-demo.sql

RUN chmod +x /usr/local/bin/demo-sql-entrypoint.sh

USER mssql

ENTRYPOINT ["/usr/local/bin/demo-sql-entrypoint.sh"]
