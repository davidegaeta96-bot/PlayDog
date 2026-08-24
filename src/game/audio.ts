import { SOUNDS } from "./assets";

/**
 * Motore audio con due canali separati: MUSICA e SFX.
 * Rispetta in modo ferreo i volumi: a 0 nulla viene riprodotto.
 * Se SOUNDS.music / SOUNDS.shoot ... sono null usa suoni sintetizzati
 * provvisori (sostituibili con file .mp3/.wav nel registro assets).
 */

const MELODY = [
  330, 330, 392, 330, 294, 262, 294, 330, 392, 392, 440, 392, 330, 294, 262, 294,
  349, 349, 392, 440, 392, 349, 330, 294, 330, 392, 330, 294, 262, 262, 247, 262,
];
const NOTE_MS = 190;

class AudioEngine {
  musicVolume = 0.6;
  sfxVolume = 0.8;

  private ctx: AudioContext | null = null;
  private musicEl: HTMLAudioElement | null = null;
  private musicGain: GainNode | null = null;
  private timer: number | null = null;
  private noteIndex = 0;
  private wantMusic = false;

  private ensureCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  setMusicVolume(v: number) {
    this.musicVolume = v;
    if (this.musicEl) this.musicEl.volume = v;
    if (this.musicGain && this.ctx) this.musicGain.gain.value = v * 0.12;
    if (v <= 0) {
      this.hardStopMusicOutput();
    } else if (this.wantMusic) {
      this.startMusic(false);
    }
  }

  setSfxVolume(v: number) {
    this.sfxVolume = v;
  }

  /** Avvia la musica. fromStart=true riparte da 0:00. */
  startMusic(fromStart: boolean) {
    this.wantMusic = true;
    if (fromStart) this.noteIndex = 0;
    if (this.musicVolume <= 0) {
      this.hardStopMusicOutput();
      return;
    }
    if (SOUNDS.music) {
      if (!this.musicEl) {
        this.musicEl = new Audio(SOUNDS.music);
        this.musicEl.loop = true;
      }
      this.musicEl.volume = this.musicVolume;
      if (fromStart) this.musicEl.currentTime = 0;
      void this.musicEl.play().catch(() => {});
      return;
    }
    const ctx = this.ensureCtx();
    if (!ctx) return;
    if (!this.musicGain) {
      this.musicGain = ctx.createGain();
      this.musicGain.connect(ctx.destination);
    }
    this.musicGain.gain.value = this.musicVolume * 0.12;
    if (this.timer !== null) return;
    const tick = () => {
      if (this.musicVolume > 0 && this.wantMusic) {
        this.playNote(MELODY[this.noteIndex % MELODY.length] ?? 330);
        this.noteIndex++;
      }
    };
    tick();
    this.timer = window.setInterval(tick, NOTE_MS);
  }

  private playNote(freq: number) {
    const ctx = this.ctx;
    if (!ctx || !this.musicGain) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + NOTE_MS / 1000);
    osc.connect(g);
    g.connect(this.musicGain);
    osc.start();
    osc.stop(ctx.currentTime + NOTE_MS / 1000);
  }

  private hardStopMusicOutput() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (this.musicEl) this.musicEl.pause();
  }

  /** Pausa: conserva il punto esatto (per 'Continue'). */
  pauseMusic() {
    this.wantMusic = false;
    this.hardStopMusicOutput();
  }

  /** Stop completo + silenzio totale. */
  stopMusic() {
    this.wantMusic = false;
    this.hardStopMusicOutput();
    if (this.musicEl) this.musicEl.currentTime = 0;
  }

  resumeMusic() {
    this.startMusic(false);
  }

  playSfx(name: "shoot" | "explosion" | "bark") {
    if (this.sfxVolume <= 0) return;
    const url = SOUNDS[name];
    if (url) {
      const el = new Audio(url);
      el.volume = this.sfxVolume;
      void el.play().catch(() => {});
      return;
    }
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const g = ctx.createGain();
    g.connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.connect(g);
    if (name === "shoot") {
      osc.type = "square";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
      g.gain.setValueAtTime(this.sfxVolume * 0.18, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (name === "explosion") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
      g.gain.setValueAtTime(this.sfxVolume * 0.22, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.33);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.25);
      osc.frequency.linearRampToValueAtTime(240, now + 0.5);
      g.gain.setValueAtTime(this.sfxVolume * 0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.start(now);
      osc.stop(now + 1);
    }
  }
}

export const audio = new AudioEngine();