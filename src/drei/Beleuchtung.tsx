import { useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { SZENE_FARBEN } from '@/dachstuhl/bauteil-texte'

/**
 * Beleuchtung nach Bauplan 5.4. Genau ein schattenwerfendes Licht —
 * mehr kostet auf dem iPad spuerbar Bilder pro Sekunde und bringt nichts.
 *
 * Die Schattenkamera ist eng auf die Huellkugel des Dachstuhls zugeschnitten
 * (Radius rund 8,5 m um den Ursprung). Zusammen mit `normalBias` verschwindet
 * damit das Streifenmuster (Shadow Acne) auf der Rohdecke und den Balken:
 * 2048 Pixel auf 17 m Kantenlaenge sind rund 120 Pixel je Meter.
 *
 * **Der Dunkel-Zweig ist seit dem Umbau auf „Baustelle“ kein Nachtmodus mehr,
 * sondern der Normalfall.** Er war urspruenglich dafuer gebaut, dass die ganze
 * Seite dunkel ist und die Szene sich einfuegt — und damit gedaempft. Jetzt ist
 * die Szene die Buehne und muss auf schwarzem Grund *leuchten*, nicht
 * verschwinden. Die Lichtstaerken liegen deshalb ueber denen des Hell-Zweigs:
 * dunkler Grund, hell angestrahltes Modell, wie ein Werkstueck unter der Lampe.
 *
 * `stimmung = 'mittag'` (M6): die Sonne steht steiler und neutralwarm — die
 * Mittagspause am halb errichteten Dachstuhl. Der Grund bleibt Token-dunkel,
 * nur das Licht auf dem Holz wird waermer und haerter. Schattenkamera
 * unveraendert 8,6 m.
 */
const SCHATTEN_RADIUS = 8.6

export type Lichtstimmung = 'standard' | 'mittag'

export function Beleuchtung({
  dunkel,
  stimmung = 'standard',
}: {
  dunkel: boolean
  stimmung?: Lichtstimmung
}) {
  const farben = dunkel ? SZENE_FARBEN.dunkel : SZENE_FARBEN.hell
  const mittag = stimmung === 'mittag'

  return (
    <>
      {/* Die erste Mittag-Fassung (#FFF2DC bei 2,4) war neben M5 kaum zu
          unterscheiden — der Tagesbogen M5→M6→M8 hatte damit keine Mitte.
          Jetzt ist auch das Streulicht warm getönt und die Sonne satter:
          das Holz liegt sichtbar in der Mittagssonne, der Grund bleibt
          Token-dunkel. */}
      <ambientLight
        color={mittag ? '#FFE3C0' : '#FFFFFF'}
        intensity={dunkel ? (mittag ? 0.6 : 0.55) : 0.4}
      />
      <hemisphereLight
        args={[
          mittag ? '#F2BE85' : farben.himmel,
          farben.boden,
          dunkel ? (mittag ? 0.85 : 0.6) : 0.35,
        ]}
      />
      <directionalLight
        position={mittag ? [3, 14, 4] : [7, 11, 5]}
        color={mittag ? '#FFDFA8' : '#FFFFFF'}
        intensity={mittag ? 2.7 : dunkel ? 2.1 : 1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-SCHATTEN_RADIUS}
        shadow-camera-right={SCHATTEN_RADIUS}
        shadow-camera-top={SCHATTEN_RADIUS}
        shadow-camera-bottom={-SCHATTEN_RADIUS}
        // Abstand Licht -> Ursprung ist 13,96 m (Mittag: 15,04 m); die
        // Huellkugel liegt in beiden Faellen vollstaendig zwischen 5 und 23.
        shadow-camera-near={5}
        shadow-camera-far={23}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      />
      {/* Gegenlicht von hinten links. Im Dunkeln traegt es mehr als im Hellen:
          es zeichnet die Kanten der Sparren gegen den schwarzen Grund, sonst
          verschmilzt das Modell an seiner Silhouette damit. */}
      <directionalLight position={[-6, 4, -7]} intensity={dunkel ? 0.9 : 0.45} />
    </>
  )
}

/**
 * Perf 5.2: Die Schattenkarte wird nur neu gezeichnet, wenn sich das Modell
 * wirklich aendert — beim reinen Orbit um ein stehendes Modell (B3.2, der
 * haeufigste Zustand am Stand) ist sie eingefroren.
 *
 * Voraussetzung: `gl.shadowMap.autoUpdate = false` in `Szene.onCreated`.
 * Gelesen werden bis zu zwei Refs (Aufbau-Fortschritt und optional die
 * Fahrt); aendert sich einer, wird genau ein Update angefordert. Das Gespann
 * selbst wirft keine echten Schatten (Kontaktschatten-Quads) — der zweite Ref
 * ist die Sicherung, falls doch einmal etwas an ihm haengt.
 */
export function Schattenauffrischung({
  fortschrittRef,
  extraRef,
}: {
  fortschrittRef: RefObject<number>
  extraRef?: RefObject<number> | null
}) {
  const letzte = useRef<{ a: number; b: number }>({ a: NaN, b: NaN })
  useFrame(({ gl }) => {
    const a = fortschrittRef.current
    const b = extraRef?.current ?? 0
    if (a !== letzte.current.a || b !== letzte.current.b) {
      letzte.current = { a, b }
      gl.shadowMap.needsUpdate = true
    }
  })
  return null
}
