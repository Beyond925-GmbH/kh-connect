# 2KH Connect — App

React + Vite + TypeScript, Tailwind v4, shadcn-style components on **Base UI**
(`@base-ui/react`).

Das Designsystem heißt **„Baustelle“** und steht in [`src/index.css`](./src/index.css).
Es hat die Website-Übersetzung abgelöst, die vorher hier stand — siehe
[Designsystem](#designsystem-baustelle).

**The app is implemented.** `src/khpl/` holds the KHPL Connect flow — splash,
in-fiction intro and all seventeen steps (M1–M10 plus the seven Abstecher) — built
on the design system below. See [Der Flow](#der-flow-srckhpl).

**Seit dem Umbau auf vier Berufe** liegt davor ein Trichter (Helm → Fragen →
Vorschlag → Berufsliste), und der Tagesablauf ist Daten statt Konstanten. Genau
**ein** Beruf hat bisher einen Tag: **Dachdecker/Dachdeckerin**. Die anderen
drei — Zimmerer, Zerspanung, Anlagenmechanik — sind angekündigt und begehbar,
aber leer. Siehe [Vier Berufe](#vier-berufe-srckhplberufe).

> ⚠️ **Die Spec darunter ist auf Zimmerer/Zimmerin geschrieben.**
> `khpl-flow.md` führt in §1 den Ausbildungsberuf Zimmerer/Zimmerin, und die
> belegten Zahlen in §10 hängen daran. Der gebaute Tag heißt inzwischen
> Dachdecker; **die Fachrecherche ist noch nicht nachgezogen.** Was das
> konkret heißt, steht unter [Was noch Zimmerer
> ist](#was-noch-zimmerer-ist).

## Specs

- [`khpl-flow.md`](./khpl-flow.md) — **what** is told: the M1–M10 main line, the
  Abstecher branches and every sticky from the Miro board.
- [`khpl-ui-shell.md`](./khpl-ui-shell.md) — the **shell** around it: splash, in-fiction
  intro, progress rail, "Dein Weg" sheet, the discreet career skip, and the
  localStorage resume model. Read before building any screen.
- [`khpl-vereinfachung.md`](./khpl-vereinfachung.md) — **why the shell looks
  different since 25.08.2026**, and what still has to happen in the four
  Tage. It overrides the two above where they disagree; the affected passages
  in `khpl-ui-shell.md` carry a pointer. Read it before touching any step.

## Run

```bash
pnpm install
pnpm dev             # http://localhost:5173
pnpm build           # prueft nebenbei die Buendel-Budgets, s. u.
pnpm check           # typecheck + lint + format:check
pnpm format          # prettier --write .
pnpm pruefe:sprache  # Wortbudgets und Form der Auftragszeilen
```

`pruefe:sprache` ist die Abnahme fuer `khpl-vereinfachung.md`: es bricht ab,
wenn eine Auftragszeile keine Aufgabe ist oder eine Ansage zu lang wird, und
berichtet den Rest als Arbeitsliste. Mit `--streng` bricht es zusaetzlich beim
Wortbudget ab — das kommt in `pnpm check`, sobald die vier Tage umgebaut sind.

## Der Flow (`src/khpl/`)

Kommentare und Bezeichner in `src/khpl/`, `src/dachstuhl/` und `src/drei/` sind
auf Deutsch —
dieselbe Sprache wie die Spec, dieselbe wie das Board. Das Design-System darunter
(`src/components/ui/`, `src/lib/`) bleibt englisch, wie es ist.

```
berufe/              Ein Beruf ist Daten: Graph, Merkmale, Medien, Motive,
                     Copy — eine Datei je Beruf. dachdecker.ts trägt den
                     einzigen fertigen Tag; zimmerer.ts, zerspanung.ts und
                     anlagenmechanik.ts sind angekündigt (`graph: null`).
match/               Merkmale, die vier Fragen, die Helm-Optionen und das
                     Matching (portiert aus `kh-connect`, samt seiner Regeln).
flow/steps.ts        Die *Form* eines Step-Graphen plus `baueGraph` — die
                     Rechenregeln, die für jeden Beruf gelten. Die Daten
                     stehen in `berufe/`.
flow/uebergaenge.ts  `wegzustand` (✓ ● ○) und die offenen Abstecher. Die
                     Buttontexte liegen am Graphen des Berufs.
store/fortschritt.ts localStorage v2: Fortschritt **je Beruf**, dazu Helm und
                     Fragen an der Sitzung. 30-Minuten-Verfall,
                     Zurück-Historie, Hochwassermarke, Karriere-Skip.
shell/               StepShell (Bühne · Fachtext · Interaktion · Aha · Fuß —
                     ein Layout für alle Steps), Rail, DeinWeg (S3),
                     Splash (S0), der Trichter (Helmwahl, Fragen, Vorschlag,
                     Berufsliste, BerufBald), Auftragsannahme, KioskGuard.
komponenten/         Begriff (Glossar-Popover), AhaKarte, Verzweigung,
                     Helm (SVG), BerufBild (Motiv mit Ersatz).
glossar/begriffe.ts  Alle 20 Begriffe aus flow 12, plus `Stundensatz`.
buehne/              Foto + StepFoto (das Motiv kommt aus `BerufDef.bilder`),
                     drei Lazy-Grenzen um `three` — Dachstuhl3D (M3, M5–M8,
                     B3.2), Zuschnitt3D (M4), Beladen3D (B4.1) —,
                     Dachstuhl3DFallback + kanon.ts (beide three-frei),
                     aufbauabschnitte.ts.
steps/<beruf>/       Ein Modul je Step, nach Beruf getrennt. Der Text steht
                     gebündelt oben in der Datei (flow 8.4).
```

Die 3D-Teile liegen daneben in zwei Ordnern. `src/dachstuhl/` ist **das
Dachstuhl-Modell** des Dachdecker-Tags (Geometrien, Teileliste, Maße, Riss,
Schnitt, Zeitachse) und gilt als schreibgeschützt: wer dort etwas ändert, ändert
den einzigen fertigen Tag. `src/drei/` trägt die **allgemeine Szenentechnik** —
`Szene`, `Beleuchtung`, `Kamerasteuerung`, `kamera.ts`, `Bauteil`, `fahrzeug`,
`useTapErkennung`, `useAufbau` — und ist gemeinsam, aber nur additiv änderbar:
neue Parameter mit Default, keine geänderte Signatur (khpl-tage.md §6.1 V7).

**Zwei Regeln, an denen viel hängt.**

1. `three` darf **nie** statisch importiert werden — auch nicht ein Hilfsexport
   aus demselben Modul. Ein Modul, das irgendwo statisch importiert wird, zieht
   Rollup ganz ins Hauptbündel, und dann liegt `three` im Erststart (flow 8.5).
   Deshalb steht der Ladezustand in `buehne/Dachstuhl3DFallback.tsx` allein,
   und deshalb liegen die Laufzeit-Konstanten der Bühnen (z. B. `ANFAHRT_DAUER`)
   in `buehne/kanon.ts` statt neben den Bühnen-Komponenten. Aus `Dachstuhl3D`,
   `Zuschnitt3D` und `Beladen3D` holt ein Step nur die Komponente per `lazy()`
   und sonst ausschließlich `import type`.
   Kontrolle: `pnpm build` — `Szene-*.js` muss ein eigener Chunk sein, und der
   Build darf **kein** `INEFFECTIVE_DYNAMIC_IMPORT` melden.
2. Wo M5 aufhört und M7 anfängt, steht in `buehne/aufbauabschnitte.ts` und wird
   über das **Phasenlabel** aus `dachstuhl/zeitachse.ts` gesucht, nie als Zahl.
   Die Zeitachse ist Animationsparameter, kein Vertragswert.

### Ein Layout, nicht drei

> ⚠️ **Seit `khpl-vereinfachung.md` sind es drei Ebenen statt zwei**, und die
> mittlere ist die wichtigste: **das Auftragsband**. Der Fachtext ist nicht
> mehr der Standardinhalt des Panels, sondern liegt hinter einer geschlossenen
> Klappzeile („Warum das so ist"), in der auch die Aha-Karte erscheint. Das
> Panel ist damit rund drei Zeilen hoch statt 62–84 % des Screens; Klappgriff,
> `buehnePlatz` und `einklappbar` sind ersatzlos entfallen. Der Abschnitt
> darunter beschreibt weiterhin richtig, **warum der Titel auf der Bühne
> steht** — das ist unverändert.

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

- `buehneInteraktiv` — die Bühne **ist** die Interaktion. Seit dem 3D-Umbau der
  Handwerksstrecke tragen ihn M3–M8 sowie B3.2 und B4.1; nur M3 und M6 sind
  dabei reine Lese-Steps mit fester Kamera (`interaktionOffen={false}`). Das
  Panel bleibt schmal, und `SichtfeldMesser` sagt der Kamera, wie viel Fläche
  dem Modell wirklich bleibt — in zwei Fassungen: `mitLuft` (Default, mit dem
  Sicherheitsstreifen für die zu knappe Dachstuhl-Hülle) und `roh` für Bühnen
  mit exakter Hülle wie `Zuschnitt3D`.
- `karteBreit` — für die dichtesten Textscreens der Anwendung, heute M1 und M2.
  M4 trug ihn bis zum 3D-Umbau; seine Übung liegt jetzt auf der Bühne.

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
welches Motiv bekommt, steht gebündelt am Beruf (`bilder` in
`berufe/<beruf>.ts`) — zusammen mit dem Bildmittelpunkt, denn `object-fit: cover`
schneidet quer und hoch verschieden zu. Herkunft und Urheber:innen aller Dateien
stehen in [`MEDIEN.md`](./MEDIEN.md).

Nach dem 3D-Umbau der Handwerksstrecke ziehen nur noch M1, M2, M9, M10, B3.1,
B5.1 und B9 ein Foto. Die Einträge `M3`, `M4`, `M6` und `B4.1` bleiben in der
Motivliste stehen, werden aber von keinem Step mehr referenziert.

Für eigene Fotos aus den Betrieben ist der Tausch eine Zeile je Motiv; die
Dateinamen können bleiben.

### Der Attract-Loop

`shared/start-loop.mp4` trägt den Splash. Er deckt **drei** Gewerke ab, nicht
vier, und ist mit 13 s kurz für seine Aufgabe. Was er braucht:

- **Dachdecker fehlt** — dazu liegt im Repo kein Bewegtbild.
- **30–60 s statt 13.** Der Erststart trägt das: der Loop lädt erst 400 ms nach
  dem ersten Frame, bis dahin steht das Poster (flow 8.5).
- **Die ersten acht Sekunden entscheiden.** So lange schaut jemand hin, der
  vorbeigeht; alle vier Gewerke gehören hinein. Und jeder Idle-Rückfall startet
  das Video neu — die zweite Hälfte eines langen Loops sieht an einem vollen
  Standtag kaum jemand.
- **Unsichtbarer Umbruch.** Erstes und letztes Bild angleichen oder beide auf
  Schwarz enden lassen, sonst liest sich der Rücksprung als GIF.
- **Poster = Bild 1 des neuen Schnitts.** Ein fremdes Standbild macht aus der
  Überblendung einen harten Schnitt.

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

## Vier Berufe (`src/khpl/berufe/`)

Dachdecker · Zimmerer · Zerspanungsmechaniker:in · Anlagenmechaniker:in SHK.

Gebaut ist **Dachdecker**. Die anderen drei sind angekündigt.

**Ein Beruf ist eine Datei.** `BerufDef` trägt Name, Kurzform, die Zeile für die
Karte, den Merkmalsvektor fürs Matching, die Medienpfade, die Copy des
Auftragsscreens — und `graph`. Ist `graph` gleich `null`, ist der Beruf
angekündigt und noch nicht gebaut; das ist absichtlich im Typ und nicht in einem
Flag, damit jede Stelle, die einen Graphen braucht, den Fall behandeln **muss**.

Einen der drei fertigstellen heißt: `graph` mit `baueGraph` füllen (Vorbild
`dachdecker.ts`), `auftrag` schreiben, Medien nach `public/medien/media/<id>/`
legen. Hat der Beruf eigene React-Module, kommen sie in
`berufe/komponenten.tsx`; was dort fehlt, rendert der `Platzhalter`. **Die Hülle
ändert sich nicht.**

> ⚠️ Merkmale und Texte der drei angekündigten Berufe sind **gesetzt, nicht
> recherchiert**. Sie reichen, um den Trichter zu bauen und zu bedienen; sie
> sind nicht die Sorgfalt, die `khpl-flow.md` §10 aufbringt.

### Was noch Zimmerer ist

Der gebaute Tag ist von Zimmerer auf Dachdecker umbenannt worden. Der **Ablauf**
trägt das (ein Dach entsteht, von der Anfrage bis zum Feierabend), die
**Fachrecherche darunter nicht**. Offen, nach Dringlichkeit:

| Wo | Was | Warum es zählt |
| --- | --- | --- |
| `steps/dachdecker/karrierewege.ts` | „rund 45.000 Euro" für den Meister ist der **Zimmerer**-Wert | Eine Zahl vor einem Vierzehnjährigen. Belegen oder streichen. |
| `glossar/begriffe.ts` | Stundensatz 50–90 € stammt aus dem **Zimmerer**handwerk | dito, steht im Glossar-Popover |
| `khpl-flow.md` §1, §10 | die ganze Quellenlage (AusbauBAusbV, Holzbau Deutschland, Zimmererzentrum) | jede Aussage der App hängt daran |
| `berufe/dachdecker.ts` | `auftrag`-Copy war für eine Zimmerei abgenommen, Betrieb ist getauscht | Abnahme ist damit offen |
| `public/medien/media/zimmerer/` | Motive zeigen Zimmerleute an Balken | Ordnername und Inhalt gehören zum Zimmerer, dienen aber dem Dachdecker-Tag |
| M5 · M7 · B3.2 | das 3D-Modell ist ein **Dachstuhl** | Tragwerk ist Zimmererarbeit; als Dachdecker-Inhalt fachlich strittig |

Zwei Stellen waren nach dem Umbenennen **selbstbezüglich** und sind schon
korrigiert: M3 stimmte Termine „mit dem Dachdecker" ab, und in B4.1 waren die
Dachziegel falsch, „weil die der Dachdecker mitbringt" — bei einer gewerteten
Aufgabe die schlimmste Sorte Fehler. Beide nennen jetzt kein fremdes Gewerk
mehr.

### Der Trichter

```
S0 Splash → S1 Dein Helm → S2 Vier Fragen → S3 Vorschlag
                                              ↘ S4 Berufsliste → Auftrag → Steps
```

**Budget: 45 Sekunden bis zum ersten Inhalt.** Jeder Screen des Trichters hat
einen leisen Ausweg, und **beim Kaltstart entfällt S3** — wer nichts gesagt
hat, bekommt die Liste statt eines „das passt zu dir“, für das es keine
Grundlage gibt.

**Personalisiert wird ein Gegenstand, nicht die Oberfläche.** Das System hält
genau eine gefüllte orange Fläche pro Screen frei (*Weiter*) und Gelbgrün für
„geschafft“ — beides sind Bedeutungen, keine Vorlieben. Die Farbwahl landet
deshalb auf einem gezeichneten Helm. Das Merkmalssignal trägt daneben die Frage
„Wonach greifst du zuerst?“; die Helmfarbe trägt bewusst keins.

**Zwei Regeln aus dem Vorgänger-Repo sind mitportiert** und beide nicht
naheliegend (`match/matching.ts`):

1. Fragen wiegen doppelt gegenüber der Personalisierung.
2. Zurückgesagt („Du magst …“) wird nur, was jemand ausdrücklich beantwortet
   hat. Die Min-Max-Normierung kann sonst „nie erwähnt“ nicht von „ja gesagt“
   unterscheiden.

**Zimmerer und Dachdecker liegen im Merkmalsraum dicht beieinander** — beide
draußen, beide oben, beide auf demselben Dach. Getrennt werden sie über Frage 3
(*Tragwerk* gegen *Hülle*); der Vorschlag nennt zusätzlich immer den Zweiten,
damit ein knappes Ergebnis als ehrlich statt als falsch liest.

### Wechseln

Der Fortschritt liegt **je Beruf** in der Sitzung. Das ist die Bedingung dafür,
dass der Wechsel folgenlos ist: wer den Zimmerer bei M5 verlässt, findet ihn bei
M5 wieder — und deshalb fragt der Wechsel nichts nach. Eine Rückfrage vor jedem
Wechsel hieße, dass niemand wechselt.

Erreichbar ist er über das Sheet „Dein Weg“: der Kopf trägt den aktiven Beruf
und einen **Wechseln**-Chip auf die Berufsliste, unter der Schrittliste stehen
die drei anderen als Kurzwege. Die Rail zeigt den Beruf als Kleinzeile über dem
Zählstand — mit vier Berufen muss auf jedem Screen ohne Tap beantwortet sein,
in welcher Welt man steckt, und in der Leiste ist hochkant kein Platz für einen
weiteren Knopf.

M10 endet nicht mehr auf dem Splash, sondern auf **„Noch einen Beruf“**.

## Abhängigkeiten für den Flow


| Paket | Wofür (flow spec 8.2) |
| --- | --- |
| `motion` | Ein-/Ausgänge, animierter Dachaufbau (M5), Aha-Karten |
| `@dnd-kit/core` | Zieh-Interaktionen: M7 Bauteile, B4.1 Auswahl. M4 zieht seit dem 3D-Umbau direkt auf der Bühne, ohne dnd-kit |
| `three`, `@react-three/fiber`, `@react-three/drei` | 3D-Bühnen: Dachstuhl in M3 (Planriss), M5–M8 und B3.2, Zuschnitt in M4, Beladen in B4.1 |

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
>
> **Der 3D-Umbau der Handwerksstrecke ist danach ebenfalls nicht gemessen
> worden.** Der Lazy-Chunk hat zwei weitere Bühnen (`Zuschnitt3D`, `Beladen3D`),
> die Fahrzeug- und Riss-Geometrie sowie zwei bis dahin ungenutzte Module
> dazubekommen: `mergeGeometries` aus `three/addons/utils/BufferGeometryUtils.js`
> und `Html` aus drei (vorher wurde von drei nur `OrbitControls` gebraucht).
> Alles davon ist Code, kein Asset, und alles liegt weiterhin **nur** im lazy
> Chunk — der Erststart sollte unberührt sein, die 243 KB von `three` sind es
> sicher nicht mehr. Die Zeile bleibt bis zum nächsten `pnpm build` ungeprüft;
> ein Zahlenwert wird hier bewusst nicht geraten.

## Offline / PWA

`vite-plugin-pwa` is configured in `vite.config.ts` and emits `sw.js` plus a web
manifest at build time; registration is injected automatically, so no app code
imports it. This covers the spec's requirement that a WLAN dropout cannot stop
the app.

Three things are deliberately left open:

- **Videos sind gar nicht gecacht.** `globPatterns` listet `mp4` nicht, und eine
  Runtime-Regel dafür gibt es nicht — Bewegtbild lebt allein vom HTTP-Cache.
  Beim 13-Sekunden-Loop verkraftbar; sobald der Attract-Loop auf 30–60 s wächst
  (siehe unten), bleibt der Splash ohne WLAN auf seinem Poster stehen. Fix:
  `CacheFirst` plus `RangeRequestsPlugin` für `/medien/**/*.mp4`, so wie es
  `kh-connect` mit seinem `kh-media-v1` gemacht hat.
  `maximumFileSizeToCacheInBytes` gilt für Runtime-Caching nicht.
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
braucht dafür keinen eigenen Zweig mehr. Das Mittagslicht von M6 folgt demselben
Muster: `stimmung="mittag"` stellt die Sonne im Canvas steiler und wärmer, die
wahrnehmbare Zäsur machen aber zwei hellere Farbschichten über der Leinwand.

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
