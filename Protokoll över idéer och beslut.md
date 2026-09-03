# Protokoll över idéer och beslut

Det här är projektets eget minne. Det ska vara kort och praktiskt — tillräckligt
så att vi (eller en ny chatt) snabbt förstår *vad* som bestämts och *varför*,
utan att du behöver minnas allt själv.

**Rutin:** När vi tar ett beslut eller landar en idé värd att spara → en rad här.
Assistenten uppdaterar filen när du ber om det, eller när vi avslutar ett tydligt steg.

**Senast uppdaterad:** 2026-09-03

---

## Grundriktning

| Datum | Typ | Beslut / idé |
|-------|-----|--------------|
| — | **Beslut** | Migrera från LibreOffice Calc + Python till **en enda HTML-fil** som körs helt i webbläsaren. |
| — | **Beslut** | Huvudfil: `Hemekonomi.html`. Ska kännas som ett **program**, inte en webbplats med många sidor. |
| — | **Beslut** | Arbeta i **små steg**. Användaren ger konceptuell vägledning; assistenten kodar. |
| 2026-08-19 | **Beslut** | Projektet ska ha detta protokoll som **oberoende minne** — inte beroende av chatt historik. |

---

## Lagring och böcker

| Datum | Typ | Beslut / idé |
|-------|-----|--------------|
| — | **Beslut** | **Flera böcker** — helt fristående, som separata MS Money-filer. Ingen delning av konton eller transaktioner mellan böcker. |
| — | **Beslut** | Registret i `localStorage` (per programmapp från 2026-08-26). Varje boks data: fil `Boknamn.json` (äldre: `msmoney_book_<id>`). |
| — | **Beslut** | Bok-id får **aldrig återanvändas** så länge data finns kvar under det — annars kan en ny bok ärva gammal data. |
| 2026-08-19 | **Beslut** | **Boknamn måste vara Windows-säkra** redan vid skapande och namnbyte: inte `\ / : * ? " < > |`, inte avsluta med mellanslag eller punkt (filnamn vid säkerhetskopiering). |
| 2026-08-19 | **Beslut** | **Nya böcker sparas som fil** — `Boknamn.json` i arbetsmappen. Registret i localStorage; bokföringen i filen. |
| 2026-08-24 | **Beslut** | **Ny bok:** sparas bara som `Boknamn.json` i programmappar. Återanvänder känd behörighet; annars webbläsarens tillståndsdialog (mappen måste innehålla `Hemekonomi.html`). Avbryt/neka = Avbryt. Fel mapp → förklaring, försök igen. Ingen localStorage-bok. |
| 2026-08-24 | **Beslut** | **Registervård → Bok:** lista med alla boknamn (som Payee). Bara den öppna boken kan redigeras (dubbelklick → namnfält → OK). Säkerhetsspärr: skriv inte över en annan bokfil på disk. |
| 2026-08-24 | **Beslut** | **Konto-borttagning** bara på *Skapa / Redigera Konto* (Registervård → Konto), med varning. **Ingen** borttagning i listvyn. **Ingen borttagning om kontot har transaktioner** (öppningsbalans räknas inte). Tomt sista konto → hela boken tas bort. |
| 2026-08-24 | **Beslut** | **Registervård (Bok/Payee/Kategori/Underkategori):** redigeringsläget har **Ta bort…** med bekräftelse. Vid data: varning (+ flytta poster för payee/kategori/underkategori). Bok: varning om alla konton/transaktioner, sedan bort. |
| 2026-08-23 | **Beslut** | **Tre-generationsbackup borttaget** ur koden. Bokfilen sparas löpande till disk. |
| 2026-08-24 | **Beslut** | Inloggningens bokrullgardin har **inte** längre **Återställ** (placeholder borttagen). Återställning sker via Registervård → Bok → Säkerhetskopia. |
| 2026-08-19 | **Beslut** | **En oläslig bokfil tolkas aldrig som en tom bok.** Läsningen säger ifrån i stället, och boken lämnas orörd. Tidigare skrevs en tom bok tillbaka över filen vid öppning — bokföringen kunde raderas av en skadad eller tillfälligt oläsbar fil. Öppning skriver inte längre om bokfilen i onödan. |
| 2026-08-19 | **Beslut** | **Minnesdisciplin vid säkerhetskopiering.** Hela bokföringen får inte finnas i flera samtidiga kopior i minnet. Jämförelsen läser filens inledning, och den utskrivna JSON-texten byggs först när vi bestämt att kopian ska skrivas. Stora böcker kunde annars ta slut på minnet i fliken. |
| 2026-08-19 | **Beslut** | **`requestPermission` bara vid användargest.** Automatiska kontroller (t.ex. `syncRestoreButton` vid start) frågar enbart efter nuvarande behörighetsläge. Annars kastades fel eller dök behörighetsdialoger upp av sig själva vid sidladdning. **Öppning av bok** måste däremot be om tillstånd innan `getFile` — filreferensen i IndexedDB överlever omladdning, men behörigheten gör det inte. Utan det visade Chrome ett engelskt fel och boken öppnades inte. |
| 2026-08-19 | **Beslut** | **Inloggningen väntar aldrig i evighet på disken.** Filkontrollen vid start har en tidsgräns (4 s); löper den ut visas boklistan ändå. En hängande fil eller nätverksdisk får inte lämna sidan tom. |
| — | **Beslut** | Kolumnbredder i transaktionslistan sparas separat (`msmoney_colwidths`), per bok och konto — så transaktionsdata inte skrivs om i onödan. |
| 2026-08-19 | **Beslut** | **Payee/kategori/underkategori i minnet** (`bookLookup`) när bok öppnas — tre listor utan belopp, byggs om vid import. |
| 2026-08-19 | **Beslut** | Sida **Avsluta** — sparning och säkerhetskopiering innan avslut. Se *Säkerhetskopiering*. |
| 2026-08-19 | **Beslut** | Knappen **Avslut** (stäng fönster) togs bort — webbläsare tillåter sällan `window.close()` för manuellt öppnade filer. |

