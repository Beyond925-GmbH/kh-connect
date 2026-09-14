import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { beruf as berufDef } from '@/khpl/berufe/registry'
import type { BerufId } from '@/khpl/berufe/typen'
import { nimmAuftragAn, useAktiverBeruf, zeigeBerufe } from '@/khpl/store/fortschritt'
import { NeustartKnopf } from './Neustart'

const AUFTRAEGE: Record<BerufId, { titel: string; text: string }> = {
  zimmerer: {
    titel: 'Aus Holz wird eine Wand.',
    text: 'Baue ein Wandelement, setze das Fenster ein und bringe die Wand mit dem Kran an ihren Platz.',
  },
  dachdecker: {
    titel: 'Ein Dachstuhl entsteht.',
    text: 'Prüfe die Baustelle, schneide Holz zu und baue die Dachkonstruktion auf.',
  },
  zerspanungsmechaniker: {
    titel: 'Ein Metallteil muss passen.',
    text: 'Spanne das Rohteil ein, steuere die Maschine und prüfe, ob die Teile genau genug sind.',
  },
  anlagenmechaniker: {
    titel: 'Warmes Wasser fürs Haus.',
    text: 'Finde die Störung, verlege eine Leitung und stelle den passenden Druck ein.',
  },
}

/** Ein kurzer Auftrag statt drei Textseiten vor dem ersten Spiel. */
export function Auftragsannahme() {
  const id = useAktiverBeruf()
  if (!id) return null
  const beruf = berufDef(id)
  const auftrag = AUFTRAEGE[id]
  return (
    <div
      data-testid="auftragsannahme"
      className="kh-screen flex flex-col overflow-hidden bg-kh-ink"
    >
      <img
        src={beruf.medien.szenarioPoster ?? beruf.medien.heroPoster}
        alt=""
        className="absolute inset-0 size-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-kh-ink via-kh-ink/75 to-kh-ink/20" />
      <header className="relative flex items-center justify-between p-4">
        <Button
          variant="neben"
          size="sm"
          onClick={zeigeBerufe}
          data-testid="zurueck-zur-liste"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Zurück zu den Berufen
        </Button>
        <NeustartKnopf />
      </header>
      <main className="relative flex min-h-0 flex-1 items-end gap-4 overflow-y-auto p-6 pb-10 sm:p-10">
        <div className="flex max-w-2xl flex-col items-start gap-5">
          <p className="text-sm font-semibold tracking-wide text-kh-orange">
            {beruf.name}
          </p>
          <h1 className="font-display text-[clamp(2.3rem,5vw,4rem)] leading-tight text-kh-paper">
            {auftrag.titel}
          </h1>
          <p className="max-w-xl text-xl leading-relaxed text-kh-paper/90">
            {auftrag.text}
          </p>
          <p className="flex items-center gap-2 text-base text-kh-mute">
            <Clock className="size-4" aria-hidden />
            Etwa 3–5 Minuten · Du kannst jederzeit wechseln.
          </p>
          <Button onClick={nimmAuftragAn} size="lg" data-testid="auftrag-annehmen">
            Los geht’s
            <ArrowRight className="size-5" aria-hidden />
          </Button>
        </div>
      </main>
    </div>
  )
}
