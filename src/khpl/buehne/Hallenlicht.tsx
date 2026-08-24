import type { Sichtfeld } from '@/drei/kamera'

/**
 * Der Schein, in dem ein 3D-Modell steht.
 *
 * **Warum die 3D-Steps ihn brauchen.** Zwölf Screens tragen ein Foto, das bis
 * an alle vier Kanten läuft. Fünf tragen ein 3D-Modell auf `#141210` — und weil
 * die Leinwand undurchsichtig ist (`alpha: false`), ist das ein einfarbiges
 * Rechteck mit einem Dachstuhl darin. Kein Boden, kein Raum, keine Lichtquelle,
 * die man sehen kann: das Modell schwebt, egal wie groß es ist.
 *
 * Der Schein liegt deshalb **über** der Leinwand — dahinter geht nichts — und
 * sitzt genau dort, wo das Modell steht: Mitte und Ausdehnung kommen aus
 * demselben `sichtfeld`, mit dem die Kamera einpasst. Zwei Lagen — ein warmer
 * Kegel in `screen`, der Hallenlicht andeutet, und eine Vignette in `multiply`,
 * die die Ecken schließt. Beide bewusst schwach: sie sollen einen Raum
 * behaupten, nicht das Holz einnebeln.
 *
 * Eigenes Modul und nicht in `Dachstuhl3D`: das trägt die Bundle-Regel („keine
 * Wert-Exporte neben der Default-Komponente“), und der Zuschnitt in M4 braucht
 * denselben Grund, ohne `three` zweimal zu ziehen.
 */
export function Hallenlicht({ sichtfeld }: { sichtfeld: Sichtfeld | undefined }) {
  const f = { links: 0, rechts: 0, oben: 0, unten: 0, ...sichtfeld }
  const x = ((f.links + (1 - f.rechts)) / 2) * 100
  const y = ((f.oben + (1 - f.unten)) / 2) * 100

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 mix-blend-screen"
        style={{
          background: `radial-gradient(60% 55% at ${x}% ${y}%, rgba(255,159,42,0.16), rgba(255,159,42,0.05) 45%, transparent 72%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 mix-blend-multiply"
        style={{
          background: `radial-gradient(85% 80% at ${x}% ${y}%, transparent 40%, rgba(8,7,6,0.55) 100%)`,
        }}
      />
    </>
  )
}
