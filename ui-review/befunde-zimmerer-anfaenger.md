# Review: Zimmerer — Linse Anfänger (R10–R14, R4–R6)

Zielgruppe: 16-Jährige am Messestand, die vom Beruf Zimmerer nichts wissen.
Fokus: unerklärte Fachbegriffe, fehlende Glossar-Chips, einschüchternde
Artefakt-Wände ohne Hervorhebung/Lizenz zum Nichtwissen, Feedback das nach
Schulnote schmeckt, Zahlen ohne Körper-Anker, fehlende echte Menschen/
Ergebnisse, Ton-Drift (akademisch/kindisch), Antwort-Spoiler in Titeln.

---

## C1 — Der Stapel steht schon da

### C1 — R10 — „Ausklinkung“ ist der Kern der Pointe des Screens und bleibt komplett unerklärt
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-01-c1-initial.png, /tmp/khpl-shots/zimmerer/khpl-zimmerer-02-c1-geloest.png
- **Datei:** src/khpl/steps/zimmerer/C1.tsx:219 (Stueckliste-Text „Ständer, mit Ausklinkung“), Zeile 69 (Rueckmeldung „ohne Ausklinkung. Die braucht die Schwelle.“), Zeile 127 („jede Ausklinkung gefräst“)
- Die Pointe des Steps ist explizit „nicht die Länge unterscheidet sie, sondern die Bearbeitung“ — aber das Wort, das diese Bearbeitung benennt (Ausklinkung), taucht drei Mal auf (Stückliste, Warum-Text, Fehler-Feedback) und ist an keiner Stelle als `Begriff`-Chip verlinkt. Es steht auch nicht im Zimmerer-Glossar (`src/khpl/glossar/zimmerer.ts`). Ein 16-Jähriger liest „Ständer, mit Ausklinkung“ und weiß weder was ein Ständer noch was eine Ausklinkung ist — zwei neue Begriffe in einer Zeile, keiner erklärt.
- **Fix:** Neuen Glossareintrag `ausklinkung` in `src/khpl/glossar/zimmerer.ts` ergänzen (z. B. „Ausklinkung — Eine gefräste Kerbe am Ende des Holzes, damit es passgenau auf der Schwelle sitzt.“) und in C1.tsx an allen drei Stellen (Stueckliste-Zeile 219, Warum-Text Zeile 127, GRUENDE-Text Zeile 69) mit `<Begriff id="ausklinkung">Ausklinkung</Begriff>` verlinken statt als Klartext.

### C1 — R10 — Fehler-Feedback zu Nr. 44 nennt „Schwelle“ unverlinkt, obwohl der Begriff im Glossar existiert
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-01-c1-initial.png
- **Datei:** src/khpl/steps/zimmerer/C1.tsx:69
- „Nr. 44 — gleiche Länge, aber ohne Ausklinkung. Die braucht die Schwelle.“ — „Schwelle“ hat bereits einen Glossareintrag (`glossar/zimmerer.ts` NEU.schwelle), wird hier aber als reiner Text ausgegeben statt als Chip. Zusätzlich ist der Satz grammatisch zweideutig („Die braucht die Schwelle“ — wer braucht was?), was für Erstleser verwirrend ist.
- **Fix:** Satz umformulieren und verlinken: „Nr. 44 — gleiche Länge, aber ohne Ausklinkung. Die <Begriff id="schwelle">Schwelle</Begriff> braucht die Kerbe, um sauber zu sitzen.“

### C1 — R5 — Abstecher-Inhalt „Die Maschine hat heute Nacht gearbeitet“ zeigt weit über 50 Wörter ungeklappt auf einmal
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-04-c1-abstecher-inhalt.png
- **Datei:** src/khpl/steps/zimmerer/C1.tsx (Abstecher-Ziel, vermutlich C11.tsx)
- Zwei Fließtext-Absätze plus drei Themenkarten (Abbundzentrum / Nagelbrücke / SEMA und AutoCAD) plus Zitat liegen alle offen sichtbar übereinander — geschätzt 140+ Wörter ohne Akkordeon. Für einen Abstecher, den ein Erstleser freiwillig anklickt, ist das trotzdem eine Textwand ohne Entlastung (kein „Warum“-Klapp, keine Hervorhebung).
- **Fix:** Die drei Themenkarten hinter ein Akkordeon „Mehr dazu“ legen und nur den ersten Absatz plus das Zitat offen zeigen — reduziert die sichtbare Menge auf ca. 50 Wörter, Rest bleibt einen Klick entfernt.

