# Utilização deste Boilerplate

Este documento contém instruções para uma IA adaptar este código boilerplate para uma nova aplicação corporativa.

## Pré-requisitos

Antes de começar a adaptar o código, a IA deve obter as seguintes informações do usuário:

### Perguntas Obrigatórias

1. **Qual o nome do projeto?**
   - Exemplo: "Gestão de Atividades", "Portal de Vendas", etc.
   - Este nome será usado em todo o código, incluindo:
     - Título da página (index.html)
     - Header do aplicativo
     - Sidebar/menu lateral
     - package.json

2. **Qual o ícone do projeto?**
   - Deve ser um ícone disponível na biblioteca [Lucide React](https://lucide.dev/icons/)
   - Exemplos: `TrendingUp`, `Users`, `FileText`, `Calendar`, `Settings`, `BarChart`, etc.
   - O ícone será usado na sidebar e no favicon

---

## Arquivos a Serem Modificados

### 1. Configuração Básica

#### `package.json`
- Altere o campo `"name"` para o nome do projeto (em kebab-case)
```json
{
  "name": "seu-novo-projeto",
  ...
}
```

#### `index.html`
- Altere o `<title>` para o nome do projeto
```html
<title>Nome do Seu Projeto</title>
```

#### `.env`
- Se necessário, atualize as variáveis de ambiente do Supabase
- Atualize a URL de produção em `VITE_APP_URL` quando disponível
```env
# Production: https://seu-projeto.defysolutions.com.br
VITE_APP_URL=http://localhost:5173
```

---

### 2. Layout e Branding

#### `src/components/layout/Header.jsx`
- Linha ~74: Altere o texto do título
```jsx
<h2 className={styles.pageTitle}>Nome do Seu Projeto</h2>
```

#### `src/components/layout/Sidebar.jsx`
- Linha ~3: Importe o ícone escolhido
```jsx
import { Settings, Menu, ChevronLeft, SeuIcone } from 'lucide-react';
```

- Linha ~35-38: Altere o ícone e texto do brand
```jsx
<div className={styles.appIcon}>
    <SeuIcone size={22} />
</div>
<div className={styles.appBrandText}>
    <span className={styles.appName}>Nome</span>
    <span className={styles.appTagline}>Subtítulo</span>
</div>
```

#### `src/components/layout/Layout.module.css`
- Se desejar mudar a cor do ícone, altere o `.appIcon`:
```css
.appIcon {
    background: linear-gradient(135deg, #SuaCor1 0%, #SuaCor2 100%);
    box-shadow: 0 4px 12px rgba(R, G, B, 0.3);
}
```

#### `public/favicon.svg`
- Substitua o SVG pelo ícone escolhido
- Use o mesmo ícone do Sidebar em formato SVG

---

### 3. Supabase Client

#### `src/services/supabaseClient.js`
- Altere o `storageKey` para evitar conflitos com outros projetos
```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-seu-projeto-auth',
  },
});
```

---

### 4. Adicionando Novas Rotas/Páginas

#### `src/App.jsx`
Para adicionar novas páginas:

1. Importe o componente da página
```jsx
import NovaPagina from './components/nova-pagina/NovaPagina';
```

2. Adicione a rota dentro do `<Route path="/*">`
```jsx
<Route path="nova-pagina" element={<NovaPagina />} />
```

#### `src/components/layout/Sidebar.jsx`
Para adicionar novos itens de menu:

1. Importe o ícone do Lucide
```jsx
import { Settings, Menu, ChevronLeft, HelpCircle, NovoIcone } from 'lucide-react';
```

2. Adicione o NavLink na nav
```jsx
<NavLink
    to="/nova-pagina"
    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
    title="Nova Página"
    onClick={() => {
        window.innerWidth < 768 && onToggle();
    }}
>
    <NovoIcone size={20} />
    {!isCollapsed && <span>Nova Página</span>}
</NavLink>
```

---

## Comandos para Rodar o Projeto

### Instalação
```bash
npm install
```

> **Nota**: Para instalar o design system privado, você precisa estar autenticado no GitHub Packages.
> Execute: `npm login --registry=https://npm.pkg.github.com`

### Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

---

## Estrutura de Pastas

```
src/
├── components/
│   ├── auth/           # Login, ProtectedRoute
│   ├── debug/          # Error boundary, debug viewer
│   ├── layout/         # Header, Sidebar, MainLayout
│   └── settings/       # Página de configurações
├── contexts/
│   └── AuthContext.jsx # Context de autenticação
├── services/
│   └── supabaseClient.js # Cliente Supabase
├── styles/
│   ├── global.css      # Estilos globais
│   └── variables.css   # CSS variables (cores, fontes, etc)
├── utils/
│   └── logger.js       # Utilitário de logs
├── App.jsx             # Componente principal com rotas
└── main.jsx            # Entry point
```

---

## Design System

Este projeto utiliza o Design System corporativo `@iadefysolutions/design-system`.

### Importação de Estilos
Os estilos do design system são importados automaticamente em `main.jsx`:
```jsx
import '@iadefysolutions/design-system/styles'
```

### Componentes Disponíveis
Consulte a documentação do design system para ver os componentes disponíveis:
- ThemeProvider (já configurado)
- Outros componentes conforme documentação

---

## Configuração de Autenticação

O sistema está configurado para aceitar apenas usuários com email no domínio `@defysolutions.com.br`.

Para alterar o domínio permitido, modifique:

#### `src/contexts/AuthContext.jsx`
```jsx
if (!userEmail?.endsWith('@seudominio.com.br')) {
```

#### `src/components/auth/ProtectedRoute.jsx`
```jsx
const ALLOWED_DOMAIN = 'seudominio.com.br';
```

#### `src/components/auth/Login.jsx`
```jsx
Apenas contas com domínio <strong>seudominio.com.br</strong> são permitidas.
```

---

## Responsividade

O projeto já está configurado com suporte responsivo para:
- **Mobile**: < 768px (sidebar como drawer, layout otimizado)
- **Tablet/Desktop**: >= 768px (sidebar fixa, layout expandido)

As variáveis CSS em `variables.css` incluem:
- Safe areas para notch de dispositivos móveis
- Touch targets mínimos (44px)
- Breakpoints definidos

---

## Checklist de Adaptação

- [ ] Atualizar nome no `package.json`
- [ ] Atualizar título no `index.html`
- [ ] Atualizar variáveis no `.env` (se necessário)
- [ ] Atualizar Header.jsx com novo título
- [ ] Atualizar Sidebar.jsx com novo ícone e nome
- [ ] Atualizar cor do ícone em Layout.module.css (opcional)
- [ ] Atualizar favicon.svg
- [ ] Atualizar storageKey no supabaseClient.js
- [ ] Adicionar novas rotas em App.jsx
- [ ] Adicionar novos itens de menu em Sidebar.jsx
- [ ] Executar `npm install`
- [ ] Testar com `npm run dev`
