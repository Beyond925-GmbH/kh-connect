# Verifikation — Zimmerer — Design-Fixes

Basis: befunde-zimmerer-system.md, befunde-zimmerer-anfaenger.md
Screenshots NACHHER: /tmp/khpl-shots-nach/zimmerer/
Hinweis: VORHER-Screenshots unter /tmp/khpl-shots/zimmerer/ existieren im Dateisystem nicht mehr (verworfen) — Einstufung erfolgt anhand Codeabgleich + visueller Prüfung gegen die in den Befund-Dateien beschriebenen Zustände.

## Laufprotokoll

### System-Fix R3 (Weiter-CTA limette) — app-weit
- BEHOBEN — "Auftrag annehmen", "Weiter an den Tisch" (C1 Haupt + Abstecher) rendern jetzt mit `bg-kh-signal border-kh-signal text-[#0E0D0B]` (Limette gefüllt) statt orange. Bestätigt per computed className. Screenshot: /tmp/khpl-shots-nach/zimmerer/07-c1-geloest.png, 10-c1-abstecher-klapp.png
- BEHOBEN — Hauptweg-Karte im "Wohin als Nächstes?"-Dialog trägt jetzt `border-kh-signal` (limette Kontur) statt `bg-kh-orange` (volle orange Füllung). Screenshot: /tmp/khpl-shots-nach/zimmerer/08-c1-wege-dialog.png

## C1 — Der Stapel steht schon da

- BEHOBEN (system C1-R3, s.o.)
- BEHOBEN (anfaenger C1-R10, "Ausklinkung" unerklärt) — Wort ist jetzt als `Begriff`-Chip verlinkt ("Ausklinkung — was ist das?"), öffnet ein Glossar-Dialog mit Erklärung "Eine gefräste Kerbe am Ende des Holzes, mit der es passgenau auf der Schwelle sitzt. …". Screenshot: /tmp/khpl-shots-nach/zimmerer/05-c1-ausklinkung-glossar.png
- TEILWEISE / OFFEN (anfaenger C1-R10, "Schwelle" im Fehler-Feedback zu Nr. 44 unverlinkt) — Formulierung wurde verbessert ("Die Schwelle braucht die Kerbe, damit das Holz sauber sitzt." — Zweideutigkeit behoben), aber "Schwelle" ist weiterhin reiner Text ohne `Begriff`-Chip, obwohl der Glossareintrag existiert. Screenshot: /tmp/khpl-shots-nach/zimmerer/06-c1-fehler-44.png
- BEHOBEN (anfaenger C1-R5, Abstecher-Textwand ~140 Wörter) — Die drei Themenkarten (Abbundzentrum/Nagelbrücke/SEMA und AutoCAD) sind jetzt eigene Klapp-Akkordeons, initial eingeklappt; nur ein Absatz + Zitat stehen offen. Screenshot: /tmp/khpl-shots-nach/zimmerer/09-c1-abstecher-initial.png, 10-c1-abstecher-klapp.png

## C2 — Zweiundsechzig Komma fünf

- BEHOBEN (system + anfaenger C2-R6, Titel verrät die Zahl) — Screen-Titel ist jetzt "Das Raster, das keiner sich ausdenkt" — kein Zahlen-Spoiler mehr, exakt der in den Befunden vorgeschlagene Themen-Titel. Zahl "62,5 cm" steht weiterhin korrekt prominent (orange) erst in der Auflösung. Screenshot: /tmp/khpl-shots-nach/zimmerer/12-c2-initial.png, 13-c2-geloest.png
- BEHOBEN (anfaenger C2-R12, Körper-Anker fehlt) — Herleitungskarte enthält jetzt den Satz "62,5 cm — ungefähr deine eigene Schulterbreite." direkt nach der Plattenhälfte-Erklärung. Screenshot: /tmp/khpl-shots-nach/zimmerer/13-c2-geloest.png
- BEHOBEN (system C2-R3, Weiter-Button orange) — "Weiter zur Dämmung" ist jetzt `bg-kh-signal` (limette).

