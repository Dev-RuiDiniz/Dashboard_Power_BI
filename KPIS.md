# KPIs Sugeridos para Dashboard Power BI

Baseado na análise do banco de dados Oracle conectado, identifiquei um sistema de gestão agrícola/agronegócio com dados financeiros, comerciais, operacionais e de produção. Abaixo estão as sugestões de KPIs organizadas por área de negócio.

## 📊 Visão Geral dos Dados Disponíveis

### Schemas Principais

- **EXTRATOR**: Tabelas de dashboard, extrações e análises
- **AGNEW**: Dados financeiros (fluxo de caixa, orçamentos, custos)
- **ABACO**: Sistema complementar
- **UNISYSTEM**: Sistema de controle e auditoria

### Áreas de Negócio Identificadas

1. Gestão Comercial (clientes, pedidos de venda)
2. Gestão Financeira (fluxo de caixa, orçamentos, custos)
3. Gestão de Produção Agrícola (plantio, colheita, talhões, safras)
4. Monitoramento Climático (pluviometria)
5. Gestão de Crédito e Fixações
6. Programação de Embarques

---

## 💰 KPIs Financeiros

### Fluxo de Caixa

- **Saldo de Caixa Atual**: Valor total disponível em caixa
- **Fluxo de Caixa Mensal**: Entradas vs Saídas por mês
- **Previsão de Fluxo de Caixa**: Projeção para os próximos 6 meses
- **Contas a Receber vs a Pagar**: Comparativo de valores em aberto
- **Concentração de Vencimentos**: Distribuição de pagamentos por período

### Orçamento e Custos

- **Execução Orçamentária**: % do orçamento realizado vs planejado
- **Variação Orçamentária**: Diferença entre orçado e realizado (BRL/USD)
- **Custo por Hectare**: Custo médio por área plantada
- **Custo por Cultura**: Comparativo de custos entre diferentes culturas
- **Margem de Contribuição**: Receita - Custos Variáveis por produto

### Indicadores de Liquidez

- **Liquidez Corrente**: Ativo Circulante / Passivo Circulante
- **Liquidez Imediata**: Disponibilidades / Passivo Circulante
- **Giro do Caixa**: Número de vezes que o caixa gira no período

---

## 📈 KPIs Comerciais

### Vendas e Pedidos

- **Valor Total de Pedidos**: Soma de pedidos de venda por período
- **Ticket Médio por Cliente**: Valor médio dos pedidos por cliente
- **Taxa de Conversão**: Pedidos fechados / Propostas enviadas
- **Crescimento de Vendas**: % de crescimento vs período anterior
- **Top 10 Clientes**: Ranking por valor de compras

### Gestão de Clientes

- **Base de Clientes Ativos**: Número de clientes com compras no período
- **Novos Clientes**: Clientes adquiridos no período
- **Churn Rate**: Taxa de cancelamento de clientes
- **Lifetime Value (LTV)**: Valor total gerado por cliente
- **Segmentação por Região**: Distribuição de clientes por regional

### Pipeline Comercial

- **Valor em Pipeline**: Soma de oportunidades em negociação
- **Taxa de Fechamento**: % de oportunidades convertidas
- **Tempo Médio de Fechamento**: Duração média do ciclo de vendas
- **Funil de Vendas**: Distribuição por etapa (Proposta, Negociação, Fechamento)

---

## 🌾 KPIs de Produção Agrícola

### Plantio e Colheita

- **Área Plantada Total**: Hectares plantados por safra
- **Área Colhida Total**: Hectares colhidos por safra
- **Produtividade por Hectare**: Produção / Área plantada
- **Eficiência de Colheita**: % da área colhida vs planejada
- **Progresso de Safra**: % do ciclo agrícola concluído

### Gestão de Talhões

