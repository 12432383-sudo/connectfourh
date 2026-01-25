import { useCallback, useRef } from 'react';

type SoundType = 'drop' | 'win' | 'lose' | 'draw' | 'click' | 'hover';

export const useSoundEffects = (enabled: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3,
    delay: number = 0
  ) => {
    if (!enabled) return;

    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration);
  }, [enabled, getAudioContext]);

  const playDrop = useCallback(() => {
    if (!enabled) return;
    
    // Descending tone simulating disc falling
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);

    // Impact sound
    setTimeout(() => {
      playTone(150, 0.1, 'triangle', 0.4);
    }, 150);
  }, [enabled, getAudioContext, playTone]);

  const playWin = useCallback(() => {
    if (!enabled) return;

    // Victory fanfare - ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      playTone(freq, 0.3, 'sine', 0.25, i * 0.12);
    });

    // Final chord
    setTimeout(() => {
      playTone(523.25, 0.5, 'sine', 0.2);
      playTone(659.25, 0.5, 'sine', 0.2);
      playTone(783.99, 0.5, 'sine', 0.2);
    }, 500);
  }, [enabled, playTone]);

  const playLose = useCallback(() => {
    if (!enabled) return;

    // Descending sad tones
    const notes = [392, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
    notes.forEach((freq, i) => {
      playTone(freq, 0.25, 'triangle', 0.2, i * 0.15);
    });
  }, [enabled, playTone]);

  const playDraw = useCallback(() => {
    if (!enabled) return;

    // Neutral sound
    playTone(440, 0.15, 'sine', 0.2);
    playTone(440, 0.15, 'sine', 0.2, 0.2);
  }, [enabled, playTone]);

  const playClick = useCallback(() => {
    if (!enabled) return;
    playTone(800, 0.05, 'square', 0.1);
  }, [enabled, playTone]);

  const playHover = useCallback(() => {
    if (!enabled) return;
    playTone(600, 0.03, 'sine', 0.05);
  }, [enabled, playTone]);

  const playSound = useCallback((type: SoundType) => {
    switch (type) {
      case 'drop':
        playDrop();
        break;
      case 'win':
        playWin();
        break;
      case 'lose':
        playLose();
        break;
      case 'draw':
        playDraw();
        break;
      case 'click':
        playClick();
        break;
      case 'hover':
        playHover();
        break;
    }
  }, [playDrop, playWin, playLose, playDraw, playClick, playHover]);

  return { playSound };
};
