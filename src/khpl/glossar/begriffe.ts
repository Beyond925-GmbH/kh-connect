/**
 * Glossar nach khpl-flow.md 12 — zwanzig Einträge, wörtlich übernommen.
 *
 * `ENTWURF – UNGEPRÜFT` in der Formulierung: laut Spec vor der Messe von der
 * Innung gegenlesen lassen. Hier ist eine falsche Definition peinlicher als
 * anderswo, weil der Besucher sie für die Antwort hält.
 *
 * Ein einundzwanzigster Eintrag steht darunter: `stundensatz` wird in der
 * Umsetzung von M2 (khpl-flow.md 7) als antippbarer Begriff genannt, fehlt aber
 * in der Liste aus 6.3. Er ist deshalb gesondert markiert.
 */

export interface Begriffseintrag {
  /** Überschrift im Popover. */
  label: string
  erklaerung: string
  /** Nicht in der Liste aus khpl-flow.md 6.3 — braucht eine eigene Freigabe. */
  nachgetragen?: boolean
}

export const BEGRIFFE = {
  sparren: {
    label: 'Sparren',
    erklaerung:
      'Die schrägen Balken, die von der Traufe zum First laufen und die Dachfläche tragen. Sie liegen sich paarweise gegenüber und stützen einander.',
  },
  sparrenpaar: {
    label: 'Sparrenpaar',
    erklaerung:
      'Zwei gegenüberliegende Sparren, die oben am First zusammenstoßen. Sie werden meist am Boden vormontiert und als Ganzes vom Kran eingehoben.',
  },
  pfette: {
    label: 'Pfette',
    erklaerung:
      'Ein waagerechter Balken, der quer unter den Sparren liegt und sie stützt. Nach ihrer Lage heißen sie Fußpfette, Mittelpfette und Firstpfette.',
  },
  kehlbalken: {
    label: 'Kehlbalken',
    erklaerung:
      'Ein waagerechter Balken, der ein Sparrenpaar auf halber Höhe verbindet. Er verhindert, dass die Sparren sich durchbiegen — und bildet nebenbei die Decke des Spitzbodens.',
  },
  first: {
    label: 'First',
    erklaerung:
      'Die oberste Kante des Dachs, an der die beiden Dachflächen zusammentreffen.',
  },
  traufe: {
    label: 'Traufe',
    erklaerung:
      'Die untere Kante der Dachfläche, an der das Regenwasser abläuft. Dort hängt die Dachrinne.',
  },
  gaube: {
    label: 'Gaube',
    erklaerung:
      'Ein Aufbau, der aus der Dachfläche herausragt und ein senkrechtes Fenster aufnimmt. Sie schafft Kopfhöhe und Licht — und ist der aufwendigste Teil vieler Dächer. Deshalb wird sie im Angebot separat gerechnet.',
  },
  abbund: {
    label: 'Abbund',
    erklaerung:
      'Das Zuschneiden und Ausarbeiten aller Hölzer eines Dachstuhls, bevor sie zur Baustelle kommen: auf Maß bringen, Verbindungen ausarbeiten, nummerieren.',
  },
  abbundplan: {
    label: 'Abbundplan',
    erklaerung:
      'Die Zeichnung, aus der hervorgeht, wie jedes einzelne Holz aussehen muss — Länge, Querschnitt, Winkel, Verbindungen, Nummer. Aus ihm entsteht auch die Materialliste.',
  },
  abbundanlage: {
    label: 'Abbundanlage',
    erklaerung:
      'Eine CNC-Maschine, die Hölzer nach dem Abbundplan automatisch sägt, bohrt und fräst. Sie hat den Abbund von Hand nicht ersetzt, übernimmt aber den Großteil der Serienteile.',
  },
  cad: {
    label: 'CAD',
    erklaerung:
      'Computer Aided Design — Konstruieren am Rechner. Im Holzbau entsteht daraus direkt der Abbundplan und oft auch die Datei, mit der die Abbundanlage arbeitet.',
  },
  statik: {
    label: 'Statik',
    erklaerung:
      'Die Berechnung, ob ein Bauteil die Lasten trägt, die auf es wirken: Eigengewicht, Schnee, Wind. Sie kommt vom Statiker oder Ingenieurbüro — der Zimmerer baut nach ihr.',
  },
  kvh: {
    label: 'KVH',
    erklaerung:
      'Konstruktionsvollholz: technisch getrocknetes, gehobeltes Bauholz mit festgelegten Eigenschaften. Der Standard für Sparren und Pfetten, weil es maßhaltig bleibt und kaum reißt.',
  },
  brettschichtholz: {
    label: 'Brettschichtholz',
    erklaerung:
      'Mehrere Brettlagen, faserparallel verleimt. Dadurch tragfähiger und formstabiler als ein Balken aus einem Stück — und in Längen und Krümmungen lieferbar, die kein Baum hergibt. Kurz: BSH oder Leimbinder.',
  },
  psa: {
    label: 'PSA',
    erklaerung:
      'Persönliche Schutzausrüstung: Helm, Sicherheitsschuhe, Handschuhe, Warnkleidung. Was jeder am Körper trägt, bevor er die Baustelle betritt.',
  },
  psaga: {
    label: 'PSAgA',
    erklaerung:
      'Persönliche Schutzausrüstung gegen Absturz: Auffanggurt, Verbindungsmittel, Anschlagpunkt. Sie kommt erst zum Einsatz, wenn Seitenschutz oder Gerüst technisch nicht möglich sind — kollektive Sicherung hat immer Vorrang.',
  },
  aufmass: {
    label: 'Aufmaß',
    erklaerung:
      'Das Messen am Bau — vorher, um zu planen, und hinterher, um die erbrachte Leistung abzurechnen. Vom Zollstock bis zum Laserdistanzmesser.',
  },
  absturzsicherung: {
    label: 'Absturzsicherung',
    erklaerung:
      'Alles, was verhindert, dass jemand herunterfällt: Geländer, Seitenschutz, Fanggerüst, Netze. Ab mehr als zwei Metern Absturzhöhe ist sie Pflicht, bei besonderen Gefahren schon ab einem Meter.',
  },
  gewerk: {
    label: 'Gewerk',
    erklaerung:
      'Ein abgegrenzter Arbeitsbereich am Bau, meist ein Handwerk: Zimmerer, Dachdecker, Elektro, Sanitär. Wer welches Gewerk wann ausführt, ist die halbe Bauplanung.',
  },
  'laufender-meter': {
    label: 'laufender Meter',
    erklaerung:
      'Abrechnungseinheit für alles, was in erster Linie eine Länge hat — Balken, Pfetten, Rinnen. Abgekürzt lfd. m. Flächen werden in Quadratmetern abgerechnet, Längen in laufenden Metern.',
  },
  stundensatz: {
    label: 'Stundensatz',
    erklaerung:
      'Was eine Arbeitsstunde im Angebot kostet. Darin steckt nicht nur der Lohn, sondern auch Werkzeug, Fahrzeug, Werkstatt und Verwaltung. Im Zimmererhandwerk liegt er grob zwischen 50 und 90 Euro.',
    nachgetragen: true,
  },
} as const satisfies Record<string, Begriffseintrag>

export type BegriffId = keyof typeof BEGRIFFE

export function istBegriffId(wert: string): wert is BegriffId {
  return Object.hasOwn(BEGRIFFE, wert)
}
