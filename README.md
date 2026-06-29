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

## Turnstile

O frontend possui integração com o Cloudflare Turnstile para validação contra bots.

Por padrão, durante o desenvolvimento local, ele pode permanecer desabilitado através da variável:

```env
VITE_TURNSTILE_ENABLED=false
```

Em produção, basta informar a `VITE_TURNSTILE_SITE_KEY` e habilitar:

```env
VITE_TURNSTILE_ENABLED=true
```

---

## Documentação

Documentação completa da solução:

https://github.com/misaaael/case-intelbras