| 2026-08-26 | **Beslut** | **En programmapp = ett lagringutrymme.** localStorage/IndexedDB nycklas utifrån mappen där `Hemekonomi.html` öppnats. DEMO-kopia blandar inte med privat data. |
| 2026-08-26 | **Beslut** | **Första start i ny mapp:** inloggningen visar **Välj arbetsmapp…** (kräver klick — webbläsaren tillåter inte mappdialog utan gest). Efter tillstånd synkas boklistan mot JSON i mappen. Tom lista ⇒ **NY BOK** valfritt, inte tvingande. |
| 2026-09-03 | **Beslut / riktning** | **Omforma start + backup.** Dagens mappgodkännande direkt vid inloggning skrämmer teknikallergiker (särskilt mobil/PWA). Mål: programmet ska kunna starta utan mappfråga (böcker i webbläsarminne). **Mapp-/filfrågan flyttas till backupflödet** — där den känns motiverad och oskuldsfull. Systemet ska **uppmuntra** till säkerhetskopia (export till fil/mapp), inte tvinga platsåtkomst innan bokföring eller demo. Ej byggt ännu. |

### Så fungerar lagringen (viktigt — återkom till detta)

**HTML-filen är programmet. Bokföringen ligger som JSON bredvid den.**

`Hemekonomi.html` innehåller kod — **inte** dina transaktioner. Varje **mapp** med en kopia av programmet har sitt eget register i webbläsaren (så DEMO och privat ekonomi inte blandas). Själva böckerna är filer `Boknamn.json` i den mappen.

| Nyckel (per programmapp) | Innehåll |
|--------------------------|----------|
| `msmoney_books__…` | Registret — vilka böcker som hör till mappen |
| `msmoney_book__…_<id>` | Ev. äldre localStorage-bok (nya böcker är filer) |
| `msmoney_colwidths__…` | Kolumnbredder |
| IndexedDB `hemekonomi__…` | Filhandtag till programmappen och bokfilerna |

**Säkerhetstest (uppdaterat 2026-08-26):** Kopiera hela mappen (HTML + ev. DEMO-JSON) till en ny plats och öppna den kopian. Du ska **inte** se böckerna från originalmappen. Första gången kan webbläsaren be dig välja programmets mapp så den kan lista JSON-filerna där.

| Situation | Vad händer |
|-----------|------------|
| Kopiera **hela mappen** till ny plats, öppna den kopian | **Egen** boklista — bara filer i den mappen |
| Öppna samma `Hemekonomi.html` via samma sökväg | Samma mapp → samma register |
| Annan dator / annan webbläsarprofil | Tomt tills du pekar ut mappen och JSON-filerna finns där |
| Rensa webbläsardata för sidan | Register/handtag kan försvinna; **JSON-filerna på disk finns kvar** |

**Slutsats:** Riktig backup av bokföringen är **JSON-filerna** (och Registervård → Säkerhetskopia). Att bara kopiera HTML räcker inte — ta med bokfilerna.

---

## Säkerhetskopiering

**Status 2026-08-24:** Tre-generationsbackup via **Registervård → Bok → Säkerhetskopia**. Vid start/inloggning synkas boklistan mot arbetsmappen. **Ta bort bok** raderar original + kopior på disk.

**Vad som gäller nu:** Boken sparas som **`Boknamn.json`** i den gemensamma arbetsmappen. Filen skrivs **automatiskt till disk** via `writeBookAsync` vid varje ändring. Manuell tre-generationskopia skapas från Registervård → Bok.

Gamla säkerhetskopior som redan ligger på disk lämnas orörda (programmet skapar/läser dem inte längre).

| Datum | Typ | Notis |
|-------|-----|-------|
| 2026-08-24 | **Beslut** | **Säkerhetskopia** via Registervård → Bok: lista original + generation 1–3. **Säkerhetskopiera** roterar 2→3, 1→2, original→1. **Återställ** (val/dubbelklick): varning; kopian → `Boknamn.json`; listan uppdateras. |
| 2026-08-24 | **Beslut** | **Ta bort bok** raderar på disk (`Boknamn.json` + säkerhetskopior 1–3) via webbläsarens behörighet — inget tyst hopp över filer. **Inloggning/start** synkar registret mot arbetsmappen (hittar böcker på disk; tar bara bort ur registret efter lyckad mappgenomgång när filen saknas). |
| 2026-08-24 | **Beslut** | **Säkerhetskopia-tider:** kolumn **Skapad/Ändrad**. Original = senast sparad/ändrad (`savedAt`); kopia = när kopian skapades (`backupCreatedAt`). Original skrivs inte om vid kopiering. |
| 2026-09-03 | **Riktning** | **Backup först, mappfråga där.** Ändra hantering av säkerhetskopiering och mappgodkännande. Uppmuntra backup-kopiering; ställ mapp-/filfrågan i det flödet — inte som skrämselskärm före start. Motivering: teknikallergiker ska kunna öppna bok/demo utan platsdialog. Webbläsarminne = smidig start; exportad JSON = riktig kopia (cache-rensning raderar annars data). |

