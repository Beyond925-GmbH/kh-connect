import { Suspense, lazy, useState } from 'react'
import { Button } from '@/components/ui/button'
import { berechneMasse } from '@/dachstuhl/mass'
import { STANDARD_PARAMETER } from '@/dachstuhl/parameter'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import type { Zuschnitt3DProps } from '@/khpl/buehne/Zuschnitt3D'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * M4 — Ein Balken, ein Maß.
 *
 * Übung: Maß ablesen, Schnitt setzen (khpl-flow.md 7 M4) — jetzt auf einer
 * 3D-Bühne: der Balken liegt auf Böcken im Hof, die Schnittlinie wird direkt
 * am Holz gezogen, die drei Winkel-Knöpfe kippen die Schnittebene sichtbar.
 * Trifft der Schnitt, fährt die Säge, der Verschnitt fällt ab, und der Sparren
 * wird auf den Anhänger geladen — das Finale für alle im Hauptweg. Von hier an
 * ist er **dein Sparren**: dasselbe markierte Stück auf dem Anhänger (M5/M6),
 * beim Aufrichten (M7) und im fertigen Dach (M8).
 *
 * „Feedback mit Toleranz: ‚3 cm zu kurz — der Balken ist Ausschuss.‘ Der Fehler
 * kostet Material, und genau das ist die Lektion.“ Der Screen verbindet
 * Planlesen mit Handwerk — die Brücke zu B3.2.
 *
 * Solange der Schnitt nicht sitzt, ist „Schnitt setzen“ die Primärhandlung im
 * Fuß und Weiter nur ein leises Überspringen (siehe `Verzweigung`). Wer
 * überspringt, sieht die Markierung in M5–M8 trotzdem — die Team-Fiktion trägt
 * das: der Abbund-Betrieb hat das Stück vorbereitet.
 */

const Zuschnitt3D = lazy(() => import('@/khpl/buehne/Zuschnitt3D'))

// ---------------------------------------------------------------------------
// Maße — vollständig aus dem Modell abgeleitet (`mass.ts`), nichts notiert.
// `mass.ts` ist renderfrei, der Import zieht kein three in den Erststart.
// ---------------------------------------------------------------------------

const MASSE = berechneMasse(STANDARD_PARAMETER)
/** Ziel = echte Sparrenlänge ENTLANG DER UNTERKANTE, gerundet aufs Drag-Raster (10 mm). */
const ZIEL_MM = Math.round(MASSE.lS * 100) * 10
const WINKEL = [30, 45, 60] as const
type Winkel = (typeof WINKEL)[number]
/** Firstwinkel = lotrechter Schnitt: 90° − Dachneigung; auf den Literaltyp verengt. */
const ROH_WINKEL = Math.round(90 - (MASSE.p.alpha * 180) / Math.PI)
const ZIEL_WINKEL: Winkel = WINKEL.find((w) => w === ROH_WINKEL) ?? 45
if (import.meta.env.DEV && ZIEL_WINKEL !== ROH_WINKEL)
  console.warn('[m4] Zielwinkel liegt nicht in der Auswahl:', ROH_WINKEL)
/** Rohspanne um das Ziel (Beschluss: ca. 6,0–8,0 m) — als Ableitung, nicht als Zahl. */
const MIN_MM = Math.floor((ZIEL_MM - 800) / 1000) * 1000
const MAX_MM = Math.ceil((ZIEL_MM + 1000) / 1000) * 1000
/** Deutlich zu lang: der erste Zug geht nach links, Richtung Maß. */
const START_MM = MAX_MM - 600
/**
 * Was noch als Treffer gilt. 3 cm sind im Feedbacktext der Spec die Grenze zum
 * Ausschuss („Drei Zentimeter zu kurz“) — also ist alles darunter ein Treffer.
 */
const TOLERANZ_MM = 30

/** Nach zwei Fehlversuchen bietet die App die Lösung an (flow 6.6). */
const HILFE_AB = 2

