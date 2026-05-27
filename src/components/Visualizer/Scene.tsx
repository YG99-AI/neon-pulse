import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { AudioBars } from './AudioBars'
import { CenterCore } from './CenterCore'

export const Scene = () => {
  return (
    <div className="absolute inset-0 -z-10 bg-cyber-bg pointer-events-none">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 15, 30]} fov={45} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.1} 
          autoRotate 
          autoRotateSpeed={0.5} 
        />

        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[10, 5, 10]} intensity={2} color="#0ea5e9" distance={50} />

        {/* Cyberpunk Grid Floor */}
        <Grid
          position={[0, -5, 0]}
          args={[100, 100]}
          cellSize={1}
          cellThickness={1}
          cellColor="#18181b"
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor="#aa3bff"
          fadeDistance={50}
          fadeStrength={1}
        />

        {/* Audio Reactive Elements */}
        <AudioBars />
        <CenterCore />

        {/* Post Processing Effects */}
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.5} 
            levels={8}
          />
          <ChromaticAberration 
            blendFunction={BlendFunction.NORMAL} 
            offset={[0.002, 0.002]} 
          />
          <Noise opacity={0.025} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
