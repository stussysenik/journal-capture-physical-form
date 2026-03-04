import * as THREE from 'three';
import { SceneManager } from './scene/SceneManager';
import { LightingRig } from './scene/LightingRig';
import { LayoutManager } from './layouts/LayoutManager';
import { createColumnCircle, GrowingColumn } from './objects/GrowingColumn';

/**
 * Entry point: wires together scene, lighting, objects, layout, and input.
 *
 * The render loop uses requestAnimationFrame for vsync-aligned rendering.
 * Clock.getDelta() gives framerate-independent dt for all animations.
 * Clock.getElapsedTime() gives total time for periodic effects (breathing).
 */

// -- Bootstrap --
const canvas = document.getElementById('viewport') as HTMLCanvasElement;
const sceneManager = new SceneManager(canvas);
new LightingRig(sceneManager.scene);

// -- Objects --
const columns: GrowingColumn[] = createColumnCircle(sceneManager.scene);

// -- Ground plane: subtle reflective floor --
const groundGeo = new THREE.CircleGeometry(6, 64);
const groundMat = new THREE.MeshPhysicalMaterial({
  color: 0x10101a,
  roughness: 0.4,
  metalness: 0.6,
  clearcoat: 0.5,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2; // lay flat on XZ plane
ground.position.y = 0.01;          // slightly above 0 to prevent z-fighting
sceneManager.scene.add(ground);

// -- Layout --
const layoutManager = new LayoutManager(sceneManager.width, sceneManager.height);

// -- Input --
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    layoutManager.toggle();
  }
});

// Click/tap also toggles layout
canvas.addEventListener('click', () => {
  layoutManager.toggle();
});

// -- Resize --
window.addEventListener('resize', () => {
  sceneManager.handleResize();
  layoutManager.resize(sceneManager.width, sceneManager.height);
});

// -- Render loop --
function animate(): void {
  requestAnimationFrame(animate);

  const dt = sceneManager.clock.getDelta();
  const elapsed = sceneManager.clock.getElapsedTime();

  // Update all columns (growth, breathing, rotation)
  for (const column of columns) {
    column.update(elapsed, dt);
  }

  // Update layout cameras and transition animation
  layoutManager.update(dt);

  // Render (handles scissor split internally)
  layoutManager.render(sceneManager.renderer, sceneManager.scene);
}

animate();
