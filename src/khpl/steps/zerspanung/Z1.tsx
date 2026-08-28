import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  HAAR,
  NENNMASS,
  RASTER_KURVE,
  TOLERANZ,
  WELLEN,
  WELLEN_ABSTAND,
  type Sitz,
} from '@/khpl/buehne/zerspanung/kanon'
import { Passung } from '@/khpl/buehne/zerspanung/Passung'
import { Zeichnung } from '@/khpl/buehne/zerspanung/Zeichnung'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Lage } from '@/khpl/komponenten/Lage'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * Z1 — Der Spielraum, den niemand sieht.
 *
 * **Zwei Bühnen, ein Bogen.** Die Übung ist greifbar: drei Wellen, drei
 * Sitze, probier sie durch (`buehne/zerspanung/Passung`). Auf allen dreien
 * steht dasselbe Maß, Ø 20 — eine gleitet hinein und sitzt, eine geht gar
 * nicht rein, eine hat Spiel. **Die Auflösung ist die Zeichnung selbst**
 * (`buehne/zerspanung/Zeichnung`): dasselbe Teil als Vektor, das Maß
 * `Ø 20 h7` hervorgehoben, und dann der erste Zoom des Tages — die Einzelheit
 * mit der Toleranzzone, Größtmaß und Kleinstmaß direkt im Bild.
 *
 * Damit steht die Antwort auf „was heißt h7?“ dort, wo sie hingehört: auf der
 * Zeichnung, nicht in einer Tabelle im Panel. Das Panel behält nur, was die
 * Bühne nicht sagen kann — die drei gemessenen Werte, den Haarvergleich und
 * den Satz, der die Ökonomie dahinter trägt.
 *
 * **Warum kein Rate-Regler** (Vorgeschichte): Es war der dritte Rate-Regler
 * der Anwendung, und der einzige, bei dem die geratene Größe für die
 * Zielgruppe keine Bedeutung hat. Wer noch nie „0,02 mm“ gedacht hat, zieht
 * irgendwohin — Danebenliegen ist nur Inhalt (R11), wenn vorher eine
 * Vorstellung da war, die widerlegt werden kann.
 *
 * **Fehlerfall: keiner** (R11). Es gibt keine falsche Welle — die zwei, die
 * nicht passen, sind Ausschuss aus der Fertigung, kein Fehler des Besuchers.
 *
 * Zahlen: `BELEGT` nach ISO 286 (`belege/zerspanung.md` 1), Haardicke ebd.
 * Punkt 2.
 *
 * **`answers.z1`** `{ probiert, aufgeloest }`.
 */

/** Millimeter, drei Stellen — `20,000` und `19,979` sind erst so ein Paar. */
const mm = (n: number) => n.toFixed(3).replace('.', ',')

/**
 * Was auf dem Screen steht, wenn eine Welle im Sitz war.
 *
 * **Drei Sätze, kein Urteil.** Keiner davon sagt „richtig" oder „falsch" —
 * sie beschreiben, was passiert ist. Der Satz zu `sitzt` ist bewusst der
 * kürzeste: In der Werkstatt sagt niemand etwas, wenn etwas passt.
 */
const ERGEBNIS: Record<Sitz, { kurz: string; lang: string }> = {
  sitzt: {
    kurz: 'Sitzt.',
    lang: 'Reingeschoben, angekommen, hält. Mehr passiert hier nicht — und genau das ist das Ziel.',
  },
  klemmt: {
    kurz: 'Geht nicht rein.',
    lang: 'Sie steht am Loch und bleibt stehen. Das Teil ist zu dick — nachdrehen geht, wegwerfen muss man es nicht.',
  },
  lose: {
    kurz: 'Hat Spiel.',
    lang: 'Sie rutscht durch und liegt unten auf. Zu dünn kann man nicht nachdrehen — das Teil ist Ausschuss.',
  },
}

/**
 * Wie lange die Zeichnung unverzoomt stehen bleibt, bevor die Einzelheit
 * einfährt — lang genug, um `Ø 20 h7` einmal zu sehen. Beim Wiederbesuch
 * kürzer: Wer zurückspringt, kennt das Blatt schon.
 */
const ZOOM_NACH_MS = 1300
const ZOOM_NACH_MS_ERNEUT = 450

const RASTER = [...RASTER_KURVE] as [number, number, number, number]

