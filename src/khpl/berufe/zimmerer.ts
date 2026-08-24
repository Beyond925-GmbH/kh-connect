import type { BerufDef } from './typen'

/**
 * Zimmerer/Zimmerin — **angekündigt, noch nicht gebaut** (`graph: null`).
 *
 * **Warum er schon hier steht.** Ein Beruf, der erst mit seinem ersten fertigen
 * Screen in die App kommt, verändert beim Erscheinen still die Empfehlung:
 * dieselben vier Antworten führen vorher zu Zimmerer und nachher zu
 * Zerspanungsmechaniker. Wer den Trichter gegen ein Angebot testet, das noch
 * nicht vollständig ist, testet ihn zweimal. Mit `graph: null` läuft er im
 * Matching mit, erscheint in der Liste, und der einzige Unterschied ist der
 * Screen am Ende — der sagt, was Sache ist.
 *
 * **Was zu tun ist, um ihn fertigzustellen:** `graph` mit `baueGraph` füllen
 * (Vorbild: `dachdecker.ts`), `auftrag` schreiben, `bilder` mit den Motiven
 * seiner Steps belegen, Medien nach `public/medien/media/zimmerer/` legen. Die
 * Hülle ändert sich nicht.
 *
 * **Sein Id-Präfix ist `C`** (khpl-tage.md §6.1 V4): `C1`–`Cn` auf der
 * Hauptlinie, Abstecher mit `.`-Suffix (`C5.1`). `M`/`B` gehören dem
 * Dachdecker, `Z` der Zerspanung, `A` der Anlagenmechanik. Sichtbar ist davon
 * nichts — die Rail zeigt „Schritt 4 von 9“, nie eine Id.
 *
 * ⚠️ **Merkmale und Texte hier sind gesetzt, nicht recherchiert.** Sie sind
 * plausibel und reichen, um den Trichter zu bauen und zu bedienen. Sie sind
 * *nicht* die Sorgfalt, die `khpl-flow.md` §10 aufbringt — jede Zahl, jede
 * Aussage über Vergütung, Ausbildungsordnung oder Aufstieg muss belegt werden,
 * bevor sie einem Vierzehnjährigen gezeigt wird.
 */
export const ZIMMERER: BerufDef = {
  id: 'zimmerer',
  name: 'Zimmerer/Zimmerin',
  kurz: 'Zimmerer',
  zeile: 'Das Tragwerk, das alles hält. Balken, Abbund, Aufrichten.',
  // Die Nachbarschaft zum Dachdecker ist inhaltlich richtig und im Matching
  // das eigentliche Problem: beide draußen, beide oben, beide auf demselben
  // Dach. Getrennt werden sie über Frage 3 (Tragwerk gegen Hülle) und über
  // `technik` — der Abbund läuft über CAD und CNC.
  merkmale: {
    anpacken: 1,
    praezision: 0.65,
    technik: 0.5,
    draussen: 0.9,
    hoehe: 0.95,
    team: 0.8,
    sinn: 0.6,
  },
  // Die Motive unter `media/zimmerer/` zeigen Zimmerleute an Balken und
  // gehören der Sache nach hierher — sie sind aber an den gebauten Tag
  // vergeben (`dachdecker.ts`), solange der keine eigenen hat. Deshalb hier
  // Pfade, die es noch nicht gibt, und der Fallback in `BerufBild`.
  medien: {
    karte: '/medien/media/zimmerer-tag/card.webp',
    heroPoster: '/medien/media/zimmerer-tag/hero-poster.webp',
  },
  bilder: {},
  graph: null,
}
