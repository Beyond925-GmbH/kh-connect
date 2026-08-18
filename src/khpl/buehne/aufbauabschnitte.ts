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
 * dort an, wo flow 7 M5 den Aha-Moment setzt — „bevor der erste Sparren
 * fliegt, steht die Sicherung“. Damit ist der Satz beim Anhalten wörtlich wahr,
 * und M7 („Jetzt du“) löst das Versprechen aus M5 ein: „Schau zu — gleich bist
 * du dran.“ Der Besucher fliegt die Sparren selbst ein.
 *
 * Nebeneffekt, der die Entscheidung trägt: nur so ist die Rückmeldung aus
 * flow 11 („Der Kehlbalken hängt in der Luft. Erst die Sparren, dann das, was
 * sie verbindet.“) überhaupt erreichbar. Läge der Schnitt hinter den Sparren,
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

export interface Bauschritt {
  /** Phasenlabel in `zeitachse.ts`. */
  label: string
  /** Was auf der Zieh-Karte steht. */
  name: string
  /** Warum es genau jetzt dran ist — erscheint nach dem richtigen Ablegen. */
  richtig: string
  /** Warum es noch nicht dran ist — erscheint, wenn zu früh abgelegt. */
  zufrueh: string
  /** Zeitpunkt, bis zu dem die Animation nach dem richtigen Ablegen läuft. */
  zielT: number
}

/**
 * Die Reihenfolge, die M7 abfragt. Texte für „richtig“ und „zu früh“ folgen
 * flow 11 (M7), wo die Spec sie vorgibt; die übrigen sind im selben Ton
 * ergänzt (`ENTWURF – UNGEPRÜFT`).
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
    richtig: 'Sitzt. Jeder Sparren liegt jetzt auf drei Pfetten auf: Fuß, Mitte, First.',
    zufrueh:
      'Die Sparren brauchen etwas zum Aufliegen. Die Pfetten stehen — die kommen zuerst.',
    zielT: phase('Sparrenpaare').bis - HAARBREIT,
  },
  {
    label: 'Kehlbalken',
    name: 'Kehlbalken',
    richtig: 'Sitzt. Jetzt können sich die Sparren nicht mehr durchbiegen.',
    zufrueh:
      'Der Kehlbalken hängt in der Luft. Erst die Sparren, dann das, was sie verbindet.',
    zielT: phase('Kehlbalken').bis - HAARBREIT,
  },
  {
    label: 'Windrispenbänder',
    name: 'Windrispenbänder',
    richtig: 'Sitzt. Jetzt kann der Wind das Dach nicht mehr der Länge nach verschieben.',
    zufrueh: 'Noch nicht. Ein Band diagonal über die Sparren braucht erst mal Sparren.',
    zielT: phase('Windrispenbänder').bis - HAARBREIT,
  },
  {
    label: 'Konterlattung',
    name: 'Konterlattung',
    richtig: 'Sitzt. Der Spalt darunter ist Absicht — da zieht Luft durch.',
    zufrueh:
      'Noch nicht. Die Konterlatte liegt längs auf dem Sparren, und der ist noch nicht da.',
    zielT: phase('Konterlattung').bis - HAARBREIT,
  },
  {
    label: 'Dachlattung',
    name: 'Dachlatten',
    richtig: 'Sitzt. Da hängt der Dachdecker morgen die Ziegel ein.',
    zufrueh: 'Noch nicht. Die Dachlatten liegen quer auf der Konterlattung.',
    // Bis ganz nach vorn: das fertige Dach ist das Belohnungsbild.
    zielT: 1,
  },
]
