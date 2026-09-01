/**
 * Bauteiltypen, Beschriftungen, Erklaertexte und Materialfarben.
 *
 * Die Erklaertexte gehoeren vor der Messe der Innung zum Gegenlesen vorgelegt,
 * genau wie das uebrige Glossar.
 *
 * Sobald diese Karten ueber B3.2 am Stand erscheinen, gilt fuer sie dieselbe
 * Vorsicht wie fuer jede Zahl auf der Buehne: konkrete Masse und Mengen sind
 * daraus entfernt (Saeulenabstand, Lattweite). Sie waren mit den
 * Modellparametern konsistent, aber durch keine Quelle gedeckt — und ein
 * Jugendlicher liest eine Zahl auf einer Erklaerkarte als Tatsache ueber echte
 * Daecher, nicht als Angabe ueber dieses eine Modell.
 *
 * Die Farben stehen bewusst hier und nicht als Tailwind-Token: innerhalb des
 * <Canvas> gibt es kein Tailwind. Theme-abhaengig sind nur Hintergrund, Boden
 * und Lichtstaerken — das Holz bleibt Holz.
 */

export type BauteilTyp =
  | 'rohdecke'
  | 'fusspfette'
  | 'bundbalken'
  | 'stuhlschwelle'
  | 'firstsaeule'
  | 'mittelsaeule'
  | 'mittelpfette'
  | 'firstpfette'
  | 'kopfband'
  | 'sparren'
  | 'kehlbalken'
  | 'windrispe'
  | 'konterlatte'
  | 'traglatte'
  | 'traufbohle'
  | 'ortgangbrett'
  | 'zone-first'
  | 'zone-traufe'

export interface BauteilText {
  label: string
  text: string
  antippbar: boolean
}

