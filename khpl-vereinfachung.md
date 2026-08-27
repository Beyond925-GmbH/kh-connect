# KHPL Connect — Vereinfachung

> **Stand 25.08.2026: Phase 1 (Hülle) und Phase 2 (die vier Tage) sind
> gebaut.** Was beim Bauen anders kam als geplant, steht als ⚠️-Kasten an Ort
> und Stelle — §4.2, §5, §7.2 und §9. Offen ist Phase 3 (Zusammenzug am Gerät).
>
> Ergänzt `khpl-ui-shell.md` (Hülle) und `khpl-tage.md`
> (Regeln über alle vier Tage). Wo dieser Plan einer der beiden widerspricht,
> gilt dieser Plan — und die Stelle ist unten unter [§8](#8-was-diesem-plan-widerspricht)
> genannt.
>
> Anlass: der Inhalt trägt, die Bedienung nicht. Die App verlangt von einem
> Fünfzehnjährigen im Stehen zu viel Lesen, zu viele Fachwörter und zu oft eine
> Antwort auf eine Frage, die sie vorher nicht beantwortet hat.

---

## 0. Befund — gemessen, nicht geschätzt

### 0.1 Textmenge

Sichtbarer Text je Step (ohne Code-Kommentare, gezählt aus JSX-Textknoten und
deutschen String-Literalen):

| Tag | Mittel | Spitzen |
| --- | --- | --- |
| Dachdecker | 116 Wörter | M7 303 · M4 193 · B4.1 193 |
| Zimmerer | 128 Wörter | C3 264 · C6 257 · C4 255 |
| Zerspanung | 133 Wörter | Z3 333 · Z5 278 · Z2 244 |
| Anlagenmechanik | 145 Wörter | A2 308 · A4 295 · A1 281 |

Ein ganzer Tag liegt bei 1.500–2.000 Wörtern. Das Zeitbudget eines Durchlaufs
sind 3–5 Minuten. Selbst bei ununterbrochenem Lesen und ohne eine einzige
Interaktion ginge das nicht auf — also wird nicht gelesen, und was nicht
gelesen wird, enthält ausgerechnet auch die Anweisung.

### 0.2 Es gibt keinen Platz für „was soll ich tun?“

`StepShell` kennt die Slots `buehne · fachtext · interaktion · aha · fuss`.
Ein Slot für die Aufgabe fehlt. Folge: die Anweisung steht auf jedem Screen
woanders.

| Ort | Beispiel |
| --- | --- |
| letzter Halbsatz des Fachtexts | A6 „… die Inbetriebnahme. **Dreh auf, bis der Druck stimmt.**“ |
| eigene Komponente in der Interaktion | C4 `<Auftrag>` — existiert genau einmal, in einer Datei |
| auf der Bühne | M5 „Zieh, um dich umzuschauen“ |
| gar nicht | C2, C3, Z2, A1, A2 — man erschließt die Aufgabe aus dem Steuerelement |

Fünfzehn bis siebzehn Screens, und auf jedem muss neu gesucht werden, wo die
Aufgabe steht. Das ist die teuerste Einzelbaustelle.

### 0.3 Fachwortdichte

66 Glossareinträge über vier Tage (30 gemeinsam, 16 Zerspanung, 10 Zimmerer,
10 Anlagenmechanik). Die Chips sind gut gebaut, aber sie greifen zu spät: sie
erklären ein Wort erst, nachdem der Leser darüber gestolpert ist, und der Tap
kostet den Faden. Dichteste Stellen:

- **C3**, ein Satz: „Beplankung, Dampfbremse, Ständer mit Dämmung,
  Holzfaserplatte, Fassade.“ Fünf Fachwörter, drei davon Chips.
- **A2**, ein Satz: „Ölkessel, Tank, Verteiler, Pumpe, Ausdehnungsgefäß,
  Thermostatventile.“ Sechs.
- **Z2**, drei Chips in zwei Sätzen, darunter `Werkstücknullpunkt`.

### 0.4 Fragen ohne vorherige Antwort

`M7` ist bereits repariert und ist damit das Vorbild: erst läuft die zweite
Dachhälfte einmal komplett durch, dann spult sie zurück, **dann** wird gefragt.
Der Kommentar in `M7.tsx` benennt den Fehler selbst — „Das war keine Abfrage,
das war Raten.“ Genau das steht anderswo noch:

| Step | Was gefragt wird | Warum das Raten ist |
| --- | --- | --- |
| C2 | Achsmaß 62,5 cm am Regler schätzen | Die Zahl kommt vom Plattenmaß. Das Plattenmaß steht erst in der Auflösung. |
| Z1 | Toleranz am Regler schätzen | Der Haarvergleich, der die Größenordnung setzt, kommt erst danach. |
| Z3 | die falsche Zeile im NC-Programm finden | Setzt Lesen von G-Code voraus. Härteste Frage der App. |
| A1 | drei von sechs Prüfungen wählen | Die sechs sind als Bauteilnamen benannt, nicht als Fragen. |
| A3 | Heizlast am Regler schätzen | Wie C2. |
| B4.1 | „Zieh auf den Anhänger, was mit muss“ | Die Karten tragen Gegenstandsnamen, nicht ihren Zweck. |
| M1 | zehn Checklistenpunkte antippen | Freies Erinnern statt Wiedererkennen. |

**Die Regler-Schätzungen bleiben** (Entscheidung 25.08.2026). Sie sind der
stärkste Moment der jeweiligen Screens. Sie müssen aber vorher **sagen**, dass
geraten wird — siehe [§3](#3-die-ansage).

### 0.5 Zu viel gleichzeitig auf einem Screen

Ein Step-Screen trägt heute bis zu dreizehn Elemente: Zurück, Rail, unsichtbare
Staff-Fläche, Karriere-Link, Titel, Bühne (oft selbst interaktiv), Klappgriff
(„Mehr Platz zum Arbeiten“), Fachtext mit Chip-Popovern, Interaktion,
Rückmeldung, zeitgesteuerter Aha-Einwurf oben rechts, Überspringen,
Primärhandlung. Dazu die Abstecher-Wahl beim Weitergehen.

Zwei davon sind besonders teuer:

- **Der Aha-Einwurf meldet sich auf einer Uhr** (`AhaKarte`/`EinwurfBuehne`:
  erste Pause 4 s, dann 15/22/15/31 s, je 6 s sichtbar) — also **während**
  gearbeitet wird, in einer eigenen Bildschirmecke.
- **Der Klappgriff** ist ein Bedienelement, das erst Sinn ergibt, wenn man
  bereits gemerkt hat, dass das Panel im Weg ist. Er existiert nur, weil das
  Panel 62–84 % der Höhe deckt. Er behandelt das Symptom.

### 0.6 Trichter

Splash → Helm → 4 Fragen → Vorschlag → Berufsliste → Auftragsannahme → erster
Step = **9 Taps bis zum ersten Handwerk.**

---

## 1. Forschungsgrundlage

Vier Befunde, die den Plan tragen:

1. **Worked-Example-Effekt und Fading (Cognitive Load Theory).** Anfänger lernen
   eine komplexe Fertigkeit schneller und behalten sie länger, wenn sie eine
   ausgeführte Lösung studieren, statt selbst ungeführt zu probieren; die Hilfe
   wird danach schrittweise entzogen. Ungeführtes Problemlösen überlastet das
   Arbeitsgedächtnis von Anfängern.
   → **Jeder Abfrage geht eine Vorführung voraus.** M7 macht das schon.
2. **Kiosk-Interaktionen im Ausstellungskontext** (Burmistrov 2015 u. a.):
   Anweisungen müssen deutlich schneller getaktet sein als in gedruckten
   Formaten; der aktive Bereich muss unmissverständlich sein; jede Berührung
   braucht sofortige Rückmeldung. Niemand liest im Stehen einen Absatz.
3. **Jugendliche in Ausstellungen** bevorzugen Machen und Spielmechanik vor
   erzählten Passagen.
4. **Einfache Sprache in der Berufsorientierung** (Berufswahlpass, Materialien
   in Leichter/Einfacher Sprache): ein Gedanke je Satz, kurze Sätze, und das
   Fachwort **nach** dem Alltagswort einführen, nicht an dessen Stelle.

Quellen:
[Worked examples & fading (BJEP 2026)](https://bpspsychub.onlinelibrary.wiley.com/doi/full/10.1111/bjep.12781) ·
[Faded worked examples (ERIC)](https://files.eric.ed.gov/fulltext/EJ1086007.pdf) ·
[Burmistrov, Touchscreen Kiosks in Museums](https://interux.com/publications/Burmistrov-Touchscreen_Kiosks_in_Museums-2015.pdf) ·
[Designing with teenagers (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S2212868922000010) ·
[Berufswahlpass in Einfacher Sprache](https://berufswahlpass.de/site/assets/files/1015/bwp_einfache_sprache_web_barrierefrei.pdf) ·
[Berufs-Orientierung in Leichter Sprache](https://jugend-und-bildung.de/arbeitsmaterial/berufs-orientierung-in-leichter-sprache/)

---

## 2. Drei Regeln

Diese drei stehen über allem, was danach kommt. Sie sind so formuliert, dass
man sie **prüfen** kann — §7 baut ein Skript darauf.

### R1 — Zeigen, dann fragen

Kein Screen fragt nach etwas, das er nicht vorher gezeigt hat. Zulässige
Formen des Zeigens: eine Vorführung auf derselben Bühne (M7), ein früherer
Step desselben Tages (C6 fragt ab, was C3 und C4 gezeigt haben), oder die
Ansage (§3) unmittelbar davor.

**Ausnahme, ausdrücklich:** die vier Regler-Schätzungen (M2, C2, Z1, A3). Dort
*ist* das Danebenliegen die Pointe. Sie müssen es vorher ansagen — dann ist es
keine verdeckte Prüfung mehr, sondern ein Angebot.

### R2 — Alltagswort zuerst, Fachwort als Belohnung

Der Satz sagt die Sache. Das Fachwort kommt danach, als Zugabe:

> ❌ „Dampfbremse innen, Holzfaserplatte außen: die Reihenfolge entscheidet,
> ob das Haus trocken bleibt.“
>
> ✅ „Innen eine Folie, die keine feuchte Luft ins Holz lässt. Außen eine
> Platte, die trotzdem noch atmet. — Die Folie heißt **Dampfbremse**.“

**Höchstens ein Fachwort je Screen**, und nur, wenn es im selben Screen
alltagssprachlich erklärt wurde. Alle 66 Glossareinträge bleiben erhalten;
sie sind gute Inhalte. Sie hören nur auf, Pflichtlektüre zu sein.

### R3 — Ein Screen, eine Handlung, immer an derselben Stelle

Auf jedem Screen steht genau ein Satz, der sagt, was zu tun ist. Er steht in
einem Band, das auf allen Screens denselben Platz hat und nie verschwindet.
Höchstens zwölf Wörter, Imperativ, ein Verb.

---

## 3. Die Ansage

> Die ausdrückliche Anforderung: *„Bevor wir irgendetwas machen, das nicht ultra
> intuitiv ist, will ich diesen Schülern sagen: hey, das passiert jetzt.“*

Neue Komponente `komponenten/Ansage.tsx`. Sie legt sich über die abgedunkelte
Bühne, **bevor** eine Interaktion beginnt, und besteht aus drei Teilen:

```
┌────────────────────────────────────┐
│                                    │
│   (Bühne, abgedunkelt, mit einer   │
│    geisterhaften Hand, die die     │
│    Geste einmal vormacht — Schleife)│
│                                    │
│  ┌──────────────────────────────┐  │
│  │ DAS PASSIERT JETZT           │  │
│  │                              │  │
│  │ Du ziehst die Leitung von    │  │  ← was passiert (≤ 20 Wörter)
│  │ der Pumpe zum Verteiler.     │  │
│  │                              │  │
│  │ Der kürzeste Weg ist nicht   │  │  ← optional: was der Haken ist
│  │ immer der beste.             │  │
│  │                              │  │
│  │            [ Alles klar ]    │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**Regeln:**

1. **Ein Tap kostet sie, nicht mehr.** Der Tap auf „Alles klar“ ist zugleich
   der Tap, mit dem die Übung beginnt. Wer weiß, was er tut, verliert nichts.
2. **Die Geisterhand bleibt.** Nach dem Wegtippen läuft die Vorführung der
   Geste blass auf der Bühne weiter, bis der Finger sie zum ersten Mal
   berührt. Das ist der Teil, der ohne Text funktioniert.
3. **Sie erscheint je Geste, nicht je Screen.** Fünf Gesten in der ganzen App:
   `tippen · ziehen-frei · ziehen-regler · ziehen-karte · drehen`. Ist eine
   Geste in dieser Sitzung schon angesagt worden, kommt sie nicht wieder.
   Praktisch: **zwei bis drei Ansagen je Tag**, nicht fünfzehn.
   Zustand in `store/fortschritt.ts`: `gelernteGesten: Geste[]`, an der
   Sitzung, nicht am Beruf — wer den Beruf wechselt, lernt Ziehen nicht neu.
4. **`tippen` bekommt nie eine Ansage.** Antippen ist die eine Geste, die
   keine Erklärung braucht. Sie steht in der Liste, damit `Ansage` sie
   ausdrücklich ablehnen kann statt sie zu vergessen.
5. **Die Regler-Schätzungen sagen das Raten an.** Fester Wortlaut, überall
   gleich: *„Rate ruhig. Fast alle liegen daneben — genau das ist der Punkt.“*

**Warum das kein Tutorial-Screen am Anfang ist.** Eine Erklärung, die fünf
Screens vor ihrer Anwendung steht, ist vergessen, bevor sie gebraucht wird —
und sie verlängert den Trichter, den §5 gerade kürzt. Die Ansage steht
unmittelbar davor, an der Bühne, an der sie gilt.

---

## 4. Die neue Bühne — Layout

Der heutige Aufbau behandelt Panel und Bühne als Konkurrenten um dieselbe
Fläche und löst den Konflikt mit Deckeln (62 % / 84 %), einem Klappgriff, zwei
Textfassungen je Step (`useSchmal`, in zwölf Steps) und einem Überlaufverlauf
mit eigener Messlogik. Das ist viel Maschinerie für ein Problem, das
verschwindet, sobald das Panel klein ist.

**Die Änderung, an der alles hängt: der Fachtext ist nicht mehr der
Standardinhalt des Panels. Der Auftrag ist es.**

### 4.1 Aufbau (hochkant, das Messe-iPad)

```
┌──────────────────────────────────┐
│  ‹        ●●●○○○○○○              │   Leiste, schwebend — Zurück + Rail
│                                  │
│                                  │
│            B Ü H N E             │   ~62 % — die Sache selbst,
│                                  │   oft die Interaktion
│                                  │
│                                  │
│   DER STAPEL STEHT SCHON DA      │   Titel auf der Bühne (bleibt)
│  ┌────────────────────────────┐  │
│  │ ▸ Warum das so ist         │  │   zu. Eine Zeile. (war: Fachtext)
│  ├────────────────────────────┤  │
│  │ DAS MACHST DU JETZT        │  │   Etikett
│  │ Tipp deinen Balken an.     │  │   ≤ 12 Wörter, groß
│  └────────────────────────────┘  │
│   Überspringen      [ Weiter → ] │   Fuß — unverändert
└──────────────────────────────────┘
```

Das Panel ist damit rund **drei Zeilen hoch statt 62–84 % des Screens.** Die
Bühne bekommt den Rest, ohne dass jemand einen Griff findet muss.

### 4.2 Was daraus folgt

> ⚠️ **Zwei Abweichungen beim Bauen**, beide bewusst:
>
> 1. **Die Überlaufmessung bleibt** (`messeUeberlauf`, ResizeObserver +
>    MutationObserver). Der Plan wollte sie streichen. Sie ist aber korrekt und
>    hat eine Geschichte — `scrollHeight` zählt Antons Oberlängen mit, deshalb
>    wird am letzten Kind gemessen. Funktionierenden Code zu löschen, um eine
>    Zeilenzahl zu treffen, ist ein schlechter Tausch. Sie umfasst jetzt nur
>    noch die Interaktion; der Auftrag scrollt nie weg.
> 2. **`karteBreit` bleibt.** Es regelt die Spaltenbreite **quer**, nicht die
>    Höhe, und war nie Teil des Problems. Es zu entfernen hätte zehn Dateien
>    ohne Gewinn für den Besucher angefasst.
>
> `StepShell.tsx` geht damit von 659 auf 462 Zeilen und von zwölf auf zehn
> Props — nicht auf die im Plan geschätzten ~300/6.

| Was | Wird | Warum |
| --- | --- | --- |
| **`auftrag`** | **neuer Slot, in `StepShell` erforderlich** | Der Kern. Siehe 4.3. |
| `fachtext` | → `warum`, in einer standardmäßig **geschlossenen** Klappzeile | Er ist Vertiefung, nicht Aufgabe. Wer wissen will, warum, tippt. |
| `aha` | wandert **in dieselbe Klappzeile**, öffnet sich dort einmal von selbst, sobald gelöst | Kein zweiter Bildschirmbereich, keine Uhr, kein Wettbewerb mit der laufenden Arbeit. |
| `EinwurfBuehne` + der ganze Taktapparat (`ERSTE_PAUSE`, `PAUSEN`, `ANZEIGE`) | **entfällt** | ~90 Zeilen. |
| `Klappgriff`, `buehnePlatz`, `einklappbar`, `karteBreit`, `eingeklapptBreite` | **entfallen** | Behandelten alle dasselbe Symptom. |
| `panelHoehe` (62 % / 84 %) | **entfällt** | Das Panel bemisst sich am Inhalt. |
| Überlaufmessung (`messeUeberlauf`, `ueberlauf`, `scrollbar`, ResizeObserver + MutationObserver) | **entfällt** | Ein dreizeiliges Panel läuft nicht über. |
| `shell/schmal.ts` + `useSchmal` in 12 Steps | **entfällt** | Zwei Textfassungen je Step waren nur nötig, weil zu viel Text im Panel stand. |
| `SichtfeldMesser` | **bleibt** | Die Kamera muss weiterhin wissen, wie viel Fläche ihr bleibt — sie bekommt jetzt mehr. |
| Titel auf der Bühne | **bleibt** | Trägt den Charakter des Produkts. |

Geschätzt: `StepShell.tsx` geht von 659 auf ~300 Zeilen, die Prop-Fläche von
zwölf auf sechs.

### 4.3 Der Trick: erforderliche Props

Der Grund, warum die Anweisung heute fehlt, ist, dass man sie weglassen kann.
Also darf man das nicht mehr:

```ts
export function StepShell({
  id,
  buehne,
  /** Ein Satz, Imperativ, ≤ 12 Wörter. `null` nur für reine Lese-Steps. */
  auftrag,          // string | null   — ERFORDERLICH
  /** Die Ansage vor der Interaktion. `null` = braucht keine. */
  ansage,           // { geste: Geste; text: string; haken?: string } | null — ERFORDERLICH
  warum,            // React.ReactNode — die frühere `fachtext`
  interaktion,
  aha,
  fuss,
  buehneInteraktiv,
  titelZusatz,
}: …)
```

`auftrag: null` und `ansage: null` sind ausdrückliche Entscheidungen, keine
Auslassungen. TypeScript zwingt alle 57 Steps, sich zu erklären — das ist die
einzige Durchsetzung, die über vier parallel arbeitende Tage hinweg hält.

### 4.4 Ein Kasten, der sich nur füllt, nie bewegt

Solange die Übung offen ist, steht im Auftragsband die Anweisung. Ist sie
gelöst, wird **derselbe Kasten an derselben Stelle** durch die Rückmeldung
ersetzt (`Wechsel`, existiert bereits). Das Panel wächst nicht, springt nicht,
und die Aufmerksamkeit bleibt, wo sie war.

Heute wächst das Panel beim Lösen — genau in dem Moment, in dem der Screen
fertig ist.

---

## 5. Trichter

> ⚠️ **Beim Bauen korrigiert.** Der Plan versprach „9 → 7 Taps" und eine
> Kürzung von vier auf drei Fragen. Beides war falsch, und beides ist gemessen
> worden statt geschätzt — siehe 5.1 und 5.2. Gebaut ist: **Vorschlag
> aufgelöst, vier Fragen bleiben.**

- `shell/Vorschlag.tsx` **entfällt als eigener Screen.** Der Treffer wird die
  erste, hervorgehobene Karte auf der **Berufsliste** — mit derselben
  Begründung, die heute auf S0.3 steht, im Kartenkopf. Alle vier Berufe
  bleiben nebeneinander sichtbar; wer den Vorschlag ignorieren will, sieht die
  Alternativen im selben Blick statt einen Screen später.
- `store/fortschritt.ts`: `zeigeVorschlag()` entfällt, `Fragen` geht direkt auf
  `zeigeBerufe()`. Der Kaltstart-Sonderfall („ohne Aussage kein Vorschlag“,
  ui-shell §2) löst sich damit von selbst auf — ohne Antworten hat die
  Berufsliste eben keine hervorgehobene Karte.

Betroffen: `shell/Berufsliste.tsx`, `shell/Fragen.tsx`, `shell/Vorschlag.tsx`
(gelöscht), `store/fortschritt.ts`, `KhplApp.tsx`, `khpl-ui-shell.md` §2/§3.

### 5.1 Die vier Fragen bleiben — gemessen

Der Plan wollte eine Frage streichen. Ein Durchlauf über **alle** 256
Antwortkombinationen (inklusive Überspringen) gegen die echten Merkmalsprofile
der vier Berufe sagt: **jede der vier trägt eine eigene Trennung, die keine
andere ersetzt.**

| Ohne … | Was kaputtgeht |
| --- | --- |
| `hoehe` | Höhenängstliche („Lieber Boden unter den Füßen") landen in **49 %** statt 23 % der Fälle auf einem Dachberuf. Genau der Fall, gegen den der Kommentar in `fragen.ts` die negative Gewichtung gesetzt hat. |
| `ort` | Hallen-Typen landen in **51 %** statt 27 % bei einem Draußen-Beruf. |
| `dach` | Zimmerer und Dachdecker werden ununterscheidbar: aus 41 %/17 % bei „Tragwerk" und 25 %/58 % bei „Hülle" wird zweimal dasselbe 19 %/30 %. |
| `ergebnis` | Die Verteilung kippt auf Dachdecker (46 % statt 29 %), und der Sieger ändert sich in **39 %** aller Kombinationen — der größte Einzelschaden. |

Vier Fragen kosten vier Taps und liefern vier Trennungen. Die Kürzung wäre
gespartes Tempo gegen bezahlte Genauigkeit gewesen, und der Trichter ist nicht
die Stelle, an der diese App zu lang ist — die Steps sind es.

### 5.2 Was der Umbau am Trichter wirklich bringt

Ehrlich gerechnet, auf dem **kürzesten** Weg zum ersten Handwerk:

| | vorher | nachher |
| --- | --- | --- |
| Direkt („Los geht's" im Vorschlag) | 8 Taps | 8 Taps |
| Über „alle vier ansehen" | 9 Taps | 8 Taps |
| Screens im Trichter | 5 | 4 |

Der Gewinn ist also **ein Screen weniger und ein Tap für den, der vergleichen
will** — nicht die versprochenen zwei. Der eigentliche Gewinn ist inhaltlich:
Vorschlag und Alternativen stehen im selben Blick statt hintereinander, und
„Dicht dahinter" ist ein Etikett auf der Karte, die es meint, statt ein
Nachsatz auf einem Screen davor.

---

## 6. Übung für Übung

Die Bühnen (3D-Modelle, Zeichnungen, Fotos) bleiben, wie sie sind — sie sind
das Beste an der App. Geändert wird, was **gefragt** wird und **wie es dasteht**.

### Dachdecker

| Step | Heute | Neu |
| --- | --- | --- |
| M1 | Zehn Checklistenpunkte antippen — freies Erinnern | Auf sechs kürzen, drei davon vorab angehakt („das hat dein Chef schon eingepackt“). Wiedererkennen statt Erinnern. |
| M2 | Regler „Was kostet dieses Dach?“ | Bleibt. Ansage: Rate-Formel. |
| M3 | Lesen | `auftrag: null`. Fachtext → `warum`. |
| M4 | Schnittlinie auf ein vorgegebenes Maß ziehen | Bleibt — das Maß steht dabei, es ist Motorik, kein Wissen. Ansage `ziehen-frei`. |
| M5 | Geführtes Durchtippen | Bleibt. **Das ist das Worked Example zu M7.** |
| B4.1 | „Zieh auf den Anhänger, was mit muss“ | Karten tragen künftig ihren **Zweck** statt ihres Namens („zum Sichern gegen Absturz“ statt „PSAgA“); der Name kommt in der Auflösung. |
| M7 | Vorführen → zurückspulen → abfragen | **Unverändert. Vorbild für alle anderen.** |
| M8–M10 | Lesen / Recap | `auftrag: null`. |

### Zimmerer

| Step | Heute | Neu |
| --- | --- | --- |
| C1 | Balken aus dem Stapel suchen | Bleibt. Auftrag: „Such dein Holz. Tipp es an.“ |
| C2 | Achsmaß 62,5 am Regler raten | Bleibt (Rate-Regler). Ansage nennt vorher den Anker: *„Eine Gipsplatte ist 125 cm breit. Wo stehen die Ständer?“* — damit ist es geschätztes Rechnen statt blindes Raten, und die Pointe bleibt. |
| C3 | Fünf Schichten, drei Chips, ein Satz | Nach R2 neu: jede Schicht über ihre **Aufgabe** benannt, Fachwort einzeln nachgereicht. Höchstens ein Chip. |
| C4 | Rahmen wählen — Kopfrechnen an Etiketten | Die Fuge wird auf der Bühne **sichtbar bemaßt**, während man einen Rahmen antippt. Räumlich statt rechnerisch. Übung bleibt. |
| C6 | Welche Seite nach außen, wo ist oben | **Unverändert.** Fragt ab, was C3 und C4 gezeigt haben — R1 ist erfüllt. Ansage `drehen`. |
| C5, C7, C8.x, C9 | Lesen | `auftrag: null`. |

### Zerspanung

| Step | Heute | Neu |
| --- | --- | --- |
| Z1 | Toleranz am Regler raten | Bleibt. Der **Haarvergleich wandert in die Ansage** statt in die Auflösung — er setzt die Größenordnung, ohne die Antwort zu verraten. |
| Z2 | Vier Handgriffe durchtippen | Bleibt (Worked Example). Namen entschärfen: „Werkstücknullpunkt setzen“ → „Der Maschine sagen, wo das Teil steht“, Fachwort darunter. |
| Z3 | Falsche Zeile im NC-Programm finden | **Härteste Stelle der App.** Umdrehen: Programm laufen lassen → das Werkzeug fährt sichtbar an der Kontur vorbei ins Leere → **dann** fragen „Welche Zeile war das?“, mit drei markierten Verdächtigen statt des ganzen Programms. Erst der Effekt, dann die Ursache. |
| Z4 | Messraum, Lesen | `auftrag: null`. |
| Z5 | Messschraube zuziehen | Bleibt. Ansage `ziehen-regler`. |
| Z6–Z8 | Lesen | `auftrag: null`. |

### Anlagenmechanik

| Step | Heute | Neu |
| --- | --- | --- |
| A1 | Drei von sechs Prüfungen wählen | Die sechs werden als **Fragen** formuliert statt als Bauteilnamen: „Ist der Speicher überhaupt warm?“ statt „Speicherfühler prüfen“. Dann ist es Nachdenken statt Vokabelwissen — und die Signaturübung des Berufs bleibt intakt. |
| A2 | Sechs Bauteile in einem Satz | Kein Quiz. Antippen zum Aufdecken, ein Bauteil = ein Satz = ein Zweck. Der Satz mit den sechs Nomen entfällt ersatzlos. |
| A3 | Heizlast am Regler raten | Bleibt. Ansage: Rate-Formel. |
| A4 | Leitung ziehen | Bleibt — beste räumliche Übung des Tages. Ansage `ziehen-frei`. |
| A6 | Druck aufdrehen | Bleibt. Ansage `ziehen-regler`. |
| A7 | Dem Kunden verständlich erklären | **Bleibt und wird hervorgehoben.** Das ist die einzige Übung der App, die genau das trainiert, worum es in diesem Plan geht. Kandidat für ein sichtbareres Ende des Tages. |
| A5, A8.x, A9 | Lesen | `auftrag: null`. |

---

## 7. Sprache — Budgets und ein Prüfskript

### 7.1 Budgets je Screen

| Element | Höchstens |
| --- | --- |
| `auftrag` | 12 Wörter, ein Satz, ein Verb im Imperativ |
| `ansage.text` | 20 Wörter |
| `ansage.haken` | 15 Wörter |
| `warum` | 40 Wörter, 3 Sätze |
| `aha` | 35 Wörter |
| Rückmeldung | 20 Wörter |
| **Sichtbar ohne einen einzigen Tap** | **25 Wörter** (Titel + Auftrag) |
| **Ein Absatz am Stück** | **30 Wörter** |
| **Gesamt je Step, alle Ebenen** | **90 Wörter** (nur linear, s. u.) |

Heute: Mittel 130, Spitze 333. Ziel 90 heißt rund **ein Drittel weniger Text
über die ganze App**, und der Rest steht an einer vorhersagbaren Stelle.

Weitere Regeln: höchstens ein Fachwort **je Absatz** (R2); keine Aufzählung von
mehr als drei Dingen in einem Satz; Sätze bis 15 Wörter.

> ⚠️ **Beim Bauen korrigiert: die 90 Wörter gelten nicht für jeden Screen.**
>
> Ein verzweigter Screen trägt alle Alternativen in seiner Datei, ein Besucher
> liest aber nur einen Weg davon. A1 hat sechs Prüfungen mit je einem Befund
> und kommt so auf 430 Wörter — gesehen werden drei, und **kein einzelner
> Absatz ist länger als 29 Wörter**. Die 90 zu erzwingen hieße dort,
> funktionierende Verzweigung zu zerstören, um eine Zahl zu treffen.
>
> Maßgeblich ist deshalb **der einzelne Absatz: höchstens 30 Wörter**, und
> **höchstens ein Fachwort darin**. Das ist die Zahl, die am Stand wirklich weh
> tut. Beide Regeln sind seit dem Umbau **überall eingehalten**; die
> Dateisumme steht weiter im Bericht, aber als Hinweis, nicht als Urteil.

### 7.2 `pnpm pruefe:sprache`

> ⚠️ **Das Skript hat sich zuerst selbst getäuscht, und das ist der Grund,
> warum es diesen Absatz gibt.** Die erste Fassung las alles zwischen `>` und
> `<` plus jedes lange String-Literal. In einer TSX-Datei heißt das:
> `for (let i = a.length - 1; i > 0; i--)` lieferte „0; i-" als „Text", und
> auf M7 waren **45 der angeblich 332 Wörter** eine einzige
> `useSensors`-Zeile. Das Skript maß Codemenge statt Textmenge und hätte die
> Kürzungsarbeit an den falschen Screens angesetzt.
>
> Zwei Anläufe später steht die Regel, die trägt: Textknoten und Literale
> einsammeln, an eingebetteten Ausdrücken **zerteilen** statt sie zu löschen
> (die Prosa steht in diesem Repo fast vollständig *innerhalb* von `{…}`), und
> mit einem groben Prosa-Filter alles verwerfen, was nach Quelltext aussieht.
> Nachzulesen in `src/khpl/sprache.pruefung.ts`.

Ein Skript in der Machart des vorhandenen `pruefe:kamera`
(`src/drei/kamera.pruefung.ts`, gestartet über `jiti`, eigene
`tsconfig.pruefung.json`). Es liest die Step-Dateien, zieht `auftrag`,
`ansage`, `warum`, `aha` heraus und bricht ab bei:

- Budgetüberschreitung nach 7.1
- mehr als einem Chip je Screen
- `auftrag`, der nicht mit einem Verb beginnt
- einem Fachwort aus dem Glossar, das im selben Screen nicht alltagssprachlich
  erklärt wird (Wortliste, prüfbar gegen `glossar/*.ts`)

Es ist der Grund, warum vier parallel arbeitende Agenten dasselbe Produkt
abliefern und nicht vier. In `pnpm check` aufnehmen.

Ergänzend: `german-orthography` über alle geänderten Texte laufen lassen (ae/oe/ue/ss).

---

## 8. Was diesem Plan widerspricht

Diese Stellen in den bestehenden Specs werden durch den Umbau ungültig und sind
**mit** dem Umbau nachzuziehen, nicht danach:

- `khpl-ui-shell.md` §5, Slot-Tabelle: „Fachtext“ als zweiter Slot,
  Aha-Karte „erscheint nach der Interaktion“ in eigener Fläche.
- `khpl-ui-shell.md` §2/§3: S0.3 Vorschlag als eigener Screen.
- `README.md` „Ein Layout, nicht drei“: beschreibt das Panel als Träger von
  Fachtext, Interaktion, Aha und Fuß.
- Die JSDoc-Blöcke in `StepShell.tsx`, die die Entstehung des heutigen Panels
  begründen — sie sind ein gutes Protokoll und sollen um diesen Schritt
  fortgeschrieben, nicht gelöscht werden.

Nicht angetastet: `src/dachstuhl/` (schreibgeschützt), `src/drei/` (nur
additiv), die Regel, dass `three` nie statisch importiert wird, und die
Belegpflicht aus `khpl-tage.md` §0b — **kein neuer Satz mit einer Zahl, die
nicht in `belege/` steht.** Vereinfachen heißt kürzen, nicht erfinden.

---

## 9. Reihenfolge

### Phase 1 — Hülle ✅ gebaut (25.08.2026)

Alles Weitere hängt daran, deshalb allein und am Stück:

1. `komponenten/Ansage.tsx` (neu) + `Geste`-Typ + `gelernteGesten` im Store
2. `komponenten/Auftragsband.tsx` (neu) + `komponenten/Warum.tsx` (neu)
3. `StepShell.tsx` umbauen: neue Props, alte Maschinerie raus (4.2)
4. `AhaKarte.tsx`: `EinwurfBuehne` raus, Darstellung in `Warum`
5. Trichter (§5): `Vorschlag` auflösen, 4 → 3 Fragen
6. `pruefe:sprache` schreiben, in `pnpm check`
7. **Zwei Steps als Referenz von Hand umbauen** — aus einem wurden zwei, weil
   ein Muster fehlte:
   - **C4** zeigt Auftragsband, Warum-Zeile und den Einwurf darin. Seine Geste
     ist `tippen`, also hat es ausdrücklich **keine** Ansage — es kann das
     Muster gar nicht vorführen.
   - **A4** zeigt die Ansage. Freies Ziehen ist die am wenigsten
     selbsterklärende Geste der vier Tage.
8. Am Gerät ansehen, quer und hoch. Erst dann Phase 2.

**Was Phase 1 mit den 52 Step-Dateien gemacht hat.** Mechanisch: `fachtext=`
heißt `warum=`, `buehnePlatz`/`einklappbar` sind raus, und jeder Aufruf trägt
`auftrag={null}` / `ansage={null}` mit einem `TODO(vereinfachung)` daneben. Die
Warum-Zeile kommt **aufgeklappt** an, solange `auftrag === null` ist — sonst
verstecken die Steps ihre Anweisung, die ja noch im Fachtext steht. Damit heilt
sich die Migration selbst: sobald ein Step seinen Auftrag deklariert, klappt
sein Warum zu.

Spezifikationen (`khpl-ui-shell.md`, `README.md`) am Ende von Phase 1
nachziehen, nicht am Ende des ganzen Projekts — die Agenten in Phase 2 lesen sie.

### Phase 2 — Vier Tage ✅ gebaut (25.08.2026)

> ⚠️ **Nicht parallel, sondern seriell — und das war nicht die Absicht.** Die
> vier Agenten sind alle vier binnen Minuten am Sitzungslimit gestorben, bevor
> einer eine Step-Datei angefasst hatte; überlebt hat eine Messtabelle. Danach
> ist der Umbau von Hand gemacht worden, Tag für Tag. Der Auftrag an die
> Agenten steht weiterhin in `belege/umbau-auftrag.md` — er beschreibt
> unverändert, was zu tun war.

**Was daraus geworden ist:**

- Alle **52 Steps** deklarieren `auftrag` und `ansage` ausdrücklich: 28 mit
  einer echten Anweisung, 24 als bewusste Lese-Screens (`null`).
- **11 Ansagen**, verteilt auf vier Gesten. Da sie je Geste erscheinen, sieht
  ein Besucher davon zwei bis drei je Tag.
- **Kein Absatz über 30 Wörter** mehr, in keinem der vier Tage. Vorher: 35
  Stück, der längste 65 Wörter (Z4).
- **Kein Absatz mit mehr als einem Fachwort** mehr. Vorher: 13 Blöcke, darunter
  C3 mit fünf Schichtnamen und drei Chips in einem Satz.
- **Die doppelten Textfassungen (`useSchmal`) sind weg**, wo sie Prosa
  doppelten — A1, C2, C3, C6, Z1, Z2, Z3, A3.1. Behalten wurden die acht
  Stellen, an denen `schmal` echte **Layout**-Entscheidungen innerhalb der
  Interaktion trifft (Platzierung des Ergebnisfelds, kurze Knopfbeschriftungen)
  — das ist keine gedoppelte Copy.

### Der ursprüngliche Plan für Phase 2 (zur Wiederverwendung)

Ein Agent je Beruf, in eigenem Worktree, mit identischem Auftrag:
diesem Plan (§2, §6, §7), dem umgebauten C4 als Muster und `pruefe:sprache`
als Abnahmetor. Nach `~/.claude/CLAUDE.md` sind das **user-facing Copy und
UI — Taste ≥ 7**, also **Opus**: Fable-5 ist verbraucht, gpt-5.5 bis
11.09.2026 ohne Kontingent (und für deutsche Texte ohnehin die falsche Wahl),
Haiku nie. Sonnet-5 liegt mit Taste 7 auf der Grenze — es reicht für die
mechanischen Anteile (Props umstellen, `useSchmal` ausbauen), nicht für die
Neutextung. Wo ein Tag überwiegend mechanisch ist, darf Sonnet die Mechanik
machen und Opus die Texte nachziehen; im Zweifel Opus.

Jeder Agent schreibt seine Befunde **laufend** in `belege/umbau-<beruf>.md`
(nicht erst am Ende) — sonst geht bei einem langen Lauf alles verloren.

| Agent | Steps | Schwerpunkt |
| --- | --- | --- |
| Dachdecker | M1–M10 + 6 Abstecher | M1 Checkliste, B4.1 Karten |
| Zimmerer | C1–C9 + 6 | C3 Schichten, C4 Bemaßung |
| Zerspanung | Z1–Z8 + 5 | **Z3 umdrehen** — der aufwendigste Einzelscreen |
| Anlagenmechanik | A1–A9 + 5 | A1 als Fragen, A2 entrümpeln |

### Phase 3 — Zusammenzug

1. Ein Durchgang, der **alle Aufträge aller vier Tage nebeneinander** liest:
   gleicher Ton, gleiche Satzform, keine vier Dialekte.
2. `german-orthography` über alle geänderten Texte.
3. `pnpm check` + `pnpm pruefe:sprache` + `pnpm build`
   (die `three`-Chunk-Regel aus `README.md` gilt unverändert).
4. Vier vollständige Durchläufe am iPad, hoch und quer.

---

## 10. Woran man merkt, ob es funktioniert hat

Prüfbar ohne Nutzertest:

- **Kein Absatz über 30 Wörter** und **kein Absatz mit mehr als einem
  Fachwort** (Skript). ✅ erfüllt.
- Jeder Step hat `auftrag` und `ansage` ausdrücklich gesetzt (Compiler).
  ✅ erfüllt — 28 mit Anweisung, 24 bewusst ohne.
- Die Dateisumme je Step ist **kein** Abnahmekriterium, siehe §7.1.
- Kein Screen fragt nach etwas, das nicht vorher gezeigt wurde (§6 Tabelle,
  von Hand abgenommen).
- Panelhöhe im Ruhezustand klein statt gedeckelt. Gemessen auf dem iPad
  hochkant: **34–41 %** je nach Step (A4 34, C2 38, M1 41) statt der früheren
  Deckel von 62–84 %. Die 25 % aus dem Plan waren zu optimistisch — ein Panel
  aus Warum-Zeile, Auftrag und Fuß braucht mehr.
- 8 Taps von Splash bis zum ersten Handwerk, ein Trichter-Screen weniger
  (§5.2 — der Plan versprach hier zu viel).

Prüfbar nur am Stand — und deshalb am Messetag mitzuschreiben:

- Wie oft wird „Überspringen“ gedrückt, statt eine Übung zu lösen.
- Wie viele Durchläufe erreichen M10/C9/Z8/A9.
- Ob jemand nach dem Weglegen ein Fachwort **benutzt**. Das ist der eigentliche
  Zweck: nicht dass sie es gelesen haben, sondern dass sie es sagen können.
