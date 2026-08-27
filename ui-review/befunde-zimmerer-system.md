# Befunde — Zimmerer — Linse: Visuelles System (R1–R9)

Review-Grundlage: khpl-designregeln.md, Screenshot-Walkthrough
/tmp/khpl-shots/zimmerer/, Quellcode src/khpl/steps/zimmerer/.

## 1/9 — C1 „Der Stapel steht schon da" + C1.1 Abstecher

### C1 — R3 — Der Weiter-CTA ist app-weit orange statt limette, entgegen der Regel „Alle Weiter-CTAs limette"
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-02-c1-geloest.png (Button „Weiter an den Tisch"), auch -03 und -04 (Abstecher-Dialog-Hauptkarte und deren Fuß-Button)
- **Datei:** src/components/ui/button.tsx:39-43 (`variant: weiter` → `bg-kh-orange`), src/khpl/komponenten/Verzweigung.tsx:122-131 (Weiter-Button), Zeile 356-359 (Hauptweg-Karte im Wege-Dialog `haupt && 'bg-kh-orange'`)
- **Befund:** khpl-designregeln.md R3 legt fest: „Alle Weiter-CTAs limette." Im Code ist das Gegenteil bewusst dokumentiert („Eine gefüllte orange Fläche pro Screen, und die führt nach vorn" — button.tsx:19, Verzweigung.tsx:36-38). Das ist kein Einzelfehler in C1, sondern das App-weite Farbsystem: jeder „Weiter"/Hauptweg-Knopf in jedem Step (alle 9 Screens dieses Walkthroughs) ist orange, jeder Lösen-Knopf (`variant: aktion`, z. B. „Prüfen") ist limette. Das ist die exakt umgekehrte Zuordnung zur aktuellen Regel: Orange = Welt/Fakten, Limette = du/Primärhandlung. Da „Weiter" die eine Handlung ist, die dich als Nutzer nach vorn bringt, gehört sie unter R3 klar zu „Limette = du". Ich flagge diesen System-Befund hier einmal und verweise bei jedem weiteren Step nur noch kurz darauf, statt ihn zu wiederholen.
- **Fix:** In `button.tsx` Variante `weiter` auf `bg-kh-signal text-[#0E0D0B] border-2 border-kh-signal` (Limette) umstellen, Schatten entsprechend auf den dunkleren Limette-Ton (`#5E7300`, wie bei `aktion`); die dann doppelt vorkommende Bedeutung von `aktion` (Lösen einer Übung) und `weiter` (nach vorn) beide limette macht sie ununterscheidbar — dafür `aktion` probeweise auf eine zweite, ruhigere Form ohne eigene Füllfarbe umstellen (z. B. `neben`-Optik mit limettem Rand) oder die Rollen tauschen: `weiter` limette voll gefüllt, `aktion` limette mit Kontur. Gleiches für `Verzweigung.tsx` Hauptweg-Karte (`haupt && 'bg-kh-orange'` → `bg-kh-signal`, Textfarbe bleibt `#0E0D0B`) und den Pfeil/Rand-Ton der Karte. Das ist eine zentrale, mechanische Änderung (siehe khpl-designregeln.md „R3 und R1 ... sind mechanisch") und wirkt auf alle Berufe, nicht nur Zimmerer.

C1 (Rest): sauber (Linse system) — Bühne füllt die obere Hälfte durchgehend, GEFUNDEN-Pill trägt korrekt Limette (kh-signal) als Erfolgs-Stempel, Nummern-Chips auf dem Holzstapel sind lesbar (R9), keine Kollision zwischen Bühne und Karte.

C1.1 (Abstecher): sauber (Linse system) — Foto als volle Bühne (R13-tauglich), Klappliste dreispaltig ohne Kollision, Zitat mit orangener Kante als Inhalt statt Deko (R9), einziger CTA „Weiter an den Tisch" trägt denselben oben genannten R3-Systembefund.

## 2/9 — C2 „Zweiundsechzig Komma fünf"

### C2 — R6 — Der Screen-Titel verrät die gesuchte Zahl, exakt und dauerhaft sichtbar, während darunter geschätzt wird
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-05-c2-dialog.png und -06-c2-initial.png (Titel „ZWEIUNDSECHZIG KOMMA FÜNF" steht über dem noch leeren Schätz-Regler bei 90 cm)
- **Datei:** src/khpl/berufe/zimmerer.ts:81 (`titel: 'Zweiundsechzig Komma fünf'`), gerendert in src/khpl/steps/zimmerer/C2.tsx über `StepShell id="C2"`
- **Befund:** Das ist wortwörtlich das Negativbeispiel aus khpl-designregeln.md R6: „‚ZWEIUNDSECHZIG KOMMA FÜNF' über einem laufenden Schätz-Slider löscht den Aha-Moment — Anfänger ankern auf der einzigen sichtbaren Zahl." Genau dieser Titel steht hier von der ersten Sekunde an über der Karte, während der Slider bei 90 cm startet und zum Schätzen einlädt. Wer lesen kann (jede Zielgruppe), hat die Lösung, bevor er den Regler anfasst — die ganze Schätz-Mechanik wird zur Formsache.
- **Fix:** Titel in `zimmerer.ts:81` auf einen Zahlen-freien Themen-Titel ändern, z. B. `titel: 'Wie weit steht der nächste?'` (nimmt die im Panel stehende Frage auf, ohne die Zahl zu nennen). Die ausgeschriebene Zahl „Zweiundsechzig Komma fünf" gehört laut R6 stattdessen als Titel der Auflösung — dort könnte man sie z. B. als zusätzliche `auflösungTitel`-Variante einblenden oder im Panel (wo sie schon als `kh-zahl` in Orange erscheint, C2.tsx:219-227) prominent belassen und den Screen-Titel unverändert lassen.

C2 (Rest): sauber (Linse system) — Slider-Grammatik korrekt (rechts = mehr cm, linear, Wort-Endpunkte in cm), Bühne folgt live dem Reglerwert (kein Loch), Auflösungszahl korrekt orange (Welt-Fakt), „Raster sitzt"-Pill korrekt limette, „Weiter zur Dämmung"-Button trägt den oben unter C1 genannten R3-Systembefund (orange statt limette).

## 3/9 — C3 „Eine Wand ist ein Sandwich" + C3.1 Abstecher

### C3 — R8/R3 — Die einzige tippbare Handlung des Screens (Schichtkarte) ist komplett orange gestylt statt limette
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-08-c3-initial.png (Karte „INNENBEPLANKUNG" mit oranger Kontur, orangem Innenglow und orangem Titeltext)
- **Datei:** src/khpl/steps/zimmerer/C3.tsx:236 (`className="... border-2 border-kh-orange/50 bg-kh-orange/10 ..."`) und Zeile 245 (`text-kh-orange` für `schicht.name`)
- **Befund:** Die `Schichtkarte` ist laut eigenem Kommentar „selbst der Knopf" (Zeile 210-213) — sie ist die einzige Handlung, die den Screen voranbringt, also exakt der Fall aus R8 „das antippbare Objekt mit Limette-Affordanz". Aktuell trägt sie stattdessen komplett Orange (Rahmen, Füllung, Titel), dieselbe Farbe, die auf demselben Screen im Querschnitt-Schema (`Wandschnitt`, Zeile 290) für „diese Schicht wird gerade behandelt" (Welt-Info) steht. Damit bedeutet Orange auf diesem einen Screen gleichzeitig zwei Dinge: „das ist ein Fakt über die Wand" und „das kannst du antippen" — genau der Bruch, den R3 verbietet.
- **Fix:** Card-Rahmen und Titel auf Limette umstellen: `border-2 border-kh-signal/60 bg-kh-signal/10`, `text-kh-signal` statt `text-kh-orange` für `schicht.name` (Zeile 236, 245). Das Querschnitt-Schema (`Wandschnitt`) darf die orange Hervorhebung für „aktuelle Schicht" behalten, weil das dort eine reine Lese-Info ist, keine Handlung.

C3 (Rest): sauber (Linse system) — Bühne baut die Wand live mit auf (kein leerer Raum), Querschnitt-Schema ist Inhalt statt Deko (R9), „Wand aufgebaut"-Pill korrekt limette, kein Fehlerzustand nötig (Tippen kann nichts falsch machen).

C3.1 (Abstecher): sauber (Linse system) — Foto als volle Bühne, Korrektur-Textblock mit durchgestrichenem Mythos-Satz ist klar lesbar, „Weiter zum Fenster"-Buttons tragen den bereits unter C1 notierten R3-Systembefund (orange statt limette).

## 4/9 — C4 „Hier kommt das Fenster hin"

C4: sauber (Linse system) — positives Gegenbeispiel zu C3: die „Signalmarke" (`element.tsx:335-343`, `DeineMarke`, „ab C4 ist es *dein* Element") liegt korrekt in Limette direkt auf der Bühne und markiert Besitz/Fortschritt, genau wie R3 es für „Limette = du" vorsieht. Maß-Etiketten an den drei Rahmen sind lesbare, dunkle Chips (R9), keine Kollision zwischen Rahmen-Angebot und Karte, Titel verrät kein Zielmaß (R6 sauber). Einziger Wermutstropfen ist der bereits unter C1 notierte R3-Systembefund am „Weiter zum Anhänger"-Button.

## 5/9 — C5 „Elf Uhr, das Element geht raus" + C5.1 Abstecher

### C5 — R1 — Die Bühne ist über weite Teile der Fläche fast leerer, dunkler Raum, nur eine kleine Anhängerplattform in der Ecke
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-15-c5-initial.png und -16-c5-frage-offen.png (Plattform mit vier dünnen Pfosten nimmt vielleicht ein Drittel der oberen Bildhälfte ein, der Rest ist brauner Verlauf ins Schwarze)
- **Datei:** src/khpl/steps/zimmerer/C5.tsx:125-142 (`Wandelement3D zustand="verladen" abfahrt`)
- **Befund:** Das ist erkennbar Absicht (Kommentar Zeile 27-28: „hier fährt das Gespann weg und der Blick bleibt in der leeren Halle zurück") und dramaturgisch stimmig zur Zäsur — trotzdem liest die Fläche nach R1s Prüffrage „Was steht in der oberen Hälfte?" streckenweise wie ein kaputter, unbespielter Screen: die Plattform ist klein, weit von der Kamera weg positioniert, und der ganze rechte/obere Bildbereich bleibt strukturlos dunkelbraun. Für Erstbesucher ohne den Kommentar im Code ist der Unterschied zwischen „hier fehlt was" und „das ist die Pointe" auf den ersten Blick nicht sicher lesbar.
- **Fix:** Die erzählerische Leere kann bleiben, aber sie sollte lesbarer inszeniert werden statt zufällig leer zu wirken: z. B. ein warmes Streiflicht/Kamerawinkel, der die leere Halle als Raum erkennbar macht (Wände/Hallendach im Hintergrund andeuten), oder die Plattform kompositorisch zentrierter/größer im Bildausschnitt platzieren, damit „leer" als bewusste Kameraeinstellung und nicht als fehlendes Bild wirkt.

C5 (Rest): sauber (Linse system) — „Gelesen"-Haken an den Frage-Pillen korrekt limette (R3, dein Fortschritt), Wortbudget im warum-Block eingehalten, Zitat mit beiden Hälften unverfälscht wiedergegeben, „Weiter zur Baustelle"-Button trägt den bereits notierten R3-Systembefund.

C5.1 (Abstecher): sauber (Linse system) — Foto als volle Bühne (R13), Zitat mit orangener Kante als Inhalt, Klappliste „Wer am Kran wo steht" klar strukturiert, CTA trägt denselben R3-Systembefund.

## 6/9 — C6 „Am Haken" (Signaturscreen, zwei Beats)

### C6 — R3/R8 — Die vier Antwortkacheln in Beat 1 sind orange gefärbt, obwohl sie die primäre Eingabe des Besuchers sind
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-20-c6-initial.png (Kacheln „Die glatte Seite" / „Die raue Platte" / „Rähm nach oben" / „Schwelle nach oben")
- **Datei:** src/khpl/steps/zimmerer/C6.tsx:398-404 (`<Wahlflaeche ... ton="orange" gewaehlt={...} ...>`), Begründung im Kommentar Zeile 395-397
- **Befund:** Der Code begründet die Farbwahl selbst ausdrücklich damit, dass Limette „auf einer falschen Wahl stehen bliebe" — das ist ein berechtigtes Problem, aber die gewählte Lösung verletzt R3 („Limette = du. Eingabewert … die eine Primärhandlung") an der Stelle, die im ganzen Screen die wichtigste Eingabe ist: die eigene Vermutung, welche Seite außen und welche Seite oben liegt. Auf dem Signaturscreen des Berufs bedeutet Orange damit gleichzeitig „Fakt/Welt" (z. B. der pulsierende Punkt bei „Einweisen — die Kolonne unten wartet", Zeile 350-355) und „das habe ich angetippt" — dieselbe Doppeldeutigkeit wie bei C3.
- **Fix:** Das Grundproblem liegt tiefer als eine einzelne Zeile: Limette braucht einen dritten, unterscheidbaren Zustand für „vorläufig gewählt, noch nicht geprüft" statt entweder dauerhaft-limette oder komplett-orange. Konkret umsetzbar: `Wahlflaeche` einen `ton="vorlaeufig"` geben, der einen limetten Rand ohne limette Füllung zeigt (`border-kh-signal` + `bg-white/5`, Text `text-kh-paper`), sodass die Auswahl erkennbar limette-„du" bleibt, aber sich optisch von der satten Limette-Fläche der bestätigten Lösung (z. B. „Richtig herum. Jetzt runter damit.") unterscheidet. Das behält die Absicht des Kommentars (keine grüne Fläche, die nach „richtig" aussieht, bevor geprüft wurde), ohne die Systemfarbe zu vertauschen.

C6 (Rest): sauber (Linse system) — Kamera- und Lichtwechsel als visuelle Signatur klar umgesetzt, Fehlertext ersetzt statt stapelt sich korrekt über den Kacheln, „Element sitzt"-Pill korrekt limette, „So absetzen"-Button korrekt limette (`variant="aktion"`) als Primärhandlung des Beats, Beat 2 hat bewusst keinen Panel-Knopf, weil die Bühne selbst die Handlung ist (R8-konform), „Weiter zum Feierabend" trägt den bereits notierten R3-Systembefund.

## 7/9 — C7 „Heute früh war da eine Betonplatte"

C7: sauber (Linse system) — Rückblick-Checkliste korrekt limette (eigene Leistungen des Tages = „du", C7.tsx:151), das gebaute Haus zeigt glaubhaft dasselbe Element/Fenster wie in C4/C6 (Wiedererkennungswert statt generischer Bühne), Bühne füllt die obere Hälfte mit dem fertigen Haus im Nachmittagslicht, keine Kollision mit der Karte. Einziger CTA „Weiter" trägt den bereits notierten R3-Systembefund.

## 8/9 — C8 „Und danach?" + C8.1 „Meister" (Karriere-Detail)

### C8.1 (Karriere-Weg „Meister") — R5 — Fünf Fakten-Abschnitte stehen im Querformat komplett aufgeklappt gleichzeitig da, zusammen rund 120 Wörter ohne jede Klapp-/Faltzeile
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-26-c8-meister-detail.png (alle fünf Blöcke „Was ist das", „Wie lange", „Was du den Tag über machst", „Was es kostet", „Was du verdienst" gleichzeitig ausformuliert sichtbar)
- **Datei:** src/khpl/komponenten/Klappliste.tsx:88-125 (Zweig `if (!schmal)`: „Überall sonst stehen alle Texte da" — im breiten/Kiosk-Querformat wird die Akkordeon-Logik komplett abgeschaltet und stattdessen alle `dd`-Texte gleichzeitig gerendert), verwendet von src/khpl/steps/zimmerer/C8x.tsx:79
- **Befund:** khpl-designregeln.md R5 setzt für Lese-Steps ein Wortbudget von „~50 Wörter sichtbar", der Rest gehört hinter vorhandene Klappzeilen. Auf der Meister-Karte sind es allein im Abschnitt „Was du den Tag über machst" schon rund 46 Wörter, und alle fünf Abschnitte zusammen kommen auf rund 120 Wörter — mehr als das Doppelte des Budgets, alles auf einen Blick ohne jede Faltung. Das ist am Kiosk-Querformat (der Regelfall am Messestand) der Normalzustand dieses Screens, nicht ein Sonderfall: `Klappliste` deaktiviert ihre eigene Akkordeon-Funktion im breiten Modus bewusst vollständig.
- **Fix:** Im breiten Modus nicht alle fünf `dd`-Texte gleichzeitig ausschreiben, sondern das Akkordeon-Verhalten sinngemäß erhalten: z. B. weiterhin alle fünf `dt`-Überschriften sichtbar (das Verzeichnis, das der Kommentar in Zeile 43 beschreibt), aber nur der erste oder der zuletzt angetippte Abschnitt trägt den ausgeschriebenen Text — die übrigen bleiben auf die Überschrift reduziert und öffnen sich auf Tap, genau wie im schmalen Modus. Das behält die von den Kommentaren beschriebene „Verzeichnis"-Funktion, bringt den sichtbaren Text aber wieder unter das 50-Wörter-Budget.

C8 (Rest): sauber (Linse system) — drei gleich große, gleich gestaltete Karriere-Kacheln ohne Rangfolge (Meister/Techniker/Studium), Ziffern-Wasserzeichen kollidiert nicht mit Text, Fakten-Eyebrows auf der Detailkarte korrekt orange (Welt-Info), „Weiter"-Buttons tragen den bereits notierten R3-Systembefund.

## 9/9 — C9 „Dein nächster Schritt" (Abschluss)

C9: sauber (Linse system) — der komplett orange gefüllte Screen ist im Code ausdrücklich als einzige erlaubte Ausnahme von R3 begründet („Genau ein orange gefülltes Feld pro Screen — hier ist es die ganze Fläche", C9.tsx:27-32) und dient als Marken-Abschlusszone der Kreishandwerkerschaft, nicht als App-Screen im engeren Sinn — Ausnahme ist nachvollziehbar und einmalig. „Von vorn"/„Zurück zu deinem Tag" korrekt zurückhaltend grau, „Noch einen Beruf" auf dunklem Fußgrund gut lesbar, keine Kollision der Silhouette mit dem Panel (ausgeblendet über Maskengradient).

## Zusammenfassung

Ein durchgängiger Systembefund zieht sich durch alle 9 Steps: Der „Weiter"-CTA und die Hauptweg-Karte im „Wohin als Nächstes"-Dialog sind app-weit orange, obwohl khpl-designregeln.md R3 „Alle Weiter-CTAs limette" verlangt (Quelle: `button.tsx` Variante `weiter`, `Verzweigung.tsx`). Er ist unter C1 einmal ausführlich dokumentiert und wird danach nur noch kurz referenziert, um Wiederholung zu vermeiden — zählt aber als eigenständiger, hochprioritärer Befund, weil er *jeden* Screen betrifft.

Daneben gibt es lokale R3/R8-Varianten desselben Grundproblems, wo Orange zusätzlich die primäre Nutzereingabe selbst einfärbt statt nur Fakten (C3-Schichtkarte, C6-Antwortkacheln), einen klaren R6-Verstoß (C2-Titel verrät die gesuchte Zahl), einen R5-Wortbudget-Verstoß (C8.1-Karriereseiten zeigen ~120 Wörter ohne Faltung) und einen borderline-R1-Fall (C5s sehr leere Bühne, vermutlich Absicht).

