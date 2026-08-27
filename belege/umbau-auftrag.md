# Umbau der vier Tage — der gemeinsame Auftrag (Phase 2)

> Gilt für alle vier Agenten wörtlich gleich. Wer hiervon abweicht, muss den
> Grund in seine Befunddatei schreiben.
>
> Grundlage: [`khpl-vereinfachung.md`](../khpl-vereinfachung.md) §2 (die drei
> Regeln), §6 (Übung für Übung), §7 (Budgets). **Lies die zuerst, ganz.**

## Was Phase 1 schon gebaut hat

- `StepShell` hat zwei **erforderliche** neue Angaben: `auftrag` und `ansage`.
  Heute steht in deinen Steps überall `auftrag={null}` / `ansage={null}` mit
  einem `TODO(vereinfachung)` daneben. Genau das ist deine Arbeit.
- `fachtext` heißt jetzt `warum` und liegt hinter einer **geschlossenen**
  Klappzeile. Solange `auftrag === null` ist, kommt sie aufgeklappt an — sobald
  du den Auftrag setzt, klappt sie zu. Alles, was heute im `warum` steht und
  eine Anweisung ist, gehört also in den `auftrag`, sonst verschwindet es.
- Die Aha-Karte erscheint in derselben Klappzeile, sobald die Übung gelöst ist.
  `<AhaKarte sichtbar eyebrow="…">` bleibt unverändert — nichts zu tun.
- `useSchmal` / `shell/schmal.ts` ist **abzuschaffen**, wo du es antriffst: es
  gab zwei Textfassungen je Step, weil das Panel zu voll war. Ist es nicht
  mehr. **Behalte die kurze Fassung** — sie war ohnehin die bessere.

## Zwei Referenz-Steps. Lies beide, bevor du anfängst.

- `src/khpl/steps/zimmerer/C4.tsx` — Auftragsband, Warum-Zeile, Einwurf darin,
  `useSchmal` ausgebaut, eine Dopplung entfernt (die große Frage im Panel war
  dieselbe Aufforderung wie das Auftragsband).
- `src/khpl/steps/anlagenmechanik/A4.tsx` — die Ansage.

## Die Regeln, kurz

1. **Zeigen, dann fragen.** Kein Screen fragt nach etwas, das er nicht vorher
   gezeigt hat. `M7.tsx` ist das gebaute Vorbild (vorführen → zurückspulen →
   abfragen). Ausnahme: die vier Rate-Regler, die es ansagen müssen.
2. **Alltagswort zuerst, Fachwort als Belohnung.** Höchstens **ein**
   `<Begriff>`/`<Fachwort>` je Screen, und nur, wenn derselbe Screen die Sache
   vorher alltagssprachlich gesagt hat.
3. **Ein Screen, eine Handlung.** `auftrag`: ein Satz, Imperativ, ein Verb,
   ≤ 12 Wörter. Gelöst → `auftrag={null}`, damit die Rückmeldung an seine
   Stelle rückt.

## Budgets (`pnpm pruefe:sprache` prüft sie)

| | ≤ |
| --- | --- |
| `auftrag` | 12 Wörter, ein Satz |
| `ansage.text` | 20 Wörter |
| `ansage.haken` | 15 Wörter |
| `warum` | 40 Wörter, 3 Sätze |
| Aha-Karte | 35 Wörter |
| Rückmeldung | 20 Wörter |
| **ganzer Step, alle Ebenen** | **90 Wörter** |

## Die Ansage

`ansage={{ geste, text, haken? }}` oder `ansage={null}`.

- Gesten: `tippen` · `ziehen-frei` · `ziehen-regler` · `ziehen-karte` ·
  `drehen` (`src/khpl/komponenten/gesten.ts`).
- **`tippen` bekommt nie eine Ansage** → dort `ansage={null}`. Das ist eine
  Entscheidung, keine Lücke.
- Sie erscheint **je Geste, nicht je Screen**: hat der Besucher `ziehen-regler`
  einmal gesehen, kommt sie nicht wieder. Schreib sie trotzdem an **jeden**
  Step mit dieser Geste — welcher zuerst dran ist, weißt du nicht.
- Für die Rate-Regler: `haken: RATEN_HAKEN` aus `gesten.ts` importieren, nicht
  abtippen. Der Wortlaut muss auf allen vier Tagen derselbe sein.
- `text` sagt, was **im Beruf** passiert, nicht was der Finger tut. „Du
  verlegst die Leitung selbst" — nicht „ziehen Sie mit dem Finger".

## Harte Grenzen

- **Keine erfundenen Zahlen.** `khpl-tage.md` §0b: was in `belege/` nicht
  belegt ist, steht auf keinem Screen. Kürzen heißt kürzen, nicht umdichten.
  Im Zweifel: Satz streichen, nicht Zahl ändern.
- **Fass nur deine eigenen Dateien an.** Erlaubt: `src/khpl/steps/<dein
  beruf>/**` und `src/khpl/glossar/<dein beruf>.ts`. **Verboten** (drei andere
  Agenten arbeiten gleichzeitig): `src/khpl/shell/**`,
  `src/khpl/komponenten/**`, `src/khpl/store/**`, `src/khpl/flow/**`,
  `src/khpl/berufe/**`, `src/khpl/buehne/**`, `src/khpl/glossar/begriffe.ts`,
  `src/index.css`, `package.json`, alle `*.md` im Wurzelverzeichnis. Brauchst
  du dort eine Änderung: **melden, nicht bauen.**
- **Kein `pnpm format`** — das schreibt das ganze Repo um, während drei andere
  darin arbeiten. Nur `npx prettier --write src/khpl/steps/<dein beruf>`.
- Bühnen (3D-Modelle, Zeichnungen) bleiben, wie sie sind. Geändert wird, was
  **gefragt** wird und **wie es dasteht** — nicht, wie es aussieht.

## Befunde laufend mitschreiben

Leg `belege/umbau-<dein beruf>.md` an und **schreib nach jedem Step hinein**,
nicht erst am Ende: welcher Step, welcher `auftrag`, welche `ansage`, was du
gekürzt hast, und was du melden musst statt es zu bauen. Ein langer Lauf, der
seine Ergebnisse nur im Kopf hat, verliert sie.

## Fertig ist es, wenn

```bash
pnpm typecheck                                  # grün
npx prettier --write src/khpl/steps/<beruf>     # geschrieben
pnpm pruefe:sprache                             # kein Abbruch, und deine
                                                # Steps stehen nicht mehr unter
                                                # „Ohne Auftragszeile"
```

und jeder deiner Steps im Bericht von `pruefe:sprache` unter 90 Wörtern liegt.
