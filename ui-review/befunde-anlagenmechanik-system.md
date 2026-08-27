# Befunde — Anlagenmechanik — Linse: Visuelles System (R1–R9)

Review von Screenshots + Quellcode, Regeln aus khpl-designregeln.md.

## A1 — Kein warmes Wasser

### A1 — R3/R8 — Systemweit: Der „Weiter"-CTA ist orange statt limette, „aktion" ist limette statt orange — invertiert zur aktuellen Farbregel
- **Screenshot:** khpl-anlagenmechanik-01-A1-initial.png, -02-A1-geloest.png, -03-A1-abstecher-angebot.png (betrifft praktisch jeden Screenshot im Walkthrough)
- **Datei:** `src/components/ui/button.tsx:39-48` (Variante `weiter` = `bg-kh-orange`, Variante `aktion` = `bg-kh-signal`), verdrahtet über `src/khpl/komponenten/Verzweigung.tsx:37-38,116-133`
- **Befund:** khpl-designregeln.md R3 legt fest: „Limette = du. … Alle Weiter-CTAs limette.“ Der Code tut exakt das Gegenteil und sagt das auch offen im Kommentar („Farbregeln unverändert: Orange (`weiter`) — der Weg nach vorn … Gelbgrün (`aktion`) — die Handlung in der Übung“). Auf jedem Screen ist der Button, der den Screen verlässt („Weiter zur zweiten Adresse“, „Ich weiß, woran es liegt“ ist noch `aktion`/limette, aber das reguläre `weiter` danach ist orange), orange gefüllt — die Farbe, die laut Designregeln für „die Welt/Fakten“ reserviert ist. Das ist kein Einzelfall von A1, sondern die Grundverdrahtung der App: praktisch jeder der 27 Screenshots zeigt den orangen „Weiter“-Button.
- **Fix:** In `button.tsx` die Variante `weiter` auf `bg-kh-signal` (limette) umstellen (Textfarbe/Schatten entsprechend anpassen, z. B. `shadow-[0_4px_0_0_#5E7300]` wie bei `aktion`), die Variante `aktion` auf `bg-kh-orange` — oder, falls `aktion` (Prüfen/Lösen-Knöpfe) weiterhin als „Handlung in der Übung“ gilt, ebenfalls limette lassen (dann kollidieren zwei limette Flächen auf gelösten Screens, siehe nächster Befund). Kommentar in `Verzweigung.tsx:36-38` entsprechend korrigieren. Betrifft auch `Wegkarte` in `Verzweigung.tsx:311,342,358,384` (`haupt && 'border-kh-orange'` / `bg-kh-orange` für den Hauptweg im „Wohin als Nächstes?“-Dialog).