export function Z1() {
  const gespeichert = useFortschritt().answers.z1
  const [probiert, setProbiert] = useState<string[]>(() => gespeichert?.probiert ?? [])
  const [aufgeloest, setAufgeloest] = useState(() => !!gespeichert?.aufgeloest)
  /**
   * Welche Welle gerade fährt — nur für die Bühne, nicht für den Fortschritt.
   * `probiert` allein reichte nicht: Die Rückmeldung im Panel soll die zuletzt
   * angefasste Welle nennen, und die ist nicht zwingend die letzte in der
   * Liste (man kann C vor B probieren).
   */
  const [zuletzt, setZuletzt] = useState<string | null>(
    () => gespeichert?.probiert?.at(-1) ?? null,
  )
  /**
   * Der erste Zoom des Tages. Er startet **nicht** mit der Auflösung, sondern
   * einen Atemzug später: Erst steht die Zeichnung mit dem hervorgehobenen
   * `Ø 20 h7` da, dann fährt die Einzelheit ein — die Ansage, wie dieser Tag
   * funktioniert (khpl-tag-zerspanung.md §6 Z1).
   */
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    if (!aufgeloest) return
    const id = window.setTimeout(
      () => setZoom(true),
      gespeichert?.aufgeloest ? ZOOM_NACH_MS_ERNEUT : ZOOM_NACH_MS,
    )
    return () => window.clearTimeout(id)
    // `gespeichert` absichtlich nicht als Abhängigkeit: `merkeAntwort` beim
    // Auflösen schriebe es neu und startete den Zoom-Timer noch einmal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aufgeloest])

  const alle = probiert.length >= WELLEN.length

  const probieren = (id: string) => {
    if (probiert.includes(id)) return
    const neu = [...probiert, id]
    setProbiert(neu)
    setZuletzt(id)
    merkeAntwort('z1', { probiert: neu, aufgeloest: false })
  }

  const aufloesen = () => {
    setAufgeloest(true)
    merkeAntwort('z1', { probiert, aufgeloest: true })
  }

  return (
    <StepShell
      id="Z1"
      auftrag={
        aufgeloest
          ? null
          : alle
            ? 'Hol dir die echten Maße dazu.'
            : 'Probier alle drei durch.'
      }
      // Antippen erklärt sich selbst — die Wellen tragen einen limetten Punkt,
      // solange sie noch nicht probiert wurden (`komponenten/gesten.ts`).
      ansage={null}
      interaktionOffen={!aufgeloest}
      buehne={
        // Die Bühne wechselt mit dem Takt: erst die Werkbank, dann das Blatt.
        // Ein weicher Übergang, kein Schnitt — der Zoom danach übernimmt.
        <motion.div
          key={aufgeloest ? 'zeichnung' : 'probe'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, ease: RASTER }}
          className="size-full"
        >
          {aufgeloest ? (
            <Zeichnung massHervorgehoben toleranzfeld={zoom} />
          ) : (
            <Passung aktiv={zuletzt} probiert={probiert} onProbieren={probieren} />
          )}
        </motion.div>
      }
      warum={
        <p>
          Eine Zeichnung sagt nicht, <em>wie groß</em> — sie sagt, <em>wie genau</em>.
          Hinter jedem Maß steht ein Spielraum, und der hat einen Namen.
        </p>
      }
      interaktion={
        <Wechsel takt={aufgeloest ? 'aufgeloest' : 'probieren'}>
          {aufgeloest ? <Aufloesung /> : <Probe probiert={probiert} zuletzt={zuletzt} />}
        </Wechsel>
      }
      aha={
        <>
          <AhaKarte sichtbar={aufgeloest} eyebrow="Ist enger nicht besser?">
            Die Toleranz ist nicht, wie genau du arbeiten <em>kannst</em>. Sie ist, wie
            genau das Teil hinterher <em>passen muss</em>. Enger heißt nicht besser —
            enger heißt teurer.
          </AhaKarte>
          {/* Ab dem zweiten Einwurf zugeklappt (R5): zwei zugleich offene
              Karten sprengen das Wortbudget der Klappzeile. */}
          <AhaKarte sichtbar={aufgeloest} zugeklappt eyebrow="Gilt das für jedes Teil?">
            Nein, der Spielraum hängt am Maß. Die {mm(TOLERANZ)} Millimeter gehören zu Ø{' '}
            {NENNMASS}; bei Ø 50 wären es 0,025. Maß und Toleranz gehören immer zusammen —
            eins ohne das andere sagt nichts.
          </AhaKarte>
        </>
      }
      fuss={
        <StepFuss
          id="Z1"
          uebungOffen={!aufgeloest}
          aktion={
            aufgeloest ? null : (
              <button
                type="button"
                onClick={aufloesen}
                disabled={!alle}
                data-testid="z1-aufloesen"
                /*
                  `grayscale` zusätzlich zur gedeckelten Deckkraft: Ob der
                  Knopf gerade „noch nicht" oder „jetzt" sagt, muss man am
                  Kiosk im Vorbeigehen sehen (R8, wie in A4).
                */
                className="min-h-[52px] rounded-kh-pill bg-kh-signal px-5 text-[1.0625rem] font-semibold text-[#0E0D0B] transition-transform active:scale-95 disabled:scale-100 disabled:opacity-40 disabled:grayscale"
              >
                Und jetzt die echten Maße
              </button>
            )
          }
          geschafft={aufgeloest ? 'Toleranz gelesen' : null}
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Takt 1 — probieren
// ---------------------------------------------------------------------------

/**
 * Die Liste der drei Wellen als Protokoll.
 *
 * **Sie zeigt kein Maß.** Solange probiert wird, steht neben jeder Welle nur,
 * was passiert ist — die Zahlen kommen erst in der Auflösung. Stünde hier
 * schon 19,962, wäre die Übung vorbei, bevor sie angefangen hat: Man müsste
 * nur noch die drei Zahlen mit der Toleranz vergleichen, und das kann, wer
 * gerade erst lernt, was eine Toleranz ist, ohnehin nicht.
 */
function Probe({
  probiert,
  zuletzt,
}: {
  probiert: readonly string[]
  zuletzt: string | null
}) {
  const letzte = WELLEN.find((w) => w.id === zuletzt)

  return (
    <div className="flex flex-col gap-3">
      {/*
        **Der Rahmen steht hier und nicht im `warum`** — das zeigt die Hülle
        auf Übungs-Steps nicht an (`komponenten/Lage.tsx`). Ohne ihn schiebt
        man drei gleich aussehende Stäbe in drei gleich aussehende Löcher und
        weiß nicht, wozu.
      */}
      <Lage>
        Drei Wellen aus der Nachtschicht, alle mit demselben Maß auf der Zeichnung. Eine
        davon gehört in dieses Lager — welche, findest du nur heraus, indem du sie
        reinschiebst.
      </Lage>

      <ul className="flex flex-col" data-testid="z1-protokoll">
        {WELLEN.map((w) => {
          const fertig = probiert.includes(w.id)
          return (
            <li
              key={w.id}
              className="flex items-baseline gap-3 border-b border-kh-line py-2 text-[1.0625rem] last:border-0"
            >
              <span className="w-4 shrink-0 font-display text-[1.25rem] leading-none text-kh-mute">
                {w.id}
              </span>
              <span className="shrink-0 text-kh-paper tabular-nums">Ø {NENNMASS}</span>
              <span
                className={`ml-auto text-right ${
                  fertig ? 'font-semibold text-kh-orange' : 'text-kh-mute/70'
                }`}
              >
                {fertig ? ERGEBNIS[w.sitz].kurz : 'noch nicht probiert'}
              </span>
            </li>
          )
        })}
      </ul>

      {letzte && (
        <motion.p
          key={letzte.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: RASTER }}
          data-testid="z1-ergebnis"
          className="text-[1.0625rem] leading-[1.45] text-kh-paper/85"
        >
          {ERGEBNIS[letzte.sitz].lang}
        </motion.p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Takt 2 — auflösen. Größt- und Kleinstmaß stehen jetzt auf der Bühne, in der
// Einzelheit der Zeichnung — das Panel wiederholt sie nicht.
// ---------------------------------------------------------------------------

function Aufloesung() {
  return (
    <motion.div
      initial="aus"
      animate="an"
      variants={{ an: { transition: { staggerChildren: 0.4, delayChildren: 0.25 } } }}
      className="flex flex-col gap-3"
    >
      <Takt>
        {/* Die ausgeschriebene Zahl — als Titel der Auflösung ist sie stark
            (R6); über einer laufenden Übung wäre sie der Spoiler. */}
        <span className="kh-etikett text-kh-orange">Null Komma null zwei eins</span>
        <div className="flex items-baseline gap-2.5">
          {/* Die Signaturzahl rastet ein — hart, ohne Überschwingen (§7). */}
          <motion.span
            initial={{ opacity: 0, transform: 'translateY(18px) scale(0.9)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            transition={{ duration: 0.4, ease: RASTER }}
            data-testid="z1-zahl"
            className="kh-zahl text-kh-orange"
          >
            {mm(TOLERANZ)}
          </motion.span>
          <span className="text-[1.125rem] font-semibold text-kh-mute">mm</span>
        </div>
        <p className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
          Das kleine <span className="font-semibold text-kh-paper">h7</span> hinter dem
          Maß heißt genau das: ab 20,000 nur nach unten, {mm(TOLERANZ)} tief. Dieser
          Spielraum heißt <Begriff id="toleranz">Toleranz</Begriff>.
        </p>
      </Takt>

      <Takt>
        <Messprotokoll />
      </Takt>

      <Takt>
        {/*
          Der Größenvergleich, an der Zahl, die der Besucher gerade erlebt
          hat. „So fein wie ein Haar" wäre falsch — die Toleranz ist deutlich
          feiner (belege/zerspanung.md 2, Haar 50–70 µm). Deshalb „ungefähr",
          nie eine Rechnung: Haardicke streut um den Faktor drei.
        */}
        <p className="text-[1.0625rem] leading-[1.45] text-kh-paper/85">
          Zwischen der Welle, die sitzt, und der, die klemmt, liegen{' '}
          <span className="text-kh-paper">{mm(WELLEN_ABSTAND)} Millimeter</span>. Ein Haar
          vom Kopf ist ungefähr {HAAR.toFixed(2).replace('.', ',')} dick — der Unterschied
          hier ist kleiner.
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-3">
          <Papier />
        </div>
      </Takt>

      <Takt>
        {/* Der Satz, der die Ökonomie dahinter trägt — sichtbar, nicht in
            einer Klappzeile (R14 nennt ihn als Messlatte des Tons). */}
        <p className="kh-titel-klein border-t border-kh-line pt-3 text-kh-orange">
          Enger heißt nicht besser — enger heißt teurer.
        </p>
      </Takt>
    </motion.div>
  )
}

/** Ein Beat der Auflösung — sie kommen nacheinander, nicht auf einmal. */
function Takt({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        aus: { opacity: 0, transform: 'translateY(12px)' },
        an: { opacity: 1, transform: 'translateY(0px)' },
      }}
      transition={{ duration: 0.4, ease: RASTER }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Die drei echten Maße, gegen die Toleranzzone gestellt.
 *
 * **Erst hier stehen sie**, und jetzt erklären sie etwas: Man hat gerade
 * gesehen, dass zwei nicht gehen, und liest nach, um wie viel. Andersherum
 * wäre es eine Tabelle vor einer Aufgabe.
 */
function Messprotokoll() {
  return (
    <dl className="flex flex-col" data-testid="z1-messwerte">
      {WELLEN.map((w) => (
        <div
          key={w.id}
          className="flex items-baseline gap-3 border-b border-kh-line py-2 text-[1.0625rem] last:border-0"
        >
          <dt className="flex shrink-0 items-baseline gap-2">
            <span className="w-4 font-display text-[1.25rem] leading-none text-kh-mute">
              {w.id}
            </span>
            <span
              className={`font-display text-[1.375rem] leading-none tabular-nums ${
                w.sitz === 'sitzt' ? 'text-kh-signal' : 'text-kh-paper/60'
              }`}
            >
              {mm(w.wert)}
            </span>
          </dt>
          <dd className="ml-auto text-right text-kh-mute">
            {w.sitz === 'sitzt'
              ? 'in der Toleranz'
              : w.sitz === 'klemmt'
                ? 'über dem Größtmaß'
                : 'unter dem Kleinstmaß'}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Der Zweitvergleich, antippbar statt aufgedrängt (Muster: die
 * Mathe-Einblendung in M2). Er steht bereit, falls das Haar nicht trägt —
 * Papier hat jeder schon einmal in der Hand gehabt.
 */
function Papier() {
  return (
    <Dialog>
      {/* `min-h-[52px]`: dieselbe Untergrenze, die `button.tsx` für jede
          Trefferfläche im Bestand setzt (khpl-tage.md §3). */}
      <DialogTrigger className="min-h-[52px] rounded-kh-pill border-2 border-kh-line-strong bg-white/5 px-4 py-2.5 text-[1rem] font-medium text-kh-paper/85 transition-transform active:scale-95">
        Und wenn ich mir nichts darunter vorstellen kann?
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Ein Blatt Papier</DialogTitle>
        <DialogDescription>
          Ein Blatt Papier ist rund ein Zehntelmillimeter dick. Spalte es in fünf
          Schichten — eine davon ist dein ganzer Spielraum.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
