# Desafio Hyerdev

Monorepo do fluxo Orbe: mock do SSW e o front que consome a API JSON dele. O `backend-orbe` continua no repositório como o caminho antigo de scrape HTML; o fluxo atual não passa por ele.

## Portas

| App | Porta | URL | Papel |
|-----|-------|-----|--------|
| `ssw-mock` | **4000** | http://127.0.0.1:4000 | UI clássica do SSW + API JSON + coletas dinâmicas |
| `frontend-orbe` | **3003** | http://127.0.0.1:3003 | Consulta, detalhe e nova coleta |
| `backend-orbe` | **3001** | http://127.0.0.1:3001 | Scrape HTML do mock (legado) |

```text
frontend-orbe :3003  →  ssw-mock :4000  /api/consulta | /api/rastreamento | /api/coleta
```

## Como rodar

Suba o mock antes do front:

```bash
cd ssw-mock && npm install && npm run dev
cd frontend-orbe && npm install && npm run dev
```

O scrape legado, se precisar:

```bash
cd backend-orbe && npm install && npm run dev
```

Env do `frontend-orbe` (`.env`):

```bash
SSW_MOCK_BASE_URL=http://127.0.0.1:4000
```

Env do `backend-orbe` (`.env`):

```bash
ORBE_SSW_BASE_URL=http://127.0.0.1:4000
```

## Páginas

`ssw-mock` (:4000): consulta em `/`, nova coleta em `/coleta`, detalhe em `/detalhe/[id]`.

O fluxo de rastreamento é: `frontend-orbe :3003` → `backend-orbe :3001/api/consulta?cnpj=...` → scraping do SSW em `ssw-mock :4000/2/rastreamento_cnpj?cnpj=...`.

`frontend-orbe` (:3003): `/` redireciona para `/consulta`. Também tem `/coleta` e `/detalhe/[id]`.

## API do mock

| Método | Rota | Uso |
|--------|------|-----|
| `GET` | `/api/consulta?cnpj=` | Lista encomendas do CNPJ, como remetente ou destinatário |
| `GET` | `/api/rastreamento/[id]` | Detalhe |
| `POST` | `/api/coleta` body `{ "cnpj" }` | Cria coleta (NF a partir de `9001`) |

## CNPJ / NF de teste

| CNPJ | NF | Observação |
|------|----|------------|
| `11222333000181` | `1001` | Seed — em trânsito |
| `11222333000181` | `1002` | Seed — entregue |
| `04521456000158` | `2001` | Seed — em transferência |
| `27865757000102` | `3001` | Seed — em trânsito |
| (qualquer CNPJ de 14 dígitos) | ≥ `9001` | Coleta dinâmica em `/coleta` |

Seed em [`ssw-mock/data/rastreamentos.json`](ssw-mock/data/rastreamentos.json). Coletas em [`ssw-mock/data/coletas.json`](ssw-mock/data/coletas.json).

A coleta dinâmica nasce em `DOCUMENTO DE TRANSPORTE EMITIDO` e, a cada **2 minutos** a partir da criação, ganha a ocorrência seguinte até `MERCADORIA ENTREGUE`.
