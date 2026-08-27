import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Werkstueck } from '@/khpl/buehne/zerspanung/Werkstueck'
import {
  GROESSTMASS,
  KLEINSTMASS,
  KORREKTUR_SCHRITT,
  MESSWERTE,
  RASTER_KURVE,
  TOLERANZ,
  urteilFuer,
  type Urteil,
} from '@/khpl/buehne/zerspanung/kanon'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * Z5 — Und, passt es? **Der Signaturscreen.**
 *
 * Hier zahlt sich Z1 aus, vier Minuten später und an einem Teil, das der
 * Besucher selbst hat laufen lassen. Das ist das Gegenstück zu M7: dieselbe
 * Kenntnis, aus dem Kopf, ohne Ansage — und ausdrücklich **keine**
 * Reihenfolge-Übung, denn zwei Tage dürfen nicht dieselbe Hauptübung haben
 * (khpl-tage.md §4).
 *
 * **Zwei Beats** (khpl-tag-zerspanung.md §6 Z5):
 *
 *  1. **Messen.** Die Mikrometerschraube zudrehen, den Wert lesen, urteilen:
 *     Gut · Nacharbeiten · Ausschuss. Die drei Knöpfe sind kein Entwurf,
 *     sondern die Formulierung eines Azubis. Falsch geantwortet gibt keinen
 *     Tadel: das Toleranzfeld fährt ein und legt sich über den Messwert, man
 *     **sieht**, wo die Zahl liegt. Kein Rot, keine zweite Chance nötig.
 *  2. **Korrigieren.** Beim zweiten Teil steht 20,015 da — zu dick. Der
 *     Werkzeugkorrektor wird nachgestellt, noch eins läuft, und der neue Wert
 *     wird wieder gemessen. Messen, korrigieren, messen.
 *
 * Die Asymmetrie ist die Lektion: zu groß ist ein Problem, zu klein ist ein
 * Verlust. Deshalb fährt man sich in Serie von oben an das Maß heran — und
 * deshalb wurde in Z2 so lange gerüstet und in Z3 so vorsichtig gestartet.
 *
 * **Und die ethische Pointe sagt kein Screen laut** (§6 Z5): beim Dachdecker
 * ist ein zu kurzer Balken endgültig, hier ist ein falsches Maß eine
 * Korrektur, weil die Maschine wiederholt. Das sagen die beiden Übungen, nicht
 * ein Satz darüber. Deshalb trägt dieser Step **keine Aha-Karte**.
 *
 * ---
 *
 * ⚠️ **Gemeldeter Widerspruch in der Spec, nicht gelöst** (khpl-tage.md §3).
 * §6 Z5 sagt für Beat 2: „verstellt den Werkzeugkorrektor um einen Hundertstel
 * … jetzt passt es“, und `kanon.ts` setzt `KORREKTUR_SCHRITT` entsprechend auf
 * 0,01 mm. Das geht rechnerisch nicht auf: 20,015 − 0,01 = 20,005 und liegt
 * damit **immer noch** über dem Größtmaß 20,000. Ein Screen, der danach „jetzt
 * passt es“ sagt, hätte vor einem Besucher unrecht — derselbe Fehlertyp, den
 * die Spec bei `19,987` an sich selbst gefunden hat.
 *
 * Gebaut ist deshalb die Fassung, die **nichts erfindet und nichts behauptet**:
 * der Korrektor ist in Schritten von `KORREKTUR_SCHRITT` verstellbar, der
 * Screen rechnet den neuen Wert ehrlich aus und misst ihn wieder. Wer zu wenig
 * korrigiert, misst noch einmal — das ist der Kreislauf des Berufs und kein
 * Tadel. Ob die Auflösung stattdessen „ein Hundertstel am Radius, zwei am
 * Durchmesser“ heißen soll, ist eine fachliche Entscheidung und gehört in die
 * Abnahme (§11), nicht in diesen Step.
 */

// ---------------------------------------------------------------------------
// Text und Zahlen — gebündelt oben (flow 8.4).
// ---------------------------------------------------------------------------

