import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { CarConfigState } from '../types';

export interface ImportedModelStats {
  name: string;
  source: string;
  polygons: number;
  vertices: number;
  meshes: number;
  fileSize?: string;
}

export interface ImportedModelInstance {
  root: THREE.Group;
  stats: ImportedModelStats;
  bodyMaterials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[];
  updateConfig: (config: CarConfigState) => void;
  updateAnimations: (delta: number, config: CarConfigState) => void;
}

/**
 * Normalizes an imported 3D model:
 * - Centers it on X and Z
 * - Places lowest Y vertex at Y = 0 (ground level)
 * - Scales model so longest dimension matches realistic car size (~4.8 units)
 */
export function normalizeModelTransform(group: THREE.Group, targetLength: number = 4.8): void {
  const box = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  box.getSize(size);

  const center = new THREE.Vector3();
  box.getCenter(center);

  // Center on X and Z, align bottom to Y = 0
  group.position.x -= center.x;
  group.position.y -= box.min.y;
  group.position.z -= center.z;

  // Scale if oversized or tiny
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0.001) {
    const scaleFactor = targetLength / Math.max(size.x, size.z);
    group.scale.setScalar(scaleFactor);

    // Re-adjust floor alignment after scale
    const newBox = new THREE.Box3().setFromObject(group);
    group.position.y -= newBox.min.y;
  }
}

/**
 * Inspects loaded meshes, gathers statistics and prepares materials
 */
export function processImportedModel(
  object: THREE.Object3D,
  fileName: string,
  config: CarConfigState,
  fileSizeStr?: string
): ImportedModelInstance {
  const root = new THREE.Group();
  root.name = 'CadNav_Imported_Car_Model';

  let totalPolygons = 0;
  let totalVertices = 0;
  let meshCount = 0;
  const bodyMaterials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];

  // Create shared high-fidelity paint material for imported car body
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(config.paintColor),
    metalness: config.paintFinish === 'metallic' ? 0.9 : config.paintFinish === 'gloss' ? 0.2 : 0.4,
    roughness: config.paintFinish === 'frozen' ? 0.45 : config.paintFinish === 'matte' ? 0.75 : 0.12,
    clearcoat: config.paintFinish === 'gloss' || config.paintFinish === 'metallic' ? 1.0 : 0.0,
    clearcoatRoughness: 0.1,
    reflectivity: 0.9,
  });
  bodyMaterials.push(bodyMat);

  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      meshCount++;

      const geo = mesh.geometry;
      if (geo) {
        if (geo.index) {
          totalPolygons += geo.index.count / 3;
        } else if (geo.attributes.position) {
          totalPolygons += geo.attributes.position.count / 3;
        }
        if (geo.attributes.position) {
          totalVertices += geo.attributes.position.count;
        }

        // Compute smooth vertex normals for pristine, smooth 3D surface shading
        geo.computeVertexNormals();
      }

      // If mesh has basic or default materials, enhance with standard PBR material
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if ('flatShading' in m) {
            (m as any).flatShading = false;
            m.needsUpdate = true;
          }
        });
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((mat) => {
            const std = new THREE.MeshStandardMaterial({
              color: (mat as any).color ? (mat as any).color : 0x222222,
              metalness: 0.6,
              roughness: 0.3,
            });
            bodyMaterials.push(std);
            return std;
          });
        } else {
          // Detect if it might be a body panel or glass
          const matName = (mesh.material.name || mesh.name || '').toLowerCase();
          if (matName.includes('glass') || matName.includes('window')) {
            mesh.material = new THREE.MeshPhysicalMaterial({
              color: 0x111827,
              metalness: 0.1,
              roughness: 0.05,
              transmission: 0.85,
              transparent: true,
              opacity: 0.45,
            });
          } else if (matName.includes('tire') || matName.includes('wheel') || matName.includes('rubber')) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x18181b,
              roughness: 0.85,
              metalness: 0.1,
            });
          } else {
            // Apply customizable body material
            mesh.material = bodyMat;
          }
        }
      } else {
        mesh.material = bodyMat;
      }
    }
  });

  root.add(object);
  normalizeModelTransform(root);

  const stats: ImportedModelStats = {
    name: fileName.replace(/\.[^/.]+$/, ''),
    source: 'CadNav 3D Library (cadnav.com)',
    polygons: Math.round(totalPolygons),
    vertices: Math.round(totalVertices),
    meshes: meshCount,
    fileSize: fileSizeStr,
  };

  const updateConfig = (newConfig: CarConfigState) => {
    const col = new THREE.Color(newConfig.paintColor);
    bodyMaterials.forEach((mat) => {
      mat.color.copy(col);
      if ('clearcoat' in mat) {
        if (newConfig.paintFinish === 'gloss') {
          mat.metalness = 0.25;
          mat.roughness = 0.12;
          mat.clearcoat = 1.0;
        } else if (newConfig.paintFinish === 'metallic') {
          mat.metalness = 0.92;
          mat.roughness = 0.16;
          mat.clearcoat = 1.0;
        } else if (newConfig.paintFinish === 'frozen') {
          mat.metalness = 0.55;
          mat.roughness = 0.42;
          mat.clearcoat = 0.2;
        } else {
          mat.metalness = 0.1;
          mat.roughness = 0.78;
          mat.clearcoat = 0.0;
        }
      }
    });
  };

  const updateAnimations = (delta: number, newConfig: CarConfigState) => {
    // Subtle idle vibration if engine audio is active
    if (newConfig.exhaustSound) {
      root.position.y = Math.sin(Date.now() * 0.04) * 0.0015;
    }
  };

  return {
    root,
    stats,
    bodyMaterials,
    updateConfig,
    updateAnimations,
  };
}

