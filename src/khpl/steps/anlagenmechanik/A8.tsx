import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { auftritt } from '@/khpl/komponenten/auftritt'
import { Verzweigung } from '@/khpl/komponenten/Verzweigung'
import { wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { KARRIEREWEGE } from './karrierewege'

/**
 * A8 — Und danach? Der Karrierebereich, Struktur unverändert wie bei allen vier
 * Tagen und im Aufbau identisch mit M9.
 *
 * Drei antippbare Karten nebeneinander. **Alle drei bleiben jederzeit
 * erreichbar** — A8.1–A8.3 sind im Graphen als `immerOffen` markiert und
 * verschwinden nicht, sobald sie einmal geöffnet wurden.
 *
 * ℹ️ Gemeldet wurde einmal „A8 zeigt drei Kacheln, die anderen drei Tage eine
 * Liste — vier Tage, zwei Layouts". Nachgeprüft: das Raster unten ist
 * `grid-cols-1 sm:grid-cols-3` und steht in M9, C8 und hier **zeichengleich**;
 * es gibt keine Container-Query und keine abweichende Panelbreite (A8 setzt
 * kein `karteBreit`). Bei jeder Fensterbreite über 640 px stehen an allen vier
 * Tagen drei Kacheln, darunter an allen vier eine Liste. Hier ist deshalb
 * nichts geändert worden: eine Umstellung auf eine Liste würde den Unterschied
 * erst herstellen, den die Meldung beschreibt.
 *
 * Der Fuß zeigt hier **kein** Abstecher-Angebot: die Karten *sind* das
 * Angebot. Beides nebeneinander wären dieselben drei Wege zweimal auf einem
 * Screen.
 *
 * ⚠️ **Die Zahlen sind die dieses Berufs und keine geerbten.** Der Bestand in
 * `steps/dachdecker/karrierewege.ts` führt Zimmerer-Zahlen; für SHK gelten
 * andere Kosten, eine andere Technikerfachrichtung und ein anderer
 * Studien-Anker. Sie stehen
 * deshalb in `steps/anlagenmechanik/karrierewege.ts`.
 *
 * **Die Bühne fährt zurück.** Die Medienliste dieses Tages nennt für A8 selbst
 * kein Foto, nur für die drei Karten — `StepFoto` rendert dann
 * nichts, und der Einstieg in den Karrierebereich stand auf schwarzem Grund.
 * Statt ein fremdes Motiv zu leihen, zeigt der Screen das Haus aus A3, jetzt
 * warm: A7 steht im Keller mit dem angeschnittenen Haus darüber, A8 nimmt die
 * Kamera heraus und zeigt das Ganze. Das ist derselbe Gedanke wie beim
 * Fadenobjekt — **eine Welt, viele Zustände**
 * — und es beantwortet die Frage des Screens im Bild: das Haus ist fertig, und
 * danach?
 */
export function A8() {
  const { weiter, zumAbstecher } = useStepNavigation('A8')

  return (
    <StepShell
      id="A8"
      auftrag={'Sieh dir an, welcher Weg dich interessiert.'}
      ansage={null}
      interaktionOffen={false}
      buehne={
        <Schnitt
          zustand={{ szene: 'haus', verluste: [], offen: null, aufgeloest: true }}
        />
      }
      warum={
        // Dreieinhalb Jahre — 42 Monate nach SHKAMAusbV, nicht drei wie
        // beim Dachdecker.
        // Ohne „Schau dir an, was dich interessiert": der Satz stand fast
        // wortgleich schon im Auftragsband — und M9, das Vorbild dieses
        // Screens, endet ebenfalls bei „alle offen".
        <p>
          Dreieinhalb Jahre Ausbildung, dann bist du Geselle. Danach drei Wege — alle drei
          offen.
        </p>
      }
      interaktion={
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {KARRIEREWEGE.map((weg, i) => (
            <motion.li
              key={weg.id}
              className="flex"
              {...auftritt(18, { verzoegerung: i * 0.09, dauer: 0.42 })}
            >
              {/*
                Der Auftritt sitzt auf der Zeile, nicht auf der Karte: die
                Karte trägt aus `wahlflaeche` ein `transition-transform` und
                `active:scale-*`. Beides auf einem Element hieß, dass CSS auf
                jeden Frame, den Motion schreibt, noch 150 ms überblendet —
                die Karte kriecht herauf und fällt am Ende den Rest. Ein
                Element, ein Herr.
              */}
              {/*
                Drei Karten, drei Nummern. Der Titel steht in Anton, damit die
                Wahl aussieht wie eine Wahl und nicht wie drei Listeneinträge —
                und die Ziffer oben rechts macht aus drei gleich aussehenden
                Kacheln drei unterscheidbare Ziele. „Studium“ darf sich nicht
                hinter den anderen verstecken; gleiche Größe, gleiche Farbe,
                gleiche Nummerngröße ist die Umsetzung davon.
              */}
              <button
                type="button"
                onClick={() => zumAbstecher(weg.id)}
                data-testid={`a8-${weg.id}`}
                className={`${wahlflaeche({ form: 'karte' })} min-h-[112px] overflow-hidden`}
              >
                <span
                  aria-hidden
                  className="absolute top-1 right-3 font-display text-[3rem] leading-none text-white/8"
                >
                  {i + 1}
                </span>
                <span className="kh-titel-klein relative text-kh-orange">
                  {weg.titel}
                </span>
                <span className="relative flex items-end justify-between gap-2">
                  <span className="text-[1rem] leading-snug text-kh-paper/80">
                    {weg.koeder}
                  </span>
                  <ArrowRight
                    className="size-5 shrink-0 text-kh-orange"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      }
      fuss={
        // `offen={[]}`: kein Abstecher-Angebot und damit auch kein Wege-Dialog
        // — die drei Karten sind das Angebot. Weiter bleibt der eine gefüllte
        // Knopf, der sagt, wo es weitergeht.
        <Verzweigung
          offen={[]}
          weiterVon="A8"
          onAbstecher={zumAbstecher}
          onWeiter={weiter}
        />
      }
    />
  )
}