/** Beat 1. Der erste Durchgang ist bewusst ein **gutes** Teil (§6 Z5). */
const TEIL_1 = MESSWERTE[0]
/** Beat 2: zu dick, nacharbeitbar. */
const TEIL_2 = MESSWERTE[1]

/**
 * Die drei Knöpfe — die eigene Formulierung eines Azubis auf die Frage, was
 * mit einem Teil passiert, das die Vorgabe verfehlt: „Oder es darf nacharbeiten
 * oder als Ausschuss.“ `INTERVIEW`, Zerspanungsmechaniker Ausbildung,
 * 30.06.2026.
 *
 * Die Begründungen stehen wörtlich in der Wertetabelle der Spec (§6 Z5).
 */
const URTEILE: readonly { id: Urteil; label: string; grund: string }[] = [
  {
    id: 'gut',
    label: 'Gut',
    grund: 'Liegt drin. Man sieht es der Zahl nicht an — man muss es prüfen.',
  },
  {
    id: 'nacharbeit',
    label: 'Nacharbeiten',
    grund: 'Zu dick. Material lässt sich noch abnehmen.',
  },
  {
    id: 'ausschuss',
    label: 'Ausschuss',
    grund: 'Zu dünn. Weg ist weg — man kann nichts wieder drankleben.',
  },
]

/**
 * Wie weit die Messschraube offen steht, bevor zugedreht wird, in mm.
 *
 * **Ein Bühnenmaß, keine Fachaussage** — es sagt nur, wie weit die Anzeige
 * mitläuft, während der Besucher zudreht. Auf dem Screen erscheint dabei keine
 * Behauptung, sondern eine laufende Zahl.
 */
const OFFEN_UM = 0.6

/** Die Achse des Toleranzbandes. Ebenfalls Bühne: sie trägt keine Beschriftung. */
const ACHSE_VON = 19.96
const ACHSE_BIS = 20.02

/** Weiter als der Korrektor sinnvoll verstellt wird. */
const KORREKTUR_MAX = 0.05

/**
 * Die Rasterkurve dieses Tages als Tupel. `kanon.ts` hält sie `as const`, damit
 * sie three-frei und unveränderlich bleibt; `motion` verlangt an dieser Stelle
 * ein beschreibbares Vierertupel.
 */
const RASTER = [...RASTER_KURVE] as [number, number, number, number]

/** Hundertstel — so rastet die Anzeige beim Zudrehen. */
const rasten = (n: number) => Math.round(n * 100) / 100
/** Der abgelesene Wert, auf Tausendstel genau geführt. */
const genau = (n: number) => Number(n.toFixed(3))
/** `19.987` → `19,987`. Deutsch, mit Komma, wie auf jeder Anzeige in der Halle. */
const mass = (n: number) => n.toFixed(3).replace('.', ',')

/**
 * Der Endwert, den der kleinste Korrektorstand in ganzen Schritten aus TEIL_2
 * macht — 20,015 − 2 × 0,01 = 19,995 mm, in der Toleranz.
 *
 * Der **Ersatzwert** für Stände, die den erreichten Wert nicht mitbringen:
 * alte `localStorage`-Sitzungen und der Fall, dass `endwert` aus der Prüfung
 * gefallen ist. Regulär schreibt `laufenLassen` die eigene Zahl nach
 * `answers.z5.endwert` und der Screen zeigt sie wieder — sie ist „deine Zahl“
 * (§2), und eine andere nach dem Rücksprung wäre eine Unstimmigkeit an genau
 * dem Fadenobjekt dieses Tages.
 *
 * Was der Ersatzwert leisten muss: wirklich „gut“ sein. Stünde dort TEIL_2
 * (20,015), zeigte der Screen eine Zahl außerhalb der Toleranz im Gut-Ton —
 * genau der Fehlertyp, den die Spec bei 19,987 an sich selbst gefunden hat.
 */
const ENDWERT = genau(
  TEIL_2.wert -
    Math.ceil((TEIL_2.wert - GROESSTMASS) / KORREKTUR_SCHRITT) * KORREKTUR_SCHRITT,
)

const labelFuer = (u: Urteil | null) => URTEILE.find((x) => x.id === u)?.label ?? ''
const grundFuer = (u: Urteil) => URTEILE.find((x) => x.id === u)?.grund ?? ''

