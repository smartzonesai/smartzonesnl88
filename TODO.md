# SmartZones — TODO & Status

Laatste update: april 2026
Legenda: ✅ Gedaan in code · ⬜ Moet nog · 🔧 Handmatige setup vereist

---

## 🔐 Beveiliging

- ✅ Login en registreer via echte Supabase Auth (`signInWithPassword`, `signUp`)
- ✅ Wachtwoord vergeten pagina (`/forgot-password`) met reset e-mail via Supabase
- ✅ Middleware beschermt `/dashboard` — Supabase JWT server-side gevalideerd
- ✅ Middleware beschermt `/admin` — HTTP Basic Auth via `ADMIN_PASSWORD` env var
- ✅ Cron endpoint `/api/admin/lead-gen/cron` beveiligd met `CRON_SECRET` header
- ✅ `/api/upload` vereist geldige Supabase sessie, leest user e-mail server-side
- ✅ `/api/analyses` beveiligd — leest user uit sessie, geen email URL param meer
- ✅ `/api/analysis/[id]` beveiligd — eigenaarschap check
- ✅ `/api/pos` beveiligd — eigenaarschap check
- ✅ `/api/analyze` vereist auth, controleert eigenaarschap, staat interne webhook-calls toe
- ✅ `/api/checkout` vereist auth
- ✅ Storage upload via server-gegenereerde signed URLs (private bucket werkt)
- ✅ Storage policies: alleen `authenticated` en `service_role` mogen lezen/schrijven
- ✅ Admin layout verwijderd van `localStorage` check
- ✅ Admin middleware faalt gesloten als `ADMIN_PASSWORD` niet geconfigureerd is
- ✅ Dashboard layout gebruikt `supabase.auth.getSession()` + `onAuthStateChange`
- ⬜ Rate limiting op `/api/upload` en `/api/analyze`  ← post-launch (bijv. max 3 analyses/uur per user)
- ⬜ Brute-force bescherming op login (Supabase doet dit deels, maar overweeg Cloudflare Turnstile)

---

## 💳 Betaalflow

- ✅ Mollie betaalpagina aanmaken (`/api/checkout`) — iDEAL, creditcard, Bancontact automatisch
- ✅ Mollie webhook (`/api/webhooks/mollie`) — verifieert betaling door status op te halen bij Mollie
- ✅ Webhook start de AI-analyse na succesvolle betaling
- ✅ Webhook stuurt bevestigingsmail via Resend
- ✅ `paid`, `paid_at` en `mollie_payment_id` kolommen op `analyses` tabel
- ✅ Betalingsbanner in analyse-statusscherm na terugkeer van Mollie (`?betaald=1`)
- ✅ Knop in UploadPage heet nu "Betalen & starten" en opent Mollie
- 🔧 Mollie account aanmaken en activeren op mollie.com
- 🔧 `MOLLIE_API_KEY` instellen (live key begint met `live_...`, test key met `test_...`)
- 🔧 Webhook URL instellen in Mollie dashboard: `https://smartzones.nl/api/webhooks/mollie`
- ⬜ *(geen extra stap — iDEAL en andere NL betaalmethoden werken automatisch)*
- 
- ⬜ Factuur PDF automatisch genereren en meesturen in bevestigingsmail
- ✅ Terugbetaling via /api/admin/refund — Mollie API + analyse status update

---

## 👤 Authenticatie & Gebruikersbeheer

- ✅ Login formulier met foutmelding bij verkeerd wachtwoord
- ✅ Registreer formulier met naam, e-mail, wachtwoord (min. 8 tekens), winkelnaam
- ✅ Naam opgeslagen in `user_profiles` tabel en `user_metadata`
- ✅ Dashboard greeting gebruikt naam uit Supabase (`user_profiles` → `user_metadata` → e-mail prefix)
- ✅ Uitloggen via `supabase.auth.signOut()` — sessie wordt daadwerkelijk beëindigd
- ✅ Instellingen pagina: naam + winkelnaam opslaan, wachtwoord wijzigen — alles echt werkend
- 🔧 Supabase Auth: Site URL instellen op `https://smartzones.nl`
- 🔧 Supabase Auth: Redirect URLs toevoegen (`https://smartzones.nl/**`)
- 🔧 Supabase SMTP instellen voor auth-e-mails (gebruik Resend SMTP)
- ⬜ E-mailbevestiging bij registratie (nu uitgeschakeld voor gemak — overweeg aan te zetten)
- ⬜ Wachtwoord vergeten e-mail ← werkt zodra Supabase SMTP is ingesteld (stap 5 in SETUP.md)

---

## 🗄️ Database

- ✅ Migratie `20260101_base_schema.sql` — kern tabellen (analyses, leads, email_log, etc.)
- ✅ Migratie `20260319_add_store_context_and_tone.sql` — doelgroep, concurrenten, focusgebieden
- ✅ Migratie `20260402_api_keys_anthropic.sql` — API keys tabel
- ✅ Migratie `20260403_storage_policies.sql` — storage RLS (vervangt oude anonieme policies)
- ✅ Migratie `20260404_auth_and_profiles.sql` — user_profiles, RLS op analyses, paid kolommen
- ✅ Migratie `20260405_production_ready.sql` — visitors, visitor_events, agent_config, agent_activity, tone_config, webhook_config tabellen + seed data agents
- 🔧 Alle 6 migraties uitvoeren in Supabase SQL-editor, in volgorde (let op: alleen één 20260405 bestand)
- 🔧 Storage bucket `videos` aanmaken (privé) in Supabase → Storage
- 🔧 Storage bucket `visuals` aanmaken (privé) in Supabase → Storage
- ⬜ Database backups instellen (Supabase Pro doet dit automatisch)
- ✅ Index op analyses.user_email al toegevoegd in 20260405_production_ready.sql

