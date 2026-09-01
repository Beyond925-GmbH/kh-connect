import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Drill,
  Hammer,
  PencilRuler,
  Ruler,
  Tablet,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NeustartKnopf } from './Neustart'
import { Helm } from '@/khpl/komponenten/Helm'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { FRAGEN_BILDER } from '@/khpl/match/fragen'
import { HELM_FARBEN, WERKZEUGE, type WerkzeugIcon } from '@/khpl/match/helm'
import { merkeHelm, useSitzung, zeigeFragen } from '@/khpl/store/fortschritt'

/**
 * „Dein Helm“ — der erste Screen nach dem Tap auf den Splash.
 *
 * Zwei Wahlen, zehn Sekunden. Er hat drei Aufgaben, und die dritte ist die,
 * an der er hängt:
 *
 *  1. **Merkmalssignal.** Das Werkzeug ist die stärkste einzelne Frage im
 *     Trichter — „wonach greifst du zuerst“ beantwortet auch, wer mit
 *     „was ist dir wichtig“ nichts anfangen kann.
 *  2. **Einsatz.** Wer etwas gewählt hat, liest den Vorschlag danach als
 *     Ergebnis und nicht als Werbung.
 *  3. **Die Sprache der App beibringen.** Hier lernt der Besucher an einer
 *     Wahl ohne Folgen, wie ein Tap sich anfühlt und wie Bestätigung
 *     aussieht. Ein Screen, der das kostenlos erledigt, bevor die erste
 *     Übung kommt, ist die Sekunden wert.
 *
 * Ohne Wahl geht es trotzdem weiter: „Überspringen“ ist auf jedem Screen des
 * Trichters vorhanden, und `matching.ts` kennt den Kaltstart.
 */

const ICONS: Record<WerkzeugIcon, typeof Hammer> = {
  hammer: Hammer,
  ruler: Ruler,
  'pencil-ruler': PencilRuler,
  wrench: Wrench,
  drill: Drill,
  tablet: Tablet,
}

