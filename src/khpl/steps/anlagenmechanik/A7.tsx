import { useState } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import type { StepId } from '@/khpl/flow/steps'
import type { Fortschritt } from '@/khpl/store/fortschritt'
import { merkeAntwort } from '@/khpl/store/fortschritt'
import { VLIES_MARKE } from './A2'

/**
 * A7 — Jetzt erklärst du es. **Zwei Dinge auf einem Screen: die Abfrage und
 * der Rückblick.** Das ist möglich, weil es dieselbe Sache ist — was man der
 * Kundin erzählt, ist genau das, was man heute getan hat.
 *
 * **Beat 1 — die Abfrage.** Drei Fragen, je drei Antworten, und die Achse ist
 * nicht *richtig* und *falsch*, sondern **verständlich** und **nicht
 * verständlich** (Spec 6, A7). Jede Frage hat deshalb dieselben drei Sorten
 * Antwort:
 *
 *  - die **gute**: fachlich korrekt *und* verstehbar. Beides, nicht eins.
 *  - die **Fachantwort**: korrekt, und sie hilft nicht. Bewusst ohne
 *    Glossar-Popover — wer sie anbietet, soll sie nicht nebenbei übersetzen.
 *  - die **ausweichende**: gut verständlich und trotzdem keine Auskunft.
 *
 * Feedback: die Kundin nickt oder schaut ratlos — **kein Häkchen, keine
 * Note**, eine Reaktion. Deshalb sehen alle drei Rückmeldungen gleich aus;
 * allein die Worte unterscheiden sie. Wer daneben liegt, sieht die bessere
 * Antwort und darf sie noch einmal sagen.
 *
 * **Das ist die zweite Hälfte des Lernpaars zu A2** und die stärkste Umkehrung
 * der vier Tage: sieben Screens lang hat die App erklärt, hier erklärt der
 * Besucher. Es ist außerdem die einzige Übung im ganzen Produkt, in der die
 * richtige Antwort von **Sprache** abhängt und nicht von Technik — und das ist
 * für ein kundenzugewandtes Gewerk die wahrste Prüfung, die es gibt.
 *
 * **Beat 2 — Rückblick statt Punkte** (khpl-tage.md 1, Mechanismus 6): keine
 * Note, kein Score, sondern eine Aufzählung dessen, was der Besucher
 * tatsächlich getan hat, mit **zwei Fassungen je Eintrag**. Wer durchgeklickt
 * hat, bekommt die kürzere Fassung, aber nie eine Bewertung. Die Formulierungen
 * stehen wörtlich in Spec 6 (A7) und sind `VALIDIERT`.
 *
 * **Bühne.** Der Keller, warm — und darüber, angeschnitten, das Haus aus A3 in
 * der anderen Farbe. **Feierabend im Hellen**: dieser Tag endet nachmittags im
 * Wohnhaus einer Familie, nicht auf einem Dach im Abendlicht und nicht in einer
 * Halle. Vier Feierabende, vier Lichter.
 */

// ---------------------------------------------------------------------------
// Beat 1 — die drei Fragen
// ---------------------------------------------------------------------------

type Art = 'gut' | 'fach' | 'ausweichend'

interface Antwort {
  id: string
  art: Art
  text: string
  /** Was die Kundin daraufhin tut. Eine Reaktion, keine Bewertung. */
  reaktion: string
}

interface Kundenfrage {
  id: string
  frage: string
  antworten: readonly Antwort[]
}

/**
 * Die drei Fragen stehen wörtlich in Spec 6 (A7). Die Antworten sind Copy und
 * `ENTWURF – UNGEPRÜFT`; ihr **fachlicher** Gehalt kommt aus den Belegen:
 * Wärmepumpe bei Minusgraden aus `belege/anlagenmechanik.md` 3, die
 * Größe des Geräts aus derselben Quelle (Luft ist der Wärmeträger).
 *
 * Reihenfolge der Antworten je Frage bewusst gemischt — die gute steht nicht
 * immer oben.
 */
