import { useState } from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { ArrowRight, Check } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { wahlflaeche } from './Wahlflaeche'
import type { StepId } from '@/khpl/flow/steps'
import { step } from '@/khpl/flow/steps'
import type { StepBild } from '@/khpl/berufe/typen'
import { beruf } from '@/khpl/berufe/registry'
import { beschreibung, einladung, weiterText } from '@/khpl/flow/uebergaenge'
import { useAktiverBeruf, useGraph } from '@/khpl/store/fortschritt'

/**
 * Der Fuß eines Step-Screens (khpl-ui-shell.md 5).
 *
 * **Der wichtigste Knopf ist der, der die Aufgabe löst — nicht der, der sie
 * verlässt.** Solange eine Übung offen ist, sitzt die `aktion` unten rechts
 * als einzige laute Fläche, und *Weiter* schrumpft auf ein leises
 * „Überspringen“. Vorher stand auf jedem Screen ein oranger Weiter-Knopf an
 * der Primärposition — auf einem Übungs-Screen war damit ausgerechnet der Weg
 * *aus* der Aufgabe die lauteste Handlung darauf. Freigeschaltet bleibt der
 * Ausweg trotzdem; niemand sitzt am Stand fest (flow 6.6).
 *
 * **Abstecher werden nicht mehr im Fuß beworben, sondern beim Weitergehen
 * angeboten.** Die Inline-Karten unter „Wie tief willst du rein?“ hat kein
 * Besucher als Wahl gelesen — sie waren zwei weitere graue Kästen zwischen
 * Übung und Knopf, und die Kopfzeile darüber las niemand. Jetzt öffnet der Weg
 * nach vorn ein Fenster mit genau einer Frage: „Wohin als Nächstes?“ — die
 * Abstecher als Karten, der Hauptweg als gefüllter Knopf darunter. Eine
 * Entscheidung, ein Moment. Flow 6.7 („echte Wahl, sichtbar als Baum“) wird
 * damit wörtlicher erfüllt als vorher: die Wahl hat ihren eigenen Augenblick,
 * statt als Dauerwerbung am Fußrand mitzulaufen.
 *
 * Farbregel (R3/R8): **Orange = die Welt** (Fakten, Maße, Zeichnung),
 * **Limette = du.** Gefüllt ist Limette genau einmal pro Screen und heißt
 * „hier geht's weiter“ (`weiter`); die Handlung *in* der Übung (`aktion`:
 * prüfen, auflösen) trägt dieselbe Farbe als Kontur.
 */
