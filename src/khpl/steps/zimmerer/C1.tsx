import { Suspense, lazy, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * C1 — Der Stapel steht schon da. Einstieg, Suchen
 * (khpl-tag-zimmerer.md 6, C1).
 *
 * **Suchen, nicht Sortieren.** Auf dem Abbundtisch liegen zwölf nummerierte
 * Hölzer, die Stückliste verlangt Nr. 47. Zwei sehen fast gleich aus und
 * unterscheiden sich nur in der Ausklinkung — das ist die Pointe: **nicht die
 * Länge unterscheidet sie, sondern die Bearbeitung.**
 *
 * Bewusst *nicht* die M1-Checkliste. Gleiche Haltung (genau hinsehen), andere
 * Form: dort sammelt man aus einer Liste aus, hier findet man eines aus vielen.
 *
 * **Die Bühne ist die Übung.** Angetippt wird das Holz, nicht ein Knopf im
 * Panel — deshalb `buehneInteraktiv` und ein Fuß ohne eigene `aktion`
 * (Vorbild: B3.2). Im Panel steht nur das Soll: die eine Zeile aus der
 * Stückliste.
 *
 * **Kein Fehlerzähler auf dem Screen.** `versuche` läuft mit, weil der Store
 * ihn führt und weil nach zwei Fehlgriffen die Hilfe dazukommt (flow 6.6) —
 * gezeigt wird die Zahl nie.
 *
 * **Nach zwei Fehlgriffen bietet die App die Lösung an** (khpl-tage.md 3):
 * neben der Hinweiszeile kommt „Zeig mir wie“ in den Fuß, und die Bühne hebt
 * das gesuchte Holz an und markiert es — angetippt wird es trotzdem selbst,
 * die Bühne bleibt die Übung.
 *
 * `answers.c1` `{ gefunden: boolean; versuche: number }`
 */

const Wandelement3D = lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))

// ---------------------------------------------------------------------------
// Text und Zahlen — gebündelt oben (flow 8.4).
// ---------------------------------------------------------------------------

/** Die Nummer, die die Stückliste verlangt. Wörtlich aus der Spec. */
const GESUCHT = 47

/**
 * Der Verwechsler: gleiche Länge, keine Ausklinkung. Die Spec gibt für ihn als
 * einzigen einen ausformulierten Satz vor — er ist die Pointe des Screens.
 */
const VERWECHSLER = 44

/** Nach zwei Fehlversuchen bietet die App die Lösung an (flow 6.6). */
const HILFE_AB = 2

const TREFFER_TEXT = 'Nr. 47. Genau die.'

/**
 * Warum das angetippte Holz nicht passt. Die Bühne legt die zwölf Nummern aus
 * (`Wandelement3D`, `gesuchteNummer`); ausformuliert ist hier nur der eine
 * Fall, den die Spec ausformuliert. Für alles andere trägt der Satz die
 * angetippte Nummer — er soll erklären, nicht tadeln.
 */
const GRUENDE: Record<number, string> = {
  [VERWECHSLER]:
    'Nr. 44 — gleiche Länge, aber ohne Ausklinkung. Die braucht die Schwelle.',
}

function grund(nummer: number) {
  return (
    GRUENDE[nummer] ??
    `Nr. ${nummer} steht nicht auf deiner Liste. Gesucht ist die ${GESUCHT}.`
  )
}