const FRAGEN: readonly Kundenfrage[] = [
  {
    id: 'frost',
    frage: 'Und das reicht wirklich, wenn es draußen friert?',
    antworten: [
      {
        id: 'frost-fach',
        art: 'fach',
        text: 'Die Anlage ist bis etwa minus 20 Grad Außentemperatur betriebsfähig, der COP liegt dort noch zwischen 1,5 und 1,9.',
        reaktion: 'Sie schaut ratlos. „Und was heißt das jetzt?“',
      },
      {
        id: 'frost-gut',
        art: 'gut',
        text: 'Ja. Auch Luft bei null Grad steckt voller Wärme — die holt die Pumpe da raus. Bei richtiger Kälte braucht sie mehr Strom, aber sie hört nicht auf zu heizen.',
        reaktion: 'Sie nickt. „So rum kann ich mir das merken.“',
      },
      {
        id: 'frost-aus',
        art: 'ausweichend',
        text: 'Da müssen Sie sich keine Gedanken machen, das läuft schon.',
        reaktion: 'Sie sieht dich an und fragt noch einmal nach.',
      },
    ],
  },
  {
    id: 'groesse',
    frage: 'Warum ist das Ding so groß?',
    antworten: [
      {
        id: 'groesse-gut',
        art: 'gut',
        text: 'Weil es Luft braucht, viel Luft. Da drin steckt die Wärme für Ihr Haus — je mehr davon durchgeht, desto weniger Strom kostet dieselbe Wärme.',
        reaktion: 'Sie nickt und geht einmal um das Gerät herum.',
      },
      {
        id: 'groesse-aus',
        art: 'ausweichend',
        text: 'So sind die Dinger nun mal. Der Hersteller wird sich schon was dabei gedacht haben.',
        reaktion: 'Sie sieht dich an und fragt noch einmal nach.',
      },
      {
        id: 'groesse-fach',
        art: 'fach',
        text: 'Der Verdampfer braucht die entsprechende Wärmetauscherfläche für den ausgelegten Luftvolumenstrom.',
        reaktion: 'Sie schaut ratlos. „Und was heißt das jetzt?“',
      },
    ],
  },
  {
    id: 'blinkt',
    frage: 'Was mache ich, wenn da mal was blinkt?',
    antworten: [
      {
        id: 'blinkt-fach',
        art: 'fach',
        text: 'Die Regelung legt Störcodes im Fehlerspeicher ab; auslesen lässt sich das über das Servicemenü.',
        reaktion: 'Sie schaut ratlos. „Und was heißt das jetzt?“',
      },
      {
        id: 'blinkt-aus',
        art: 'ausweichend',
        text: 'Das steht alles in der Anleitung, die liegt im Ordner.',
        reaktion: 'Sie sieht dich an und fragt noch einmal nach.',
      },
      {
        id: 'blinkt-gut',
        art: 'gut',
        text: 'Erst mal nichts. Schreiben Sie auf, was im Display steht, und rufen Sie uns an — meist reicht uns die Meldung, damit wir wissen, was wir mitbringen.',
        reaktion: 'Sie nickt und tippt sich die Nummer ins Telefon.',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Beat 2 — der Rückblick
// ---------------------------------------------------------------------------

interface Tat {
  /** Wenn die Übung dieses Steps gelöst wurde. */
  erledigt: string
  /** Wenn der Step gesehen, aber nicht gelöst wurde. */
  gesehen: string
  geloest: (f: Fortschritt) => boolean
}

/**
 * Reihenfolge = Tagesablauf. Beide Fassungen wörtlich aus Spec 6 (A7),
 * `VALIDIERT`. **A5 und die Abstecher kommen nicht vor** — die Tabelle der
 * Spec hat fünf Zeilen, und eine sechste wäre erfundene Copy.
 */
const TATEN: { id: StepId; tat: Tat }[] = [
  {
    id: 'A1',
    tat: {
      erledigt: 'eine Störung eingegrenzt und gefunden',
      gesehen: 'einen Störungsdienst mitgefahren',
      geloest: (f) => !!f.answers.a1?.richtig,
    },
  },
  {
    id: 'A2',
    tat: {
      erledigt: 'einen alten Heizungskeller gelesen',
      gesehen: 'einen alten Heizungskeller gesehen',
      // Gelesen hat den Keller, wer ein Bauteil angetippt hat — die
      // Vlies-Marke im selben Feld zählt nicht mit.
      geloest: (f) => (f.answers.a2?.angetippt ?? []).some((w) => w !== VLIES_MARKE),
    },
  },
  {
    id: 'A3',
    tat: {
      erledigt: 'die Heizlast eines Hauses geschätzt',
      gesehen: 'gesehen, wie viel Wärme ein Haus braucht',
      geloest: (f) => !!f.answers.a3?.aufgeloest,
    },
  },
  {
    id: 'A4',
    tat: {
      erledigt: 'eine Leitung geführt',
      gesehen: 'gesehen, wie eine Leitung geführt wird',
      geloest: (f) => !!f.answers.a4?.fertig,
    },
  },
  {
    id: 'A6',
    tat: {
      erledigt: 'eine Wärmepumpe in Betrieb genommen',
      gesehen: 'bei einer Inbetriebnahme dabei gewesen',
      geloest: (f) => !!f.answers.a6?.druckGetroffen,
    },
  },
]

function rueckblick(f: Fortschritt): string[] {
  const gesehen = new Set(f.visited)
  return TATEN.filter((t) => gesehen.has(t.id)).map((t) =>
    t.tat.geloest(f) ? t.tat.erledigt : t.tat.gesehen,
  )
}

// ---------------------------------------------------------------------------

type Phase = 'frage' | 'reaktion' | 'rueckblick'

export function A7() {
  const { fortschritt } = useStepNavigation('A7')
  const gespeichert = fortschritt.answers.a7
  const fertig = (gespeichert?.beantwortet.length ?? 0) >= FRAGEN.length

  const [index, setIndex] = useState(() => (fertig ? FRAGEN.length - 1 : 0))
  const [phase, setPhase] = useState<Phase>(() => (fertig ? 'rueckblick' : 'frage'))
  const [wahl, setWahl] = useState<Antwort | null>(null)
  const [beantwortet, setBeantwortet] = useState<string[]>(
    () => gespeichert?.beantwortet ?? [],
  )
  const [gut, setGut] = useState(() => gespeichert?.gut ?? 0)

  const frage = FRAGEN[index]
  const letzte = index === FRAGEN.length - 1
  const gute = frage.antworten.find((a) => a.art === 'gut')

  const antworte = (a: Antwort) => {
    setWahl(a)
    setPhase('reaktion')

    // `gut` zählt keine Punkte, sondern speist die Reaktion der Kundin — und
    // eine Frage zählt höchstens einmal, auch wenn sie noch einmal gesagt
    // wurde. Wer die verständliche Antwort im zweiten Anlauf findet, hat sie
    // gefunden; das ist der ganze Zweck des zweiten Anlaufs.
    const schonDa = beantwortet.includes(frage.id)
    const naechsteListe = schonDa ? beantwortet : [...beantwortet, frage.id]
    const naechstesGut = a.art === 'gut' && !schonDa ? gut + 1 : gut
    setBeantwortet(naechsteListe)
    setGut(naechstesGut)
    merkeAntwort('a7', { beantwortet: naechsteListe, gut: naechstesGut })
  }

  const weiterImGespraech = () => {
    setWahl(null)
    if (letzte) setPhase('rueckblick')
    else {
      setIndex((i) => i + 1)
      setPhase('frage')
    }
  }

  const imGespraech = phase !== 'rueckblick'

  return (
    <StepShell
      id="A7"
      /*
        Die beste Übung der Anwendung: dem Kunden erklären, was du gebaut hast.
        Sie trainiert genau das, worum es in `khpl-vereinfachung.md` geht —
        deshalb sagt der Auftrag „so, dass sie es versteht", nicht „wähle eine
        Antwort".
      */
      auftrag={imGespraech ? 'Erklär es so, dass sie es versteht.' : null}
      ansage={null}
      interaktionOffen={imGespraech}
      buehne={
        <Schnitt
          zustand={{ szene: 'uebergabe', pfad: fortschritt.answers.a4?.pfad ?? [] }}
        />
      }
      warum={
        imGespraech ? (
          /*
            Auf dem Handy hochkant entfällt der Rahmentext: mit ihm lag die
            dritte Antwort unter der Scrollkante (Sichtprüfung, A7 handy-hoch,
            `scrollRest` 55 px) — ausgerechnet die ausweichende, an der die
            Übung hängt. „Sie fragt · 1 von 3" trägt die Situation auch allein.
          */
          <p className="max-sm:hidden">
            Die Bauherrin steht mit dir im Keller und will wissen, was du da gebaut hast.
            Das gehört zum Auftrag wie das Rohr an der Wand: zeigen, erklären, dann ist
            Feierabend.
          </p>
        ) : undefined
      }
      interaktion={
        <Wechsel takt={imGespraech ? `${frage.id}-${phase}` : 'rueckblick'}>
          {imGespraech ? (
            <div className="flex flex-col gap-3">
              <div className="kh-feld px-4 py-3" data-testid="a7-frage">
                <p className="kh-etikett">
                  Sie fragt · {index + 1} von {FRAGEN.length}
                </p>
                <p className="mt-1 text-[1.125rem] leading-snug text-kh-paper">
                  „{frage.frage}“
                </p>
              </div>

              {phase === 'frage' ? (
                <ul className="flex flex-col gap-2">
                  {frage.antworten.map((a) => (
                    <li key={a.id} className="flex">
                      <Wahlflaeche
                        onClick={() => antworte(a)}
                        data-testid={`a7-antwort-${a.id}`}
                        className="items-start py-3 leading-snug"
                      >
                        {a.text}
                      </Wahlflaeche>
                    </li>
                  ))}
                </ul>
              ) : (
                <Reaktion wahl={wahl} besser={wahl?.art === 'gut' ? null : gute} />
              )}
            </div>
          ) : (
            <Feierabend liste={rueckblick(fortschritt)} />
          )}
        </Wechsel>
      }
      fuss={
        <StepFuss
          id="A7"
          uebungOffen={imGespraech}
          aktion={
            phase === 'reaktion' ? (
              <div className="flex items-center gap-2">
                {wahl?.art !== 'gut' && (
                  <Button
                    variant="leise"
                    onClick={() => setPhase('frage')}
                    data-testid="a7-noch-mal"
                  >
                    Noch mal sagen
                  </Button>
                )}
                <Button
                  variant="aktion"
                  onClick={weiterImGespraech}
                  data-testid="a7-naechste"
                >
                  {letzte ? 'Feierabend' : 'Nächste Frage'}
                </Button>
              </div>
            ) : null
          }
          geschafft={imGespraech ? null : 'Übergeben'}
        />
      }
    />
  )
}

/**
 * Die Reaktion der Kundin — und, wenn nötig, die verständlichere Antwort.
 *
 * **Alle drei Antwortsorten sehen hier gleich aus.** Kein Häkchen, kein X,
 * keine Farbe, die bewertet: die Kundin nickt oder sie schaut ratlos, und das
 * ist die ganze Rückmeldung. Ein grüner Haken über „Sie nickt“ würde aus einer
 * Reaktion eine Note machen — genau das, was dieser Screen nicht tut.
 */
function Reaktion({ wahl, besser }: { wahl: Antwort | null; besser?: Antwort | null }) {
  if (!wahl) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="kh-feld px-4 py-3" data-testid="a7-gesagt">
        <p className="kh-etikett">Du sagst</p>
        <p className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
          {wahl.text}
        </p>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        data-testid="a7-reaktion"
        className="kh-titel-klein text-kh-orange"
      >
        {wahl.reaktion}
      </motion.p>

      {besser && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="kh-feld px-4 py-3"
          data-testid="a7-besser"
        >
          <p className="kh-etikett">Verständlicher wäre</p>
          <p className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
            {besser.text}
          </p>
        </motion.div>
      )}
    </div>
  )
}

/**
 * Der Rückblick. Aufbau wie M8 — dieselbe Sache, derselbe Screenteil, und ein
 * zweiter Dialekt dafür wäre schlimmer als die Ähnlichkeit.
 */
function Feierabend({ liste }: { liste: string[] }) {
  return (
    <motion.div
      initial="aus"
      animate="an"
      variants={{ an: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
      data-testid="a7-rueckblick"
      className="kh-feld p-4 landscape:p-5"
    >
      <p className="kh-etikett">Du hast heute</p>
      <ul className="mt-3 flex flex-col gap-2">
        {liste.map((zeile) => (
          <motion.li
            key={zeile}
            variants={{ aus: { opacity: 0, x: -8 }, an: { opacity: 1, x: 0 } }}
            className="flex items-start gap-2.5 text-[1.125rem] leading-snug text-kh-paper"
          >
            <span
              aria-hidden
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-kh-signal text-[#0E0D0B]"
            >
              <Check className="size-3.5" strokeWidth={3.5} />
            </span>
            {zeile}
          </motion.li>
        ))}
      </ul>
      {/* Der Bogen zum Anfang — das Fadenobjekt dieses Tages ist das Haus, das
          vorher kalt war und nachher warm ist (Spec 2). */}
      <motion.p
        variants={{ aus: { opacity: 0 }, an: { opacity: 1 } }}
        transition={{ duration: 0.8 }}
        className="kh-titel-klein mt-4 border-t border-kh-line pt-4 text-kh-orange"
      >
        Heute früh war dieses Haus kalt.
      </motion.p>
    </motion.div>
  )
}
