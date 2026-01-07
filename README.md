# 💰 Finance App

**Finance App** é um **PWA desenvolvido em Next.js** criado para **controle financeiro mensal pessoal**.  
O projeto centraliza todas as minhas contas, registros mensais e anotações financeiras em um único lugar, com foco em simplicidade, organização e boa experiência de uso.

Além de ser uma aplicação utilizada no dia a dia, este projeto funciona como um **laboratório técnico**, onde experimento novas tecnologias, padrões arquiteturais e abordagens conforme evoluo como desenvolvedor.

🚀 Deploy: [finance-app deploy](https://finance-app-orpin-eight.vercel.app/)

---

## 📌 Objetivo do Projeto

O Finance App nasceu da necessidade de substituir planilhas e também para eu pudesse criar um projeto do zero e sem "copiar" tutorias.

O objetivo principal é:
- Facilitar o controle financeiro mensal
- Organizar despesas recorrentes
- Agrupar dívidas e anotações por contexto
- Permitir acompanhamento financeiro contínuo ao longo do ano
- Funcionar bem tanto no desktop quanto no mobile (PWA)

---

## 🧭 Estrutura da Aplicação

### 🏠 Página Principal
- Exibe todos os **meses do usuário organizados por ano**
- Serve como ponto central de navegação da aplicação

---

### 👤 Página da Conta do Usuário
- Cadastro e edição de informações pessoais:
  - Nome
  - Profissão
  - Histórico salarial
- Gerenciamento de **contas recorrentes**, como:
  - Aluguel
  - Assinaturas
  - Contas fixas mensais

Essas contas são reaplicadas automaticamente em todos os meses.

---

### 📆 Página do Mês
- Principal área de uso da aplicação
- Permite criar **blocos personalizados de anotações**
- Exemplos de blocos:
  - 💳 Cartões de crédito
  - 🧾 Gastos variáveis
  - 📌 Anotações específicas

Cada bloco agrupa informações relacionadas, facilitando organização e visualização.

---

### 💰 Página de Poupança
- Funcionalidade iniciada, mas não finalizada
- Criada para acompanhamento de valores guardados
- Ficou incompleta por limitação de tempo

---

## 🔐 Autenticação & Segurança

A autenticação foi projetada pensando em **segurança**, **simplicidade** e **boa experiência do usuário**.

### Tokens
- **Access Token**
  - JWT
  - Expiração: **1 dia**
  - Utilizado para autenticação das requisições

- **Refresh Token**
  - **Token opaco (string aleatória)**
  - Expiração: **1 ano**
  - Não contém payload ou informações sensíveis

Os dados relacionados ao refresh token são armazenados no **CMS**, permitindo:
- Controle total do ciclo de vida do token
- Revogação manual quando necessário
- Associação com usuário, sessão e metadados relevantes

### Renovação automática
- O **Apollo Client** está configurado para:
  - Detectar access token expirado
  - Solicitar um novo access token usando o refresh token
  - Reexecutar automaticamente a última requisição feita pelo usuário

Todo esse processo ocorre de forma transparente, evitando logouts inesperados e mantendo a experiência fluida.

Essa foi a atualização mais recente que fiz no projeto, onde vou poder testar o sistema de login que venho estudando durante um tempo.

---

## 🗄️ Banco de Dados & API

O projeto utiliza o **GraphCMS (Hygraph)** como **camada de persistência de dados**, funcionando na prática como o banco de dados da aplicação.

### Backend
- O backend foi desenvolvido utilizando a **API nativa do Next.js**
- Essa API foi configurada para expor uma **camada GraphQL própria**
- Toda a lógica de autenticação, regras de negócio e comunicação com o CMS passa por essa API

### GraphQL como contrato único
- O **GraphQL é utilizado tanto no front-end quanto no back-end**
- O front consome exclusivamente a API GraphQL do Next.js
- O backend atua como uma camada intermediária entre o cliente e o GraphCMS

---

## 🧪 Natureza do Projeto

- 📆 Criado há aproximadamente **2 anos**
- 👥 Utilizado por mim e algumas pessoas próximas
- 🧠 Projeto experimental:
  - Teste de novas tecnologias
  - Aplicação de conceitos recém-aprendidos
  - Evolução contínua de arquitetura e código

---

## 🚀 Deploy

- Deploy realizado na **Vercel**
- Integração contínua com GitHub
- Configurado como **Progressive Web App (PWA)**

---

## 🛠️ Tecnologias Utilizadas

- **React**
- **TypeScript**
- **Next.js**
- **GraphQL**
- **Apollo Client**
- **JWT**
- **PWA**
- **GraphCMS (Hygraph)**
- **Zod**

---

## 🔮 Próximos Passos / Evolução

- Reformular completamente a **estrutura de páginas**
- Revisar a arquitetura do front-end e back-end
- Migrar o banco de dados para um ORM:
  - Avaliar **Prisma** ou **TypeORM**
- Experimentar uso de **Redis**:
  - Cache
  - Avaliação de ganhos reais de performance
- Finalizar e evoluir a funcionalidade de poupança
- adicionar testes automatizados tanto na api quanto nos componentes react

---

## 📄 Licença

Projeto de uso pessoal e educacional.  
Sinta-se à vontade para estudar, se inspirar ou adaptar ideias.
