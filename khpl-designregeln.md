# KHPL Connect — Designregeln (verbindlich)

> Ergänzt [`khpl-ui-shell.md`](./khpl-ui-shell.md) und
> [`khpl-vereinfachung.md`](./khpl-vereinfachung.md). Dort steht die Hülle und
> ihre Slots; hier steht, **wie jeder einzelne Screen auszusehen und zu
> sprechen hat**. Entstanden aus einem visuellen Review aller vier Berufe
> (26.08.2026). Bei Widerspruch zu älteren Dokumenten gilt dieses.
>
> Zielgruppe, die jede Regel trägt: **16-Jährige am Messestand, die von den
> Berufen nichts wissen.** Jeder Screen beantwortet implizit „Wär das was für
> mich?“ — nicht „Hast du das verstanden?“.

## Die vierzehn Regeln

### Layout

**R1 — Jeder Screen ist Bühne + Konsole. Die Bühne ist nie leer.**
Die Bühne (Zeichnung, 3D-Szene, Foto) füllt alles, was die Konsole (Karte mit
Auftrag + Interaktion + Fuß) nicht braucht. Hat ein Step kein Bild, wird die
Konsole vertikal zentriert oder der Titel wird in Display-Größe selbst zur
Bühne. Leerer dunkler Raum über der Karte = kaputt. Prüffrage pro Screen:
„Was steht in der oberen Hälfte?“

**R2 — Bühne und Konsole kollidieren nie.**
Grafiken werden nicht von der Kartenkante abgeschnitten (kein halber
Messkreis, keine amputierte Beschriftung). Entweder vollständig in der
Bühnenzone, oder bewusst und gedimmt **hinter** der Karte durchlaufend.

### Farbe

**R3 — Eine Akzentfarbe = eine Bedeutung, app-weit.**
- **Orange = die Welt.** Fakten, Maße, Zeichnung, Fortschritt,
  Glossar-Markierungen, aufgedeckte echte Werte.
- **Limette = du.** Eingabewert, Slider-Griff, die eine Primärhandlung.
Konsequenzen: Slider-Griff limette (wie sein Wert). Alle Weiter-CTAs limette.
Status-Zeilen („Toleranz gelesen") sind keine Buttons und tragen keine
Button-Form.

### Text

**R4 — Genau ein Anweisungssatz pro Screen.**
Ein Imperativsatz sagt, was zu tun ist. Eine zweite Zeile nur, wenn sie
**neue** Information trägt (Hinweis, Einschränkung) — nie eine Umformulierung.
Maximal eine Ebene Karten-Verschachtelung.

**R5 — Lese-Steps haben ein Wortbudget: ~50 Wörter sichtbar.**
Der Rest liegt hinter den vorhandenen Klappzeilen (Warum-Bereich,
Frage-Akkordeons). Kurze Hauptsätze, ein Gedanke pro Satz. Fotos sind Bühne
(R1), keine Tapete hinter einer deckenden Karte.

**R6 — Die Überschrift verrät nie die Zahl, die gerade geschätzt wird.**
„ZWEIUNDSECHZIG KOMMA FÜNF" über einem laufenden Schätz-Slider löscht den
Aha-Moment — Anfänger ankern auf der einzigen sichtbaren Zahl. Die
ausgeschriebene Zahl ist als Titel der **Auflösung** stark; dort gehört sie
hin. Regel für Texter: Der Titel darf das Thema nennen, nie den gesuchten
Wert.

### Interaktion

**R7 — Eine Slider-Grammatik.**
Rechts = mehr/größer, linear — überall. Ausnahme nur als App-Signatur
(rechts = feiner), dann **überall** und mit Wort-Endpunkten („grob → fein"),
nicht nur Zahlen.

**R8 — Genau ein limettes Element heißt „hier geht's weiter".**
Entweder die Primär-Pille (fester Platz, fester Stil) oder — wenn die Bühne
selbst die Interaktion ist — das antippbare Objekt mit Limette-Affordanz
(Glow/Puls). „Überspringen" immer leise, immer am selben Platz, nie mit
schlechtem Gewissen.

**R9 — Grau hat einen Boden.**
Zwei Graustufen: „lesbar" (≥ ~4,5:1 auf dunklem Grund) für alles
Informative — Zeichnungslinien, Endpunkt-Labels, Hilfetext, Nummern-Chips —
und „dekorativ" nur für echtes Chrome. Eine technische Zeichnung ist Inhalt,
nicht Deko.

### Für Anfänger (die eigentliche Zielgruppe)

**R10 — Echte Artefakte zeigen, eins hervorheben, Unwissen lizenzieren.**
G-Code, Zeichnung, Stückliste bleiben echt — aber pro Step wird genau ein
Element hervorgehoben, der Rest gedimmt, und der Text erlaubt ausdrücklich,
noch nichts zu können („14 Zeilen. Du musst keine davon können.").
Kein unerklärter Fachbegriff auf dem Screen: jeder bekommt den
Glossar-Chip (Orange-Unterstreichung) oder fliegt. Nie zwei neue Begriffe in
einem Satz.

**R11 — Danebenliegen ist Inhalt, nie Versagen.**
Keine Noten, kein Rot, kein „falsch". Die Abweichung wird zum Kompliment an
den Beruf umgemünzt („4-mal so viel — genau deshalb ist das ein Beruf und
kein Hobby."). Überspringen bleibt immer möglich.

**R12 — Jede Zahl bekommt einen Körper-Anker.**
0,06 mm = ein Haar. 62,5 cm ≈ deine Schulterbreite. Ø 20 ≈ ein
Zwei-Euro-Stück. Findet sich kein Anker, den ein 16-Jähriger fühlen kann,
gehört die Zahl wahrscheinlich nicht auf den Screen.

**R13 — Jeder Beruf hat einen „Warum das zählt"-Beat mit echtem Menschen.**
Mindestens eine echte Stimme, ein echtes Foto oder ein echtes Ergebnis
(das Teil im Auto, das Dach auf dem Haus) — mit Bühnen-Prominenz, nicht
hinter einer Karte versteckt. Artefakte beantworten „Was machen die?";
nur Menschen und Ergebnisse beantworten „Will ich das sein?".

**R14 — Meister zu Azubi, nie Lehrer zu Kind.**
Du-Form, Imperativ, trockener Werkstatt-Humor. Zwei Driftrichtungen sind
verboten: akademisch (Definition vor Gebrauch, Passiv, „man") und kindisch
(Ausrufezeichen-Energie, Lob-Inflation). Der beste vorhandene Ton — „Enger
heißt nicht besser, enger heißt teurer" — ist die Messlatte.

## Prioritäten beim Anwenden

R3 und R1 ändern jeden Screen und sind mechanisch (Shell/Komponenten).
R6 ist ein Inhalts-Fix. R4/R5 sind eine Redaktionsrunde. R2, R7, R8, R9
sind Komponenten-Pflege. R10–R14 sind die Redaktions- und Bühnen-Messlatte
für jeden einzelnen Step.
