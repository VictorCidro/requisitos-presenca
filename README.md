# Projeto: Sistema de Registro de Presença em Oficinas de Ensino

Este projeto tem como objetivo desenvolver um sistema para que os próprios alunos possam registrar sua presença nas oficinas de ensino do projeto.

## Integrantes do grupo:
- Victor Hugo Kendi Takehana    RA: 2418380
- Victor Luiz Montelares Cidro  RA: 2418398

## Estrutura do repositório:
- `src/` - código-fonte do sistema
- `docs/` - requisitos funcionais e diagrama



# Configuração do Ambiente de Desenvolvimento
## Requisitos:
- Node.js 20.10
- React 19.1  
- PostgreSQL / MongoDB instalado

## Passos:
1. Clonar o repositório:  
   `git clone https://github.com/VictorCidro/requisitos-presenca.git`

2. Acessar o diretório do projeto:  
   `cd registro-presenca`

3. Instalar dependências:
   - Para o backend (Node.js + Express):  
     `cd src/backend`  
     `npm install`
   - Para o frontend (React):  
     `cd ../../frontend`  
     `npm install`

4. Rodar o sistema:
   - Backend:  
     `cd src/backend`  
     `npm start`
   - Frontend:  
     `cd ../../frontend`  
     `npm start`

5. Acessar no navegador:  
   `http://localhost:3000`




# Estratégia de Testes Automatizados - Projeto de Registro de Presença
## Visão Geral
Nosso projeto adotará testes automatizados para garantir a qualidade e a estabilidade do sistema. Serão aplicados testes no backend (Node.js), frontend (React) e integração com o banco de dados (PostgreSQL).

## Tecnologias e Bibliotecas de Testes

### Backend (Node.js)
- **Framework:** Jest + Supertest
- **Objetivo:** Testar rotas da API, autenticação, registro de presença e regras de negócio.

### Frontend (React)
- **Framework:** Jest + React Testing Library
- **Objetivo:** Testar componentes de interface e interação do usuário com formulários de login e presença.


## Estratégia de Testes
- **Testes de unidade (unit tests):**
  - Funções isoladas (ex: validação de dados).
- **Testes de integração:**
  - Conexão backend ↔ banco de dados.
- **Testes end-to-end (E2E):**
  - Fluxo completo do usuário: login → registro de presença → visualização.