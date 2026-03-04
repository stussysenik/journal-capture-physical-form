import * as THREE from 'three';

/**
 * 3-point lighting rig with purple underglow.
 *
 * Three-point lighting (key, fill, rim) is a cinematography standard:
 * - Key: main light source, strongest intensity
 * - Fill: softer light opposite the key, reduces harsh shadows
 * - Rim/back: behind the subject, creates edge separation from background
 * - Underglow: purple point light below the ground plane for stylistic atmosphere
 */
export class LightingRig {
  private lights: THREE.Light[] = [];

  constructor(scene: THREE.Scene) {
    // Key light — warm white, top-right
    const key = new THREE.DirectionalLight(0xfff0e0, 2.5);
    key.position.set(5, 8, 3);
    scene.add(key);
    this.lights.push(key);

    // Fill light — cool blue, left side, softer
    const fill = new THREE.DirectionalLight(0xc0d0ff, 1.0);
    fill.position.set(-4, 4, -2);
    scene.add(fill);
    this.lights.push(fill);

    // Rim light — behind and above, for edge definition
    const rim = new THREE.DirectionalLight(0xffffff, 1.5);
    rim.position.set(0, 6, -6);
    scene.add(rim);
    this.lights.push(rim);

    // Purple underglow — positioned below the ground plane
    // PointLight decays with distance (decay=2 is physically correct inverse-square)
    const underglow = new THREE.PointLight(0x9040ff, 8, 20, 2);
    underglow.position.set(0, -2, 0);
    scene.add(underglow);
    this.lights.push(underglow);

    // Subtle ambient to prevent pure-black shadows
    const ambient = new THREE.AmbientLight(0x201830, 0.5);
    scene.add(ambient);
    this.lights.push(ambient);
  }
}
