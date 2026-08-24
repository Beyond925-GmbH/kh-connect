/**
 * Das Wandelement als Bühne — **ein Objekt, sieben Zustände**
 * (khpl-tag-zimmerer.md 2 und 7).
 *
 * Das ist der längste Faden der vier Tage und der Grund, warum dieser Tag ohne
 * einen zweiten Dachstuhl auskommt: dasselbe Element erscheint als Stapel
 * nummerierter Hölzer, als flach liegendes Ständerwerk, als Sandwich, mit
 * *deinem* Fensterausschnitt, aufgerichtet auf dem Anhänger, am Haken und
 * schließlich als Westwand eines Hauses.
 *
 * ---
 *
 * ## ⚠️ Das hier ist ein Stub
 *
 * Angelegt vom Fundament-Agenten, damit Steps- und Bühnen-Agent **gegen
 * dieselbe Schnittstelle** bauen können. Die Props unten sind der Vertrag; die
 * Geometrie fehlt noch. Solange sie fehlt, rendert die Komponente eine ruhige
 * Fläche mit dem Namen des Zustands — keine Fehlermeldung, kein Platzhalterbild.
 *
 * **Wer diese Datei füllt, ändert die Props nicht still.** Ein Step, der gegen
 * `zustand="haken"` gebaut hat, darf nicht plötzlich zwei Felder mehr setzen
 * müssen. Neue Parameter bekommen einen Default; was weg soll, wird gemeldet.
 *
 * ---
 *
 * ## Lazy-Grenze
 *
 * Dieses Modul wird `three` nachziehen. Es darf deshalb **nur** über
 * `lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))` eingebunden
 * werden, nie statisch — sonst landet `three` im Erststart-Bündel und reißt die
 * 1,5-MB-Grenze (khpl-tage.md 3). Als Ladezustand dient
 * `Dachstuhl3DFallback` mit eigenem `text`; er ist three-frei und gewerkeneutral.
 *
 * **Keine Wert-Exporte neben der Default-Komponente.** Laufzeitkonstanten
 * stehen in `kanon.ts`, Typen exportiert diese Datei nur als `type`.
 *
 * ## Wiederverwendet aus `src/drei/`
 *
 * `Szene`, `Beleuchtung`, `Kamerasteuerung`, `kamera.ts`, `Bauteil`,
 * `useTapErkennung`, `useAufbau`, `fahrzeug.tsx` — nur additiv änderbar
 * (khpl-tage.md §6.1 V7). `src/dachstuhl/**` bleibt unangetastet.
 */

/**
 * Die sieben Zustände des Fadenobjekts, je einer je Step.
 *
 * Bewusst benannt und nicht als Zahl auf einer Zeitachse: khpl-tag-zimmerer.md
 * 7 verlangt, dass der Zustand „als benannter Zustand ins Modell“ gehört und
 * nicht als Zahl in die Steps — dieselbe Regel, die beim Dachdecker das
 * Phasenlabel statt einer Zeitzahl durchsetzt.
 */
export type Elementzustand =
  /** C1 — ein Stapel nummerierter Hölzer auf dem Abbundtisch. */
  | 'stapel'
  /** C2 — das Ständerwerk, flach auf dem Tisch. */
  | 'staenderwerk'
  /** C3 — gedämmt und beplankt, ein Sandwich. */
  | 'schichten'
  /** C4 — mit deinem Fensterausschnitt. Ab hier gehört es dem Besucher. */
  | 'fenster'
  /** C5 — aufgerichtet auf dem Anhänger. */
  | 'verladen'
  /** C6 — am Haken, schwebend. */
  | 'haken'
  /** C7 — die Westwand eines Hauses. */
  | 'haus'

/**
 * Die Kamera. **Die Umschaltung ist der Tag** (khpl-tag-zimmerer.md 7): bis C5
 * liegt alles flach unter einer Draufsicht, ab C6 steht die Kamera am Boden und
 * schaut hinauf. Ein einziger Screen dreht den Tag um 90°.
 *
 * Ohne Angabe leitet die Bühne den Blick aus dem Zustand ab — `stapel` bis
 * `verladen` sind Draufsicht, `haken` und `haus` Untersicht.
 */
export type Blick = 'draufsicht' | 'untersicht'

/**
 * Die Lichtstimmung. Beide innerhalb des bestehenden Dunkelzweigs von
 * `SZENE_FARBEN` — **kein neuer Tokensatz** (khpl-tage.md 3).
 *
 * - `halle` — kaltes Oberlicht, tiefe Schatten, Staub in der Luft.
 * - `nachmittag` — warm und weicher. Nicht Abendlicht: dieser Tag endet um
 *   vier, weil vorgefertigt gebaut wird. Zwei Feierabende dürfen nicht
 *   dasselbe Licht haben.
 */
export type Elementlicht = 'halle' | 'nachmittag'

/** Der Fensterausschnitt, den der Besucher in C4 aufzieht. Alle Maße in Millimetern. */
export interface Fensterausschnitt {
  /** Abstand der linken Ausschnittkante von der linken Elementkante. */
  xMm: number
  /** Höhe der Ausschnittunterkante über Rohboden — das zweite Planmaß. */
  yMm: number
  breiteMm: number
  hoeheMm: number
}

/**
 * Wie das Element am Haken hängt — die Abfrage in C6, Beat 1.
 *
 * Zwei Achsen, zwei Entscheidungen, beide aus dem Kopf. Richtig ist
 * `{ aussenseite: 'holzfaser', oben: 'raehm' }`: nach außen kommt die
 * diffusionsoffene Holzfaserplatte, nicht die glatte, fertig aussehende
 * Innenbeplankung — und oben ist das Rähm, weil dort die Decke aufliegt.
 */
