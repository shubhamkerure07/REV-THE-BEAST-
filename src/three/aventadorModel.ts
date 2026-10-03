import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CarConfigState, PaintFinish } from '../types';
import { InteractiveModelInstance, applySmoothNormalsAndShading } from './interactiveSedanModels';

/**
 * Lamborghini Aventador SVJ 3D Model Instance Loader
 * Directly compatible with glTF model assets from automotive-configurator (rendercodeninja).
 */

export function buildLamboAventadorModel(
  initialConfig: CarConfigState,
  onLoaded?: () => void
): InteractiveModelInstance {
  const root = new THREE.Group();
  root.name = 'Lamborghini_Aventador_SVJ_Root';

  const wheels: THREE.Group[] = [];
  const bodyMaterials: THREE.MeshPhysicalMaterial[] = [];
  const glassMaterials: THREE.MeshPhysicalMaterial[] = [];
  const lightMaterials: (THREE.MeshStandardMaterial | THREE.MeshBasicMaterial)[] = [];
  const caliperMaterials: THREE.MeshStandardMaterial[] = [];
  const rimMaterials: THREE.MeshStandardMaterial[] = [];
  let exhaustMesh: THREE.Mesh | null = null;
  let exhaustMaterial: THREE.MeshPhysicalMaterial | null = null;

  // Wheel sub-mesh references for rotation
  const wheelMeshes: THREE.Object3D[] = [];
  // Rim variants
  const rimT0AMeshes: THREE.Object3D[] = [];
  const rimT0BMeshes: THREE.Object3D[] = [];

  // PBR automotive clearcoat body paint material
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(initialConfig.paintColor || '#f59e0b'),
    metalness: initialConfig.paintFinish === 'metallic' ? 0.85 : initialConfig.paintFinish === 'gloss' ? 0.35 : 0.15,
    roughness: initialConfig.paintFinish === 'frozen' ? 0.45 : initialConfig.paintFinish === 'matte' ? 0.8 : 0.16,
    clearcoat: initialConfig.paintFinish === 'gloss' || initialConfig.paintFinish === 'metallic' ? 1.0 : 0.0,
    clearcoatRoughness: 0.08,
    reflectivity: 0.95,
  });
  bodyMaterials.push(bodyMat);

  // Carbon fiber / gloss black mirror cover material
  const mirrorCoverMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x18181b),
    metalness: 0.6,
    roughness: 0.25,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
  });

  // Alloy rim material
  const rimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialConfig.wheels.rimColor || '#16161a'),
    metalness: 0.92,
    roughness: 0.25,
  });
  rimMaterials.push(rimMat);

  // Caliper material
  const caliperMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialConfig.wheels.caliperColor || '#dc2626'),
    metalness: 0.85,
    roughness: 0.2,
  });
  caliperMaterials.push(caliperMat);

  // Exhaust material
  exhaustMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x2d3748),
    metalness: 0.95,
    roughness: 0.22,
    clearcoat: 0.6,
  });

  // Headlight emissive material
  const headlightEmissiveMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffffff),
  });
  lightMaterials.push(headlightEmissiveMat);

  // Taillight emissive material
  const taillightEmissiveMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xff1801),
  });
  lightMaterials.push(taillightEmissiveMat);

  // Load the GLB
  const loader = new GLTFLoader();
  loader.load(
    '/models/aventador/model.glb',
    (gltf) => {
      const model = gltf.scene;

      // The model native orientation: front is towards -X, rear is towards +X.
      // Rotating by -Math.PI / 2 (-90°) around Y aligns front towards +Z, rear towards -Z!
      model.rotation.y = -Math.PI / 2;

      // Traverse and configure meshes and materials
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const origMatName = (mesh.material as THREE.Material)?.name || '';

          // 1. Car body panels
          if (origMatName === 'Mt_Body') {
            mesh.material = bodyMat;
          }
          // 2. Mirror covers
          else if (origMatName === 'Mt_MirrorCover') {
            mesh.material = mirrorCoverMat;
          }
          // 3. Alloy Wheels
          else if (origMatName === 'Mt_AlloyWheels') {
            mesh.material = rimMat;
          }
          // 4. Brake calipers
          else if (origMatName === 'Mt_BrakeCaliper') {
            mesh.material = caliperMat;
          }
          // 5. Shadow floor plane
          else if (origMatName === 'Mt_Shadow_Plane') {
            const orig = mesh.material as THREE.MeshStandardMaterial;
            mesh.material = new THREE.MeshBasicMaterial({
              color: 0x000000,
              map: orig.map,
              transparent: true,
              opacity: 0.85,
              depthWrite: false,
            });
            mesh.renderOrder = -1;
          }
          // 6. Windows & Windscreen
          else if (origMatName === 'Mt_Glass_Translucent' || origMatName === 'Mt_WindScreens') {
            const glass = new THREE.MeshPhysicalMaterial({
              color: 0x0a1017,
              metalness: 0.1,
              roughness: 0.05,
              transmission: 0.9,
              transparent: true,
              opacity: 0.7,
              reflectivity: 0.95,
              clearcoat: 1.0,
            });
            glassMaterials.push(glass);
            mesh.material = glass;
          }
          // 7. Headlight & Taillight glow
          else if (origMatName === 'Mt_Light_Emissive' || origMatName === 'Mt_TurnLights') {
            mesh.material = headlightEmissiveMat;
          } else if (origMatName.includes('Mt_Reflector') || origMatName === 'Mt_Reflector_TL') {
            mesh.material = taillightEmissiveMat;
          }
          // 8. Exhaust
          else if (mesh.name === 'Obj_Exhaust') {
            exhaustMesh = mesh;
            mesh.material = exhaustMaterial;
          }

          // Catalog rim variants
          if (mesh.name.includes('Obj_Rim_T0A')) {
            rimT0AMeshes.push(mesh);
          } else if (mesh.name.includes('Obj_Rim_T0B')) {
            rimT0BMeshes.push(mesh);
          }

          // Catalog wheel rotating assemblies
          if (
            mesh.name.includes('Obj_Tyre_') ||
            mesh.name.includes('Obj_Rim_') ||
            mesh.name.includes('Obj_WheelHub_')
          ) {
            wheelMeshes.push(mesh);
          }
        }
      });

      // Default rim variant visibility
      const isStarSpoke = initialConfig.wheels.rimStyle === 'star-spoke';
      rimT0AMeshes.forEach((m) => (m.visible = !isStarSpoke));
      rimT0BMeshes.forEach((m) => (m.visible = isStarSpoke));

      // Calculate Bounding Box and adjust floor alignment
      const bbox = new THREE.Box3().setFromObject(model);
      // Floor offset to make sure tires sit precisely on floor Y = 0
      const minY = bbox.min.y;
      model.position.y -= minY;

      root.add(model);
      applySmoothNormalsAndShading(root);

      if (onLoaded) {
        onLoaded();
      }
    },
    undefined,
    (err) => {
      console.error('Failed to load Lamborghini Aventador GLB model:', err);
    }
  );

  // Update configuration when user adjusts colors, finishes, rims, etc.
  const updateConfig = (config: CarConfigState) => {
    // 1. Body paint color and sheen
    bodyMat.color.set(config.paintColor);
    const finish = config.paintFinish;
    if (finish === 'metallic') {
      bodyMat.metalness = 0.88;
      bodyMat.roughness = 0.22;
      bodyMat.clearcoat = 1.0;
      bodyMat.clearcoatRoughness = 0.1;
    } else if (finish === 'frozen') {
      bodyMat.metalness = 0.4;
      bodyMat.roughness = 0.6;
      bodyMat.clearcoat = 0.2;
      bodyMat.clearcoatRoughness = 0.45;
    } else if (finish === 'matte') {
      bodyMat.metalness = 0.12;
      bodyMat.roughness = 0.82;
      bodyMat.clearcoat = 0.0;
      bodyMat.clearcoatRoughness = 0.0;
    } else {
      // gloss
      bodyMat.metalness = 0.55;
      bodyMat.roughness = 0.22;
      bodyMat.clearcoat = 1.0;
      bodyMat.clearcoatRoughness = 0.07;
    }
    bodyMat.needsUpdate = true;

    // 2. Rim finish
    rimMat.color.set(config.wheels.rimColor);
    rimMat.needsUpdate = true;

    // 3. Caliper color
    caliperMat.color.set(config.wheels.caliperColor);
    caliperMat.needsUpdate = true;

    // 4. Switchable rim designs
    const isStar = config.wheels.rimStyle === 'star-spoke';
    rimT0AMeshes.forEach((m) => (m.visible = !isStar));
    rimT0BMeshes.forEach((m) => (m.visible = isStar));

    // 5. Lights
    headlightEmissiveMat.color.set(config.headlights ? 0xffffff : 0x222222);
    taillightEmissiveMat.color.set(config.taillights ? 0xff2200 : 0x330000);

    // 6. Exhaust Material
    if (exhaustMaterial) {
      if (config.exhaustConfig.material === 'titanium') {
        exhaustMaterial.color.set(0x38bdf8); // Burnt blue titanium
        exhaustMaterial.metalness = 0.95;
        exhaustMaterial.roughness = 0.18;
      } else if (config.exhaustConfig.material === 'carbon') {
        exhaustMaterial.color.set(0x18181b);
        exhaustMaterial.metalness = 0.4;
        exhaustMaterial.roughness = 0.35;
      } else if (config.exhaustConfig.material === 'racing') {
        exhaustMaterial.color.set(0x27272a);
        exhaustMaterial.metalness = 0.7;
        exhaustMaterial.roughness = 0.55;
      } else {
        // chrome
        exhaustMaterial.color.set(0xe4e4e7);
        exhaustMaterial.metalness = 0.98;
        exhaustMaterial.roughness = 0.1;
      }
      exhaustMaterial.needsUpdate = true;
    }
  };

  // Wheel animation during driving
  let wheelRotX = 0;
  const updateAnimations = (delta: number, config: CarConfigState) => {
    if (config.isDriving) {
      const speed = config.drivingSpeed || 40;
      wheelRotX += (speed / 3.6 / 0.35) * delta;
      wheelMeshes.forEach((m) => {
        m.rotation.z = wheelRotX; // Axis of wheel rotation in this GLB
      });
    }
  };

  return {
    root,
    wheels,
    bodyMaterials,
    glassMaterials,
    lightMaterials,
    updateConfig,
    updateAnimations,
  };
}
