# Frontend React — Casa Inteligente

Interface web desenvolvida em React para o case técnico da Intelbras.

A aplicação permite que o usuário informe um token temporário da plataforma Open Casa Inteligente e visualize os dispositivos associados à sua conta por meio do backend desenvolvido em Django.

## Tecnologias

* React 19
* TypeScript
* Vite
* TanStack Router
* Tailwind CSS
* ESLint
* Prettier

## Funcionalidades

* Consulta de dispositivos via backend
* Integração com a API real da Intelbras
* Filtro por origem:

  * Todos
  * Vinculados
  * Compartilhados
* Paginação
* Alteração da quantidade de itens por página
* Estados da interface:

  * carregando
  * lista vazia
  * token inválido
  * erro de comunicação
  * backend indisponível
* Atualização manual da consulta
* Troca de token

## Estrutura do projeto

```text
src/
├── routes/
├── services/
│   └── devicesApi.ts
├── components/
└── ...
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Como executar

Instale as dependências:

```bash
npm install
```

Execute em modo de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:5173
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

## Comunicação com o backend

Todas as requisições são centralizadas em:

```text
src/services/devicesApi.ts
```

O frontend envia requisições para:

```http
POST /api/devices/
```

Payload:

```json
{
  "token": "...",
  "page": 1,
  "pageSize": 20,
  "origin": "all"
}
```

Resposta esperada:

```json
{
  "ok": true,
  "items": [],
  "page": 1,
  "pageSize": 20,
  "hasNextPage": true
}
```

## Decisões técnicas

A interface foi construída desacoplada da API externa. Toda a comunicação acontece exclusivamente com o backend Django, que normaliza os dados retornados pela API da Intelbras.

Como a API não informa o número total de dispositivos, a navegação utiliza o campo `hasNextPage` fornecido pelo backend para controlar a paginação sem exibir totais incorretos.

## Melhorias futuras

* Testes automatizados dos componentes
* Melhorias de acessibilidade (ARIA)
* Internacionalização
* Tema claro/escuro
* Virtualização para listas muito grandes
* Docker para desenvolvimento
* Deploy automatizado
