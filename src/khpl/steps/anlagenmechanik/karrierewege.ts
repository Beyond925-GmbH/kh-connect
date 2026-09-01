import type { StepId } from '@/khpl/flow/steps'

/**
 * Die drei Karrierewege dieses Berufs (A8.1–A8.3).
 *
 * **Eine eigene Datei je Beruf, und das ist keine Aufräumarbeit, sondern eine
 * Korrektur.** Der Bestand in
 * `steps/dachdecker/karrierewege.ts` führt Zimmerer-Zahlen unter einem
 * Dachdecker-Namen; dieselben Zahlen wären ohne die Recherche vom 24.08.2026
 * in zwei weitere Berufe kopiert worden, in die sie erst recht nicht gehören.
 * Für die Anlagenmechanik sind sie durchweg falsch: der Meisterlehrgang kostet
 * anderes Geld, die Technikerfachrichtung heißt anders, und der
 * Detmold-Anker (Holzbau) passt auf dieses Gewerk nicht.
 *
 * **Alle Zahlen unten sind für das SHK-Handwerk recherchiert**, Stand
 * 24.08.2026. Quelle und Stand stehen je Abschnitt im
 * Kommentar. Die Formulierungsregel des Bestands gilt weiter: was aus
 * Gehaltsportalen stammt, erscheint **nur als Spanne oder mit „rund"**, nie als
 * exakter Wert und nie als Versprechen.
 *
 * **Was hier noch fehlt.** Der eigentliche Überraschungsinhalt dieses Berufs
 * wäre die **Gebäudeenergieberatung** — „aus dem Keller ins Beratungsgespräch,
 * ohne Schreibtischbiografie". Für sie ist bisher aber nichts recherchiert, und
 * sie kommt deshalb **nicht** als vierte Karte und auch nicht als erfundener
 * Satz vor. Der Graph hat drei Abstecher (A8.1–A8.3); eine vierte Karte wäre
 * ohnehin eine Änderung an der Struktur des Tages.
 *
 * **Der Studien-Anker ist offen.** Die BBHZVO gilt auch hier, aber der
 * Detmold-Anker (Holzbau) passt auf dieses Gewerk nicht — es braucht einen
 * eigenen. Fachlich passend ist die Richtung Versorgungs- und Energietechnik,
 * mögliche Orte sind HSBI und TH OWL in Lemgo; **ein geprüftes Studienangebot
 * mit Dauer und Abschluss** gibt es bisher nicht. Der Text unten nennt deshalb
 * die Richtung und keinen Studiengang. Sobald ein Angebot recherchiert ist,
 * gehört es hier hinein.
 */

