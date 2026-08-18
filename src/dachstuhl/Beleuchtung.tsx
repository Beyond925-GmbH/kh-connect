import { SZENE_FARBEN } from './bauteil-texte'

/**
 * Beleuchtung nach Bauplan 5.4. Genau ein schattenwerfendes Licht —
 * mehr kostet auf dem iPad spuerbar Bilder pro Sekunde und bringt nichts.
 *
 * Die Schattenkamera ist eng auf die Huellkugel des Dachstuhls zugeschnitten
 * (Radius rund 8,5 m um den Ursprung). Zusammen mit `normalBias` verschwindet
 * damit das Streifenmuster (Shadow Acne) auf der Rohdecke und den Balken:
 * 2048 Pixel auf 17 m Kantenlaenge sind rund 120 Pixel je Meter.
 */
const SCHATTEN_RADIUS = 8.6

export function Beleuchtung({ dunkel }: { dunkel: boolean }) {
  const farben = dunkel ? SZENE_FARBEN.dunkel : SZENE_FARBEN.hell

  return (
    <>
      <ambientLight intensity={dunkel ? 0.3 : 0.4} />
      <hemisphereLight args={[farben.himmel, farben.boden, dunkel ? 0.3 : 0.35]} />
      <directionalLight
        position={[7, 11, 5]}
        intensity={dunkel ? 1.1 : 1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-SCHATTEN_RADIUS}
        shadow-camera-right={SCHATTEN_RADIUS}
        shadow-camera-top={SCHATTEN_RADIUS}
        shadow-camera-bottom={-SCHATTEN_RADIUS}
        // Abstand Licht -> Ursprung ist 13,96 m; die Huellkugel liegt also
        // vollstaendig zwischen 5 und 23.
        shadow-camera-near={5}
        shadow-camera-far={23}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-6, 4, -7]} intensity={dunkel ? 0.35 : 0.45} />
    </>
  )
}
