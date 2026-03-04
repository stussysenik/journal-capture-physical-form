import * as THREE from 'three';
import { createColumnMesh } from './ObjectFactory';
import { damp } from '../animation/Tween';

/**
 * A single column that grows/shrinks to a target height with smooth damping.
 *
 * Animation strategy:
 * - Height is animated via mesh.scale.y — this is a uniform update on the GPU,
 *   no geometry rebuild needed. The GPU just multiplies vertex Y by scale.y.
 * - A sine-wave "breathing" overlay adds organic life.
 * - Each column has its own random timing offset so they don't breathe in sync.
 * - Target height changes every 2-4 seconds to a random value.
 * - Slow Y-axis rotation gives constant subtle motion.
 *
 * The mesh pivot is at center, so we shift position.y = height/2 to keep
 * the base on the ground plane.
 */
export class GrowingColumn {
  readonly mesh: THREE.Mesh;

  private currentHeight = 0.1;
  private targetHeight: number;
  private breathOffset: number;
  private rotationSpeed: number;
  private nextTargetTime: number;

  /** Min/max height range for random target generation */
  private minHeight = 0.5;
  private maxHeight = 4.0;

  constructor(
    materialIndex: number,
    geometryIndex: number,
    position: THREE.Vector3
  ) {
    this.mesh = createColumnMesh(materialIndex, geometryIndex);
    this.mesh.position.copy(position);

    // Each column gets randomized timing for variety
    this.breathOffset = Math.random() * Math.PI * 2;
    this.rotationSpeed = (0.1 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -1);
    this.targetHeight = this.minHeight + Math.random() * (this.maxHeight - this.minHeight);
    this.nextTargetTime = 2 + Math.random() * 2;
  }

  /**
   * Update column animation. Call once per frame.
   *
   * @param elapsed - total elapsed time (for breathing sine wave)
   * @param dt - delta time this frame (for framerate-independent damping)
   */
  update(elapsed: number, dt: number): void {
    // Count down to next target height change
    this.nextTargetTime -= dt;
    if (this.nextTargetTime <= 0) {
      this.targetHeight = this.minHeight + Math.random() * (this.maxHeight - this.minHeight);
      this.nextTargetTime = 2 + Math.random() * 2; // 2-4 second interval
    }

    // Smooth damp toward target height (framerate-independent)
    // smoothing factor 4 gives a nice responsive-but-smooth feel
    this.currentHeight = damp(this.currentHeight, this.targetHeight, 4, dt);

    // Breathing overlay: small sine modulation for organic life
    const breathAmplitude = 0.15;
    const breathFrequency = 1.2;
    const breath = Math.sin(elapsed * breathFrequency + this.breathOffset) * breathAmplitude;

    const displayHeight = Math.max(0.1, this.currentHeight + breath);

    // Scale Y for height, keep base on ground plane
    this.mesh.scale.y = displayHeight;
    this.mesh.position.y = displayHeight / 2;

    // Slow rotation around Y axis
    this.mesh.rotation.y += this.rotationSpeed * dt;
  }
}

/**
 * Create 10 columns in a circular arrangement on the XZ plane.
 * Alternates between material/geometry styles for visual variety.
 */
export function createColumnCircle(scene: THREE.Scene): GrowingColumn[] {
  const columns: GrowingColumn[] = [];
  const count = 10;
  const radius = 3.5;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const column = new GrowingColumn(
      i % 4,         // cycle through 4 material styles
      i % 3,         // cycle through 3 geometry styles
      new THREE.Vector3(x, 0, z)
    );

    scene.add(column.mesh);
    columns.push(column);
  }

  return columns;
}
