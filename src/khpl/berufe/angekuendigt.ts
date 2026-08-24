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

export const DACHDECKER: BerufDef = {
  id: 'dachdecker',
  name: 'Dachdecker/Dachdeckerin',
  kurz: 'Dachdecker',
  zeile: 'Die Hülle, die dicht hält. Ziegel, Abdichtung, Solar.',
  // Die Nachbarschaft zum Zimmerer ist inhaltlich richtig und im Matching das
  // eigentliche Problem: beide draußen, beide oben, beide auf demselben Dach.
  // Getrennt werden sie über Frage 3 (Tragwerk gegen Hülle) und über `sinn` —
  // PV und Dachbegrünung liegen beim Dachdecker.
  merkmale: {
    anpacken: 0.9,
    praezision: 0.5,
    technik: 0.35,
    draussen: 1,
    hoehe: 1,
    team: 0.7,
    sinn: 0.7,
  },
  // ⚠️ Für diesen Beruf gibt es im Repo **kein einziges Motiv**. Die Pfade
  // stehen so, wie sie heißen werden; bis die Dateien da sind, greift der
  // Fallback in `BerufKarte` und `BerufBald`.
  medien: {
    karte: '/medien/media/dachdecker/card.webp',
    heroPoster: '/medien/media/dachdecker/hero-poster.webp',
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