/**
 * Takt des Screens (Muster: `Wechsel`). Das Panel wächst nicht, es wird
 * ausgetauscht.
 *
 *   zudrehen    — die Messschraube schließen, die Anzeige läuft mit
 *   urteilen    — der Wert steht, die drei Knöpfe stehen
 *   gemessen    — das Toleranzfeld fährt ein und legt sich über die Zahl
 *   korrigieren — Beat 2: nachstellen und noch eins laufen lassen
 *   fertig      — die drei Werte und ihre Asymmetrie
 */
type Takt = 'zudrehen' | 'urteilen' | 'gemessen' | 'korrigieren' | 'fertig'

export function Z5() {
  const gespeichert = useFortschritt().answers.z5

  const [takt, setTakt] = useState<Takt>(() =>
    gespeichert?.korrigiert ? 'fertig' : gespeichert?.urteil ? 'korrigieren' : 'zudrehen',
  )
  const [drehung, setDrehung] = useState(() => (gespeichert ? 100 : 0))
  const [urteil, setUrteil] = useState<Urteil | null>(gespeichert?.urteil ?? null)
  const [korrektur, setKorrektur] = useState(0)
  const [ergebnis, setErgebnis] = useState(() =>
    gespeichert?.korrigiert ? (gespeichert.endwert ?? ENDWERT) : TEIL_2.wert,
  )
  const [meldung, setMeldung] = useState<string | null>(null)

  const fertig = takt === 'fertig'
  const richtig = urteil === TEIL_1.urteil

  /**
   * Was auf der Anzeige steht — je Takt eine andere Zahl, immer dieselbe Uhr.
   *
   * **In Beat 2 steht dort der zuletzt gemessene Wert, nicht der gerechnete.**
   * Der Korrektor ist eine Einstellung an der Maschine, kein Messgerät: Wer am
   * Korrektor tippt, verändert das nächste Teil, nicht das Teil, das in der
   * Mikrometerschraube liegt. Liefe die Anzeige beim Tippen mit, zeigte der
   * Screen das Messergebnis eines Teils, das noch gar nicht gelaufen ist — die
   * Übung wäre durch Ablesen lösbar, „Noch eins laufen lassen“ bewirkte
   * sichtbar nichts mehr, und die Bühne vermäße ein Teil, das es nicht gibt.
   * Erst `laufenLassen` setzt `ergebnis` und damit Anzeige, Toleranzband und
   * Bühne neu. So trägt der Knopf die Handlung, und aus messen, korrigieren,
   * messen wird wirklich ein Kreislauf.
   */
  const angezeigt =
    takt === 'zudrehen'
      ? drehung >= 100
        ? TEIL_1.wert
        : rasten(TEIL_1.wert + (1 - drehung / 100) * OFFEN_UM)
      : takt === 'korrigieren' || takt === 'fertig'
        ? ergebnis
        : TEIL_1.wert

  /**
   * Zudrehen. Sobald sie anliegt, steht der Wert — und damit die Frage. Kein
   * eigener Knopf dazwischen: die Schraube *ist* die Handlung.
   */
  const drehe = (n: number) => {
    setDrehung(n)
    if (n >= 100) setTakt('urteilen')
  }

  const beurteile = (gewaehlt: Urteil) => {
    setUrteil(gewaehlt)
    setTakt('gemessen')
    merkeAntwort('z5', {
      urteil: gewaehlt,
      richtig: gewaehlt === TEIL_1.urteil,
      korrigiert: false,
    })
  }

  const naechstesTeil = () => {
    setMeldung(null)
    setTakt('korrigieren')
  }

  /**
   * Beat 2. Der Screen rechnet den neuen Wert aus und **misst ihn wieder** —
   * er behauptet nicht, dass es jetzt passt. Passt es noch nicht, wird
   * nachgestellt; das ist der Kreislauf und kein Fehler des Besuchers.
   */
  const laufenLassen = () => {
    const neu = genau(TEIL_2.wert - korrektur)
    setErgebnis(neu)
    if (urteilFuer(neu) === 'gut') {
      setMeldung(null)
      setTakt('fertig')
      merkeAntwort('z5', {
        urteil: urteil ?? TEIL_1.urteil,
        richtig,
        korrigiert: true,
        // Die eigene Zahl, nicht die gerechnete: Wer weiter korrigiert hat,
        // liest nach dem Rücksprung über „Dein Weg“ wieder seinen Wert.
        endwert: neu,
      })
    } else if (neu > GROESSTMASS) {
      setMeldung('Immer noch zu dick. Stell den Korrektor weiter nach.')
    } else {
      setMeldung('Jetzt zu dünn. Von oben ans Maß heran, nicht von unten.')
    }
  }

  return (
    <StepShell
      id="Z5"
      /*
        R4: Der eine Anweisungssatz sagt, was **jetzt** zu tun ist — je Takt
        ein anderer. „Dreh die Messschraube zu“ über dem Korrektor war eine
        abgeschlossene Handlung über einer anderen Übung. `gemessen` trägt
        keinen: dort ist die Aktion der Knopf „Nächstes Teil“ im Fuß.
      */
      auftrag={
        takt === 'zudrehen'
          ? 'Dreh die Messschraube zu, bis sie anliegt.'
          : takt === 'urteilen'
            ? 'Sag, was mit diesem Teil passiert.'
            : takt === 'korrigieren'
              ? 'Stell den Korrektor nach und lass noch eins laufen.'
              : null
      }
      ansage={{
        geste: 'ziehen-regler',
        text: 'Du misst dein Teil selbst nach — mit einer Schraube, die Tausendstel anzeigt.',
        haken: 'Zu fest gedreht misst du deine eigene Kraft mit.',
      }}
      interaktionOffen={!fertig}
      buehne={
        <Werkstueck
          zustand="messung"
          messwert={angezeigt}
          toleranzUeberlagerung={takt === 'gemessen' || takt === 'korrigieren'}
          korrigiert={fertig}
        />
      }
      warum={
        takt === 'zudrehen' ? (
          <p>
            Das erste Teil ist durch. Es liegt in der{' '}
            <Begriff id="buegelmessschraube">Mikrometerschraube</Begriff> — dreh sie zu,
            bis sie anliegt.
          </p>
        ) : takt === 'korrigieren' ? (
          <p>
            Das nächste Teil ist zu dick, aber nachzuarbeiten. Du änderst nicht das
            Programm, sondern die{' '}
            <Begriff id="werkzeugkorrektur">Werkzeugkorrektur</Begriff> — und lässt noch
            eins laufen.
          </p>
        ) : fertig ? (
          <p>
            Passt. Und weil die Maschine wiederholt, passt das nächste auch — und das
            übernächste.
          </p>
        ) : (
          <p>
            Ein Wert steht da — und jetzt die Frage, auf die es in diesem Beruf
            hinausläuft: gut, nacharbeiten oder{' '}
            <Begriff id="ausschuss">Ausschuss</Begriff>?
          </p>
        )
      }
      interaktion={
        <Wechsel takt={takt}>
          {takt === 'zudrehen' ? (
            <div className="flex flex-col gap-3">
              <Anzeige wert={angezeigt} ton="offen" />
              <div data-wisch="aus">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={drehung}
                  onChange={(e) => drehe(Number(e.target.value))}
                  data-testid="z5-schraube"
                  aria-label="Mikrometerschraube zudrehen"
                  className="kh-regler w-full"
                />
                <p className="text-[0.9375rem] text-kh-mute/70">
                  Zieh nach rechts, bis sie am Teil anliegt.
                </p>
              </div>
            </div>
          ) : takt === 'urteilen' ? (
            <div className="flex flex-col gap-3">
              <Anzeige wert={angezeigt} ton="steht" />
              <p className="text-[1.125rem] font-semibold text-kh-paper sm:text-[1.25rem]">
                Und, passt es?
              </p>
              {/*
                Drei gleich große Flächen. Keine ist hervorgehoben und keine
                versteckt: die Antwort ergibt sich aus dem Toleranzfeld, das in
                Z1 stand — nicht daraus, welcher Knopf am lautesten aussieht.
              */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {URTEILE.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => beurteile(u.id)}
                    data-testid={`z5-urteil-${u.id}`}
                    className={`${wahlflaeche({ form: 'zeile' })} justify-center font-semibold`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          ) : takt === 'gemessen' ? (
            <div className="flex flex-col gap-3" data-testid="z5-auswertung">
              <Anzeige wert={angezeigt} ton={richtig ? 'gut' : 'steht'} />
              <Toleranzband wert={angezeigt} />
              <div className="kh-feld px-4 py-3">
                <p className="kh-etikett">
                  {richtig ? 'Richtig gelesen' : 'Sieh es dir an'}
                </p>
                <p className="mt-1.5 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
                  {richtig
                    ? grundFuer(TEIL_1.urteil)
                    : `Du hast „${labelFuer(urteil)}“ gesagt. Das Toleranzfeld liegt jetzt über der Zahl — sieh nach, wo sie sitzt. ${grundFuer(TEIL_1.urteil)}`}
                </p>
              </div>
            </div>
          ) : takt === 'korrigieren' ? (
            <div className="flex flex-col gap-3">
              <Anzeige wert={angezeigt} ton="steht" />
              <Toleranzband wert={angezeigt} />
              <Korrektor wert={korrektur} onWert={setKorrektur} />
              <Rueckmeldung
                ok={meldung ? false : null}
                text={meldung}
                testid="z5-meldung"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3" data-testid="z5-lektion">
              <Anzeige wert={angezeigt} ton="gut" />
              {/*
                Zum Schluss die drei Werte nebeneinander — die Asymmetrie ist
                die eigentliche Lektion des Tages (§6 Z5), und sie steht hier
                und nicht vorher: davor wäre sie die Lösung der Übung gewesen.
              */}
              <motion.dl
                initial="aus"
                animate="an"
                variants={{
                  an: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
                }}
                className="flex flex-col"
              >
                {MESSWERTE.map((m) => {
                  const u = URTEILE.find((x) => x.id === m.urteil)
                  return (
                    <motion.div
                      key={m.wert}
                      variants={{ aus: { opacity: 0, x: -10 }, an: { opacity: 1, x: 0 } }}
                      className="flex items-baseline gap-3 border-b border-kh-line py-2 last:border-0"
                    >
                      <dt className="w-[5.5rem] shrink-0 font-display text-[1.375rem] text-kh-paper tabular-nums">
                        {mass(m.wert)}
                      </dt>
                      <dd className="min-w-0 text-[1rem] leading-snug text-kh-paper/80">
                        <span className="font-semibold text-kh-orange">{u?.label}</span>
                        {' · '}
                        {u?.grund}
                      </dd>
                    </motion.div>
                  )
                })}
              </motion.dl>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="kh-titel-klein border-t border-kh-line pt-3 text-kh-orange"
              >
                Deshalb fährt man sich von oben an das Maß heran.
              </motion.p>
            </div>
          )}
        </Wechsel>
      }
      fuss={
        <StepFuss
          id="Z5"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Maß sitzt' : null}
          aktion={
            takt === 'gemessen' ? (
              <Button variant="aktion" onClick={naechstesTeil} data-testid="z5-naechstes">
                Nächstes Teil
              </Button>
            ) : takt === 'korrigieren' ? (
              <Button variant="aktion" onClick={laufenLassen} data-testid="z5-laufen">
                Noch eins laufen lassen
              </Button>
            ) : undefined
          }
        />
      }
    />
  )
}

/**
 * Die Anzeige. `kh-zahl` trägt hier die Hauptrolle — dieser Tag gehört den
 * Ziffern, so wie der Zimmerer-Tag der Masse gehört (§7).
 *
 * Drei Töne, und sie folgen der Farbregel des Systems: Gelbgrün heißt
 * ausschließlich „das hast du geschafft“, deshalb steht es nur auf dem Wert,
 * der in der Toleranz liegt. Solange gedreht wird, ist die Zahl gedämpft: sie
 * ist noch keine Aussage, sondern eine laufende Uhr.
 */
function Anzeige({ wert, ton }: { wert: number; ton: 'offen' | 'steht' | 'gut' }) {
  return (
    <div className="flex items-baseline gap-2.5">
      {/* Die Anzeige rastet ein — hart, ohne Überschwingen (§7). */}
      <motion.span
        key={ton}
        initial={ton === 'gut' ? { scale: 0.92 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, ease: RASTER }}
        data-testid="z5-anzeige"
        className={`kh-zahl ${
          ton === 'offen' ? 'text-kh-paper/45' : ton === 'steht' ? 'text-kh-paper' : ''
        }`}
      >
        {mass(wert)}
      </motion.span>
      <span className="text-[1.125rem] font-semibold text-kh-mute">mm</span>
    </div>
  )
}

/**
 * Das Toleranzfeld, das sich über den Messwert legt (§6 Z5).
 *
 * Es ist die Antwort auf eine falsche Eingabe — statt eines Tadels sieht man,
 * wo die Zahl liegt. Deshalb trägt es keine Wertung und keine rote Fläche: die
 * Zone ist gelbgrün, weil „drin“ im ganzen System diese Farbe hat, und die
 * Marke ist orange, weil sie der eigene Messwert ist.
 */
function Toleranzband({ wert }: { wert: number }) {
  const pos = (n: number) => ((n - ACHSE_VON) / (ACHSE_BIS - ACHSE_VON)) * 100
  const links = pos(KLEINSTMASS)
  const breite = pos(GROESSTMASS) - links

  return (
    <div className="flex flex-col gap-1.5" data-testid="z5-toleranzband">
      <div className="relative h-9">
        <div
          aria-hidden
          className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/12"
        />
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scaleX: 0.4 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, ease: RASTER }}
          style={{ left: `${links}%`, width: `${breite}%` }}
          className="absolute top-1/2 h-3.5 -translate-y-1/2 rounded-[3px] border-y-2 border-kh-signal bg-kh-signal/25"
        />
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, left: `${pos(wert)}%` }}
          transition={{ duration: 0.55, ease: RASTER }}
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-kh-orange ring-4 ring-[#0E0D0B]"
        />
      </div>
      {/*
        Die beiden Grenzen als Text und nicht als Achsenbeschriftung: sie sind
        die belegte Aussage dieses Screens (ISO 286, `belege/zerspanung.md` 1),
        die Achse selbst ist nur Bühne.
      */}
      <p className="text-[0.9375rem] text-kh-mute tabular-nums">
        Erlaubt: {mass(KLEINSTMASS)} bis {mass(GROESSTMASS)} mm — {mass(TOLERANZ)} mm
        Spielraum.
      </p>
    </div>
  )
}

