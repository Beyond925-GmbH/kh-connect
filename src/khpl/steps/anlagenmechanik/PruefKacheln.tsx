import { Check } from 'lucide-react'

/**
 * Die Foto-Kacheln der Fehlersuche in A1 — **ein echtes Foto je Prüfpunkt.**
 *
 * **Was hier ersetzt wurde.** Vorher war die Zeichnung die Bedienung: sechs
 * Prüfpunkte auf dem Anlagenausschnitt, jeder ein kleiner Kreis an einem
 * grauen Vektorbauteil. Das war der Liste aus sechs Komposita schon weit
 * voraus — aber ein Kreis an einem stilisierten Kasten sagt jemandem, der
 * noch nie in einem Heizungskeller stand, immer noch nicht, *was das ist*.
 * Ein Foto tut es: eine rote Pumpe mit Typenschild ist eine Pumpe, ein
 * weißer Speicher mit Kupferrohren ist ein Speicher. Man tippt auf Sachen,
 * nicht auf Symbole.
 *
 * Die Rollen sind damit getauscht: **die Kacheln bedienen, die Zeichnung
 * führt Protokoll** — sie zeigt weiter, wo in der Anlage die Haken sitzen,
 * und beim Treffer den warmen Ring. Dieselbe Arbeitsteilung wie der
 * Verlustbalken in A4.
 *
 * **Gestaltung entlang der `Wahlflaeche`** (Radius, Kante, Grund,
 * Druck-Rückmeldung), aber als eigene Komponente: eine Kachel mit Foto,
 * Haken-Plakette und drei Zuständen (offen / geprüft / aufgebraucht) in die
 * cva der `Wahlflaeche` zu zwingen hätte dort vier neue Schalter gekostet.
 * Der geprüfte Zustand ist Rand plus Plakette, **keine gefüllte
 * Signalfläche** — die eine satte Gelbgrün-Fläche des Screens bleibt der
 * Weiter-Knopf, und das Foto soll lesbar bleiben, nicht gefeiert
 * werden.
 *
 * **Aufgebrauchte Kacheln dimmen, geprüfte nicht.** Beide sind nicht mehr
 * tippbar, aber aus verschiedenen Gründen: „schon erledigt" trägt Haken und
 * bleibt hell, damit die Entscheidung danach auf Sichtbarem fußt; „keine
 * Prüfung mehr frei" tritt zurück wie `gedaempft` in der `Wahlflaeche`.
 * Ein `disabled:opacity-40` über beide hätte ausgerechnet die eigenen drei
 * Befunde ausgegraut.
 *
 * Herkunft und Lizenz der sechs Fotos: `MEDIEN.md`, Abschnitt
 * Anlagenmechanik.
 */

export interface PruefKachelDaten {
  id: string
  /** Der Name des Dings, einfach und kurz — die Frage steht im Befund. */
  label: string
  /** Foto des Bauteils, WebP unter `public/medien/media/anlagenmechaniker/`. */
  bild: string
}

export function PruefKacheln({
  kacheln,
  geprueft,
  tippbar,
  onPruefe,
}: {
  kacheln: readonly PruefKachelDaten[]
  /** Ids der schon geprüften Punkte. */
  geprueft: readonly string[]
  /** `false`, sobald die drei freien Prüfungen aufgebraucht sind. */
  tippbar: boolean
  onPruefe: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" data-testid="a1-kacheln">
      {kacheln.map((k) => {
        const fertig = geprueft.includes(k.id)
        /*
          Zwei Arten von „geht nicht mehr", zwei Auszeichnungen: Eine
          **geprüfte** Kachel bleibt im Tab-Weg und behält ihr `aria-pressed`
          — `disabled` würfe beides weg, und der Screenreader verlöre genau
          die Information, die die Kachel trägt („das hast du schon"). Der
          Klick läuft dann ins Leere. Nur die **aufgebrauchte** Kachel (keine
          Prüfung mehr frei, nie angetippt) ist wirklich `disabled`.
        */
        const aufgebraucht = !fertig && !tippbar
        return (
          <button
            key={k.id}
            type="button"
            disabled={aufgebraucht}
            aria-disabled={fertig || aufgebraucht || undefined}
            onClick={() => {
              if (!fertig && tippbar) onPruefe(k.id)
            }}
            aria-pressed={fertig}
            data-testid={`a1-kachel-${k.id}`}
            className={`relative flex flex-col overflow-hidden rounded-kh border-2 text-left transition-[border-color,opacity,transform] duration-150 ${
              fertig
                ? 'border-kh-signal'
                : tippbar
                  ? 'border-kh-line-strong bg-white/6 active:scale-[0.97]'
                  : 'border-kh-line-strong bg-white/6 opacity-35'
            }`}
          >
            {/*
              Seitenverhältnis statt fester Höhe: die Kachelbreite kommt aus
              dem Raster, und ein Foto, das seine Höhe selbst mitbringt,
              springt beim Laden nicht. Quer flacher (16/10): dort ist der
              Screen niedrig, und mit 4/3 ragte die zweite Kachelzeile unter
              die Scrollkante des Panels (gemessen auf 1280 × 800). Geprüfte
              Fotos treten etwas zurück, damit auf einen Blick zu sehen ist,
              was noch offen ist.
            */}
            {/*
              `alt=""` mit Absicht: Der zugängliche Name der Kachel ist das
              sichtbare Label darunter. Ein Alt-Text käme davor und der
              Screenreader läse „Rote Pumpe an einem dicken Rohr Ladepumpe" —
              zwei Namen für einen Knopf. Was auf den Fotos ist, steht in
              `MEDIEN.md`.
            */}
            <img
              src={k.bild}
              alt=""
              draggable={false}
              className={`aspect-[4/3] w-full object-cover landscape:aspect-[16/10] ${fertig ? 'opacity-50' : ''}`}
            />
            <span
              className={`flex min-h-[40px] items-center px-2.5 py-1.5 text-[1rem] leading-tight font-semibold ${
                fertig ? 'text-kh-signal' : 'text-kh-paper'
              }`}
            >
              {k.label}
            </span>
            {fertig && (
              <span
                aria-hidden
                className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-kh-signal text-[#0E0D0B]"
              >
                <Check className="size-4" strokeWidth={3.5} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
