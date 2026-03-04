import * as THREE from 'three';

/**
 * Layout 2 — Scissor-based Split View with two independent cameras.
 *
 * Scissor testing lets us render two different camera views into a single
 * WebGL context by restricting drawing to rectangular sub-regions:
 *
 *   renderer.setScissorTest(true)
 *   renderer.setScissor(x, y, w, h)     // clip pixels outside this rect
 *   renderer.setViewport(x, y, w, h)    // map NDC to this rect
 *   renderer.render(scene, cameraLeft)
 *   // repeat for right panel
 *
 * This avoids creating two WebGL contexts (browsers cap at ~8-16 contexts).
 *
 * Left panel: top-down orthographic-like view (high PerspectiveCamera looking down)
 * Right panel: close-up low-angle orbit
 */
export class Layout2_SplitView {
  readonly leftCamera: THREE.PerspectiveCamera;
  readonly rightCamera: THREE.PerspectiveCamera;

  private rightOrbitAngle = 0;
  private readonly rightOrbitSpeed = 0.25;
  private readonly rightOrbitRadius = 5;

  constructor(aspect: number) {
    // Left: top-down view
    // Position slightly off z-axis (0.01) so lookAt doesn't degenerate
    this.leftCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.leftCamera.position.set(0, 12, 0.01);
    this.leftCamera.lookAt(0, 0, 0);

    // Right: close-up low angle
    this.rightCamera = new THREE.PerspectiveCamera(65, aspect, 0.1, 100);
    this.updateRightCamera();
  }

  update(dt: number): void {
    this.rightOrbitAngle += this.rightOrbitSpeed * dt;
    this.updateRightCamera();
  }

  /** Update both cameras' aspect ratios based on panel width */
  resize(leftAspect: number, rightAspect: number): void {
    this.leftCamera.aspect = leftAspect;
    this.leftCamera.updateProjectionMatrix();
    this.rightCamera.aspect = rightAspect;
    this.rightCamera.updateProjectionMatrix();
  }

  private updateRightCamera(): void {
    this.rightCamera.position.set(
      Math.sin(this.rightOrbitAngle) * this.rightOrbitRadius,
      1.5,
      Math.cos(this.rightOrbitAngle) * this.rightOrbitRadius
    );
    this.rightCamera.lookAt(0, 1.5, 0);
  }
}
