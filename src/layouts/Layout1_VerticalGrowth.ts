import * as THREE from 'three';

/**
 * Layout 1 — Full Viewport with orbital camera.
 *
 * A single PerspectiveCamera slowly orbits around the Y axis, keeping all
 * columns in view. The camera maintains a fixed elevation and distance while
 * drifting at 0.15 rad/s.
 *
 * PerspectiveCamera FOV=55: wider than portrait (50) but narrower than
 * landscape-default (75). 55 keeps objects from looking distorted at edges
 * while still showing the full circular column arrangement.
 */
export class Layout1_VerticalGrowth {
  readonly camera: THREE.PerspectiveCamera;

  /** Orbital angle in radians, incremented each frame */
  private orbitAngle = 0;
  private readonly orbitSpeed = 0.15;   // rad/s
  private readonly orbitRadius = 8;
  private readonly orbitHeight = 3;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 100);
    this.updateCameraPosition();
  }

  /** Advance the orbital drift and update camera position */
  update(dt: number): void {
    this.orbitAngle += this.orbitSpeed * dt;
    this.updateCameraPosition();
  }

  /** Recompute aspect ratio on window resize */
  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  /** Get current orbit angle (used by transition to smoothly hand off) */
  get angle(): number {
    return this.orbitAngle;
  }

  private updateCameraPosition(): void {
    this.camera.position.set(
      Math.sin(this.orbitAngle) * this.orbitRadius,
      this.orbitHeight,
      Math.cos(this.orbitAngle) * this.orbitRadius
    );
    this.camera.lookAt(0, 1, 0);
  }
}