export interface Karriereweg {
  id: StepId
  /** Kartentitel in A8 und Überschrift des Abstechers. */
  titel: string
  /**
   * Der eine Satz auf der Karte in A8; bei A8.2 in einfachere Wörter
   * gebracht („auslegen" ist Planer-Sprache und sagt der Zielgruppe nichts).
   */
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
        // Heizungsbauermeister/in".
        antwort:
          'Der Meisterbrief. Der volle Titel ist lang: Installateur- und Heizungsbauermeister:in. Er bedeutet: Du darfst einen eigenen Betrieb führen und selbst Azubis ausbilden.',
      },
      {
        frage: 'Wie lange',
        // ca. 8 Monate Vollzeit, 2–3 Jahre berufsbegleitend.
        // Gemeint sind Teil I und II der Meisterprüfung — die Zählung ist
        // Prüfungsordnungs-Sprache und bleibt deshalb hier im Kommentar.
        antwort:
          'Der Meisterkurs dauert in Vollzeit rund acht Monate. Neben dem Beruf, abends und samstags, sind es zwei bis drei Jahre.',
      },
      {
        frage: 'Was es kostet',
        // ca. 11.200 € (Lehrgang 10.200 € + Prüfung 1.000 €, BBZ Arnsberg,
        // Kursjahr 2026), zzgl. Teil III/IV — das gilt für diesen Anbieter.
        // Aufstiegs-BAföG: 50 % Zuschuss, 50 % Darlehenserlass bei bestandener
        // Prüfung → höchstens rund ein Viertel Eigenanteil.
        // Der eingeschobene Halbsatz erklärt die Abkürzung: sie fiele
        // sonst als einziger unerklärter Behördenname des Tages.
        antwort:
          'Rund 11.000 Euro für Kurs und Prüfung. Das Aufstiegs-BAföG — Geld vom Staat für genau solche Weiterbildungen — übernimmt davon den größten Teil. Wer besteht, zahlt am Ende etwa ein Viertel selbst: rund 2.750 Euro.',
      },
      {
        frage: 'Was du verdienst',
        // Ø ca. 51.000 €/Jahr, Einstieg ab ca. 42.000 € (meingehalt.net,
        // BA-Entgeltatlas Beruf 2210) — Portaldaten, deshalb nur als Spanne
        // und mit „rund".
        antwort:
          'Als Meister:in im Schnitt rund 51.000 Euro im Jahr — das sind gut 4.000 Euro im Monat, bevor Steuern und Abgaben abgehen. Der Einstieg liegt bei etwa 42.000.',
      },
      {
        frage: 'Was NRW dazugibt',
        // Meisterprämie 2.500 € nach bestandener Handwerks-Meisterprüfung;
        // Meistergründungsprämie 11.500 €, im Einzelfall bis 16.000 €.
        // Beide gelten hier, weil SHK ein Handwerksberuf ist.
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
    koeder: 'Planen und berechnen statt in den Keller.',
    abschnitte: [
      {
        frage: 'Was ist das',
        // Fachrichtung für SHK: Versorgungstechnik bzw. Heizungs-, Lüftungs-,
        // Klimatechnik — und ausdrücklich **nicht** „Holztechnik oder
        // Bautechnik" wie im Bestand.
        antwort:
          'Staatlich geprüfte:r Techniker:in für Versorgungstechnik — also Heizung, Lüftung, Klima. Du rechnest aus und zeichnest auf, wie die Anlage aussehen muss. Eingebaut wird sie dann von anderen.',
      },
      {
        frage: 'Wie lange',
        // 2 Jahre Vollzeit / 3–4 Jahre Teilzeit, mind. 2.400 h.
        antwort: 'Zwei Jahre Fachschule in Vollzeit, drei bis vier neben dem Beruf.',
      },
      {
        frage: 'Was es kostet',
        // Öffentliche Fachschulen/Berufskollegs in NRW: schulgeldfrei, nur
        // Gebühren und Material.
        antwort:
          'An den staatlichen Fachschulen in NRW kostet der Unterricht nichts. Du zahlst nur ein paar Gebühren und dein Material.',
      },
      {
        frage: 'Der Punkt, den kaum jemand kennt',
        // DQR-Stufe 6, Titelzusatz „Bachelor Professional in Technik".
        antwort:
          'Der Abschluss zählt offiziell genauso viel wie ein Bachelor an der Uni. Er heißt sogar so: Bachelor Professional in Technik.',
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
        // § 49 Abs. 4 HG NRW i. V. m. BBHZVO (2010).
        antwort:
          'Weil sie den Weg nicht zumacht, sondern aufmacht. Mit dem Meisterbrief — und auch mit dem Techniker — darfst du dich in Nordrhein-Westfalen in jeden Studiengang einschreiben, an jeder Hochschule des Landes. Ohne Abitur, ohne Aufnahmeprüfung.',
      },
      {
        frage: 'Und ohne Meister?',
        // Gesellenbrief + mind. 3 Jahre Tätigkeit im erlernten Beruf →
        // fachgebundener Zugang, ebenfalls ohne Zugangsprüfung.
        antwort:
          'Auch dann. Mit dem Gesellenbrief und drei Jahren im Beruf darfst du alles studieren, was zu deiner Ausbildung passt. Auch dafür brauchst du keine extra Prüfung.',
      },
      {
        frage: 'Was dann',
        // Kein konkreter Studiengang: Dieses Gewerk braucht einen eigenen
        // Anker, und recherchiert ist bisher nur die fachliche Richtung
        // (Versorgungs-/Energietechnik). Sobald ein Studienangebot mit Dauer
        // und Abschluss recherchiert ist, gehört es hierher.
        antwort:
          'Am besten passt Versorgungs- und Energietechnik: Anlagen für ganze Gebäude planen statt für ein Haus. Wer heute Heizungen einbaut, rechnet dann aus, wie viel Wärme deine Schule oder ein Krankenhaus braucht.',
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