### A1 — R3 — Der „geschafft"-Stempel ist eine gefüllte, pillenförmige Limette-Fläche mit Haken — de facto Button-Form für eine Status-Zeile
- **Screenshot:** khpl-anlagenmechanik-02-A1-geloest.png (Chip „✓ STÖRUNG GEFUNDEN" unten links)
- **Datei:** `src/khpl/komponenten/Verzweigung.tsx:100-113` (`rounded-kh-pill bg-kh-signal px-3.5 py-1.5 … uppercase`)
- **Befund:** R3 sagt explizit: „Status-Zeilen (‚Toleranz gelesen') sind keine Buttons und tragen keine Button-Form.“ Der „geschafft"-Stempel ist eine vollflächig gefüllte Pille mit Icon und Versalien — von der eigentlichen Primär-Pille (`Button variant=aktion/weiter`) nur durch die Beschriftung zu unterscheiden. Auf dem A1-geloest-Screenshot stehen dadurch zwei signalfarbene, pillenförmige Flächen nebeneinander im Fuß (Stempel links, „Weiter"-Knopf — hier zufällig orange, s. o. — rechts), was R8 „genau ein limettes Element" unterläuft, sobald der `weiter`-Fix oben umgesetzt wird.
- **Fix:** Stempel als reine Text-Zeile ohne Füllung umbauen: z. B. `flex items-center gap-2 text-[0.9375rem] font-bold text-kh-signal uppercase` ohne `bg-kh-signal`/`rounded-kh-pill`, Haken bleibt als Icon in Limette. Damit ist die einzige gefüllte limette Fläche auf dem Screen der tatsächliche Primär-Button.

### A1 — R1 — Obere Bildschirmhälfte bleibt komplett leer (initial & gelöst)
- **Screenshot:** khpl-anlagenmechanik-01-A1-initial.png, khpl-anlagenmechanik-02-A1-geloest.png
- **Datei:** `src/khpl/buehne/anlagenmechanik/Schnitt.tsx:211-282` (`useRahmen`), `src/khpl/buehne/anlagenmechanik/zeichnung.ts:195-200` (`sichtfeld`) + `Anlage.tsx:58` (`kamera(RAHMEN_ANLAGE, sicht)`)
- **Befund:** Im Querformat berechnet `useRahmen` den Zeichenrahmen aus der freien Fläche rechts vom Panel (ca. 33 % der Breite, 86 % der Höhe). `sichtfeld()` zieht die `viewBox` auf dieses (hochformatige) Seitenverhältnis, aber `kamera()` skaliert `RAHMEN_ANLAGE` (256×220, Querformat) nur so weit hinein, wie die **schmalere** Achse erlaubt (`Math.min(sicht.b/rahmen.b, sicht.h/rahmen.h)`). Ergebnis: Die eigentliche Zeichnung füllt nur rund 40–45 % der Rahmenhöhe mittig, der Rest ist der auslaufende Grundton-Verlauf — sprich: fast schwarz. Kombiniert mit dem leeren linken Zweidrittel über dem Panel (dort steht nur der Fortschritts-Chip) ist die komplette obere Bildschirmhälfte (ca. 0–320 px von 1024 px) faktisch leerer dunkler Raum. Prüffrage aus R1 „Was steht in der oberen Hälfte?“ — Antwort: nichts.
- **Fix:** `RAHMEN_ANLAGE` so weit vergrößern (mehr Luft in der `Rahmen`-Definition selbst, nicht im Sichtfeld), dass sein Seitenverhältnis näher an das der Bühnenfläche herankommt, oder in `kamera()` für Querformat-Bühnen mit sehr abweichendem Rahmen-Seitenverhältnis auf `Math.max` statt `Math.min` für die dominante Achse wechseln (füllend statt „meet"), analog zu `sichtfeldFuellend`. Alternativ: Titel/Panel testweise weiter nach oben ausdehnen lassen, damit weniger Bühnenfläche brachliegt.

### A1 — sauber (im Übrigen)
- Der Fachtext/Prüfungs-Flow (Wahlflächen, Ergebnisfeld, Uhr) folgt R4/R5/R7 sauber: ein Anweisungssatz, kurze Sätze, kein Slider hier. Abstecher-Angebot-Dialog (03) und Abstecher-Screen (04, Transporter-Kulisse) sind bühnenmäßig sauber gefüllt (R1/R2 dort unauffällig).

## A2 — Vierzig Jahre Keller

### A2 — R1 — Obere zwei Drittel der Bühne bleiben leer, gleiches Muster wie A1
- **Screenshot:** khpl-anlagenmechanik-05-A2-initial.png, khpl-anlagenmechanik-06-A2-geloest-glossar.png
- **Datei:** `src/khpl/buehne/anlagenmechanik/Schnitt.tsx:243-265` (`useRahmen`, Querformat-Zweig)
- **Befund:** Dieselbe Ursache wie bei A1: Der gemessene Rahmen reicht bis an die Bühnenkanten (7 % Höhenrand), aber `Haus`/`Keller` füllt darin nur einen mittleren Streifen. Auf dem Screenshot steht das Kellerhaus sichtbar zu klein und zu weit rechts/mittig in einem ansonsten komplett schwarzen Feld — links vom Panel bis zur Zeichnung (0–870 px von 1366 px Breite) ist über die gesamte Bildhöhe nichts als der Fortschritts-Chip zu sehen.
- **Fix:** Wie A1 — Rahmen bzw. Kamera-Skalierung so anpassen, dass die Zeichnung die verfügbare Fläche eher füllt (`Math.max` statt `Math.min` für die dominante Achse, oder die Bühne bis dichter an die linke Panelkante heranziehen, da `karteBreit` hier ohnehin schon mehr Platz beansprucht).

### A2 — R2 — Glossar-Popover: Die Pfeilspitze sticht mitten durch den Titeltext statt an der Boxkante zu sitzen
- **Screenshot:** khpl-anlagenmechanik-06-A2-geloest-glossar.png (Ausschnitt geprüft, Popover „Hydraulischer Abgleich")
- **Datei:** `src/components/ui/popover.tsx:56-64` (`BasePopover.Arrow`) in Kombination mit `PopoverTitle` (Zeile 82-92) und `PopoverContent` (`p-5 pr-12`, Zeile 50)
- **Befund:** Die kleine Zeigerspitze, die laut Kommentar „an der Kante sitzt und sich mit der Seite dreht, auf der geöffnet wird", rendert hier mitten in der ersten Textzeile — sichtbar als Häkchen-Kerbe zwischen „HYDRAULISCHER" und „ABGLEICH", direkt über dem Titel statt am oberen Rand der Box. Für eine 16-Jährige/n sieht das aus wie ein Render-Fehler, nicht wie ein Zeiger zum Wort. Ursache vermutlich: Die Positioner-Kollisionsvermeidung (`collisionPadding=16`) schiebt die Box seitlich vom Anker weg, der `Arrow` bleibt aber am ursprünglich berechneten X-Offset relativ zum Anker stehen und fällt dadurch in den Titelbereich statt an den Boxrand.
- **Fix:** Entweder `BasePopover.Arrow` explizit auf den vom Positioner gelieferten `arrowUp`/`arrowX`-Wert clampen (Base-UI erlaubt das über die eigene Kollisionslogik, ggf. `sticky`/`align` prüfen), oder pragmatisch: `PopoverTitle`/`PopoverContent` mit `pt-3` statt Arrow-Overlap versehen und den Arrow bei knappem Platz per `hideWhenDetached` ausblenden, statt ihn über den Text rendern zu lassen.

### A2 — im Übrigen sauber
- Vlies-Handgriff und Bauteil-Liste folgen R4/R10 (ein Element hervorgehoben, Rest gedimmt, Unwissen lizenziert durch „kein Falsch, kein Richtig").

## A3 — Wie viel Wärme braucht ein Haus?

### A3 — R3 — Systemweit: Slider-Griff ist orange statt limette, obwohl sein Wert limette ist
- **Screenshot:** khpl-anlagenmechanik-07-A3-initial.png (oranger Griff bei „22 kW“, während die Zahl darüber in Limette steht)
- **Datei:** `src/index.css:329-368` (`@utility kh-regler`, `background: var(--color-kh-orange)` bei `::-webkit-slider-thumb` und `::-moz-range-thumb`)
- **Befund:** R3 sagt wörtlich: „Slider-Griff limette (wie sein Wert).“ Der Screenshot zeigt exakt das Gegenteil: „22 KW“ steht in Limette (`kh-zahl` nutzt `--color-kh-signal`, korrekt), aber der Griff darunter, den man zum Einstellen genau dieser Zahl anfasst, ist orange gefüllt (`box-shadow: 0 6px 20px rgb(255 122 26 / 0.45)` — Orange-Glow). Das ist keine A3-spezifische Stelle, sondern die einzige Slider-Utility der App — betrifft also 1:1 auch den Fülldruck-Slider in A6.
- **Fix:** In `kh-regler` (beide Browser-Präfixe) `background: var(--color-kh-orange)` → `background: var(--color-kh-signal)` und den Schatten von `rgb(255 122 26 / …)` auf ein Limette-Äquivalent (`rgb(216 246 60 / 0.45)`) ändern. Den `:disabled`-Zustand (Zeile 372-378, dort schon `--color-kh-mute`) unverändert lassen.

### A3 — im Übrigen sauber
- Titel verrät die Zahl nicht (R6 eingehalten), Auflösung zeigt Fenster statt Punktwert mit Körper-Anker über die CO₂-Bilanz (R11/R12). Abstecher „Wärmepumpe gegen Ölkessel“ nutzt ein echtes Foto bühnenfüllend (R1/R13 eingehalten). „Weiter zu den Rohren“-Button trägt denselben systemweiten Orange/Limette-Tausch wie in A1 notiert.

## A4 — Der kürzeste Weg ist nicht der richtige (inkl. A4.1)

### A4 — R8 — „Leitung liegt" sieht in jedem gezeigten Zustand identisch aus (deaktiviert), auch nachdem laut Walkthrough die Leitung lag
- **Screenshot:** khpl-anlagenmechanik-10-A4-initial.png, -11-A4-versuch1.png, -13-A4-versuch3.png (Pixelvergleich am Button „Leitung liegt": alle drei liefern exakt `rgb(55,61,21)`, also denselben `disabled:opacity-40`-Ton)
- **Datei:** `src/khpl/steps/anlagenmechanik/A4.tsx:268-273` (`disabled={!angekommen}`), `amZiel()` in `zeichnung.ts:433-438`
- **Befund:** Der Button bleibt über alle drei dokumentierten Zieh-Zustände hinweg optisch identisch matt-oliv — auch im dritten, laut Walkthrough-Notiz erfolgreichen Versuch (1 Bogen). Entweder hat `amZiel()` den Weg tatsächlich nicht als angekommen erkannt (dann fehlt dem Screen jede Rückmeldung, warum der sichtbar bis zur Pumpe gezogene Strang die Übung nicht abschließt — reine Bühnensicht ohne Text-Feedback lässt hier niemanden erkennen, ob er fertig ist), oder der Kontrast zwischen „deaktiviert" (40 % Deckkraft) und „aktiv" (volle Limette) ist zu gering, um am Kiosk im Vorbeigehen wahrgenommen zu werden. In beiden Fällen: R8 verlangt, dass das eine limette Element eindeutig „hier geht's weiter" sagt — ein Button, der in allen Screenshots gleich aussieht, tut das nicht zuverlässig.
- **Fix:** Sicherstellen, dass `amZiel` bei jedem legalen Weg zuverlässig `true` liefert (ggf. mit den echten Endkoordinaten der Wärmepumpe nachmessen), und den Kontrastsprung zwischen deaktiviert/aktiv deutlich größer ziehen (z. B. zusätzlich zur Opacity ein `grayscale` im deaktivierten Zustand, damit „noch nicht fertig" und „fertig" nicht nur durch 40 % Alpha getrennt sind).

### A4 — im Übrigen sauber
- Der Rasterausschnitt füllt die Bühne ordentlich (R1/R2 eingehalten, kein Loch, keine Kollision mit dem Panel). Die „Da geht nichts durch"-Rückmeldung nutzt Orange statt Rot und bleibt sachlich (R11 eingehalten). A4.1 („Löten, Pressen, Stecken") zeigt ein echtes Werkstattfoto bühnenfüllend (R13) und markiert die gerade offene Option korrekt in Limette, erledigte mit Haken (R3/R10 konsistent zu A1/A2). „Weiter"-Buttons tragen weiterhin den systemweiten Orange/Limette-Tausch aus dem A1-Befund.

## A5 — Halb eins, im Transporter

### A5 — R3 — Die drei Frage-Chips sind hart auf Orange codiert statt die geteilte Limette-Konvention (`Wahlflaeche`) zu nutzen
- **Screenshot:** khpl-anlagenmechanik-17-A5-geloest.png (Chip „Wie viele Adressen sind das an einem Tag?" — voll orange gefüllt, während A2/A4.1 dieselbe Geste in Limette zeigen)
- **Datei:** `src/khpl/steps/anlagenmechanik/A5.tsx:183-187` (`aktiv ? 'border-kh-orange bg-kh-orange text-[#0E0D0B]' : …`), vgl. Referenzkonvention in `src/khpl/komponenten/Wahlflaeche.tsx:26-33,71-80`
- **Befund:** `Wahlflaeche.tsx` dokumentiert die App-Konvention explizit: „Der gewählte Zustand ist Signalfarbe [Limette] — außer wo das Antippen vorläufig ist" (`ton="orange"` ist die dokumentierte Ausnahme für *vorläufige* Auswahl vor einer Auswertung, z. B. M1/M4). A5 baut die Chips aber komplett neu statt `Wahlflaeche` zu verwenden, und wählt für eine **endgültige** Auswahl (Frage antippen → Antwort lesen, nichts wird nachträglich bewertet) hart `bg-kh-orange`. Damit sieht dieselbe Geste — „tipp eine Kachel an, um eine Erklärung aufzuklappen" — in A2 (Bauteile), A4.1 (Löten/Pressen/Stecken) limette und in A5 orange aus. Für eine 16-Jährige, die App-weit lernt „limette = das habe ich gewählt/das bin ich", ist der Farbwechsel in A5 ein Bruch ohne erkennbaren Grund.
- **Fix:** In A5 die drei Chips durch `<Wahlflaeche form="zeile" gewaehlt={aktiv} …>` ersetzen (Standard-`ton="signal"` genügt, kein `ton="orange"` nötig, da hier nichts vorläufig ist) statt der handgeschriebenen Klassen in Zeile 183-187 — spart zugleich Code und stellt Konsistenz mit A2/A4.1 her.

### A5 — im Übrigen sauber
- Bühne (Transporter-Kulisse) und Panel überlappen bewusst und gedimmt statt zu kollidieren (R2 eingehalten wie dokumentiert). Die „Nicht jeder Kunde ist geduldig"-Passage setzt die Kehrseite ohne Note/Wertung (R11/R14). Linke obere Bildhälfte bleibt auch hier zu einem guten Teil leer (gleiches `QUER_MINDEST_BREITE`-Muster wie A1/A2), aber schwächer ausgeprägt, da der Titel und das Panel diese Fläche mitnutzen.

## A6 — Es läuft

### A6 — R8 — Zwei gefüllte Limette-Flächen gleichzeitig im Fuß, sobald die Übung gelöst ist
- **Screenshot:** khpl-anlagenmechanik-19-A6-geloest.png (großer limetter Kasten „Druck steht. Die Anlage darf starten." über dem ebenfalls limetten Chip „✓ IN BETRIEB")
- **Datei:** `src/khpl/komponenten/Rueckmeldung.tsx:88-90` (`ok ? 'bg-kh-signal …' `) kombiniert mit `src/khpl/komponenten/Verzweigung.tsx:100-113` (`geschafft`-Stempel, ebenfalls `bg-kh-signal`)
- **Befund:** `Rueckmeldung.tsx` behauptet im Kommentar sogar ausdrücklich: „Gelbgrün ist im ganzen System für genau das [die Erfolgsrückmeldung] reserviert — es taucht sonst nirgends als Fläche auf.“ Das stimmt nicht mehr, seit derselbe `bg-kh-signal`-Fülltrick auch im `geschafft`-Stempel im Fuß verwendet wird (siehe A1-Befund). Auf A6 laufen beide gleichzeitig: der volle limette Rückmeldungs-Balken oben im Panel **und** der limette Pillen-Stempel „IN BETRIEB“ im Fuß direkt darunter — zwei gefüllte Signalflächen auf einem Screen, obendrein optisch sehr ähnlich (beide `bg-kh-signal`, beide mit Haken-Icon). R8 verlangt „genau ein limettes Element“.
- **Fix:** Den `geschafft`-Stempel entfüllen (siehe Fix unter A1), dann bleibt nur die `Rueckmeldung` als gefüllte Limette-Fläche stehen — konsistent mit der eigenen Doku-Aussage in `Rueckmeldung.tsx`.

### A6 — im Übrigen sauber
- Slider-Skala markiert das Sicherheitsventil korrekt in Orange als Fakt/Grenze der Welt, nicht als Bedienelement (R3 sauber an dieser Stelle). Kein Rot beim Übersteuern (R11). Faustformel mit Körper-Anker über die Gebäudehöhe (R12). Slider-Griff selbst trägt denselben systemweiten Orange-Fehler wie A3.

## A7 — Jetzt erklärst du es

### A7 — sauber (Linse System)
- Vorbildlich für R11: alle drei Antwortoptionen je Kundenfrage sehen identisch aus (keine Farbcodierung „richtig/falsch"), die Reaktion der Kundin ersetzt jede Note. Rückblick-Häkchen sind kleine Icon-Bullets, keine Signalflächen, kollidieren nicht mit R8. Einzige wiederkehrende Punkte: der systemweite Orange/Limette-Tausch bei „Nächste Frage"/„Feierabend"/„Weiter" (siehe A1) und das übliche linke Leerfeld über der Bühne (siehe A1/A2).

## A8 — Und danach? / A9 — Dein nächster Schritt

### A8/A9 — sauber (Linse System)
- A8: drei gleich große, gleich gestaltete Karrierekarten ohne visuelle Bevorzugung (R10/R14 „Studium darf sich nicht verstecken" wörtlich umgesetzt); Bühne zeigt das fertige, warme Haus aus A3/A7 weiter (R1 durch Wiederverwendung sauber gefüllt, kein neuer Leerraum-Fall). A9: die markenweite orange Abschlussfläche ist als bewusste Ausnahme von R3 dokumentiert (Markenzone, kein Interaktions-Screen) und dadurch kein Widerspruch zur Farbregel; Fuß-Buttons liegen über dem abgedunkelten Verlaufsbereich, Kontrast zum orangen Hintergrund bleibt erhalten. Einzig wiederkehrender Punkt: „Noch einen Beruf" trägt weiterhin `variant="weiter"` (orange), siehe A1-Befund.
