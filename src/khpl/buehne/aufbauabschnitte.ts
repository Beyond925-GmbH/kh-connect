import { PHASEN } from '@/dachstuhl/zeitachse'

/**
 * Wo M5 aufhört und was M7 abfragt — abgeleitet aus der Zeitachse, nicht als
 * Zahl hineingeschrieben.
 *
 * `src/dachstuhl/zeitachse.ts` ist in Bewegung: Phasen kommen dazu, Grenzen
 * verschieben sich, und die Zahlen darin sind Animationsparameter, keine
 * Vertragswerte. Ein hart notiertes `0.42` wäre beim nächsten eingeschobenen
 * Bauteil still falsch. Deshalb wird über das **Label** gesucht: die
 * Aufrichtfolge ist fachlich festgelegt, ihre Namen ändern sich nicht.
 *
 * **Der Schnitt liegt vor den Sparren.** M5 zeigt den Unterbau und hält genau
 * dort an, wo der Aha-Moment sitzt: bevor der erste Sparren fliegt, steht die
 * Sicherung. Damit ist der Satz beim Anhalten wörtlich wahr, und M7 („Jetzt
 * du“) löst das Versprechen aus M5 ein: „Schau zu — gleich bist du dran.“ Der
 * Besucher fliegt die Sparren selbst ein.
 *
 * Nebeneffekt, der die Entscheidung trägt: nur so ist die Rückmeldung „Der
 * Kehlbalken hängt in der Luft. Erst die Sparren, dann das, was sie
 * verbindet.“ überhaupt erreichbar. Läge der Schnitt hinter den Sparren,
 * wäre der Kehlbalken immer die erste richtige Antwort.
 */

/**
 * Ein Hauch vor einer Phasengrenze. Genau auf ihr gilt das erste Bauteil der
 * Folgephase schon als sichtbar (`sichtbar` prüft `t >= start`) und stünde mit
 * Fortschritt 0 an seiner Einflugposition in der Luft.
 */
const HAARBREIT = 0.002

function phase(label: string) {
  const p = PHASEN.find((x) => x.label === label)
  if (!p) {
    throw new Error(
      `Aufbauphase „${label}“ fehlt in zeitachse.ts — M5 und M7 hängen an ihr.`,
    )
  }
  return p
}

/** M5 baut den Unterbau: alles, worauf die Sparren später aufliegen. */
export const M5_ENDE = phase('Sparrenpaare').von - HAARBREIT

/** M7 macht genau dort weiter. */
export const M7_START = M5_ENDE

/**
 * Was M5 der Reihe nach einbauen lässt — der Unterbau, Teil für Teil.
 *
 * **Warum überhaupt eine Liste.** M5 war eine Vorführung: 26 Sekunden
 * Animation, daneben eine Pille, die mitlas, was gerade einflog. Wer am Stand
 * dreißig Sekunden investiert, schaut dabei nicht auf den Namen — er wartet,
 * bis es vorbei ist. Jetzt setzt der Besucher jedes Teil selbst, mit einer
 * Vorschau davor: **er kann nichts falsch machen**, die Reihenfolge ist
 * vorgegeben. Genau das ist der Unterschied zu M7, wo dieselbe Reihenfolge
 * ohne Ansage abgefragt wird — geführt üben, dann aus dem Kopf.
 *
 * Die Sätze sind aus `dachstuhl/bauteil-texte.ts` auf eine Zeile gekürzt: auf
 * einer Karte, die man antippt, um weiterzukommen, liest niemand vier Zeilen.
 */
export interface Lehrschritt {
  /** Phasenlabel in `zeitachse.ts`. */
  label: string
  /** Was auf der Karte steht. */
  name: string
  /** Der eine Satz dazu. */
  was: string
  /** Zeitpunkt, bis zu dem die Animation nach dem Antippen läuft. */
  zielT: number
}

export const M5_SCHRITTE: Lehrschritt[] = [
  {
    label: 'Fußpfetten',
    name: 'Fußpfetten',
    was: 'Das unterste Holz, direkt oben auf der Mauer. Darauf sitzt später jeder Sparren mit seinem Fuß.',
    zielT: phase('Fußpfetten').bis - HAARBREIT,
  },
  {
    label: 'Bundbalken',
    name: 'Bundbalken',
    was: 'Quer über das Haus. Er hält die Wände zusammen, damit das Dach sie nicht auseinanderdrückt.',
    zielT: phase('Bundbalken').bis - HAARBREIT,
  },
  {
    label: 'Stuhlschwellen',
    name: 'Stuhlschwellen',
    was: 'Die liegenden Hölzer unter den Säulen. Sie verteilen das Gewicht, das von oben kommt, auf mehrere Deckenbalken.',
    zielT: phase('Stuhlschwellen').bis - HAARBREIT,
  },
  {
    label: 'Stuhlsäulen',
    name: 'Stuhlsäulen',
    was: 'Die Pfosten, die die Längsbalken tragen. Über sie geht das Gewicht des ganzen Dachs nach unten in die Decke.',
    zielT: phase('Stuhlsäulen').bis - HAARBREIT,
  },
  {
    label: 'Mittelpfetten',
    name: 'Mittelpfetten',
    was: 'Der Längsbalken auf halber Höhe der Dachfläche. Er halbiert die Strecke, die ein Sparren ohne Stütze überbrücken muss.',
    zielT: phase('Mittelpfetten').bis - HAARBREIT,
  },
  {
    label: 'Firstpfette',
    name: 'Firstpfette',
    was: 'Der oberste Längsbalken, direkt unter der Spitze. Auf ihm treffen sich alle Sparren.',
    zielT: phase('Firstpfette').bis - HAARBREIT,
  },
  {
    label: 'Kopfbänder',
    name: 'Kopfbänder',
    was: 'Die kurzen Schrägen zwischen Säule und Pfette. Aus dem rechten Winkel wird ein Dreieck — und Dreiecke kippen nicht.',
    zielT: phase('Kopfbänder').bis - HAARBREIT,
  },
]

