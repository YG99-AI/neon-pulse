import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { audioEngine } from '../../audio/AudioEngine'

export const AudioBars = () => {
  const count = 64
  const meshRef = useRef<THREE.InstancedMesh>(null)
  
  // Create geometry and material
  const geometry = useMemo(() => new THREE.BoxGeometry(0.5, 1, 0.5), [])
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#38bdf8'), // cyber-neon
      emissive: new THREE.Color('#38bdf8'),
      emissiveIntensity: 2,
      roughness: 0.2,
      metalness: 0.8,
    })
  }, [])

  // Initialize instances
  useMemo(() => {
    if (!meshRef.current) return
    const dummy = new THREE.Object3D()
    const radius = 15
    
    for (let i = 0; i < count; i++) {
      // Position in a circle
      const angle = (i / count) * Math.PI * 2
      dummy.position.x = Math.cos(angle) * radius
      dummy.position.z = Math.sin(angle) * radius
      
      // Look at center
      dummy.lookAt(0, 0, 0)
      
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [])

  // Animation loop
  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  useFrame(() => {
    if (!meshRef.current) return
    
    // Get FFT data (values are typically -100 to 0 dB)
    const data = audioEngine.getFftData()
    if (data.length === 0) return
    
    const radius = 15
    
    for (let i = 0; i < count; i++) {
      // Map instance index to FFT bin
      // Use lower half of FFT for better visuals
      const dataIndex = Math.floor((i / count) * (data.length / 2))
      const value = data[dataIndex] as number
      
      // Normalize value (approx -100 to 0 -> 0 to 1)
      const normalizedValue = Math.max(0, (value + 100) / 100)
      
      // Scale height based on audio
      const targetScale = 1 + normalizedValue * 20
      
      const angle = (i / count) * Math.PI * 2
      dummy.position.x = Math.cos(angle) * radius
      dummy.position.z = Math.sin(angle) * radius
      dummy.position.y = targetScale / 2 - 5 // Center vertically based on scale
      
      dummy.lookAt(0, dummy.position.y, 0)
      dummy.scale.set(1, targetScale, 1)
      
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      
      // Change color based on intensity
      const color = new THREE.Color()
      if (normalizedValue > 0.6) {
        color.set('#f43f5e') // cyber-pink for peaks
      } else if (normalizedValue > 0.3) {
        color.set('#8b5cf6') // cyber-purple for mids
      } else {
        color.set('#38bdf8') // cyber-neon for lows
      }
      meshRef.current.setColorAt(i, color)
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  )
}
