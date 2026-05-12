import { useCallback, useRef } from "react";

export default function useNotificationSound() {
  const audioCtxRef = useRef(null);

  const playChime = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 520;
      g.gain.value = 0.1;
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      o.start();
      o.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Web Audio API not available", e);
    }
  }, []);

  const vibrate = useCallback((pattern = [100, 50, 100]) => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      console.warn("Vibration not available", e);
    }
  }, []);

  return { playChime, vibrate };
}
