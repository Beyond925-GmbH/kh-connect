import type { StepId } from '@/khpl/flow/steps'
import { BERUF_KOMPONENTEN } from '@/khpl/berufe/komponenten'
import type { BerufId } from '@/khpl/berufe/typen'
import { Auftragsannahme } from '@/khpl/shell/Auftragsannahme'
import { BerufBald } from '@/khpl/shell/BerufBald'
import { Berufsliste } from '@/khpl/shell/Berufsliste'
import { Fragen } from '@/khpl/shell/Fragen'
import { Helmwahl } from '@/khpl/shell/Helmwahl'
import { KioskGuard } from '@/khpl/shell/KioskGuard'
import { Splash } from '@/khpl/shell/Splash'
import { Vorschlag } from '@/khpl/shell/Vorschlag'
import { Platzhalter } from '@/khpl/steps/Platzhalter'
import {
  useAktiverBeruf,
  useAngesehenerBeruf,
  useBildschirm,
  useFortschritt,
} from '@/khpl/store/fortschritt'

/**
 * KHPL Connect — die Hülle um den Flow (khpl-ui-shell.md 3).
 *
 * Es gibt bewusst keinen Router: die App hat keine URLs, keine Tiefenlinks und
 * keine Zurück-Taste des Browsers, die etwas Sinnvolles täte. Der Zustand ist
 * `bildschirm` plus der aktive Beruf mit seinem Schritt, mehr nicht.
 *
 * Die Reihenfolge unten **ist** der Ablauf:
 *
 *   Splash → Helm → Fragen → Vorschlag → (Berufsliste) → Auftrag → Step
 *
 * Die Berufsliste steht in Klammern, weil sie zwei Rollen hat: Station im
 * Trichter für den, der den Vorschlag nicht will, und Daueradresse für jeden,
 * der später den Beruf wechselt.
 */
export function KhplApp() {
  const bildschirm = useBildschirm()
  const berufId = useAktiverBeruf()
  const angesehen = useAngesehenerBeruf()
  const { currentStepId } = useFortschritt()

  return (
    <KioskGuard>
      {bildschirm === 'splash' && <Splash />}
      {bildschirm === 'helm' && <Helmwahl />}
      {bildschirm === 'fragen' && <Fragen />}
      {bildschirm === 'vorschlag' && <Vorschlag />}
      {bildschirm === 'berufe' && <Berufsliste />}
      {bildschirm === 'bald' && angesehen && <BerufBald id={angesehen} />}
      {bildschirm === 'intro' && <Auftragsannahme />}
      {bildschirm === 'step' && berufId && <Step beruf={berufId} id={currentStepId} />}
    </KioskGuard>
  )
}

function Step({ beruf, id }: { beruf: BerufId; id: StepId }) {
  const gebaut = BERUF_KOMPONENTEN[beruf]?.[id]
  // `key` erzwingt einen frischen Mount pro Step: kein Interaktionszustand
  // eines Schritts leckt in den nächsten. Der Beruf gehört mit hinein — sonst
  // behielte ein Wechsel von Zimmerer-M5 auf einen fremden M5 den Zustand des
  // alten Screens.
  const schluessel = `${beruf}:${id}`
  return gebaut ? (
    <div key={schluessel} className="contents">
      {gebaut()}
    </div>
  ) : (
    <Platzhalter key={schluessel} id={id} />
  )
}
