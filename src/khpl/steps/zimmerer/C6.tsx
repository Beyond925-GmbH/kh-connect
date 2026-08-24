import { Suspense, lazy, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import type { Elementlage } from '@/khpl/buehne/zimmerer/Wandelement3D'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * C6 — Am Haken. **Der Signaturscreen** (khpl-tag-zimmerer.md 6, C6).
 * Was ein Besucher von diesem Beruf mitnimmt, entsteht hier.
 *
 * **Zwei Beats auf einem Screen.**
 *
 * **Beat 1 — die Abfrage: Vorstellungsvermögen.** Das Element hängt am Haken
 * und dreht sich langsam. Zwei Achsen, zwei Entscheidungen, beide aus dem Kopf:
 * *Welche Seite kommt nach außen?* — die falsche ist die verlockende, nämlich
 * die glatte, fertig aussehende Innenseite; die Antwort steckt in C3. *Und wo
 * ist oben?* — wer sich in C4 gemerkt hat, wo das Fenster sitzt, weiß es.
 *
 * **Das ist die Abfrage zu C3 und C4 zugleich, und sie ist kein
 * Reihenfolge-Rätsel.** M7 fragt „in welcher Reihenfolge“; hier wird abgefragt,
 * ob man sich das Liegende stehend denken kann — die Kompetenz, die ein
 * Zimmerer selbst als das Schwierigste seines Berufs nennt (`INTERVIEW`,
 * khpl-tag-zimmerer.md 1). Zwei Tage dürfen nicht dieselbe Hauptübung haben
 * (khpl-tage.md 4); diese hier hat kein Gegenstück in den anderen drei.
 *
 * **Falsch gewählt kostet Zeit, nicht Material.** Das Element setzt nicht ab,
 * es dreht sich zurück in die Luft, und ein Satz erklärt, was in fünf Jahren in
 * dieser Wand passiert wäre. Kein Ausschuss, keine Note — man dreht es einfach
 * richtig herum, und die Kolonne unten wartet solange.
 *
 * **Beat 2 — Einweisen.** Das Element schwebt über die Schwelle; der Besucher
 * führt es seitlich und in der Höhe ein. Die Last **pendelt**: zu schnell
 * gezogen, und sie schwingt über das Ziel hinaus. Bewegungsgefühl **Masse** —
 * Dämpfung über den Frame-Loop, nicht `motion`-Spring (`PENDEL_DAEMPFUNG` in
 * `buehne/zimmerer/kanon.ts`). Deshalb hat der Fuß in diesem Beat **keine
 * Aktion**: die Bühne ist die Handlung, wie in M7. Ein Knopf „Absetzen“ neben
 * einer pendelnden Last verriete die Übung.
 *
 * **Die Kamera dreht.** Bis C5 lag alles flach unter einer Draufsicht; hier
 * steht sie zum ersten Mal am Boden und schaut hinauf. Das ist die visuelle
 * Signatur des ganzen Tages, und sie kostet nichts: dasselbe Modell, andere
 * Kamera. Der Zustand `haken` leitet Blick und Licht selbst ab — die Steps
 * setzen hier bewusst keine Zahl (khpl-tag-zimmerer.md 7).
 *
 * ⚠️ Die Spec möchte in der Aha-Karte zusätzlich C5.1 anbieten, falls es
 * übersprungen wurde. Das ginge nur mit einer Schleife im Graphen; der
 * Widerspruch ist in `berufe/zimmerer.ts` gemeldet. Die Karte **nennt** den
 * Inhalt, sie verlinkt ihn nicht.
 *
 * `answers.c6` `{ seiteRichtig: boolean; versetzt: boolean; versuche: number }`
 */

const Wandelement3D = lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))

/** Nach zwei Fehlversuchen bietet die App die Lösung an (khpl-tage.md 3). */
const HILFE_AB = 2

