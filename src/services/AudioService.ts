import type { Player } from "../core/types";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export class AudioService {
  private audioContext: AudioContext | null = null;
  private muted = false;
  private audioWindow = window as AudioWindow;

  constructor(audioContext: AudioContext | null = null) {
    this.audioContext = audioContext;
  }

  setMuted(nextMuted: boolean) {
    this.muted = nextMuted;

    if (!this.muted) this.resume();
  }

  playPlayerMove(player: Player) {
    if (player === "circle") {
      this.playCircleMove();
      return;
    }

    this.playCrossMove();
  }

  playDraw() {
    this.playTone(330, 0.16, 0.05);
    window.setTimeout(() => this.playTone(330, 0.16, 0.045), 170);
    window.setTimeout(() => this.playTone(262, 0.24, 0.045), 360);
  }

  playWin() {
    this.playFanfareRoyal();
  }

  playIntro() {
    if (this.muted) return Promise.resolve();

    this.playIntroTheme();
    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, 920);
    });
  }

  resume() {
    const AudioContextConstructor =
      this.audioWindow.AudioContext || this.audioWindow.webkitAudioContext;
    if (!AudioContextConstructor) return null;

    this.audioContext ||= new AudioContextConstructor();
    if (this.audioContext.state === "suspended") {
      void this.audioContext.resume();
    }

    return this.audioContext;
  }

  private playCircleMove() {
    this.playTone(523, 0.06, 0.04);
    window.setTimeout(() => this.playTone(659, 0.05, 0.035), 45);
  }

  private playCrossMove() {
    this.playTone(392, 0.06, 0.04);
    window.setTimeout(() => this.playTone(330, 0.06, 0.035), 55);
  }

  private playIntroTheme() {
    this.playTone(392, 0.12, 0.045);
    window.setTimeout(() => this.playTone(523, 0.12, 0.05), 130);
    window.setTimeout(() => this.playTone(659, 0.14, 0.052), 260);
    window.setTimeout(() => this.playTone(784, 0.18, 0.055), 420);

    window.setTimeout(() => {
      this.playTone(523, 0.28, 0.045);
      this.playTone(659, 0.28, 0.045);
      this.playTone(1046, 0.32, 0.052);
    }, 620);
  }

  private playFanfareRoyal() {
    this.playTone(523, 0.25, 0.05);
    this.playTone(659, 0.25, 0.05);
    this.playTone(784, 0.25, 0.05);

    window.setTimeout(() => this.playTone(880, 0.18, 0.05), 260);
    window.setTimeout(() => this.playTone(988, 0.2, 0.05), 420);
    window.setTimeout(() => this.playTone(1046, 0.22, 0.05), 600);

    window.setTimeout(() => {
      this.playTone(1046, 0.35, 0.06);
      this.playTone(1318, 0.35, 0.06);
      this.playTone(1568, 0.35, 0.06);
    }, 850);
  }

  private playTone(frequency: number, duration: number, volume: number) {
    if (this.muted) return;

    const context = this.resume();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.stop(context.currentTime + duration);
  }
}