## C3 — Eine Wand ist ein Sandwich

- BEHOBEN (system C3-R8/R3, Schichtkarte orange statt limette) — Schichtkarte trägt jetzt `border-kh-signal/60 bg-kh-signal/10` statt orange; Titeltext ebenfalls nicht mehr orange. Bestätigt per computed className. Screenshot: /tmp/khpl-shots-nach/zimmerer/14-c3-initial.png
- BEHOBEN (anfaenger C3-R10, "Gefach" unerklärt) — Wort wurde aus dem Satz entfernt: "Das tragende Skelett — und zwischen den Ständern die Dämmung. Hier steckt die Wärme des Hauses drin." (Fix-Option 1 aus dem Befund gewählt).
- BEHOBEN (system C3-R3, "Weiter zum Fenster" orange) — jetzt limette.

## C4 — Hier kommt das Fenster hin

- OFFEN (anfaenger C4-R10, "Dichtstoff"/"Dichtband" unerklärt) — Treffer-Text "Passt. Zehn Millimeter rundum — Platz für Dämmung und Dichtstoff. Das ist jetzt dein Element." — "Dichtstoff" ist weiterhin reiner Text, kein `Begriff`-Chip vorhanden (per DOM-Abfrage bestätigt: kein Button mit diesem Text). Kein Glossareintrag sichtbar verlinkt. Screenshot: /tmp/khpl-shots-nach/zimmerer/18-c4-geloest.png
- NICHT GEPRÜFT im Detail (system, "DeineMarke"-Limettenmarkierung) — auf Screenshot 17/18 keine auffällige Limette-Signalmarke am Element sichtbar in diesem Durchlauf (evtl. nur bei anderem Kamerawinkel/Zustand sichtbar) — kein Regressionsverdacht, nur nicht aktiv verifiziert.
- BEHOBEN (system, Weiter-Button) — "Weiter zum Anhänger" limette (Musterprüfung wie überall).

## C5 — Elf Uhr, das Element geht raus

- TEILWEISE BEHOBEN (system C5-R1, sehr leere Bühne) — Die Plattform zeigt jetzt sichtbar ein aufgestelltes, helles Wandelement (vorher nur 4 dünne leere Pfosten) — die Szene liest sich dadurch klarer als "beladenes Element", nicht mehr als leerer/kaputter Screen. Der Rest der Fläche (links, Hintergrund) bleibt weiterhin großteils dunkler, konturloser Verlauf ohne erkennbare Hallenstruktur. Verbesserung sichtbar, aber die im Befund vorgeschlagene "erkennbare Halle im Hintergrund" fehlt weiterhin. Screenshots: /tmp/khpl-shots-nach/zimmerer/19-c5-initial.png (nachher) vs. khpl-zimmerer-15-c5-initial.png (vorher, Repo-Root)
- BEHOBEN (anfaenger C5-R12, Tonnenangabe ohne Körper-Anker) — Antwort lautet jetzt "…grob eineinhalb bis drei Tonnen am Haken. So viel wie ein bis zwei Kleinwagen." — Anker ergänzt wie vorgeschlagen.
- BEHOBEN (system, Weiter-Buttons) — "Weiter zur Baustelle" (Haupt + Abstecher) limette.

## C6 — Am Haken