/**
 * Die richtige Lage. Nach außen kommt die diffusionsoffene Holzfaserplatte,
 * nicht die glatte Innenbeplankung — und oben ist das Rähm, weil dort die Decke
 * aufliegt und die Schwelle die Last in die Bodenplatte abträgt.
 */
const RICHTIG: Elementlage = { aussenseite: 'holzfaser', oben: 'raehm' }

/**
 * Die beiden Achsen als Daten, damit die Übung eine Schleife ist und nicht
 * zweimal derselbe Block.
 *
 * `warum` ist der Satz für den Fehlversuch: **was in fünf Jahren in dieser Wand
 * passiert wäre**, nicht „falsch“. Der Aufbau-Grund steht in C3 (`BELEGT`,
 * belege/zimmerer.md 2), der Lastweg über die Schwelle im Glossar.
 */
const ACHSEN = [
  {
    id: 'aussenseite',
    frage: 'Welche Seite kommt nach außen?',
    optionen: [
      { wert: 'beplankung', label: 'Die glatte Seite', zusatz: 'sieht schon fertig aus' },
      { wert: 'holzfaser', label: 'Die raue Platte', zusatz: 'Holzfaser, dunkel' },
    ],
    warum:
      'Nach außen käme dann die Dampfbremse. Raumfeuchte wandert in die Wand, kondensiert an der kalten dichten Schicht — und die Wand trocknet nie wieder. In fünf Jahren ist die Dämmung nass und das Holz faul.',
  },
  {
    id: 'oben',
    frage: 'Und wo ist oben?',
    optionen: [
      { wert: 'raehm', label: 'Rähm nach oben', zusatz: 'das obere Holz' },
      { wert: 'schwelle', label: 'Schwelle nach oben', zusatz: 'das untere Holz' },
    ],
    warum:
      'Dann hinge das Element auf dem Kopf. Über die Schwelle geht die Last der ganzen Wand in die Bodenplatte — sie gehört nach unten. Und dein Fenster säße an der falschen Stelle.',
  },
] as const

type Takt = 'lage' | 'einweisen' | 'fertig'