export const BAUTEIL_TEXTE: Record<BauteilTyp, BauteilText> = {
  rohdecke: {
    label: 'Rohdecke',
    text: 'Die Betondecke über dem Obergeschoss. Sie ist hier nur die Standfläche des Modells.',
    antippbar: false,
  },
  sparren: {
    label: 'Sparrenpaar',
    // Pfettendach: die Sparren werden einzeln auf die Pfetten aufgelegt. Als
    // fertiges Dreieck eingehoben werden Sparren- und Kehlbalkendaecher oder
    // Nagelbinder — nicht diese Konstruktion.
    text: 'Die schrägen Hölzer heißen Sparren. Sie liegen auf drei Längsbalken auf — unten, auf halber Höhe und oben an der Spitze. Diese Längsbalken heißen Pfetten. Zwei gegenüberliegende Sparren bilden ein Sparrenpaar.',
    antippbar: true,
  },
  kehlbalken: {
    label: 'Kehlbalken',
    text: 'Der waagerechte Balken, der ein Sparrenpaar im oberen Drittel verbindet. Er hält die Sparren davon ab, sich durchzubiegen, und bildet nebenbei den Boden des Spitzbodens.',
    antippbar: true,
  },
  firstpfette: {
    label: 'Firstpfette',
    text: 'Der oberste Längsbalken, direkt unter der Dachspitze. Alle Sparren sitzen mit einer Kerbe auf ihm. Ohne ihn wäre die Dachspitze nur eine Linie und kein Bauteil.',
    antippbar: true,
  },
  mittelpfette: {
    label: 'Mittelpfette',
    text: 'Der Längsbalken etwa auf halber Höhe der Dachfläche. Er halbiert die Strecke, die ein Sparren ohne Stütze überbrücken muss. Deshalb reicht hier ein dünnerer Sparren. Getragen wird er von den Stuhlsäulen.',
    antippbar: true,
  },
  fusspfette: {
    label: 'Fußpfette (Mauerlatte)',
    text: 'Das unterste Holz, es liegt oben auf der Mauer. Jeder Sparren sitzt mit einer Kerbe darauf — die heißt Kerve — und gibt das Gewicht, das auf ihm liegt, an die Wand weiter.',
    antippbar: true,
  },
  stuhlschwelle: {
    label: 'Stuhlschwelle',
    text: 'Das liegende Holz unter einer Säulenreihe. Es verteilt das Gewicht, das die Säulen von oben herunterbringen, auf mehrere Deckenbalken, statt alles auf einen einzigen zu drücken.',
    antippbar: true,
  },
  firstsaeule: {
    label: 'Stuhlsäule',
    text: 'Der senkrechte Pfosten unter einem Längsbalken. Er steht auf der Stuhlschwelle und gibt das Gewicht, das von oben kommt, nach unten an die Decke weiter — in regelmäßigen Abständen über die ganze Länge.',
    antippbar: true,
  },
  mittelsaeule: {
    label: 'Stuhlsäule',
    text: 'Der senkrechte Pfosten unter einem Längsbalken. Er steht auf der Stuhlschwelle und gibt das Gewicht, das von oben kommt, nach unten an die Decke weiter — in regelmäßigen Abständen über die ganze Länge.',
    antippbar: true,
  },
  kopfband: {
    label: 'Kopfband',
    text: 'Die kurze Schräge zwischen Säule und Pfette. Sie macht aus dem rechten Winkel ein Dreieck — und Dreiecke kippen nicht.',
    antippbar: true,
  },
  bundbalken: {
    label: 'Bundbalken',
    text: 'Der waagerechte Balken quer über das Haus. Er hält die beiden Außenwände zusammen, damit das Dach sie nicht auseinanderdrückt, und trägt zugleich den Boden des Dachbodens.',
    antippbar: true,
  },
  windrispe: {
    label: 'Windrispenband',
    text: 'Das gelochte Stahlband, das diagonal über die Sparren läuft. Ohne es könnte der Wind das ganze Dach der Länge nach verschieben wie ein Kartenhaus.',
    antippbar: true,
  },
  traglatte: {
    label: 'Dachlatte',
    text: 'Auf diesen waagerechten Latten werden später die Ziegel eingehängt. Ihr Abstand hängt davon ab, wie weit ein Ziegel den nächsten überdeckt. Ganz unten am Dachrand — der heißt Traufe — sitzt die erste Latte etwas enger.',
    antippbar: true,
  },
  konterlatte: {
    label: 'Konterlatte',
    text: 'Die Latte, die längs auf dem Sparren liegt und die Dachlatten anhebt. Der Spalt darunter ist Absicht: Dort zieht Luft durch, damit das Holz trocken bleibt.',
    antippbar: true,
  },
  traufbohle: {
    label: 'Traufbohle (Stirnbrett)',
    text: 'Das Brett quer vor den Sparrenenden. Es schließt die Dachfläche unten an der Traufe ab, gibt der untersten Dachlatte Halt und trägt später die Dachrinne.',
    antippbar: true,
  },
  ortgangbrett: {
    label: 'Ortgangbrett (Windbrett)',
    text: 'Das Brett an der schrägen Seitenkante des Dachs — dem Ortgang —, außen auf dem letzten Sparren. Es deckt die Lattenenden ab und hält den Wind davon ab, unter die Ziegel zu greifen.',
    antippbar: true,
  },
  'zone-first': {
    label: 'First',
    text: 'Die oberste Kante des Dachs, wo die beiden Dachflächen aufeinandertreffen. Hier hängt beim Richtfest der Richtkranz.',
    antippbar: true,
  },
  'zone-traufe': {
    label: 'Traufe',
    text: 'Die untere Kante der Dachfläche. Hier läuft das Regenwasser ab, deshalb kommt hier später die Dachrinne hin.',
    antippbar: true,
  },
}

/** Sparren bekommen vier Toene, zyklisch nach animIndex — das taeuscht Maserung vor. */
export const SPARREN_FARBEN = ['#A9743F', '#A3703C', '#AE7A45', '#9E6B39'] as const

const FARBEN: Record<BauteilTyp, string> = {
  rohdecke: '#B9B4AC',
  sparren: SPARREN_FARBEN[0],
  firstpfette: '#8A5A31',
  mittelpfette: '#8A5A31',
  fusspfette: '#8A5A31',
  bundbalken: '#94623A',
  stuhlschwelle: '#875836',
  firstsaeule: '#7E5230',
  mittelsaeule: '#7E5230',
  kopfband: '#7E5230',
  kehlbalken: '#8F5F36',
  konterlatte: '#C08A50',
  traglatte: '#C08A50',
  // Bretter etwas heller und kuehler als die Latten: sie sind gehobelte
  // Schalung, kein Konstruktionsholz, und sollen sich als Kante absetzen.
  traufbohle: '#CFA274',
  ortgangbrett: '#CFA274',
  windrispe: '#9AA3AA',
  'zone-first': '#FF9F2A',
  'zone-traufe': '#FF9F2A',
}

/** Ersatzeintrag, wenn ein Typ keine Stammdaten hat. Nie im Normalbetrieb. */
const ERSATZ_TEXT: BauteilText = {
  label: 'Unbekanntes Bauteil',
  text: 'Für dieses Bauteil ist noch kein Erklärtext hinterlegt.',
  antippbar: false,
}

