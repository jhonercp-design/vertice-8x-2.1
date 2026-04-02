# Máquina de Vendas - Vértice 8x - TODO

## Fase 1: Fundação
- [x] Design System de Luxo (Navy/Slate/Orange, tipografia premium, tokens)
- [x] Schema do banco de dados (empresas, licenças, leads, deals, atividades, mensagens, diagnósticos)
- [x] Estrutura de navegação DashboardLayout com sidebar tipo cockpit
- [x] Roteamento completo (todas as páginas registradas)

## Fase 2: Dashboard de Comando
- [x] Dashboard Executivo com KPIs em tempo real
- [x] Termômetro de Gestão (onde acelerar/reduzir/focar)
- [x] Onboarding Estratégico (Maturity Score, GAP de Receita, projeção ROI)
- [x] Cards de métricas animados com Framer Motion

## Fase 3: Trilha de Transformação
- [x] Trilha dos 5 Pilares do Método Vértice (Anatomia, Arquitetura, Ativação, Aceleração, Autoridade)
- [x] Sistema de desbloqueio progressivo por pilar
- [x] Conteúdo e tarefas por etapa
- [x] Indicadores de progresso visual

## Fase 4: Inteligência Artificial
- [x] Copiloto IA Agêntico (chat com contexto da empresa, scripts de prospecção, análise de pipeline)
- [x] Agente de Governança Comercial (AGC) - auditoria horária 7h-19h, tom executivo
- [x] Integração LLM (invokeLLM) para ambos os agentes
- [x] Painel de alertas e recomendações do AGC

## Fase 5: CRM e WhatsApp
- [x] CRM com gestão de Leads e Deals (lista + pipeline view)
- [x] Timeline Unificada (diagnóstico, propostas, mensagens, calls)
- [x] Integração WhatsApp Multi-Atendente com QR Code
- [x] Sincronização de mensagens WhatsApp na Timeline do Lead

## Fase 6: Licenciamento e Admin
- [x] Painel Master Admin (gestão de empresas, usuários, limites de assentos)
- [x] Dashboard Financeiro (MRR, Churn, LTV, faturamento)
- [x] Controle de licenças e planos
- [ ] Sistema Multi-Tenant completo (isolamento real por empresa - Fase 2)

## Fase 7: Automações e Testes
- [x] Automações inteligentes (gatilhos CRM → WhatsApp)
- [x] Alertas automáticos do AGC → ações
- [x] Testes Vitest para routers e lógica de negócio (5/5 passando)
- [x] Refinamento de UI/UX e responsividade

## Fase 8: Entrega
- [x] Configurações (perfil, notificações, preferências)
- [x] Checkpoint final
- [ ] Validação end-to-end
- [ ] Entrega do link funcional

## Backlog (Pós-Clientes)
- [ ] CRUD real de leads no CRM (backend + frontend)
- [ ] CRUD real de deals com pipeline drag-and-drop
- [ ] Integração WhatsApp real (Baileys/Evolution API)
- [ ] AGC com auditoria real de hora em hora (cron job)
- [ ] Trilha com progresso persistido no banco
- [ ] Onboarding com dados salvos e relatório PDF
- [ ] Automações com engine de execução real
- [ ] Dashboard com dados reais do banco
- [ ] Sistema de notificações push
- [ ] Multi-tenancy completo (isolamento por empresa)
- [ ] Roles e permissões granulares
- [ ] Integração com calendário para agendamentos
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Webhook para integrações externas
