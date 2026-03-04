import * as THREE from 'three';
import { Layout1_VerticalGrowth } from './Layout1_VerticalGrowth';
import { Layout2_SplitView } from './Layout2_SplitView';
import { TransitionAnimator } from '../animation/TransitionAnimator';
import { lerp } from '../animation/Tween';

/**
 * LayoutManager is the state machine that coordinates Layout1 ↔ Layout2.
 *
 * It owns both layouts, the TransitionAnimator, and the render() method
 * that decides how to draw each frame based on transition progress.
 *
 * Transition mechanics:
 * - splitPosition interpolates from 1.0 (full viewport) to 0.5 (50/50 split)
 * - At splitPosition=1.0, the left panel IS the full viewport (Layout1)
 * - At splitPosition=0.5, two equal halves
 * - The left camera interpolates between Layout1's orbital and Layout2's top-down
 * - The right panel's width grows from 0 → half viewport
 *
 * Scissor rendering pipeline per frame:
 * 1. Clear the full framebuffer once
 * 2. Set scissor + viewport for left panel, render with interpolated camera
 * 3. If right panel has width > 0, set scissor + viewport, render with right camera
 * 4. Disable scissor test
 */
export class LayoutManager {
  private layout1: Layout1_VerticalGrowth;
  private layout2: Layout2_SplitView;
  private animator: TransitionAnimator;

  /** Interpolated camera used during transitions for the left/main panel */
  private transitionCamera: THREE.PerspectiveCamera;

  constructor(width: number, height: number) {
    const aspect = width / height;
    this.layout1 = new Layout1_VerticalGrowth(aspect);
    this.layout2 = new Layout2_SplitView(aspect);
    this.animator = new TransitionAnimator(1.2);

    this.transitionCamera = new THREE.PerspectiveCamera(55, aspect, 0.1, 100);
  }

  /** Toggle between layouts. Supports mid-transition reversal. */
  toggle(): void {
    this.animator.toggle();
  }

  /** Handle window resize */
  resize(width: number, height: number): void {
    const aspect = width / height;
    this.layout1.resize(aspect);
    // Layout2 aspect gets recalculated per-frame based on split position
    this.layout2.resize(aspect, aspect);
  }

  /**
   * Update cameras and animation state.
   * Both layouts update every frame so their cameras stay "warm" —
   * prevents a visual pop when transitioning to Layout2.
   */
  update(dt: number): void {
    this.animator.update(dt);
    this.layout1.update(dt);
    this.layout2.update(dt);
  }

  /**
   * Render the current frame using scissor-based split rendering.
   *
   * The renderer's autoClear is disabled so we can manually clear once,
   * then render multiple viewports without clearing between them.
   */
  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;
    const progress = this.animator.progress;

    // splitPosition: 1.0 = full viewport, 0.5 = 50/50 split
    const splitPosition = lerp(1.0, 0.5, progress);
    const leftWidth = Math.floor(width * splitPosition);
    const rightWidth = width - leftWidth;

    // Interpolate left camera between Layout1 orbital and Layout2 top-down
    this.interpolateLeftCamera(progress, leftWidth / height);

    // Three.js setScissor/setViewport use CSS pixels — they internally
    // multiply by the renderer's pixel ratio, so we must NOT scale manually.
    renderer.setScissorTest(true);
    renderer.setScissor(0, 0, leftWidth, height);
    renderer.setViewport(0, 0, leftWidth, height);

    // Slightly different background tints for visual separation during split
    if (progress > 0.01) {
      scene.background = new THREE.Color('#0a0810');
    } else {
      scene.background = new THREE.Color('#08060f');
    }

    renderer.render(scene, this.transitionCamera);

    // -- Render right panel (only if it has visible width) --
    if (rightWidth > 1) {
      renderer.setScissor(leftWidth, 0, rightWidth, height);
      renderer.setViewport(leftWidth, 0, rightWidth, height);

      // Update right camera aspect for its actual panel width
      this.layout2.rightCamera.aspect = rightWidth / height;
      this.layout2.rightCamera.updateProjectionMatrix();

      scene.background = new THREE.Color('#0c0614');
      renderer.render(scene, this.layout2.rightCamera);
    }

    renderer.setScissorTest(false);

    // Reset background
    scene.background = new THREE.Color('#08060f');
  }

  /**
   * Interpolate the left/main camera between Layout1 and Layout2 positions.
   *
   * At progress=0: exactly Layout1's orbital camera
   * At progress=1: exactly Layout2's top-down camera
   * In between: smooth lerp of position, FOV, and lookAt target
   */
  private interpolateLeftCamera(progress: number, aspect: number): void {
    const cam1 = this.layout1.camera;
    const cam2 = this.layout2.leftCamera;

    // Lerp position
    this.transitionCamera.position.lerpVectors(cam1.position, cam2.position, progress);

    // Lerp FOV
    this.transitionCamera.fov = lerp(cam1.fov, cam2.fov, progress);

    // Lerp lookAt target: Layout1 looks at (0,1,0), Layout2 looks at (0,0,0)
    const lookTarget = new THREE.Vector3(0, lerp(1, 0, progress), 0);
    this.transitionCamera.lookAt(lookTarget);

    this.transitionCamera.aspect = aspect;
    this.transitionCamera.updateProjectionMatrix();
  }
}