export function C1() {
  const gespeichert = useFortschritt().answers.c1
  const [gefunden, setGefunden] = useState(() => !!gespeichert?.gefunden)
  const [versuche, setVersuche] = useState(() => gespeichert?.versuche ?? 0)
  const [hinweis, setHinweis] = useState(false)
  const [antwort, setAntwort] = useState<{ ok: boolean; text: string } | null>(() =>
    gespeichert?.gefunden ? { ok: true, text: TREFFER_TEXT } : null,
  )

  const tippen = (nummer: number) => {
    if (gefunden) return
    if (nummer === GESUCHT) {
      setGefunden(true)
      setAntwort({ ok: true, text: TREFFER_TEXT })
      merkeAntwort('c1', { gefunden: true, versuche })
      return
    }
    const n = versuche + 1
    setVersuche(n)
    setAntwort({ ok: false, text: grund(nummer) })
    merkeAntwort('c1', { gefunden: false, versuche: n })
  }

  return (
    <StepShell
      id="C1"
      buehneInteraktiv
      interaktionOffen={!gefunden}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback text="Die Halle wird hell" />}>
          <Wandelement3D
            zustand="stapel"
            gesuchteNummer={GESUCHT}
            // Wiedereinstieg über „Dein Weg“: `tippen` kehrt bei `gefunden`
            // sofort zurück, also muss das Holz von Anfang an markiert
            // obenauf liegen — sonst zeigt das Panel „Dein Holz Nr. 47“ und
            // der Tisch nichts.
            holzGefunden={gefunden}
            hinweisZeigen={hinweis && !gefunden}
            onHolz={tippen}
          />
        </Suspense>
      }
      fachtext={
        <p>
          Die <Begriff id="abbundanlage">Abbundanlage</Begriff> hat über Nacht gearbeitet:
          jedes Holz ist auf Länge, jede Ausklinkung gefräst, jedes Teil nummeriert. Du
          baust nicht aus dem Kopf, du baust nach Stückliste.
        </p>
      }
      interaktion={
        <Wechsel takt={gefunden ? 'gefunden' : 'suchen'}>
          {gefunden ? (
            <div className="flex flex-col gap-3">
              <Rueckmeldung
                ok={antwort?.ok ?? null}
                text={antwort?.text ?? null}
                testid="c1-rueckmeldung"
              />
              <div className="kh-feld px-3.5 py-2.5" data-testid="c1-dein-holz">
                <p className="kh-etikett">Dein Holz</p>
                <p className="mt-0.5 font-display text-[clamp(1.6rem,1.2rem+1.1vw,2.1rem)] leading-none text-kh-paper tabular-nums">
                  Nr. {GESUCHT}
                </p>
                <p className="mt-1.5 text-[1.0625rem] leading-snug text-kh-mute">
                  Nicht die Länge unterscheidet die beiden Hölzer — die Bearbeitung.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Stueckliste hilfe={versuche >= HILFE_AB} hinweis={hinweis} />
              <Rueckmeldung
                ok={antwort?.ok ?? null}
                text={antwort?.text ?? null}
                testid="c1-rueckmeldung"
              />
            </div>
          )}
        </Wechsel>
      }
      aha={
        /*
          Nicht „Wer hat das alles geschnitten?“: der Abstecher-Knopf desselben
          Screens fragt laut Spec „Wer hat das alles zugeschnitten?“, und zwei
          fast gleiche Fragen nebeneinander verraten nichts Eigenes. Der
          Einwurf dreht deshalb auf das *Wann* — den Inhalt der Karte.
        */
        <AhaKarte sichtbar={gefunden} eyebrow="Wann ist das hier geschnitten worden?">
          Die Maschine hat das heute Nacht geschnitten. Jemand hat ihr am Rechner gesagt,
          wie.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="C1"
          uebungOffen={!gefunden}
          // Die Übung selbst hat keine Aktion (die Bühne ist die Übung) — nur
          // das Lösungsangebot nach zwei Fehlgriffen sitzt hier, wie in C4/C6.
          aktion={
            !gefunden && !hinweis && versuche >= HILFE_AB ? (
              <Button
                variant="leise"
                onClick={() => setHinweis(true)}
                data-testid="c1-zeig-mir-wie"
              >
                Zeig mir wie
              </Button>
            ) : null
          }
          geschafft={gefunden ? 'Gefunden' : null}
        />
      }
    />
  )
}

/**
 * Das Soll. Steht im Panel, nicht auf der Bühne — dieselbe Regel wie bei der
 * Werkzeichnung in M4: wer die Nummer sucht, darf nicht am Bildrand danach
 * schauen müssen, während er auf dem Tisch tippt.
 *
 * Die Hilfe wächst nach zwei Fehlgriffen unten an; die Lösung selbst bietet
 * parallel „Zeig mir wie“ im Fuß an — ist sie angenommen (`hinweis`), sagt die
 * Zeile, worauf die Bühne gerade zeigt.
 */
function Stueckliste({ hilfe, hinweis }: { hilfe: boolean; hinweis: boolean }) {
  return (
    <div className="kh-feld flex flex-col gap-1.5 px-3.5 py-2.5">
      <p className="kh-etikett">Aus der Stückliste</p>
      <div className="flex items-baseline gap-3">
        <span
          data-testid="c1-nummer"
          className="font-display text-[clamp(1.9rem,1.3rem+1.6vw,2.75rem)] leading-none text-kh-signal tabular-nums"
        >
          Nr. {GESUCHT}
        </span>
        <span className="text-[1.0625rem] text-kh-paper/85">
          Ständer, mit Ausklinkung
        </span>
      </div>
      <p className="text-[1.0625rem] text-kh-mute">
        Such es vom Tisch. Tipp das Holz an.
      </p>
      {hilfe && (
        <p
          data-testid="c1-hilfe"
          className="border-t border-kh-line pt-2 text-[1rem] leading-snug text-kh-paper/70"
        >
          {hinweis
            ? 'Das angehobene Holz ist deins — tipp es an.'
            : 'Zwei Hölzer sind gleich lang. Deins hat die Kerbe am Ende.'}
        </p>
      )}
    </div>
  )
}