---

## Vyer och navigering

| Datum | Typ | Beslut / idé |
|-------|-----|--------------|
| — | **Beslut** | **Inloggning** kommer före Start — välj eller skapa bok. |
| — | **Beslut** | **NY BOK** som egen knapp (inte bara val i rullgardin). |
| — | **Beslut** | **Start** — landningssida med kontoöversikt och meny. |
| — | **Beslut** | Dubbelklick på konto på Start → **kontoutdrag** (transaktionslista). |
| — | **Beslut** | Kontoutdrag: minimal sida — bara **← Start**, rullgardin, och listan. |
| — | **Beslut** | Rullgardin på kontoutdrag: **Ny transaktion** + alla konton. Byter konto direkt vid val (”flyger” mellan konton). |
| 2026-08-19 | **Beslut** | **Ny transaktion** — egen vy. Ingång från Start-menyn och kontoutdragets rullgardin; båda landar på samma ställe. **Dubbelklick på rad** i kontoutdrag öppnar samma vy med fält ifyllda (redigering/sparning kommer senare). Split-knappen **lyser** om transaktionen har delar (Ut/In). Rutan har kontoväljare, **datumfält**, flikar Ut / In / Överföring, Avbryt och OK. **Byter man flik manuellt raderas alla fält.** Summa alltid positiv i formuläret. Överföring: `[Kontonamn]` → Från/Till enligt tecken. Payee/Kategori/Underkategori: datalist från `bookLookup`. |
| 2026-08-21 | **Beslut** | **Split** — eget fönster ovanpå Ny transaktion (Ut/In). Payee ligger kvar på huvudposten. Varje splitrad: kategori, underkategori, memo, belopp. Räknare visar saknas/överskott mot huvudsumman. **En enda godkänd rad** → vanlig post (ingen split). Vid Klar med avvikelse (minst två rader): antingen ändra huvudsumman till splitarnas summa, eller *Fortsätt skriva in split* (tillbaka till inmatning). Kategori/underkategori på huvudraden låses när split är aktiv. |
| 2026-08-20 | **Beslut** | **Startbalans / Opening Balance** får **inte redigeras** via dubbelklick (payee `Opening Balance` eller `Startbalans`, skiftlägesokänsligt). |
| 2026-08-20 | **Beslut** | **Avbryt** (och stängning efter OK) från Ny transaktion går **alltid till kontoutdraget**. Visat konto = kontoväljaren i Ny transaktion. |
| 2026-08-20 | **Beslut** | Kontoutdragets rullgardin: **konton först** (förvalt = aktuellt konto), linje, **Ny transaktion sist**. |
| 2026-08-20 | **Beslut** | **Historikförslag vid ny post** (inte vid redigering): lämnar Payee → kategori om ≥50 % av tidigare poster med samma payee har den. Lämnar Kategori (med payee) → underkategori om ≥50 % matchar payee+kategori; summa = senaste liknande post. Börjar användaren skriva i ett föreslaget fält tas förslaget bort. |
| 2026-08-20 | **Beslut** | Start-menyn: **Ny transaktion**, **Kontovård**, **Rapport**, **Inställningar**. Menyn nollställs alltid till första valet när Start visas. |
| 2026-08-20 | **Beslut** | **Skapa / Redigera Konto** (via *Kontovård* → Konto) — egen vy. Rullgardin: *Nytt Konto* + befintliga. Nytt: namn + öppningsbalans (tom/0 → 0). Redigera: namnbyte + uppdatera öppningsbalansrad. Unika namn (redigering får behålla sitt). **Radera konto** (bara vid befintligt): varning; tar bort kontot. Överföringar i övriga konton **behålls** med payee **ÖVF Raderat konto** (summa oförändrad, `[kontonamn]` nollställs). **Sista kontot i boken** → hela boken raderas (samma som *Radera boken*). Avbryt → Konto/Payee/Kategori. |
| 2026-08-22 | **Beslut** | **Öppningsbalans-datum** (Skapa/Redigera Konto): sätts automatiskt till **sista dagen i månaden före** tidigaste vanliga transaktionen i boken. Finns inga andra poster → sista dagen i föregående kalendermånad. Inte “utan datum”. |
| 2026-08-21 | **Beslut** | Vid sparning av Ut/In: fråga för **varje** ny payee/kategori/underkategori (alla frågor ställs även om någon får Nej). **Ja** → namnet skapas direkt i boken. **Nej** → fältet rensas i formuläret. Transaktionen sparas bara om formuläret fortfarande är komplett efter frågorna. |
| 2026-08-20 | **Beslut** | Payee **ÖVF Raderat konto** är **skyddad**: syns i historik/listor men får inte väljas, skapas eller tas bort av användaren (ej i datalist; ej redigera/radera via kontoutdrag). |
| 2026-08-20 | **Beslut** | **Rapport** — egen vy. Första rapportvalet: *Netto över tid*. Period: Från = tidigaste transaktionsdatum i boken (**utan** öppningsbalans), Till = sista dagen i **senaste transaktionsmånaden** (alla konton; utan öppningsbalans). Sparat Till som ligger efter det klipps när rapportvyn öppnas. |
| 2026-08-20 | **Beslut** | Rapport kräver minst **25 transaktioner** i boken totalt — annars stoppas man på Start med meddelande. |
| 2026-08-20 | **Beslut** | **Alla rapporter** utesluter öppningsbalans (`Öppningsbalans` / `Opening Balance` / `Startbalans`). De ska inte ”ärva” gamla pengar in i t.ex. en första månadsrapport. **Kontosaldo** räknar fortfarande med öppningsbalans. |
| 2026-08-23 | **Beslut** | **Kontoutdrag:** öppningsbalans **döljs visuellt** i listan men **räknas** i löpande saldo och kontosaldo. |
| 2026-08-20 | **Beslut** | Payee för startpost: **Öppningsbalans**. Äldre `Opening Balance` / `Startbalans` känns igen; vid kontosparning migreras de till `Öppningsbalans`. |
| 2026-08-20 | **Beslut** | **Överföring payee** sätts automatiskt: `ÖVF` + mellanslag + **motkontots namn** (t.ex. `ÖVF Sparkonto`). Inget payee-fält i formuläret. |
| 2026-08-19 | **Beslut** | Start har **← Inloggning** högst upp (samma stil som ← Start på kontoutdrag). |
| 2026-08-19 | **Beslut** | Inloggning har **← Avsluta** → sidan Avsluta och säkerhetskopiering. |
| 2026-08-19 | **Beslut** | **Byt bok** borttagen från sidfoten på Start — byta bok sker via ← Inloggning. |
| 2026-08-22 | **Beslut** | QIF-import på **Start** (tom bok) — bort från Inställningar. Importmöjligheten stängs när boken fått innehåll. |

