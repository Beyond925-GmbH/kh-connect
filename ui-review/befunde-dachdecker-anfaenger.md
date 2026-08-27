# Befunde: Dachdecker — Linse Anfänger (R10–R14, R4–R6)

Zielgruppe: 16-Jährige am Messestand, die vom Beruf nichts wissen. Geprüft:
unerklärte Fachbegriffe, fehlende Glossar-Chips, einschüchternde
Artefakt-Wände ohne Hervorhebung/Lizenz zum Nichtwissen, Feedback das nach
Schulnote schmeckt, Zahlen ohne Körper-Anker, fehlende echte
Menschen/Ergebnisse, Ton-Drift (akademisch/kindisch), Antwort-Spoiler in
Titeln.

---

## M1 — Der erste Termin

M1: sauber (Linse anfänger). Auswertung framt die verpasste Zufahrt als
offenen Punkt mit Begründung statt als Fehler ("3 von 4 hast du. Das hier
ist noch offen:"), kein Rot/Note, Begriff-Chip auf "Angebot" vorhanden,
echte Foto-Bühne mit zwei Menschen im Gespräch.

---

## M2 — Was kostet dieses Dach?

### M2 — R11 — Die Abweichung wird als nackte Zahl gezeigt, nicht als Kompliment an den Beruf umgemünzt
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-05-m2-geloest.png
- **Datei:** src/khpl/steps/dachdecker/M2.tsx:315-324 (Funktion `Vergleich`)
- **Fix:** Den Satz „Deine Schätzung 26.500 € — 14.500 € daneben" um eine
  Einordnung ergänzen, die den Beruf aufwertet statt nur den Fehlbetrag zu
  nennen, z. B.: „Deine Schätzung 26.500 € — mehr als das Doppelte. Genau
  deshalb braucht's dafür eine Ausbildung, kein Bauchgefühl." Der Satz
  sollte in `Vergleich` konditional auf `abstand` reagieren (klein vs. groß),
  damit er nicht bei jedem Abstand gleich klingt.

### M2 — R10 — „Abbund und Aufrichten" in der Kostenaufstellung ist ein unerklärter Fachbegriff, obwohl ein Glossar-Eintrag existiert
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-05-m2-geloest.png
- **Datei:** src/khpl/steps/dachdecker/M2.tsx:49 (`POSTEN`-Array), gerendert in Zeile 196-199
- **Fix:** `was: 'Abbund und Aufrichten'` ist reiner String, kein `<Begriff>`.
  Glossar-Eintrag `abbund` existiert bereits (src/khpl/glossar/begriffe.ts:72).
  In der Posten-Zeile das Wort „Abbund" mit `<Begriff id="abbund">Abbund</Begriff>`
  umschließen (dafür `was` von String auf ReactNode ändern oder ein
  separates `label`-Feld mit JSX für diesen einen Posten einführen).

---

## M3 — Aus dem Angebot wird ein Auftrag

### M3 — R10 — Der Abbundplan zeigt den ganzen komplexen Dachstuhl auf einmal, ohne ein Element hervorzuheben oder Nichtwissen zu lizenzieren
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-07-m3-initial.png
- **Datei:** src/khpl/steps/dachdecker/M3.tsx:55-58 (`<Dachstuhl3D zielT={1} darstellung="riss" ... />`)
- **Fix:** Die Zeichnung zeigt ~15 Sparren plus Innenstreben gleichzeitig in
  derselben Helligkeit — für jemanden ohne Vorwissen eine Wand aus Linien.
  Regelkonform: einen Sparren (oder die Firstlinie) in Orange hervorheben,
  den Rest auf ~40% Deckkraft dimmen, und im `warum`-Text einen Satz
  ergänzen, der das Nichtwissen ausdrücklich erlaubt, z. B.: „Jedes Holz hat
  hier eine eigene Nummer — du musst noch keins davon lesen können."
  (statt nur „jedes Holz mit Länge, Winkel und eigener Nummer").

---

## B3.1 — Bestellt wird nach Plan

### B3.1 — R10 — Der Glossar-Chip auf „Holz" öffnet die Erklärung von „Brettschichtholz" — ein anderer Begriff
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-10-b31-abstecher.png
- **Datei:** src/khpl/steps/dachdecker/B31.tsx:54 (`<Begriff id="brettschichtholz">Holz</Begriff>`)
- **Fix:** Der Satz redet von natürlich gewachsenem Holz ("Holz wächst, keiner
  ist wie der andere"), der verlinkte Glossar-Eintrag `brettschichtholz`
  erklärt aber verleimte Bretter/BSH (src/khpl/glossar/begriffe.ts:102-106) —
  inhaltlich ein anderes Thema. Entweder den Chip entfernen (das Wort „Holz"
  braucht am Messestand keine Erklärung) oder auf einen passenden Begriff
  wie `holzfeuchte`/„Wuchs" ummünzen, der tatsächlich erklärt, warum „keiner
  ist wie der andere" stimmt.

### B3.1 — R5 — Drei Textblöcke gleichzeitig sichtbar sprengen das ~50-Wörter-Budget
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-10-b31-abstecher.png
- **Datei:** src/khpl/steps/dachdecker/B31.tsx:57-69 (zwei `AhaKarte`) + Zeile 50-56 (`warum`)
- **Fix:** Beide Aha-Karten erscheinen automatisch 800 ms nach dem Einstieg
  (kein Antippen nötig) und stehen zusammen mit dem `warum`-Absatz auf
  einmal auf dem Screen — zusammen ca. 75-80 Wörter statt der Zielgröße
  ~50. Die zweite Aha-Karte („Wie viel CO₂...") antippbar/eingeklappt
  starten lassen (wie die Akkordeons in M3/M6), statt sie automatisch mit
  aufzuklappen.

---

## B3.2 — Vom Plan in den Kopf

B3.2: sauber (Linse anfänger). Volles 3D-Modell wirkt zunächst dicht, aber
die Übung selbst löst R10 ein — antippen hebt genau ein Bauteil hervor und
erklärt es einzeln; Aha-Karte reassuriert explizit ("Räumliches
Vorstellungsvermögen ist kein Talent. Es ist Training").

---

## M4 — Ein Balken, ein Maß

M4: sauber (Linse anfänger). Fehl-Feedback reframt konsequent
("Zu lang lässt sich kürzen. Kostet dich Zeit, nicht Material — noch mal."),
Toleranz erklärt vorab, Länge/Winkel sind am realen Balken verankert statt
als abstrakte Zahl, Ton bleibt Meister-zu-Azubi ("Passt. Nummer drauf —
das ist jetzt dein Sparren.").

---

## B4.1 — Beladen

B4.1: sauber (Linse anfänger). Bewusst begriffsfrei formulierte Karten
("Das nummerierte Holz fürs Dach" statt "Sparren und Pfetten"), Ablehnung
zeigt sich grau/durchgestrichen statt rot, jede Begründung erklärt statt zu
bewerten, trockener Ton bleibt durch ("Klar." als Begründung für Werkzeug).

---

## M5 — Aufrichten

M5: sauber (Linse anfänger). Jedes Bauteil bekommt eine eigene Karte mit
Zeichnung + Name + Ein-Satz-Erklärung, bevor der Fachbegriff überhaupt
gelesen werden muss ("Fusspfetten", "Stuhlsäulen" sind sofort erklärt,
kein unbegleiteter Fachbegriff auf dem Screen).

---

## B5.1 — Niemand macht das allein

### B5.1 — R13 — Der Teamgeist-Step hat kein echtes Zitat, nur Fachtext über Teamarbeit
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-24-b51.png
- **Datei:** src/khpl/steps/dachdecker/B51.tsx:11-17 (Kommentar im Code selbst
  benennt die Lücke: "Hier fehlt noch das Wichtigste... ein Zitat aus dem
  echten Team statt einer allgemeinen Aussage über Teamgeist")
  und Zeile 38-45 (`warum`-Text)
- **Fix:** Der Titel "Niemand macht das allein" verspricht genau den
  Mensch-Beat, den R13 verlangt — geliefert wird stattdessen ein
  Sach-Absatz über Gewicht und Rollenverteilung am Kran. Ein echtes Zitat
  von einem Zimmerer/Dachdecker-Azubi oder -Meister ergänzen (z. B. als
  Sprechblase über dem Foto, analog zu anderen Berufen in der App), bevor
  der Step live geht — bis dahin bleibt der stärkste "Will ich das sein?"-
  Moment des Abstechers unbesetzt.

---

## M6 — Halb zwölf

M6: sauber (Linse anfänger). Echtes Pausenfoto statt drittem Rohbau-Screen,
keine Aufgabe, freiwillige FAQ-Chips, Ton alltagsnah statt lehrhaft.

---

## M7 — Jetzt du

### M7 — R10 — Fünf neue Fachbegriffe auf den Zieh-Karten ohne jede Erklärung — anders als im Schwester-Step M5
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-28-m7-initial.png
- **Datei:** src/khpl/buehne/aufbauabschnitte.ts:118-181 (`Bauschritt`-Interface
  ohne `was`-Feld) und src/khpl/steps/dachdecker/M7.tsx:434-449 (`Bauteilkarte`/
  `Kartenflaeche` rendern nur `schritt.name` + Icon)
  sowie die Vorführung Zeile 385-404 (`Vorfuehrung` zeigt nur den Namen)
- **Fix:** „Dachlatten“, „Windrispenbänder“, „Sparrenpaare“, „Konterlattung“,
  „Kehlbalken“ stehen als nackte Wörter auf den Karten (nur eine kleine
  44px-Schemazeichnung dazu) — im Gegensatz zu M5, wo jede Karte einen
  erklärenden Satz trägt ("Das unterste Holz, direkt auf der Mauerkrone...").
  Der erklärende Satz existiert bereits pro Bauteil in
  `dachstuhl/bauteil-texte.ts` (`BAUTEIL_TEXTE`, siehe B3.2). `Bauschritt`
  um ein `was`-Feld erweitern und in der Vorführung (`Vorfuehrung`) sowie
  unter dem Kartennamen in `Kartenflaeche` einblenden — mindestens während
  der Vorführungsphase (`takt === 'zeigen'`), damit die Begriffe beim
  ersten Erscheinen erklärt sind, bevor sie in der Abfrage bloße Wörter zum
  Ziehen werden.

---

## M8 — Feierabend

M8: sauber (Linse anfänger). Rückblick als Tätigkeitsliste statt Punktzahl,
jede Zeile hat eine wertungsfreie Alternativformulierung für Übersprungenes
("an einem Balken Maß genommen" statt "zugeschnitten"), kein Score.

---

## M9 — Und danach?

### M9/B9.1 — R12 — Das Meister-Gehalt "rund 54.000 Euro im Jahr" hat keinen Körper-Anker
- **Screenshot:** /tmp/khpl-shots/dachdecker/khpl-dachdecker-33-m9-meister-detail.png
- **Datei:** src/khpl/steps/dachdecker/karrierewege.ts:99 (`antwort: 'Als Dachdeckermeister:in im Schnitt rund 54.000 Euro im Jahr.'`)
- **Fix:** Für eine 16-Jährige ist "54.000 Euro im Jahr" eine abstrakte
  Zahl ohne Gefühl dafür, ob das viel oder wenig ist. Einen Vergleich
  ergänzen, der sich fühlen lässt, z. B.: „Als Dachdeckermeister:in im
  Schnitt rund 54.000 Euro im Jahr — mehr als das Doppelte vom
  Azubi-Gehalt im dritten Lehrjahr." (Betrag ggf. gegen die tatsächliche
  Azubi-Vergütung aus demselben Beleg prüfen). Dieselbe Anker-Lücke gilt
  für "Rund 13.500 Euro für Lehrgang und Prüfung" — auch dort fehlt ein
  Vergleichswert, an dem sich die Summe einordnen lässt.

---

## M10 — Dein nächster Schritt

M10: sauber (Linse anfänger). Echtes Foto eines Dachdeckers statt leerer
Markenfläche, klarer CTA, kein Bewertungs-Ton am Ende.

---