C1: sonst sauber (Linse Anfänger) — Titel spoilert nichts (R6), Feedback ist erklärend statt wertend (R11), Zitat vom „erfahrenen Zimmerer“ erfüllt R13 für den Abstecher.

---

## C2 — Zweiundsechzig Komma fünf

### C2 — R6 — Der Screen-Titel schreibt die gesuchte Zahl aus, während der Schätz-Slider noch läuft
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-06-c2-initial.png
- **Datei:** src/khpl/berufe/zimmerer.ts:81 (`titel: 'Zweiundsechzig Komma fünf'`)
- Der Titel steht schon im initialen Zustand über dem laufenden Rate-Slider (Startwert 90 cm) sichtbar auf dem Screen und schreibt „ZWEIUNDSECHZIG KOMMA FÜNF“ aus — exakt der gesuchte Zielwert (62,5 cm). Das ist wortwörtlich das Negativbeispiel aus den Designregeln selbst (R6: „ZWEIUNDSECHZIG KOMMA FÜNF über einem laufenden Schätz-Slider löscht den Aha-Moment“). Jeder Anfänger, der den Titel liest, kann den Slider stur bis zum ausgeschriebenen Wert ziehen, ohne zu schätzen.
- **Fix:** Titel in `zimmerer.ts:81` auf ein Thema statt eine Zahl ändern, z. B. `titel: 'Das Raster, das keiner sich ausdenkt'`. Die ausgeschriebene Zahl gehört laut R6 stattdessen als Titel der Auflösung — dort steht sie in Orange bereits prominent als `kh-zahl` (Zeile 226), das reicht als Aha-Moment.

### C2 — R12 — 62,5 cm bekommt keinen Körper-Anker, obwohl die Regeln genau diese Zahl als Beispiel nennen
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-07-c2-geloest.png
- **Datei:** src/khpl/steps/zimmerer/C2.tsx:274-285 (Herleitungs-Karte „Woher das Maß kommt“)
- Die Auflösung erklärt die Zahl nur über die Plattenbreite („Die Hälfte von 125 cm ist 62,5 cm“) — mathematisch korrekt, aber ohne Körpergefühl. R12 nennt „62,5 cm ≈ deine Schulterbreite“ ausdrücklich als Referenzbeispiel für diese Regel; genau dieser Anker fehlt hier komplett, obwohl der Screen exakt diese Zahl auflöst.
- **Fix:** In der Herleitungs-Karte einen zweiten Satz ergänzen: „62,5 cm — ungefähr deine eigene Schulterbreite.“ Direkt nach dem bestehenden Satz zur Plattenhälfte einfügen, vor dem „Meist. Nicht immer …“-Absatz.

C2: Slider-Grammatik (R7, rechts=größer), Rate-Lizenz im Ansage-Dialog („Wissen kann das niemand — rate“) und Ton (R14, „Weil im Bau alles an etwas anderem hängt“) sind vorbildlich — die zwei Befunde oben betreffen aber den Kern des Screens.

---

## C3 — Eine Wand ist ein Sandwich

### C3 — R10 — „Gefach“ fällt unerklärt in der Dämmungs-Karte, ohne Glossar-Chip
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-08-c3-initial.png (Karte erscheint bei Schicht 3 „Ständerwerk mit Dämmung“, im Screenshot noch nicht sichtbar — Text unten)
- **Datei:** src/khpl/steps/zimmerer/C3.tsx:100 (`was: 'Das tragende Skelett — und zwischen den Ständern, im Gefach, die Dämmung. ...'`)
- „Gefach“ ist ein Fachbegriff (das Feld zwischen zwei Ständern) und steht weder im Zimmerer-Glossar (`src/khpl/glossar/zimmerer.ts`) noch als `Begriff`-Chip verlinkt — anders als „Dampfbremse“ im selben Screen, das korrekt gechipt ist. Für einen 16-Jährigen ist „im Gefach“ ein unerklärtes Fremdwort mitten im Satz.
- **Fix:** Entweder Satz vereinfachen zu „Das tragende Skelett — und zwischen den Ständern die Dämmung.“ (Wort komplett streichen, da es nichts Neues trägt), oder neuen Glossareintrag `gefach` ergänzen und mit `<Begriff id="gefach">Gefach</Begriff>` verlinken.

