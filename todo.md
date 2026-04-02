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

### Testes e Entrega
- [x] Testes vitest para todos os routers (28 testes, todos passando)
- [x] Validação end-to-end
- [x] Checkpoint final e entrega
