# SmartZones — Launch handleiding

## 1. Supabase instellen

### Database
Voer alle migraties uit in het **Supabase SQL-editor**, in deze volgorde:
```
supabase/migrations/20260101_base_schema.sql
supabase/migrations/20260319_add_store_context_and_tone.sql
supabase/migrations/20260402_api_keys_anthropic.sql
supabase/migrations/20260403_storage_policies.sql
supabase/migrations/20260404_auth_and_profiles.sql
supabase/migrations/20260405_production_ready.sql
```

> ⚠️ Er is maar één bestand met de `20260405` prefix. Als je dit leest na een eerdere versie: het `20260405_launch_ready.sql` bestand is samengevoegd en verwijderd. Voer alleen `20260405_production_ready.sql` uit.

### Storage buckets
Maak handmatig aan in Supabase → Storage:
- `videos` (privé)
- `visuals` (privé)

### Auth instellingen
Ga naar Supabase → Authentication → URL Configuration:
- Site URL: `https://smartzones.nl`
- Redirect URLs: `https://smartzones.nl/**`

Optioneel: schakel e-mailbevestiging uit (Authentication → Providers → Email) als je direct toegang wilt geven zonder e-mailcheck.

---

## 2. Mollie instellen

1. Maak een account aan op [mollie.com](https://mollie.com) en activeer je account
2. Ga naar Mollie dashboard → Developers → API keys
3. Kopieer de **Live API key** (begint met `live_...`) en zet hem in `MOLLIE_API_KEY`
   - Voor lokaal testen: gebruik de **Test API key** (begint met `test_...`)
4. Mollie ondersteunt iDEAL, creditcard, Bancontact en meer automatisch — geen extra activatie nodig
5. Webhook instellen: Mollie → Dashboard → Settings → Webhooks
   - URL: `https://smartzones.nl/api/webhooks/mollie`
   - Mollie verifieert webhooks door de betaling zelf op te halen — geen webhook secret nodig

---

## 3. Resend instellen

1. Verifieer domein `smartzones.nl` in het Resend dashboard
2. Stel DNS-records in zoals Resend aangeeft (SPF, DKIM, DMARC)
3. Maak een API-key aan

---

## 4. Omgevingsvariabelen instellen

Kopieer `.env.local.example` naar `.env.local` en vul alle waarden in:

```bash
cp .env.local.example .env.local
```

Vul in Vercel ook alle variabelen in via **Project Settings → Environment Variables**.

Genereer willekeurige strings voor `ADMIN_PASSWORD` en `CRON_SECRET`:
```bash
openssl rand -base64 32
```

---

## 5. Vercel deployen

```bash
# Installeer Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Of verbind je GitHub repo in het Vercel dashboard voor automatische deployments bij elke push.

> **Let op:** De analyse-route heeft `maxDuration: 300` (5 minuten). Dit vereist **Vercel Pro**. Op het gratis plan time-outen analyses na 60 seconden.

---

## 6. Vercel Cron

De cron job in `vercel.json` draait automatisch op Vercel. Vercel injecteert zelf de `CRON_SECRET` als Bearer token.

Zet `CRON_SECRET` in op exact dezelfde waarde in Vercel als in je `.env.local`.

---

## 7. Test-analyse draaien

1. Registreer een account op `https://smartzones.nl/register`
2. Upload een test-video (kan een rondgang door een kantoor zijn)
3. Doorloop de Mollie checkout met Mollie test API key (zet `MOLLIE_API_KEY=test_...` in .env.local)
4. Controleer dat de analyse start en het statusscherm automatisch ververst

---

## Lokaal draaien

```bash
npm install
cp .env.local.example .env.local
# Vul .env.local in
npm run dev
```

Voor lokaal testen van Mollie webhooks: gebruik [ngrok](https://ngrok.com) om een publieke URL te maken:
```bash
ngrok http 3000
# Zet de ngrok URL als webhookUrl in checkout/route.ts tijdelijk
```
