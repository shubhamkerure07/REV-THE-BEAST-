import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CarConfigState, CameraPreset, StudioEnvironment } from '../types';
import { buildBmwCarModel, CarModelInstance } from './carModel';
import {
  ImportedModelInstance,
  buildCadNavPresetModel,
  loadModelFromFile,
} from './customModelLoader';
import {
  InteractiveModelInstance,
  buildBmw5SeriesModel,
  buildSedanLoftedModel,
  buildSedanExecutiveModel,
  applySmoothNormalsAndShading,
} from './interactiveSedanModels';
import { buildMustangGtModel } from './mustangModel';
import { buildGwagonModel } from './gwagonModel';
import { buildNinjaH2rModel } from './ninjaH2rModel';
import { UploadCloud, Box } from 'lucide-react';

export interface CarViewerHandle {
  captureScreenshot: () => string;
  setCameraPreset: (preset: CameraPreset) => void;
  loadCustomModel: (model: ImportedModelInstance) => void;
}

interface CarViewerProps {
  config: CarConfigState;
  onCameraChange?: (preset: CameraPreset) => void;
  onModelImported?: (model: ImportedModelInstance) => void;
  onModelProcessingChange?: (isProcessing: boolean) => void;
  onError?: (errorMessage: string) => void;
}

const CAMERA_PRESET_TARGETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  hero: { pos: [4.2, 1.8, 4.4], target: [0, 0.5, 0] },
  front: { pos: [0, 1.1, 4.6], target: [0, 0.48, 1.5] },
  side: { pos: [-5.6, 1.2, 0], target: [0, 0.5, 0] },
  rear: { pos: [3.8, 1.5, -4.5], target: [0, 0.5, -0.8] },
  top: { pos: [0.01, 7.2, 0.2], target: [0, 0.4, 0] },
  interior: { pos: [-0.38, 1.05, 0.35], target: [-0.38, 0.8, 0.9] },
  engine: { pos: [0, 2.2, 1.2], target: [0, 0.6, 0.9] },
  wheel: { pos: [-2.1, 0.55, 1.8], target: [-0.96, 0.35, 1.42] },
};

