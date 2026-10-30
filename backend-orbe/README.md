# Backend Orbe

API Next.js que faz scraping do **SSW Orbe** (`ssw-mock`).

## Porta fixa

`127.0.0.1:3001` (`npm run dev` / `npm start`)

## Endpoint

```http
GET /api/consulta?cnpj=11222333000181
```

A rota recebe somente o CNPJ, faz scraping de `/2/rastreamento_cnpj` no SSW e
retorna todas as encomendas em que o CNPJ aparece como destinatário ou
remetente. Cada item contém `papel` (`destinatario` ou `remetente`).

## Env

```bash
ORBE_SSW_BASE_URL=http://127.0.0.1:4000
```

## Desenvolvimento

Suba o `ssw-mock` antes (porta **4000**):

```bash
cd ../ssw-mock && npm run dev
cd ../backend-orbe && npm install && npm run dev
```