export function C6() {
  const answers = useFortschritt().answers
  const gespeichert = answers.c6

  const [aussen, setAussen] = useState<Elementlage['aussenseite'] | null>(null)
  const [oben, setOben] = useState<Elementlage['oben'] | null>(null)
  const [versuche, setVersuche] = useState(() => gespeichert?.versuche ?? 0)
  const [meldung, setMeldung] = useState<{ text: string; ok: boolean } | null>(null)

  // Wer schon einmal hier war, steigt dort ein, wo er aufgehört hat: die
  // Abfrage zweimal zu beantworten wäre keine Erinnerungsleistung mehr.
  const [takt, setTakt] = useState<Takt>(() =>
    gespeichert?.versetzt ? 'fertig' : gespeichert?.seiteRichtig ? 'einweisen' : 'lage',
  )

  const gewaehlt: Record<string, string | null> = { aussenseite: aussen, oben }
  const vollstaendig = aussen !== null && oben !== null

  /** Die Lage, die die Bühne zeigen soll. `null` = sie dreht sich weiter. */
  const lage: Elementlage | null =
    takt === 'lage'
      ? aussen && oben
        ? { aussenseite: aussen, oben }
        : null
      : { ...RICHTIG }

  const uebernimm = (l: Elementlage) => {
    setAussen(l.aussenseite)
    setOben(l.oben)
  }

  /**
   * Eine Wahl aus der Achsen-Schleife. Der Vergleich gegen den richtigen Wert
   * statt eine Typzusicherung: `ACHSEN` ist `as const`, aber in der `map` über
   * beide Achsen fällt die Verengung auf die jeweilige Option weg — und ein
   * `as` an dieser Stelle wäre genau die Behauptung, die der Compiler prüfen
   * soll.
   */
  const waehle = (achse: string, wert: string) => {
    if (achse === 'aussenseite') {
      setAussen(wert === 'holzfaser' ? 'holzfaser' : 'beplankung')
    } else {
      setOben(wert === 'raehm' ? 'raehm' : 'schwelle')
    }
  }

  const absetzen = () => {
    if (!aussen || !oben) return
    const falsch = ACHSEN.filter((a) => gewaehlt[a.id] !== RICHTIG[a.id])

    if (falsch.length === 0) {
      setMeldung({ text: 'Richtig herum. Jetzt runter damit.', ok: true })
      setTakt('einweisen')
      merkeAntwort('c6', { seiteRichtig: true, versetzt: false, versuche })
      return
    }

    const neu = versuche + 1
    setVersuche(neu)
    setMeldung({ text: falsch.map((a) => a.warum).join(' '), ok: false })
    // Der Bühnen-Beat der Spec: das Element setzt nicht ab, es dreht sich
    // zurück in die Luft — die Wahl verfällt mit (`lage` wird wieder `null`).
    setAussen(null)
    setOben(null)
    merkeAntwort('c6', { seiteRichtig: false, versetzt: false, versuche: neu })
  }

  const zeigMirWie = () => {
    uebernimm(RICHTIG)
    setMeldung({
      text: 'Raue Platte nach außen, Rähm nach oben. Die Wand muss nach außen offen bleiben, und die Last will nach unten.',
      ok: true,
    })
    setTakt('einweisen')
    merkeAntwort('c6', { seiteRichtig: false, versetzt: false, versuche })
  }

  const abgesetzt = () => {
    if (takt === 'fertig') return
    setTakt('fertig')
    setMeldung(null)
    merkeAntwort('c6', {
      seiteRichtig: gespeichert?.seiteRichtig ?? true,
      versetzt: true,
      versuche,
    })
  }

  return (
    <StepShell
      id="C6"
      buehneInteraktiv
      interaktionOffen={takt !== 'fertig'}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback text="Der Kran nimmt die Last auf" />}>
          <Wandelement3D
            zustand="haken"
            deinElement
            // **Der Ausschnitt aus C4, zwingend.** C4 kippt das Element hoch
            // und sagt „Merk dir, wo das Fenster ist“; die Abfrage hier liest
            // genau dieses Bild wieder ab. Ein anderes Fenster als in C4 wäre
            // keine Erinnerungsleistung, sondern eine Falle.
            ausschnitt={answers.c4?.ausschnitt}
            lage={lage}
            // Die Bühne darf die Lage selbst liefern, wenn man das Element dort
            // anhält — dann führt der Tap auf der Bühne und die Wahl im Panel
            // auf denselben Zustand, statt auf zwei.
            onLage={uebernimm}
            einweisen={takt === 'einweisen'}
            // Der Endzustand muss auf die Bühne, sonst hängt das Element beim
            // Wiedereinstieg wieder am Haken, während der Fuß „Element sitzt“
            // trägt — `einweisen` ist dann längst false und die Bühne wüsste
            // von nichts.
            abgesetzt={takt === 'fertig'}
            onAbgesetzt={abgesetzt}
          />
        </Suspense>
      }
      fachtext={
        takt === 'fertig' ? (
          <p>
            Steht. Das ist die Westwand des Hauses — heute früh lag sie noch flach auf dem
            Abbundtisch.
          </p>
        ) : takt === 'einweisen' ? (
          <p>
            Seite stimmt, oben stimmt. Jetzt über die Schwelle — langsam. Die Last hat
            Masse: zu schnell gezogen, und sie schwingt über das Ziel hinaus.
          </p>
        ) : (
          <p>
            Das Element hängt am Haken und dreht sich langsam. Den ganzen Vormittag lag es
            flach vor dir — jetzt steht es, und du musst wissen, wie herum, bevor es
            absetzt: welche Seite nach außen kommt, und ob das{' '}
            <Begriff id="raehm">Rähm</Begriff> oben ist oder die{' '}
            <Begriff id="schwelle">Schwelle</Begriff>.
          </p>
        )
      }
      interaktion={
        <Wechsel takt={takt}>
          {takt === 'fertig' ? null : takt === 'einweisen' ? (
            <div className="flex flex-col gap-2.5" data-wisch="aus">
              <Rueckmeldung
                ok={meldung ? meldung.ok : null}
                text={meldung ? meldung.text : null}
                testid="c6-meldung"
              />
              <div
                data-testid="c6-einweisen"
                className="flex w-fit items-center gap-3 rounded-kh-pill border-2 border-kh-orange/40 bg-kh-orange/12 py-2.5 pr-5 pl-3"
              >
                <span
                  aria-hidden
                  className="size-3 shrink-0 animate-puls rounded-full bg-kh-orange"
                />
                <span className="min-w-0">
                  <span className="kh-etikett block text-kh-paper/50">
                    Einweisen — die Kolonne unten wartet
                  </span>
                  <p className="text-[1.0625rem] text-kh-paper/80">
                    Zieh das Element über die Schwelle und lass es ab.
                  </p>
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3" data-wisch="aus">
              {ACHSEN.map((achse) => (
                // `role="group"` statt `fieldset`/`legend`: die Optionen sind
                // Knöpfe mit `aria-pressed`, keine Formularfelder — und ein
                // `legend` in einem Flex-Container wird in Chrome nicht als
                // Flex-Kind gelegt, sondern über den Rahmen gerechnet.
                <div
                  key={achse.id}
                  role="group"
                  aria-label={achse.frage}
                  className="flex flex-col gap-2"
                >
                  <p className="kh-etikett text-kh-paper/55">{achse.frage}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {achse.optionen.map((o) => (
                      <Wahlflaeche
                        key={o.wert}
                        form="karte"
                        gewaehlt={gewaehlt[achse.id] === o.wert}
                        onClick={() => waehle(achse.id, o.wert)}
                        data-testid={`c6-${achse.id}-${o.wert}`}
                        className="min-h-[84px]"
                      >
                        <span className="text-[1.0625rem] leading-tight font-semibold">
                          {o.label}
                        </span>
                        <span className="text-[0.9375rem] leading-snug opacity-70">
                          {o.zusatz}
                        </span>
                      </Wahlflaeche>
                    ))}
                  </div>
                </div>
              ))}

              <Rueckmeldung
                ok={meldung ? meldung.ok : null}
                text={meldung ? meldung.text : null}
                testid="c6-meldung"
              />
            </div>
          )}
        </Wechsel>
      }
      aha={
        <AhaKarte
          sichtbar={takt !== 'lage'}
          eyebrow="Wer steht eigentlich unter der Last?"
        >
          Niemand. Nie. Wer die Anschlagmittel einhängt, arbeitet seitlich und führt das
          Element erst kurz vor dem Absetzen an seinen Platz.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="C6"
          uebungOffen={takt !== 'fertig'}
          geschafft={takt === 'fertig' ? 'Element sitzt' : null}
          // Nur Beat 1 hat eine Aktion im Fuß. In Beat 2 ist die Bühne die
          // Handlung — siehe oben.
          //
          // „Zeig mir wie“ steht **neben** „So absetzen“ und nicht in der
          // scrollenden Fläche (khpl-tage.md 3, wie in C4): im Hochformat läge
          // es dort unter zwei Optionsgruppen und der Rückmeldung, also
          // womöglich unter der Scrollkante — ausgerechnet das Angebot nach
          // zwei Fehlversuchen.
          aktion={
            takt === 'lage' ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="aktion"
                  onClick={absetzen}
                  disabled={!vollstaendig}
                  data-testid="c6-absetzen"
                >
                  So absetzen
                </Button>
                {versuche >= HILFE_AB && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Button
                      variant="leise"
                      onClick={zeigMirWie}
                      data-testid="c6-zeig-mir-wie"
                    >
                      Zeig mir wie
                    </Button>
                  </motion.div>
                )}
              </div>
            ) : undefined
          }
        />
      }
    />
  )
}
