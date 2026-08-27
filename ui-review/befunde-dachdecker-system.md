# Befunde: Dachdecker — Linse Visuelles System (R1–R9)

Review-Grundlage: khpl-designregeln.md, Screenshot-Manifest Walkthrough Dachdecker,
Quellcode src/khpl/steps/dachdecker/. Fokus ausschließlich R1–R9 (Layout, Farbe,
Text-Redundanz/Budget/Spoiler, Slider-Grammatik, Primärhandlung, Grau-Kontrast).

## 1/10 — Der erste Termin (M1)

### M1 — R3 — Der „Weiter"-Knopf ist app-weit orange, nicht limette, und widerspricht damit direkt R3
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-02-m1-geloest.png
- **Datei:** src/components/ui/button.tsx:39-43 (Variante `weiter`: `bg-kh-orange`), verdrahtet über src/khpl/komponenten/Verzweigung.tsx:122-132 (`variant="weiter"`) — betrifft **jeden** Step mit Weiter-CTA, nicht nur Dachdecker.
- **Befund:** khpl-designregeln.md R3 ist eindeutig: „Alle Weiter-CTAs limette." Der Code tut das Gegenteil und begründet es explizit im Kommentar mit einer älteren, jetzt überholten Farbregel („Orange (`weiter`) — der Weg nach vorn. Genau einer pro Screen. Gelbgrün (`aktion`) — die Handlung *in* der Übung."). Damit ist Orange aktuell für **zwei** Bedeutungen belegt (Welt/Fakten UND „hier geht's weiter"), Limette dagegen nur für die Übungs-Handlung — das ist die exakte Umkehrung von R3/R8. Für die Zielgruppe heißt das: der auffälligste Knopf auf jedem Screen (satte Farbfläche, Schlagschatten) benutzt dieselbe Farbe wie Maße, Fortschrittsbalken und Fakten-Chips — „das ist die Welt" und „das bringt dich weiter" werden visuell nicht mehr unterschieden.
- **Fix:** `weiter`-Variante in src/components/ui/button.tsx auf Limette umstellen (`bg-kh-signal text-[#0E0D0B] border-2 border-kh-signal`, Schatten analog zur bisherigen `aktion`-Variante), `aktion`-Variante braucht dann eine neue Zweitfarbe (z. B. `neben`-Grau mit stärkerem Rand oder ein gedimmtes Orange), damit „prüfen/auflösen" innerhalb der Übung weiterhin von „Screen verlassen" unterscheidbar bleibt, aber Limette exklusiv „hier geht's weiter" markiert (R8: „Genau ein limettes Element heißt ‚hier geht's weiter'"). Dieser Fix ist zentral (eine Datei) und wirkt auf alle Berufe, nicht nur Dachdecker — sollte vor jeder Einzel-Screen-Korrektur passieren, weil er den größten Teil der R3-Verstöße in allen zehn Dachdecker-Steps auf einen Schlag behebt.

### M1 — R3 — Der „AUSGEWERTET"-Stempel hat Button-Form, obwohl er laut Regel keine tragen darf
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-02-m1-geloest.png
- **Datei:** src/khpl/komponenten/Verzweigung.tsx:100-113 (`geschafft`-Pille, `rounded-kh-pill bg-kh-signal ... uppercase`)
- **Befund:** R3 verlangt: „Status-Zeilen (‚Toleranz gelesen') sind keine Buttons und tragen keine Button-Form." Die „AUSGEWERTET"-Pille sitzt exakt neben dem „Weiter"-Knopf, hat dieselbe Pillenform (`rounded-kh-pill`), dieselbe Höhe/Polsterung-Anmutung und Großbuchstaben mit Haken-Icon wie ein Knopf — sie ist von einem echten Button auf den ersten Blick nicht zu unterscheiden, obwohl sie nicht klickbar ist. Im Screenshot wirkt sie wie ein zweiter, aktiver CTA neben „Weiter".
- **Fix:** Stempel-Form von der Button-Form abkoppeln: eckigere/flachere Fläche ohne `rounded-kh-pill` (z. B. `rounded-kh` wie die Info-Karten) oder ganz ohne Fläche als reine Textzeile mit Haken-Icon in Limette, ohne Hintergrundfarbe. Damit bleibt „AUSGEWERTET" lesbar als Status, ohne mit dem Weiter-Knopf zu konkurrieren.

M1: Bühne/Konsole (R1/R2), Grau-Kontrast (R9) und Wortbudget (R5) sind sauber — Foto füllt die obere Hälfte vollständig, Karte kollidiert nicht mit dem Bild, Fließtext ist kurz.

## 2/10 — Was kostet dieses Dach? (M2)

### M2 — R3 — Slider-Griff ist app-weit orange statt limette, obwohl die Regel explizit „Slider-Griff limette (wie sein Wert)" verlangt
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-04-m2-initial.png
- **Datei:** src/index.css:350-368 (`.kh-regler` → `::-webkit-slider-thumb`/`::-moz-range-thumb`, `background: var(--color-kh-orange)`) — betrifft jeden nativen Slider im System, nicht nur Dachdecker.
- **Befund:** Der Zahlenwert über dem Regler steht korrekt in Limette („sie gehört dem Besucher", laut Code-Kommentar in M2.tsx:233-235), aber der Griff, den man tatsächlich zieht, ist orange gefüllt mit orangem Schlagschatten. Das ist exakt der Fall, den R3 als Konsequenz benennt: „Slider-Griff limette (wie sein Wert)." Im Screenshot wirkt der Regler dadurch wie ein Fakten-Element der Welt, nicht wie der eigene Eingabewert — die Farbcodierung zwischen Zahl (limette) und ihrem Bedienelement (orange) fällt auseinander.
- **Fix:** In src/index.css `.kh-regler` Thumb-Hintergrund von `var(--color-kh-orange)` auf `var(--color-kh-signal)` ändern (Schatten entsprechend z. B. `rgb(216 246 60 / 0.45)`). Den `:disabled`-Zustand (Griff nach Auflösung, `var(--color-kh-mute)`) unverändert lassen — der ist als „das hast du geschätzt"-Marke bereits korrekt neutral.

## 3/10 — Aus dem Angebot wird ein Auftrag (M3)

M3: Bühne (Abbundplan-Zeichnung als Riss) füllt die obere Hälfte, kollidiert nicht mit der Karte, Grau/Orange-Kontrast der Maßlinien ist lesbar (R1/R2/R9). Sichtbares Wortbudget (Warum-Text + selbstöffnende Aha-Karte, ~45 Wörter) bleibt unter der ~50-Wort-Grenze aus R5.

### M3 — R2 — Das Begriff-Popover deckt die Karte dahinter nicht vollständig ab und lässt abgeschnittenen Text/Icon am Rand stehen
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-08-m3-begriff.png
- **Datei:** src/components/ui/popover.tsx:41-53 (`BasePopover.Positioner`/`Popup`, kein `avoidCollisions`-Ausweichen über die volle Kartenbreite)
- **Befund:** Tippt man den Begriff „Abbundplan" an, öffnet sich das Glossar-Popover links unten über der Karte, deckt sie aber nicht sauber ab: rechts oberhalb der Popover-Kante bleibt der Akkordeon-Pfeil der Aha-Karte sichtbar, und am rechten Rand ist das abgeschnittene Wortende „…mmenpassen" (aus „zusammenpassen") zu lesen — ein Textfetzen ohne Kontext. Das ist derselbe Fehlertyp, den R2 für die Bühne verbietet („keine amputierte Beschriftung"), hier tritt er als Karte-über-Karte-Kollision auf: die Popover-Fläche ist kleiner/schmaler als der Bereich, den sie überlagert, und lässt Bruchstücke der darunterliegenden Konsole stehen statt sie sauber zu verdecken oder ganz freizulassen.
- **Fix:** Popover entweder breiter/höher genug rendern, um den kompletten darunterliegenden Kartenausschnitt zu decken, oder mit einem dezenten Backdrop/Dimmer hinter dem Popup (wie bei `Dialog`) arbeiten, der die restliche Karte klar abdunkelt statt Textreste durchscheinen zu lassen. Alternativ Positionierung so einschränken, dass das Popover nie einen Akkordeon-Bereich der eigenen Karte überlappt (z. B. `side="top"` erzwingen, wenn der Trigger im unteren Kartendrittel liegt).

## Abstecher B3.1 — Bestellt wird nach Plan

### B3.1 — R5 — Zwei Aha-Karten öffnen sich beide automatisch und stapeln sich mit dem Warum-Text zu ~85 sichtbaren Wörtern — 70 % über dem Budget
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-10-b31-abstecher.png
- **Datei:** src/khpl/steps/dachdecker/B31.tsx:57-69 (beide `<AhaKarte sichtbar={aha} …>` mit demselben `aha`-Flag, das nach 800 ms fest auf `true` springt)
- **Befund:** R5 setzt das Budget für Lese-Steps auf „~50 Wörter sichtbar", der Rest gehört „hinter die vorhandenen Klappzeilen". B3.1 hat keine Übung, die diese Klappzeilen als Belohnung freischaltet — beide Aha-Karten (die zur „Ausbildungsordnung" und die zum „CO₂") öffnen sich unbedingt nach 800 ms von selbst, zusätzlich zum Warum-Absatz. Sichtbar sind damit gleichzeitig drei Textblöcke (Warum ~25 Wörter, Aha 1 ~25 Wörter, Aha 2 ~35 Wörter) = ca. 85 Wörter auf einer Karte, plus zwei fett hervorgehobene Zwischenüberschriften — das liest sich wie ein Fließtext-Absatz, nicht wie ein Messestand-Screen, und ist genau die „Tapete hinter einer deckenden Karte", die R5 ausschließt.
- **Fix:** Nur die erste Aha-Karte automatisch öffnen (das Ausbildungsordnung-Argument, der stärkste Aufhänger laut Code-Kommentar); die CO₂-Karte als eigene, manuell antippbare Klappzeile mit eigenem Eyebrow lassen (`sichtbar` an einen zweiten State/Tap binden statt an denselben Timer). Alternativ beide Karten wie gehabt automatisch zeigen, aber den Warum-Absatz auf einen kürzeren Satz kürzen, damit die Summe unter ~50 Wörtern bleibt.

## Abstecher B3.2 — Vom Plan in den Kopf

B3.2: sauber (Linse system) — 3D-Bühne füllt den Raum, hervorgehobenes Bauteil bleibt in Orange (Welt/Fakt), Karte kollidiert nicht mit dem Modell.

## 4/10 — Ein Balken, ein Maß (M4)

### M4 — R1 — Die Bühne lässt nach dem Lösen (verladener Sparren) über die Hälfte der Fläche dunkel und leer
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-16-m4-geloest.png
- **Datei:** src/khpl/buehne/Zuschnitt3D.tsx (Kamera/Framing der Phase `fertig`), eingebunden in src/khpl/steps/dachdecker/M4.tsx:129-145
- **Befund:** Nach dem Verladen zeigt die Bühne den Anhänger mit dem markierten Sparren nur als schmalen horizontalen Streifen (ca. y 250–470 von 1024 px). Darüber (ca. 250 px) und darunter bis zur Karte (ca. 230 px) bleibt reine dunkle Verlaufsfläche ohne jedes Element — zusammen etwa 45–50 % der Bühnenhöhe. R1 sagt explizit „Leerer dunkler Raum über der Karte = kaputt" und nennt als Prüffrage „Was steht in der oberen Hälfte?" — hier: nichts. Der eingestellte Zustand davor (Balken auf Böcken, khpl-dachdecker-15) hat dasselbe Muster mit knapp 180 px komplett leerer Fläche über der Szene.
- **Fix:** Kamera/Framing der `Zuschnitt3D`-Szene in der Phase `fertig` (und `einstellen`) enger auf den Anhänger/Balken zoomen oder vertikal zentrieren, damit die Szene die verfügbare Bühnenhöhe bis knapp über die Karte ausfüllt — analog zum Foto-Vollbild in M1/M2/M3. Alternativ die Karte für diese Phase vertikal höher ziehen (näher an die Bildmitte), damit weniger ungenutzte Fläche über ihr bleibt.

## Abstecher B4.1 — Beladen

### B4.1 — R1 — Dasselbe Muster wie M4: die isometrische Werkhof-Szene lässt rund die Hälfte der Bühne dunkel und leer
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-19-b41-geloest.png
- **Datei:** src/khpl/buehne/Beladen3D.tsx (Kamera/Framing), eingebunden in src/khpl/steps/dachdecker/B41.tsx:194-201
- **Befund:** Wie bei M4 (siehe dort) steht die Szene (Zugmaschine + Anhänger) nur als kompakter Streifen in der Bildmitte; darüber bleiben ca. 150 px, darunter bis zur Karte weitere ca. 130 px vollständig leerer, dunkler Verlaufshintergrund — zusammen etwa die Hälfte der Bühnenhöhe. Derselbe R1-Verstoß, derselbe Fix-Ansatz — beide Stellen teilen sich vermutlich dieselbe Kamera-/Layout-Grundlage für „Werkhof"-Szenen und sollten zusammen behoben werden.
- **Fix:** Wie bei M4: Kamera enger auf das Gespann zoomen bzw. Sichtfeld-Kalkulation (`SichtfeldKontext`) so anpassen, dass die 3D-Szene die tatsächlich verfügbare Bühnenfläche ausfüllt statt zentriert mit viel Rand zu schweben.

### B4.1: Karten-Farbwahl (`kh-paper`-Fläche für ungeladene Teile, Wahlflaeche.tsx umgangen) ist bewusst dokumentiert als „liegt im Regal, hell und greifbar" — kein Befund gegen R3, da neutrale Inventarteile ohne Fakten/Eingabewert-Bedeutung.

## 5/10 — Aufrichten (M5)

## Abstecher B5.1, M6, B4.1-Fork: sauber (Linse system)

B5.1 (Niemand macht das allein): sauber — Foto füllt die Bühne (R13-Beat), keine Kollision, Weiter-Farbe s. o. M6 (Halb zwölf): Bühne und Wortbudget sauber, „Schau einmal vom iPad hoch." als bewusst einziger Anweisungssatz (R4) ist im Rahmen.

### M5 — R1 — Drittes Auftreten desselben Werkhof-Kamera-Musters: durchgängig leere obere Bildhälfte
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-20-m5-initial.png, /tmp/khpl-shots/dachdecker/khpl-dachdecker-22-m5-geloest.png
- **Datei:** vermutlich dieselbe Bühnen-/Kamera-Grundlage wie M4 (`Zuschnitt3D`) und B4.1 (`Beladen3D`), hier für die Aufricht-Szene.
- **Befund:** Wie bei M4 und B4.1 bleibt der obere Bildbereich (ca. 0–250 px von 1024 px) durchgängig leer und dunkel, auch im gelösten Endzustand mit fertigem Unterbau. Drei von vier 3D-Bühnen-Steps im Hauptweg zeigen dasselbe Muster — das ist kein Einzelfall mehr, sondern spricht für eine gemeinsame Kamera-/Framing-Konvention, die R1 systematisch verletzt.
- **Fix:** Wie bei M4/B4.1 — gemeinsame Kamera-Framing-Regel für alle Werkhof-3D-Bühnen prüfen: Standardausschnitt so wählen, dass das Modell vertikal zentriert die verfügbare Bühnenhöhe (bis knapp über die Karte) ausfüllt, nicht mittig im oberen Bilddrittel schwebt.

## 7/10 — Jetzt du (M7)

M7: Vorführung und Endzustand (khpl-dachdecker-27, -30) füllen die Bühne gut. Der Zwischenzustand mit Restkarte links (khpl-dachdecker-29) zeigt dasselbe Werkhof-Kamera-Leerraum-Muster wie M4/B4.1/M5 (s. dort) — vierter Beleg für denselben systemischen Fix.

## 8/10 — Feierabend (M8)

M8: sauber (Linse system) — Checklisten-Rückblick ist kurz genug (kurze Stichpunkte statt Fließtext), Limette markiert konsequent „das hast du geschafft" pro Zeile, Bühne zeigt das fertige Dach großformatig.

## 9/10 — Und danach? (M9 Karriere-Wege)

M9 (Auswahlscreen): sauber (Linse system) — Foto füllt die Bühne, drei gleichrangige Karten, ein Weiter-CTA.

### B9.1 (Meister-Detail) — R5 — Vier Info-Felder stehen alle gleichzeitig offen, ohne jede Klappzeile — ca. 82 Wörter statt ~50
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-33-m9-meister-detail.png
- **Datei:** src/khpl/steps/dachdecker/B9.tsx:44-71 (alle vier `weg.abschnitte` werden ungefiltert und ohne Akkordeon gerendert), Inhalte in src/khpl/steps/dachdecker/karrierewege.ts
- **Befund:** B9.1 ist laut eigenem Code-Kommentar ein „Info-Screen … Wird gelesen" — also exakt der Fall, für den R5 gilt. Es gibt aber keine einzige Klappzeile: „Was ist das" (13 Wörter), „Wie lange" (20 Wörter), „Was es kostet" (32 Wörter) und „Was du verdienst" (9 Wörter) stehen alle gleichzeitig offen — zusammen ca. 74 Wörter Fließtext plus vier Feld-Etiketten, 45 % über dem ~50-Wort-Budget. Für eine 16-Jährige am Stand ist das ein Steckbrief zum Durchlesen, kein Screen zum Erfassen in Sekunden — besonders „Was es kostet" mit vier Sätzen samt Förder-Details (Aufstiegs-BAföG, Landes-Meisterprämie) ist deutlich mehr, als die Zielgruppe an einem Messestand-Screen aufnehmen kann.
- **Fix:** Nur „Was ist das" und „Was du verdienst" (die zwei Felder, die die Entscheidung „interessiert mich" tragen) direkt zeigen; „Wie lange" und „Was es kostet" hinter eine Klappzeile legen (z. B. „Und was kostet mich das?" als eigenes Akkordeon, analog zu den Aha-Karten in M1–M8). Den „Was es kostet"-Absatz zusätzlich kürzen: die Förder-Details (Aufstiegs-BAföG-Anteil, NRW-Meisterprämie) sind Beleg-Detail, nicht das, was am Stand in drei Sekunden hängen bleiben muss.

## 10/10 — Dein nächster Schritt (M10) & Dein-Weg-Übersicht

M10: sauber (Linse system) — Foto füllt die Bühne, ein CTA-Paar unten (Von vorn / Noch einen Beruf), Farbrolle wie überall sonst (Weiter-Systemfrage bereits unter M1 dokumentiert).

### Dein-Weg-Übersicht — R3 — „Besucht"/abgeschlossen ist hier orange statt limette und widerspricht damit der eigenen Konvention aus jedem Step-Fuß
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-35-dein-weg-uebersicht.png
- **Datei:** src/khpl/shell/DeinWeg.tsx:291-306 (Abstecher-Haken `bg-kh-orange`), :389-403 (`Knoten`: `zustand === 'besucht' ? 'bg-kh-orange …' : …`)
- **Befund:** Auf jedem einzelnen Step-Screen markiert die App „das hast du geschafft" konsequent mit der Signalfarbe Limette — der „geschafft"-Stempel in `Verzweigung.tsx` und alle Auswertungs-Pillen (M1 „Ortstermin sitzt", M2 „Kalkuliert", M4 „Zugeschnitten und verladen", B4.1 „Alles geladen", B3.2 „Bauteile erkundet", M5 „Unterbau steht", M7 „Dach steht") sind limette. In der „Dein Weg"-Übersicht dagegen sind exakt dieselben abgeschlossenen Schritte — die Knoten 1–9 und alle abgehakten Abstecher („Bestellt wird nach Plan", „Vom Plan in den Kopf", „Beladen", „Niemand macht das allein", „Meister") orange gefüllt mit schwarzem Haken. Nur der aktuelle Knoten (10, „DU BIST HIER") ist limette. Für die Zielgruppe heißt Orange auf jedem anderen Screen „das ist ein Fakt der Welt" — hier bedeutet dieselbe Farbe plötzlich „das hast du erledigt", während Limette exklusiv nur noch „hier stehst du gerade" markiert. Das ist ein zweiter, in sich konsistenter, aber zur übrigen App widersprüchlicher Farbcode.
- **Fix:** Abgeschlossene Knoten/Häkchen (`zustand === 'besucht'`) in src/khpl/shell/DeinWeg.tsx auf `bg-kh-signal`/`text-kh-signal` umstellen, damit „erledigt" appweit limette bleibt. „Aktuell" (die Position „du bist hier") kann orange werden, weil das eher der Fortschritts-/Wegachse (Welt-Fakt „hier verläuft dein Pfad") entspricht als einer Leistung — oder, falls die Rail-Achse bewusst eine eigene Konvention will, das mindestens im Kommentar als bewusste Ausnahme von der App-Konvention dokumentieren, nicht nur intern konsistent halten.