export function Verzweigung({
  offen,
  weiterVon,
  onAbstecher,
  onWeiter,
  ohneWeiter = false,
  geschafft = null,
  aktion = null,
  uebungOffen = false,
}: {
  /** Noch nicht genommene Abstecher, in Anzeigereihenfolge. */
  offen: StepId[]
  /** Step, dessen Weiter-Text gilt. */
  weiterVon: StepId
  onAbstecher: (id: StepId) => void
  onWeiter: () => void
  ohneWeiter?: boolean
  /**
   * Kurze Bestätigung, sobald die Übung dieses Steps gelöst ist — „Zuschnitt
   * sitzt“, „Alles geladen“. Steht direkt neben dem Weiter-Knopf und sagt
   * „das hier ist fertig, du kannst gehen“.
   */
  geschafft?: string | null
  /**
   * Die Handlung, die die Übung dieses Steps abschließt — „Schnitt setzen“,
   * „Und jetzt die echte Zahl“. Sitzt im angehefteten Fuß, damit sie nie
   * unterhalb der Scrollkante liegt — und solange die Übung offen ist an der
   * Primärposition unten rechts.
   */
  aktion?: React.ReactNode
  /**
   * Solange `true`, ist die Übung dieses Steps ungelöst: die `aktion` (falls
   * vorhanden) ist der Hauptknopf, und *Weiter* tritt auf „Überspringen“
   * zurück. Auch für Übungen ohne eigenen Prüfknopf (Ziehen, Antippen)
   * setzen — dort ist die Bühne die Handlung, und ein lauter Weiter-Knopf
   * daneben sagt „lass es einfach“.
   */
  uebungOffen?: boolean
}) {
  const graph = useGraph()
  const [wahlOffen, setWahlOffen] = useState(false)
  const hatAngebot = offen.length > 0

  /** Jeder Weg nach vorn läuft hier durch — mit Angebot erst durch die Wahl. */
  const nachVorn = () => {
    if (hatAngebot) setWahlOffen(true)
    else onWeiter()
  }

  const ueberspringen = !ohneWeiter && (
    // Der leise Ausweg. Bewusst links der Aktion: wer ihn sucht, findet ihn —
    // wer die Aufgabe löst, sieht an der Primärposition nur die Lösung.
    <Button variant="leise" size="sm" onClick={nachVorn} data-testid="weiter">
      Überspringen
      <ArrowRight className="size-4" strokeWidth={2} />
    </Button>
  )

  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5">
      {geschafft && (
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 460, damping: 18 }}
          data-testid="geschafft"
          // Eine Statuszeile, kein Knopf: Haken und Versaltext in der
          // Signalfarbe, ohne Füllfläche und ohne Pillenform. Als gefüllte
          // Pille sah sie dem limetten Weiter-Knopf daneben zum Verwechseln
          // ähnlich — und gefüllte Limette heißt „hier geht's weiter“ (R8),
          // nicht „das ist fertig“.
          className="mr-auto flex items-center gap-2 text-[0.9375rem] font-bold text-kh-signal uppercase"
        >
          <Check className="size-4 shrink-0" strokeWidth={3.5} aria-hidden />
          {geschafft}
        </motion.p>
      )}

      {uebungOffen ? (
        <>
          {ueberspringen}
          {aktion}
        </>
      ) : (
        !ohneWeiter && (
          <Button
            onClick={nachVorn}
            variant="weiter"
            className="min-w-[9rem]"
            data-testid="weiter"
          >
            {weiterText(graph, weiterVon)}
            <ArrowRight className="size-5" strokeWidth={2.5} />
          </Button>
        )
      )}

      {hatAngebot && (
        <WegeDialog
          offen={wahlOffen}
          angebote={offen}
          weiterVon={weiterVon}
          onSchliessen={() => setWahlOffen(false)}
          onAbstecher={(id) => {
            setWahlOffen(false)
            onAbstecher(id)
          }}
          onWeiter={() => {
            setWahlOffen(false)
            onWeiter()
          }}
        />
      )}
    </div>
  )
}

/**
 * Die Wahl beim Weitergehen — als Bild, nicht als Liste.
 *
 * **Die Wege werden gezeigt, nicht beschrieben.** Die Vorfassung stellte
 * dieselbe Entscheidung als zwei Textzeilen in einem grauen Kasten plus einen
 * orangen Knopf darunter: drei Schriftgrößen, zwei Bauformen, kein einziges
 * Bild. Am Stand liest das niemand — der Besucher steht vor einer Stele,
 * entscheidet in zwei Sekunden und tippt das, was nach dem interessanteren Ort
 * aussieht. Deshalb trägt jetzt jeder Weg das Motiv des Screens, auf dem er
 * endet: dasselbe Foto, das der Besucher gleich vollflächig sieht. Der Tap ist
 * damit keine Textwahl mehr, sondern das Antippen eines Ortes.
 *
 * **Der Hauptweg ist eine Karte wie die anderen — nur limette.** Er war vorher
 * die einzige Fläche mit Farbe und stand als Knopf unter einem Trennstrich;
 * die Abstecher sahen daneben aus wie Kleingedrucktes. Gleiche Bauform,
 * gleiche Größe, unterschiedliche Lautstärke: das ist die echte Wahl aus
 * flow 6.7, und die Vorgabe („einer geht geradeaus weiter“) bleibt an der
 * Farbe ablesbar — Limette, weil der Hauptweg der Weiter-Knopf dieses
 * Fensters ist (R8), nicht Orange: das gehört der Welt.
 *
 * Zwei Wege stehen nebeneinander, drei füllen zwei Reihen — die ungerade Karte
 * ist immer der Hauptweg und nimmt die volle Breite. Bei den drei
 * Karrierekarten (flow 7 M9) ergibt das ein 2 × 2-Feld.
 *
 * Kein X und kein Abbrechen-Knopf: jede Option führt vorwärts. Der
 * Backdrop-Tap schließt für den seltenen Fall, dass jemand doch noch einmal
 * auf den Screen zurück will.
 */
