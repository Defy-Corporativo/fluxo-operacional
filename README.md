# Boilerplate Portal Corporativo

Um projeto boilerplate para aplicações corporativas da Defy Solutions, incluindo autenticação SSO com Microsoft 365 via Supabase, design system corporativo e estrutura responsiva para web e mobile.

## Tecnologias

- **React 19** - Biblioteca de UI
- **Vite** - Build tool
- **Supabase** - Backend as a Service (autenticação)
- **React Router Dom** - Roteamento
- **Lucide React** - Ícones
- **@iadefysolutions/design-system** - Design system corporativo

## Começando

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Autenticação no GitHub Packages (para o design system privado)

### Autenticação no GitHub Packages

Para instalar o design system privado, você precisa estar autenticado:

```bash
npm login --registry=https://npm.pkg.github.com
```

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Estrutura do Projeto

```
src/
├── components/
│   ├── auth/           # Componentes de autenticação
│   ├── debug/          # Error boundary e debug tools
│   ├── layout/         # Header, Sidebar, Layout
│   └── settings/       # Página de configurações
├── contexts/           # React Contexts
├── services/           # Serviços (Supabase)
├── styles/             # CSS globais e variáveis
├── utils/              # Utilitários
├── App.jsx             # Componente principal
└── main.jsx            # Entry point
```

## Características

- ✅ Autenticação SSO com Microsoft 365
- ✅ Layout responsivo (mobile/desktop)
- ✅ Sidebar retrátil
- ✅ Design system corporativo
- ✅ Error boundary
- ✅ Debug logger
- ✅ CSS variables para temas
- ✅ Safe area support (mobile)

## Adaptando para Novo Projeto

Consulte o arquivo `UTILIZACAO DESTE BOILERPLATE.md` para instruções detalhadas sobre como adaptar este boilerplate para um novo projeto.

## Licença

Proprietário - Defy Solutions
