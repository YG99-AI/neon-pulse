import { Controls } from './components/Sequencer/Controls'
import { Grid } from './components/Sequencer/Grid'
import { Scene } from './components/Visualizer/Scene'

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden text-white font-sans selection:bg-cyber-pink/30">
      {/* 3D Background */}
      <Scene />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 pointer-events-none">
        <div className="w-full max-w-6xl mx-auto pointer-events-auto pb-12">
          {/* Controls Panel */}
          <Controls />
          
          {/* Sequencer Grid */}
          <Grid />
        </div>
      </div>
      
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    </div>
  )
}

export default App
