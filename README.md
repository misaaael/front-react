# Frontend - Case Técnico Intelbras

Frontend desenvolvido em React + Vite.

> Este repositório contém apenas a interface da aplicação.
>
> Para documentação completa, arquitetura e infraestrutura da solução, consulte:
>
> **https://github.com/misaaael/case-intelbras**

---

## Tecnologias

- React
- TypeScript
- Vite
- Cloudflare Turnstile

---

## Estrutura

```
frontend/
├── src/
├── Dockerfile
├── package.json
└── vite.config.ts
```

---

## Executando individualmente

### Desenvolvimento

```bash
npm install

npm run dev
```

### Docker

```bash
docker build -t frontend-react .

docker run -p 5173:5173 frontend-react
```

---

## Comunicação

O frontend consome a API do backend através da variável:

```
VITE_API_BASE_URL
```

---

## Documentação

Documentação completa da solução:

https://github.com/misaaael/case-intelbras
