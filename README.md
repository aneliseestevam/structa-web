# Structa Web

Sistema de Gestão de Obras - Frontend

## 📋 Sobre o Projeto

Structa é uma aplicação web moderna para gestão e acompanhamento de obras, com foco em controle de etapas, materiais, movimentações e custo da construção. A plataforma oferece um painel em tempo real para engenheiros e gestores de obras.

## 🚀 Tecnologias Utilizadas

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + ShadCN UI
- **Gráficos**: Recharts
- **Requisições HTTP**: Axios
- **Gerenciamento de Estado**: Context API
- **Autenticação**: JWT (simulado)
- **Ícones**: Lucide React

## 🧱 Módulos Implementados

### ✅ Concluídos

- [X] **Sistema de Autenticação** - Login/logout com JWT
- [X] **Dashboard** - KPIs e gráficos em tempo real
- [X] **Obras** - CRUD completo de obras
- [X] **Layout Responsivo** - Navegação lateral e mobile

### 🔄 Em Desenvolvimento

- [ ] **Etapas da Obra** - Cadastro de etapas com upload de fotos
- [ ] **Materiais** - Gestão de materiais com fornecedores
- [ ] **Compras** - Registro de compras por obra
- [ ] **Estoque** - Controle de entradas e saídas
- [ ] **Relatórios** - Exportação de dados

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Passos para instalação

1. **Clone ou acesse o projeto**

   ```bash
   cd ~/Desktop/PROJETOS/structa-web
   ```
2. **Instale as dependências**

   ```bash
   npm install
   ```
3. **Configure as variáveis de ambiente**

   ```bash
   cp .env.example .env.local
   ```

   Edite o arquivo `.env.local` com as configurações necessárias:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```
4. **Execute o projeto**

   ```bash
   npm run dev
   ```
5. **Acesse a aplicação**

   - URL: http://localhost:3000
   - Credenciais de teste:
     - Email: admin@structa.com
     - Senha: 123456

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Páginas do Next.js (App Router)
│   ├── dashboard/          # Dashboard principal
│   ├── obras/              # Gestão de obras
│   ├── materiais/          # Gestão de materiais
│   ├── etapas/             # Gestão de etapas
│   ├── compras/            # Gestão de compras
│   ├── estoque/            # Controle de estoque
│   └── login/              # Autenticação
├── components/             # Componentes reutilizáveis
│   ├── ui/                 # Componentes do ShadCN UI
│   ├── layout/             # Layout e navegação
│   ├── charts/             # Gráficos e visualizações
│   ├── forms/              # Formulários
│   └── dashboard/          # Componentes específicos do dashboard
├── contexts/               # Context API (estado global)
├── services/               # Serviços de API
├── types/                  # Tipos TypeScript
└── lib/                    # Utilitários
```

## 🔑 Funcionalidades Principais

### Dashboard

- **KPIs em tempo real**: Total de obras, obras em andamento, finalizadas
- **Gráficos interativos**: Evolução das obras, gastos por etapa
- **Alertas**: Materiais com estoque baixo
- **Resumo financeiro**: Gastos totais e orçamentos

### Gestão de Obras

- **CRUD completo**: Criar, listar, editar e excluir obras
- **Status tracking**: Planejada, em andamento, finalizada
- **Filtros e busca**: Pesquisa por nome, local ou responsável
- **Informações detalhadas**: Datas, orçamento, responsável

### Sistema de Autenticação

- **Login seguro**: Autenticação com JWT
- **Sessão persistente**: Dados salvos no localStorage
- **Redirecionamento automático**: Para dashboard ou login

## 🎨 Design System

### Cores Principais

- **Primária**: Azul (#2563eb)
- **Secundária**: Cinza (#6b7280)
- **Sucesso**: Verde (#10b981)
- **Aviso**: Amarelo (#f59e0b)
- **Erro**: Vermelho (#ef4444)

### Componentes UI

- Utiliza ShadCN UI para consistência
- Design responsivo (mobile-first)
- Modo escuro preparado (futuro)

## 📊 Mock Data

O projeto atualmente utiliza dados simulados (mock) para demonstração:

- **3 obras** de exemplo com diferentes status
- **KPIs** calculados dinamicamente
- **Gráficos** com dados de evolução e gastos
- **Materiais** mais consumidos com valores

## 🔮 Próximas Features

1. **Integração com API**: Conectar com backend NestJS
2. **Upload de Arquivos**: Fotos das etapas e documentos
3. **Relatórios**: PDF e Excel
4. **Notificações**: Push notifications para alertas
5. **Dashboard Mobile**: App nativo React Native
6. **Modo Offline**: Sincronização quando online

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Scripts Disponíveis

```bash
npm run dev         # Executar em desenvolvimento
npm run build       # Build para produção
npm run start       # Executar build de produção
npm run lint        # Verificar código com ESLint
npm run type-check  # Verificar tipos TypeScript
```

## 🐛 Problemas Conhecidos

- [ ] Dados são perdidos ao recarregar a página (usando mock data)
- [ ] Upload de arquivos ainda não implementado
- [ ] Sem validação de formulários complexa

## 📞 Suporte

Para suporte ou dúvidas sobre o projeto:

- **Email**: dev@structa.com
- **GitHub Issues**: [Criar issue](https://github.com/structa/structa-web/issues)

---

**Desenvolvido com ❤️ para gestão moderna de obras**
