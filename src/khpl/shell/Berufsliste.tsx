import { motion } from 'motion/react'
import { ArrowRight, Check, Clock } from 'lucide-react'
import { BerufBild } from '@/khpl/komponenten/BerufBild'
import { MERKMAL_TEXTE } from '@/khpl/match/merkmale'
import { useMatch } from '@/khpl/match/useMatch'
import type { BerufDef } from '@/khpl/berufe/typen'
import {
  betreteBeruf,
  useAktiverBeruf,
  useBesuchteBerufe,
  useFertigeBerufe,
  useSitzung,
} from '@/khpl/store/fortschritt'
import { NeustartKnopf } from './Neustart'
import { useStaffAusgang } from './staffAusgang'

/**
 * Die Berufsliste — alle vier Berufe nebeneinander.
 *
 * Der Screen, auf den jeder Weg im Trichter zurückführt: aus dem Vorschlag,
 * aus dem Sheet, vom Ende eines Tages. Er ist deshalb der einzige, der ohne
 * Vorgeschichte funktionieren muss — er darf nie voraussetzen, dass jemand
 * eine Frage beantwortet hat.
 *
 * **Sortiert wird nur, wenn es etwas zu sortieren gibt.** Mit Antworten steht
 * der beste Treffer vorn und trägt ein Etikett; ohne Antworten bleibt die
 * Reihenfolge der Registry. Eine gewürfelte Reihenfolge wäre schlimmer als
 * eine feste: sie sähe nach Empfehlung aus.
 *
 * **Hier steht jetzt auch der Vorschlag.** Er war ein eigener Screen davor und
 * hat den Trichter auf neun Taps bis zum ersten Handwerk gebracht. Was er
 * konnte, kann diese Liste besser: die Begründung steht auf der empfohlenen
 * Karte, die Alternativen liegen im selben Blick daneben statt einen Screen
 * später — und „Dicht dahinter“, das dort ein Nachsatz war, ist hier ein
 * Etikett auf der Karte, die es meint.
 *
 * Der Kaltstart-Sonderfall des Vorschlags („ohne Aussage kein Vorschlag“)
 * löst sich damit von selbst auf: ohne Antworten hat die Liste eben keine
 * hervorgehobene Karte.
 */
