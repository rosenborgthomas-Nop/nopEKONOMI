# nopEKONOMI — protokoll

## 2026-09-19: Tink/PSD2 rensat

Kirurgisk borttagning av hela Tink/open banking-spåret:
- mappen `open-banking/` bort
- Bankkoppling-UI/JS bort (HTML återställd till sista pre-Tink: `2026-09-17 v01`-bas + ny version)
- Orsak: Tink serverar inte privatpersoner/hobbyister för production; sandbox räckte som pilot.

## Nästa (valfritt)

- Putsa övrigt UI vid behov
- Fortsätt med filimport (QIF/CSV) som bankväg
- Ev. annan AIS-leverantör senare om någon tillåter personligt bruk

## Behålls

- Rapporter, färger, PWA, import, registervård — allt före Tink-äventyret
