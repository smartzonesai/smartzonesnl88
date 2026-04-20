# SmartZones — Installatie & Launch Handleiding

**Geschatte tijd:** 2–3 uur  
**Vereisten:** Vercel account, Supabase account, Mollie account, Resend account, domeinnaam

---

## Stap 1 — Project lokaal klaarmaken (5 min)

### 1.1 Uitpakken en installeren

```bash
# Pak het ZIP-bestand uit
unzip smartzones-fixed.zip
cd smartzones-fixed

# Installeer dependencies (dit duurt 2–3 minuten)
npm install
```

### 1.2 Omgevingsvariabelen aanmaken

```bash
# Kopieer het voorbeeld-bestand
cp .env.local.example .env.local
```

Open `.env.local` in een teksteditor en vul alle waarden in (zie hieronder per stap).

---

## Stap 2 — Supabase instellen (30 min)

### 2.1 Project aanmaken

1. Ga naar [supabase.com](https://supabase.com) → **New project**
2. Kies een naam (bijv. `smartzones`), wachtwoord en regio (kies **EU West**)
3. Wacht tot het project klaar is (~2 minuten)

### 2.2 API-sleutels kopiëren

Ga naar **Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL     → "Project URL" (begint met https://)
NEXT_PUBLIC_SUPABASE_ANON_KEY → "anon public" sleutel
SUPABASE_SERVICE_KEY          → "service_role" sleutel (geheim houden!)
```

Zet deze waarden in je `.env.local`.

### 2.3 Database migraties uitvoeren

Ga naar **SQL Editor** in Supabase en voer de volgende bestanden uit **in deze volgorde** (kopieer de inhoud, plak in de editor, klik **Run**):

| Volgorde | Bestand |
|----------|---------|
| 1 | `supabase/migrations/20260101_base_schema.sql` |
| 2 | `supabase/migrations/20260319_add_store_context_and_tone.sql` |
| 3 | `supabase/migrations/20260402_api_keys_anthropic.sql` |
| 4 | `supabase/migrations/20260403_storage_policies.sql` |
| 5 | `supabase/migrations/20260404_auth_and_profiles.sql` |
| 6 | `supabase/migrations/20260405_production_ready.sql` |

> **Let op:** Voer elke migratie apart uit. Als er een fout is, stop dan en los die eerst op.

### 2.4 Storage buckets aanmaken

Ga naar **Storage → New bucket**:

| Naam | Instellingen |
|------|-------------|
| `videos` | ✗ Public (privé) |
| `visuals` | ✗ Public (privé) |

### 2.5 Auth instellen

Ga naar **Authentication → URL Configuration**:

- **Site URL:** `https://smartzones.nl`
- **Redirect URLs:** `https://smartzones.nl/**`

### 2.6 SMTP instellen voor e-mails (via Resend)

Ga naar **Authentication → SMTP Settings**:

```
Host:     smtp.resend.com
Port:     465
User:     resend
Password: [jouw Resend API key]
Sender:   noreply@smartzones.nl
```

---

## Stap 3 — Resend instellen (20 min)

### 3.1 Account aanmaken

Ga naar [resend.com](https://resend.com) → maak een account aan.

### 3.2 Domein verifiëren

1. Ga naar **Domains → Add Domain**
2. Voer `smartzones.nl` in
3. Voeg de gegeven DNS-records toe bij je domeinnaam-registrar:
   - SPF-record
   - DKIM-record  
   - DMARC-record

> **Wachttijd:** DNS-wijzigingen duren 1–24 uur om te propageren.

### 3.3 API-sleutel aanmaken

Ga naar **API Keys → Create API Key**:

```
RESEND_API_KEY → de gegenereerde sleutel (begint met re_)
```

### 3.4 Webhook registreren

Ga naar **Webhooks → Add Webhook**:

```
URL: https://smartzones.nl/api/webhooks/resend
Events: email.sent, email.delivered, email.bounced, email.opened
```

---

## Stap 4 — Anthropic API instellen (5 min)

1. Ga naar [console.anthropic.com](https://console.anthropic.com)
2. Maak een API-sleutel aan
3. Stel een gebruikslimiet in (aanbevolen: €50–100/maand voor begin)

```
ANTHROPIC_API_KEY → de gegenereerde sleutel (begint met sk-ant-)
```

---

## Stap 5 — Mollie instellen (20 min)

### 5.1 Account aanmaken

Ga naar [mollie.com](https://mollie.com) → registreer en activeer je account.

> **Let op:** Mollie vereist KvK-inschrijving voor live betalingen.

### 5.2 API-sleutels

Ga naar **Developers → API keys**:

```
MOLLIE_API_KEY → gebruik "test_..." voor testen, "live_..." voor productie
```

### 5.3 Webhook instellen

Ga naar **Developers → Webhooks**:

```
URL: https://smartzones.nl/api/webhooks/mollie
```

### 5.4 KvK en BTW-nummers

Vul je bedrijfsgegevens in `.env.local`:

```
KVK_NUMMER=12345678
BTW_NUMMER=NL123456789B01
```

---

## Stap 6 — Vercel instellen (30 min)

### 6.1 Vercel Pro activeren

SmartZones heeft **Vercel Pro** nodig vanwege de 300-seconden timeout voor AI-analyses. Het gratis plan heeft een limiet van 60 seconden.

Ga naar [vercel.com/upgrade](https://vercel.com/upgrade).

### 6.2 Project deployen

```bash
# Installeer Vercel CLI
npm install -g vercel

# Deploy vanuit de projectmap
vercel --prod
```

Volg de stappen in de terminal. Koppel aan je Vercel-account wanneer gevraagd.

**Of via GitHub:**
1. Push de code naar een GitHub-repository
2. Ga naar [vercel.com/new](https://vercel.com/new)
3. Importeer de repository
4. Klik **Deploy**

### 6.3 Omgevingsvariabelen instellen in Vercel

Ga naar je Vercel-project → **Settings → Environment Variables** en voeg toe:

| Variabele | Waarde | Environment |
|-----------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Uit Stap 2.2 | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Uit Stap 2.2 | Production, Preview, Development |
| `SUPABASE_SERVICE_KEY` | Uit Stap 2.2 | Production |
| `ANTHROPIC_API_KEY` | Uit Stap 4 | Production |
| `RESEND_API_KEY` | Uit Stap 3.3 | Production |
| `MOLLIE_API_KEY` | Uit Stap 5.2 | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://smartzones.nl` | Production |
| `ADMIN_PASSWORD` | Zelf kiezen (sterk!) | Production |
| `CRON_SECRET` | Willekeurige string van 32+ tekens | Production |
| `KVK_NUMMER` | Jouw KvK-nummer | Production |
| `BTW_NUMMER` | Jouw BTW-nummer | Production |

**Genereer een veilige CRON_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6.4 Domein koppelen

Ga naar **Settings → Domains → Add**:

```
smartzones.nl
www.smartzones.nl
```

Voeg de gegeven DNS-records toe bij je domeinregistrar. SSL-certificaat wordt automatisch aangemaakt door Vercel.

### 6.5 Opnieuw deployen na env vars

Nadat je alle variabelen hebt ingesteld:

```bash
vercel --prod
```

Of klik **Redeploy** in het Vercel-dashboard.

---

## Stap 7 — Testen (30 min)

### 7.1 Registratie testen

1. Ga naar `https://smartzones.nl/register`
2. Maak een testaccount aan
3. Controleer of je een bevestigingsmail ontvangt

### 7.2 Betaling testen

1. Log in op je testaccount
2. Ga naar **Analyse starten**
3. Upload een testvideo (elk MP4-bestand van minimaal 10 seconden)
4. Gebruik Mollie-testnummer: `NL55INGB0000000000`
5. Controleer of betaling slaagt en analyse start

### 7.3 Analyse testen

1. Wacht tot de analyse klaar is (normaal 5–20 minuten bij eerste deploy)
2. Controleer het dashboard — alle 5 tabs moeten data bevatten:
   - Overzicht
   - Vloerplan
   - Implementatieplan
   - Heatmap
   - Gedragsanalyse
3. Controleer of je een e-mail ontvangt als de analyse klaar is

### 7.4 Admin testen

1. Ga naar `https://smartzones.nl/admin`
2. Vul je `ADMIN_PASSWORD` in
3. Controleer of het dashboard echte data toont

---

## Veelgemaakte problemen

### "Build failed" op Vercel

```bash
# Test lokaal eerst
npm run build

# Als dat lukt, controleer of alle env vars aanwezig zijn in Vercel
```

### Analyses starten niet

1. Controleer of de `videos` en `visuals` buckets bestaan in Supabase
2. Controleer de Mollie webhook-URL
3. Kijk in Vercel → **Functions** → **Logs** voor foutmeldingen

### E-mails komen niet aan

1. Controleer DNS-records in Resend (alle 3 moeten groen zijn)
2. Wacht maximaal 24 uur na DNS-wijziging
3. Controleer de **Supabase SMTP-instellingen** (Stap 2.6)

### "ADMIN_PASSWORD niet geconfigureerd"

De `/admin` pagina geeft een 503 als `ADMIN_PASSWORD` niet is ingesteld. Controleer of de variabele is toegevoegd in Vercel.

### Analyse duurt langer dan verwacht

De eerste analyse op een nieuw project kan tot 45 minuten duren. Daarna gaat het sneller (5–15 min). Controleer Vercel-logs als het langer dan 1 uur duurt.

---

## Productie checklist

Vink af voor je live gaat:

- [ ] `npm install` gedraaid
- [ ] Alle 6 migraties uitgevoerd in Supabase
- [ ] Buckets `videos` en `visuals` aangemaakt (privé)
- [ ] Supabase Auth: Site URL ingesteld
- [ ] Supabase SMTP ingesteld via Resend
- [ ] Resend: domein geverifieerd (SPF + DKIM + DMARC groen)
- [ ] Resend webhook ingesteld
- [ ] Anthropic: API-sleutel aangemaakt + limiet ingesteld
- [ ] Mollie: account geactiveerd + webhook ingesteld
- [ ] Vercel Pro geactiveerd
- [ ] Alle 11 env vars ingesteld in Vercel
- [ ] Domein gekoppeld in Vercel
- [ ] Testregistratie gedaan
- [ ] Testbetaling gedaan (Mollie test-modus)
- [ ] Testanalyse gedraaid en alle 5 tabs gecontroleerd
- [ ] Admin panel getest
- [ ] Schakel Mollie over van test naar live modus

---

## Ondersteuning

Vragen? Mail naar `info@smartzones.nl`

---

*Laatste update: april 2026*
