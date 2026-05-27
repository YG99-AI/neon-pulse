import * as Tone from 'tone'
import { useAudioStore } from '../store/useAudioStore'
import type { TrackId } from '../store/useAudioStore'

class AudioEngine {
  private static instance: AudioEngine
  private initialized = false
  
  // Core Audio Nodes
  private masterVolume!: Tone.Volume
  public analyser!: Tone.Analyser
  public fft!: Tone.FFT
  
  // Effects
  private reverb!: Tone.Reverb
  private delay!: Tone.FeedbackDelay
  
  // Instruments
  private kick!: Tone.MembraneSynth
  private snare!: Tone.NoiseSynth
  private hihat!: Tone.MetalSynth
  private synth!: Tone.PolySynth
  
  // Track Volumes
  private trackVolumes: Record<TrackId, Tone.Volume> = {} as any
  
  // State refs for the Transport loop
  private currentStep = 0
  
  private constructor() {}
  
  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }
  
  public async init() {
    if (this.initialized) return
    
    // Start Audio Context if suspended
    await Tone.start()
    
    // 1. Setup Master Chain & Analyzers
    this.masterVolume = new Tone.Volume(useAudioStore.getState().masterVolume).toDestination()
    this.analyser = new Tone.Analyser('waveform', 256)
    this.fft = new Tone.FFT(256)
    
    // Connect master to analyzers
    this.masterVolume.connect(this.analyser)
    this.masterVolume.connect(this.fft)
    
    // 2. Setup Effects
    this.reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 })
    this.delay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.4, wet: 0.2 })
    
    // 3. Setup Instruments & Routing
    this.setupInstruments()
    
    // 4. Setup Transport
    this.setupTransport()
    
    // 5. Subscribe to Zustand store for reactive changes
    this.subscribeToStore()
    
    this.initialized = true
    console.log("Audio Engine Initialized")
  }
  
  private setupInstruments() {
    // Kick
    this.trackVolumes.kick = new Tone.Volume(-6)
    this.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: "exponential" }
    }).connect(this.trackVolumes.kick)
    this.trackVolumes.kick.connect(this.masterVolume)
    
    // Snare
    this.trackVolumes.snare = new Tone.Volume(-6)
    this.snare = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
    }).connect(this.trackVolumes.snare)
    this.trackVolumes.snare.chain(this.reverb, this.masterVolume)
    
    // Hihat
    this.trackVolumes.hihat = new Tone.Volume(-12)
    this.hihat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).connect(this.trackVolumes.hihat)
    this.trackVolumes.hihat.connect(this.masterVolume)
    
    // Synth
    this.trackVolumes.synth = new Tone.Volume(-8)
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
    }).connect(this.trackVolumes.synth)
    this.trackVolumes.synth.chain(this.delay, this.reverb, this.masterVolume)
  }
  
  private setupTransport() {
    Tone.Transport.bpm.value = useAudioStore.getState().bpm
    
    // Schedule the sequencer loop (16th notes)
    Tone.Transport.scheduleRepeat((time) => {
      const state = useAudioStore.getState()
      const { tracks, isPlaying } = state
      
      if (!isPlaying) return
      
      // Update UI step
      // Using Tone.Draw ensures UI updates are synchronized with audio time
      Tone.Draw.schedule(() => {
        state.setCurrentStep(this.currentStep)
      }, time)
      
      // Play Kick
      if (tracks.kick.steps[this.currentStep] && !tracks.kick.mute) {
        this.kick.triggerAttackRelease("C1", "8n", time)
      }
      
      // Play Snare
      if (tracks.snare.steps[this.currentStep] && !tracks.snare.mute) {
        this.snare.triggerAttackRelease("16n", time)
      }
      
      // Play Hihat
      if (tracks.hihat.steps[this.currentStep] && !tracks.hihat.mute) {
        this.hihat.triggerAttackRelease("32n", time, 0.5)
      }
      
      // Play Synth (Cyberpunk style Bass/Arp)
      if (tracks.synth.steps[this.currentStep] && !tracks.synth.mute) {
        // Simple arp pattern based on step
        const notes = ["C2", "Eb2", "G2", "Bb2", "C3"]
        const note = notes[this.currentStep % notes.length]
        this.synth.triggerAttackRelease(note, "16n", time)
      }
      
      // Advance step
      this.currentStep = (this.currentStep + 1) % 16
    }, "16n")
  }
  
  private subscribeToStore() {
    // Subscribe to play/pause
    useAudioStore.subscribe((state, prevState) => {
      if (state.isPlaying !== prevState.isPlaying) {
        if (state.isPlaying) {
          Tone.Transport.start()
        } else {
          Tone.Transport.pause()
        }
      }
      
      // BPM changes
      if (state.bpm !== prevState.bpm) {
        Tone.Transport.bpm.rampTo(state.bpm, 0.1)
      }
      
      // Master Volume changes
      if (state.masterVolume !== prevState.masterVolume) {
        this.masterVolume.volume.rampTo(state.masterVolume, 0.1)
      }
      
      // Track Volumes
      ;(Object.keys(state.tracks) as TrackId[]).forEach(id => {
        if (state.tracks[id].volume !== prevState.tracks[id].volume) {
          this.trackVolumes[id].volume.rampTo(state.tracks[id].volume, 0.1)
        }
      })
    })
  }
  
  public resetStep() {
    this.currentStep = 0
    useAudioStore.getState().setCurrentStep(0)
  }
  
  public getFftData() {
    if (!this.initialized) return new Float32Array(0)
    return this.fft.getValue()
  }
  
  public getWaveformData() {
    if (!this.initialized) return new Float32Array(0)
    return this.analyser.getValue()
  }
}

export const audioEngine = AudioEngine.getInstance()
