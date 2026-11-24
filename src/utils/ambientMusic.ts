export interface AmbientTrack {
  id: string;
  name: string;
  subtitle: string;
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  { id: "soft-rain-piano", name: "Soft Rain & Piano", subtitle: "Gentle rain + warm keys" },
  { id: "late-night-lofi", name: "Late Night Lofi", subtitle: "Mellow seventh chords" },
  { id: "warm-coffee-shop", name: "Warm Coffee Shop", subtitle: "Cozy room murmur + chords" },
  { id: "midnight-breeze", name: "Midnight Breeze", subtitle: "Soft airy drone pads" },
  { id: "morning-sun", name: "Morning Sun", subtitle: "Light kalimba + warm tones" },
  { id: "chill-game-groove", name: "Chill Game Groove", subtitle: "Simple relaxing game loop" },
];

export const CHILL_GAME_TRACK_INDEX = AMBIENT_TRACKS.findIndex(
  (t) => t.id === "chill-game-groove"
);

/**
 * Pure Web Audio API ambient & chill game loop synthesizer.
 * Calibrated for subtle ~17% background listening with zero external MP3 dependencies.
 */
class AmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeSources: AudioScheduledSourceNode[] = [];
  private activeNodes: AudioNode[] = [];
  private timers: number[] = [];
  private isPlayingState = false;
  private volume = 0.17; // Subtle 15-20% default level
  private trackIndex = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume().catch(() => {
        // Browser may require user gesture before resuming
      });
    }
    return this.ctx;
  }

  public isAudioUnlocked(): boolean {
    return Boolean(this.ctx && this.ctx.state === "running");
  }

  public getIsPlaying(): boolean {
    return this.isPlayingState;
  }

  public getTrackIndex(): number {
    return this.trackIndex;
  }

  public getCurrentTrack(): AmbientTrack {
    return AMBIENT_TRACKS[this.trackIndex];
  }

  public setVolume(nextVolume: number) {
    this.volume = Math.max(0, Math.min(1, nextVolume));
    if (this.ctx && this.masterGain && this.isPlayingState) {
      this.masterGain.gain.setTargetAtTime(
        this.volume * 0.42,
        this.ctx.currentTime,
        0.15
      );
    }
  }

  public start(index: number = this.trackIndex): boolean {
    const normalizedIdx =
      ((index % AMBIENT_TRACKS.length) + AMBIENT_TRACKS.length) %
      AMBIENT_TRACKS.length;

    if (this.isPlayingState && this.trackIndex === normalizedIdx) {
      return true;
    }

    if (this.isPlayingState) {
      this.stopImmediate();
    }

    this.trackIndex = normalizedIdx;
    const ctx = this.ensureContext();
    if (!ctx) return false;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(
      Math.max(0.001, this.volume * 0.42),
      ctx.currentTime + 1.0
    );
    master.connect(ctx.destination);

    this.masterGain = master;
    this.isPlayingState = true;

    const track = AMBIENT_TRACKS[this.trackIndex];
    this.scheduleTrack(ctx, master, track.id);
    return true;
  }

  public nextTrack(): number {
    const nextIdx = (this.trackIndex + 1) % AMBIENT_TRACKS.length;
    this.trackIndex = nextIdx;
    if (this.isPlayingState) {
      this.start(nextIdx);
    }
    return nextIdx;
  }

  public prevTrack(): number {
    const prevIdx =
      (this.trackIndex - 1 + AMBIENT_TRACKS.length) % AMBIENT_TRACKS.length;
    this.trackIndex = prevIdx;
    if (this.isPlayingState) {
      this.start(prevIdx);
    }
    return prevIdx;
  }

  public stop(fadeSeconds = 0.55) {
    if (!this.isPlayingState && !this.masterGain) return;
    this.isPlayingState = false;
    this.clearTimers();

    const master = this.masterGain;
    const ctx = this.ctx;
    const sourcesToStop = [...this.activeSources];
    const nodesToDisconnect = [...this.activeNodes];

    this.activeSources = [];
    this.activeNodes = [];
    this.masterGain = null;

    if (ctx && master) {
      try {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(
          Math.max(0.0001, master.gain.value),
          ctx.currentTime
        );
        master.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + fadeSeconds
        );
      } catch {
        // Ignore ramp errors
      }
      window.setTimeout(() => {
        this.cleanupAudioNodes(sourcesToStop, nodesToDisconnect, master);
      }, Math.round(fadeSeconds * 1000) + 120);
    } else {
      this.cleanupAudioNodes(sourcesToStop, nodesToDisconnect, master);
    }
  }

  private stopImmediate() {
    this.isPlayingState = false;
    this.clearTimers();
    this.cleanupAudioNodes(
      this.activeSources,
      this.activeNodes,
      this.masterGain
    );
    this.activeSources = [];
    this.activeNodes = [];
    this.masterGain = null;
  }

  private clearTimers() {
    for (const id of this.timers) {
      window.clearInterval(id);
    }
    this.timers = [];
  }

  private cleanupAudioNodes(
    sources: AudioScheduledSourceNode[],
    nodes: AudioNode[],
    master: GainNode | null
  ) {
    for (const s of sources) {
      try {
        s.stop();
        s.disconnect();
      } catch {
        // Ignore already stopped
      }
    }
    for (const n of nodes) {
      try {
        n.disconnect();
      } catch {
        // Ignore
      }
    }
    if (master) {
      try {
        master.disconnect();
      } catch {
        // Ignore
      }
    }
  }

  private addFilteredNoiseLayer(
    ctx: AudioContext,
    master: GainNode,
    filterType: BiquadFilterType,
    frequency: number,
    q: number,
    gainLevel: number
  ) {
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.025 * white) / 1.025;
      lastOut = data[i];
      data[i] *= 2.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency, ctx.currentTime);
    filter.Q.setValueAtTime(q, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainLevel, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    noise.start();

    this.activeSources.push(noise);
    this.activeNodes.push(filter, gain);
  }

  private playChordLoop(
    ctx: AudioContext,
    master: GainNode,
    chords: number[][],
    intervalMs: number,
    cutoffHz: number,
    oscType: OscillatorType,
    attackSec: number,
    durationSec: number,
    peakGain: number
  ) {
    let idx = 0;
    const trigger = () => {
      if (!this.isPlayingState || this.masterGain !== master) return;
      const now = ctx.currentTime;
      const freqs = chords[idx % chords.length];
      idx++;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cutoffHz, now);
      filter.Q.setValueAtTime(0.6, now);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(peakGain, now + attackSec);
      env.gain.linearRampToValueAtTime(peakGain * 0.72, now + durationSec * 0.65);
      env.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      filter.connect(env);
      env.connect(master);

      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        osc.type = oscType;
        osc.frequency.setValueAtTime(f, now);
        osc.connect(filter);
        osc.start(now);
        osc.stop(now + durationSec + 0.1);
      });
    };

    trigger();
    const id = window.setInterval(trigger, intervalMs);
    this.timers.push(id);
  }

  private playMelodyNotes(
    ctx: AudioContext,
    master: GainNode,
    scale: number[],
    intervalMs: number,
    oscType: OscillatorType,
    decaySec: number,
    peakGain: number,
    chance = 0.8
  ) {
    const id = window.setInterval(() => {
      if (!this.isPlayingState || this.masterGain !== master) return;
      if (Math.random() > chance) return;
      const now = ctx.currentTime;
      const freq = scale[Math.floor(Math.random() * scale.length)];

      const osc = ctx.createOscillator();
      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, now);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1600, now);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(peakGain, now + 0.04);
      env.gain.exponentialRampToValueAtTime(0.0001, now + decaySec);

      osc.connect(filter);
      filter.connect(env);
      env.connect(master);
      osc.start(now);
      osc.stop(now + decaySec + 0.1);
    }, intervalMs);

    this.timers.push(id);
  }

  private scheduleTrack(ctx: AudioContext, master: GainNode, trackId: string) {
    switch (trackId) {
      case "soft-rain-piano": {
        this.addFilteredNoiseLayer(ctx, master, "bandpass", 820, 0.45, 0.2);
        this.playChordLoop(
          ctx,
          master,
          [
            [174.61, 220.0, 261.63, 329.63],
            [130.81, 196.0, 246.94, 329.63],
            [146.83, 220.0, 261.63, 349.23],
            [116.54, 174.61, 220.0, 293.66],
          ],
          4800,
          650,
          "sine",
          0.9,
          5.2,
          0.2
        );
        this.playMelodyNotes(
          ctx,
          master,
          [523.25, 587.33, 659.25, 698.46, 880.0],
          2600,
          "sine",
          2.4,
          0.085,
          0.75
        );
        break;
      }

      case "late-night-lofi": {
        this.addFilteredNoiseLayer(ctx, master, "lowpass", 420, 0.5, 0.08);
        this.playChordLoop(
          ctx,
          master,
          [
            [130.81, 196.0, 246.94, 293.66],
            [110.0, 164.81, 246.94, 261.63],
            [87.31, 174.61, 220.0, 261.63],
            [98.0, 196.0, 246.94, 329.63],
          ],
          4200,
          440,
          "triangle",
          0.45,
          4.5,
          0.16
        );
        this.playMelodyNotes(
          ctx,
          master,
          [392.0, 440.0, 493.88, 523.25, 659.25],
          2100,
          "sine",
          1.7,
          0.075,
          0.7
        );
        break;
      }

      case "warm-coffee-shop": {
        this.addFilteredNoiseLayer(ctx, master, "lowpass", 340, 0.35, 0.16);
        this.playChordLoop(
          ctx,
          master,
          [
            [196.0, 246.94, 293.66, 369.99],
            [164.81, 196.0, 246.94, 293.66],
            [130.81, 196.0, 246.94, 293.66],
            [146.83, 220.0, 246.94, 329.63],
          ],
          5000,
          560,
          "sine",
          1.2,
          5.6,
          0.18
        );
        this.playMelodyNotes(
          ctx,
          master,
          [493.88, 587.33, 659.25, 739.99, 783.99],
          3100,
          "triangle",
          1.9,
          0.055,
          0.65
        );
        break;
      }

      case "midnight-breeze": {
        this.addFilteredNoiseLayer(ctx, master, "bandpass", 520, 0.7, 0.12);
        this.playChordLoop(
          ctx,
          master,
          [
            [146.83, 220.0, 261.63, 329.63],
            [116.54, 174.61, 220.0, 293.66],
            [98.0, 174.61, 220.0, 293.66],
            [110.0, 164.81, 220.0, 293.66],
          ],
          6500,
          480,
          "sine",
          2.2,
          7.2,
          0.22
        );
        this.playMelodyNotes(
          ctx,
          master,
          [440.0, 523.25, 587.33, 659.25],
          4200,
          "sine",
          3.4,
          0.06,
          0.7
        );
        break;
      }

      case "chill-game-groove": {
        // Simple, gentle Nintendo-style cozy chill game arpeggio + warm pad
        this.playChordLoop(
          ctx,
          master,
          [
            [174.61, 261.63, 329.63], // Fmaj7
            [196.0, 246.94, 293.66],  // G6
            [164.81, 246.94, 329.63], // Em7
            [110.0, 196.0, 261.63],   // Am7
          ],
          3200,
          680,
          "sine",
          0.35,
          3.4,
          0.17
        );
        const pattern = [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 880.0, 783.99];
        let step = 0;
        const stepId = window.setInterval(() => {
          if (!this.isPlayingState || this.masterGain !== master) return;
          const now = ctx.currentTime;
          const freq = pattern[step % pattern.length];
          step++;

          const osc = ctx.createOscillator();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now);

          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(1100, now);

          const env = ctx.createGain();
          env.gain.setValueAtTime(0.0001, now);
          env.gain.linearRampToValueAtTime(0.065, now + 0.03);
          env.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

          osc.connect(filter);
          filter.connect(env);
          env.connect(master);
          osc.start(now);
          osc.stop(now + 0.95);
        }, 800);
        this.timers.push(stepId);
        break;
      }

      case "morning-sun":
      default: {
        this.playChordLoop(
          ctx,
          master,
          [
            [146.83, 220.0, 277.18, 329.63],
            [110.0, 164.81, 220.0, 246.94],
            [123.47, 185.0, 220.0, 293.66],
            [98.0, 196.0, 246.94, 369.99],
          ],
          4600,
          720,
          "sine",
          0.95,
          5.0,
          0.19
        );
        this.playMelodyNotes(
          ctx,
          master,
          [587.33, 659.25, 739.99, 880.0, 987.77],
          1900,
          "sine",
          1.8,
          0.08,
          0.8
        );
        break;
      }
    }
  }
}

export const ambientMusic = new AmbientMusicEngine();