/**
 * Der Werkzeugkorrektor. Wörtlich belegt, samt der beiden Größen, um die es
 * geht: „In der Maschine. Werkzeugkorrektor. … Radius oder Länge.“ `INTERVIEW`
 * — Ausbildung Zerspanungsmechaniker, 01.07.2026.
 *
 * Zwei Trefferflächen und eine Zahl dazwischen statt eines Reglers: hier wird
 * nicht geschätzt, hier wird gerastet — ein Hundertstel je Tap (§7,
 * Bewegungsgefühl).
 */
function Korrektor({ wert, onWert }: { wert: number; onWert: (n: number) => void }) {
  const stelle = (richtung: number) =>
    onWert(
      Math.min(KORREKTUR_MAX, Math.max(0, genau(wert + richtung * KORREKTUR_SCHRITT))),
    )

  return (
    <div className="kh-feld flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="kh-etikett">Werkzeugkorrektur</p>
        <p className="mt-0.5 text-[1rem] text-kh-paper/70">
          Weniger Material stehen lassen
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="neben"
          size="icon"
          onClick={() => stelle(-1)}
          disabled={wert <= 0}
          aria-label="Korrektur verringern"
          data-testid="z5-korrektur-minus"
        >
          −
        </Button>
        <span
          data-testid="z5-korrektur"
          className="w-[5rem] text-center font-display text-[1.5rem] text-kh-paper tabular-nums"
        >
          {mass(wert)}
        </span>
        <Button
          variant="neben"
          size="icon"
          onClick={() => stelle(1)}
          disabled={wert >= KORREKTUR_MAX}
          aria-label="Korrektur erhöhen"
          data-testid="z5-korrektur-plus"
        >
          +
        </Button>
      </div>
    </div>
  )
}
