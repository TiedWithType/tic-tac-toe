import type { Player } from "../core/types";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export class AudioService {
  private audioContext: AudioContext | null = null;
  private muted = false;
  private audioWindow = window as AudioWindow;
  private introTimers: number[] = [];
  private introVoices = new Set<{
    gain: GainNode;
    oscillator: OscillatorNode;
  }>();

  constructor(audioContext: AudioContext | null = null) {
    this.audioContext = audioContext;
  }

  setMuted(nextMuted: boolean) {
    this.muted = nextMuted;
    this.muted && this.cancelIntro();
    !this.muted && this.resume();
  }

  playPlayerMove(player: Player) {
    this.cancelIntro();
    (player === "circle" ? this.playCircleMove : this.playCrossMove).call(this);
  }

  playDraw() {
    this.cancelIntro();
    this.playTone(330, 0.16, 0.05);
    window.setTimeout(() => this.playTone(330, 0.16, 0.045), 170);
    window.setTimeout(() => this.playTone(262, 0.24, 0.045), 360);
  }

  playWin() {
    this.cancelIntro();
    this.playFanfareRoyal();
  }

  playIntro() {
    if (this.muted) return Promise.resolve();

    this.cancelIntro();
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
    this.audioContext.state === "suspended" && void this.audioContext.resume();

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
    this.playTone(392, 0.12, 0.045, true);
    this.setIntroTimeout(() => this.playTone(523, 0.12, 0.05, true), 130);
    this.setIntroTimeout(() => this.playTone(659, 0.14, 0.052, true), 260);
    this.setIntroTimeout(() => this.playTone(784, 0.18, 0.055, true), 420);

    this.setIntroTimeout(() => {
      this.playTone(523, 0.28, 0.045, true);
      this.playTone(659, 0.28, 0.045, true);
      this.playTone(1046, 0.32, 0.052, true);
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

  private setIntroTimeout(callback: () => void, delay: number) {
    const timer = window.setTimeout(() => {
      this.introTimers = this.introTimers.filter((introTimer) => introTimer !== timer);
      callback();
    }, delay);

    this.introTimers.push(timer);
  }

  private cancelIntro() {
    this.introTimers.forEach((timer) => window.clearTimeout(timer));
    this.introTimers = [];

    this.introVoices.forEach(({ gain, oscillator }) => {
      const context = this.audioContext;

      if (!context) return;

      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setTargetAtTime(0.001, context.currentTime, 0.01);
      try {
        oscillator.stop(context.currentTime + 0.03);
      } catch {
        // The oscillator may already be stopped by its own duration.
      }
    });
    this.introVoices.clear();
  }

  private playTone(frequency: number, duration: number, volume: number, isIntro = false) {
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
    if (isIntro) {
      const voice = { gain, oscillator };
      this.introVoices.add(voice);
      oscillator.addEventListener("ended", () => this.introVoices.delete(voice), { once: true });
    }
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.stop(context.currentTime + duration);
  }
}