const ERSATZ_FARBE = '#8A5A31'

/** Schon gemeldete Luecken — die Warnung soll einmal kommen, nicht je Frame. */
const gemeldet = new Set<string>()

function melde(typ: string, was: string): void {
  const schluessel = `${was}:${typ}`
  if (gemeldet.has(schluessel)) return
  gemeldet.add(schluessel)
  console.error(`[dachstuhl] ${was} fehlt fuer Bauteiltyp "${typ}"`)
}

/**
 * Stammdatensatz eines Bauteiltyps. Bewusst mit Rueckfallebene: `antippbar`
 * ist das Fundament von B3.2, und ein fehlender Eintrag darf am Messestand
 * nicht die ganze Szene abraeumen — er soll auffallen, nicht ausfallen.
 */
export function textFuer(typ: BauteilTyp): BauteilText {
  const eintrag = Object.hasOwn(BAUTEIL_TEXTE, typ) ? BAUTEIL_TEXTE[typ] : undefined
  if (eintrag) return eintrag
  melde(typ, 'Erklaertext')
  return ERSATZ_TEXT
}

export function farbeFuer(typ: BauteilTyp, animIndex: number): string {
  if (typ === 'sparren')
    return SPARREN_FARBEN[Math.abs(animIndex) % SPARREN_FARBEN.length]
  const farbe = Object.hasOwn(FARBEN, typ) ? FARBEN[typ] : undefined
  if (farbe) return farbe
  melde(typ, 'Materialfarbe')
  return ERSATZ_FARBE
}

/** Farbe der Rohdecke je Theme — das einzige Holz-freie Bauteil. */
export const ROHDECKE_FARBE = { hell: '#B9B4AC', dunkel: '#3A3733' } as const

/**
 * „Dein Sparren“: das umlaufende Signal-Band am markierten Stueck. Derselbe
 * Ton wie das Token `--color-kh-signal` — als three-Konstante hier, weil es
 * innerhalb des <Canvas> kein Tailwind gibt (dieselbe dokumentierte Ausnahme
 * wie alle SZENE_FARBEN).
 */
export const SIGNAL_MARKE = '#D8F63C'

/**
 * Fahrzeug-Kanon: Transporter + Langholz-Anhaenger als Flachfarben. Warme,
 * gedeckte Toene, damit das Gespann Kulisse bleibt und nicht mit dem Holz
 * oder den Auswahlfarben konkurriert.
 */
export const FAHRZEUG_FARBEN = {
  aufbau: '#B8452E',
  kabine: '#A93F2A',
  fenster: '#1E2226',
  fahrgestell: '#4A4E54',
  rungen: '#5A5E64',
  reifen: '#23262A',
  felge: '#8B9096',
  plane: '#867F74',
  kiste: '#6B4F2E',
  leiter: '#C9C2B4',
} as const

/**
 * Planansicht (M3): kreidefarbene Kanten auf dunklem Grund, deckende
 * Fuellkoerper fuer die Verdeckung (Hidden-Line ueber Tiefe, nicht Shader).
 */
export const RISS_FARBEN = {
  kante: '#EFE7DC',
  fuellung: '#221B14',
} as const

/** Hervorhebung und Abdunklung nicht gewaehlter Teile. */
export const AUSWAHL_EMISSIV = '#FF9F2A'
export const AUSWAHL_INTENSITAET = 0.45
export const ABDUNKLUNG_ZIEL = '#6B6259'
export const ABDUNKLUNG_ANTEIL = 0.35

/**
 * Szenenfarben je Stimmung.
 *
 * `dunkel` ist seit dem Umbau auf das Designsystem „Baustelle“ die Stimmung
 * der ganzen Anwendung — nicht mehr nur die von M8. Der Himmel ist deshalb
 * **warm** und nicht mehr blaugrau: neben Markenorange kippt ein kuehler
 * Himmel die ganze Szene ins Fremde, und das Holz sieht darunter grau aus.
 *
 * `hell` bleibt unveraendert. Es traegt nur noch den Prototypen unter
 * `?demo=dachstuhl`.
 */
export const SZENE_FARBEN = {
  hell: { hintergrund: '#EFEDEA', himmel: '#FFFFFF', boden: '#B7ADA0' },
  dunkel: { hintergrund: '#141210', himmel: '#C2A184', boden: '#2E271F' },
} as const
