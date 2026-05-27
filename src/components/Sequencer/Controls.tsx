import { useAudioStore } from '../../store/useAudioStore'
import { audioEngine } from '../../audio/AudioEngine'
import { Play, Square } from 'lucide-react'
import clsx from 'clsx'

export const Controls = () => {
  const isPlaying = useAudioStore(state => state.isPlaying)
  const togglePlay = useAudioStore(state => state.togglePlay)
  const bpm = useAudioStore(state => state.bpm)
  const setBpm = useAudioStore(state => state.setBpm)
  const masterVolume = useAudioStore(state => state.masterVolume)
  const setMasterVolume = useAudioStore(state => state.setMasterVolume)
  
  // Initialize audio engine on first interaction
  const handlePlayToggle = async () => {
    await audioEngine.init()
    togglePlay()
  }
  
  const handleStop = () => {
    if (isPlaying) togglePlay()
    audioEngine.resetStep()
  }

  return (
    <div className="flex items-center justify-between p-4 glass-panel rounded-xl w-full max-w-5xl mx-auto mb-6">
      
      {/* Transport Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePlayToggle}
          className={clsx(
            "w-12 h-12 flex items-center justify-center rounded-full transition-all",
            isPlaying 
              ? "bg-cyber-neon text-black glow-neon" 
              : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          <Play size={20} className={clsx("ml-1", isPlaying && "animate-pulse")} fill="currentColor" />
        </button>
        
        <button
          onClick={handleStop}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <Square size={16} fill="currentColor" />
        </button>
      </div>
      
      {/* LED Display / Title */}
      <div className="flex flex-col items-center justify-center font-mono border border-white/10 px-8 py-2 rounded bg-black/50 shadow-inner">
        <h1 className="text-xl font-bold tracking-widest text-cyber-neon glow-neon mb-1" style={{ textShadow: '0 0 10px var(--color-cyber-neon)' }}>
          CYBER<span className="text-cyber-pink">BEAT</span>
        </h1>
        <div className="text-xs text-white/50 tracking-[0.2em]">WEB AUDIO SEQUENCER</div>
      </div>
      
      {/* Parameters */}
      <div className="flex items-center gap-6 font-mono text-sm">
        <div className="flex flex-col gap-1 items-end">
          <label className="text-white/50 text-xs">BPM</label>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="60" 
              max="200" 
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="w-24 h-1 accent-cyber-pink"
            />
            <span className="w-8 text-right text-cyber-pink glow-pink">{bpm}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-1 items-end">
          <label className="text-white/50 text-xs">MASTER VOL</label>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="-60" 
              max="0" 
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseInt(e.target.value))}
              className="w-24 h-1 accent-cyber-blue"
            />
            <span className="w-10 text-right text-cyber-blue glow-blue">{masterVolume}dB</span>
          </div>
        </div>
      </div>
      
    </div>
  )
}