/**
 * Loads a 3D model from a File or ArrayBuffer
 */
export async function loadModelFromFile(file: File, config: CarConfigState): Promise<ImportedModelInstance> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

  // 1. Wavefront OBJ (.obj)
  if (extension === 'obj') {
    const text = await file.text();
    const loader = new OBJLoader();
    const obj = loader.parse(text);
    return processImportedModel(obj, file.name, config, fileSizeMb);
  }

  // 2. GLTF / GLB (.gltf, .glb)
  if (extension === 'gltf' || extension === 'glb') {
    const buffer = await file.arrayBuffer();
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.parse(
        buffer,
        '',
        (gltf) => {
          resolve(processImportedModel(gltf.scene || gltf.scenes[0], file.name, config, fileSizeMb));
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  // 3. STL 3D Mesh (.stl)
  if (extension === 'stl') {
    const buffer = await file.arrayBuffer();
    const loader = new STLLoader();
    const geometry = loader.parse(buffer);
    const mesh = new THREE.Mesh(geometry);
    const group = new THREE.Group();
    group.add(mesh);
    return processImportedModel(group, file.name, config, fileSizeMb);
  }

  // 4. Text (.txt) or JSON (.json) files
  // Users or CadNav downloads often have OBJ geometry saved as .txt or Three.js Object3D JSON
  if (extension === 'txt' || extension === 'json') {
    const text = await file.text();
    const trimmed = text.trim();

    // Check if it's JSON 3D geometry / scene
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const json = JSON.parse(trimmed);
        const objLoader = new THREE.ObjectLoader();
        const loadedObj = objLoader.parse(json);
        return processImportedModel(loadedObj, file.name, config, fileSizeMb);
      } catch {
        // Not a Three.js JSON scene, check if it's a glTF JSON
        try {
          const loader = new GLTFLoader();
          const buffer = new TextEncoder().encode(trimmed).buffer;
          return await new Promise<ImportedModelInstance>((resolve, reject) => {
            loader.parse(
              buffer,
              '',
              (gltf) => resolve(processImportedModel(gltf.scene || gltf.scenes[0], file.name, config, fileSizeMb)),
              reject
            );
          });
        } catch {
          // fall through to OBJ check
        }
      }
    }

    // Check if text file contains Wavefront OBJ directives (v, vn, vt, f, usemtl, etc.)
    const hasObjGeometry = /^[ \t]*(v|vn|vt|f|usemtl|mtllib|o|g)[ \t]+/m.test(text);
    if (hasObjGeometry) {
      const loader = new OBJLoader();
      const obj = loader.parse(text);
      return processImportedModel(obj, file.name, config, fileSizeMb);
    }

    // Otherwise, this is a plain text file (e.g. readme.txt, instructions.txt from a CadNav zip)
    throw new Error(
      `"${file.name}" is a text file, not a 3D model. Please select or drag your 3D car file (.obj, .gltf, .glb, or .stl).`
    );
  }

  throw new Error(
    `Unsupported 3D file format .${extension}. Supported formats: .obj, .gltf, .glb, .stl (or .txt with OBJ geometry)`
  );
}