export function Berufsliste() {
  const { rangfolge, kaltstart, bester, zweiter, merkmale } = useMatch()
  const aktiv = useAktiverBeruf()
  const besuchte = useBesuchteBerufe()
  const fertige = useFertigeBerufe()
  const sitzung = useSitzung()
  const staffTap = useStaffAusgang()

  const berufe = rangfolge.map((t) => t.beruf)
  const empfohlen = kaltstart ? null : bester?.beruf.id
  const zweitbester = kaltstart ? null : zweiter?.beruf.id

  /**
   * Die Begründung auf der empfohlenen Karte — dieselbe wie auf dem früheren
   * Vorschlag-Screen. Ohne zitierbares Merkmal ist es ein Einstieg und kein
   * Treffer; dann bleibt die Zeile des Berufs stehen. Der Unterschied kostet
   * einen Satz und ist der ganze Unterschied zwischen einer Auskunft und einer
   * Verkaufszeile.
   */
  const gruende = bester
    ? bester.merkmale.length > 0
      ? bester.merkmale
      : merkmale.slice(0, 2)
    : []
  const begruendung =
    gruende.length > 0
      ? `Du magst ${gruende.map((m) => MERKMAL_TEXTE[m]).join(' — und ')}. Genau davon lebt dieser Beruf.`
      : null

  return (
    <div
      data-testid="berufsliste"
      className="kh-screen flex flex-col overflow-hidden bg-kh-ink"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,122,26,0.16),transparent_60%)]"
      />

      <header className="relative flex shrink-0 items-center gap-3 px-5 pt-6 pb-1 landscape:px-8 landscape:pt-6 landscape:pb-0">
        <div className="min-w-0">
          <h1 className="kh-titel">Vier Berufe</h1>
          <p className="text-[1.125rem] text-kh-mute landscape:text-[1rem]">
            {sitzung.aktiverBeruf
              ? 'Wechsle, wann du willst — dein Fortschritt bleibt.'
              : empfohlen
                ? 'Der erste passt am besten zu dir. Ansehen darfst du alle.'
                : 'Such dir einen aus. Umentscheiden geht jederzeit.'}
          </p>
        </div>
        {/* Die Dehnfuge trägt wie in der Step-Leiste die Staff-Geste. */}
        <span
          className="min-w-0 flex-1 self-stretch"
          onClick={staffTap}
          data-testid="staff-flaeche"
          aria-hidden
        />
        <NeustartKnopf className="self-start" />
      </header>

      <div
        data-scroll
        // Die vier Karten füllen den Screen — quer über zwei Spalten, hochkant
        // über vier volle Zeilen.
        //
        // Hochkant stand hier `auto-rows-min`: vier Karten à 9,5 rem klebten
        // oben, darunter blieben auf der Stele rund 1.200 px Schwarz. Das ist
        // der Hauptauswahl-Screen des Standes — die Fläche gehört den Karten.
        // `minmax(min-content, 1fr)` statt `fr` allein: die Zeile wird nie
        // kürzer als ihr Inhalt, wächst aber weiterhin in die freie Fläche.
        // Mit dem festen Boden `9.5rem` blieben auf einem 390-px-Handy 161 px
        // je Zeile für 184 px Inhalt — die Pille „Passt zu dir" wurde von der
        // Kartenoberkante halbiert (`overflow-hidden`). Den Boden trägt jetzt
        // die Karte selbst (`min-h-[9.5rem]`), damit ein kleines Telefon
        // scrollt statt zu quetschen.
        className="relative mt-4 grid min-h-0 flex-1 auto-rows-[minmax(min-content,1fr)] grid-cols-1 gap-4 overflow-y-auto overscroll-contain px-5 pb-6 landscape:mt-4 landscape:auto-rows-fr landscape:grid-cols-2 landscape:gap-3 landscape:px-8 landscape:pb-8"
      >
        {berufe.map((b, i) => (
          <Karte
            key={b.id}
            beruf={b}
            index={i}
            empfohlen={b.id === empfohlen}
            begruendung={b.id === empfohlen ? begruendung : null}
            zweitbester={b.id === zweitbester}
            angefangen={besuchte.includes(b.id)}
            fertig={fertige.includes(b.id)}
            aktiv={b.id === aktiv}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Das Etikett auf einer Karte. Vier Zustände (empfohlen, hier, angefangen,
 * bald) teilen sich Form und Größe; unterschieden wird über die Fläche.
 */
const CHIP =
  'rounded-kh-pill px-3 py-1.5 text-[0.8125rem] font-bold tracking-[0.1em] uppercase landscape:px-2.5 landscape:py-1 landscape:text-[0.75rem]'

function Karte({
  beruf,
  index,
  empfohlen,
  begruendung,
  zweitbester,
  angefangen,
  fertig,
  aktiv,
}: {
  beruf: BerufDef
  index: number
  empfohlen: boolean
  /** Warum ausgerechnet dieser — nur auf der empfohlenen Karte. */
  begruendung: string | null
  /**
   * „Dicht dahinter“. Zimmerer und Dachdecker liegen im Merkmalsraum fast
   * deckungsgleich; drei Fragen trennen sie nicht sicher. Den Zweiten zu
   * benennen macht aus einem knappen Ergebnis eine ehrliche Auskunft.
   */
  zweitbester: boolean
  angefangen: boolean
  fertig: boolean
  aktiv: boolean
}) {
  const bald = beruf.graph === null

  return (
    /*
      Der Auftritt sitzt auf dem Rahmen, der Druckpunkt auf der Karte.

      Beides auf einem Element hieß: Motion schreibt je Frame ein neues
      `transform`, und `transition-transform` (150 ms) blendet auf jeden
      dieser Werte erst noch über. Die Karte kommt dadurch nicht in 400 ms
      herauf, sondern kriecht 400 ms lang von 18 auf 11 px und fällt die
      letzten 11 px danach in gut 100 ms — ein Kriechen mit Ruck am Ende.
      Ein Element, das gleichzeitig von zwei Seiten transformiert wird, kann
      nur eines von beidem richtig machen.
    */
    <motion.div
      initial={{ opacity: 0, transform: 'translateY(18px)' }}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-[9.5rem]"
    >
      <button
        type="button"
        onClick={() => betreteBeruf(beruf.id)}
        data-testid={`beruf-${beruf.id}`}
        className={`relative flex min-w-0 flex-1 overflow-hidden rounded-kh-lg border-2 text-left transition-transform active:scale-[0.98] ${
          empfohlen ? 'border-kh-orange' : 'border-kh-line'
        }`}
      >
        {/*
        „Bald“ heißt entsättigt, nicht abgedunkelt.

        Vorher lag das Motiv der angekündigten Berufe auf 40 % Deckkraft unter
        einem Verlauf, der links bei vollem Schwarz beginnt — drei von vier
        Karten waren damit praktisch leer und lasen sich als fehlendes Bild,
        nicht als „kommt noch“. Grau und ruhig sagt dasselbe, ohne nach Defekt
        auszusehen: das Motiv ist da, es ist nur noch nicht dran.
      */}
        <div aria-hidden className="absolute inset-0">
          <BerufBild
            beruf={beruf}
            className={bald ? 'opacity-55 grayscale-[0.85]' : 'opacity-75'}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E0D0B] via-[#0E0D0B]/80 to-[#0E0D0B]/35" />
          {/* Hochkant ist die Karte dreimal so hoch wie vorher; der Text steht
            dann nicht mehr in der abgedunkelten linken Hälfte, sondern über
            dem unteren Bildrand. Der Fuß-Verlauf trägt ihn dort — quer wird
            er nicht gebraucht. */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0E0D0B] via-[#0E0D0B]/45 to-transparent landscape:hidden" />
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col justify-end gap-2 p-6 max-sm:p-4 landscape:gap-1.5 landscape:p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {empfohlen && (
              <span className={`${CHIP} bg-kh-orange text-[#0E0D0B]`}>Passt zu dir</span>
            )}
            {zweitbester && !aktiv && !angefangen && !fertig && (
              <span
                className={`${CHIP} border border-kh-orange/45 bg-kh-orange/12 text-kh-orange`}
              >
                Dicht dahinter
              </span>
            )}
            {aktiv && (
              <span
                className={`${CHIP} flex items-center gap-1 bg-kh-signal text-[#0E0D0B]`}
              >
                <Check className="size-3.5" strokeWidth={3.5} aria-hidden />
                du bist hier
              </span>
            )}
            {/*
            Der angefangene Beruf — dieselbe Auskunft wie im Sheet „Dein Weg“,
            und dieselbe Formulierung Wort für Wort.

            Vorher trug er dasselbe gelbgrüne Etikett wie „du bist hier“, nur
            mit anderem Wort: zwei Zustände, ein Bild. Jetzt sagt die Karte,
            was das Sheet sagt — und Gelbgrün bleibt dem einen Beruf, in dem
            der Besucher gerade steckt.
          */}
            {/*
            Ein zu Ende gespielter Tag heißt nicht mehr „da weitermachen“ —
            er ist geschafft, und genau dafür ist Gelbgrün reserviert
            (index.css). Das ist neben „du bist hier“ das zweite legitime
            Gelbgrün dieses Screens; beide markieren ein Ist, keine Wahl.
          */}
            {fertig && !aktiv && (
              <span
                className={`${CHIP} flex items-center gap-1 bg-kh-signal text-[#0E0D0B]`}
              >
                <Check className="size-3.5" strokeWidth={3.5} aria-hidden />
                geschafft
              </span>
            )}
            {angefangen && !fertig && !aktiv && (
              <span
                className={`${CHIP} flex items-center gap-1.5 border border-kh-line-strong bg-white/12 text-kh-paper`}
              >
                {/* Orange wie das Häkchen desselben Zustands im Sheet. Gelbgrün
                  hieße „geschafft“ — angefangen ist es gerade nicht. */}
                <Check
                  className="size-3.5 text-kh-orange"
                  strokeWidth={3.5}
                  aria-hidden
                />
                Angefangen — da weitermachen
              </span>
            )}
            {bald && (
              <span
                className={`${CHIP} flex items-center gap-1 bg-white/12 text-kh-paper/70`}
              >
                <Clock className="size-3.5" strokeWidth={2.5} aria-hidden />
                bald
              </span>
            )}
          </div>

          {/*
          Der Pfeil stand in einer eigenen 56-px-Spalte rechts, senkrecht
          mittig — einen halben Screen von der Überschrift entfernt, zu der er
          gehört, und auf einer „Bald“-Karte ein Versprechen, das sie nicht
          einlösen kann. Jetzt steht er in der Titelzeile, und wo es noch
          nichts zu betreten gibt, steht dort gar nichts.
        */}
          <h2 className="flex items-center gap-2.5">
            {/* Hochkant `kh-titel`, quer die kleine Stufe: dort steht dieselbe
              Karte in halber Breite neben einer zweiten. */}
            <span className="kh-titel landscape:text-[1.85rem] landscape:leading-none">
              {beruf.kurz}
            </span>
            {!bald && (
              <ArrowRight
                aria-hidden
                className={`size-8 shrink-0 landscape:size-6 ${empfohlen ? 'text-kh-orange' : 'text-kh-paper/50'}`}
                strokeWidth={2.5}
              />
            )}
          </h2>
          <p className="max-w-[42ch] text-[1.125rem] leading-snug text-kh-paper/75 landscape:text-[0.9375rem] landscape:text-kh-paper/70">
            {begruendung ?? beruf.zeile}
          </p>
        </div>
      </button>
    </motion.div>
  )
}
