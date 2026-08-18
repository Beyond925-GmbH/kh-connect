import { SZENE_FARBEN } from './bauteil-texte'

/**
 * Beleuchtung nach Bauplan 5.4. Genau ein schattenwerfendes Licht —
 * mehr kostet auf dem iPad spuerbar Bilder pro Sekunde und bringt nichts.
 */
export function Beleuchtung({ dunkel }: { dunkel: boolean }) {
  const farben = dunkel ? SZENE_FARBEN.dunkel : SZENE_FARBEN.hell

  return (
    <>
      <ambientLight intensity={dunkel ? 0.3 : 0.4} />
      <hemisphereLight
        args={[farben.himmel, farben.boden, dunkel ? 0.3 : 0.35]}
      />
      <directionalLight
        position={[7, 11, 5]}
        intensity={dunkel ? 1.1 : 1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0008}
      />
      <directionalLight position={[-6, 4, -7]} intensity={dunkel ? 0.35 : 0.45} />
    </>
  )
}
