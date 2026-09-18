# Open Banking (PSD2 / AIS) för nopEKONOMI

Tunn Cloudflare Worker som äger Tink-hemligheter. PWA:n pratar bara med Workern — aldrig direkt med Tink.

## 1. Tink (sandbox)

1. Skapa konto på [console.tink.com](https://console.tink.com/).
2. Skapa app, aktivera **Transactions** / AIS för marknad **SE**.
3. Scopes (minst): `authorization:grant`, `user:create`, `user:read`, `accounts:read`, `transactions:read`, `credentials:read`.
4. Lägg till redirect URI (exakt):
   `https://<ditt-worker-namn>.<konto>.workers.dev/ob/callback`
5. Kopiera `client_id` och `client_secret`.

## 2. Cloudflare Worker

```bash
cd open-banking
npm install
npx wrangler login
```

Kopiera secrets:

```bash
cp .dev.vars.example .dev.vars
# fyll i TINK_CLIENT_ID, TINK_CLIENT_SECRET, SESSION_HMAC_SECRET, ALLOWED_ORIGINS
```

Skapa KV-namespace och sätt id i `wrangler.toml`:

```bash
npx wrangler kv namespace create OB_SESSIONS
npx wrangler kv namespace create OB_SESSIONS --preview
```

Deploy:

```bash
npx wrangler secret put TINK_CLIENT_ID
npx wrangler secret put TINK_CLIENT_SECRET
npx wrangler secret put SESSION_HMAC_SECRET
npx wrangler secret put ALLOWED_ORIGINS
npx wrangler deploy
```

`ALLOWED_ORIGINS` = komma-separerad lista, t.ex.  
`https://rosenborgthomas-nop.github.io,http://localhost:5500`

## 3. nopEKONOMI

1. Öppna **Registervård → Bankkoppling (PSD2)**.
2. Klistra in Worker-bas-URL (utan avslutande `/`), t.ex. `https://nop-ekonomi-ob.example.workers.dev`.
3. **Demo (utan bank)** fungerar om Workern körs utan Tink-nycklar (`DEMO_MODE=1`) eller om du väljer Demo i UI.
4. För riktig bank: välj bank, (vid behov) personnummer, **Koppla med BankID**.

## API (Worker)

| Metod | Sökväg | Syfte |
|-------|--------|--------|
| `POST` | `/ob/start` | Starta Tink Link / demo-session |
| `GET` | `/ob/callback` | OAuth-callback → redirect till PWA med `sessionId` |
| `GET` | `/ob/accounts?sessionId=` | Lista konton |
| `GET` | `/ob/transactions?sessionId=&accountId=&from=&to=` | Transaktioner |
| `POST` | `/ob/disconnect` | Radera session |
| `GET` | `/ob/health` | Status |

## Säkerhet

- Inga Tink-secrets i GitHub Pages / PWA.
- Sessioner i KV med kort TTL (standard 4 h).
- Böcker lagras **inte** i Workern — bara tillfälliga tokens.
