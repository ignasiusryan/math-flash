// Web Audio API sound effects - no external files needed

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Happy ascending two-tone chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    gain.connect(ctx.destination);
    osc1.connect(gain);
    osc2.connect(gain);

    osc1.type = "sine";
    osc2.type = "sine";

    // C5 then E5 - cheerful major third
    osc1.frequency.setValueAtTime(523, now);
    osc1.frequency.setValueAtTime(659, now + 0.12);

    osc2.frequency.setValueAtTime(659, now);
    osc2.frequency.setValueAtTime(784, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch {
    // Audio not available, silently ignore
  }
}

export function playWrongSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Gentle low buzz - not scary, just a "try again" nudge
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    gain.connect(ctx.destination);
    osc.connect(gain);

    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(180, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Audio not available, silently ignore
  }
}

export function playMilestoneSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Triumphant ascending arpeggio: C-E-G-C
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      osc.connect(gain);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.15, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  } catch {
    // Audio not available, silently ignore
  }
}
