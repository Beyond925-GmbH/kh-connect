import { useContext } from 'react'
import { HolzKontext, gewaehltesHolz } from './holz'

/** Die gleiche Brandmarke wandert vom ausgewählten Holz auf die fertige Wand. */
export function HolzMarke({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  gross = 1,
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  gross?: number
}) {
  const id = useContext(HolzKontext)
  if (!id) return null
  const holz = gewaehltesHolz(id)
  return (
    <group position={position} rotation={rotation} scale={gross}>
      <mesh>
        <boxGeometry args={[0.56, 0.3, 0.018]} />
        <meshBasicMaterial color="#F8ECD3" />
      </mesh>
      {Array.from({ length: holz.striche }, (_, i) => (
        <mesh
          key={i}
          position={[(i - (holz.striche - 1) / 2) * 0.14, 0, 0.012]}
          rotation={[0, 0, -0.18]}
        >
          <boxGeometry args={[0.06, 0.2, 0.014]} />
          <meshBasicMaterial color="#312516" />
        </mesh>
      ))}
    </group>
  )
}