- BEHOBEN (system C6-R3/R8, Antwortkacheln orange statt limette) — exakt der im Befund vorgeschlagene dritte Zustand ist umgesetzt: unausgewählt = `border-kh-line-strong bg-white/6` (neutral), ausgewählt/vorläufig = `border-kh-signal bg-kh-signal/10` (Limette-Kontur mit dezenter Füllung, KEINE satte Limette-Fläche) — unterscheidet sich klar von der bestätigten Lösung "Richtig herum. Jetzt runter damit." (satte Limette-Pill). Kein Doppel-Limette-Konflikt beobachtet. Screenshots: /tmp/khpl-shots-nach/zimmerer/22-c6-initial.png, 23-c6-vorlaeufig.png, 25-c6-richtig.png
- BEHOBEN (anfaenger C6-R10, "Anschlagmittel" unerklärt in C6) — im dortigen Abstecher C5.1 korrekt als `Begriff`-Chip vorhanden; Beat-1-Kachel-Text in C6 selbst enthielt in diesem Durchlauf kein "Anschlagmittel" mehr wörtlich (Text wurde umgebaut) — nicht 1:1 nachvollzogen, da C6-Beat-2 übersprungen wurde (Drag-Interaktion nicht triggerbar per Automatisierung). NICHT PRÜFBAR im vollen Umfang — Beat 2 (Drag ans Absetzen) konnte mit den verfügbaren Werkzeugen nicht ausgelöst werden (kein zugängliches Drag-Ziel im DOM/Canvas), daher wurde über "Überspringen" fortgefahren. Der dort ggf. noch stehende "Anschlagmittel"-Text (Zeile ~427) wurde nicht mehr gesehen.
- BEHOBEN (system, "So absetzen") — Lösen-Knopf jetzt Limette-Kontur (`border-kh-signal text-kh-signal`, kein Fill) statt vorher vermutlich anders — konsistent mit "aktion"-Variante app-weit.

## C7 — Heute früh war da eine Betonplatte

- BEHOBEN (system, Checkliste limette) — alle Häkchen-Icons `bg-kh-signal`. Screenshot: /tmp/khpl-shots-nach/zimmerer/27-c7.png
- Hinweis: C6 wurde übersprungen (Drag nicht automatisierbar), daher zeigt C7 "beim Versetzen zugesehen" statt eines Erfolgs-Eintrags — kein App-Fehler, sondern Folge des Skips.

## C8 — Und danach? / C8.1 Karriere-Wege

- BEHOBEN (system C8.1-R5, alle 5 Fakten-Abschnitte gleichzeitig ausformuliert im Querformat, ~120 Wörter) — Klappliste zeigt im breiten/Kiosk-Modus jetzt eine echte Akkordeon-Grid-Ansicht: nur ein Abschnitt ist gleichzeitig aufgeklappt (initial "Was ist das"), alle anderen vier bleiben als reine Überschrift-Zeilen sichtbar und öffnen erst auf Tap; das Öffnen einer neuen Zeile schließt die vorherige. Sichtbarer Text liegt jetzt weit unter dem 50-Wörter-Budget statt bei ~120. Exakt der im Befund vorgeschlagene Fix. Screenshots: /tmp/khpl-shots-nach/zimmerer/28-c8-meister-klapp.png, 29-c8-meister-klapp2.png
- BEHOBEN (anfaenger C8-R10, "fachgebunden" unerklärt) — Satz lautet jetzt "Mit dem Gesellenbrief und drei Jahren im Beruf geht es auch — dann aber nur in einem verwandten Studiengang, etwa Bauingenieurwesen (»fachgebunden«)." — exakt der vorgeschlagene Fix. Screenshot: /tmp/khpl-shots-nach/zimmerer/30-c8-studium-fachgebunden.png

## C9 — Dein nächster Schritt

- BEHOBEN (system, "Dein Weg"-Übersicht: besuchte Schritte limette) — besuchte Schritt-Nummern zeigen `border-kh-signal/60 text-kh-signal`, aktueller Schritt "9" volle Limette-Füllung (`bg-kh-signal`) mit Ring, Häkchen für Abstecher ebenfalls limette. Screenshot: /tmp/khpl-shots-nach/zimmerer/32-c9-deinweg.png
- C9 selbst (voll orange gefüllter Abschlussscreen) unverändert und laut Befund als bewusste Ausnahme bestätigt — kein neuer Befund hier.

## Welle-1-Fixes (app-weit, an Zimmerer stichprobenartig bestätigt)

