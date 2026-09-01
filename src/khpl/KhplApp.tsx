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
import { Zustimmung } from '@/khpl/shell/Zustimmung'
import { Platzhalter } from '@/khpl/steps/Platzhalter'
import {
  useAktiverBeruf,
  useAngesehenerBeruf,
  useBildschirm,
  useFortschritt,
} from '@/khpl/store/fortschritt'

/**
 * KHPL Connect — die Hülle um den Flow.
 *
 * Es gibt weiterhin keinen Router: die App hat keine URLs und keine
 * Tiefenlinks. Der Zustand ist `bildschirm` plus der aktive Beruf mit seinem
 * Schritt, mehr nicht.
 *
 * **Die Zurück-Taste des Browsers tut trotzdem etwas Sinnvolles.** Sie hängt
 * nicht an einer Adresse, sondern an Verlaufseinträgen, die die Stelle in ihrem
 * `state` tragen (`store/verlauf.ts`). Damit überleben Reload, Zurück und
 * Vorwärts — ohne dass jemand eine URL abschreiben und mitten im Tag einsteigen
 * könnte.
 *
 * Die Reihenfolge unten **ist** der Ablauf:
 *
 *   Splash → Helm → Fragen → Berufsliste → Auftrag → Step
 *
 * Die Berufsliste hat zwei Rollen: Station im Trichter — sie trägt seit der
 * Vereinfachung auch den Vorschlag, der vorher ein eigener Screen davor war —
 * und Daueradresse für jeden, der später den Beruf wechselt.
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
      {bildschirm === 'berufe' && <Berufsliste />}
      {bildschirm === 'bald' && angesehen && <BerufBald id={angesehen} />}
      {bildschirm === 'intro' && <Auftragsannahme />}
      {bildschirm === 'step' && berufId && <Step beruf={berufId} id={currentStepId} />}
      <Zustimmung />
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
