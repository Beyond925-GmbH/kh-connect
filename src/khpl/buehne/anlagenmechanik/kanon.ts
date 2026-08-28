/**
 * Der Kanon der Anlagenmechanik-Bühne: **Zustandsform, Farben und die wenigen
 * Rechenregeln**, die Steps und Bühne gemeinsam brauchen.
 *
 * Warum eine eigene Datei neben `Schnitt.tsx`: dieselbe Trennung wie bei
 * `buehne/kanon.ts`. Steps importieren Laufzeitwerte der Bühne ausschließlich
 * von hier, aus dem Bühnenmodul selbst nur `import type`. Dieser Tag zieht zwar
 * kein `three` nach (Spec 7 — „dieser Tag hat kein `three`", und das ist der
 * Beweis, dass die Hülle nicht am 3D hängt), aber die Regel hält die Grenze
 * zwischen „was der Screen weiß" und „was die Zeichnung malt" trotzdem sauber.
 *
 * **Die Farbregel steht hier und nirgends sonst** (Spec 7):
 *
 * > Kalt und Warm leben ausschließlich auf der Bühne, nie in der Bedienung.
 * > Es bleibt bei genau einer gefüllten orangen Fläche pro Screen, und das ist
 * > *Weiter*. `src/index.css` wird nicht angefasst (khpl-tage.md 3).
 */

// ---------------------------------------------------------------------------
// Farben — Bühnen-Konstanten, keine Tokens
// ---------------------------------------------------------------------------

/**
 * Kalt: ein entsättigtes Blaugrau. Der Keller ist grau und blau, und er bleibt
 * es bis A6.
 *
 * Bewusst **kein** neuer Token in `src/index.css`: die Temperatur ist die
 * Geschichte dieses einen Berufs und keine Aussage des Designsystems. Zeigt
 * sich beim Bauen, dass sie es sein müsste, ist das eine Meldung an die Hülle
 * und keine Entscheidung dieses Tages.
 */
export const KALT = {
  linie: '#6b7c8c',
  linieMatt: '#4a5866',
  flaeche: '#2a323a',
  /**
   * Die dritte Stufe: **die Auswahl.** Das gerade geöffnete Bauteil in A2, der
   * Ring um ein Thermostatventil — hell genug, um sich aus dem Grau zu heben,
   * und kalt genug, um die Temperatur nicht vorwegzunehmen.
   */
  wahl: '#a8c0d4',
  /**
   * **Das Fadenobjekt des Tages, als Farbe:** die Leitung, die der Besucher in
   * A4 selbst zieht („ab hier ist der Weg deiner", Spec 2 und 6 A4).
   *
   * Zwei Anläufe hat sie gebraucht. Zuerst lag sie in `linie` — dieselbe Farbe
   * wie Kellerwände, Hülle und Bestand, nur breiter. Dann in `wahl`, und das
   * war laut Abnahme immer noch „nur eine Helligkeitsstufe in derselben
   * Graufamilie": streckenweise lief der eigene Weg deckungsgleich mit der
   * Kellerwand, und ausgerechnet das Fadenobjekt blieb auf der Stele schwach.
   *
   * Jetzt ein **gebürstetes Metallweiß** — die Materialfarbe eines blanken
   * Rohrs, nicht die nächste Graustufe. Innerhalb der Bühne ist eine
   * Materialfarbe ausdrücklich erlaubt; die Farbregel („Kalt und Warm leben nur
   * auf der Bühne, nie in der Bedienung", Spec 7) bleibt unberührt, und Orange
   * bleibt dem Moment in A6 vorbehalten. Den Rest macht die Zeichnung: dunkler
   * Mantel, heller Kern, Dämmschlauch drumherum — ein Rohr sieht anders aus als
   * eine Wandlinie, nicht nur heller (`Haus.tsx`, `Leitung`).
   */
  rohr: '#a9c6dd',
  /** Das Glanzlicht auf dem Rohr — die Kante, an der es rund wird. */
  rohrGlanz: '#eef6fd',
  /** Der Mantel unter dem Rohr. Er trennt es von allem, worüber es läuft. */
  rohrMantel: '#0a1014',
} as const

/**
 * Warm: die vorhandene Orangefamilie aus `index.css` (`--color-kh-orange`,
 * `--color-kh-orange-hot`, `--color-kh-orange-deep`), hier als
 * Zeichnungswerte gespiegelt — **ungefüllt**, als Verlauf entlang einer Linie,
 * nie als Fläche unter einem Knopf.
 */
