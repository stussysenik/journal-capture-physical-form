import * as THREE from 'three';

/**
 * Creates geometry + material combinations for columns.
 *
 * MeshPhysicalMaterial is Three.js's most advanced PBR material.
 * Key properties used:
 *
 * - transmission: light passes through (glass/resin effect). Requires
 *   thickness to control how much color is absorbed.
 * - iridescence: thin-film interference effect (soap bubble / oil slick colors).
 *   iridescenceIOR controls the film's refractive index.
 * - clearcoat: adds a second specular layer (car paint / lacquer effect).
 * - sheen: soft, velvet-like highlight at grazing angles.
 * - metalness + roughness: standard PBR — metalness=1 uses albedo as
 *   reflection color; roughness controls blur of reflections.
 */

export type MaterialStyle = 'glass' | 'metal' | 'resin' | 'ceramic';
export type GeometryStyle = 'box' | 'cylinder' | 'octahedron';

const MATERIAL_CONFIGS: Record<MaterialStyle, () => THREE.MeshPhysicalMaterial> = {
  /** Iridescent glass — highly transparent with rainbow thin-film effect */
  glass: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      thickness: 0.5,
      roughness: 0.05,
      iridescence: 1.0,
      iridescenceIOR: 1.3,
      ior: 1.5,
      transparent: true,
    }),

  /** Brushed dark metal — high metalness with clearcoat sheen */
  metal: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x222228,
      metalness: 0.95,
      roughness: 0.35,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
    }),

  /** Glowing purple resin — semi-transparent with warm sheen */
  resin: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x8030d0,
      transmission: 0.6,
      thickness: 1.0,
      roughness: 0.15,
      sheen: 0.8,
      sheenColor: new THREE.Color(0xff80ff),
      transparent: true,
    }),

  /** Warm ceramic matte — subtle clearcoat for a glazed feel */
  ceramic: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0xf0d0a0,
      roughness: 0.6,
      metalness: 0.0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
    }),
};

const GEOMETRY_FACTORIES: Record<GeometryStyle, (radius: number) => THREE.BufferGeometry> = {
  /** Box with slight bevel via segments (cheap approximation) */
  box: (r) => new THREE.BoxGeometry(r * 1.4, 1, r * 1.4, 2, 1, 2),

  /** Cylinder — the classic column shape */
  cylinder: (r) => new THREE.CylinderGeometry(r * 0.7, r * 0.8, 1, 16),

  /** Octahedron — faceted crystal look */
  octahedron: (r) => new THREE.OctahedronGeometry(r * 0.8, 0),
};

const MATERIAL_STYLES: MaterialStyle[] = ['glass', 'metal', 'resin', 'ceramic'];
const GEOMETRY_STYLES: GeometryStyle[] = ['box', 'cylinder', 'octahedron'];

/**
 * Create a mesh with a specific material + geometry combination.
 * The geometry has unit height — scale.y drives the visual height.
 */
export function createColumnMesh(
  materialIndex: number,
  geometryIndex: number,
  radius = 0.5
): THREE.Mesh {
  const matStyle = MATERIAL_STYLES[materialIndex % MATERIAL_STYLES.length];
  const geoStyle = GEOMETRY_STYLES[geometryIndex % GEOMETRY_STYLES.length];

  const geometry = GEOMETRY_FACTORIES[geoStyle](radius);
  const material = MATERIAL_CONFIGS[matStyle]();

  return new THREE.Mesh(geometry, material);
}
