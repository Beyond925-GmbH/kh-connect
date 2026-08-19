# 2KH Connect — App

React + Vite + TypeScript, Tailwind v4, shadcn-style components on **Base UI**
(`@base-ui/react`).

Das Designsystem heißt **„Baustelle“** und steht in [`src/index.css`](./src/index.css).
Es hat die Website-Übersetzung abgelöst, die vorher hier stand — siehe
[Designsystem](#designsystem-baustelle).

**The app is implemented.** `src/khpl/` holds the KHPL Connect flow — splash,
in-fiction intro and all seventeen steps (M1–M10 plus the seven Abstecher) — built
on the design system below. See [Der Flow](#der-flow-srckhpl).

## Specs

- [`khpl-flow.md`](./khpl-flow.md) — **what** is told: the M1–M10 main line, the
  Abstecher branches and every sticky from the Miro board.
- [`khpl-ui-shell.md`](./khpl-ui-shell.md) — the **shell** around it: splash, in-fiction
  intro, progress rail, "Dein Weg" sheet, the discreet career skip, and the
  localStorage resume model. Read before building any screen.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # prueft nebenbei die Buendel-Budgets, s. u.
pnpm check      # typecheck + lint + format:check
pnpm format     # prettier --write .
```

## Der Flow (`src/khpl/`)

Kommentare und Bezeichner in `src/khpl/` und `src/dachstuhl/` sind auf Deutsch —
dieselbe Sprache wie die Spec, dieselbe wie das Board. Das Design-System darunter
(`src/components/ui/`, `src/lib/`) bleibt englisch, wie es ist.

```
flow/steps.ts        Der Step-Graph. Einzige Quelle für Reihenfolge, Abstecher
                     und Rail-Segmentzahl — nichts davon steht als Konstante
                     irgendwo sonst.
flow/uebergaenge.ts  Buttontexte je Abstecher, plus `wegzustand` (✓ ● ○).
store/fortschritt.ts localStorage v1, 30-Minuten-Verfall, Zurück-Historie,
                     Hochwassermarke, Antworten, Karriere-Skip.
shell/               StepShell (Bühne · Fachtext · Interaktion · Aha · Fuß —
                     ein Layout für alle Steps), Rail, DeinWeg (S3),
                     Splash (S0), Auftragsannahme (S1), KioskGuard,
                     Wisch-Navigation.
komponenten/         Begriff (Glossar-Popover), AhaKarte, Verzweigung.
glossar/begriffe.ts  Alle 20 Begriffe aus flow 12, plus `Stundensatz`.
buehne/              Foto + SCHRITT_BILDER (welcher Step welches Motiv trägt),
                     Dachstuhl3D (die Lazy-Grenze um `three`),
                     aufbauabschnitte.ts.
steps/               Ein Modul je Step. Der Text steht gebündelt oben in der
                     Datei (flow 8.4).
```

**Zwei Regeln, an denen viel hängt.**

1. `three` darf **nie** statisch importiert werden — auch nicht ein Hilfsexport
   aus demselben Modul. Ein Modul, das irgendwo statisch importiert wird, zieht
   Rollup ganz ins Hauptbündel, und dann liegt `three` im Erststart (flow 8.5).
   Deshalb steht der Ladezustand in `buehne/Dachstuhl3DFallback.tsx` allein.
   Kontrolle: `pnpm build` — `Szene-*.js` muss ein eigener Chunk sein, und der
   Build darf **kein** `INEFFECTIVE_DYNAMIC_IMPORT` melden.
2. Wo M5 aufhört und M7 anfängt, steht in `buehne/aufbauabschnitte.ts` und wird
   über das **Phasenlabel** aus `dachstuhl/zeitachse.ts` gesucht, nie als Zahl.
   Die Zeitachse ist Animationsparameter, kein Vertragswert.

### Ein Layout, nicht drei

Jeder Step — Haupt wie Abstecher — rendert gleich, aus zwei Ebenen:

1. **Der Titel steht auf der Bühne**, nicht in einer Karte. Anton, versal, so
   groß wie der Screen es hergibt.
2. **Darunter ein dunkles Panel**, das nur trägt, was man lesen oder anfassen
   muss: Fachtext, Interaktion, Aha-Karte, Fuß.

Vorher gab es drei Aufteilungen (`bild`, `uebung`, `buehne`), und jede setzte
Titel, Text und Knopf woandershin. Über fünfzehn Screens las sich das nicht wie
ein Produkt, sondern wie drei. Der erste Umbau vereinheitlichte sie zu **einer
weißen Karte unten links** — konsistent, aber auf dem iPad quer rund 62 % der
Breite deckend weiß. Damit war jeder Screen ein Dokument mit Bildhintergrund.

Der Titel außerhalb des Panels ist die Änderung, an der der Rest hängt: sobald
die Überschrift nicht mehr in demselben Kasten sitzt wie Text und Knopf, gehört
das Foto wieder zum Screen statt hinter ihn.

Zwei Schalter bleiben an `StepShell`:

- `buehneInteraktiv` — die Bühne **ist** die Interaktion (B3.2, M5, M7, M8). Das
  Panel bleibt schmal, und `SichtfeldMesser` sagt der Kamera, wie viel Fläche
  dem Modell wirklich bleibt.
- `karteBreit` — für M4, den dichtesten Screen der Anwendung.

**Im Panel scrollt nur der Inhalt, nie der Fuß.** M1 trägt zehn
Checklistenpunkte, hochkant auf dem Handy passt das nicht auf einen Screen.
Scrollte das ganze Panel, läge ausgerechnet der Weiter-Knopf unter der Kante —
und dann sitzt jemand am Stand fest.

**Und die Aktion einer Übung sitzt im Fuß, nicht in der Übung.** „Zurück in den
Betrieb“ (M1), „Und jetzt die echte Zahl“ (M2), „Schnitt setzen“ (M4) gehen über
den `aktion`-Slot von `StepFuss`. Vorher standen sie unten in der scrollenden
Fläche — auf M1 und M4 unterhalb der Kante, und wer nicht auf die Idee kam zu
scrollen, sah eine Aufgabe ohne Antwortknopf.

### Fotos

Jeder Screen, der kein 3D-Modell zeigt, trägt ein echtes Foto. Welcher Step
welches Motiv bekommt, steht gebündelt in `SCHRITT_BILDER`
(`buehne/Foto.tsx`) — zusammen mit dem Bildmittelpunkt, denn `object-fit: cover`
schneidet quer und hoch verschieden zu. Herkunft und Urheber:innen aller Dateien
stehen in [`MEDIEN.md`](./MEDIEN.md).

Für eigene Fotos aus den Betrieben ist der Tausch eine Zeile je Motiv; die
Dateinamen können bleiben.

### Am Messetag zu füllen

`public/stand.json` trägt den Namen für „Sprich jetzt mit … am Stand“:

```json
{ "name": "Maria Musterfrau", "rolle": "Ausbildungsberatung" }
```

Kein Rebuild, kein Deploy — die Datei wird von Hand geändert. Ist der Name leer,
sagt der Screen „Sprich jetzt mit uns am Stand“, nie `[Name]`.

### Kiosk-Bedienung

- **Staff-Ausgang:** fünf schnelle Taps in die Ecke **oben links**, auf jedem
  Screen. Öffnet „Neu starten / App neu laden“.
- **Idle:** 60 s → „Bist du noch da?“, weitere 15 s → zurück auf den Splash.
  Der Fortschritt wird dabei **nicht** gelöscht; das erledigt die
  30-Minuten-Frist. Die Mittagspause (M6) bekommt die dreifache Geduld.
- **`?demo=dachstuhl`** öffnet weiterhin den 3D-Prototyp.

## Abhängigkeiten für den Flow


| Paket | Wofür (flow spec 8.2) |
| --- | --- |
| `motion` | Ein-/Ausgänge, animierter Dachaufbau (M5), Aha-Karten |
| `@dnd-kit/core` | Zieh-Interaktionen: M4 Schnitt, M7 Bauteile, B4.1 Auswahl |
| `three`, `@react-three/fiber`, `@react-three/drei` | 3D-Modell in B3.2, M5, M7, M8 |

Gemessen nach `pnpm build`, gegen die Budgets aus flow 8.5:

| Teil | Budget | Ist |
| --- | --- | --- |
| App-Shell (React, Tailwind, Base UI, motion) | ≤ 250 KB gzip | 191 KB |
| `three` + fiber + drei, nur lazy | ≤ 500 KB gzip | 243 KB, eigener Chunk |
| Erststart bis „Tippen zum Starten“ | ≤ 1,5 MB | rund 700 KB |

Der 1,4-MB-Attract-Loop lädt erst 400 ms **nach** dem ersten Frame und zählt
deshalb nicht zum Weg bis „Tippen zum Starten“.

> ⚠️ **Die Zahlen sind vom Stand vor dem Redesign und noch nicht neu gemessen.**
> Die Lazy-Grenze um `three` ist unverändert, aber der Erststart hat mit **Anton**
> eine zweite Schriftfamilie dazubekommen (ein Schnitt, rund 30 KB woff2), und
> `szenario.mp4` liegt jetzt auf S1. Beides gehört einmal durch `pnpm build`
> nachgerechnet.

## Offline / PWA

`vite-plugin-pwa` is configured in `vite.config.ts` and emits `sw.js` plus a web
manifest at build time; registration is injected automatically, so no app code
imports it. This covers the spec's requirement that a WLAN dropout cannot stop
the app.

Two things are deliberately left open and commented in the config:

- **No app icons.** The only brand mark in the repo is a 1000×248 wordmark. The
  manifest needs square 192/512 PNGs plus a maskable 512 before the app can be
  installed to an iPad home screen.
- **Barlow und Anton kommen weiterhin vom Google-Fonts-CDN.** Eine
  Runtime-Cache-Regel deckt das ab, aber das ist der Notnagel. Selbst gehostet
  und subsettet (Barlow 400/600/700 plus Anton) ist der eigentliche Fix und
  spart zugleich einen render-blockierenden Request. Mit dem Redesign wiegt das
  schwerer als vorher: **Anton trägt jeden Titel**, und wenn es nicht da ist,
  fällt der Screen auf Barlow zurück und sieht aus wie die Vorfassung.

## Designsystem „Baustelle“

Alles steht in [`src/index.css`](./src/index.css). **Einfarbig dunkel, ein
Tokensatz, kein Theme-Schalter.**

### Warum nicht mehr die Website

Die Vorfassung war eine maßstabsgetreue Übersetzung von
kh-online.de/ausbildungsmanagement: Barlow 200, weiße Karten, 4-px-Radien, viel
Weißraum, jeder Wert von den Live-Seiten abgelesen. Das ist als Website-Port
korrekt und für dieses Produkt falsch. Das Publikum sind Vierzehn- bis
Sechzehnjährige an einem Messestand, die täglich TikTok, Duolingo und FIFA
bedienen — vor denen sieht ein sauberer Corporate-Port aus wie ein Formular.

Was von der Marke bleibt: **Orange `#FF9F2A` und Barlow.** Beides ist gemessen
und gehört der Kreishandwerkerschaft.

### Die Tokens

| Token | Wert | Wofür |
| --- | --- | --- |
| `--color-kh-ink` | `#0E0D0B` | der Grund. Warmes Schwarz, kein Neutralgrau |
| `--color-kh-surface` | `#191713` | Sheet „Dein Weg“, Ladeflächen |
| `--color-kh-raised` | `#26221C` | Popover, Dialog, Staff-Menü |
| `--color-kh-paper` | `#FBF7F0` | Schrift auf dem Grund |
| `--color-kh-mute` | `#A49B8E` | Zweitzeilen, Beschriftungen |
| `--color-kh-orange` | `#FF9F2A` | Marke. Der Weg nach vorn, Etiketten, Akzente |
| `--color-kh-orange-deep` | `#8A4A00` | der harte Schatten unter dem Weiter-Knopf |
| `--color-kh-signal` | `#D8F63C` | Warnwestengelb. **Nur** „das hast du geschafft“ |
| `--color-kh-line` | `rgba(255,255,255,.13)` | Trennlinien im Panel |
| Anzeigeschrift | **Anton**, versal | Titel, Zahlen, Etiketten |
| Fließschrift | **Barlow 400/500/600/700** | Fachtext, Knöpfe, Listen |
| Radien | 14 px Flächen · 22 px Panel · Pille für Knöpfe | |

**Zwei Farben, zwei Bedeutungen.** Orange führt nach vorn — genau eine gefüllte
orange Fläche pro Screen, und das ist immer *Weiter*. Gelbgrün gehört der
Handlung *in* der Übung und der Rückmeldung „richtig“. Wer Gelbgrün für
Dekoration verbraucht, hat es für die Rückmeldung verloren.

Rot kommt nicht vor. Rot bewertet, und bewertet wird hier nicht (flow 6.6): eine
falsche Antwort bekommt einen orangen Rand und ein Kopfschütteln, keine Note.

### Warum Anton

Barlow 200 ist eine Flüsterstimme, und deutsche Komposita sind lang. „Absturz­-
sicherung“, „Kreishandwerkerschaft“, „Sicherheitsbesprechung“ — eine schmale
fette Plakatschrift ist hier kein Stil, sondern der Unterschied zwischen einer
Zeile und dreien. Der Fließtext bleibt Barlow, aber in **400 statt 200**: dieselbe
Größe verschwindet in 200 unter Hallenlicht und steht in 400.

### Warum nur ein Ton

Die Bühne ist auf jedem Screen ein Foto oder das 3D-Modell. Ein dunkler Grund
lässt beides leuchten, ein weißer leuchtet dagegen an. Dazu kam, dass der Kiosk
ohnehin auf ein Theme gepinnt war — der zweite Tokensatz kostete Pflege und
stand nie auf dem Gerät.

Damit sind **entfallen**: die `.dark`-Überschreibungen, `?web=1`, das Pinnen im
`KioskGuard` und der No-Flash-Block in `index.html`. `src/lib/theme.ts` und
`<ThemeToggle />` gibt es noch, aber nur für den 3D-Prototypen unter
`?demo=dachstuhl`, wo „hell“ und „dunkel“ die *Szenenbeleuchtung* meinen.

**In der App gilt: niemals ein literales `bg-white` oder `text-black`.** Es gibt
`bg-kh-ink` / `bg-kh-surface` / `text-kh-paper`. Die einzige erlaubte Ausnahme
ist `text-[#0E0D0B]` auf einer orangen oder gelbgrünen Fläche — dort ist Schwarz
Vordergrund und kein Grund.

### Die 3D-Szene gehört dazu

`Dachstuhl3D` läuft in der App durchgehend im Dunkel-Zweig von `SZENE_FARBEN`.
Der war ursprünglich ein Nachtmodus und ist jetzt der Normalfall — deshalb liegen
die Lichtstärken in `Beleuchtung.tsx` **über** denen des Hell-Zweigs: dunkler
Grund, hell angestrahltes Modell, wie ein Werkstück unter der Lampe. Eine hell
ausgeleuchtete 3D-Fläche zwischen fünfzehn dunklen Screens war der einzige Ort,
an dem die App ihre eigene Farbe verließ.

Das Abendlicht von M8 liegt als zwei Farbschichten *über* der Leinwand und
braucht dafür keinen eigenen Zweig mehr.

### Marke auf dunklem Grund

`kh-paderborn-lippe2.png` ist fast schwarze Zeichnung auf Transparenz und
verschwindet auf Dunkel. `<Logo />` zeigt deshalb durchgehend die hell
eingefärbte Kopie derselben Datei; `aufHell` schaltet auf das Original zurück
und wird genau einmal gebraucht, auf dem orangen Abschlussfeld M10.

```tsx
import { Logo } from '@/components/ui/logo'
;<Logo />
```

**Warum ein Asset und kein Filter.** Das naheliegende `invert()` macht aus dem
orangen Achteck Blau; die Hue-Korrektur zieht es bei 180° nach Rot und bei 200°
ins Olive — CSS `hue-rotate` ist eine lineare Näherung und bekommt eine
invertierte Farbe nicht zurück. Alle fünf Varianten wurden gerendert und gegen
`#FF9F2A` verglichen, keine hielt.

Die Datei selbst ist ungewöhnlich sauber — genau zwei Farbwerte, `#1D1D1B` für
den Schriftzug und `#F59C00` für die Marke —, deshalb entstand
`kh-paderborn-lippe2-dark.png` durch Umfärben **nur** der Schriftzug-Pixel.
Alpha und jedes orange Pixel sind byte-identisch zum Original, die
Kantenglättung überlebt intakt. Neu erzeugen, wenn das Logo je ersetzt wird.

Die Silhouette (`kh-pb-lippe.png`) ist bereits Orange auf Transparenz und
braucht nichts.

## Was liegt wo

```
src/index.css              Das Designsystem „Baustelle“: Tokens, Schrift-
                           bausteine (kh-plakat / kh-titel / kh-fachtext /
                           kh-etikett / kh-zahl), Flächen (kh-panel / kh-feld /
                           kh-scrim / kh-warnband), Kiosk-Verhalten
src/lib/theme.ts           Nur noch für ?demo=dachstuhl: hell/dunkel meint dort
                           die Szenenbeleuchtung, nicht das App-Theme
src/components/
  theme-toggle.tsx         Schalter dazu, sitzt in der Debug-Leiste des Demos
src/components/ui/
  button.tsx               weiter · aktion · neben · leise (Base UI useRender)
  dialog.tsx               Base UI Dialog im System
  popover.tsx              Base UI Popover — trägt das Glossar
  menu.tsx                 Base UI Menü, nur im Demo
  logo.tsx                 Schriftzug, hell eingefärbt (aufHell für M10)
public/brand/              Logo hell + dunkel, Silhouette, Handygrafik
```

Mit dem Redesign entfallen sind `teaser.tsx`, `sticker.tsx`, `hashtag.tsx` und
`accordion.tsx`. Sie stammten aus dem Website-Port, wurden von keinem Screen
benutzt und trugen Tokens, die es nicht mehr gibt.

`Button` benutzt Base UIs `useRender`; komponiert wird also über `render` statt
über das Radix-`asChild`: `<DialogTrigger render={<Button variant="neben" />}>`.