export const WARM = {
  linie: '#ff9f2a',
  linieHeiss: '#ff7a1a',
  schimmer: '#8a4a00',
} as const

/** Sekunden, die die Wärme in A6 für den ganzen Weg braucht. Fluss, kein Sprung. */
export const WAERMELAUF_DAUER = 3.2

// ---------------------------------------------------------------------------
// Ids
// ---------------------------------------------------------------------------

/**
 * Eine der sechs Prüfungen aus A1.
 *
 * **Absichtlich `string` und keine Union.** Die Störung, die Prüfschritte und
 * die richtige Ursache sind laut Spec 11 noch **fachlich abzunehmen** — „eine
 * plausible, aber falsche Fehlersuche vor einem interessierten Publikum ist die
 * schlechteste Sorte Fehler". Eine Union hier hieße, sechs Prüfschritte zu
 * erfinden und sie durch den Typ zu zementieren. Die Liste gehört in den Step,
 * bis ein Mensch aus dem Gewerk sie bestätigt hat.
 */
export type PruefungId = string

/** Ein antippbares Bauteil im Keller (A2). */
export type BauteilId =
  'kessel' | 'tank' | 'verteiler' | 'pumpe' | 'ausdehnungsgefaess' | 'thermostatventile'

/**
 * Die sechs Bauteile aus Spec 6 (A2) — **namentlich dort genannt**, deshalb
 * stehen sie hier fest. Was jedes tut und ob es bleibt, ist Text des Steps und
 * nicht Sache der Zeichnung.
 */
export const BAUTEILE: readonly { id: BauteilId; label: string }[] = [
  { id: 'kessel', label: 'Ölkessel' },
  { id: 'tank', label: 'Öltank' },
  { id: 'verteiler', label: 'Verteiler' },
  { id: 'pumpe', label: 'Umwälzpumpe' },
  { id: 'ausdehnungsgefaess', label: 'Ausdehnungsgefäß' },
  { id: 'thermostatventile', label: 'Thermostatventile' },
]

// ---------------------------------------------------------------------------
// Das Raster aus A4
// ---------------------------------------------------------------------------

/**
 * Ein Knoten im Kellerraster, als `"spalte,zeile"`. Ein String und kein
 * Tupel, weil der Pfad in `answers.a4.pfad` als `string[]` gespeichert wird
 * (Spec 6, A4) und beim Laden aus dem `localStorage` durch dieselbe
 * String-Prüfung läuft wie alles andere.
 */
export type KnotenId = string

/** Größe des Rasters, auf dem die Leitung gezogen wird. */
export const RASTER = { spalten: 9, zeilen: 5 } as const

export function knoten(spalte: number, zeile: number): KnotenId {
  return `${spalte},${zeile}`
}

/** Zerlegt einen Knoten. `null` für alles, was nicht auf dem Raster liegt. */
export function zerlegeKnoten(id: KnotenId): { spalte: number; zeile: number } | null {
  const [s, z] = id.split(',').map(Number)
  if (!Number.isInteger(s) || !Number.isInteger(z)) return null
  if (s < 0 || z < 0 || s >= RASTER.spalten || z >= RASTER.zeilen) return null
  return { spalte: s, zeile: z }
}

/**
 * Wie viele Bögen der Weg hat — jede Richtungsänderung ist einer.
 *
 * Das ist die eine Zahl, die A4 sichtbar macht: „der kürzeste Weg hat vier
 * Bögen und einen Durchbruch durch eine tragende Wand; der richtige ist zwei
 * Meter länger und hat zwei Bögen" (Spec 6).
 */
export function zaehleBoegen(pfad: readonly KnotenId[]): number {
  let boegen = 0
  for (let i = 2; i < pfad.length; i++) {
    const a = zerlegeKnoten(pfad[i - 2])
    const b = zerlegeKnoten(pfad[i - 1])
    const c = zerlegeKnoten(pfad[i])
    if (!a || !b || !c) continue
    const vorher = { s: b.spalte - a.spalte, z: b.zeile - a.zeile }
    const nachher = { s: c.spalte - b.spalte, z: c.zeile - b.zeile }
    if (vorher.s !== nachher.s || vorher.z !== nachher.z) boegen++
  }
  return boegen
}

