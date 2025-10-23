# Sistema de Gestão de Consultas Médicas

Sistema web completo para gerenciamento de clínica médica, desenvolvido com React, TypeScript e Tailwind CSS.

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Usar](#como-usar)
- [API e Endpoints](#api-e-endpoints)
- [Componentes Principais](#componentes-principais)
- [Contribuindo](#contribuindo)

---

## Sobre o Projeto

O **Sistema de Gestão de Consultas Médicas** é uma aplicação web moderna desenvolvida para facilitar a administração de clínicas médicas. O sistema permite o gerenciamento completo de pacientes, médicos, consultas e receitas médicas através de uma interface intuitiva e responsiva.

### Características Principais

- Interface moderna e responsiva com tema claro/escuro
- CRUD completo para todas as entidades (Pacientes, Médicos, Consultas e Receitas)
- Dashboard com estatísticas em tempo real
- Sistema de filtros avançados
- Validação de formulários com feedback visual
- Integração com API RESTful

---

## Tecnologias Utilizadas

### Frontend Framework
- **React** 19.1.1 - Biblioteca principal para construção da interface
- **TypeScript** 5.8.3 - Tipagem estática para maior segurança
- **React Router DOM** 6.27.0 - Roteamento client-side

### Build e Desenvolvimento
- **Vite** 7.1.7 - Build tool moderna com HMR
- **@vitejs/plugin-react** 5.0.3 - Plugin React com Fast Refresh

### UI e Estilização
- **Tailwind CSS** 4.1.14 - Framework CSS utility-first
- **shadcn/ui** - Biblioteca de componentes pré-construídos
- **Radix UI** - Primitivos acessíveis para componentes
- **lucide-react** 0.468.0 - Biblioteca de ícones
- **tailwindcss-animate** 1.0.7 - Utilitários de animação

### Formulários e Validação
- **react-hook-form** 7.63.0 - Gerenciamento performático de formulários
- **zod** 4.1.11 - Validação de schemas TypeScript-first
- **@hookform/resolvers** 5.2.2 - Adaptadores de validação

### HTTP e Comunicação
- **axios** 1.12.2 - Cliente HTTP baseado em Promises
  - URL base configurada: `http://localhost:8080/api`

### Qualidade de Código
- **ESLint** 9.36.0 - Linting JavaScript/TypeScript
- **typescript-eslint** 8.44.0 - Regras específicas TypeScript

---

## Funcionalidades

### 1. Dashboard
**Rota:** `/`

- Cartões estatísticos mostrando:
  - Total de pacientes cadastrados
  - Total de médicos cadastrados
  - Consultas agendadas
  - Consultas do dia
  - Consultas concluídas
  - Total de receitas emitidas

- Seção de atividades recentes:
  - Últimas 5 consultas realizadas
  - Últimas 5 receitas emitidas

- Layout responsivo (3 colunas desktop, 2 tablet, 1 mobile)

### 2. Gestão de Pacientes
**Rota:** `/pacientes`

**Operações CRUD:**
- Criar novo paciente
- Listar todos os pacientes
- Editar informações do paciente
- Excluir paciente do sistema

**Campos:**
- Nome completo (obrigatório)
- Email (obrigatório, validado)
- Telefone (opcional)
- Data de nascimento (opcional)
- Endereço (opcional)

**Recursos:**
- Filtro em tempo real por nome e email
- Validação de formulários com Zod
- Modo de edição inline
- Contagem de registros com resultados filtrados

### 3. Gestão de Médicos
**Rota:** `/medicos`

**Operações CRUD:**
- Adicionar novo médico
- Listar todos os médicos
- Editar informações do médico
- Remover médico (com confirmação)

**Campos:**
- Nome completo (obrigatório)
- Email (obrigatório)
- CRM (obrigatório, identificador único)
- Especialidade (opcional)
- Telefone (opcional)

**Recursos:**
- Filtros múltiplos: nome, email, CRM
- Validação de CRM
- Rastreamento de especialização
- Botão de confirmação para exclusão

### 4. Gestão de Consultas
**Rota:** `/consultas`

**Operações CRUD:**
- Agendar nova consulta
- Visualizar todas as consultas
- Alterar status ou reagendar
- Cancelar consultas

**Campos:**
- ID do Paciente (obrigatório, seletor dropdown)
- ID do Médico (obrigatório, seletor dropdown)
- Data e hora (obrigatório)
- Observações (opcional)
- Status (AGENDADA, CANCELADA, CONCLUIDA)

**Recursos:**
- Seletores dropdown para paciente e médico
- Seletor de data e hora
- Gerenciamento de status com badges coloridos:
  - AGENDADA (azul)
  - CONCLUIDA (verde)
  - CANCELADA (vermelho)

- Botões de ação:
  - Cancelar (altera status para CANCELADA)
  - Concluir (altera status para CONCLUIDA)
  - Reagendar (altera data/hora)
  - Excluir (remove consulta)
  - Ver Receitas (abre em nova aba)

- Filtros avançados:
  - Por nome do paciente
  - Por nome do médico
  - Por intervalo de datas

### 5. Gestão de Receitas
**Rota:** `/receitas`

**Operações CRUD:**
- Emitir nova receita
- Visualizar receitas
- Modificar detalhes da receita
- Remover receita

**Campos:**
- ID da Consulta (obrigatório)
- Medicamento (obrigatório)
- Dosagem (opcional)
- Instruções de uso (opcional)

**Recursos:**
- Filtro por ID de consulta via query params
- Dois modos de carregamento:
  - Lista de todas as receitas
  - Receitas de consulta específica
- Integração profunda com consultas

---

## Estrutura do Projeto

```
consultas-web/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── layout/         # Componentes de layout
│   │   │   ├── app-layout.tsx
│   │   │   ├── header.tsx
│   │   │   └── sidebar.tsx
│   │   ├── ui/             # Componentes UI (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── label.tsx
│   │   └── ConfirmButton.tsx
│   ├── pages/              # Páginas da aplicação
│   │   ├── DashboardPage.tsx
│   │   ├── PacientesPage.tsx
│   │   ├── MedicosPage.tsx
│   │   ├── ConsultasPage.tsx
│   │   └── ReceitasPage.tsx
│   ├── api/                # Serviços de API
│   │   ├── http.ts        # Configuração Axios
│   │   ├── pacientes.ts
│   │   ├── medicos.ts
│   │   ├── consultas.ts
│   │   └── receitas.ts
│   ├── utils/              # Utilitários
│   │   └── date.ts        # Funções de formatação de data
│   ├── lib/                # Bibliotecas auxiliares
│   │   └── utils.ts       # Função cn() para classes
│   ├── App.tsx             # Componente raiz com rotas
│   ├── App.css
│   ├── index.css           # Estilos globais Tailwind
│   └── main.tsx            # Ponto de entrada
├── public/                 # Arquivos estáticos
├── .env                    # Variáveis de ambiente
├── vite.config.ts          # Configuração Vite
├── tailwind.config.js      # Configuração Tailwind
├── tsconfig.json           # Configuração TypeScript
├── components.json         # Configuração shadcn/ui
├── package.json
└── README.md
```

---

## Instalação e Configuração

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Backend API rodando em `http://localhost:8080` (ou configurar URL no .env)

### Passos de Instalação

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd consultas-web
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   Crie um arquivo `.env` na raiz do projeto:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_APP_TITLE=Consultas Web
   VITE_APP_VERSION=1.0.0
   VITE_NODE_ENV=development
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação:**

   Abra o navegador em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

### Preview da Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Como Usar

### Navegação Principal

A aplicação possui um sidebar com 5 seções principais:

1. **Dashboard** - Visão geral e estatísticas
2. **Pacientes** - Gerenciamento de pacientes
3. **Médicos** - Gerenciamento de médicos
4. **Consultas** - Agendamento e controle de consultas
5. **Receitas** - Emissão e controle de receitas médicas

### Fluxo de Trabalho Típico

1. **Cadastrar Médicos e Pacientes:**
   - Acesse a seção de Médicos e cadastre os profissionais
   - Acesse a seção de Pacientes e cadastre os pacientes

2. **Agendar Consulta:**
   - Na seção Consultas, clique em "Nova Consulta"
   - Selecione paciente, médico, data/hora
   - Adicione observações se necessário
   - Salve a consulta

3. **Emitir Receita:**
   - Após a consulta, vá para Receitas
   - Vincule a receita à consulta realizada
   - Preencha medicamento, dosagem e instruções
   - Salve a receita

4. **Gerenciar Status:**
   - Use os botões de ação nas consultas para:
     - Marcar como concluída
     - Cancelar consulta
     - Reagendar data/hora

### Tema Claro/Escuro

- Clique no ícone de lua/sol no header
- A preferência é salva no localStorage

---

## API e Endpoints

### Configuração Base

```typescript
Base URL: http://localhost:8080/api
Content-Type: application/json
```

### Endpoints de Pacientes

```
GET    /api/pacientes              # Listar todos
POST   /api/pacientes              # Criar novo
PUT    /api/pacientes/{id}         # Atualizar
DELETE /api/pacientes/{id}         # Excluir
```

**Modelo de Dados:**
```typescript
{
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  dataNascimento?: string;
  endereco?: string;
}
```

### Endpoints de Médicos

```
GET    /api/medicos                # Listar todos
POST   /api/medicos                # Criar novo
PUT    /api/medicos/{id}           # Atualizar
DELETE /api/medicos/{id}           # Excluir
```

**Modelo de Dados:**
```typescript
{
  id: number;
  nome: string;
  email: string;
  crm: string;
  especialidade?: string;
  telefone?: string;
}
```

### Endpoints de Consultas

```
GET    /api/consultas                    # Listar todas
POST   /api/consultas                    # Criar nova
PATCH  /api/consultas/{id}/status        # Alterar status
PATCH  /api/consultas/{id}/data-hora     # Reagendar
DELETE /api/consultas/{id}               # Excluir
```

**Modelo de Dados:**
```typescript
{
  id: number;
  pacienteId: number;
  pacienteNome?: string;
  medicoId: number;
  medicoNome?: string;
  dataHora: string;  // ISO format
  observacoes?: string;
  status: "AGENDADA" | "CANCELADA" | "CONCLUIDA";
}
```

### Endpoints de Receitas

```
GET    /api/receitas                           # Listar todas
GET    /api/consultas/{consultaId}/receitas    # Listar por consulta
POST   /api/receitas                           # Criar nova
PUT    /api/receitas/{id}                      # Atualizar
DELETE /api/receitas/{id}                      # Excluir
```

**Modelo de Dados:**
```typescript
{
  id: number;
  consultaId: number;
  medicamento: string;
  dosagem?: string;
  instrucoes?: string;
}
```

---

## Componentes Principais

### Layout

#### AppLayout
**Localização:** [src/components/layout/app-layout.tsx](src/components/layout/app-layout.tsx)

Componente principal que envolve toda a aplicação:
- Gerencia estado de colapso do sidebar
- Controla alternância de tema claro/escuro
- Persiste preferências no localStorage
- Mapeia rotas para títulos de página

#### Sidebar
**Localização:** [src/components/layout/sidebar.tsx](src/components/layout/sidebar.tsx)

Menu lateral de navegação:
- 5 itens de menu principais com ícones
- Comportamento colapsável
- Destaque de rota ativa
- Marca "Clínica Médica"

#### Header
**Localização:** [src/components/layout/header.tsx](src/components/layout/header.tsx)

Barra superior de navegação:
- Botão de alternância de tema
- Seção de perfil do usuário
- Botão de logout (placeholder)

### Componentes UI (shadcn/ui)

#### Button
**Localização:** [src/components/ui/button.tsx](src/components/ui/button.tsx)

Botão reutilizável com variantes:
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon

#### Card
**Localização:** [src/components/ui/card.tsx](src/components/ui/card.tsx)

Container com borda e sombra:
- CardHeader, CardTitle, CardDescription
- CardContent, CardFooter

#### Input
**Localização:** [src/components/ui/input.tsx](src/components/ui/input.tsx)

Campo de entrada customizável:
- Suporta todos os tipos HTML input
- Estados de foco e disabled

#### Label
**Localização:** [src/components/ui/label.tsx](src/components/ui/label.tsx)

Label acessível baseado em Radix UI

### Componentes Customizados

#### ConfirmButton
**Localização:** [src/components/ConfirmButton.tsx](src/components/ConfirmButton.tsx)

Wrapper para ações destrutivas:
- Dialog de confirmação nativo do navegador
- Suporta operações assíncronas
- Mensagem personalizável

### Utilitários

#### date.ts
**Localização:** [src/utils/date.ts](src/utils/date.ts)

Funções de formatação de data:
- `toISOFromLocal()` - Converte datetime-local para ISO
- `formatDate()` - Formata para DD/MM/YYYY
- `formatDateTime()` - Formata para DD/MM/YYYY HH:MM

#### utils.ts
**Localização:** [src/lib/utils.ts](src/lib/utils.ts)

- `cn()` - Merge inteligente de classes Tailwind

---

## Relacionamentos de Dados

```
Paciente (1) ─── (N) Consulta
Médico (1) ─── (N) Consulta
Consulta (1) ─── (N) Receita
```

### Fluxo de Dados

1. Frontend faz requisições via axios
2. Backend API (localhost:8080) processa CRUD
3. Respostas são tipadas com interfaces TypeScript
4. Tratamento de erro normalizado no interceptor HTTP
5. Dados armazenados no state React, atualizados em ações

---

## Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript strict mode
- Siga as regras do ESLint configuradas
- Componentes funcionais com hooks
- Mantenha componentes pequenos e reutilizáveis
- Documente funções complexas

---

## Licença

Este projeto está sob a licença MIT.

---

## Suporte

Para reportar bugs ou solicitar features, abra uma issue no repositório.

---

**Desenvolvido com React, TypeScript e Tailwind CSS**
