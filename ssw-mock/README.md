# SSW Orbe (mock)

Front no estilo SSW clássico: consulta seed + coletas dinâmicas por **CNPJ** e **NF**.

## Porta

`127.0.0.1:4000`

```bash
npm install
npm run dev
```

- Consulta: http://127.0.0.1:4000
- Nova coleta: http://127.0.0.1:4000/coleta

## Coleta dinâmica

1. Em **Coleta**, informe um CNPJ
2. O mock gera NF (a partir de `9001`), data e status `DOCUMENTO DE TRANSPORTE EMITIDO`
3. A cada **2 minutos** a partir da criação o status avança até `MERCADORIA ENTREGUE`
4. A coleta aparece na **Consulta** e em **Ver detalhes**

Dados em `data/coletas.json`. Seed estático em `data/rastreamentos.json`.

## API JSON (para `frontend-orbe`)

| Método | Rota | Uso |
|--------|------|-----|
| `GET` | `/api/consulta?cnpj=&nfNumber=` | Lista encomendas |
| `GET` | `/api/rastreamento/[id]` | Detalhe |
| `POST` | `/api/coleta` body `{ "cnpj" }` | Cria coleta |

O front consumidor fica em [`frontend-orbe`](../frontend-orbe) (:3003).

## CNPJ / NF de teste (seed)

| CNPJ | NF | Status |
|------|----|--------|
| `11222333000181` | `1001` | Em trânsito |
| `11222333000181` | `1002` | Entregue |
| `04521456000158` | `2001` | Em transferência |
| `27865757000102` | `3001` | Em trânsito |
