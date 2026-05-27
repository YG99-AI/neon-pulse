import { useAudioStore } from '../../store/useAudioStore'
import type { TrackId } from '../../store/useAudioStore'
import { Volume2, VolumeX, Mic2 } from 'lucide-react'
import clsx from 'clsx'

const TrackControl = ({ trackId }: { trackId: TrackId }) => {
  const track = useAudioStore(state => state.tracks[trackId])
  const toggleMute = useAudioStore(state => state.toggleTrackMute)
  const toggleSolo = useAudioStore(state => state.toggleTrackSolo)
  const setVolume = useAudioStore(state => state.setTrackVolume)

  return (
    <div className="flex items-center gap-4 w-48 shrink-0 glass-panel px-3 py-2 rounded-lg border-l-4" 
         style={{ borderLeftColor: `var(--color-cyber-${track.color.split('-')[2]})` }}>
      <span className="font-mono text-xs w-12 text-white/80">{track.name}</span>
      
      <div className="flex gap-1">
        <button 
          onClick={() => toggleMute(trackId)}
          className={clsx(
            "p-1 rounded text-xs transition-colors",
            track.mute ? "bg-red-500/20 text-red-400" : "hover:bg-white/10 text-white/50"
          )}
          title="Mute"
        >
          {track.mute ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <button 
          onClick={() => toggleSolo(trackId)}
          className={clsx(
            "p-1 rounded text-xs transition-colors",
            track.solo ? "bg-yellow-500/20 text-yellow-400" : "hover:bg-white/10 text-white/50"
          )}
          title="Solo"
        >
          <Mic2 size={14} />
        </button>
      </div>
      
      <input 
        type="range" 
        min="-60" 
        max="0" 
        value={track.volume}
        onChange={(e) => setVolume(trackId, parseFloat(e.target.value))}
        className="w-16 h-1 accent-cyber-neon"
      />
    </div>
  )
}

const StepGrid = ({ trackId }: { trackId: TrackId }) => {
  const track = useAudioStore(state => state.tracks[trackId])
  const currentStep = useAudioStore(state => state.currentStep)
  const toggleStep = useAudioStore(state => state.toggleStep)

  return (
    <div className="flex gap-1.5 flex-1 items-center">
      {track.steps.map((isActive, index) => {
        const isCurrent = currentStep === index
        const isQuarter = index % 4 === 0
        
        // Extract color name from class like 'bg-cyber-pink'
        const colorName = track.color.split('-')[2]
        const activeClass = isActive ? track.color : 'bg-cyber-grid'
        const glowClass = isActive ? `glow-${colorName}` : ''
        const currentBorderClass = isCurrent ? 'border-white/80 scale-110 z-10' : 'border-white/5'
        const quarterMarkerClass = isQuarter && !isActive ? 'bg-white/10' : ''

        return (
          <button
            key={index}
            onClick={() => toggleStep(trackId, index)}
            className={clsx(
              "h-10 flex-1 rounded-sm border transition-all duration-100",
              activeClass,
              glowClass,
              currentBorderClass,
              quarterMarkerClass,
              !isActive && "hover:bg-white/20"
            )}
          />
        )
      })}
    </div>
  )
}

export const Grid = () => {
  const tracks = useAudioStore(state => state.tracks)
  const trackIds = Object.keys(tracks) as TrackId[]

  return (
    <div className="flex flex-col gap-3 p-6 glass-panel rounded-xl w-full max-w-5xl mx-auto">
      {trackIds.map(trackId => (
        <div key={trackId} className="flex gap-4 w-full">
          <TrackControl trackId={trackId} />
          <StepGrid trackId={trackId} />
        </div>
      ))}
    </div>
  )
}