---

## QIF-import

| Datum | Typ | Beslut / idé |
|-------|-----|--------------|
| — | **Beslut** | Import **slår ihop** transaktioner — skriver inte över hela kontot. |
| — | **Beslut** | Dubbletter identifieras via sammansatt nyckel (datum, belopp, payee, kategori, memo, split-signatur). Identisk QIF-fil ger inga nya rader. |
| — | **Beslut** | Rapport visas på Start efter import (hur många nya / redan fanns). |
| — | **Beslut** | Dubbletter vid import känns igen på **innehåll** (sammansatt nyckel) — inte på något transaktionsnummer, för sådant finns inte. |
| 2026-08-22 | **Beslut** | **Delimport:** saknas motkontots QIF skapas **spegelkonton** från överföringar (hel rad `L[Konto]` och split `S[Konto]`). Spegeln får inte poster som bara finns på det kontot (t.ex. bankomat) och inte öppningsbalans — det kompletteras manuellt (Kontovård → Konto, eller transaktion). |
| 2026-08-22 | **Verifierat** | Delimport utan Spargrisen-QIF: spegelkonto skapades; efter manuell bankomat-post + öppningsbalans stämde saldon med MS Money. Steget **avklarat**. |

---

## Tidsväljaren (rapport)

Rapportvyns rullgardin mellan **Till** och **OK**. Syfte: snabbval av tidsperiod utan att krocka med manuellt valda datum.

| Datum | Typ | Beslut / idé |
|-------|-----|--------------|
| 2026-08-22 | **Klart** | Dummy överst: **Välj tid...** — sidans ingång skriver inte över användarens sparade spann. |
| 2026-08-22 | **Klart** | Sparas per bok: rapporttyp, Från/Till, tidsval. Vid återbesök med sparat snabbval: **räkna om** Från/Till efter regeln + kör rapporten. |
| 2026-08-22 | **Klart** | Ordning: Välj tid... → Pågående månad → Pågående år → Föregående månad → Föregående år → Senaste 30 dagar → Senaste 3/6/12 månader → **Allt** → avskiljare → **Årsred. Y0 -> Y1** → **Årsperioder Y0 -> Y1**. |
| 2026-08-22 | **Klart** | Val i Tidsväljaren sätter datum **och kör rapporten direkt**. Manuellt Från/Till → tillbaka till **Välj tid...**. |
| 2026-08-22 | **Klart** | **Årsred.** — kolumner/staplar per kalenderår (hela året). Utan öppningsbalans. Tomma år = `--`. |
| 2026-08-22 | **Klart** | **Årsperioder** — kolumner/staplar per år, men bara **1 jan – samma månad+dag som i dag** varje år (t.ex. 22/8 → 1/1–22/8). Utan öppningsbalans. Tomma år = `--`. |
| 2026-08-22 | **Klart** | **Årsred./Årsperioder** + **Netto över tid** körs inte tillsammans — vid årsval sätts rapporttypen till **Kategori-Rapport**. |

### Spikade regler (2026-08-22)

1. **Pågående månad / år** — Till = **idag**. Från = 1:a i månaden / 1 jan.
2. **Senaste 30 dagar** — idag och **29 dagar bakåt** (30 dagar inkl. idag).
3. **Senaste 3 / 6 / 12 månader** — **kalendermånader** bakåt (t.ex. senaste 3 i augusti = 1 jun → **idag**). Till = idag.
4. **Föregående månad** — 1:a–sista i förra kalendermånaden. **Föregående år** — 1 jan–31 dec förra året.
5. **Allt** — Från = tidigaste vanliga transaktionen; Till = sista dagen i senaste transaktionsmånaden.
6. **Klippning** — Från klipps upp till bokens tidigaste (utan öppningsbalans); Till klipps ner till sista dagen i senaste transaktionsmånaden.
7. **Öppningsbalans** — ingår **aldrig** i datumytterkanter / kategori- och payee-rapporter. **Netto över tid** behåller sin befintliga logik (inkl. öppningsbalans i ackumulering).

