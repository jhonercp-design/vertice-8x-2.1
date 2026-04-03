# Máquina de Vendas - Vértice 8x - TODO

## Fundação (Concluído)
- [x] Design System, Schema DB, Navegação, Roteamento, Páginas visuais

## Funcionalizar Módulos

### CRM
- [x] Backend CRUD leads (criar, listar, editar, deletar)
- [x] Backend CRUD deals (criar, listar, mover estágio, deletar)
- [x] Backend atividades/timeline do lead
- [x] Frontend CRM conectado ao banco real
- [x] Frontend LeadDetail conectado ao banco real

### Dashboard
- [x] Backend KPIs reais (receita, leads, conversão, pipeline)
- [x] Backend Termômetro de Gestão dinâmico
- [x] Frontend Dashboard conectado ao banco real

### Trilha
- [x] Backend progresso da trilha persistido
- [x] Frontend Trilha conectada ao banco

### Onboarding
- [x] Backend salvar diagnóstico/maturity score
- [x] Frontend Onboarding persistindo dados

### AGC
- [x] Backend alertas reais baseados em dados do CRM
- [x] Frontend AGC com alertas do banco

### WhatsApp
- [x] Backend mensagens internas (chat entre usuários/leads)
- [x] Frontend WhatsApp conectado ao banco

### Automações
- [x] Backend CRUD automações (criar, listar, ativar/desativar)
- [x] Frontend Automações conectado ao banco

### Admin (SaaS Control Panel)
- [x] Backend CRUD empresas/clientes do SaaS
- [x] Backend dashboard financeiro real (MRR, churn, receita)
- [x] Backend controle de licenças e planos
- [x] Frontend Admin conectado ao banco real
- [x] Estrutura preparada para integração com gateway de pagamento (link de cobrança)

### Copiloto IA
- [x] Chat funcional com LLM (já implementado)

### Testes e Entrega (Rodada 1)
- [x] Testes vitest para todos os routers (28 testes, todos passando)
- [x] Validação end-to-end
- [x] Checkpoint final e entrega

## Integração Módulos do Project-51

### Sistema de Camadas e Permissões
- [x] Implementar 3 camadas: Direção, Gerente, Operacional (campo layer no schema)
- [x] Master Admin exclusivo via founderProcedure (OWNER_OPEN_ID)
- [x] Cada módulo com permissão por camada (canAccess no DashboardLayout)

### Reorganizar Navegação em 4 Verticais
- [x] Estratégia (Comando, Trilha, Metas, KPIs, ICP Builder, Forecast)
- [x] Operacional (CRM, WhatsApp, Playbooks, Propostas, Produtos, Projetos)
- [x] Analítico (AGC, Copiloto IA, Relatórios, Geração de Demanda, Pós-Venda, Gamificação)
- [x] Sistema (Automações, Onboarding, Metodologia, Master Admin, Configurações)

### Módulos Novos Criados
- [x] Metas (Goals) - CRUD de metas com progresso
- [x] KPIs - CRUD de indicadores com categorias e trends
- [x] ICP Builder - construtor de perfil de cliente ideal
- [x] Forecast - previsão de receita baseada em pipeline
- [x] Playbooks - CRUD de playbooks de vendas (SPIN, BANT, MEDDIC)
- [x] Propostas - CRUD de propostas comerciais com status
- [x] Produtos - CRUD de catálogo de produtos/serviços
- [x] Projetos - CRUD de projetos com status e budget
- [x] Relatórios - dashboard analítico com dados reais
- [x] Geração de Demanda - canais de aquisição e distribuição
- [x] Pós-Venda - gestão de clientes ativos e receita recorrente
- [x] Gamificação - conquistas, ranking e pontuação
- [x] Metodologia - referência do Método Vértice 8x e frameworks

### Backend Novos Routers
- [x] goals router (CRUD)
- [x] kpis router (CRUD)
- [x] products router (CRUD)
- [x] projects router (CRUD)
- [x] playbooks router (CRUD)
- [x] proposals router (CRUD)
- [x] gamification router (scores)

### Testes e Entrega (Rodada 2)
- [x] Testes vitest para todos os routers (43 testes, todos passando)
- [x] Validação visual no browser
- [x] Checkpoint e entrega final

## Bugs e Melhorias
- [x] Diagnosticar sobreposição de itens na sidebar (confirmado: sem overlaps no DOM)
- [x] Implementar grupos colapsáveis na sidebar (com persistência em localStorage)
- [x] Corrigir espaçamento entre grupos (melhorado com collapse)