export function Helmwahl() {
  const sitzung = useSitzung()
  const [farbe, setFarbe] = useState(sitzung.helm?.farbe ?? HELM_FARBEN[0].id)
  const [werkzeug, setWerkzeug] = useState(sitzung.helm?.werkzeug ?? '')

  // Während hier gewählt wird, laufen die Motive der Stationen in den Cache —
  // die erste Bildfrage darf nicht mit drei nachladenden Kacheln aufmachen.
  useEffect(() => {
    for (const src of FRAGEN_BILDER) {
      const bild = new Image()
      bild.src = src
    }
  }, [])

  // Auch ohne Werkzeug speichern: die Farbe ist reiner Ausdruck, aber sie
  // reist mit — die Höhenstation zieht **diesen** Helm am Maßband hoch, und
  // ein weißer Ersatzhelm dort würde die Wahl von eben dementieren.
  // `werkzeug: ''` ist im Matching wirkungslos (`werkzeug('')` → null).
  const weiter = () => {
    merkeHelm({ farbe, werkzeug })
    zeigeFragen()
  }

  return (
    <div
      data-testid="helmwahl"
      className="kh-screen flex flex-col overflow-hidden bg-kh-ink"
    >
      {/* Werkzeug auf Eiche, tief abgedunkelt — dasselbe Motiv wie unter dem
          Splash-Loop. Der Screen war der einzige ohne Foto; als reine Textur
          hinter dem Helm bindet das Bild ihn an die übrigen, ohne der Wahl
          Kontrast zu stehlen. */}
      <img
        src="/medien/media/shared/start-poster.webp"
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 size-full object-cover opacity-25"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B] via-[#0E0D0B]/80 to-[#0E0D0B]/55"
      />
      {/* Ein warmer Schein aus der unteren linken Ecke, wie auf dem Splash. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(90%_70%_at_15%_100%,rgba(255,122,26,0.22),transparent_60%)]"
      />

      {/* Dieser Screen hat keine Leiste — seine Überschrift steht mittig im
          Block mit der Wahl. Der Reset hängt deshalb frei in der Ecke, an
          derselben Stelle wie in den Leisten der anderen Screens. */}
      <NeustartKnopf className="absolute top-3 right-3 z-20 landscape:top-4 landscape:right-4" />

      <div className="relative flex min-h-0 flex-1 flex-col gap-4 p-5 landscape:flex-row landscape:gap-8 landscape:p-8">
        {/* Der Helm. Quer links neben der Wahl, hochkant darüber — er ist das
            Ergebnis und muss im Blick bleiben, während man wählt.

            Er war in der ersten Fassung auf 15 rem gedeckelt und stand damit
            als Daumennagel in einer 34-%-Spalte: das Ergebnis der Wahl war das
            kleinste Element des Screens. Jetzt füllt er seine Spalte.

            **Hochkant bekommt er ein Band statt einer Hälfte.** `flex-1` gab
            ihm auf der Stele die obere Hälfte von 1920 px, in der ein 272 px
            breiter Helm mittig schwebte — darunter, bis zur ebenfalls mittig
            zentrierten Wahl, standen rund 600 px totes Schwarz. Ein Band von
            38 % Höhe, in dem der Helm auf **Höhe** skaliert (`h-full`),
            schließt beides zusammen: der Helm wird so groß wie sein Platz, und
            der Platz ist nur noch so groß wie der Helm. */}
        {/* Auf dem Handy hochkant sind 38 % noch zu viel: darunter blieben für
            Farbe **und** Werkzeug rund 420 px, und das Werkzeugraster war auf
            einen 25-px-Streifen zusammengeschnitten — die zweite Frage des
            Screens stand praktisch nicht auf ihm. Unter 640 px Breite trägt
            das Band deshalb 26 %; auf dem iPad hochkant, wo der Platz reicht,
            bleibt es bei 38 %. */}
        <div className="flex h-[38%] max-sm:h-[26%] min-h-0 shrink-0 flex-col items-center justify-center gap-3 landscape:h-auto landscape:w-[36%] landscape:flex-none">
          <motion.div
            key={farbe}
            initial={{ scale: 0.9, opacity: 0, rotate: -4 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="flex h-full w-full items-center justify-center landscape:h-auto landscape:max-w-[23rem]"
          >
            <Helm
              farbe={farbe}
              className="h-full max-w-full drop-shadow-[0_14px_34px_rgba(0,0,0,0.6)] landscape:h-auto landscape:w-full"
            />
          </motion.div>
        </div>

        {/* Die Kante trennt hochkant Helmband und Wahl. Ohne sie stehen beide
            als zwei zentrierte Inseln in derselben schwarzen Fläche und der
            Abstand dazwischen liest sich als Lücke; mit ihr ist er der Rand
            eines Feldes. Quer übernimmt das die Spaltenkante. */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 border-t border-kh-line pt-4 landscape:border-t-0 landscape:pt-0 landscape:max-w-[40rem]">
          {/*
            Überschrift und Wahl sind **ein** Block, und der steht mittig im
            Platz, der ihm bleibt.

            Vorher hing die Überschrift oben fest und `justify-center` schob
            nur die Wahl in die Mitte — das ergab ein Loch zwischen beiden und
            ein zweites darunter, während der Helm daneben zentriert stand.

            Zentriert wird über `m-auto` am Block und nicht über
            `justify-center` am Container: `justify-center` schneidet in einem
            scrollenden Container oben ab, sobald der Inhalt höher wird als der
            Platz (kleines Telefon, große Schrift). Automatische Ränder geben
            in dem Fall einfach nach.
          */}
          {/* `overflow-y-auto` macht die x-Achse rechnerisch ebenfalls zu
              `auto` — der Ring des gewählten Farbkreises liegt mit Skalierung
              und Versatz rund 8 px außerhalb seines Kastens und wurde am linken
              Rand abgeschnitten. Der Container bekommt den Platz als Polster und
              holt ihn über den negativen Rand wieder heraus, damit die Kreise
              weiter unter der Überschrift bündig stehen. */}
          <div
            data-scroll
            className="-mx-2.5 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-2.5"
          >
            <div className="m-auto flex w-full flex-col gap-8 py-2.5 max-sm:gap-6 landscape:gap-6">
              <header className="flex shrink-0 flex-col gap-1.5">
                <span className="kh-etikett flex items-center gap-2">
                  <span aria-hidden className="h-[3px] w-7 rounded-full bg-kh-orange" />
                  Bevor du anfängst
                </span>
                <h1 className="kh-titel">Deine Ausrüstung</h1>
              </header>

              <section>
                {/*
                Die beiden Fragen sind die einzige Wegweisung auf diesem
                Screen und standen in `kh-mute` — dem leisesten Ton des
                Systems. Als Etikett tragen sie so weit wie der Rest.
              */}
                <h2 className="kh-etikett">Helmfarbe</h2>
                {/* 4 × 88 px plus drei 16-px-Lücken sind 400 px — auf einem
                    390-px-Handy bricht das auf zwei Zeilen um und schiebt das
                    Werkzeugraster unter die Kante. 4 × 72 plus 3 × 12 sind
                    324 px und passen in eine. */}
                <div className="mt-4 flex flex-wrap gap-4 max-sm:gap-3 landscape:mt-3 landscape:gap-3">
                  {HELM_FARBEN.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={farbe === f.id}
                      data-testid={`helm-farbe-${f.id}`}
                      onClick={() => setFarbe(f.id)}
                      // Der gewählte Zustand liegt **außerhalb** der Farbe: eine
                      // weiße Kante im Kreis war auf dem weißen Helm unsichtbar,
                      // und genau der ist die Voreinstellung. Ein abgesetzter
                      // Ring in Signalfarbe trägt auf allen vier Farben.
                      className={`size-[88px] max-sm:size-[72px] rounded-kh-pill transition-transform active:scale-90 landscape:size-[64px] ${
                        farbe === f.id
                          ? 'scale-105 ring-3 ring-kh-signal ring-offset-3 ring-offset-kh-ink'
                          : 'opacity-65'
                      }`}
                      style={{ backgroundColor: f.farbe }}
                    >
                      <span className="sr-only">{f.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="kh-etikett">Startwerkzeug</h2>
                {/* Hochkant tragen die Kacheln 9 rem statt 104 px: dieselbe
                    Zahl von Kacheln, mehr Fläche je Finger — und die Höhe, die
                    dem Screen unten sonst fehlt. */}
                <div className="mt-4 grid grid-cols-3 gap-3 landscape:mt-3 landscape:gap-2.5">
                  {WERKZEUGE.map((w) => {
                    const Icon = ICONS[w.icon]
                    const gewaehlt = werkzeug === w.id
                    return (
                      <Wahlflaeche
                        key={w.id}
                        form="kachel"
                        gewaehlt={gewaehlt}
                        data-testid={`werkzeug-${w.id}`}
                        onClick={() => setWerkzeug(gewaehlt ? '' : w.id)}
                        className="min-h-[9rem] max-sm:min-h-[7.25rem] landscape:min-h-[104px]"
                      >
                        <Icon
                          className={`size-11 landscape:size-9 ${gewaehlt ? '' : 'text-kh-paper/70'}`}
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        <span className="text-[1.0625rem] leading-tight font-semibold landscape:text-[0.9375rem]">
                          {w.name}
                        </span>
                      </Wahlflaeche>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-kh-line pt-3">
            <Button
              variant="leise"
              size="sm"
              onClick={zeigeFragen}
              data-testid="helm-ueberspringen"
            >
              Überspringen
            </Button>
            <Button onClick={weiter} variant="weiter" data-testid="helm-weiter">
              Passt
              <ArrowRight className="size-5" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
