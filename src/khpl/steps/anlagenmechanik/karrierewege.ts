import type { StepId } from '@/khpl/flow/steps'

/**
 * Die drei Karrierewege dieses Berufs (A8.1–A8.3).
 *
 * **Eine eigene Datei je Beruf, und das ist keine Aufräumarbeit, sondern eine
 * Korrektur** (khpl-tage.md §6.1 V2 und 0c). Der Bestand in
 * `steps/dachdecker/karrierewege.ts` führt Zimmerer-Zahlen unter einem
 * Dachdecker-Namen; dieselben Zahlen wären ohne die Recherche vom 24.08.2026
 * in zwei weitere Berufe kopiert worden, in die sie erst recht nicht gehören.
 * Für die Anlagenmechanik sind sie durchweg falsch: der Meisterlehrgang kostet
 * anderes Geld, die Technikerfachrichtung heißt anders, und der
 * Detmold-Anker (Holzbau) passt auf dieses Gewerk nicht.
 *
 * **Alle Zahlen unten stammen aus `belege/ausbildung-karriere.md`**, Spalte
 * SHK, recherchiert am 24.08.2026. Verdikt und Stand stehen je Abschnitt im
 * Kommentar. Die Formulierungsregel des Bestands gilt weiter: was aus
 * Gehaltsportalen stammt, erscheint **nur als Spanne oder mit „rund"**, nie als
 * exakter Wert und nie als Versprechen.
 *
 * ⚠️ **Was hier noch fehlt.** Spec 6 (A8) nennt die **Gebäudeenergieberatung**
 * als den Überraschungsinhalt dieses Berufs — „aus dem Keller ins
 * Beratungsgespräch, ohne Schreibtischbiografie" —, aber sie ist ausdrücklich
 * „zu recherchieren" und steht in keinem Beleg. Sie kommt deshalb **nicht** als
 * vierte Karte und auch nicht als erfundener Satz vor. Der Graph hat drei
 * Abstecher (A8.1–A8.3); eine vierte Karte wäre ohnehin eine Änderung an der
 * abgenommenen Struktur.
 *
 * ⚠️ **Der Studien-Anker ist offen.** Spec 11 hält fest: „BBHZVO gilt, **aber
 * Detmold/Holzbau passt nicht** — eigener Studien-Anker nötig." Der Beleg nennt
 * als fachlich passende Richtung Versorgungs- und Energietechnik und als
 * mögliche Orte HSBI und TH OWL in Lemgo, aber **kein geprüftes Studienangebot
 * mit Dauer und Abschluss**. Der Text unten nennt deshalb die Richtung und
 * keinen Studiengang. Sobald einer belegt ist, gehört er hier hinein.
 */

export interface Karriereweg {
  id: StepId
  /** Kartentitel in A8 und Überschrift des Abstechers. */
  titel: string
  /** Der eine Satz auf der Karte in A8 — wörtlich aus Spec 4. */
  koeder: string
  abschnitte: { frage: string; antwort: string }[]
  /** Der personalisierte Aufhänger auf dem CTA-Screen A9. */
  aufhaenger: string
}

