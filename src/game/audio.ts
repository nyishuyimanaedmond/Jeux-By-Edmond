import type { GameSettings } from "./types";

type MusicTrack = "menu" | "race" | "victory" | "gameover";

interface ActiveSound {
  stop: () => void;
  setVolume: (v: number) => void;
}

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private settings: GameSettings;
  private currentMusic: ActiveSound | null = null;
  private engineSound: ActiveSound | null = null;
  private initialized = false;

  constructor(settings: GameSettings) {
    this.settings = settings;
  }

  init(): void {
    if (this.initialized) return;
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this.updateVolumes();
      this.initialized = true;
    } catch {
      this.ctx = null;
    }
  }

  resume(): void {
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  updateSettings(settings: GameSettings): void {
    this.settings = settings;
    this.updateVolumes();
  }

  private updateVolumes(): void {
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.sfxGain) return;
    const musicVol = this.settings.musicEnabled ? this.settings.musicVolume : 0;
    const sfxVol = this.settings.sfxEnabled ? this.settings.sfxVolume : 0;
    this.musicGain.gain.setTargetAtTime(musicVol, this.ctx.currentTime, 0.1);
    this.sfxGain.gain.setTargetAtTime(sfxVol, this.ctx.currentTime, 0.1);
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.3,
    target?: GainNode,
  ): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(target || this.sfxGain || this.masterGain!);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  playSfx(type: "click" | "crash" | "brake" | "unlock" | "win" | "lose" | "select"): void {
    if (!this.ctx || !this.settings.sfxEnabled) return;
    switch (type) {
      case "click":
        this.playTone(800, 0.06, "square", 0.15);
        break;
      case "select":
        this.playTone(600, 0.08, "triangle", 0.2);
        setTimeout(() => this.playTone(900, 0.08, "triangle", 0.2), 60);
        break;
      case "brake":
        this.playTone(200, 0.15, "sawtooth", 0.12);
        break;
      case "crash": {
        if (!this.ctx) return;
        const noise = this.createNoise(0.3);
        if (!noise) return;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain!);
        noise.start();
        noise.stop(this.ctx.currentTime + 0.3);
        break;
      }
      case "unlock":
        this.playTone(523, 0.1, "triangle", 0.25);
        setTimeout(() => this.playTone(659, 0.1, "triangle", 0.25), 100);
        setTimeout(() => this.playTone(784, 0.2, "triangle", 0.25), 200);
        break;
      case "win": {
        const notes = [523, 659, 784, 1047];
        notes.forEach((n, i) => setTimeout(() => this.playTone(n, 0.3, "triangle", 0.25), i * 120));
        break;
      }
      case "lose": {
        const notes = [400, 350, 300, 200];
        notes.forEach((n, i) => setTimeout(() => this.playTone(n, 0.3, "sawtooth", 0.2), i * 150));
        break;
      }
    }
  }

  private createNoise(duration: number): AudioBufferSourceNode | null {
    if (!this.ctx) return null;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  private startMusic(track: MusicTrack): void {
    if (!this.ctx || !this.musicGain) return;
    this.stopMusic();

    const baseFreqs: Record<MusicTrack, number[]> = {
      menu: [261, 329, 392, 523],
      race: [330, 392, 440, 523],
      victory: [392, 494, 587, 784],
      gameover: [220, 277, 329, 392],
    };
    const tempos: Record<MusicTrack, number> = {
      menu: 500,
      race: 280,
      victory: 350,
      gameover: 600,
    };
    const freqs = baseFreqs[track];
    const tempo = tempos[track];

    let beat = 0;
    let running = true;

    const playBeat = () => {
      if (!running || !this.ctx || !this.musicGain) return;
      const noteIndex = beat % freqs.length;
      const freq = freqs[noteIndex];
      const bassFreq = freq * 0.25;

      // Melody note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = track === "race" ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + tempo / 1000 * 0.8);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start();
      osc.stop(this.ctx.currentTime + tempo / 1000);

      // Bass note every 2 beats
      if (beat % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = "sine";
        bassOsc.frequency.setValueAtTime(bassFreq, this.ctx.currentTime);
        bassGain.gain.setValueAtTime(0, this.ctx.currentTime);
        bassGain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.05);
        bassGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + tempo / 1000 * 1.5);
        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start();
        bassOsc.stop(this.ctx.currentTime + tempo / 1000 * 1.5);
      }

      beat++;
    };

    const interval = setInterval(playBeat, tempo);
    playBeat();

    this.currentMusic = {
      stop: () => {
        running = false;
        clearInterval(interval);
      },
      setVolume: () => {},
    };
  }

  playMusic(track: MusicTrack): void {
    if (!this.ctx || !this.settings.musicEnabled) return;
    this.startMusic(track);
  }

  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  startEngineSound(): void {
    if (!this.ctx || !this.sfxGain || this.engineSound) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.disconnect();
    osc.connect(filter);
    filter.connect(gain);

    this.engineSound = {
      stop: () => {
        if (!this.ctx) return;
        gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
        setTimeout(() => {
          try { osc.stop(); } catch { /* ignore */ }
        }, 200);
      },
      setVolume: (v: number) => {
        if (this.ctx) gain.gain.setTargetAtTime(v * 0.08, this.ctx.currentTime, 0.1);
      },
    };
  }

  updateEngine(speedRatio: number): void {
    if (!this.ctx || !this.engineSound) return;
    const freq = 60 + speedRatio * 200;
    const osc = this.engineSound as unknown as { _osc?: OscillatorNode };
    void osc;
    // We can't directly access osc here, so we use a workaround:
    // The engine sound is managed via the gain node frequency
    // Actually let's store the oscillator
    this.engineSoundFrequency = freq;
    this.engineSoundVolume = Math.min(0.08, speedRatio * 0.08 + 0.02);
    this.engineSound.setVolume(speedRatio);
  }

  private engineSoundFrequency = 80;
  private engineSoundVolume = 0.05;

  stopEngineSound(): void {
    if (this.engineSound) {
      this.engineSound.stop();
      this.engineSound = null;
    }
  }

  dispose(): void {
    this.stopMusic();
    this.stopEngineSound();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
  }
}

let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(settings: GameSettings): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager(settings);
  }
  return audioManagerInstance;
}