export const CarViewer = forwardRef<CarViewerHandle, CarViewerProps>(({ config, onCameraChange, onModelImported, onModelProcessingChange, onError }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const carInstanceRef = useRef<CarModelInstance | null>(null);
  const cadnavPresetRef = useRef<ImportedModelInstance | null>(null);
  const customImportRef = useRef<ImportedModelInstance | null>(null);
  const bmw5SeriesRef = useRef<InteractiveModelInstance | null>(null);
  const sedanLoftedRef = useRef<InteractiveModelInstance | null>(null);
  const sedanExecutiveRef = useRef<InteractiveModelInstance | null>(null);
  const mustangRef = useRef<InteractiveModelInstance | null>(null);
  const gwagonRef = useRef<InteractiveModelInstance | null>(null);
  const ninjaH2rRef = useRef<InteractiveModelInstance | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Road lines for driving mode
  const roadLinesRef = useRef<THREE.Group | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);

  // Lighting references
  const studioLightsRef = useRef<{
    ambient: THREE.AmbientLight;
    keyLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    rimLight1: THREE.DirectionalLight;
    rimLight2: THREE.DirectionalLight;
    groundSpot: THREE.SpotLight;
    overheadSoftbox: THREE.RectAreaLight | null;
  } | null>(null);

  // Camera lerp animation state
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(...CAMERA_PRESET_TARGETS.hero.pos));
  const targetControlTarget = useRef<THREE.Vector3>(new THREE.Vector3(...CAMERA_PRESET_TARGETS.hero.target));
  const isTransitioningCamera = useRef<boolean>(false);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    captureScreenshot: () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return '';
      // Force render
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      return rendererRef.current.domElement.toDataURL('image/png');
    },
    setCameraPreset: (preset: CameraPreset) => {
      const target = CAMERA_PRESET_TARGETS[preset];
      if (target) {
        targetCamPos.current.set(...target.pos);
        targetControlTarget.current.set(...target.target);
        isTransitioningCamera.current = true;
      }
    },
    loadCustomModel: (model: ImportedModelInstance) => {
      if (!sceneRef.current) return;
      if (customImportRef.current) {
        sceneRef.current.remove(customImportRef.current.root);
      }
      applySmoothNormalsAndShading(model.root);
      customImportRef.current = model;
      sceneRef.current.add(model.root);
      model.updateConfig(config);
    },
  }));

  // Initial Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(...CAMERA_PRESET_TARGETS.hero.pos);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 14;
    controls.minDistance = 0.8;
    controls.maxPolarAngle = Math.PI / 2 - 0.01; // Don't dip below floor level
    controls.target.set(...CAMERA_PRESET_TARGETS.hero.target);
    controlsRef.current = controls;

    // Stop camera lerping if user manually interacts
    controls.addEventListener('start', () => {
      isTransitioningCamera.current = false;
    });

    // 5. Floor & Contact Shadow
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0e0e14,
      roughness: 0.28,
      metalness: 0.65,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
    floorMeshRef.current = floorMesh;

    // Floor subtle concentric studio grid lines
    const gridHelper = new THREE.GridHelper(24, 24, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.002;
    scene.add(gridHelper);

    // Dynamic Road Dashes for driving simulation
    const roadGroup = new THREE.Group();
    for (let i = -15; i <= 15; i++) {
      const dash = new THREE.Mesh(
        new THREE.PlaneGeometry(0.18, 1.4),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })
      );
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.005, i * 3.5);
      roadGroup.add(dash);
    }
    roadGroup.visible = false;
    scene.add(roadGroup);
    roadLinesRef.current = roadGroup;

    // 6. Lighting Setup
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    // Key Light (Main soft light from top-front-right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(6, 9, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.bias = -0.0003;
    scene.add(keyLight);

    // Fill Light (Gentle fill from opposite side)
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
    fillLight.position.set(-7, 5, -5);
    scene.add(fillLight);

    // Rim Light 1 (Accentuates rear shoulders and curves)
    const rimLight1 = new THREE.DirectionalLight(0x93c5fd, 2.5);
    rimLight1.position.set(-6, 3.5, 6);
    scene.add(rimLight1);

    // Rim Light 2 (Rear outline)
    const rimLight2 = new THREE.DirectionalLight(0xffffff, 1.8);
    rimLight2.position.set(4, 3.5, -6);
    scene.add(rimLight2);

    // Studio Overhead Softbox
    const groundSpot = new THREE.SpotLight(0xffffff, 3.5, 18, Math.PI / 3, 0.5, 1);
    groundSpot.position.set(0, 8, 0);
    groundSpot.target.position.set(0, 0, 0);
    scene.add(groundSpot);
    scene.add(groundSpot.target);

    studioLightsRef.current = {
      ambient,
      keyLight,
      fillLight,
      rimLight1,
      rimLight2,
      groundSpot,
      overheadSoftbox: null,
    };

    // 7. Instantiate Procedural BMW Car Model
    const carInstance = buildBmwCarModel(config);
    scene.add(carInstance.root);
    carInstanceRef.current = carInstance;

    // 8. Animation & Render Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Controls update
      controls.update();

      // Smooth Camera Lerp
      if (isTransitioningCamera.current) {
        camera.position.lerp(targetCamPos.current, 0.08);
        controls.target.lerp(targetControlTarget.current, 0.08);

        if (
          camera.position.distanceTo(targetCamPos.current) < 0.04 &&
          controls.target.distanceTo(targetControlTarget.current) < 0.04
        ) {
          isTransitioningCamera.current = false;
        }
      }

      // Turntable Auto Rotation
      if (config.autoRotate && !isTransitioningCamera.current && !config.isDriving) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = config.rotateSpeed;
      } else {
        controls.autoRotate = false;
      }

      // Update Car Animations (doors, hood, wheels, vibration)
      if (config.modelType === 'procedural-m4' && carInstanceRef.current) {
        carInstanceRef.current.updateAnimations(delta, config);
      } else if (config.modelType === 'bmw-5series' && bmw5SeriesRef.current) {
        bmw5SeriesRef.current.updateAnimations(delta, config);
      } else if (config.modelType === 'sedan-lofted' && sedanLoftedRef.current) {
        sedanLoftedRef.current.updateAnimations(delta, config);
      } else if (config.modelType === 'sedan-executive' && sedanExecutiveRef.current) {
        sedanExecutiveRef.current.updateAnimations(delta, config);
      } else if (config.modelType === 'cadnav-gt3' && cadnavPresetRef.current) {
        cadnavPresetRef.current.updateAnimations(delta, config);
      } else if (config.modelType === 'mustang-gt' && mustangRef.current) {
        mustangRef.current.updateAnimations(delta, config);
      } else if (config.modelType === 'gwagon-g63' && gwagonRef.current) {
        gwagonRef.current.updateAnimations(delta, config);
      } else if (config.modelType === 'ninja-h2r' && ninjaH2rRef.current) {
        ninjaH2rRef.current.updateAnimations(delta, config);
      } else if (config.modelType === 'custom-import' && customImportRef.current) {
        customImportRef.current.updateAnimations(delta, config);
      }

      // Driving Simulation Road Movement
      if (config.isDriving && roadLinesRef.current) {
        roadLinesRef.current.visible = true;
        const speed = config.driveSpeed * 12;
        roadLinesRef.current.children.forEach((dash) => {
          dash.position.z -= delta * speed;
          if (dash.position.z < -25) {
            dash.position.z += 50;
          }
        });
      } else if (roadLinesRef.current) {
        roadLinesRef.current.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Switch Active Model based on config.modelType
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // 1. Procedural OEM M4
    if (carInstanceRef.current) {
      carInstanceRef.current.root.visible = config.modelType === 'procedural-m4';
    }

    // 2. BMW 5 Series Twin-Turbo Sedan
    if (config.modelType === 'bmw-5series') {
      if (!bmw5SeriesRef.current) {
        const m = buildBmw5SeriesModel(config);
        bmw5SeriesRef.current = m;
        scene.add(m.root);
      }
      bmw5SeriesRef.current.root.visible = true;
      bmw5SeriesRef.current.updateConfig(config);
    } else if (bmw5SeriesRef.current) {
      bmw5SeriesRef.current.root.visible = false;
    }

    // 3. Lofted Aerodynamic Sedan
    if (config.modelType === 'sedan-lofted') {
      if (!sedanLoftedRef.current) {
        const m = buildSedanLoftedModel(config);
        sedanLoftedRef.current = m;
        scene.add(m.root);
      }
      sedanLoftedRef.current.root.visible = true;
      sedanLoftedRef.current.updateConfig(config);
    } else if (sedanLoftedRef.current) {
      sedanLoftedRef.current.root.visible = false;
    }

    // 4. Executive Contour Sedan
    if (config.modelType === 'sedan-executive') {
      if (!sedanExecutiveRef.current) {
        const m = buildSedanExecutiveModel(config);
        sedanExecutiveRef.current = m;
        scene.add(m.root);
      }
      sedanExecutiveRef.current.root.visible = true;
      sedanExecutiveRef.current.updateConfig(config);
    } else if (sedanExecutiveRef.current) {
      sedanExecutiveRef.current.root.visible = false;
    }

    // 5. CadNav GT3 Preset
    if (config.modelType === 'cadnav-gt3') {
      if (!cadnavPresetRef.current) {
        const gt3 = buildCadNavPresetModel(config);
        cadnavPresetRef.current = gt3;
        scene.add(gt3.root);
      }
      cadnavPresetRef.current.root.visible = true;
      cadnavPresetRef.current.updateConfig(config);
    } else if (cadnavPresetRef.current) {
      cadnavPresetRef.current.root.visible = false;
    }

    // 6. Ford Mustang GT Fastback
    if (config.modelType === 'mustang-gt') {
      if (!mustangRef.current) {
        const m = buildMustangGtModel(config);
        mustangRef.current = m;
        scene.add(m.root);
      }
      mustangRef.current.root.visible = true;
      mustangRef.current.updateConfig(config);
    } else if (mustangRef.current) {
      mustangRef.current.root.visible = false;
    }

    // 7. Mercedes-AMG G63 G-Wagon
    if (config.modelType === 'gwagon-g63') {
      if (!gwagonRef.current) {
        const m = buildGwagonModel(config);
        gwagonRef.current = m;
        scene.add(m.root);
      }
      gwagonRef.current.root.visible = true;
      gwagonRef.current.updateConfig(config);
    } else if (gwagonRef.current) {
      gwagonRef.current.root.visible = false;
    }

    // 8. Kawasaki Ninja H2R Superbike
    if (config.modelType === 'ninja-h2r') {
      if (!ninjaH2rRef.current) {
        const m = buildNinjaH2rModel(config);
        ninjaH2rRef.current = m;
        scene.add(m.root);
      }
      ninjaH2rRef.current.root.visible = true;
      ninjaH2rRef.current.updateConfig(config);
    } else if (ninjaH2rRef.current) {
      ninjaH2rRef.current.root.visible = false;
    }

    // 9. Custom Imported Model
    if (customImportRef.current) {
      customImportRef.current.root.visible = config.modelType === 'custom-import';
      if (config.modelType === 'custom-import') {
        customImportRef.current.updateConfig(config);
      }
    }
  }, [config.modelType]);

  // Update Car Config on Props change for whichever model is active
  useEffect(() => {
    if (config.modelType === 'procedural-m4' && carInstanceRef.current) {
      carInstanceRef.current.updateConfig(config);
    } else if (config.modelType === 'bmw-5series' && bmw5SeriesRef.current) {
      bmw5SeriesRef.current.updateConfig(config);
    } else if (config.modelType === 'sedan-lofted' && sedanLoftedRef.current) {
      sedanLoftedRef.current.updateConfig(config);
    } else if (config.modelType === 'sedan-executive' && sedanExecutiveRef.current) {
      sedanExecutiveRef.current.updateConfig(config);
    } else if (config.modelType === 'cadnav-gt3' && cadnavPresetRef.current) {
      cadnavPresetRef.current.updateConfig(config);
    } else if (config.modelType === 'mustang-gt' && mustangRef.current) {
      mustangRef.current.updateConfig(config);
    } else if (config.modelType === 'gwagon-g63' && gwagonRef.current) {
      gwagonRef.current.updateConfig(config);
    } else if (config.modelType === 'ninja-h2r' && ninjaH2rRef.current) {
      ninjaH2rRef.current.updateConfig(config);
    } else if (config.modelType === 'custom-import' && customImportRef.current) {
      customImportRef.current.updateConfig(config);
    }
  }, [config]);

  // Update Environment / Lighting Mode
  useEffect(() => {
    if (!sceneRef.current || !studioLightsRef.current || !floorMeshRef.current) return;
    const scene = sceneRef.current;
    const lights = studioLightsRef.current;
    const floor = floorMeshRef.current;
    const env = config.environment;

    if (env === 'sunset' || env === 'golden-hour') {
      // Warm golden-hour sunset atmosphere with amber direct sunlight and deep crimson dusk fill
      scene.background = new THREE.Color(0x180e0c);
      scene.fog = new THREE.FogExp2(0x180e0c, 0.028);
      lights.ambient.color.setHex(0xfef08a);
      lights.ambient.intensity = 0.8;
      lights.keyLight.color.setHex(0xfb923c); // Warm amber / golden sunlight
      lights.keyLight.intensity = 3.4;
      lights.keyLight.position.set(8, 6, 7);
      lights.fillLight.color.setHex(0x9a3412); // Sunset burnt orange/crimson fill
      lights.fillLight.intensity = 1.4;
      lights.rimLight1.color.setHex(0xfde047); // Golden radiant rim
      lights.rimLight1.intensity = 3.2;
      lights.rimLight2.color.setHex(0xf43f5e); // Sunset rose rear edge accent
      lights.groundSpot.color.setHex(0xfbbf24);
      lights.groundSpot.intensity = 3.2;
      (floor.material as THREE.MeshStandardMaterial).color.setHex(0x140f0c);
      (floor.material as THREE.MeshStandardMaterial).roughness = 0.28;
      (floor.material as THREE.MeshStandardMaterial).metalness = 0.65;
    } else if (env === 'neon-city' || env === 'cyberpunk') {
      // Cyberpunk / Neon City night atmosphere with vivid cyan & magenta neon accents
      scene.background = new THREE.Color(0x05040a);
      scene.fog = new THREE.FogExp2(0x05040a, 0.038);
      lights.ambient.color.setHex(0x1e1b4b);
      lights.ambient.intensity = 0.6;
      lights.keyLight.color.setHex(0x06b6d4); // Neon Cyan key
      lights.keyLight.intensity = 3.0;
      lights.keyLight.position.set(6, 7, 7);
      lights.fillLight.color.setHex(0xd946ef); // Neon Magenta fill
      lights.fillLight.intensity = 2.5;
      lights.rimLight1.color.setHex(0x3b82f6); // Electric Blue rim
      lights.rimLight1.intensity = 3.5;
      lights.rimLight2.color.setHex(0xf43f5e); // Neon pink rear rim
      lights.groundSpot.color.setHex(0x06b6d4);
      lights.groundSpot.intensity = 3.6;
      (floor.material as THREE.MeshStandardMaterial).color.setHex(0x07060d);
      (floor.material as THREE.MeshStandardMaterial).roughness = 0.16; // Wet reflective asphalt
      (floor.material as THREE.MeshStandardMaterial).metalness = 0.88;
    } else if (env === 'natural') {
      // Open air daylight sky with natural sunbeam and sky-blue ambient fill
      scene.background = new THREE.Color(0x0f172a);
      scene.fog = new THREE.FogExp2(0x0f172a, 0.022);
      lights.ambient.color.setHex(0xbae6fd);
      lights.ambient.intensity = 1.0;
      lights.keyLight.color.setHex(0xfffaf0); // Direct daylight
      lights.keyLight.intensity = 3.2;
      lights.keyLight.position.set(8, 12, 6);
      lights.fillLight.color.setHex(0x7dd3fc); // Sky blue fill
      lights.fillLight.intensity = 1.6;
      lights.rimLight1.color.setHex(0xe0f2fe);
      lights.rimLight1.intensity = 2.4;
      lights.rimLight2.color.setHex(0xfef08a);
      lights.groundSpot.color.setHex(0xffedd5);
      lights.groundSpot.intensity = 2.6;
      (floor.material as THREE.MeshStandardMaterial).color.setHex(0x151922);
      (floor.material as THREE.MeshStandardMaterial).roughness = 0.38;
      (floor.material as THREE.MeshStandardMaterial).metalness = 0.35;
    } else {
      // Default: 'studio' (and 'showroom', 'dark-studio')
      // Pristine modern automotive cyclorama with neutral high-CRI softboxes
      scene.background = new THREE.Color(0x0c0d12);
      scene.fog = new THREE.FogExp2(0x0c0d12, 0.032);
      lights.ambient.color.setHex(0xffffff);
      lights.ambient.intensity = 0.9;
      lights.keyLight.color.setHex(0xffffff);
      lights.keyLight.intensity = 2.8;
      lights.keyLight.position.set(6, 9, 7);
      lights.fillLight.color.setHex(0xdbeafe);
      lights.fillLight.intensity = 1.3;
      lights.rimLight1.color.setHex(0x93c5fd);
      lights.rimLight1.intensity = 2.4;
      lights.rimLight2.color.setHex(0xffffff);
      lights.groundSpot.color.setHex(0xffffff);
      lights.groundSpot.intensity = 4.2;
      (floor.material as THREE.MeshStandardMaterial).color.setHex(0x101118);
      (floor.material as THREE.MeshStandardMaterial).roughness = 0.22;
      (floor.material as THREE.MeshStandardMaterial).metalness = 0.7;
    }
  }, [config.environment]);

  // Handle Camera Preset transition
  useEffect(() => {
    const target = CAMERA_PRESET_TARGETS[config.cameraPreset];
    if (target && cameraRef.current && controlsRef.current) {
      targetCamPos.current.set(...target.pos);
      targetControlTarget.current.set(...target.target);
      isTransitioningCamera.current = true;
    }
  }, [config.cameraPreset]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files: File[] = Array.from(e.dataTransfer.files);
      // Prioritize 3D model files (.obj, .gltf, .glb, .stl) over text notes, textures or metadata
      const file =
        files.find((f: File) => {
          const ext = f.name.split('.').pop()?.toLowerCase();
          return ext === 'obj' || ext === 'gltf' || ext === 'glb' || ext === 'stl';
        }) || files[0];

      try {
        onModelProcessingChange?.(true);
        const instance = await loadModelFromFile(file, config);
        if (customImportRef.current && sceneRef.current) {
          sceneRef.current.remove(customImportRef.current.root);
        }
        customImportRef.current = instance;
        if (sceneRef.current) {
          sceneRef.current.add(instance.root);
        }
        onModelImported?.(instance);
      } catch (err: any) {
        console.warn('Notice loading dropped 3D model:', err?.message || err);
        onError?.(err?.message || 'Could not load dropped 3D file.');
      } finally {
        onModelProcessingChange?.(false);
      }
    }
  };

  return (
    <div
      id="three-canvas-container"
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
    >
      {/* Visual Canvas Dropzone HUD when dragging 3D files */}
      {isDragOver && (
        <div className="absolute inset-0 z-40 bg-blue-950/70 backdrop-blur-md border-4 border-dashed border-blue-400 flex flex-col items-center justify-center p-6 text-center animate-fadeIn pointer-events-none">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-400 flex items-center justify-center mb-4 text-white shadow-2xl">
            <UploadCloud className="w-8 h-8 text-blue-300 animate-bounce" />
          </div>
          <h3 className="text-xl font-black text-white italic tracking-tight mb-1">
            Drop CadNav 3D Car Model
          </h3>
          <p className="text-xs text-blue-200 font-medium max-w-sm">
            Release your .OBJ, .GLTF, .GLB, or .STL file to render it with PBR materials and studio lighting.
          </p>
        </div>
      )}
    </div>
  );
});