export interface Bauschritt {
  /** Phasenlabel in `zeitachse.ts`. */
  label: string
  /** Was auf der Karte steht. */
  name: string
  /**
   * Der eine Satz, der den Begriff erklärt — wie `Lehrschritt.was` in M5.
   * Erscheint in der Vorführung und unter dem Kartennamen: M7 fragte fünf
   * Fachbegriffe ab, von denen drei in M5 nie vorkamen — „Windrispenbänder“
   * als nacktes Wort auf einer Karte ist eine Vokabelfrage, kein
   * Bau-Verständnis.
   */
  was: string
  /** Warum es genau jetzt dran ist — erscheint nach dem richtigen Ablegen. */
  richtig: string
  /** Warum es noch nicht dran ist — erscheint, wenn zu früh abgelegt. */
  zufrueh: string
  /** Zeitpunkt, bis zu dem die Animation nach dem richtigen Ablegen läuft. */
  zielT: number
}

/**
 * Die Reihenfolge, die M7 abfragt. Die Texte für „richtig“ und „zu früh“
 * halten alle denselben Ton. Die `was`-Sätze sind wie in M5 aus
 * `dachstuhl/bauteil-texte.ts` auf eine Zeile gekürzt.
 */
export const M7_SCHRITTE: Bauschritt[] = [
  {
    label: 'Sparrenpaare',
    name: 'Sparrenpaare',
    // Kein „fertiges Dreieck vom Kran“: das Modell ist ein **Pfettendach**, und
    // dort wird jeder Sparren einzeln auf Fuß-, Mittel- und Firstpfette
    // aufgeklaut. Als vormontiertes Dreieck eingehoben werden Sparren- und
    // Kehlbalkendächer oder Nagelbinder — nicht diese Konstruktion.
    // (Korrektur aus `dachstuhl/bauteil-texte.ts`; der Board-Fachtext in M5
    // spricht weiterhin vom Kran, der die Sparrenpaare einhebt — das gehört
    // beim Gegenlesen durch die Innung mit auf den Tisch.)
    was: 'Die schrägen Hölzer, die die Dachfläche tragen. Zwei gegenüberliegende bilden ein Paar.',
    richtig: 'Sitzt. Jeder Sparren liegt jetzt auf drei Pfetten auf: Fuß, Mitte, First.',
    zufrueh:
      'Die Sparren brauchen etwas zum Aufliegen. Die Pfetten stehen — die kommen zuerst.',
    zielT: phase('Sparrenpaare').bis - HAARBREIT,
  },
  {
    label: 'Kehlbalken',
    name: 'Kehlbalken',
    was: 'Der waagerechte Balken, der ein Sparrenpaar im oberen Drittel verbindet.',
    richtig: 'Sitzt. Jetzt können sich die Sparren nicht mehr durchbiegen.',
    zufrueh:
      'Der Kehlbalken hängt in der Luft. Erst die Sparren, dann das, was sie verbindet.',
    zielT: phase('Kehlbalken').bis - HAARBREIT,
  },
  {
    label: 'Windrispenbänder',
    name: 'Windrispenbänder',
    was: 'Das gelochte Stahlband, das diagonal über die Sparren läuft.',
    richtig: 'Sitzt. Jetzt kann der Wind das Dach nicht mehr der Länge nach verschieben.',
    // Der Satz darf **nicht** voraussetzen, dass die Sparren fehlen: seit M7
    // je zwei Karten gegeneinander stellt, steht dieses Teil auch dann zur
    // Wahl, wenn die Sparren längst liegen und der Kehlbalken dran ist.
    zufrueh:
      'Noch nicht. Das Band kommt erst, wenn die Sparren untereinander verbunden sind.',
    zielT: phase('Windrispenbänder').bis - HAARBREIT,
  },
  {
    label: 'Konterlattung',
    name: 'Konterlattung',
    was: 'Die Latte längs auf dem Sparren. Sie hebt die Dachlatten an, damit Luft durchzieht.',
    richtig: 'Sitzt. Der Spalt darunter ist Absicht — da zieht Luft durch.',
    // Auch dieser Satz gilt jetzt für jeden Stand, in dem die Konterlattung
    // als Gegenkarte auftauchen kann — vom leeren Sparrenfeld bis zum
    // ausgesteiften Tragwerk.
    zufrueh:
      'Noch nicht. Die Konterlatte kommt erst obendrauf, wenn das Tragwerk fertig ausgesteift ist.',
    zielT: phase('Konterlattung').bis - HAARBREIT,
  },
  {
    label: 'Dachlattung',
    name: 'Dachlatten',
    was: 'Die waagerechten Latten, in die später die Ziegel eingehängt werden.',
    // Nicht „da hängt der Dachdecker morgen die Ziegel ein“: seit der gebaute
    // Tag dem Dachdecker gehört, ist der Besucher selbst gemeint, und der Satz
    // schickte ihn zu sich selbst (dieselbe Korrektur wie bei den Dachziegeln
    // in B4.1).
    richtig: 'Sitzt. Da hängst du morgen die Ziegel ein.',
    zufrueh: 'Noch nicht. Die Dachlatten liegen quer auf der Konterlattung.',
    // Bis ganz nach vorn: das fertige Dach ist das Belohnungsbild.
    zielT: 1,
  },
]
