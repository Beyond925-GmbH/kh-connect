# Verifikation: Dachdecker — Design-Fixes

Durchlauf auf http://localhost:5173/, Viewport 1366×1024, localStorage geleert.
Screenshots liegen unter /tmp/khpl-shots-nach/dachdecker/ (Kopie aus dem
Worktree-Root, da Playwright-MCP nur dorthin schreiben darf).

## Welle-1-Fixes (app-weit, wirken auch auf Dachdecker)

- **BEHOBEN** — Weiter-Knopf ist jetzt limette (`bg-kh-signal`) statt orange.
  Bestätigt per Klassenauslesung auf M1 (`bg-kh-signal text-[#0E0D0B] border-2
  border-kh-signal`). Screenshot: 03-m1-geloest.png
- **BEHOBEN** — „AUSGEWERTET"/„Ausgewertet"-Stempel ist jetzt reine Textzeile
  in Limette ohne Pillenform/Füllfläche (`text-kh-signal uppercase`, kein
  `rounded-kh-pill`, kein `bg-kh-signal`). Steht klar neben, nicht mehr wie
  ein zweiter Button neben dem Weiter-Knopf. Screenshot: 03-m1-geloest.png

## 1/10 — Der erste Termin (M1)

- **BEHOBEN** — M1 R3 Weiter-Knopf orange → jetzt limette (s. o., Welle 1).
- **BEHOBEN** — M1 R3 „AUSGEWERTET"-Stempel Button-Form → jetzt Textzeile
  ohne Pillenform (s. o., Welle 1).

## 2/10 — Was kostet dieses Dach? (M2)

- **BEHOBEN** — M2 R3 Slider-Griff orange → jetzt limette (`--color-kh-signal`,
  Schatten `rgb(216 246 60 / .45)`), visuell bestätigt: großer limetter
  Griff auf dem Regler. Screenshot: 04-m2-initial.png
- **BEHOBEN** — M2 R10 „Abbund und Aufrichten" unerklärter Fachbegriff → das
  Wort „Abbund" ist jetzt ein unterstrichener `<Begriff>`-Chip in der
  Kostenaufstellung. Screenshot: 05-m2-geloest.png
- **BEHOBEN** — M2 R11 Abweichung als nackte Zahl → nach „14.500 € daneben"
  steht jetzt „Genau deshalb braucht's dafür eine Ausbildung — kein
  Bauchgefühl." (Einordnungssatz, reagiert laut Code auf die Abstandsgröße).
  Screenshot: 05-m2-geloest.png

## 3/10 — Aus dem Angebot wird ein Auftrag (M3)

- **BEHOBEN** — M3 R2 Begriff-Popover deckte Karte nicht vollständig ab,
  abgeschnittener Text sichtbar → Popover ist jetzt blickdicht (`bg-[#12110e]`
  statt transparentem `kh-panel`), kein Textdurchschein, kein abgeschnittenes
  Wortende mehr sichtbar, Pfeilspitze zeigt sauber zum Chip. Screenshot:
  07-m3-begriff.png