C3: sonst sauber (Linse Anfänger) — Prinzip-Karte hebt einen Satz hervor statt Fließtext (R10), Abstecher C3.1 korrigiert eine Halbwahrheit transparent statt zu belehren (R11/R14), Foto einer echten Person mit Werkzeug erfüllt R13, Zahlen zu CO₂ stehen bewusst als Spanne statt falscher Präzision (R11-Geist).

---

## C4 — Hier kommt das Fenster hin

### C4 — R10 — „Dichtstoff“ und „Dichtband“ bleiben unerklärt, kein Glossareintrag existiert
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-14-c4-geloest.png
- **Datei:** src/khpl/steps/zimmerer/C4.tsx:155 (TREFFER_TEXT „Platz für Dämmung und Dichtstoff“), Zeile 429 (fehlertext „Zu breit fürs Dichtband“)
- Beide Begriffe sind Fachwörter aus dem Fenstereinbau und stehen nicht im Zimmerer-Glossar (`src/khpl/glossar/zimmerer.ts`) und nicht als `Begriff`-Chip. Anders als „Wechselholz“ im selben Step (korrekt gechipt), bleiben diese zwei ungeklärt — für einen Anfänger klingen sie fast gleich und lassen offen, ob es zwei verschiedene Dinge oder Synonyme sind.
- **Fix:** Kleinsten Eingriff wählen: Glossareintrag `dichtstoff` ergänzen („Dichtstoff — die elastische Masse, die die Fuge rundum abdichtet; als Band vorgefertigt heißt sie Dichtband.“) und beide Vorkommen mit `<Begriff id="dichtstoff">` verlinken. Alternativ „Dichtband“ in Zeile 429 durch „Dichtstoff“ vereinheitlichen, um nur einen neuen Begriff zu brauchen.

C4: sonst stark (Linse Anfänger) — Auftrag ist ein Imperativsatz ohne Zahl (R4/R6), Fehler-Feedback verknüpft Konsequenz mit Werkstatt-Realität statt Note („Nachschneiden kostet Zeit — um elf steht der Lkw“, R11/R14), Wasserwaagengenauigkeit als Vergleichsgröße statt nackter Zahl (R12-Geist).

---

## C5 — Elf Uhr, das Element geht raus

### C5 — R12 — „Eineinhalb bis drei Tonnen am Haken“ bleibt ohne Körper-Anker
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-16-c5-frage-offen.png
- **Datei:** src/khpl/steps/zimmerer/C5.tsx:74 (Antwort zu „Wie viel wiegt so ein Element?“)
- „70 bis 125 Kilo je Quadratmeter. Deine Wand ist acht Meter breit und drei hoch — grob eineinhalb bis drei Tonnen am Haken.“ Eine Tonnenzahl ist für einen 16-Jährigen abstrakt — es fehlt der Vergleich, der das Gewicht fühlbar macht (R12 nennt genau solche Fälle als Zielbild). Ohne Anker bleibt nur eine große, beeindruckende, aber nicht greifbare Zahl.
- **Fix:** Satz ergänzen: „…grob eineinhalb bis drei Tonnen am Haken — etwa so viel wie ein bis zwei Kleinwagen.“

C5: sonst sauber (Linse Anfänger) — Frage-Kacheln statt Fließtext-Wand halten das Wortbudget niedrig (R5), die dritte Frage „Und wenn es regnet?“ zeigt ehrlich die Kehrseite ohne Beruf schlechtzureden (R11), Zitat vom Zimmerer mit Namen-losem, aber konkretem Vertrauensanker „Seit Jahrzehnten im Beruf“ erfüllt R13 zusammen mit dem Foto im Abstecher C5.1.

---

## C6 — Am Haken

### C6 — R10 — „Anschlagmittel“ steht in der Aha-Karte als Klartext, obwohl es im selben Beruf schon als Chip existiert
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-22-c6-teil2-initial.png (Aha-Karte „Wer steht eigentlich unter der Last?“, auf diesem Screenshot noch nicht aufgeklappt, Text siehe Datei)
- **Datei:** src/khpl/steps/zimmerer/C6.tsx:427 (`Wer die Anschlagmittel einhängt, arbeitet seitlich ...`)
- Derselbe Begriff steht im Abstecher C5.1 korrekt verlinkt (`<Begriff id="anschlagmittel">Anschlagmittel</Begriff>`, C5.tsx-Nachbarschaft), hier in C6 aber als reiner Text — `Begriff` ist in C6.tsx gar nicht importiert. Ein Besucher, der C5.1 übersprungen hat, liest das Wort hier zum ersten Mal unerklärt.
- **Fix:** `import { Begriff } from './Begriff'` in C6.tsx ergänzen und Zeile 427 zu `Wer die <Begriff id="anschlagmittel">Anschlagmittel</Begriff> einhängt, arbeitet seitlich und führt das Element erst kurz vor dem Absetzen an seinen Platz.` ändern.

