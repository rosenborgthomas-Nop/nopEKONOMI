# nopEKONOMI — protokoll

## 2026-11-26: Akut mobilfelsökning — stabilt läsläge (t.o.m. v32)

### Bakgrund
- Appen har använts dagligen i 3–4 månader från både dator och mobil.
- Sista kända lyckade transaktion gjordes på morgonen 2026-11-25.
- Därefter började mobilversionen hänga/fastna i samband med koppling till bokfilen i Google Drive.
- Datorversionen fungerar fortsatt och ska skyddas från riskabla ändringar.

### Runtime-bevis under felsökningen
- Telefonen kunde inte skicka debugloggar till lokal debugserver (`127.0.0.1`), så felsökningen flyttades till synliga Debug-rader i appen.
- v23 visade att mobilen faktiskt körde rätt version och att Inloggning ritades korrekt:
  - `version=2026-11-25 v23`
  - `böcker=2`
  - `valt=b3`
  - `knappDisabled=nej`
  - `panelDold=nej`
- v24 fångade rotfelet vid öppning:
  - `Cannot access 'onStart' before initialization`
- Felet satt i `updateBookFileSyncStatusUi()`: mobilgrenen använde `onStart` och `localAhead` innan variablerna deklarerats.
- v25 flyttade statusberäkningen före mobilgrenen och tog bort den kraschen.
- Kallstart kunde fortfarande ladda gammal version först. v27 ändrade service worker/registrering:
  - HTML hämtas med `cache: 'no-store'`
  - service worker registreras med `updateViaCache: 'none'`
  - efter en manuell uppdatering låg v27 kvar vid omstart.
- Mobilens vanliga `click`/`pointerup` var opålitliga på vissa knappar.
  - v31 lade `touchend`-fallback med koordinatkontroll för `Öppna` och `← Inloggning`.

### Nuvarande säkra läge
- Beslut: prioritera **stabilitet** före mobil skriv/synk.
- v32 gör mobilen till stabilt läsläge:
  - mobilen läser från lokal kopia
  - mobilen ska inte spara nya lokala ändringar som om de vore riktiga
  - ändringsförsök stoppas med meddelande om stabilt läsläge
  - status på Start ska säga att telefonen läser från kopia och inte sparar ändringar
- Detta skyddar moderfilen och datorflödet, men betyder att mobilen för tillfället inte är en full redigeringsenhet.

### Kända kvarstående problem
- `Ny transaktion` går inte på mobilen. Det är förväntat i v32:s stabila läsläge, men UI/meddelande kan behöva göras tydligare.
- Man kan ta sig till `Rapporter`, men kommer inte tillbaka därifrån enligt senaste observation. Nästa felsökning bör instrumentera rapportens `← Start`/backflöde på samma sätt som Start/Inloggning.
- Debugrader/toasts ligger fortfarande kvar i koden och ska tas bort först när mobilflödet är verifierat stabilt.

### Trolig orsak / varför det hände plötsligt
- Sannolikt en kombination av:
  - Android/Chrome/Google Drive ändrade beteende eller blev mer känsligt kring File System Access/Drive-handtag.
  - Appen byggde på sparade fil-/mapphandtag och antaganden som fungerat länge men inte är garanterade på Android.
  - De snabba mobilfixarna under 2026-11-25 flyttade flera kodvägar till “undvik filhandtag på mobil”, vilket stoppade hängningar men skapade nya sidofel: lokal telefonkopia, döda knappar, och statuskod som kördes i fel ordning.
- Datorn fungerar eftersom desktop-Chrome hanterar File System Access och sparade handtag mer stabilt än Android.

### Rekommenderad fortsättning
- Kort sikt: behåll mobilen som läsläge tills rapport-back och knappflöden är stabila.
- Därefter: ta bort debugkod och publicera ren stabil version.
- Senare separat plan: säker mobil skriv/synk till moderfilen. Det ska inte blandas in i akut stabilisering.

## 2026-09-22: Trendlinjer — godkänt läge (t.o.m. v39)

Användaren är **nöjd med hur alla Trendlinjer uppför sig**. Paus för vidare Trend-linjearbete tills nytt behov dyker upp.

### Levererat (urval, v11–v39)
- **Prognos (In/Ut):** historik + OLS-trend; legend med Slutdest / skillnad / %
- **Netto över tid — Alla:** kumulativt netto som Rapport (inkl. öppningsbalans); Slutdest-förklaring
- **Netto över tid — Bocklista:** enbart bocklistaserien (ingen Alla-overlay); samma Slutdest-förklaring som Alla
- **Detalj → Payee / Kategori / Underkategori:** lista + dubbelklick → nettotrend (Historik + Horisont)
  - Inkomst/Utgift-klassning från historik; utgift speglas (absolutvärde); ren utgift limmas vid 0
  - Övergång minus→plus i historiken: ingen limning
  - Scroll nollställs vid ny drill / tillbaka till lista
- Y-etiketter på mobil: dynamisk vänsterpad + texttak så siffror inte klipps
- Avstämning rå − rensad = Σ uteslutna (bocklista); prognos ankrad i sista historiska värde (Netto)
- Publicerat löpande till GitHub Pages (senast **2026-09-22 v39**)

### Medvetet *inte* aktuellt just nu
- Ytterligare tweaks av Trendlinjernas beteende (godkänt)

---

## 2026-09-19: Trend — paus efter seriös historik

### Levererat (v02–v10)
- Trend egen sida från Start (typ + historik bakåt + horisont framåt)
- Registervård → Trend: kategorier, expanderbara underkategorier, `(utan underkategori)`, trestegs-bockruta
- Klick: bara pil fäller ut, bara bockruta växlar
- Historik = **bara fulländade månader** (pågående månad ingår inte) — skattning (dag-för-dag / proportionell) övergavs efter felaktiga september-siffror
- Publicerat löpande till GitHub Pages

### 2026-09-19: Tink/PSD2 rensat

Kirurgisk borttagning av hela Tink/open banking-spåret:
- mappen `open-banking/` bort
- Bankkoppling-UI/JS bort (HTML återställd till sista pre-Tink: `2026-09-17 v01`-bas + ny version)
- Orsak: Tink serverar inte privatpersoner/hobbyister för production; sandbox räckte som pilot.

## Nästa (väntande)

- **Mobil Typ-meny:** tidigare friktion kring avskiljare/`disabled`-optioner (v24/v25); baseline är Detalj + Payee/Kategori/Underkategori — följ upp om något fortfarande strular på telefonen
- Putsa övrigt UI vid behov
- Fortsätt med filimport (QIF/CSV) som bankväg
- Ev. annan AIS-leverantör senare om någon tillåter personligt bruk

## Behålls

- Rapporter, färger, PWA, import, registervård — allt före Tink-äventyret
- Trend: `?` döljer förklaring/historiktabell (default dold) — redan i bruk
