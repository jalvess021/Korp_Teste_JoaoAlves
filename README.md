# Sistema de Estoque e Faturamento

Aplicação para gestão de produtos e faturamento, com arquitetura de microserviços, foco em desempenho, consistência de dados e boas práticas de engenharia.

## 📋 Sumário

- [Visão Geral](#visao-geral)
- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Tecnologias](#tecnologias)
- [Como Executar](#como-executar)
- [Funcionalidades](#funcionalidades)
- [Responsividade](#responsividade)
- [Simulação de Falha de Serviço](#simulacao-de-falha-de-servico)
- [Padrões e Decisões Técnicas](#padroes-e-decisoes-tecnicas)
- [Autor](#autor)
- [Licença](#licenca)

---

<a id="visao-geral"></a>
## 🎯 Visão Geral

Sistema para operação de estoque e notas fiscais com fluxo completo de criação, consulta e fechamento.

Objetivo técnico do projeto:
- manter código limpo e simples,
- aplicar padrões sólidos sem overengineering,
- priorizar funcionalidade real e performance do fluxo.

---

<a id="arquitetura"></a>
## 🏗️ Arquitetura

```
┌─────────────────┐
│   Frontend      │  Angular 21 + TailwindCSS
│   :4200         │  (Standalone Components + Signals)
└────────┬────────┘
         │ HTTP Proxy
    ┌────┴────┬──────────────────┐
    │         │                  │
┌───▼────┐ ┌──▼──────────┐ ┌────▼──────┐
│Estoque │ │Faturamento  │ │PostgreSQL │
│ :5002  │ │:5001        │ │   :5432   │
└───┬────┘ └────┬────────┘ └───────────┘
    │           │
    └── HTTP ───┘
```

### Serviços

**Estoque (`estoque/`)**
- cadastro e consulta de produtos,
- débito transacional de saldo,
- porta padrão: `5002`.

**Faturamento (`faturamento/`)**
- criação e consulta de notas fiscais,
- fechamento/impressão com idempotência,
- integração com estoque via HTTP,
- porta padrão: `5001`.

**Frontend (`frontend/`)**
- interface Angular para operação completa,
- proxy para APIs backend,
- porta padrão: `4200`.

---

<a id="estrutura-de-pastas"></a>
## 📁 Estrutura de Pastas

```
estoque/
  cmd/main/
  internal/
    bootstrap/
    config/
    domain/
    handler/
    infra/
    repository/
    service/

faturamento/
  cmd/main/
  internal/
    bootstrap/
    config/
    domain/
    handler/
    infra/
    repository/
    service/

frontend/
  src/app/
    components/
    models/
    services/
```

---

<a id="tecnologias"></a>
## 🛠️ Tecnologias

### Backend
- Go 1.25
- Gin
- PostgreSQL 16
- Air (hot reload)

### Frontend
- Angular 21
- TypeScript
- TailwindCSS 4
- RxJS

### Infra
- Docker
- Docker Compose

---

<a id="como-executar"></a>
## 🚀 Como Executar

### Pré-requisitos
- Docker
- Docker Compose

### Subir ambiente

```bash
git clone https://github.com/jalvess021/Korp_Teste_JoaoAlves.git
cd Korp_Teste_JoaoAlves
cp .env.example .env

# ambiente dev
docker-compose -f docker-compose.dev.yml up --build

# ambiente build final
# docker-compose -f docker-compose.yml up --build
```

### Portas (por `.env`)
- `FRONTEND_PORT` (padrão: `4200`)
- `ESTOQUE_PORT` (padrão: `5002`)
- `FATURAMENTO_PORT` (padrão: `5001`)
- `DB_PORT` (padrão: `5432`)

---

<a id="funcionalidades"></a>
## ⚙️ Funcionalidades

- Cadastro e listagem de produtos
- Criação de notas com múltiplos itens
- Listagem e detalhamento de notas fiscais
- Impressão/fechamento de nota com atualização de estoque
- Simulação controlada de indisponibilidade entre microserviços
- Paginação, filtros e feedback visual no frontend

---

<a id="responsividade"></a>
## 📱 Responsividade

- Interface adaptada para desktop, tablet e mobile.
- Layout com breakpoints responsivos (TailwindCSS) em navegação, formulários, tabelas e ações principais.
- Componentes críticos (cadastro/listagem de produtos e notas fiscais) mantêm usabilidade em telas menores.

---

<a id="simulacao-de-falha-de-servico"></a>
## 🧪 Simulação de Falha de Serviço

- Ativação por header HTTP (`X-Simulate-Stock-Failure: true`) no fluxo de impressão.
- O Faturamento propaga o sinal para o Estoque e fecha o ciclo de comunicação entre microserviços.
- O cenário simula indisponibilidade (`503`) para validar retry com backoff e tratamento de erro ponta a ponta.

---

<a id="padroes-e-decisoes-tecnicas"></a>
## 🧠 Padrões e Decisões Técnicas

### Princípios de design
- Clean Code como base de legibilidade e manutenção
- foco em solução prática para o escopo (sem invenção desnecessária)
- simplicidade orientada a performance

### Padrões aplicados
- Clean Architecture em cada microserviço
- Repository Pattern para isolamento de acesso a dados
- separação por camadas (`handler`, `service`, `repository`, `domain`, `infra`)

### Confiabilidade de negócio
- idempotência no processo de impressão de nota
- proteção contra concorrência em operações críticas
- retry com backoff para comunicação entre serviços
- tratamento de indisponibilidade (`503`) e mapeamento de erro entre microserviços
- validações de regra de negócio no fluxo completo

Exemplo simplificado de idempotência (faturamento):

```go
INSERT INTO invoice_prints (invoice_id, idempotency_key, status)
VALUES ($1, $2, 'IN_PROGRESS')
ON CONFLICT (invoice_id, idempotency_key) DO NOTHING
```

---

<a id="autor"></a>
## 👤 Autor

João Alves — [@jalvess021](https://github.com/jalvess021)

---

<a id="licenca"></a>
## 📄 Licença

Projeto proprietário. Uso, cópia, modificação, redistribuição e venda não são permitidos sem autorização expressa do autor.

Consulte [LICENSE](./LICENSE).