- **Número de Talhões Ativos**: Quantidade de talhões em produção
- **Status dos Talhões**: Distribuição por status (Plantio, Crescimento, Colheita)
- **Produtividade por Talhão**: Comparativo entre talhões
- **Variedades Plantadas**: Distribuição por variedade/cultura
- **Mapa de Talhões**: Visualização geográfica das áreas

### Safras

- **Safras Ativas**: Número de safras em andamento
- **Performance por Safra**: Comparativo de resultados entre safras
- **Ciclo Médio de Safra**: Duração média do ciclo produtivo
- **Volume Produzido**: Quantidade total produzida por safra

---

## 🌧️ KPIs Climáticos

### Pluviometria

- **Precipitação Acumulada**: Total de chuva por período
- **Média de Chuva Mensal**: Comparativo com histórico
- **Índice Pluviométrico**: Classificação (seco, normal, chuvoso)
- **Distribuição por Região**: Chuva por fazenda/região
- **Impacto na Produção**: Correlação entre chuva e produtividade

### Monitoramento

- **Estações Ativas**: Número de estações pluviométricas
- **Alertas Climáticos**: Eventos extremos registrados
- **Tendência Pluviométrica**: Projeção baseada em histórico

---

## 🏦 KPIs de Crédito e Fixações

### Cessão de Crédito

- **Volume de Crédito Concedido**: Valor total de crédito aprovado
- **Taxa de Aprovação**: % de solicitações aprovadas
- **Inadimplência**: % de crédito em atraso
- **Concentração de Risco**: % de crédito por cliente/região
- **Takeup Rate**: % de crédito utilizado vs disponível

### Fixações

- **Volume Fixado**: Valor total de fixações
- **Preço Médio de Fixação**: Valor médio por contrato
- **Taxa de Fixação**: % da produção fixada
- **Performance de Fixação**: Ganho/perda vs mercado

---

## 🚢 KPIs Logísticos

### Embarques

- **Volume Embarcado**: Quantidade total embarcada
- **Cumprimento de Prazos**: % de embarques no prazo
- **Capacidade Utilizada**: % da capacidade logística utilizada
- **Tempo de Embarque**: Tempo médio desde solicitação até embarque
- **Programação vs Realizado**: Comparativo entre planejado e executado

---

## 🎯 KPIs Estratégicos

### Indicadores Gerais

- **Projetos Ativos**: Número de projetos em andamento
- **Exportações Concluídas**: Volume de exportações realizadas
- **SLA Médio**: Nível de serviço médio geral
- **Eficiência Operacional**: % de processos automatizados
- **Satisfação do Cliente**: Índice de satisfação (se disponível)

### Mapas Gerenciais

- **Mapa de Fazendas**: Visualização geográfica de todas as fazendas
- **Mapa Comercial**: Distribuição de clientes por região
- **Mapa de Produção**: Distribuição de áreas por cultura
- **Mapa de Risco**: Áreas com maior risco climático/operacional

---

## 📱 Sugestões de Visualizações

### Dashboard Principal (Home)

- **Cards de KPIs**: Saldo caixa, Vendas mês, Área plantada, SLA médio
- **Gráfico de Linha**: Fluxo de caixa mensal (últimos 12 meses)
- **Gráfico de Barras**: Vendas por regional
- **Gauge**: Execução orçamentária
- **Mapa**: Distribuição geográfica de fazendas/clientes

### Dashboard Financeiro

- **Gráfico de Área**: Entradas vs Saíras por mês
- **Gráfico de Pizza**: Composição de custos por categoria
- **Tabela**: Top 10 maiores despesas
- **Gráfico de Linha**: Previsão de fluxo de caixa
- **KPI Cards**: Margem operacional, ROI, Liquidez

### Dashboard Comercial

- **Funil de Vendas**: Pipeline por etapa
- **Gráfico de Barras**: Top clientes por valor
- **Gráfico de Linha**: Evolução de vendas (últimos 6 meses)
- **Tabela**: Pedidos em aberto por status
- **Mapa**: Clientes por região