type Phase = Zuschnitt3DProps['phase']

const mm = (n: number) => `${(n / 1000).toFixed(2).replace('.', ',')} m`

const TREFFER_TEXT = 'Passt. Nummer drauf — das ist jetzt dein Sparren.'

export function M4() {
  const gespeichert = useFortschritt().answers.m4
  const fertig = !!gespeichert?.getroffen
  const [laenge, setLaenge] = useState(() => (fertig ? ZIEL_MM : START_MM))
  const [winkel, setWinkel] = useState<Winkel | null>(() => (fertig ? ZIEL_WINKEL : null))
  const [versuche, setVersuche] = useState(() => gespeichert?.versuche ?? 0)
  const [ergebnis, setErgebnis] = useState<Rueckmeldung | null>(() =>
    fertig ? { treffer: true, text: TREFFER_TEXT } : null,
  )
  // Wiedereinstieg: Endbild ohne Animation — die Anzeige hängt nur an
  // `getroffen`, `verladen` ist Protokoll (alte Stände kennen es nicht).
  const [phase, setPhase] = useState<Phase>(() => (fertig ? 'fertig' : 'einstellen'))
  const [geloest, setGeloest] = useState(fertig)

  const pruefen = () => {
    const r = bewerte(laenge, winkel)
    setErgebnis(r)
    const n = versuche + 1
    setVersuche(n)
    if (r.treffer) {
      // Der Treffertext bleibt während Sägen und Verladen stehen. Gespeichert
      // wird SOFORT: wer während der ~4 s Animation weiterspringt (oder der
      // Leerlauf zuschlägt), hat den Schnitt trotzdem im Store — vorher stand
      // dort noch der letzte Fehlversuch. `verladen` kommt in `onVerladenEnde`
      // als Protokoll-Upgrade dazu.
      merkeAntwort('m4', { getroffen: true, versuche: n })
      setPhase('saegen')
    } else {
      merkeAntwort('m4', { getroffen: false, versuche: n })
    }
  }

  const zeigMirWie = () => {
    setLaenge(ZIEL_MM)
    setWinkel(ZIEL_WINKEL)
    setErgebnis(null)
  }

  const einstellbar = phase === 'einstellen'

  return (
    <StepShell
      id="M4"
      auftrag={geloest ? null : 'Zieh die Schnittlinie auf das Maß aus dem Plan.'}
      ansage={{
        geste: 'ziehen-frei',
        text: 'Jetzt schneidest du einen Balken zu, der später ins Dach kommt.',
        haken: 'Zu kurz geschnitten ist Ausschuss — das Maß holst du nicht zurück.',
      }}
      buehneInteraktiv
      interaktionOffen={!geloest}
      buehne={
        <Suspense
          fallback={<Dachstuhl3DFallback text="Die Werkstatt wird eingerichtet" />}
        >
          <Zuschnitt3D
            rohMm={MAX_MM}
            laengeMm={laenge}
            winkel={winkel}
            phase={phase}
            onLaenge={(n) => {
              setLaenge(Math.min(MAX_MM, Math.max(MIN_MM, n)))
              setErgebnis(null)
            }}
            onSaegenEnde={() => setPhase('verladen')}
            onVerladenEnde={() => {
              setPhase('fertig')
              setGeloest(true)
              merkeAntwort('m4', { getroffen: true, versuche, verladen: true })
            }}
          />
        </Suspense>
      }
      warum={
        <p>
          Plan lesen, anzeichnen, ablängen. Die großen Serien macht die{' '}
          <Begriff id="abbundanlage">Abbundanlage</Begriff>, die Sonderteile macht jemand
          von Hand. Jedes Stück bekommt seine Nummer.
        </p>
      }
      interaktion={
        /*
          Zwei Takte, nicht ein wachsender Stapel. Solange eingestellt wird,
          steht hier die Aufgabe: das Soll aus dem Plan, das eigene Maß, die
          Winkelwahl. Sitzt der Schnitt, wird das alles **ersetzt** — das Soll
          hat seinen Zweck erfüllt, und drei tote Winkelknöpfe unter einem
          fertigen Sparren sind nur noch Möbel. Übrig bleibt, was jetzt gilt:
          dein Stück, sein Maß, sein Winkel.
        */
        <Wechsel takt={einstellbar ? 'einstellen' : 'geschnitten'}>
          {einstellbar ? (
            <div className="flex flex-col gap-3 max-sm:gap-1.5">
              <Werkzeichnung />

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span
                  data-testid="m4-laenge"
                  className="font-display text-[clamp(1.9rem,1.3rem+1.6vw,2.75rem)] leading-none text-kh-signal tabular-nums max-sm:text-[1.6rem]"
                >
                  {mm(laenge)}
                </span>
                <span className="text-[1.0625rem] text-kh-mute max-sm:text-[0.9375rem]">
                  {/* Auf dem Handy einzeilig — der Nachsatz stand dort als
                      zweite Zeile, und genau die schob die Winkelwahl unter
                      die Scrollkante. */}
                  <span className="sm:hidden">Zieh die Linie am Balken aufs Maß.</span>
                  <span className="max-sm:hidden">
                    Zieh die Schnittlinie auf das Maß — direkt am Balken.
                  </span>
                </span>
              </div>

              <div className="flex shrink-0 flex-col gap-1.5 max-sm:gap-1">
                <p className="text-[1.0625rem] text-kh-mute max-sm:text-[0.9375rem]">
                  Und der Winkel am First:
                </p>
                <div className="flex gap-2">
                  {WINKEL.map((w) => (
                    <Wahlflaeche
                      key={w}
                      onClick={() => {
                        setWinkel(w)
                        setErgebnis(null)
                      }}
                      data-testid={`m4-winkel-${w}`}
                      gewaehlt={winkel === w}
                      // `ton="vorlaeufig"` aus demselben Grund wie in M1: die
                      // Wahl ist hier **vorläufig**. Geprüft wird sie erst mit
                      // „Schnitt setzen“, und bis dahin kann sie falsch sein —
                      // ein gelbgrün gefüllter 30°-Knopf sagte „geschafft“ über
                      // eine Antwort, die den Sparren gerade zu Ausschuss
                      // macht. Der vorläufige Ton (limetter Rand, kaum Füllung)
                      // sagt „getippt, noch nicht geprüft“; die satte Füllung
                      // trägt der Fuß, wenn der Schnitt sitzt. Orange gehört
                      // nach R3 der Welt, nicht der Wahl.
                      ton="vorlaeufig"
                      className="flex-1 justify-center gap-2 font-semibold max-sm:min-h-[44px]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="size-6 max-sm:size-5"
                        aria-hidden
                      >
                        <path
                          d={`M2 20 L22 20 L22 ${20 - 20 * Math.tan((w * Math.PI) / 180) * 0.5} Z`}
                          fill="currentColor"
                          opacity="0.5"
                        />
                      </svg>
                      {w}°
                    </Wahlflaeche>
                  ))}
                </div>
              </div>

              <div className="shrink-0">
                <Rueckmeldung
                  ok={ergebnis ? ergebnis.treffer : null}
                  text={ergebnis ? ergebnis.text : null}
                  testid="m4-rueckmeldung"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Rueckmeldung
                ok={ergebnis ? ergebnis.treffer : null}
                text={ergebnis ? ergebnis.text : null}
                testid="m4-rueckmeldung"
              />

              {/* Das Ergebnis als zwei Zahlen — dasselbe Paar, das eben noch
                  das Soll war. Aus der Aufgabe wird der Beleg. */}
              <dl
                className="kh-feld flex gap-6 px-3.5 py-2.5"
                data-testid="m4-dein-sparren"
              >
                <div>
                  <dt className="kh-etikett">Dein Sparren</dt>
                  <dd className="font-display text-[clamp(1.6rem,1.2rem+1.1vw,2.1rem)] leading-none text-kh-paper tabular-nums">
                    {mm(laenge)}
                  </dd>
                </div>
                <div>
                  <dt className="kh-etikett">Am First</dt>
                  <dd className="font-display text-[clamp(1.6rem,1.2rem+1.1vw,2.1rem)] leading-none text-kh-paper tabular-nums">
                    {winkel}°
                  </dd>
                </div>
              </dl>

              {phase === 'verladen' && (
                <p
                  data-testid="m4-verladen-zeile"
                  className="text-[1.0625rem] text-kh-mute"
                >
                  Ab auf den Anhänger. Die übrigen Teile hat der Abbund-Betrieb schon
                  vorbereitet.
                </p>
              )}
            </div>
          )}
        </Wechsel>
      }
      aha={
        <AhaKarte sichtbar={geloest} eyebrow="Schneidet das heute noch jemand von Hand?">
          Den Zuschnitt macht meist eine Maschine, nach genau dem Plan, den du gezeichnet
          hast. Von Hand kommt, was sie nicht kann — mehr, als man denkt.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="M4"
          // Während Säge und Verladung laufen, zeigt der Fuß gar keinen Weg
          // nach vorn: ein „Überspringen“ direkt neben dem frischen „Passt.“
          // widerspräche sich, und ein lauter Weiter-Knopf spränge mitten aus
          // dem Finale. Die Animation dauert ~4 s (reduzierte Bewegung: 0 s),
          // und der Schnitt ist zu diesem Zeitpunkt schon gespeichert.
          ohneWeiter={phase === 'saegen' || phase === 'verladen' ? true : undefined}
          uebungOffen={!geloest}
          aktion={
            einstellbar ? (
              <div className="flex items-center gap-2">
                <Button variant="aktion" onClick={pruefen} data-testid="m4-pruefen">
                  Schnitt setzen
                </Button>
                {versuche >= HILFE_AB && (
                  <Button
                    variant="leise"
                    onClick={zeigMirWie}
                    data-testid="m4-zeig-mir-wie"
                  >
                    Zeig mir wie
                  </Button>
                )}
              </div>
            ) : null
          }
          geschafft={geloest ? 'Zugeschnitten und verladen' : null}
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Bewertung
// ---------------------------------------------------------------------------

interface Rueckmeldung {
  treffer: boolean
  text: string
}

/**
 * Reihenfolge mit Absicht: erst die Länge, dann der Winkel. Wer 20 Zentimeter
 * daneben liegt, will nicht über den Winkel belehrt werden — **erfahren muss er
 * aber, dass auch der danebenliegt.** Sonst sagt der Screen „36 Zentimeter zu
 * kurz“, man zieht das Maß zurecht, drückt wieder, und bekommt den zweiten
 * Fehler einzeln nachgereicht. Deshalb hängt an den beiden Längenfehlern ein
 * Halbsatz zum Winkel, wenn einer gewählt und falsch ist; die Erklärung, was
 * ein falscher Winkel am First anrichtet, bleibt dem eigenen Takt vorbehalten.
 *
 * Texte aus flow 11 (M4); der Zu-kurz-Fall ist zahlenfrei formuliert — die
 * alte Euro-Angabe war auf den früheren 4820-mm-Balken gemünzt und wäre für
 * diesen Balken erfunden (NICHT-ERFINDEN-Policy).
 */
function bewerte(laenge: number, winkel: Winkel | null): Rueckmeldung {
  const ab = laenge - ZIEL_MM
  // Nur ein *gewählter* falscher Winkel ist ein Fehler. Ein noch gar nicht
  // gewählter ist keiner — der fehlt bloß, und das sagt der eigene Zweig.
  const auchWinkel =
    winkel !== null && winkel !== ZIEL_WINKEL ? ' Und der Winkel stimmt auch nicht.' : ''
  if (ab < -TOLERANZ_MM) {
    const cm = Math.round(-ab / 10)
    return {
      treffer: false,
      text: `${cm} Zentimeter zu kurz. Der Balken ist Ausschuss — das Maß holst du nicht zurück.${auchWinkel}`,
    }
  }
  if (ab > TOLERANZ_MM) {
    return {
      treffer: false,
      text: `Zu lang lässt sich kürzen. Kostet dich Zeit, nicht Material — noch mal.${auchWinkel}`,
    }
  }
  if (winkel === null) {
    return { treffer: false, text: 'Die Länge sitzt. Fehlt noch der Winkel am First.' }
  }
  if (winkel !== ZIEL_WINKEL) {
    return {
      treffer: false,
      text: 'Der Winkel stimmt nicht. Oben am First klafft es, und der Sparren liegt nicht auf.',
    }
  }
  return { treffer: true, text: TREFFER_TEXT }
}

// ---------------------------------------------------------------------------
// Die Werkzeichnung — das Soll
// ---------------------------------------------------------------------------

/**
 * Das Soll. Steht im Panel, nicht auf der Bühne: hier stehen Länge und Winkel,
 * die getroffen werden sollen — wer sie sucht, darf nicht am Bildrand danach
 * schauen müssen, während er auf der Bühne den Balken zieht. Beide Werte sind
 * aus `mass.ts` abgeleitet, nicht getippt.
 *
 * Bleibt die flache 44-px-Variante: das Panel ist mit `buehneInteraktiv`
 * schmal (38 rem quer), und hochkant darf nichts scrollen (R9).
 *
 * Unterhalb `sm` fällt die Zeichnung weg und die beiden Sollwerte rücken zum
 * Etikett in eine Zeile: auf dem Handy hochkant verdoppelte der Block nur,
 * was auf der Bühne ohnehin am Balken steht, und seine ~130 px schoben
 * Winkelwahl und Rückmeldung unter die Scrollkante.
 */
function Werkzeichnung() {
  return (
    <div className="kh-feld flex w-full flex-col gap-1.5 px-3.5 py-2.5 max-sm:flex-row max-sm:flex-wrap max-sm:items-baseline max-sm:gap-x-4 max-sm:gap-y-0.5">
      <p className="kh-etikett">Soll laut Plan</p>
      <svg
        viewBox="10 80 310 60"
        className="h-[44px] w-full max-sm:hidden"
        role="img"
        aria-label={`Werkzeichnung: Länge ${mm(ZIEL_MM)}, Winkel ${ZIEL_WINKEL} Grad`}
      >
        <path
          d="M20 96 L280 96 L262 130 L20 130 Z"
          fill="var(--color-kh-orange)"
          opacity="0.3"
          stroke="var(--color-kh-orange)"
          strokeWidth="2"
        />
      </svg>
      {/* Die beiden Sollwerte stehen als Zahlen daneben, nicht als 18-px-Text
          in der Zeichnung. Sie sind die Aufgabe — wer sie sucht, soll sie aus
          zwei Metern Entfernung finden, nicht in einer Vektorgrafik lesen. */}
      <dl className="flex gap-5 max-sm:gap-4">
        <div className="max-sm:flex max-sm:items-baseline max-sm:gap-1.5">
          <dt className="text-[0.875rem] text-kh-mute">Länge</dt>
          <dd className="font-display text-[1.5rem] leading-none text-kh-paper tabular-nums max-sm:text-[1.25rem]">
            {mm(ZIEL_MM)}
          </dd>
        </div>
        <div className="max-sm:flex max-sm:items-baseline max-sm:gap-1.5">
          <dt className="text-[0.875rem] text-kh-mute">Winkel am First</dt>
          <dd className="font-display text-[1.5rem] leading-none text-kh-paper tabular-nums max-sm:text-[1.25rem]">
            {ZIEL_WINKEL}°
          </dd>
        </div>
      </dl>
    </div>
  )
}
