# Review: Anlagenmechanik — Linse "Anfänger" (R10–R14, R4–R6)

Zielgruppe: 16-Jährige am Messestand, die vom Beruf nichts wissen. Geprüft:
unerklärte Fachbegriffe, Glossar-Chips, einschüchternde Artefakt-Wände,
Schulnoten-Feedback, Zahlen ohne Körper-Anker, fehlende echte Menschen/Ergebnisse,
Ton-Drift, Antwort-Spoiler in Titeln.

## A1 — Kein warmes Wasser

### A1 — R10 — "Vorlauf" fällt unerklärt in einem Prüfungsergebnis, kein Glossar-Chip
- **Screenshot:** /tmp/khpl-shots/anlagenmechanik/khpl-anlagenmechanik-01-A1-initial.png
- **Datei:** src/khpl/steps/anlagenmechanik/A1.tsx:96-99 (Prüfung „kessel", Ergebnistext)
- **Fix:** Entweder das Wort aus dem Ergebnissatz streichen ("Er läuft. Die Heizkörper werden warm. Am Wärmeerzeuger liegt es nicht.") oder mit `<Fachwort id="vorlauf">Vorlauf</Fachwort>` auszeichnen wie bei „Zirkulation" — Glossartext z. B.: "Vorlauf: das Rohr, in dem heißes Wasser vom Kessel zu den Heizkörpern fließt."

### A1.1 (Abstecher „Wer fährt eigentlich nachts?") — R5 — Vier Absätze (~106 Wörter) stehen gleichzeitig offen, kein Wortbudget eingehalten
- **Screenshot:** /tmp/khpl-shots/anlagenmechanik/khpl-anlagenmechanik-04-A1-abstecher-offen.png
- **Datei:** src/khpl/steps/anlagenmechanik/A11.tsx:51-75 (`warum`-Block mit drei Absätzen + `AhaKarte` mit einem weiteren, die laut Screenshot alle gleichzeitig sichtbar sind)
- **Fix:** Nur den ersten Warum-Absatz ("Notdienst, Bereitschaft, Wochenende…") plus den Aha-Satz sichtbar lassen (~40 Wörter); die beiden Absätze zu Rotation und Bezahlung ("Wenn samstags die Heizung ausfällt…" und "Bezahlt wird beides getrennt…") hinter eine eigene Klappzeile legen, z. B. "Wer fährt, und wie wird das bezahlt?".

## A2 — Vierzig Jahre Keller

A2: sauber (Linse anfaenger) — vorbildliche Glossar-Chip-Nutzung: „Verteiler",
„Vorläufe", „Ausdehnungsgefäß" und „hydraulischer Abgleich" sind alle über
`Fachwort`/Glossar-Popup erklärt (A2.tsx:87-128), Ton bleibt Meister-zu-Azubi
(„Er ist nicht kaputt — er ist vierzig Jahre alt und verbrennt Öl."). Kein
Fund gegen R10–R14/R4–R6.

## A3 — Wie viel Wärme braucht ein Haus?

### A3 — R12 — Die zentralen Zahlen 10–14 kW und 7,4 t → 2,4 t CO₂ bekommen keinen Körper-Anker
- **Screenshot:** /tmp/khpl-shots/anlagenmechanik/khpl-anlagenmechanik-08-A3-geloest.png
- **Datei:** src/khpl/steps/anlagenmechanik/A3.tsx:64-80 (`ZIEL`, `BILANZ`), Dialog `Rechnung()` Z.336-354
- **Fix:** Einen Satz mit greifbarem Vergleich ergänzen, z. B. unter der 10–14 kW-Zeile: „Das ist etwa so viel Leistung wie fünf Wasserkocher gleichzeitig." Bei der CO₂-Bilanz: „7,4 Tonnen — so schwer wie fünf Kleinwagen." Auch der Dialog „Woher kommt diese Zahl?" bleibt bei reinen Watt-Werten (70–100 W/m²) ohne Anker; dort denselben Vergleich ergänzen.

### A3.1 (Abstecher „Wärmepumpe gegen Ölkessel") — R5 — Drei Warum-Absätze plus Aha-Text (~140 Wörter) stehen gleichzeitig offen
- **Screenshot:** /tmp/khpl-shots/anlagenmechanik/khpl-anlagenmechanik-09-A3-abstecher.png
- **Datei:** src/khpl/steps/anlagenmechanik/A31.tsx:53-83 (`warum` mit drei Absätzen, dazu `AhaKarte` mit weiterem Absatz — laut Screenshot alle gleichzeitig sichtbar, keine Klappzeile trennt sie)
- **Fix:** Nur Absatz 1 (Preis der Wärmepumpe) und den Aha-Satz sichtbar lassen; Absatz 2 (Geräteanteil) und Absatz 3 (Förderung/KfW) hinter eine eigene Klappzeile „Was zahlt der Staat dazu?" legen.

### A3.1 — R10 — „KfW" fällt unerklärt, kein Glossar-Chip
- **Screenshot:** /tmp/khpl-shots/anlagenmechanik/khpl-anlagenmechanik-09-A3-abstecher.png
- **Datei:** src/khpl/steps/anlagenmechanik/A31.tsx:78-82
- **Fix:** Satz umformulieren, damit die Abkürzung nicht unerklärt hängt: „Wer es genau wissen will, sieht bei der KfW nach — der staatlichen Förderbank." (kein neuer Chip nötig, ein eingeschobener Halbsatz reicht.)

## A4 — Der kürzeste Weg ist nicht der richtige

A4: sauber (Linse anfaenger) — R11 vorbildlich umgesetzt: die Abweisung an
der tragenden Wand ("Da geht nichts durch — das ist tragend. Such einen
anderen Weg.") ist Sachaussage statt Tadel, kein Blockieren, „Neu ziehen"
bleibt jederzeit da. Kein Fund gegen R10–R14/R4–R6.

### A4.1 (Abstecher „Löten, pressen, stecken") — R10 — „Fitting", „Lot" und „entgraten" fallen unerklärt, kein Glossar-Chip
- **Screenshot:** /tmp/khpl-shots/anlagenmechanik/khpl-anlagenmechanik-15-A41-abstecher.png
- **Datei:** src/khpl/steps/anlagenmechanik/A41.tsx:34-47 (`ARTEN` — Texte zu Löten/Pressen/Stecken)
- **Fix:** Entweder mit `<Fachwort>` auszeichnen (analog zu A2/A3) oder in Alltagssprache umschreiben, z. B. „Rohr ablängen, die scharfe Kante abfeilen (entgraten), hineinschieben." und „Fitting aufschieben" zu „Verbindungsstück aufschieben" ändern, „Lot" zu „Lötzinn, das in den Spalt läuft" präzisieren.

## A5 — Halb eins, im Transporter

### A5 — R5 — „Warum das so ist" zeigt beim Öffnen der Karte bereits ~68 Wörter, bevor überhaupt eine Frage angetippt ist
- **Screenshot:** /tmp/khpl-shots/anlagenmechanik/khpl-anlagenmechanik-16-A5-initial.png
- **Datei:** src/khpl/steps/anlagenmechanik/A5.tsx:127-158 (`warum` mit zwei Absätzen plus dem Kunden-Zwischenruf, alle ohne eigene Klappzeile)
- **Fix:** Den zweiten Absatz („Nicht jeder Kunde ist geduldig …") hinter eine eigene, zunächst geschlossene Klappzeile legen, z. B. „Und wenn der Kunde ungeduldig wird?" — der erste Absatz (Ankunft/Pause, ~30 Wörter) bleibt als Anker offen, der Rest kommt auf Tipp.

## A6 — Es läuft

### A6 — R12 — Die Einheit „bar" bleibt ohne Körper-Anker (0,8–2,8 bar Regler, Zielfenster 1,2–1,8 bar)
- **Screenshot:** /tmp/khpl-shots/anlagenmechanik/khpl-anlagenmechanik-18-A6-initial.png
- **Datei:** src/khpl/steps/anlagenmechanik/A6.tsx:398-416 (`Faustformel`)
- **Fix:** Einen Halbsatz in die Faustformel-Karte einfügen: „Zum Vergleich: 1 bar ist ungefähr der Luftdruck, der gerade auf dich drückt — die Anlage braucht etwas mehr, damit das Wasser bis nach oben kommt."

## A7 — Jetzt erklärst du es

A7: sauber (Linse anfaenger) — vorbildlichste Umsetzung von R11 im ganzen
Tag: alle drei Antwortsorten sehen optisch identisch aus, keine Note, keine
Farbe wertet; die „Fach"-Antworten (COP, Verdampfer, Störcodes) sind
absichtlich unerklärt, weil genau das die Pointe der Übung ist (schlechte
Kundenkommunikation), kein R10-Verstoß. Rückblick „Du hast heute…" ohne
Punktestand. Kein Fund gegen R10–R14/R4–R6.

## A8 / A8.1–A8.3 — Und danach? (Meister · Techniker · Studium)

### A8.1 (Meister) — R10 — „Aufstiegs-BAföG" fällt unerklärt, kein Glossar-Chip
- **Screenshot:** /tmp/khpl-shots/anlagenmechanik/khpl-anlagenmechanik-24-A8-meister.png
- **Datei:** src/khpl/steps/anlagenmechanik/karrierewege.ts:73-75 (Abschnitt „Was es kostet")
- **Fix:** Einen kurzen erklärenden Zusatz einfügen: „Das Aufstiegs-BAföG — ein staatlicher Zuschuss für Weiterbildungen wie den Meister — übernimmt davon den größten Teil."

### A8.1–A8.3 — R5/R10 — Fünf bzw. drei dichte Faktenblöcke (~90–110 Wörter) stehen im Querformat gleichzeitig offen, ohne einen hervorgehobenen Kernfakt oder eine Lizenz zum Nichtwissen
- **Screenshot:** /tmp/khpl-shots/anlagenmechanik/khpl-anlagenmechanik-24-A8-meister.png
- **Datei:** src/khpl/steps/anlagenmechanik/A8Weg.tsx:117-138 (`Faktenliste`, breite Fassung ohne Akkordeon)
- **Fix:** Wie in der schmalen Fassung (Klappliste, Z.141-177) auch quer nur den ersten Block offen starten lassen und die übrigen als Klapp-Kacheln zeigen — oder mindestens einen Block („Was NRW dazugibt" bzw. den koeder-Fakt) optisch hervorheben (Orange-Rahmen), damit nicht alle fünf Fakten gleich laut wirken.

## A9 — Dein nächster Schritt

A9: sauber (Linse anfaenger) — echtes Foto als Bühnenprominenz (R13), warmer
Abschluss ohne Fachbegriffe, „Sprich jetzt mit uns am Stand" statt
Bewertung/Note. Kein Fund gegen R10–R14/R4–R6.

---

## Zusammenfassung

Insgesamt 10 Befunde über die neun Haupt-Steps und ihre Abstecher. Auffälligstes
Muster: **Abstecher/Lese-Steps ohne auftrag (A1.1, A3.1, A5, A8.1–A8.3) zeigen
regelmäßig mehr Text gleichzeitig, als R5s ~50-Wörter-Budget vorsieht** — die
App hat das Klappzeilen-Werkzeug dafür bereits (`WarumBereich`,
Faktenliste-Akkordeon), nutzt es an diesen Stellen aber nicht konsequent.
Zweithäufigstes Muster: vereinzelte unerklärte Fachbegriffe/Abkürzungen
(Vorlauf, KfW, Aufstiegs-BAföG, Fitting/Lot/entgraten), obwohl die App mit
`Fachwort`/Glossar-Chips (A2, A3, A4, A6) ein funktionierendes Werkzeug dafür
hat. Die Kernübungen A1, A2, A4, A6 und A7 sind dagegen vorbildlich im Sinne
von R10–R14 (Fehler als Folge statt Note, kein Blockieren, „Fach"-Antworten
bewusst als Negativbeispiel).