---

## Export (CSV och PDF)

**Status:** **Klart** 2026-09-03 (användaren). Beslut spikade 2026-08-23; export/utskrift i appen godkänd.

**Syfte:** Kunna exportera i stort sett **alla listor och rapporter**. CSV = data; PDF/utskrift = data + grafik där appen har diagram.

| Datum | Typ | Beslut / idé |
|-------|-----|--------------|
| 2026-08-23 | **Beslut** | Användaren **antar alla föreslagna vägar** nedan för CSV-export (format och innehåll). UI-placering och kodning skjuts upp. |
| 2026-09-03 | **Klart** | Export/utskrift godkänd av användaren (CSV + PDF-väg i appen). |
| 2026-08-23 | **Beslut** | **Rapport · kopiera:** knapp **⧉** i verktygsraden kopierar till urklipp (tabbseparerat). **Payee/Kategori:** bara tabellen (ingen diagramdata). **Netto över tid:** period som `YYYY-MM` och tal utan tusentalsmellanslag. Synligt kvitto i rapportvyn. |
| 2026-08-23 | **Beslut** | **Två exportformat ska byggas:** **`.csv`** och **`.pdf`**. Båda för samma vyer/listor/rapporter (där det är meningsfullt). |
| 2026-08-23 | **Beslut** | **CSV = data** (tabeller/siffror). **PDF = data + grafik** — staplar och diagram som visas i appen ska följa med i PDF-exporten. **Ingen** separat export av fristående bildfiler. |
| 2026-08-23 | **Beslut** | **Gemensam CSV-skrivare** i appen — samma escape-/citatlogik som i `CsvTillQif.html` (RFC 4180-liknande). |
| 2026-08-23 | **Beslut** | **Filnamn:** `Hemekonomi - [Bok] - [Vy] - [ev. detalj] - YYYY-MM-DD.csv` / `.pdf` (t.ex. kontonamn vid kontoutdrag). |
| 2026-08-23 | **Beslut** | Excel (`.xlsx`) kan komma **senare** som bonus — inte del av första exportsteget. |

### CSV — tekniskt format (spikat)

| Aspekt | Val | Varför |
|--------|-----|--------|
| Separator | **`;` (semikolon)** | Svensk Excel förväntar sig det |
| Kodning | **UTF-8 med BOM** | Åäö öppnas rätt i Excel på Windows |
| Datum | **`YYYY-MM-DD`** | Redan i boken; entydigt |
| Belopp | **Punkt som decimal**, tecken för +/- | Matchar `Importgeneriskbudget.csv` |
| Citattecken | `"` runt fält med `;`, radbrytning eller `"` | Kompatibelt med `CsvTillQif.html` |

### CSV — transaktioner (kontoutdrag / hela boken)

Referensmall: **`Importgeneriskbudget.csv`** — samma kolumner så export kan gå tillbaka via CSV → QIF om önskat:

`Konto;Datum;Payee;Kategori;Underkategori;Belopp;Memo`

| Datum | Typ | Beslut / idé |
|-------|-----|--------------|
| 2026-08-23 | **Beslut** | Export inkluderar **full transaktionsdata** — inte bara de fem kolumnerna som syns i kontoutdraget (Datum, Payee, In, Ut, Saldo). |
| 2026-08-23 | **Beslut** | **Enkel rad** → en CSV-rad med kategori/underkategori/belopp på raden. |
| 2026-08-23 | **Beslut** | **Split** → **en rad per delpost**; samma konto, datum, payee och memo på alla rader; kategori, underkategori och belopp per del. |

### CSV — registerlistor (Registervård + Start)

| Vy | Kolumner i export |
|----|-------------------|
| **Start — kontoöversikt** | Konto, Saldo (+ ev. sumrad) |
| **Registervård — Konto** | Konto, Antal poster, Saldo |
| **Registervård — Payee / Kategori / Underkategori** | Namn, Antal poster |
| **Registervård — Bok** | Endast boknamn (lista; bara öppen bok redigerbar) |

Enkla tabeller — inget särskilt matrisformat.

### CSV — rapporter (endast tabell)

| Rapport | CSV-export |
|---------|--------|
| **Kategori-Rapport** | **Bred tabell** som på skärmen: radetikett × månadskolumner + Totalt. Sektionsrubriker (*Inkomster*, *Utgifter*) som rad med bara första kolumn ifylld. **Ingen** månadsstapel. |
| **Payee-Rapport** | Samma matris som Kategori-Rapport. **Inga** topp-10-staplar. |
| **Netto över tid** | UI är **endast diagram** — CSV blir **underliggande tabell**, t.ex. `Period;Netto;Kumulativt netto` (en rad per månad/period enligt rapportens logik). |

Rapportexport ska använda **samma period** (Från/Till / tidsväljare) som den visade rapporten.

### PDF — data + grafik

PDF-export ska spegla **det som syns** (eller är meningsfullt att skriva ut) — tabell **och** diagram där appen har grafik.

| Vy / rapport | PDF |
|--------------|-----|
| **Listor** (kontoutdrag, registervård, kontoöversikt) | Tabell som på skärmen. Ingen extra grafik. |
| **Kategori-Rapport** | Tabell + månadsstaplar (samma som vid dubbelklick / rapportvy). |
| **Payee-Rapport** | Tabell + topp-10-staplar (*Varifrån det kommer* / *Vart pengarna tar vägen*) + övriga diagram i rapporten. |
| **Netto över tid** | Diagrammet (kumulativt netto) — ev. kompletterande tabell under diagrammet om det underlättar läsning. |