export const KARRIEREWEGE: Karriereweg[] = [
  {
    id: 'A8.1',
    titel: 'Meister',
    koeder: 'Eigener Betrieb, eigene Azubis.',
    abschnitte: [
      {
        frage: 'Was ist das',
        // Der Titel heißt im SHK-Handwerk „Installateur- und
        // Heizungsbauermeister/in" (belege 5, Spalte SHK). `BELEGT`.
        antwort:
          'Der Meisterbrief — im SHK-Handwerk als Installateur- und Heizungsbauermeister:in. Damit darfst du einen eigenen Betrieb führen und selbst ausbilden.',
      },
      {
        frage: 'Wie lange',
        // ca. 8 Monate Vollzeit, 2–3 Jahre berufsbegleitend (belege 5). `BELEGT`.
        antwort:
          'Teil I und II dauern in Vollzeit rund acht Monate, neben dem Beruf zwei bis drei Jahre.',
      },
      {
        frage: 'Was es kostet',
        // ca. 11.200 € (Lehrgang 10.200 € + Prüfung 1.000 €, BBZ Arnsberg,
        // Kursjahr 2026), zzgl. Teil III/IV. `BELEGT` für diesen Anbieter.
        // Aufstiegs-BAföG: 50 % Zuschuss, 50 % Darlehenserlass bei bestandener
        // Prüfung → höchstens rund ein Viertel Eigenanteil. `BELEGT`.
        antwort:
          'Rund 11.000 Euro für Lehrgang und Prüfung. Das Aufstiegs-BAföG übernimmt davon den größten Teil — wer besteht, zahlt am Ende etwa ein Viertel selbst.',
      },
      {
        frage: 'Was du verdienst',
        // Ø ca. 51.000 €/Jahr, Einstieg ab ca. 42.000 € (meingehalt.net,
        // BA-Entgeltatlas Beruf 2210). `TEILWEISE BELEGT` — Portaldaten,
        // deshalb als Spanne mit „rund".
        antwort:
          'Als Meister:in im Schnitt rund 51.000 Euro im Jahr, Einstieg ab etwa 42.000.',
      },
      {
        frage: 'Was NRW dazugibt',
        // Meisterprämie 2.500 € nach bestandener Handwerks-Meisterprüfung;
        // Meistergründungsprämie 11.500 €, im Einzelfall bis 16.000 €.
        // `BELEGT` — und sie gelten hier, weil SHK ein Handwerksberuf ist.
        antwort:
          'Nordrhein-Westfalen zahlt 2.500 Euro Meisterprämie für die bestandene Prüfung. Wer danach einen Betrieb gründet oder übernimmt, bekommt noch einmal 11.500 Euro, im Einzelfall bis zu 16.000.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass du mit dem Meisterbrief an jeder Hochschule in NRW studieren darfst.',
  },
  {
    id: 'A8.2',
    titel: 'Techniker',
    koeder: 'Planen und auslegen statt in den Keller.',
    abschnitte: [
      {
        frage: 'Was ist das',
        // Fachrichtung für SHK: Versorgungstechnik bzw. Heizungs-, Lüftungs-,
        // Klimatechnik (belege 6). `BELEGT` — und ausdrücklich **nicht**
        // „Holztechnik oder Bautechnik" wie im Bestand.
        antwort:
          'Staatlich geprüfte:r Techniker:in, Fachrichtung Versorgungstechnik — Heizung, Lüftung, Klima. Du legst Anlagen aus, planst und rechnest, statt sie selbst einzubauen.',
      },
      {
        frage: 'Wie lange',
        // 2 Jahre Vollzeit / 3–4 Jahre Teilzeit, mind. 2.400 h. `BELEGT`.
        antwort: 'Zwei Jahre Fachschule in Vollzeit, drei bis vier neben dem Beruf.',
      },
      {
        frage: 'Was es kostet',
        // Öffentliche Fachschulen/Berufskollegs in NRW: schulgeldfrei, nur
        // Gebühren und Material. `BELEGT`.
        antwort:
          'An den öffentlichen Fachschulen in NRW kostet der Unterricht nichts — nur Gebühren und Material.',
      },
      {
        frage: 'Der Punkt, den kaum jemand kennt',
        // DQR-Stufe 6, Titelzusatz „Bachelor Professional in Technik". `BELEGT`.
        antwort:
          'Der Abschluss steht offiziell auf derselben Stufe wie ein Bachelor. Der Titel heißt sogar so: Bachelor Professional in Technik.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass der Techniker offiziell auf Bachelor-Niveau steht.',
  },
  {
    id: 'A8.3',
    titel: 'Studium',
    koeder: 'Ja, das geht — auch ohne Abitur.',
    abschnitte: [
      {
        frage: 'Warum erst eine Ausbildung?',
        // § 49 Abs. 4 HG NRW i. V. m. BBHZVO (2010). `BELEGT`.
        antwort:
          'Weil sie den Weg nicht zumacht, sondern aufmacht. In Nordrhein-Westfalen berechtigt der Meisterbrief — und auch der Techniker — zur Einschreibung in jeden Studiengang an jeder Hochschule des Landes. Ohne Abitur, ohne Aufnahmeprüfung.',
      },
      {
        frage: 'Und ohne Meister?',
        // Gesellenbrief + mind. 3 Jahre Tätigkeit im erlernten Beruf →
        // fachgebundener Zugang, ebenfalls ohne Zugangsprüfung. `BELEGT`.
        antwort:
          'Mit dem Gesellenbrief und drei Jahren im Beruf darfst du fachgebunden studieren — also alles, was zu deiner Ausbildung passt. Auch dafür braucht es keine Zugangsprüfung.',
      },
      {
        frage: 'Was dann',
        // ⚠️ Kein konkreter Studiengang: Spec 11 verlangt einen eigenen Anker,
        // und belegt ist bisher nur die fachliche Richtung
        // (Versorgungs-/Energietechnik). Sobald ein Studienangebot mit Dauer
        // und Abschluss belegt ist, gehört es hierher.
        antwort:
          'Fachlich passt Versorgungs- und Energietechnik: Anlagen für ganze Gebäude planen statt für ein Haus. Wer heute Heizungen baut, rechnet dann aus, was ein Krankenhaus oder eine Schule braucht.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass du als Handwerker:in studieren kannst — ohne Abitur.',
  },
]

export function karriereweg(id: StepId): Karriereweg | undefined {
  return KARRIEREWEGE.find((k) => k.id === id)
}

/** Fällt zurück, wenn in A8 nichts angesehen wurde. */
export const AUFHAENGER_OHNE =
  'Vielleicht war heute etwas dabei, das du nicht erwartet hast.'
