/**
 * Minimal tween utilities — replaces GSAP for this project.
 *
 * Easing functions map a linear progress t ∈ [0,1] to a curved value.
 * This changes the *perceived speed* of animation without changing duration.
 *
 * - easeInOutCubic: slow start → fast middle → slow end (smooth transitions)
 * - easeOutExpo: fast start → very slow end (punchy entrances)
 * - lerp: linear interpolation between two values
 */

/** Linear interpolation: a + (b - a) * t */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Cubic ease in-out: starts slow, accelerates, then decelerates.
 * Math: piecewise cubic — 4t³ for first half, 1-(-2t+2)³/2 for second half
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Exponential ease out: starts fast, decelerates sharply.
 * Math: 1 - 2^(-10t) — approaches 1 asymptotically
 */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Quadratic ease in-out: gentler than cubic, good for subtle motions.
 */
export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Smooth damping — framerate-independent smooth interpolation.
 * Unlike lerp, this produces consistent motion regardless of delta time.
 *
 * smoothing: 0 = instant snap, higher = slower approach
 */
export function damp(current: number, target: number, smoothing: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-smoothing * dt));
}
