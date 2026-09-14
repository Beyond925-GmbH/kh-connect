import type { StepId } from '@/khpl/flow/steps'

/** Orientierung, keine Zusage zu Zulassung, Förderung oder Gehalt.
 * DQR-Abgrenzung geprüft am 14.09.2026:
 * https://www.dqr.de/dqr/de/der-dqr/faq/deutscher-qualifikationsrahmen-faq.html
 * Hochschulzugang: MKW NRW, FAQ für beruflich Qualifizierte, Juli 2024:
 * https://www.mkw.nrw/system/files/media/document/file/faqs-zum-hochschulzugang-fur-beruflich-qualifizierte-stand-juli-2024.pdf
 */
export interface Karriereweg {
  id: StepId
  titel: string
  koeder: string
  abschnitte: { frage: string; antwort: string }[]
  aufhaenger: string
}

export const KARRIEREWEGE: Karriereweg[] = [
  {
    id: 'B9.1',
    titel: 'Meister',
    koeder: 'Aufträge planen und ein Team führen.',
    abschnitte: [
      {
        frage: 'Was machst du?',
        antwort:
          'Als Dachdeckermeister oder Dachdeckermeisterin planst du Aufträge, organisierst Material und begleitest dein Team. Auch ein eigener Betrieb kann ein Ziel sein.',
      },
      {
        frage: 'Wie geht es weiter?',
        antwort:
          'Auf deine Ausbildung kann eine Meisterweiterbildung folgen. Dauer und Voraussetzungen hängen vom Lehrgang und deinem bisherigen Weg ab. Die zuständige Kammer berät dich dazu.',
      },
      {
        frage: 'Was solltest du einplanen?',
        antwort:
          'Kurs, Prüfung und Lebensunterhalt können Geld kosten. Lass dich zu Kosten und möglicher Förderung beraten. Dein späteres Gehalt hängt unter anderem von Aufgaben, Betrieb und Erfahrung ab.',
      },
    ],
    aufhaenger:
      'Wenn du später ein Team führen möchtest, frag am Stand nach der Meisterweiterbildung.',
  },
  {
    id: 'B9.2',
    titel: 'Techniker',
    koeder: 'Bauprojekte planen und organisieren.',
    abschnitte: [
      {
        frage: 'Was machst du?',
        antwort:
          'Eine Weiterbildung in Bautechnik kann dich stärker in die Planung und Organisation von Bauprojekten führen. Welche Aufgaben du übernimmst, hängt vom Betrieb ab.',
      },
      {
        frage: 'Wie geht es weiter?',
        antwort:
          'Fachschulen bieten die Weiterbildung in Vollzeit oder neben dem Beruf an. Die Schule informiert dich über passende Fachrichtungen, Voraussetzungen, Dauer und Kosten.',
      },
      {
        frage: 'Ist das ein Studium?',
        antwort:
          'Der Technikerabschluss und der Bachelor liegen im Deutschen Qualifikationsrahmen auf Stufe 6. Es sind unterschiedliche Abschlüsse. Die Technikerweiterbildung verleiht keinen Hochschulabschluss.',
      },
    ],
    aufhaenger:
      'Wenn du gern planst und technische Lösungen entwickelst, frag am Stand nach passenden Weiterbildungen.',
  },
  {
    id: 'B9.3',
    titel: 'Studium',
    koeder: 'Deine Berufserfahrung mit Theorie verbinden.',
    abschnitte: [
      {
        frage: 'Was könntest du studieren?',
        antwort:
          'Im Bauingenieurwesen beschäftigst du dich damit, wie Gebäude geplant und gebaut werden. Deine Erfahrung auf Baustellen hilft dir, technische Zusammenhänge zu verstehen.',
      },
      {
        frage: 'Geht das ohne Abitur?',
        antwort:
          'Auch eine berufliche Qualifikation kann den Zugang zu einem Studium ermöglichen. Welche Voraussetzungen du erfüllst und wie die Zulassung abläuft, prüft die Hochschule für den gewünschten Studiengang.',
      },
      {
        frage: 'Wo fängst du an?',
        antwort:
          'Die Studienberatung hilft dir, ein passendes Angebot zu finden. Dort kannst du auch nach Studienformen fragen, die sich mit einer Arbeit im Betrieb verbinden lassen.',
      },
    ],
    aufhaenger:
      'Wenn dich ein Studium interessiert, lass dich zu passenden Studiengängen und zum Zugang beraten.',
  },
]

export function karriereweg(id: StepId): Karriereweg | undefined {
  return KARRIEREWEGE.find((k) => k.id === id)
}

export const AUFHAENGER_OHNE =
  'Am Stand kannst du fragen, wie es nach der Ausbildung weitergeht.'
