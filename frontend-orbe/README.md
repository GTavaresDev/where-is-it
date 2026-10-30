# Frontend Orbe

Front que consome **somente** o `ssw-mock` (SSW próprio).

## Porta

`127.0.0.1:3003`

```bash
npm install
npm run dev
```

Requer o mock em http://127.0.0.1:4000

```bash
SSW_MOCK_BASE_URL=http://127.0.0.1:4000
```

## Telas

- `/consulta` — CNPJ → backend `GET /api/consulta`
- `/coleta` — cria coleta → `POST /api/coleta`
- `/detalhe/[id]` → `GET /api/rastreamento/[id]`
