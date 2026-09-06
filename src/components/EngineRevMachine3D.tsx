import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { engineSound } from '../utils/audio';
import { CarModelType, GearPosition } from '../types';
import { getEngineForModel } from '../data/engines';
import { Gauge, Flame, Wind, RotateCcw, Zap, Play, Pause } from 'lucide-react';

interface EngineRevMachine3DProps {
  modelType: CarModelType;
  valveMode?: 'quiet' | 'sport' | 'track';
}

export const EngineRevMachine3D: React.FC<EngineRevMachine3DProps> = ({
  modelType,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rpm, setRpm] = useState<number>(800);
  const [gear, setGear] = useState<GearPosition>(1);
  const [boost, setBoost] = useState<number>(0);
  const [throttle, setThrottleState] = useState<number>(0);
  const [isPointerRevving, setIsPointerRevving] = useState<boolean>(false);

  const engineSpec = getEngineForModel(modelType);

  // References for 3D animation
  const animFrameRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Engine animated sub-components
  const pistonsRef = useRef<THREE.Mesh[]>([]);
  const crankPulleysRef = useRef<THREE.Group[]>([]);
  const turboSpoolRef = useRef<THREE.Group | null>(null);
  const exhaustHeaderMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const flameParticlesRef = useRef<THREE.Points | null>(null);
  const flameGeoRef = useRef<THREE.BufferGeometry | null>(null);

  // Orbit control state
  const isDraggingRef = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const cameraOrbit = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 9 });

  // Sync audio engine subscriptions
  useEffect(() => {
    const unsubRpm = engineSound.subscribeRpm((currentRpm) => {
      setRpm(currentRpm);
    });
    const unsubGear = engineSound.subscribeGear((g) => {
      setGear(g);
    });
    const unsubBoost = engineSound.subscribeBoost((b) => {
      setBoost(b);
    });

    return () => {
      unsubRpm();
      unsubGear();
      unsubBoost();
    };
  }, []);

  // Pointer hold-to-rev handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only rev if not dragging camera with middle/right button
    if (e.button === 0) {
      setIsPointerRevving(true);
      setThrottleState(0.95);
      engineSound.setThrottle(0.95);
    }
  };

  const handlePointerUp = () => {
    setIsPointerRevving(false);
    setThrottleState(0);
    engineSound.setThrottle(0);
  };

  // Build 3D Engine Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x06070a);
    scene.fog = new THREE.FogExp2(0x06070a, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainSpot = new THREE.DirectionalLight(0xffffff, 1.8);
    mainSpot.position.set(5, 10, 7);
    mainSpot.castShadow = true;
    scene.add(mainSpot);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-6, 4, -6);
    scene.add(rimLight);

    const underGlow = new THREE.PointLight(0xf97316, 0.8, 12);
    underGlow.position.set(0, -1, 0);
    scene.add(underGlow);

    // Floor Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0xf59e0b, 0x1f2937);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // 3. Engine Block Assembly
    const engineGroup = new THREE.Group();
    scene.add(engineGroup);

    // Engine Core Materials
    const castIronMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.65,
      metalness: 0.7,
    });
    const polishedChromeMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.15,
      metalness: 0.95,
    });
    const carbonPistonMat = new THREE.MeshStandardMaterial({
      color: 0x374151,
      roughness: 0.3,
      metalness: 0.85,
    });
    const headerMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.4,
      metalness: 0.8,
      emissive: new THREE.Color(0x000000),
    });
    exhaustHeaderMatRef.current = headerMat;

    // Main Engine Sump & Crankcase
    const crankcaseGeo = new THREE.BoxGeometry(4.2, 1.8, 2.4);
    const crankcase = new THREE.Mesh(crankcaseGeo, castIronMat);
    crankcase.position.y = -0.8;
    crankcase.castShadow = true;
    crankcase.receiveShadow = true;
    engineGroup.add(crankcase);

    // Cylinder Bank Block
    const cylinderBankGeo = new THREE.BoxGeometry(3.8, 1.6, 2.0);
    const cylinderBank = new THREE.Mesh(cylinderBankGeo, castIronMat);
    cylinderBank.position.y = 0.6;
    engineGroup.add(cylinderBank);

    // Red Racing Valve Cover
    const valveCoverGeo = new THREE.BoxGeometry(3.6, 0.6, 1.8);
    const valveCoverMat = new THREE.MeshStandardMaterial({
      color: modelType === 'ferrari-sf90' ? 0xdc2626 : modelType === 'bugatti-chiron' ? 0x0284c7 : 0xe11d48,
      roughness: 0.25,
      metalness: 0.6,
    });
    const valveCover = new THREE.Mesh(valveCoverGeo, valveCoverMat);
    valveCover.position.y = 1.6;
    engineGroup.add(valveCover);

    // Intake Runners (Top)
    for (let i = -1.2; i <= 1.2; i += 0.8) {
      const runnerGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.9, 16);
      const runner = new THREE.Mesh(runnerGeo, polishedChromeMat);
      runner.position.set(i, 2.1, 0.3);
      engineGroup.add(runner);
    }

    // Moving Pistons inside cutout viewing bores
    const pistons: THREE.Mesh[] = [];
    const numPistons = 4;
    const pistonSpacing = 0.85;

    for (let i = 0; i < numPistons; i++) {
      // Cutout bore cylinder ring
      const boreGeo = new THREE.CylinderGeometry(0.38, 0.38, 1.3, 24, 1, true);
      const boreMesh = new THREE.Mesh(
        boreGeo,
        new THREE.MeshStandardMaterial({ color: 0x111827, side: THREE.DoubleSide })
      );
      boreMesh.position.set((i - 1.5) * pistonSpacing, 0.6, 0.9);
      boreMesh.rotation.x = Math.PI / 12;
      engineGroup.add(boreMesh);

      // Piston Head
      const pistonGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.45, 24);
      const piston = new THREE.Mesh(pistonGeo, carbonPistonMat);
      piston.position.set((i - 1.5) * pistonSpacing, 0.5, 0.9);
      piston.rotation.x = Math.PI / 12;
      engineGroup.add(piston);
      pistons.push(piston);

      // Connecting Rod
      const rodGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.9, 12);
      const rod = new THREE.Mesh(rodGeo, polishedChromeMat);
      rod.position.y = -0.55;
      piston.add(rod);
    }
    pistonsRef.current = pistons;

    // Timing Belt & Crank Pulleys (Front)
    const frontPulleyGroup = new THREE.Group();
    frontPulleyGroup.position.set(2.15, 0.4, 0);
    frontPulleyGroup.rotation.z = Math.PI / 2;

    const pulleyGeo1 = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 24);
    const pulley1 = new THREE.Mesh(pulleyGeo1, polishedChromeMat);
    frontPulleyGroup.add(pulley1);

    const pulleyGeo2 = new THREE.CylinderGeometry(0.35, 0.35, 0.16, 24);
    const pulley2 = new THREE.Mesh(pulleyGeo2, polishedChromeMat);
    pulley2.position.set(0.9, 0, 0);
    frontPulleyGroup.add(pulley2);

    engineGroup.add(frontPulleyGroup);
    crankPulleysRef.current = [frontPulleyGroup];

    // Exhaust Header Manifold (Rear / Side)
    const headerGroup = new THREE.Group();
    for (let i = -1.2; i <= 1.2; i += 0.8) {
      const pipeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(i, 0.7, -1.0),
        new THREE.Vector3(i * 0.7, 0.3, -1.5),
        new THREE.Vector3(0, -0.2, -1.9),
      ]);
      const pipeGeo = new THREE.TubeGeometry(pipeCurve, 16, 0.16, 12, false);
      const pipeMesh = new THREE.Mesh(pipeGeo, headerMat);
      headerGroup.add(pipeMesh);
    }
    engineGroup.add(headerGroup);

    // Turbocharger Assembly
    const turboGroup = new THREE.Group();
    turboGroup.position.set(-1.6, 0.2, -1.6);

    // Snail housing
    const snailGeo = new THREE.TorusGeometry(0.55, 0.25, 16, 32, Math.PI * 1.6);
    const turboHousingMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.9,
      roughness: 0.3,
    });
    const snail = new THREE.Mesh(snailGeo, turboHousingMat);
    snail.rotation.y = Math.PI / 2;
    turboGroup.add(snail);

    // Compressor spinning turbine blades
    const turbineCore = new THREE.Group();
    const coreGeo = new THREE.ConeGeometry(0.2, 0.4, 16);
    const core = new THREE.Mesh(coreGeo, polishedChromeMat);
    core.rotation.x = Math.PI / 2;
    turbineCore.add(core);

    for (let b = 0; b < 8; b++) {
      const bladeGeo = new THREE.BoxGeometry(0.04, 0.3, 0.08);
      const blade = new THREE.Mesh(bladeGeo, polishedChromeMat);
      blade.rotation.z = (b * Math.PI) / 4;
      blade.position.set(Math.cos((b * Math.PI) / 4) * 0.25, Math.sin((b * Math.PI) / 4) * 0.25, 0);
      turbineCore.add(blade);
    }
    turbineCore.position.set(0, 0, 0.35);
    turboGroup.add(turbineCore);
    turboSpoolRef.current = turbineCore;

    engineGroup.add(turboGroup);

    // Exhaust Flame Burst Particles System
    const particleCount = 60;
    const flameGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount; p++) {
      positions[p * 3] = 0;
      positions[p * 3 + 1] = -0.2;
      positions[p * 3 + 2] = -2.2;

      colors[p * 3] = 1.0; // R
      colors[p * 3 + 1] = 0.4; // G
      colors[p * 3 + 2] = 0.05; // B
    }

    flameGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    flameGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    flameGeoRef.current = flameGeo;

    const flameMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    const flameParticles = new THREE.Points(flameGeo, flameMat);
    engineGroup.add(flameParticles);
    flameParticlesRef.current = flameParticles;

    // Setup initial camera orbit position
    const updateCameraPos = () => {
      const { theta, phi, radius } = cameraOrbit.current;
      camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(0, 0.2, 0);
    };
    updateCameraPos();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse Drag to Orbit Engine
    const onMouseDown = (e: MouseEvent) => {
      if (e.target === renderer.domElement) {
        isDraggingRef.current = true;
        prevMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePos.current.x;
      const deltaY = e.clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.clientX, y: e.clientY };

      cameraOrbit.current.theta += deltaX * 0.008;
      cameraOrbit.current.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, cameraOrbit.current.phi - deltaY * 0.008));
      updateCameraPos();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraOrbit.current.radius = Math.max(4, Math.min(15, cameraOrbit.current.radius + e.deltaY * 0.006));
      updateCameraPos();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // 4. Animation Loop
    let lastTime = performance.now();
    let flameTime = 0;

    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const currentRpm = engineSound.getRpm();
      const maxRpm = engineSpec.redlineRpm || 7500;
      const rpmRatio = Math.max(0, Math.min(1, currentRpm / maxRpm));

      // 1. Move Pistons in 4-Stroke Firing Order (1-3-4-2)
      const crankAngle = (now * 0.001 * currentRpm * Math.PI) / 30;
      const pistonOffsets = [0, Math.PI, Math.PI, 0];

      pistonsRef.current.forEach((piston, idx) => {
        const offset = pistonOffsets[idx] || 0;
        const strokeHeight = 0.35;
        piston.position.y = 0.6 + Math.sin(crankAngle + offset) * strokeHeight;
      });

      // 2. Rotate Front Pulleys
      crankPulleysRef.current.forEach((pulleyGroup) => {
        pulleyGroup.rotation.x += currentRpm * 0.0006;
      });

      // 3. Spin Turbo Turbine
      if (turboSpoolRef.current) {
        turboSpoolRef.current.rotation.z += (currentRpm / 60) * 0.45;
      }

      // 4. Heat-Up Exhaust Headers to Cherry-Red Glowing Heat
      if (exhaustHeaderMatRef.current) {
        if (rpmRatio > 0.45) {
          const glowIntensity = (rpmRatio - 0.45) / 0.55;
          exhaustHeaderMatRef.current.emissive.setRGB(
            glowIntensity * 1.6, // Red
            glowIntensity * 0.4, // Green / Amber
            glowIntensity * 0.05 // Blue
          );
        } else {
          exhaustHeaderMatRef.current.emissive.setRGB(0, 0, 0);
        }
      }

      // 5. Exhaust Flames & Backfire Sparks
      const isLaunch = engineSound.getIsLaunchControl();
      const isShootingFlames = isLaunch || rpmRatio > 0.92;

      if (flameParticlesRef.current && flameGeoRef.current) {
        const pMat = flameParticlesRef.current.material as THREE.PointsMaterial;
        if (isShootingFlames) {
          pMat.opacity = 0.95;
          flameTime += delta * 15;
          const posAttr = flameGeoRef.current.attributes.position as THREE.BufferAttribute;
          const posArray = posAttr.array as Float32Array;

          for (let p = 0; p < particleCount; p++) {
            const spreadX = (Math.random() - 0.5) * 0.45;
            const spreadY = (Math.random() - 0.5) * 0.35;
            const lengthZ = -2.2 - Math.random() * (isLaunch ? 1.8 : 1.2);

            posArray[p * 3] = spreadX;
            posArray[p * 3 + 1] = -0.2 + spreadY;
            posArray[p * 3 + 2] = lengthZ;
          }
          posAttr.needsUpdate = true;
        } else {
          pMat.opacity = Math.max(0, pMat.opacity - delta * 4);
        }
      }

      // Engine subtle idle vibration
      const vib = (Math.random() - 0.5) * (0.004 + rpmRatio * 0.015);
      engineGroup.position.y = vib;

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelType, engineSpec.redlineRpm]);

  return (
    <div
      id="engine-3d-rev-stage"
      className="relative w-full h-[620px] rounded-3xl overflow-hidden bg-black/80 border border-white/10 select-none shadow-2xl"
    >
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating 3D HUD Diagnostics Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider">3D REV MACHINE</span>
          <span className="text-[11px] text-slate-400">| {engineSpec.code}</span>
        </div>

        {/* Real-Time Live Telemetry Pill */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 text-xs font-mono shadow-2xl">
          <div>
            <span className="text-[10px] text-slate-400 block">RPM</span>
            <span className="text-base font-bold text-amber-400">{rpm}</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <span className="text-[10px] text-slate-400 block">GEAR</span>
            <span className="text-base font-bold text-cyan-400">{gear}</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <span className="text-[10px] text-slate-400 block">BOOST</span>
            <span className="text-base font-bold text-orange-400">{boost} PSI</span>
          </div>
        </div>
      </div>

      {/* Camera Orbit Guidance Overlay */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-[11px] text-slate-400">
        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
        <span>Drag to orbit engine • Scroll to zoom</span>
      </div>

      {/* Bottom Center Direct Rev Pedal Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-auto">
        <button
          id="engine-3d-hold-rev-button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold tracking-wider text-sm transition-all duration-150 shadow-2xl ${
            isPointerRevving
              ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white scale-105 shadow-orange-500/40'
              : 'bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-amber-400/50'
          }`}
        >
          <Flame className={`w-5 h-5 ${isPointerRevving ? 'text-yellow-200 animate-bounce' : 'text-amber-400'}`} />
          <span>{isPointerRevving ? 'REV LIMITER ACTIVE' : 'HOLD TO REV MACHINE'}</span>
        </button>
        <span className="text-[11px] text-slate-400 tracking-wide">
          Syncs pistons, glowing exhaust heat, & turbo spool in real time
        </span>
      </div>
    </div>
  );
};