/**
 * Der Balken in A4: ein **relativer** Verlust zwischen 0 und 1, aus Länge und
 * Bögen.
 *
 * ⚠️ **Kein Bar, kein Pascal, keine Zahl auf dem Screen.** „Jeder Bogen kostet
 * Druck" stimmt, aber ein fester Wert je Bogen ist `NICHT BELEGBAR` (Spec 11):
 * der Druckverlust rechnet sich über ζ · ρ/2 · v² und hängt an Durchmesser,
 * Strömungsgeschwindigkeit und Bogenform. Für die Spielmechanik ist das
 * folgenlos — der Balken misst einen Verlust, keine Einheit. Für den Fachtext
 * ist es entscheidend.
 *
 * Das Gewicht der Bögen gegenüber der Länge ist eine **Gestaltungsgröße**: es
 * muss so liegen, dass der zwei Meter längere Weg mit zwei Bögen besser
 * dasteht als der kurze mit vier.
 */
export const BOGEN_GEWICHT = 3

export function druckverlust(pfad: readonly KnotenId[]): number {
  if (pfad.length < 2) return 0
  const laenge = pfad.length - 1
  const roh = laenge + zaehleBoegen(pfad) * BOGEN_GEWICHT
  const schlimmst = RASTER.spalten * RASTER.zeilen + (RASTER.zeilen + 1) * BOGEN_GEWICHT
  return Math.min(1, roh / schlimmst)
}

// ---------------------------------------------------------------------------
// Fülldruck (A6)
// ---------------------------------------------------------------------------

/**
 * Das Zielfenster des Fülldrucks für ein Einfamilienhaus, `BELEGT`
 * (`belege/anlagenmechanik.md` 5, zeitstabil).
 */
export const FUELLDRUCK = { min: 1.2, max: 1.8 } as const

/** Ab hier öffnet das Sicherheitsventil und lässt ab. `BELEGT`, ebenda. */
export const SICHERHEITSVENTIL_BAR = 2.5

// ---------------------------------------------------------------------------
// Was die Bühne je Step zeigt
// ---------------------------------------------------------------------------

/**
 * **Eine Welt, viele Zustände** (khpl-tage.md 1, Mechanismus 2) — nur
 * gezeichnet statt gebaut. Die Union unten ist der Vertrag zwischen den Steps
 * und der Zeichnung: jeder Fall ist genau ein Screen, und was er trägt, steht
 * dabei.
 *
 * | Szene | Step | Zeichnung (Spec 7) |
 * | --- | --- | --- |
 * | `anlage` | A1 | Anlagenausschnitt, antippbar |
 * | `keller` | A2 | Kellerschnitt, kalt und alt |
 * | `haus` | A3 | Gebäudeschnitt |
 * | `raster` | A4 | Kellerschnitt als Raster |
 * | `inbetriebnahme` | A6 | Keller + Haus, die Wärme läuft |
 * | `uebergabe` | A7 | Keller warm, darüber das Haus angeschnitten |
 * | `transporter` | A5, A1.1 | Blick über das Armaturenbrett, mittags und nachts |
 *
 * **Warum `transporter` dazugekommen ist.** Spec 7 vergibt A5 und A1.1 an
 * Fotos, Spec 10 hält für beide fest: **das Motiv fehlt.** Ohne Eintrag in der
 * Motivliste rendert `StepFoto` nichts, und die Zäsur des Tages sowie der
 * ehrlichste Screen des Tages standen auf schwarzem Grund. Spec 6 (A5) erlaubt
 * für die Zäsur ausdrücklich die Alternative — „Foto **oder eine ruhige
 * Zeichnung**. Warmes Licht durch die Windschutzscheibe … auf dem
 * Armaturenbrett liegt ein iPad" —, und das Medium der Bühne entscheidet
 * ohnehin jeder Tag selbst (khpl-tage.md 4). A1.1 bekommt dieselbe Zeichnung
 * bei Nacht: **eine Welt, zwei Zustände**, und die Frage „wer fährt eigentlich
 * nachts?" hat damit ein Bild statt einer leeren Fläche.
 *
 * Die Abstecher A3.1, A4.1 und A8.x tragen weiterhin Fotos und kommen hier
 * nicht vor.
 */
