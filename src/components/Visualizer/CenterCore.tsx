import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Icosahedron } from '@react-three/drei'
import * as THREE from 'three'
import { audioEngine } from '../../audio/AudioEngine'

export const CenterCore = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  const wireframeRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current || !wireframeRef.current) return

    // Base rotation
    const time = state.clock.getElapsedTime()
    meshRef.current.rotation.y = time * 0.2
    meshRef.current.rotation.x = time * 0.1
    
    wireframeRef.current.rotation.y = -time * 0.3
    wireframeRef.current.rotation.z = time * 0.2

    // Audio reactivity
    const data = audioEngine.getFftData()
    if (data.length > 0) {
      // Get bass frequencies (first few bins)
      let bassSum = 0
      for (let i = 0; i < 4; i++) {
        bassSum += Math.max(0, (Number(data[i]) + 100) / 100)
      }
      const bassAvg = bassSum / 4

      // Scale pulse
      const targetScale = 2 + bassAvg * 1.5
      
      // Smooth interpolation for scale
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.2)
      wireframeRef.current.scale.lerp(new THREE.Vector3(targetScale * 1.2, targetScale * 1.2, targetScale * 1.2), 0.2)
      
      // Material pulse
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 1 + bassAvg * 5
    }
  })

  return (
    <group position={[0, -2, 0]}>
      <Icosahedron ref={meshRef} args={[1, 1]} castShadow>
        <meshStandardMaterial
          color="#aa3bff"
          emissive="#aa3bff"
          emissiveIntensity={1}
          roughness={0.2}
          metalness={0.9}
        />
      </Icosahedron>
      
      <Icosahedron ref={wireframeRef} args={[1, 1]}>
        <meshBasicMaterial
          color="#0ea5e9"
          wireframe
          transparent
          opacity={0.3}
        />
      </Icosahedron>
    </group>
  )
}
