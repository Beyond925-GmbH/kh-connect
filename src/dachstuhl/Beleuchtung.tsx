import { SZENE_FARBEN } from './bauteil-texte'

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
 */
const SCHATTEN_RADIUS = 8.6

export function Beleuchtung({ dunkel }: { dunkel: boolean }) {
  const farben = dunkel ? SZENE_FARBEN.dunkel : SZENE_FARBEN.hell

  return (
    <>
      <ambientLight intensity={dunkel ? 0.55 : 0.4} />
      <hemisphereLight args={[farben.himmel, farben.boden, dunkel ? 0.6 : 0.35]} />
      <directionalLight
        position={[7, 11, 5]}
        intensity={dunkel ? 2.1 : 1.5}
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
      {/* Gegenlicht von hinten links. Im Dunkeln traegt es mehr als im Hellen:
          es zeichnet die Kanten der Sparren gegen den schwarzen Grund, sonst
          verschmilzt das Modell an seiner Silhouette damit. */}
      <directionalLight position={[-6, 4, -7]} intensity={dunkel ? 0.9 : 0.45} />
    </>
  )
}