**Grafik i PDF** = diagram/staplar som appen redan ritar (t.ex. SVG) — **inte** export av separata bildfiler eller foton.

### CSV — grafik utelämnas

I **CSV** exporteras **aldrig** staplar, SVG-diagram eller hover-diagram — endast **tabellunderlag** (siffror). Grafik hör till **PDF**.

### Topplistor

**Klart 2026-08-24** — egen rapportvy i `Hemekonomi.html` med `Top:Payee`, `Topp:Kategori` och `Topp:Underkategori`. Varje vy visar topp positiv + topp negativ som diagram överst och lista under, med urklipp i tab-separerat format.

| Datum | Typ | Beslut / idé |
|-------|-----|--------------|
| 2026-08-29 | **Beslut** | **Diagram** i topplistor (TOPP IN / TOPP UT): max **3 staplar**. **Listan** under visar **alla** poster som tidigare — bara diagrammet begränsas. Konstant `TOPLIST_RANK_MAX = 3`. |
| 2026-08-29 | **Klart** | Användaren nöjd med resultatet efter justering. |
| 2026-09-01 | **Beslut** | Topplistor ska visa **period** i rubrikraden (samma format som Payee-Rapport: `YYYY-MM – YYYY-MM · Uppdaterad …`). |

---

## Stapeldiagram (rapport)

Gemensam skala-motor i `Hemekonomi.html` för alla stapeldiagram (topplistor, Payee-topp-10, månadsstaplar vid dubbelklick, Netto över tid).

| Datum | Typ | Beslut / idé |
|-------|-----|--------------|
| 2026-08-29 | **Beslut** | **Zoom på noll alltid:** golv = 25 % av lägsta positiva värdet i diagrammet dras av innan skala ( `floorRatio` 0,25 ). Ingen extra text om avklippt skala — diskret visuellt. |
| 2026-08-29 | **Beslut** | **Outlier-brott:** värde > median × 1,5 (efter golv) → bruten stapel. Zigzag **bara** på brutna staplar — inte på alla. Övriga staplar skalas mot varandra i nedre ~68 % av utrymmet; outlier fortsätter ovanför brytlinjen. |
| 2026-08-29 | **Beslut** | **Netto över tid:** behåll **färglogik** (grön/gul/röd mot föregående månad). Samma skala-motor för höjd. |
| 2026-08-29 | **Beslut** | **Gemensam motor:** `computeChartBarScale`, `chartBarPixelSize`. Per diagram senare via `opts.scale` / `series.scale` (t.ex. `floorRatio`, `breakFactor`, `useFloor: false`). |
| 2026-08-29 | **Klart** | Implementerat och godkänt av användaren. Payee-rapportens egna topp-10-diagram (**Varifrån det kommer** / **Vart pengarna tar vägen**) oförändrat max 10 — kan justeras separat. |

### Implementeringsfrågor (historik — löst i praktiken 2026-09-03)

- Var exportknappen/kommandot sitter per vy
- Om transaktionsexport ska vara **ett konto**, **alla konton** eller båda
- **PDF:** webbläsarens utskrift till PDF (godkänd väg)
- Om `.xlsx` med flera flikar ska byggas senare *(fortfarande bonus, ej beslutat)*

---

## Prognos (idé — manglas, ej byggd)

*Antecknat 2026-08-22. Användaren vill mangla tankarna innan beslut. Punkterna nedan är **utan rangordning** — kandidater för senare behandling, inte en färdig plan.*

Syfte: använda den gångna ekonomin för att ge en framåtblick — mer beslutsstöd än “spådom”. Plattformen (en lokal `.html`) räcker tekniskt; det som saknas är främst regler och eventuellt schemalagda/återkommande poster.

| Datum | Typ | Beslut / idé |
|-------|-----|--------------|
| 2026-08-22 | **Idé** | Prognos utifrån historik — se punkterna nedan. Ingen implementation förrän användaren spikat riktning. |

### Kandidater (utan värdering av placering)

1. **Historisk trend (extrapolering)**  
   Titta på hur kategori / payee / netto utvecklats över månader och anta att samma mönster fortsätter. Bra för ungefärlig riktning; svag vid stora livshändelser.  
   **Eget tillägg:** hitta ett sätt att **eliminera unicorns** (enstaka extrema poster som skevar snitt/trend).

2. **Kassaflödesprognos (framåtriktad)**  
   Kända återkommande poster (lön, hyra, abonnemang) + uppskattade rörliga poster utifrån historik. Det MS Money / Quicken ofta närmade sig med schemalagda / återkommande transaktioner.

3. **Scenario (“what if”)**  
   Basscenario + t.ex. “om matkostnaden −10 %” / “om räntan +2 %”. Mer beslutsstöd än spådom.

4. **Blandning som ofta är mest användbar**  
   - återkommande kända poster (säkra)  
   - historiskt snitt för rörliga kategorier (osäkra)  
   - tydlig tidshorisont (30 / 90 / 365 dagar)  
   - osäkerhetsintervall (“troligen 8–12 tkr”, inte “exakt 9 432”)

5. **Naturlig första nivå i Hemekonomi** (om/när arbetet startar)  
   - Prognos nästa månad = snitt av senaste N månader per kategori (eller totalt netto)  
   - Visa det bredvid samma månad förra året (säsong)  
   - Markera återkommande payees (finns nästan varje månad) som “förväntade”  
   - Senare: enkel kassaflödesvy “kommande 90 dagar”

