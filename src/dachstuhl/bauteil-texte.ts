/**
 * Bauteiltypen, Beschriftungen, Erklaertexte und Materialfarben (Bauplan 5.2 + 5.3).
 *
 * ENTWURF – UNGEPRUEFT: die Erklaertexte gehoeren vor der Messe der Innung zum
 * Gegenlesen vorgelegt, genau wie das uebrige Glossar.
 *
 * Die Farben stehen bewusst hier und nicht als Tailwind-Token: innerhalb des
 * <Canvas> gibt es kein Tailwind. Theme-abhaengig sind nur Hintergrund, Boden
 * und Lichtstaerken — das Holz bleibt Holz.
 */

export type BauteilTyp =
  | 'rohdecke'
  | 'fusspfette'
  | 'bundbalken'
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
    text: 'Die schrägen Balken heißen Sparren. Zwei gegenüberliegende bilden ein Sparrenpaar — der Kran hebt sie meist als fertiges Dreieck aufs Dach.',
    antippbar: true,
  },
  kehlbalken: {
    label: 'Kehlbalken',
    text: 'Der waagerechte Balken, der ein Sparrenpaar im oberen Drittel verbindet. Er hält die Sparren davon ab, sich durchzubiegen, und bildet nebenbei den Boden des Spitzbodens.',
    antippbar: true,
  },
  firstpfette: {
    label: 'Firstpfette',
    text: 'Der oberste Längsbalken, direkt unter der Dachspitze. Auf ihm liegen alle Sparren auf — ohne ihn wäre der First nur eine Linie und kein Bauteil.',
    antippbar: true,
  },
  mittelpfette: {
    label: 'Mittelpfette',
    text: 'Der Längsbalken auf halber Dachfläche. Er halbiert die Strecke, die ein Sparren frei überspannen muss. Deshalb reicht hier ein schlankerer Sparren.',
    antippbar: true,
  },
  fusspfette: {
    label: 'Fußpfette (Mauerlatte)',
    text: 'Das unterste Holz, es liegt auf der Mauerkrone. Jeder Sparrenfuß sitzt mit einer Kerbe darauf — die heißt Kerve — und gibt seine Last an die Wand weiter.',
    antippbar: true,
  },
  firstsaeule: {
    label: 'Stuhlsäule',
    text: 'Der senkrechte Pfosten unter einer Pfette. Er leitet die Last nach unten in die Decke. Etwa alle viereinhalb Meter steht einer.',
    antippbar: true,
  },
  mittelsaeule: {
    label: 'Stuhlsäule',
    text: 'Der senkrechte Pfosten unter einer Pfette. Er leitet die Last nach unten in die Decke. Etwa alle viereinhalb Meter steht einer.',
    antippbar: true,
  },
  kopfband: {
    label: 'Kopfband',
    text: 'Die kurze Schräge zwischen Säule und Pfette. Sie macht aus dem rechten Winkel ein Dreieck — und Dreiecke kippen nicht.',
    antippbar: true,
  },
  bundbalken: {
    label: 'Bundbalken',
    text: 'Der waagerechte Balken quer über das Haus. Er hält die beiden Traufseiten zusammen, damit das Dach die Wände nicht auseinanderdrückt, und trägt zugleich den Boden des Dachbodens.',
    antippbar: true,
  },
  windrispe: {
    label: 'Windrispenband',
    text: 'Das gelochte Stahlband, das diagonal über die Sparren läuft. Ohne es könnte der Wind das ganze Dach der Länge nach verschieben wie ein Kartenhaus.',
    antippbar: true,
  },
  traglatte: {
    label: 'Dachlatte',
    text: 'Auf diesen waagerechten Latten werden später die Ziegel eingehängt. Ihr Abstand hängt davon ab, wie weit ein Ziegel den nächsten überdeckt — hier 32 Zentimeter.',
    antippbar: true,
  },
  konterlatte: {
    label: 'Konterlatte',
    text: 'Die Latte, die längs auf dem Sparren liegt und die Dachlatten anhebt. Der Spalt darunter ist Absicht: Dort zieht Luft durch, damit das Holz trocken bleibt.',
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
  firstsaeule: '#7E5230',
  mittelsaeule: '#7E5230',
  kopfband: '#7E5230',
  kehlbalken: '#8F5F36',
  konterlatte: '#C08A50',
  traglatte: '#C08A50',
  windrispe: '#9AA3AA',
  'zone-first': '#FF9F2A',
  'zone-traufe': '#FF9F2A',
}

export function farbeFuer(typ: BauteilTyp, animIndex: number): string {
  if (typ === 'sparren')
    return SPARREN_FARBEN[Math.abs(animIndex) % SPARREN_FARBEN.length]
  return FARBEN[typ]
}

/** Farbe der Rohdecke je Theme — das einzige Holz-freie Bauteil. */
export const ROHDECKE_FARBE = { hell: '#B9B4AC', dunkel: '#3A3733' } as const

/** Hervorhebung und Abdunklung nicht gewaehlter Teile. */
export const AUSWAHL_EMISSIV = '#FF9F2A'
export const AUSWAHL_INTENSITAET = 0.45
export const ABDUNKLUNG_ZIEL = '#6B6259'
export const ABDUNKLUNG_ANTEIL = 0.35

export const SZENE_FARBEN = {
  hell: { hintergrund: '#EFEDEA', himmel: '#FFFFFF', boden: '#B7ADA0' },
  dunkel: { hintergrund: '#1C1A17', himmel: '#8A97A6', boden: '#2A2622' },
} as const
