import { Suspense, lazy, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { ACHSMASS_CM, ELEMENT_BREITE_M } from '@/khpl/buehne/zimmerer/kanon'
import type { Fensterausschnitt } from '@/khpl/buehne/zimmerer/Wandelement3D'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * C4 — Hier kommt das Fenster hin. **Der Fehler mit Preis**
 * (khpl-tage.md 1, Mechanismus 5; khpl-tag-zimmerer.md 6, C4).
 *
 * Der Besucher zieht den Ausschnitt auf dem liegenden Element auf. **Zwei Maße
 * stehen im Plan** — die Breite des Ausschnitts und die Höhe seiner Unterkante
 * über Rohboden. Beides sind die beiden Achsen der Zieh-Interaktion; die Höhe
 * der Öffnung geben die Wechselhölzer vor und wird nicht gezogen.
 *
 * **Der Preis unterscheidet sich vom Dachdecker.** Dort kostet ein Fehler
 * *Material* (der Balken ist Ausschuss). Hier kostet er **Zeit** — und zwar in
 * einer Halle, in der um elf der Lkw steht. Das ist die Ökonomie der
 * Vorfertigung: nicht das Holz ist teuer, der Takt ist es.
 *
 * - **Zu klein** → der Rahmen geht nicht rein. Nachschneiden geht.
 * - **Zu groß** → die Fuge ist zu breit für das Dichtband. Das Element muss
 *   aufgetrennt und ein neues Wechselholz gesetzt werden. Eine Stunde weg.
 *
 * **Die Fuge ist der Messwert, den der Screen anzeigt** — nicht die Breite.
 * Das ist der Fachinhalt, den die Übung nebenbei mitliefert: die Fuge ist kein
 * Fehler, sondern Absicht. Sie wird gedämmt und abgedichtet und fängt die
 * Bewegung des Materials auf. Ein Fenster, das passgenau in die Öffnung
 * geklemmt wird, ist falsch eingebaut.
 *
 * **Und hier wird zum ersten Mal nach oben gefragt.** Sobald der Rahmen sitzt,
 * kippt die Ansicht kurz in die Senkrechte (`aufrichtenZeigen`) und zeigt das
 * Element stehend, mit dem Fenster an seinem Platz. Ohne das ist die Frage in
 * C6 ein Ratespiel; mit ihr ist sie eine Erinnerungsleistung — und genau darum
 * geht es beim Vorstellungsvermögen (khpl-tag-zimmerer.md 1).
 *
 * Ab dem Treffer gehört das Element dem Besucher (`deinElement`).
 *
 * `answers.c4` `{ getroffen: boolean; versuche: number; abweichungMm?: number }`
 */

const Wandelement3D = lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))

// ---------------------------------------------------------------------------
// Maße — abgeleitet, nicht notiert (flow 8.4).
// ---------------------------------------------------------------------------

/**
 * **Die einzige belegte Zahl dieses Screens** (`belege/zimmerer.md` 5,
 * RAL-Montageleitfaden / ift Rosenheim): Holzfenster brauchen mit spritzbarem
 * Dichtstoff **mindestens 10 mm Fuge umlaufend**. Sie steht als Regel auf dem
 * Screen; alles andere hier ist Plan- oder Spielmaß.
 *
 * ⚠️ Der Screen sagt **Holzfenster**. Kunststofffenster brauchen deutlich
 * breitere Fugen (10–30 mm je nach Farbe und Länge), weil sie sich thermisch
 * stärker ausdehnen — in einer Zimmerei ist Holz ohnehin der Regelfall.
 */
const FUGE_MIN_MM = 10

/**
 * Ab hier ist die Fuge zu weit fürs Dichtband. **Spielgrenze, keine
 * Vorschrift** — deshalb steht die Zahl nirgends auf dem Screen: sie taucht nur
 * als Folge auf, wenn jemand sie überzieht. Der Beleg gibt für Holzfenster eine
 * Untergrenze her, keine Obergrenze; eine erfundene Obergrenze als Regel
 * hinzuschreiben wäre genau das, was khpl-tage.md verbietet.
 */
const FUGE_MAX_MM = 30

/**
 * Planmaß des Ausschnitts: zwei Felder im Raster, von Ständermitte zu
 * Ständermitte. Damit hängt die Zahl an C2 und ist keine zweite erfundene
 * Größe — 2 × 62,5 cm.
 */
const ZIEL_BREITE_MM = ACHSMASS_CM * 2 * 10

/** Das bestellte Fenster: Planmaß minus zweimal die Mindestfuge. */
const RAHMEN_BREITE_MM = ZIEL_BREITE_MM - 2 * FUGE_MIN_MM