export interface Elementlage {
  /** Welche Seite zeigt nach außen. Die verlockende Falsche ist `beplankung`. */
  aussenseite: 'beplankung' | 'holzfaser'
  /** Welche Kante zeigt nach oben. Wer sich in C4 das Fenster gemerkt hat, weiß es. */
  oben: 'raehm' | 'schwelle'
}

export interface Wandelement3DProps {
  /** Welcher der sieben Zustände gezeigt wird. Das ist die Hauptachse. */
  zustand: Elementzustand
  /** Kamera. Ohne Angabe aus `zustand` abgeleitet. */
  blick?: Blick
  /** Licht. Ohne Angabe: `halle` bis `verladen`, danach `nachmittag`. */
  licht?: Elementlicht

  // -- C1 — Suchen, nicht Sortieren ----------------------------------------
  /**
   * Die Nummer, die die Stückliste verlangt. Die Bühne legt zwölf nummerierte
   * Hölzer aus, zwei davon fast gleich — sie unterscheiden sich nicht in der
   * Länge, sondern in der Ausklinkung.
   */
  gesuchteNummer?: number
  /** Ein Holz wurde angetippt. Der Step entscheidet, was das heißt. */
  onHolz?: (nummer: number) => void

  // -- C2 — Schätzen → Auflösen --------------------------------------------
  /** Reglerwert in Zentimetern, live. Der zweite Ständer folgt ihm. */
  achsmassCm?: number
  /**
   * Auflösung läuft: die Bauplatte legt sich als halbtransparente Fläche über
   * das Ständerwerk, die Stoßkante rastet sichtbar auf einem Ständer ein, die
   * übrigen Ständer fliegen ins Raster. **Keine Dämmmatte** — das Raster kommt
   * vom Plattenformat (belege/zimmerer.md 1).
   */
  aufgeloest?: boolean

  // -- C3 — die geführte Hälfte des Lernpaars ------------------------------
  /**
   * Wie viele der fünf Schichten schon liegen, von innen nach außen. Der Blick
   * wandert dabei leicht in die Schräge, damit die Dicke sichtbar wird — eine
   * Wand von genau oben ist ein Rechteck.
   */
  schichten?: number

  // -- C4 — der Fehler mit Preis -------------------------------------------
  /** Der aufgezogene Ausschnitt. `null` = noch nichts gezogen. */
  ausschnitt?: Fensterausschnitt | null
  /** Während des Ziehens, jeden Frame. */
  onAusschnitt?: (a: Fensterausschnitt) => void
  /**
   * Der Blick nach oben, sobald der Rahmen sitzt: das Element kippt für
   * `AUFRICHTEN_DAUER` in die Senkrechte und zeigt, wo das Fenster ist. Nicht
   * interaktiv. Das ist die halbe Miete für die Abfrage in C6.
   */
  aufrichtenZeigen?: boolean
  /** Feuert, wenn das Aufrichten durch ist. */
  onAufrichtenEnde?: () => void

  // -- C5 — die Zäsur -------------------------------------------------------
  /**
   * Das Gespann fährt weg, der Blick bleibt in der leeren Halle zurück.
   * `prefers-reduced-motion`: es ist sofort fort.
   */
  abfahrt?: boolean
  /** Feuert genau einmal, wenn das Gespann aus dem Bild ist. */
  onAbfahrtEnde?: () => void

  // -- C6 — der Signaturscreen ---------------------------------------------
  /**
   * Beat 1. `null` = das Element dreht sich langsam und wartet darauf,
   * angehalten zu werden.
   */
  lage?: Elementlage | null
  /** Der Besucher hat es angehalten. Richtig oder falsch entscheidet der Step. */
  onLage?: (lage: Elementlage) => void
  /**
   * Beat 2 — Einweisen. Das Element schwebt über die Schwelle und **pendelt**:
   * zu schnell gezogen, und es schwingt über das Ziel hinaus.
   */
  einweisen?: boolean
  /** Feuert, wenn das Element abgesetzt ist. */
  onAbgesetzt?: () => void

  // -- gemeinsam ------------------------------------------------------------
  /**
   * Markiert *dein Element* — ab C4 trägt es den Ausschnitt des Besuchers und
   * ist in C7 als Westwand wiederzuerkennen.
   */
  deinElement?: boolean
  /** Die Szene steht und ist gezeichnet. Für Testhaken und Ladezustände. */
  onBereit?: () => void
}

export default function Wandelement3D({ zustand, blick, licht }: Wandelement3DProps) {
  // STUB. Kein `three`, keine Geometrie — nur ein ruhiger Grund, damit die
  // Steps schon gegen die Schnittstelle laufen können. Die Bühne baut der
  // Bühnen-Agent (khpl-tag-zimmerer.md 7).
  const gezeigterBlick =
    blick ?? (zustand === 'haken' || zustand === 'haus' ? 'untersicht' : 'draufsicht')
  const gezeigtesLicht =
    licht ??
    (zustand === 'haken' || zustand === 'haus' || zustand === 'verladen'
      ? 'nachmittag'
      : 'halle')

  return (
    <div
      className="grid size-full place-items-center bg-kh-surface"
      data-buehne="wandelement"
      data-zustand={zustand}
      data-blick={gezeigterBlick}
      data-licht={gezeigtesLicht}
      data-wisch="aus"
      aria-hidden
    >
      <p className="text-[15px] text-kh-mute">Die Bühne wird gebaut ·</p>
    </div>
  )
}