/**
 * Generates an iconic CadNav-style high-polygon GT3 Competition chassis preset
 * so users can preview the CadNav custom model mode instantly without needing
 * to upload a file right away!
 */
export function buildCadNavPresetModel(config: CarConfigState): ImportedModelInstance {
  const group = new THREE.Group();
  group.name = 'CadNav_BMW_M4_GT3_Silhouette';

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(config.paintColor),
    metalness: 0.88,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x111115,
    roughness: 0.35,
    metalness: 0.7,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x05050a,
    transmission: 0.9,
    opacity: 0.45,
    transparent: true,
    roughness: 0.05,
  });

  // Sculpted aerodynamic body
  const bodyGeo = new THREE.BoxGeometry(2.08, 0.68, 4.75, 24, 12, 48);
  // Deform vertices for GT3 wide-body race car stance
  const pos = bodyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    // Taper front and nose down
    if (z > 1.2) {
      pos.setY(i, y - (z - 1.2) * 0.12);
      pos.setX(i, x * (1 - (z - 1.2) * 0.08));
    }
    // Flare wide rear fenders
    if (z < -0.3 && Math.abs(x) > 0.6) {
      pos.setX(i, x * 1.15);
    }
  }
  bodyGeo.computeVertexNormals();
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.55;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // GT3 Greenhouse cabin
  const cabinGeo = new THREE.BoxGeometry(1.55, 0.55, 2.3, 8, 4, 12);
  const cPos = cabinGeo.attributes.position;
  for (let i = 0; i < cPos.count; i++) {
    const y = cPos.getY(i);
    const z = cPos.getZ(i);
    if (y > 0) {
      cPos.setX(i, cPos.getX(i) * 0.82);
      if (z > 0.3) cPos.setZ(i, z * 0.88);
    }
  }
  cabinGeo.computeVertexNormals();
  const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
  cabinMesh.position.set(0, 1.05, -0.15);
  cabinMesh.castShadow = true;
  group.add(cabinMesh);

  // Aggressive Front GT Splitter & Dive Planes
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.06, 1.1), carbonMat);
  splitter.position.set(0, 0.16, 2.35);
  splitter.castShadow = true;
  group.add(splitter);

  // Swan-Neck High Downforce GT Wing
  const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.05, 0.42), carbonMat);
  wingBlade.position.set(0, 1.35, -2.15);
  wingBlade.castShadow = true;
  group.add(wingBlade);

  [-0.65, 0.65].forEach((x) => {
    const upright = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.3), carbonMat);
    upright.position.set(x, 1.15, -2.05);
    upright.rotation.x = -0.2;
    group.add(upright);
  });

  // Quad Racing Exhaust Tips
  [-0.32, -0.12, 0.12, 0.32].forEach((x) => {
    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.25, 16),
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.95, roughness: 0.2 })
    );
    tip.rotation.x = Math.PI / 2;
    tip.position.set(x, 0.26, -2.42);
    group.add(tip);
  });

  // Racing Centerlock Wheels
  const wheelPositions = [
    [-0.98, 0.38, 1.45],
    [0.98, 0.38, 1.45],
    [-1.02, 0.4, -1.45],
    [1.02, 0.4, -1.45],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(x, y, z);

    // Tire
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.32, 48),
      new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.85 })
    );
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Rim
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.33, 36),
      new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.15 })
    );
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    group.add(wheelGroup);
  });

  return processImportedModel(group, 'CadNav_M4_GT3_Racepack.obj', config, '14.2 MB');
}