export type BuehnenZustand =
  /**
   * A1 — der Anlagenausschnitt: Speicher, Zirkulation, Mischer, Umwälzpumpe.
   * Vektor und kein Foto, weil man antippen können muss, was man prüft.
   */
  | {
      szene: 'anlage'
      /** Was schon geprüft wurde — in der Reihenfolge der Prüfungen. */
      geprueft: readonly PruefungId[]
      /** Läuft gerade eine Prüfung? Dann zeigt die Zeichnung sie an. */
      laeuft: PruefungId | null
      /** Worauf der Besucher getippt hat, als er sich entschieden hat. */
      ursache: PruefungId | null
      /** Der Fall ist gelöst — die Anlage macht wieder warmes Wasser. */
      geloest: boolean
    }
  /**
   * A2 — vierzig Jahre Keller, kalt und alt.
   *
   * `vlies` ist der Handgriff, mit dem der Screen anfängt und den keiner der
   * anderen drei Tage hat: bevor irgendetwas ausgebaut wird, wird die fremde
   * Wohnung geschützt (Spec 6, `INTERVIEW`).
   */
  | {
      szene: 'keller'
      vlies: boolean
      angetippt: readonly BauteilId[]
      /** Das gerade offene Bauteil — es hebt sich aus dem Grau heraus. */
      offen: BauteilId | null
    }
  /**
   * A3 — der Gebäudeschnitt. Dasselbe Haus, das ab hier den ganzen Tag trägt.
   *
   * **Beim Auflösen färbt es sich zum ersten Mal** — und zwar in der
   * Reihenfolge aus Spec 1: zuerst das warme Haus, dann die Bilanz.
   */
  | {
      szene: 'haus'
      /**
       * Welche Verlustflächen schon angetippt wurden.
       *
       * ⚠️ **Ersetzt den früheren `schaetzungKw`.** A3 war der dritte
       * Rate-Regler der Anwendung; der Screen sucht die Heizlast jetzt, statt
       * sie raten zu lassen (siehe `steps/anlagenmechanik/A3.tsx`).
       */
      verluste: readonly string[]
      /** Die zuletzt angetippte Fläche — sie hebt sich heraus. */
      offen: string | null
      aufgeloest: boolean
    }
  /**
   * A4 — derselbe Kellerschnitt, jetzt als Raster.
   *
   * `abgewiesen` ist die tragende Wand: die Leitung geht dort nicht weiter,
   * blockiert wird aber nichts. Den Satz dazu sagt der Step, nicht die
   * Zeichnung.
   */
  | {
      szene: 'raster'
      pfad: readonly KnotenId[]
      /** 0…1, siehe `druckverlust` — ein Balken, keine Einheit. */
      verlust: number
      fertig: boolean
      abgewiesen: KnotenId | null
    }
  /**
   * A6 — Es läuft. Erst der Druck, dann der Signaturmoment.
   *
   * `pfad` ist **der Weg aus A4** und kein anderer: die Wärme läuft die Linie
   * hinauf, die der Besucher selbst gezogen hat. Ohne das ist A6 eine
   * Animation; mit ihm ist es sein Haus.
   */
  | {
      szene: 'inbetriebnahme'
      druckBar: number
      /** Der Druck steht im Fenster — die Anlage darf starten. */
      imFenster: boolean
      pfad: readonly KnotenId[]
      /** 0 = kalt, 1 = die Wärme ist oben angekommen. */
      waerme: number
    }
  /**
   * A7 — der Keller, warm. Und darüber, angeschnitten, das Haus in der anderen
   * Farbe. **Feierabend im Hellen**: dieser Tag endet nachmittags im Wohnhaus
   * einer Familie.
   */
  | {
      szene: 'uebergabe'
      pfad: readonly KnotenId[]
    }
  /**
   * A5 und A1.1 — der Blick über das Armaturenbrett, von innen.
   *
   * `licht: 'mittag'` ist die Zäsur: warmes Licht durch die Windschutzscheibe,
   * **die erste Wärme des Tages**, noch bevor die Anlage läuft — eine leise
   * Vorbereitung auf A6. `licht: 'nacht'` ist der Notdienst-Abstecher:
   * derselbe Blick, dieselbe Scheibe, nur dass draußen nichts als Straße und
   * ein einzelnes Fenster ist.
   *
   * Das iPad auf dem Armaturenbrett steht in beiden Fällen da. Es ist keine
   * Requisite, sondern Arbeitsalltag (`INTERVIEW`, Spec 6 A5) — und der
   * billigste Beleg dafür, dass dieses Handwerk kein Beruf von gestern ist.
   * `technik: 0.85` wird damit nebenbei mit eingelöst.
   */
  | {
      szene: 'transporter'
      licht: 'mittag' | 'nacht'
    }