---

## Transaktionslista (kontoutdrag)

| Datum | Typ | Beslut / idé |
|-------|-----|--------------|
| — | **Beslut** | **Fem kolumner:** Datum, Payee, In, Ut, Saldo. |
| — | **Beslut** | **En rad per transaktion** — splitdelar visas inte som egna rader utan i hover-bubbla. |
| — | **Beslut** | Sorterbara kolumner; kolumnbredder justerbara (Excel-likt) och sparas per konto. |
| — | **Beslut** | Löpande saldo räknas i **datumordning** men följer med raden när tabellen sorteras visuellt på annan kolumn. |
| 2026-08-19 | **Beslut** | **Kolumnsortering** — alla kolumner klickbara i tabellen (visuellt). Lagring och saldoräkning påverkas inte. |
| 2026-08-19 | **Beslut** | **Inga transaktionsnummer** och **ingen ordningssiffra** — transaktioner har varken eget id eller dagordning utöver lagringsordning/import. |
| 2026-08-19 | **Fix** | **Kontoutdraget klarar tusentals rader.** Tabellen hängde sig i konton med några tusen transaktioner, vilket kunde få Chrome att döda fliken. Tre orsaker rättade: (1) varje rad bar fyra egna mushanterare — med 3 000 rader blev det 12 000 lyssnare att registrera vid varje omritning; nu sitter fyra lyssnare på tabellkroppen och raden hittas via sitt index. (2) Hover-bubblan mätte sin egen storlek vid varje musrörelse, vilket tvingade fram en ny layoutberäkning av hela sidan hundra gånger i sekunden; storleken mäts nu en gång per rad och bubblan flyttas högst en gång per bildruta. (3) Kolumndragning skrev bredder vid varje musrörelse och byggde om alla rader när musen släpptes; nu skrivs bredden en gång per bildruta och ingen omritning sker vid släpp. |
| 2026-08-19 | **Beslut** | **Tabellkroppen byggs i ett svep** — en enda HTML-sträng för alla rader istället för rad för rad. Raden bär sitt index i visad ordning (`data-idx`), och markering och bubbla slår upp transaktionen i den visade listan. |

---

## Saldo och ordning

| Datum | Typ | Beslut / idé |
|-------|-----|--------------|
| — | **Beslut** | Saldot **räknas fram** när listan byggs — sparas inte på rader eller konton. |
| 2026-08-19 | **Beslut** | **Ingen ordningssiffra** inom samma dag — ordningen är bara lagringsordning/importordning. |
| 2026-08-19 | **Beslut** | **Medveten konsekvens:** löpande saldo kan bli negativt mitt på en dag om transaktionerna ligger ”fel” i ordning. När hela dagens transaktioner är inmatade stämmer slutsaldot för dagen. |

---

## Status — vad som är klart / kvar

| Område | Status |
|--------|--------|
| Ny transaktion (formulär) | **Klart** 2026-08-21 — Ut/In/Överföring, OK sparar, historikförslag, bekräftelse vid nya payee/kategori/underkategori. **Split** (fönster, räknare, mismatch-val, en rad → vanlig post). |
| Redigera / ta bort transaktion | **Klart** 2026-08-21 — dubbelklick öppnar ifylld vy; `formDirty`; Delete + varning. Undantag: öppningsbalans och skyddad payee. Split redigeras via samma fönster. |
| Skapa / Redigera Konto | **Klart** 2026-08-20 — skapa, namnbyte, öppningsbalans, radera (överföringar → ÖVF Raderat konto). |
| Kontovård (hub) | **Klart** 2026-08-21 — **Konto/Payee/Kategori** med knappar Konto, Payee, Kategori, Underkategori. Byt namn / radera med flytt av poster. |
| Säkerhetskopiering (JSON) | **Klart 2026-08-24** — Registervård → Bok → Säkerhetskopia (rotation 1–3 + återställ där). **Omformning planerad 2026-09-03** — se *Lagring* / *Säkerhetskopiering*: start utan mappfråga, uppmuntra backup där filfrågan hör hemma. |
| Export (CSV + PDF) | **Klart** 2026-09-03 — se *Export (CSV och PDF)*. |
| Rapporter (alla från Python) | **Klart** 2026-08-24 i `Hemekonomi.html` / `nopEKONOMI.html`: **Kategori-Rapport**, **Payee-Rapport**, **Topplistor** (Payee/Kategori/Underkategori) och **Netto över tid**. Dubbelklick på datarad → månadsstapeldiagram. Period Från/Till. **Tidsväljaren** komplett 2026-08-22 (se eget avsnitt). |
| Stapeldiagram (skala) | **Klart 2026-08-29** — gemensam motor: golv-zoom + outlier-brott. Se *Stapeldiagram (rapport)*. |
| Topplistor (diagram) | **Klart 2026-08-29** — diagram max 3; full lista kvar. Se *Topplistor*. |
| Rapporter (språk/rubriker) | **Klart** 2026-09-03 — språklig putsning godkänd. |
| Rapporter (mobil layout) | **Klart** 2026-09-03 — mobil layout godkänd. |
| Manövrering / navigation | **Godkänt** 2026-09-03 — åtminstone godkänt (hub, menyer, flöden). |
| Saldoräkning vid visning | **Klart** (2026-08-19) — räknas fram, sparas inte på rad. |
| QIF-import | **Klart** 2026-08-22 — Start (tom bok), delimport + speglar, manuell komplettering. Se *QIF-import*. |
| Prognos | **Idé** 2026-08-22 — manglas. Se avsnittet *Prognos*. Ej byggd. |
| Versionsnummer | **Startat** 2026-09-03 — `2026-09-03 v01` i sidfot. Se *Versionsprotokoll*. |