/**
 * Unterkante über Rohboden, laut Plan dieses Elements. Szenariomaß — so wie
 * „Satteldach, 45 Grad“ in M2 das Szenario ist und keine Vorschrift.
 */
const ZIEL_Y_MM = 1000

/** Wie weit die Unterkante daneben liegen darf, bevor der Screen etwas sagt. */
const TOLERANZ_Y_MM = 20

/** Ziehweg der Breite. Weit genug für einen groben Fehlgriff in beide Richtungen. */
const MIN_BREITE_MM = 1000
const MAX_BREITE_MM = 1500
/** Ziehweg der Unterkante über Rohboden. */
const MIN_Y_MM = 400
const MAX_Y_MM = 1600

/** Die Öffnung ist so hoch wie breit — nicht Teil der Übung, gibt das Wechselholz vor. */
const FENSTER_HOEHE_MM = ZIEL_BREITE_MM

/** Ungefähr mittig auf dem acht Meter langen Element. */
const FENSTER_X_MM = Math.round((ELEMENT_BREITE_M * 1000 - ZIEL_BREITE_MM) / 2)

/**
 * Startlage: deutlich **zu weit**. Wer ohne hinzusehen auf „Ausschnitt setzen“
 * tippt, bekommt den teuren Fehler — und der ist der Inhalt dieses Screens.
 * Zurückgezogen wird er in zwei Sekunden.
 */
const START: Fensterausschnitt = {
  xMm: FENSTER_X_MM,
  yMm: 1220,
  breiteMm: 1420,
  hoeheMm: FENSTER_HOEHE_MM,
}

const ZIEL: Fensterausschnitt = {
  xMm: FENSTER_X_MM,
  yMm: ZIEL_Y_MM,
  breiteMm: ZIEL_BREITE_MM,
  hoeheMm: FENSTER_HOEHE_MM,
}

/** Nach zwei Fehlversuchen bietet die App die Lösung an (flow 6.6). */
const HILFE_AB = 2

const TREFFER_TEXT = 'Passt. Rahmen rein — das ist jetzt dein Element.'

const m = (mm: number) => `${(mm / 1000).toFixed(2).replace('.', ',')} m`

/** Die Fuge je Seite. Kann negativ werden: dann passt der Rahmen schlicht nicht. */
const fuge = (breiteMm: number) => Math.round((breiteMm - RAHMEN_BREITE_MM) / 2)

type Phase = 'ziehen' | 'aufrichten' | 'fertig'

interface Antwort {
  treffer: boolean
  text: string
}

