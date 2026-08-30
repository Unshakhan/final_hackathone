import confetti from "canvas-confetti";

export function celebrateSuccess() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const colors = ["#4f46e5", "#7c3aed", "#14b8a6", "#f59e0b"];
  const options = { particleCount: 34, spread: 52, startVelocity: 24, colors, disableForReducedMotion: true, zIndex: 1200 };
  confetti({ ...options, angle: 62, origin: { x: 0.38, y: 0.72 } });
  window.setTimeout(() => confetti({ ...options, particleCount: 24, angle: 118, origin: { x: 0.62, y: 0.72 } }), 180);
}