---

## 📧 E-mail

- ✅ Resend integratie in `lib/email.ts` met gebrande HTML template
- ✅ Resend webhook handler voor open/klik/bounce tracking
- ✅ Bevestigingsmail na Mollie betaling
- ✅ Outreach e-mails via lead-gen agents
- ✅ Spam-guard met warmup schema en per-lead cooldown
- 🔧 `RESEND_API_KEY` instellen
- 🔧 Domein `smartzones.nl` verifiëren in Resend dashboard (SPF, DKIM, DMARC DNS records)
- 🔧 Resend webhook endpoint registreren: `https://smartzones.nl/api/webhooks/resend`
- ✅ Unsubscribe link in outreach e-mails + /uitschrijven pagina + API route

---

## 🚀 Deployment

- ✅ `vercel.json` met cron job configuratie
- ✅ `SETUP.md` met stap-voor-stap handleiding
- ✅ `.env.local.example` compleet met alle 12 variabelen
- ✅ `@supabase/ssr` toegevoegd aan `package.json`
- ✅ `@mollie/api-client` toegevoegd aan `package.json`
- 🔧 `npm install` uitvoeren na nieuwe packages
- 🔧 Alle env vars invullen in Vercel → Project Settings → Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_KEY`
  - `ANTHROPIC_API_KEY`
  - `RESEND_API_KEY`
  - `MOLLIE_API_KEY`
  - `NEXT_PUBLIC_SITE_URL` (= `https://smartzones.nl`)
  - `ADMIN_PASSWORD`
  - `CRON_SECRET`
- ✅ vercel.json gecorrigeerd — onnodige cron header verwijderd
- 🔧 Vercel Pro plan activeren (gratis plan limiet = 60s, analyses hebben 300s nodig)
- 🔧 Domein `smartzones.nl` koppelen in Vercel → Domains
- 🔧 Test-analyse draaien na deployment met Mollie test API key en testnummer `NL55INGB0000000000`
- ⬜ Vercel Analytics ← 1 klik in Vercel dashboard (post-launch)
- ⬜ Sentry / LogRocket ← post-launch monitoring

---

## 🤖 AI & Analyse

- ✅ Claude Vision analyse pipeline (layout → zones → heatmap → implementatieplan)
- ✅ Frame extractie in browser + upload via signed URLs naar videos bucket
- ✅ Server-side frame extractie als fallback (via ffmpeg) — bucket naam gecorrigeerd (frames → videos)
- ✅ Visuele gidsen (before/after afbeeldingen) gegenereerd met Sharp — signed URLs voor privé bucket
- ✅ Validatie en normalisatie van AI-resultaten (`calibration.ts`)
- ✅ Statusscherm pollt automatisch elke 5 seconden
- ✅ PDF en CSV export van analyseresultaten
- 🔧 `ANTHROPIC_API_KEY` instellen + gebruikslimiet instellen in Anthropic console
- ✅ Model naam gecorrigeerd naar `claude-sonnet-4-5`
- ✅ Gedragsanalyse tab toegevoegd in analyseresultaten (verblijftijden, gedrag, afhaakmomenten)
- ✅ Herstart-knop voor mislukte analyses — retry knop in statusscherm
- ✅ E-mailnotificatie als analyse klaar is — verstuurd na voltooiing

---

## 🎯 Admin & Lead Generation

- ✅ Admin panel met sidebar navigatie
- ✅ Lead-gen agents: research, outreach, follow-up, nurture
- ✅ Cron job draait automatisch elke 5 minuten op Vercel
- ✅ Agent activiteitenlog
- ✅ E-mail drafts systeem met review voor verzending
- ✅ A/B test framework voor e-mail onderwerpen
- ✅ Admin dashboard pagina (grafieken zijn nu hardcoded — zie hieronder)
- ✅ Admin dashboard: echte data uit database (omzet, analyses, klantentype, activiteit)
- ✅ Admin dashboard: klantenlijst uit `analyses` tabel
- ✅ Facturen pagina met echte data + zoekfunctie + link naar Mollie
- ✅ Zoek- en filterfunctie in leads tabel (op naam, contact, stad, fase)

---

## 🛡️ Wettelijk & Compliance (NL/EU)

- ✅ Privacy pagina aanwezig (`/privacy`)
- ✅ Cookie consent banner aanwezig
- ✅ Cookies pagina aanwezig (`/cookies`)
- ✅ AVG/GDPR: gegevensverwijdering via /api/account/delete — verwijdert auth, analyses en storage
- ⬜ AVG/GDPR: verwerkersovereenkomst afsluiten met verwerkers (Supabase, Mollie, Resend, Anthropic) ← juridisch/handmatig
- ✅ Unsubscribe in outreach e-mails + /uitschrijven pagina + spam-guard blokkeert afgemelden
- ✅ KvK en BTW-nummer in factuurmail (via KVK_NUMMER + BTW_NUMMER env vars)
- ✅ Algemene voorwaarden pagina (/voorwaarden)

---

## 📊 Nog te bouwen (nice-to-have)

- ✅ E-mailnotificatie als analyse klaar is
- ✅ Behavioural analysis tab — al toegevoegd (gedragsanalyse)
- ✅ Herstart mislukte analyse — retry knop in statusscherm
- ⬜ POS data upload UI ← toekomstige feature
- ⬜ Team-functionaliteit ← toekomstige feature
- ⬜ Analyse vergelijken ← toekomstige feature
- ⬜ Mobiele app ← toekomstige feature