export function C4() {
  const gespeichert = useFortschritt().answers.c4
  const fertigLautStore = !!gespeichert?.getroffen
  const [ausschnitt, setAusschnitt] = useState<Fensterausschnitt>(() =>
    fertigLautStore ? ZIEL : START,
  )
  const [versuche, setVersuche] = useState(() => gespeichert?.versuche ?? 0)
  const [antwort, setAntwort] = useState<Antwort | null>(() =>
    fertigLautStore ? { treffer: true, text: TREFFER_TEXT } : null,
  )
  // Wiedereinstieg über „Dein Weg“: das Endbild ohne Animation.
  const [phase, setPhase] = useState<Phase>(() => (fertigLautStore ? 'fertig' : 'ziehen'))
  const [geloest, setGeloest] = useState(fertigLautStore)

  const ziehbar = phase === 'ziehen'

  const pruefen = () => {
    const r = bewerte(ausschnitt)
    setAntwort(r)
    const n = versuche + 1
    setVersuche(n)
    if (r.treffer) {
      // Sofort speichern und sofort lösen: das Aufrichten ist eine Sekunde
      // Ansicht, kein Zustand, auf den jemand warten muss. Wer währenddessen
      // weitergeht, hat den Ausschnitt trotzdem im Store.
      merkeAntwort('c4', {
        getroffen: true,
        versuche: n,
        abweichungMm: ausschnitt.breiteMm - ZIEL_BREITE_MM,
      })
      setGeloest(true)
      setPhase('aufrichten')
    } else {
      merkeAntwort('c4', { getroffen: false, versuche: n })
    }
  }

  const zeigMirWie = () => {
    setAusschnitt((alt) => ({ ...alt, breiteMm: ZIEL.breiteMm, yMm: ZIEL.yMm }))
    setAntwort(null)
  }

  return (
    <StepShell
      id="C4"
      buehneInteraktiv
      interaktionOffen={!geloest}
      buehne={
        <Suspense
          fallback={<Dachstuhl3DFallback text="Das Element liegt auf dem Tisch" />}
        >
          <Wandelement3D
            zustand="fenster"
            ausschnitt={ausschnitt}
            onAusschnitt={(a) => {
              if (!ziehbar) return
              setAusschnitt({
                ...a,
                breiteMm: klemme(a.breiteMm, MIN_BREITE_MM, MAX_BREITE_MM),
                yMm: klemme(a.yMm, MIN_Y_MM, MAX_Y_MM),
              })
              setAntwort(null)
            }}
            aufrichtenZeigen={phase === 'aufrichten'}
            onAufrichtenEnde={() => setPhase('fertig')}
            deinElement={geloest}
          />
        </Suspense>
      }
      fachtext={
        ziehbar ? (
          <p>
            Der Ausschnitt wird gesetzt, das{' '}
            <Begriff id="wechselholz">Wechselholz</Begriff> kommt rein, der Rahmen sitzt.
            Ein Fenster hängt nicht in der Dämmung, es hängt im Holz.
          </p>
        ) : undefined
      }
      interaktion={
        <Wechsel takt={ziehbar ? 'ziehen' : 'gesetzt'}>
          {ziehbar ? (
            <div className="flex flex-col gap-3">
              <Planmass />
              <Istmass ausschnitt={ausschnitt} />
              <Rueckmeldung
                ok={antwort ? antwort.treffer : null}
                text={antwort ? antwort.text : null}
                testid="c4-rueckmeldung"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Rueckmeldung
                ok={antwort ? antwort.treffer : null}
                text={antwort ? antwort.text : null}
                testid="c4-rueckmeldung"
              />

              <dl
                className="kh-feld flex gap-6 px-3.5 py-2.5"
                data-testid="c4-dein-element"
              >
                <div>
                  <dt className="kh-etikett">Dein Ausschnitt</dt>
                  <dd className="font-display text-[clamp(1.6rem,1.2rem+1.1vw,2.1rem)] leading-none text-kh-paper tabular-nums">
                    {m(ausschnitt.breiteMm)}
                  </dd>
                </div>
                <div>
                  <dt className="kh-etikett">Fuge rundum</dt>
                  <dd className="font-display text-[clamp(1.6rem,1.2rem+1.1vw,2.1rem)] leading-none text-kh-paper tabular-nums">
                    {fuge(ausschnitt.breiteMm)} mm
                  </dd>
                </div>
              </dl>

              {/* Die Vorbereitung auf C6 — der eine Satz, der diesen Screen mit
                  dem Kran verbindet. Deshalb Anton und nicht Fließtext. */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                data-testid="c4-aufrichten-zeile"
                className="kh-titel-klein text-kh-orange"
              >
                So sieht das aus, wenn es steht. Merk dir, wo das Fenster ist.
              </motion.p>
            </div>
          )}
        </Wechsel>
      }
      aha={
        <>
          <AhaKarte sichtbar={geloest} eyebrow="Wie genau muss so ein Ausschnitt sitzen?">
            Wasserwaagengenauigkeit: höchstens anderthalb Millimeter Abweichung je Meter,
            bei einem drei Meter hohen Element also drei Millimeter auf die ganze Höhe.
          </AhaKarte>
          <AhaKarte
            sichtbar={geloest}
            eyebrow="Warum kostet ein Fehler hier eine Stunde?"
          >
            Weil nicht das Holz teuer ist, sondern der Takt. Um elf kommt der Lkw. Was
            jetzt liegen bleibt, steht am Nachmittag nicht auf der Baustelle.
          </AhaKarte>
        </>
      }
      fuss={
        <StepFuss
          id="C4"
          uebungOffen={!geloest}
          aktion={
            ziehbar ? (
              <div className="flex items-center gap-2">
                <Button variant="aktion" onClick={pruefen} data-testid="c4-pruefen">
                  Ausschnitt setzen
                </Button>
                {versuche >= HILFE_AB && (
                  <Button
                    variant="leise"
                    onClick={zeigMirWie}
                    data-testid="c4-zeig-mir-wie"
                  >
                    Zeig mir wie
                  </Button>
                )}
              </div>
            ) : null
          }
          geschafft={geloest ? 'Ausschnitt sitzt' : null}
        />
      }
    />
  )
}

function klemme(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

// ---------------------------------------------------------------------------
// Bewertung
// ---------------------------------------------------------------------------

/**
 * Reihenfolge mit Absicht: erst die Fuge, dann die Lage. Wer den Rahmen gar
 * nicht reinbekommt, will nicht über die Brüstungshöhe belehrt werden.
 *
 * Der Zu-groß-Fall nennt keine Grenzzahl — nur die Folge. Die Untergrenze ist
 * belegt und steht im Plan, die Obergrenze ist es nicht (siehe `FUGE_MAX_MM`).
 */
function bewerte(a: Fensterausschnitt): Antwort {
  const f = fuge(a.breiteMm)
  if (f < FUGE_MIN_MM) {
    return {
      treffer: false,
      text:
        f <= 0
          ? 'Zu schmal. Der Rahmen geht so gar nicht rein. Nachschneiden geht — das kostet dich zehn Minuten.'
          : `Zu knapp. ${f} Millimeter Fuge, und der Dichtstoff braucht zehn. Nachschneiden geht — das kostet dich zehn Minuten.`,
    }
  }
  if (f > FUGE_MAX_MM) {
    return {
      treffer: false,
      text: `${f} Millimeter Fuge — so breit fasst das Dichtband sie nicht mehr. Das Element muss auf, ein neues Wechselholz rein. Eine Stunde weg, und um elf steht der Lkw.`,
    }
  }
  const ab = Math.round(a.yMm - ZIEL_Y_MM)
  if (Math.abs(ab) > TOLERANZ_Y_MM) {
    return {
      treffer: false,
      text: `Die Fuge stimmt. Aber die Unterkante liegt ${Math.abs(ab)} Millimeter ${
        ab > 0 ? 'zu hoch' : 'zu tief'
      } — im fertigen Haus steht dieses Fenster dann schief zu allen anderen.`,
    }
  }
  return { treffer: true, text: TREFFER_TEXT }
}

// ---------------------------------------------------------------------------
// Das Soll und das Ist
// ---------------------------------------------------------------------------

/**
 * Das Soll. Steht im Panel, nicht auf der Bühne — wer die Maße sucht, darf
 * nicht am Bildrand danach schauen müssen, während er auf dem Element zieht
 * (Vorbild: `Werkzeichnung` in M4).
 *
 * Der Satz unter den Zahlen ist der eigentliche Fachinhalt des Screens: die
 * Fuge ist Absicht.
 */
function Planmass() {
  return (
    <div className="kh-feld flex flex-col gap-2 px-3.5 py-2.5">
      <p className="kh-etikett">Soll laut Plan</p>
      <dl className="flex gap-5">
        <div>
          <dt className="text-[0.875rem] text-kh-mute">Ausschnitt breit</dt>
          <dd className="font-display text-[1.5rem] leading-none text-kh-paper tabular-nums">
            {m(ZIEL_BREITE_MM)}
          </dd>
        </div>
        <div>
          <dt className="text-[0.875rem] text-kh-mute">Unterkante ab Rohboden</dt>
          <dd className="font-display text-[1.5rem] leading-none text-kh-paper tabular-nums">
            {m(ZIEL_Y_MM)}
          </dd>
        </div>
      </dl>
      <p className="text-[1rem] leading-snug text-kh-mute">
        Der Rahmen ist {m(RAHMEN_BREITE_MM)} breit. Zwischen ihm und dem Holz bleiben beim
        Holzfenster mindestens {FUGE_MIN_MM} Millimeter Fuge — sie wird gedämmt und
        abgedichtet und fängt die Bewegung des Materials auf. Ein Fenster, das passgenau
        in die Öffnung geklemmt wird, ist falsch eingebaut.
      </p>
    </div>
  )
}

/**
 * Das Ist, während gezogen wird. Groß ist hier **die Fuge**, nicht die Breite:
 * sie ist der Wert, auf den es ankommt, und die Breite ist nur der Weg dahin.
 */
function Istmass({ ausschnitt }: { ausschnitt: Fensterausschnitt }) {
  const f = fuge(ausschnitt.breiteMm)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span
          data-testid="c4-fuge"
          className="font-display text-[clamp(1.9rem,1.3rem+1.6vw,2.75rem)] leading-none text-kh-signal tabular-nums"
        >
          {f > 0 ? `${f} mm Fuge` : 'kein Platz'}
        </span>
        <span className="text-[1.0625rem] text-kh-mute">
          Zieh den Ausschnitt auf — direkt am Element.
        </span>
      </div>
      <p className="text-[1rem] text-kh-paper/60 tabular-nums">
        <span data-testid="c4-breite">{m(ausschnitt.breiteMm)}</span> breit · Unterkante{' '}
        <span data-testid="c4-hoehe">{m(ausschnitt.yMm)}</span>
      </p>
    </div>
  )
}