### Dashboard de Produção

- **Gráfico de Barras**: Produtividade por talhão
- **Gráfico de Pizza**: Área por cultura
- **Linha do Tempo**: Progresso da safra atual
- **Mapa**: Talhões com status colorido
- **Tabela**: Resumo por fazenda

### Dashboard Climático

- **Gráfico de Linha**: Precipitação acumulada por mês
- **Gráfico de Barras**: Chuva por fazenda
- **Mapa de Calor**: Distribuição pluviométrica
- **Tabela**: Alertas climáticos recentes
- **Comparativo**: Atual vs Média histórica

---

## 🔧 Implementação Sugerida

### Prioridade Alta (Fase 1)

1. Dashboard Financeiro - Fluxo de caixa e orçamento
2. Dashboard Comercial - Vendas e pipeline
3. Cards de KPIs principais na home

### Prioridade Média (Fase 2)

1. Dashboard de Produção - Talhões e safras
2. Dashboard Climático - Pluviometria
3. Mapas gerenciais

### Prioridade Baixa (Fase 3)

1. Dashboard de Crédito e Fixações
2. Dashboard Logístico
3. Análises avançadas e correlações

---

## 📋 Tabelas Principais para Consultas

### Financeiro

- `AGNEW.VM_FLUXO_CAIXA` - Movimentação de caixa
- `AGNEW.VM_ORCAMENTO` - Dados orçamentários
- `AGNEW.VM_CUSTO_GERAL` - Custos gerais
- `AGNEW.VM_PREVISAO_FLUXO_CAIXA` - Previsões

### Comercial

- `EXTRATOR.EXT_GST_COMERCIAL_CLIENTE` - Clientes
- `EXTRATOR.EXT_GST_COMERCIAL_PV` - Pedidos de venda
- `EXTRATOR.EXT_GST_COMERCIAL_PV_ITEM` - Itens dos pedidos

### Produção

- `EXTRATOR.EXT_COL_OS_PLANTIO` - Operações de plantio
- `EXTRATOR.EXT_COL_OS_COLHEITA` - Operações de colheita
- `EXTRATOR.EXT_PLUV_TALHOES` - Talhões
- `EXTRATOR.EXT_PLUV_SAFRAS` - Safras

### Climático

- `EXTRATOR.EXT_PLUV_MEDICOES` - Medições pluviométricas
- `EXTRATOR.EXT_PLUV_DATAS` - Datas de medição

### Dashboard

- `EXTRATOR.UNI_DASHBOARD` - Configurações de dashboard
- `EXTRATOR.UNI_DASHBOARD_SQL` - Queries de dashboard

---

## 💡 Recomendações Adicionais

1. **Filtros Globais**: Implementar filtros de data, safra, fazenda e cultura em todos os dashboards
2. **Drill-down**: Permitir navegação do resumo para detalhes (ex: regional → cliente → pedido)
3. **Alertas**: Configurar alertas automáticos para KPIs críticos (ex: caixa abaixo do mínimo)
4. **Comparativos**: Sempre incluir comparação com período anterior (M-1, M-12)
5. **Metas**: Definir metas para cada KPI e mostrar progresso vs meta
6. **Exportação**: Permitir exportação de dados para Excel/CSV
7. **Agendamento**: Opção de agendar relatórios por e-mail
8. **Mobile-friendly**: Garantir que visualizações funcionem em dispositivos móveis

---

## 🎨 Paleta de Cores Sugerida

- **Verde**: Produção, crescimento, metas positivas
- **Azul**: Financeiro, caixa, estabilidade
- **Laranja**: Alertas, atenção
- **Vermelho**: Crítico, negativo
- **Roxo**: Estratégico, direção
- **Cinza**: Neutro, contexto

---

Este documento serve como base para priorização e implementação dos dashboards. Os KPIs podem ser ajustados conforme as necessidades específicas do negócio e disponibilidade de dados.