C6: sonst stark (Linse Anfänger) — Signaturscreen mit sauberem Doppel-Beat, Fehltext erklärt Konsequenz („in fünf Jahren ist die Dämmung nass und das Holz faul“) statt zu werten (R11), Rähm/Schwelle erklären sich direkt an der Kachel selbst („das obere Holz“/„das untere Holz“) ohne dass ein Chip nötig wäre, Schlusssatz „Das ist die Westwand des Hauses“ verbindet den ganzen Tag (R14).

---

## C7 — Heute früh war da eine Betonplatte

C7: sauber (Linse Anfänger) — die Rückblick-Liste vermeidet konsequent Score/Prozent/Note (R11), jeder Eintrag hat eine positive Formulierung unabhängig davon, ob die Übung gelöst oder nur gesehen wurde („ein Fenster eingeschnitten“ vs. „an einem Element Maß genommen“ — niemand steht am Messestand dumm da), die Bühne zeigt das eigene gebaute Element im Haus wieder (R13-Geist, Ergebnis-Bezug), Titel spoilert nichts (R6).

---

## C8 — Und danach?

### C8 — R10 — „fachgebunden“ bleibt als Verwaltungsbegriff unerklärt am Satzende stehen
- **Screenshot:** /tmp/khpl-shots/zimmerer/khpl-zimmerer-27-c8-weitere-wege.png (Karte „Studium“, Abschnitt „Warum erst eine Ausbildung?“ — im Screenshot nicht aufgeklappt, Text siehe Datei)
- **Datei:** src/khpl/steps/zimmerer/karrierewege.ts:143 (`... Mit dem Gesellenbrief und drei Jahren im Beruf geht es fachgebunden.`)
- Der Satz endet mit einem Verwaltungsbegriff („fachgebundene Hochschulreife“ verkürzt zu „fachgebunden“), der nirgends aufgelöst wird — anders als der Satz davor, der „Einschreibung in jeden Studiengang“ noch konkret macht. Ein 16-Jähriger weiß nicht, was „fachgebunden“ einschränkt (Studium nur im verwandten Fachbereich), und das Wort steht als letztes, unerklärtes Wort im Absatz.
- **Fix:** Satz ergänzen: „Mit dem Gesellenbrief und drei Jahren im Beruf geht es auch so — dann aber nur in einem verwandten Studiengang, etwa Bauingenieurwesen (»fachgebunden«).“

C8: sonst stark (Linse Anfänger) — die Meister-Karte korrigiert bewusst den werblichen Knopftext („Eigener Betrieb, eigene Azubis“) durch eine ehrlichere Karte mit echtem Zitat („Vieles läuft nicht so, wie es geplant war“, R11/R14), Geldangaben stehen konsequent als Spanne oder mit „rund“ statt als Versprechen, drei gleich große Karten verhindern, dass „Studium“ hinter den vertrauteren Wegen versteckt wird (R13-Geist: Weg wird sichtbar ernst genommen).

---

## C9 — Dein nächster Schritt

C9: sauber (Linse Anfänger) — Ton ist einladend statt fordernd („Sprich jetzt mit uns am Stand“), personalisierter Aufhänger aus C8 statt generischer Abschlussfloskel, echtes Foto einer jungen Person auf der Bühne trägt R13 bis zum letzten Screen durch, keine Zahl, kein Spoiler im Titel.

---

## Fazit

9 von 9 Haupt-Steps wurden geprüft (C1–C9); C7 und C9 sind ohne Befund. Die zehn Befunde sind fast ausschließlich R10 (unerklärte Fachbegriffe: Ausklinkung, Schwelle im Feedback, Gefach, Dichtstoff/Dichtband, Anschlagmittel-Inkonsistenz, fachgebunden) und R12 (fehlende Körper-Anker bei 62,5 cm und bei Tonnenangaben). Der schwerwiegendste Einzelfund ist C2: Der Screen-Titel schreibt buchstäblich „ZWEIUNDSECHZIG KOMMA FÜNF“ aus — exakt das Negativbeispiel, das die Designregeln selbst als R6-Verstoß zitieren —, und derselbe Screen lässt genau den Körper-Anker weg, den R12 für dieselbe Zahl als Referenzbeispiel nennt.
