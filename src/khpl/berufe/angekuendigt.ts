import type { BerufDef } from './typen'

/**
 * Die drei Berufe, die es im Angebot schon gibt und als Tag noch nicht.
 *
 * **Warum sie überhaupt schon hier stehen.** Ein Beruf, der erst mit seinem
 * ersten fertigen Screen in die App kommt, verändert beim Erscheinen still die
 * Empfehlung: dieselben vier Antworten führen vorher zu Zimmerer und nachher
 * zu Zerspanungsmechaniker. Wer den Trichter gegen ein Angebot testet, das
 * noch nicht vollständig ist, testet ihn zweimal. Mit `graph: null` laufen sie
 * im Matching mit, erscheinen in der Liste, und der einzige Unterschied ist
 * der Screen am Ende — der sagt, was Sache ist.
 *
 * **Was zu tun ist, um einen davon fertigzustellen:** `graph` mit `baueGraph`
 * füllen (Vorbild: `zimmerer.ts`), `auftrag` schreiben, Medien nach
 * `public/medien/media/<id>/` legen. Die Hülle ändert sich nicht.
 *
 * ⚠️ **Merkmale und Texte hier sind gesetzt, nicht recherchiert.** Sie sind
 * plausibel und reichen, um den Trichter zu bauen und zu bedienen. Sie sind
 * *nicht* die Sorgfalt, die `khpl-flow.md` §10 für den Zimmerer aufbringt —
 * jede Zahl, jede Aussage über Vergütung, Ausbildungsordnung oder Aufstieg
 * muss belegt werden, bevor sie einem Vierzehnjährigen gezeigt wird.
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
  graph: null,
}

export const ZERSPANUNGSMECHANIKER: BerufDef = {
  id: 'zerspanungsmechaniker',
  name: 'Zerspanungsmechaniker/-mechanikerin',
  kurz: 'Zerspanung',
  zeile: 'Metall auf den Hundertstel. Du programmierst, die CNC fräst.',
  merkmale: {
    anpacken: 0.5,
    praezision: 1,
    technik: 1,
    draussen: 0.05,
    hoehe: 0.05,
    team: 0.4,
    sinn: 0.3,
  },
  medien: {
    karte: '/medien/media/zerspanungsmechaniker/card.webp',
    heroPoster: '/medien/media/zerspanungsmechaniker/hero-poster.webp',
    hero: '/medien/media/zerspanungsmechaniker/hero.mp4',
  },
  graph: null,
}

export const ANLAGENMECHANIKER: BerufDef = {
  id: 'anlagenmechaniker',
  name: 'Anlagenmechaniker/-mechanikerin SHK',
  kurz: 'Anlagenmechanik',
  zeile: 'Wärmepumpe statt Ölkessel. Du baust die Energiewende ein.',
  merkmale: {
    anpacken: 0.8,
    praezision: 0.7,
    technik: 0.85,
    draussen: 0.3,
    hoehe: 0.15,
    team: 0.5,
    sinn: 1,
  },
  medien: {
    karte: '/medien/media/anlagenmechaniker/card.webp',
    heroPoster: '/medien/media/anlagenmechaniker/hero-poster.webp',
    hero: '/medien/media/anlagenmechaniker/hero.mp4',
  },
  graph: null,
}
