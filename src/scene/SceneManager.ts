import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * SceneManager owns the WebGLRenderer, Scene, Clock, and procedural environment map.
 *
 * Key Three.js concepts:
 * - PMREMGenerator: Pre-filtered Mipmapped Radiance Environment Map — converts an
 *   environment scene into a texture format optimized for PBR material reflections.
 * - ACESFilmicToneMapping: Maps HDR values to LDR display range using a film-industry
 *   standard curve, giving richer mid-tones and controlled highlights.
 * - Pixel ratio capped at 2: A 3x Retina display renders 9x the pixels of 1x for
 *   minimal perceptual gain. Capping at 2 keeps GPU load reasonable.
 */
export class SceneManager {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly clock: THREE.Clock;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });

    // Cinematic tone mapping + correct color space
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Cap pixel ratio at 2x for performance on 3x Retina displays
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#08060f');

    this.clock = new THREE.Clock();

    // Generate procedural environment map for realistic reflections
    // RoomEnvironment creates a simple box room with lights — gives PBR materials
    // something to reflect without needing to load an HDR file
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment()).texture;
    this.scene.environment = envTexture;
    pmremGenerator.dispose();

    this.handleResize();
  }

  /** Update renderer size to match the canvas's CSS dimensions */
  handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
  }

  get width(): number {
    return this.renderer.domElement.clientWidth;
  }

  get height(): number {
    return this.renderer.domElement.clientHeight;
  }
}