---

## Gamla filer (referens)

Filer som fanns före sammanslagningen till `Hemekonomi.html`:

| Fil | Status |
|-----|--------|
| `Start.html` | **Borttagen** 2026-08-19 (finns i `Hemekonomi.html`; användaren har egna kopior) |
| `Inställningar.html` | **Borttagen** 2026-08-19 (finns i `Hemekonomi.html`; användaren har egna kopior) |
| `Inloggning.html` | Borttagen tidigare (fanns inte kvar i mappen vid städning 2026-08-19) |
| `QIF_Import_Test_8.html` | **Borttagen** 2026-08-19 (import finns i `Hemekonomi.html`; användaren har egna kopior) |
| `QIF_Import_Test_8 - kopia.html` | **Borttagen** 2026-08-19 (transaktionslistan finns i `Hemekonomi.html`; användaren har egna kopior) |
| Python: `QIF_och_TOPPLISTOR.py`, `Rapp_*.py`, `NettoVärde.py` | Kvar som **historisk referens**. Rapportmotsvarigheterna finns i `Hemekonomi.html` (2026-08-21). |

**Kör alltid `Hemekonomi.html`** — det är enda HTML-programmet i mappen.

---

## Parkerat (senare)

| Datum | Ämne | Anteckning |
|-------|------|------------|
| 2026-08-22 | **Prognos** | Idéparkering — användaren manglar. Se *Prognos*. |
| 2026-09-03 | **Start utan mappfråga + backup-uppmuntran** | Riktning spikad. Bygg senare: webbläsarminne för daglig användning; mapp-/filgodkännande vid säkerhetskopia. Se *Lagring* och *Säkerhetskopiering*. |
| 2026-09-03 | **Versionsnummer (PWA/GitHub)** | **Startat** med format `2026-09-03 v01` (v01–v99 per dygn). Syns i sidfot. Se *Versionsprotokoll*. |

*(Export CSV/PDF, manövrering/navigation, rapport-språk och mobil layout: avparkerade 2026-09-03 — se Status.)*

---

## Versionsnummer (riktning — ej byggt)

**Varför:** PWA/GitHub kan visa gammal kod en stund efter push (service worker + cache). Utan versionsnummer går det inte att avgöra om man kör det man tror.

## Versionsprotokoll

**Format:** `ÅÅÅÅ-MM-DD vNN` där NN är 01–99. Samma kalenderdygn höjs v-numret. Nytt dygn startar om på v01. Stanna på v99 tills nästa dygn om det mot förmodan blir fler än 99 publiceringar samma dag.

**Publicering:** samma sträng i `APP_VERSION` (`nopEKONOMI.html`) och i `sw.js` som `CACHE_NAME` (`nopEKONOMI-ÅÅÅÅ-MM-DD-vNN`).

| Version | Datum | Vad som släpptes |
|---------|-------|------------------|
| 2026-09-03 v01 | 2026-09-03 | Versionsnummer i sidfot. Mappfrågan vid start borttagen (behörighet vid Öppna / NY BOK). Test av PWA-uppdateringstid. **Uppmätt:** dator i stort sett direkt; telefon under 2 min. |
| 2026-09-03 v02 | 2026-09-03 | Rubrik `nopEKONOMI` utan CSS-versaler. Tydligare rullgardinspil. Backup-hint på Start. Registervård: Bok (backup). |
| 2026-09-03 v03 | 2026-09-03 | Efter backup: OK istället för Avbryt/Säkerhetskopiera. Läsbar success-ruta. Mobil: kompakt lista Original/Kopia. |
| 2026-09-03 v04 | 2026-09-03 | Mobil backup-layout. Dölj Säkerhetskopiera vid vald kopia. Boklista ej valbar + senast backup. Android move→copy fallback. |

**Riktning (standard):**
1. En konstant `APP_VERSION` i `nopEKONOMI.html` — visas som `version: …` i sidfoten.
2. Samma version i `sw.js` som `CACHE_NAME`. Höjning = ny cache; gammal rensas.
3. Vid varje GitHub-publicering: höj versionen i **båda** filerna, commit, push.
4. Valfritt senare: “Ny version tillgänglig — uppdatera”-knapp när service workern upptäcker ny SW.

---

## Anteckningar vid nästa sammanträde

- Se **Parkerat** ovan (**Prognos**).
- **Stapeldiagram** — klart 2026-08-29. Ev. finjustera `breakFactor` / `floorRatio` per diagramtyp om behov uppstår (`opts.scale`).
- **Tidsväljaren (rapport)** — **klart** 2026-08-22 (regler spikade och implementerade). Se *Tidsväljaren*.
- Redigering: dubbelklick → spara **konto + radindex** vid öppning. OK skriver tillbaka **bara om `formDirty`**, annars stäng. `markBookDirty()` endast vid faktisk skrivning. **Utan transaktionsnummer.**
- Konsekvens: ändrad payee m.m. kan vid QIF re-import ses som ny transaktion (innehållsnyckeln matchar inte längre).
- **Lagring och backup:** se avsnittet *Säkerhetskopiering* och *Så fungerar lagringen*.
- **Programfil:** `nopEKONOMI.html` (tidigare `Hemekonomi.html`).
