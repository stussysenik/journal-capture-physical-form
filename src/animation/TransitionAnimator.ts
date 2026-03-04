import { clamp, easeInOutCubic } from './Tween';

/**
 * Drives a 0→1 progress value for layout transitions.
 *
 * Supports mid-transition reversal: if the user presses spacebar during a
 * transition, it reverses from the current progress rather than snapping.
 *
 * The progress value is consumed by LayoutManager to interpolate camera
 * positions, scissor boundaries, and other per-frame layout parameters.
 */
export class TransitionAnimator {
  /** Raw linear progress 0→1 */
  private rawProgress = 0;
  /** Direction: 1 = forward (Layout1→Layout2), -1 = reverse */
  private direction = 0;
  /** Whether a transition is currently running */
  private active = false;

  /** Duration in seconds */
  readonly duration: number;

  constructor(duration = 1.2) {
    this.duration = duration;
  }

  /** Eased progress — apply easing curve to raw linear progress */
  get progress(): number {
    return easeInOutCubic(this.rawProgress);
  }

  /** Whether we're currently in Layout 2 (fully transitioned) */
  get isLayout2(): boolean {
    return this.rawProgress >= 1;
  }

  /** Whether we're currently in Layout 1 (no transition) */
  get isLayout1(): boolean {
    return this.rawProgress <= 0;
  }

  /** Whether a transition animation is playing */
  get isTransitioning(): boolean {
    return this.active;
  }

  /**
   * Toggle transition direction. If already transitioning, reverses mid-animation.
   * This is what happens when the user presses spacebar.
   */
  toggle(): void {
    if (this.active) {
      // Mid-transition reversal: flip direction from current position
      this.direction *= -1;
    } else {
      // Start new transition
      this.direction = this.rawProgress <= 0 ? 1 : -1;
      this.active = true;
    }
  }

  /** Advance the transition by dt seconds. Call once per frame. */
  update(dt: number): void {
    if (!this.active) return;

    const step = (dt / this.duration) * this.direction;
    this.rawProgress = clamp(this.rawProgress + step, 0, 1);

    // Check if transition completed
    if (this.rawProgress <= 0 || this.rawProgress >= 1) {
      this.rawProgress = clamp(this.rawProgress, 0, 1);
      this.active = false;
      this.direction = 0;
    }
  }
}