- **OFFEN** — M3 R10 Abbundplan zeigt weiterhin alle ~15 Sparren gleichzeitig
  in derselben Helligkeit, kein Bauteil hervorgehoben, kein Dimmen auf den
  Rest. Der textliche Teil des Fixes ist umgesetzt (Warum-Text: „jedes Holz
  mit Länge, Winkel und eigener Nummer — du musst noch keins davon lesen
  können" lizenziert das Nichtwissen jetzt ausdrücklich), aber die
  vorgeschlagene visuelle Hervorhebung/Dimmung eines Sparrens fehlt weiterhin
  — die Zeichnung bleibt eine "Wand aus Linien" ohne Ankerpunkt. Screenshot:
  06-m3-initial.png

## Abstecher B3.1 — Bestellt wird nach Plan

- **BEHOBEN** — B3.1 R5 zwei Aha-Karten beide automatisch offen (~85 Wörter)
  → nur die erste (Ausbildungsordnung) öffnet automatisch, die CO₂-Karte
  startet als Klappzeile und lässt sich antippen. Sichtbarer Text jetzt
  ~50 Wörter statt 85. Screenshot: 10-b31-abstecher.png
- **BEHOBEN** — B3.1 R10 Glossar-Chip auf „Holz" verlinkte den falschen
  Begriff (Brettschichtholz) → Begriff-Chip komplett entfernt, „Holz" ist
  jetzt einfacher Fließtext ohne Chip. Screenshot: 10-b31-abstecher.png

## Abstecher B3.2 — Vom Plan in den Kopf

B3.2 war in beiden Reviews "sauber" — kein Befund zu prüfen. Kurz
durchgeklickt (Screenshot: 11-b32.png), keine Auffälligkeit.

## 4/10 — Ein Balken, ein Maß (M4)

- **BEHOBEN** — M4 R1 Bühne ließ nach dem Lösen über die Hälfte der Fläche
  dunkel/leer (Zuschnitt3D-Framing) → im gelösten Zustand füllt der Anhänger
  mit Balkenbündel und Rädern durchgängig die obere Bildhälfte, kein
  auffälliger dunkler Leerraum mehr über der Szene. Bestätigt per
  `fuelleHoehe`-Mechanik im Code (Höhen-Füllung der Hülle) und visuell.
  Screenshot: 16-m4-geloest.png

## Abstecher B4.1 — Beladen

- **BEHOBEN** — B4.1 R1 Werkhof-Szene ließ rund die Hälfte der Bühne dunkel
  und leer (Beladen3D-Framing) → nach vollständigem Beladen (5/5) füllt das
  Gespann deutlich mehr der oberen Bildhälfte, der verbliebene dunkle Rand
  oben ist klar kleiner als vorher (~30 % statt ~50 %). Screenshot:
  19-b41-geloest.png

## 5/10 — Aufrichten (M5)

- **OFFEN** — M5 R1 „drittes Auftreten" des Werkhof-Kamera-Leerraum-Musters:
  im gelösten Zustand (Unterbau steht) bleibt weiterhin ein deutlicher
  dunkler Streifen über der Szene (~35 % der Bühnenhöhe). Der Code-Diff
  zeigt: der Fix (`fuelleHoehe`-Mechanik) wurde nur in `Zuschnitt3D.tsx`
  (M4) und `Beladen3D.tsx` (B4.1) nachgezogen — M5 nutzt aber
  `Dachstuhl3D.tsx` (dasselbe Modul wie M3), dort ist die Kamera/Framing-
  Logik unverändert. Der ursprüngliche Befund vermutete „vermutlich
  dieselbe Bühnen-Grundlage" — tatsächlich ist es eine andere Komponente,
  die den Fix nicht mitbekommen hat. Screenshot: 22-m5-geloest.png

## Abstecher B5.1 — Niemand macht das allein

- **OFFEN-ERWARTET (Medienlücke, gemeldet)** — B5.1 R13 kein echtes Zitat aus
  dem Team → weiterhin kein Zitat, der Fachtext verweist jetzt lediglich auf
  das Foto („Die zwei auf dem Foto machen gerade genau das"). Im Code selbst
  dokumentiert als bekannte, noch offene Medienlücke
  (`ui-review/medien-luecken-dachdecker.md`, Datei existiert) — kein neuer
  Fehler, sondern erwartungsgemäß unverändert bis echtes Material vorliegt.
  Screenshot: 24-b51.png

## 6/10 — Halb zwölf (M6)

M6 war in beiden Reviews "sauber" — kein Befund zu prüfen. Kurz
durchgeklickt (Screenshot: 25-m6.png), keine Auffälligkeit.

## 7/10 — Jetzt du (M7)

- **BEHOBEN** — M7 R10 fünf Fachbegriffe auf den Zieh-Karten ohne Erklärung
  → jede Vorführungs-Sprechblase und jede Bauteilkarte („Dachlatten",
  „Windrispenbänder", „Kehlbalken", „Konterlattung", „Sparrenpaare") trägt
  jetzt einen erklärenden Satz unter dem Namen, analog zu M5. Screenshots:
  28-m7-vorfuehrung.png (Vorführung mit Erklärsatz zu „Kehlbalken"),
  29-m7-bauen.png (alle fünf Karten mit Erklärung).
- **OFFEN** — M7 R1 „vierter Beleg" für das Werkhof-Kamera-Leerraum-Muster:
  im Zwischenzustand (Bauphase, Karten links) bleibt die 3D-Szene klein und
  von viel dunkler Fläche umgeben — hier sogar in einem eigenen rechten
  Fensterbereich mit sichtbarem Leerraum oben, unten und seitlich um das
  Modell. Gleiche Ursache wie M5: `M7.tsx` nutzt ebenfalls `Dachstuhl3D.tsx`,
  das den Höhen-Füllungs-Fix nicht erhalten hat. Screenshot: 29-m7-bauen.png
  (Interaktion nicht bis zum Lösungszustand abschließbar — Drag-and-Drop auf
  die 3D-Szene ließ sich mit synthetischen Zeigerereignissen nicht zuverlässig
  auf die Zielzone treffen; das war jedoch nicht der Zweck dieser Prüfung).

## 8/10 — Feierabend (M8)

M8 war in beiden Reviews "sauber" — kein Befund zu prüfen. Kurz
durchgeklickt (Screenshot: 31-m8.png), keine Auffälligkeit.

## 9/10 — Und danach? (M9/B9.1 Meister-Detail)

- **BEHOBEN** — B9.1 R5 vier Info-Felder alle offen (~82 Wörter) → nur „Was
  ist das" und „Was du verdienst" stehen offen, „Wie lange" und „Was es
  kostet" sind Klappzeilen (einzeln antippbar, akkordeon-artig — nur eine
  gleichzeitig offen). Sichtbarer Text jetzt klar unter Budget. Screenshot:
  33-b91-meister.png
- **BEHOBEN** — M9/B9.1 R12 Meister-Gehalt „54.000 Euro" ohne Körper-Anker →
  Satz ergänzt: „— etwa dreimal so viel wie ein Azubi im dritten Lehrjahr."
  Auch die Kosten-Zeile bekam einen Anker: „...zahlt am Ende etwa ein
  Viertel selbst: knapp zweieinhalb Azubi-Monatslöhne." Screenshot:
  33-b91-meister.png

## 10/10 — Dein nächster Schritt (M10) & Dein-Weg-Übersicht

M10 war in beiden Reviews "sauber" — kein Befund zu prüfen. Screenshot:
35-m10.png

- **BEHOBEN** — Dein-Weg-Übersicht R3 „Besucht" war orange statt limette →
  alle abgeschlossenen Knoten (1–9) und alle abgehakten Abstecher zeigen
  jetzt ein limettes Kontur-Häkchen (`border-2 border-kh-signal/60`,
  `text-kh-signal`), kein Orange mehr für „erledigt". Nur der aktuelle
  Knoten („DU BIST HIER", Schritt 10) ist die gefüllte limette Fläche —
  klare Farbhierarchie: Kontur = geschafft, Fläche = hier stehst du.
  Screenshot: 36-dein-weg.png

## Regressionen

- **REGRESSION** — Zwei gefüllte Limette-Flächen gleichzeitig auf demselben
  Screen: die `Rueckmeldung`-Komponente (M4, B4.1, M7 — z. B. „Passt. Nummer
  drauf — das ist jetzt dein Sparren.") ist bei „richtig" weiterhin voll
  limette gefüllt (`bg-kh-signal`, `rounded-kh`, schwarzer Haken-Kreis) —
  das war korrekt, solange nur sie limette Fläche trug. Seit der Welle-1-Fix
  den „Weiter"-Knopf ebenfalls auf `bg-kh-signal` umgestellt hat, stehen auf
  M4 nach dem Lösen zwei volle Limette-Flächen gleichzeitig im Bild: die
  Rückmeldung und der „Weiter zur Baustelle"-Knopf direkt darunter. Der
  eigene Kommentar in `Rueckmeldung.tsx` behauptet noch „Gelbgrün ist im
  ganzen System für genau das reserviert — es taucht sonst nirgends als
  Fläche auf" — das stimmt seit dem Button-Fix nicht mehr und widerspricht
  jetzt R8 („genau ein gefülltes limettes Element pro Screen heißt ‚hier
  geht's weiter'"). Fix-Vorschlag: `Rueckmeldung` bei `ok=true` auf eine
  Kontur-Variante (analog zur neuen `aktion`-Button-Optik) oder eine neutrale
  Fläche mit limettem Text/Icon umstellen, damit die Signalfarbe als Fläche
  weiterhin exklusiv dem Weiter-Knopf gehört. Screenshot: 16-m4-geloest.png
  (dieselbe Komponente wird laut Code-Kommentar auch in B4.1 und M7
  verwendet — dort im getesteten Durchlauf nicht in derselben Deutlichkeit
  aufgetreten, aber dieselbe Ursache betrifft potenziell auch diese Screens).