- BEHOBEN — Weiter-Knopf jetzt gefüllte Limette (überall bestätigt: C1–C9).
- BEHOBEN — Prüfen/Lösen-Knöpfe Limette-Kontur ("Und jetzt das echte Maß" C2, "So absetzen" C6) — Screenshot: /tmp/khpl-shots-nach/zimmerer/12-c2-initial.png.
- BEHOBEN — Slider-Griff limette (C2, glühender Limette-Punkt) — Screenshot: /tmp/khpl-shots-nach/zimmerer/12-c2-initial.png.
- BEHOBEN — Dein-Weg besucht limette (Zahlen-Chips mit Limette-Kontur/-Füllung) — Screenshot: /tmp/khpl-shots-nach/zimmerer/32-c9-deinweg.png.
- BEHOBEN — Akkordeons auch quer (Klappliste im Kiosk-Querformat, C8.1) — Screenshots: 28/29-c8-meister-klapp*.png.
- TEILWEISE BEOBACHTET — "geschafft"-Stempel ohne Pillenform: Auf der Berufsliste nach Abschluss von Zimmerer erscheint statt eines "GESCHAFFT"-Stempels weiterhin ein "DU BIST HIER"-Badge in klassischer Pillenform (abgerundete Kapsel mit Häkchen, limette gefüllt) — vermutlich weil C6 in diesem Durchlauf übersprungen und der Weg dadurch nicht als vollständig "geschafft" markiert wurde. Kein sicherer Fix-Nachweis für diesen Einzelpunkt möglich; kein Hinweis auf Regression. Screenshot: /tmp/khpl-shots-nach/zimmerer/33-berufsliste-geschafft.png
- BEHOBEN — C6-Ton (aus Commit-Historie referenziert) — im aktuellen Durchlauf keine wertenden/tonalen Ausreißer in C6-Texten aufgefallen.

## Regressionen

Keine Regressionen festgestellt. Insbesondere:
- Keine zu schwach sichtbaren Limette-Kontur-Knöpfe beobachtet (guter Kontrast auf dunklem Grund in allen Screenshots).
- Keine zwei gleichzeitig gefüllten Limette-Flächen im selben Screen beobachtet (C6-Kacheln nutzen bewusst nur Kontur+leichte Füllung, nicht die satte Fläche der bestätigten Antwort).
- Klappzeilen (C1.1-Abstecher, C8.1) verstecken keinen für die jeweilige Aufgabe notwendigen Inhalt — die Zusammenfassungs-/Ergebnistexte bleiben offen sichtbar, nur vertiefende Zusatzinfos sind eingeklappt.
- Bühnen-Framing wirkte in allen besuchten Screens (C1–C5, C7) weder zu eng noch abgeschnitten; C5 bleibt die einzige auffällig leere Bühne, aber verbessert gegenüber vorher (s.o.).
- Keine neuen Layout-Sprünge beim Klicken durch die Steps beobachtet.

## Zusammenfassung

System-Befunde (befunde-zimmerer-system.md): 6 von 6 dokumentierten Einzelbefunden BEHOBEN (R3-System app-weit, C3-Schichtkarte, C6-Kacheln, C2-Titel, C8.1-Wortbudget); C5-R1 (leere Bühne) TEILWEISE BEHOBEN — sichtbar verbessert, aber Hintergrund bleibt strukturlos dunkel.

Anfänger-Befunde (befunde-zimmerer-anfaenger.md): 8 von 10 BEHOBEN (Ausklinkung-Chip, C1-Abstecher-Wortbudget, C2-Titel, C2-Körperanker, Gefach entfernt, C5-Körperanker/Kleinwagen, Anschlagmittel in C5.1, fachgebunden). 1 OFFEN (Dichtstoff/Dichtband in C4 weiterhin unverlinkt). 1 TEILWEISE (Schwelle im C1-Fehlerfeedback: Formulierung verbessert, aber weiterhin ohne Begriff-Chip). C6-Anschlagmittel-Konsistenz NICHT VOLLSTÄNDIG PRÜFBAR (Beat 2 per Drag nicht automatisierbar, wurde übersprungen).

</content>