function WegeDialog({
  offen,
  angebote,
  weiterVon,
  onSchliessen,
  onAbstecher,
  onWeiter,
}: {
  offen: boolean
  angebote: StepId[]
  weiterVon: StepId
  onSchliessen: () => void
  onAbstecher: (id: StepId) => void
  onWeiter: () => void
}) {
  const graph = useGraph()
  const berufId = useAktiverBeruf()
  /**
   * Das Motiv eines Steps — dasselbe, das seine Bühne trägt.
   *
   * **Ohne eigenes Motiv das Kartenbild des Berufs.** Neun der fünfzehn
   * Übergänge münden in einen 3D-Schritt, und der führt kein Foto: die Bühne
   * *ist* dort das Modell. Auf einer leeren Karte kippt das Fenster zurück in
   * eine Textliste mit Dekoration daneben — ausgerechnet beim Hauptweg, der
   * öfter betroffen ist als jeder Abstecher. Das Kartenbild ist nicht der
   * Screen, auf dem der Weg endet, aber es ist derselbe Beruf und ein echtes
   * Motiv; auf der Berufsliste hat der Besucher es zuletzt vor zwei Minuten
   * gesehen. Besser eine Werkstatt als ein Loch.
   */
  const motiv = (id: StepId | null): StepBild | undefined => {
    if (!berufId) return undefined
    const b = beruf(berufId)
    return (id ? b.bilder[id] : undefined) ?? { src: b.medien.karte }
  }

  // Der Hauptweg zeigt, wo er landet: das Motiv des nächsten Hauptschritts.
  // Die 3D-Schritte führen keines — dort tritt das Pfeilfeld ein.
  const ziel = step(graph, weiterVon).weiter
  // Ungerade Kartenzahl heißt: der Hauptweg schließt die letzte Reihe allein
  // ab und darf sie ganz nehmen.
  const breit = (angebote.length + 1) % 2 === 1

  return (
    <BaseDialog.Root open={offen} onOpenChange={(auf) => !auf && onSchliessen()}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <BaseDialog.Popup
          data-testid="wege-dialog"
          className="fixed top-1/2 left-1/2 z-50 max-h-[92svh] w-[min(40rem,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-kh-lg border-t-4 border-kh-orange bg-kh-raised p-5 shadow-[0_28px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/10 outline-none transition-all duration-200 data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0 sm:p-6"
        >
          <BaseDialog.Title className="kh-titel-klein">
            Wohin als Nächstes?
          </BaseDialog.Title>
          {/*
            Die erklärende Zeile stand hier sichtbar und sagte, was die Karten
            darunter zeigen. Für den Screenreader bleibt sie, für das Auge ist
            sie Ballast vor der eigentlichen Wahl.
          */}
          <BaseDialog.Description className="sr-only">
            Tippe den Weg an, auf dem du weitermachen willst. Jeder bringt dich ans Ziel.
          </BaseDialog.Description>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {angebote.map((id, i) => (
              <Wegkarte
                key={id}
                index={i}
                bild={motiv(id)}
                titel={einladung(graph, id)}
                zeile={beschreibung(graph, id)}
                onClick={() => onAbstecher(id)}
                testid={`abstecher-${id}`}
              />
            ))}
            <Wegkarte
              haupt
              breit={breit}
              index={angebote.length}
              bild={motiv(ziel)}
              titel={weiterText(graph, weiterVon)}
              onClick={onWeiter}
              testid="wege-weiter"
            />
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

/**
 * Ein Weg als antippbare Karte: Motiv oben, Beschriftung unten, Pfeil rechts.
 *
 * Die Fläche kommt aus `wahlflaeche` (`form: 'karte'`) — Radius, Kante, Grund
 * und die Rückmeldung beim Drücken sind dieselben wie bei jeder anderen Wahl
 * der App. Überschrieben wird nur, was ein randloses Bild braucht: kein
 * Innenabstand, kein Abstand zwischen den Teilen, geschnittene Ecken.
 */
function Wegkarte({
  bild,
  titel,
  zeile = null,
  haupt = false,
  breit = false,
  index,
  onClick,
  testid,
}: {
  bild: StepBild | undefined
  titel: string
  zeile?: string | null
  /** Der Weg geradeaus. Genau einer je Fenster, und nur er trägt Limette. */
  haupt?: boolean
  /** Nimmt beide Spalten — die letzte Karte einer ungeraden Reihe. */
  breit?: boolean
  index: number
  onClick: () => void
  testid: string
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, type: 'spring', stiffness: 420, damping: 32 }}
      className={cn(
        wahlflaeche({ form: 'karte' }),
        'min-h-0 gap-0 overflow-hidden p-0',
        haupt && 'border-kh-signal',
        breit && 'col-span-2',
      )}
      data-testid={testid}
    >
      <span
        className={cn(
          'relative block w-full shrink-0 overflow-hidden bg-kh-surface',
          // Die breite Karte trägt einen Streifen, kein Panorama: 16 : 6 wären
          // auf der Stele über 200 px hoch und machten den Hauptweg zum
          // Plakat über der eigentlichen Wahl.
          breit ? 'h-28' : 'aspect-[16/10]',
        )}
      >
        {bild ? (
          <img
            src={bild.src}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            style={{ objectPosition: bild.pos, filter: 'saturate(1.12) contrast(1.06)' }}
            className="size-full object-cover"
          />
        ) : (
          // Die 3D-Schritte führen kein Foto. Statt eines schwarzen Lochs ein
          // Feld, das dasselbe sagt wie das Motiv: „hier geht es lang“.
          <span
            className={cn(
              'flex size-full items-center justify-center bg-gradient-to-br',
              haupt
                ? 'from-kh-signal-dim/40 to-kh-surface'
                : 'from-white/10 to-kh-surface',
            )}
          >
            <ArrowRight
              className={cn('size-9', haupt ? 'text-kh-signal' : 'text-kh-mute')}
              strokeWidth={2.5}
              aria-hidden
            />
          </span>
        )}
      </span>

      <span
        className={cn(
          'flex w-full flex-1 items-center gap-2 px-3.5 py-2.5',
          haupt && 'bg-kh-signal text-[#0E0D0B]',
        )}
      >
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block text-[1rem] leading-tight font-semibold',
              haupt ? 'text-[#0E0D0B]' : 'text-kh-paper',
            )}
          >
            {titel}
          </span>
          {zeile && (
            // Kein `block`: `line-clamp-2` setzt selbst ein `display`, und wer
            // beides schreibt, bekommt je nach Regelreihenfolge drei Zeilen.
            //
            // Auf Handybreite fällt die Zeile ganz weg. Zwei halbe Karten
            // nebeneinander lassen ihr drei Wörter je Zeile, und was davon
            // übrig bleibt, ist ein abgeschnittener Halbsatz — das Foto sagt
            // an dieser Stelle mehr als „Jemand hat das konstru…“.
            <span className="mt-0.5 line-clamp-2 text-[0.8125rem] leading-snug text-kh-mute max-sm:hidden">
              {zeile}
            </span>
          )}
        </span>
        <ArrowRight
          className={cn('size-5 shrink-0', haupt ? 'text-[#0E0D0B]' : 'text-kh-orange')}
          strokeWidth={2.5}
          aria-hidden
        />
      </span>
    </motion.button>
  )
}
