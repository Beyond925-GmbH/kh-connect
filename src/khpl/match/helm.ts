import type { MerkmalGewichte } from './merkmale'

/**
 * S1 „Dein Helm“ — die Personalisierung.
 *
 * **Warum keine Farbwahl für die App.** Das Designsystem hält genau eine
 * gefüllte orange Fläche pro Screen frei, und die heißt *Weiter*; Gelbgrün
 * heißt „geschafft“. Beides sind Bedeutungen, keine Vorlieben. Wer die Palette
 * dem Besucher überlässt, hat am nächsten Screen keine Sprache mehr, in der
 * „das war richtig“ noch etwas heißt.
 *
 * Die Farbe landet deshalb **auf einem Gegenstand statt auf der Oberfläche**.
 * Ein Helm ist auf jeder der vier Baustellen echt, er ist in vier Farben
 * sofort unterscheidbar, und er lässt sich als SVG zeichnen — die App ist
 * fotografisch, ein Illustrationsstil für Avatare existiert hier nicht und
 * würde zwischen den Motiven auffallen wie ein Aufkleber.
 *
 * **Zwei Wahlen, zwei Aufgaben.** Die Farbe trägt kein Merkmalsgewicht: sie
 * ist reiner Ausdruck, und ein Signal daraus wäre erfunden. Das Werkzeug trägt
 * das eigentliche Gewicht — „wonach greifst du zuerst“ ist eine Frage nach dem
 * Tun, und die beantwortet auch, wer bei „Was ist dir wichtig?“ passt.
 *
 * Beide sind `zitierbar: false` (siehe `matching.ts`): dass jemand zur
 * Rohrzange greift, darf im Vorschlag nicht als „du magst Technik“ auftauchen.
 */

export interface HelmFarbe {
  id: string
  name: string
  /** Die Kuppel. Der Schirm wird daraus abgedunkelt. */
  farbe: string
  /** Vordergrund auf dieser Farbe — für den Sitz des Kontrasts im Swatch. */
  auf: string
}

/**
 * Vier echte Helmfarben. Signalgelb ist dabei und ist der einzige heikle Fall:
 * es ist im System die Farbe von „geschafft“. Auf einem gezeichneten Gegenstand
 * ist es aber Material und keine Rückmeldung — und ein Bauhelm, den es in
 * Gelb nicht gibt, wäre die auffälligere Lüge.
 */
export const HELM_FARBEN: readonly HelmFarbe[] = [
  { id: 'weiss', name: 'Weiß', farbe: '#F2EDE4', auf: '#0E0D0B' },
  { id: 'gelb', name: 'Signalgelb', farbe: '#F2C300', auf: '#0E0D0B' },
  { id: 'blau', name: 'Blau', farbe: '#2E6BD8', auf: '#FBF7F0' },
  { id: 'anthrazit', name: 'Anthrazit', farbe: '#33302B', auf: '#FBF7F0' },
]

/** Die Icon-Namen kommen aus `lucide-react` und werden in `Helmwahl` aufgelöst. */
export type WerkzeugIcon =
  'hammer' | 'ruler' | 'pencil-ruler' | 'wrench' | 'drill' | 'tablet'

export interface Werkzeug {
  id: string
  name: string
  icon: WerkzeugIcon
  gewichte: MerkmalGewichte
}

export const WERKZEUGE: readonly Werkzeug[] = [
  {
    id: 'hammer',
    name: 'Hammer',
    icon: 'hammer',
    gewichte: { anpacken: 0.9, team: 0.2 },
  },
  {
    id: 'bandmass',
    name: 'Bandmaß',
    icon: 'ruler',
    gewichte: { praezision: 0.5, anpacken: 0.4, draussen: 0.2 },
  },
  {
    id: 'messschieber',
    name: 'Messschieber',
    icon: 'pencil-ruler',
    gewichte: { praezision: 1, technik: 0.3 },
  },
  {
    id: 'rohrzange',
    name: 'Rohrzange',
    icon: 'wrench',
    gewichte: { technik: 0.5, sinn: 0.5, anpacken: 0.3 },
  },
  {
    id: 'akkuschrauber',
    name: 'Akkuschrauber',
    icon: 'drill',
    gewichte: { anpacken: 0.6, technik: 0.4 },
  },
  {
    id: 'tablet',
    name: 'Tablet mit Plan',
    icon: 'tablet',
    gewichte: { technik: 0.8, praezision: 0.3 },
  },
]

export interface HelmWahl {
  farbe: string
  werkzeug: string
}

export function helmFarbe(id: string | undefined): HelmFarbe {
  return HELM_FARBEN.find((f) => f.id === id) ?? HELM_FARBEN[0]
}

export function werkzeug(id: string | undefined): Werkzeug | null {
  return WERKZEUGE.find((w) => w.id === id) ?? null
}
