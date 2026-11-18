import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  CarConfigState,
  CarModelType,
  RacingGameMode,
  GraphicsQuality,
} from '../types';
import { getVehicleMedia } from '../data/vehicleMedia';
import { getEngineForModel } from '../data/engines';
import { engineSound } from '../utils/audio';
import {
  Flag,
  RotateCcw,
  Camera,
  Play,
  Volume2,
  VolumeX,
  Gauge,
  Zap,
  Flame,
  ArrowLeft,
  Settings,
  ChevronRight,
  Maximize2,
  Sparkles,
  Trophy,
} from 'lucide-react';

export interface RacingSimulator3DProps {
  config: CarConfigState;
  onExit: () => void;
  showToast: (msg: string) => void;
}

export type TrackCircuitId = 'nurburgring' | 'tokyo-c1' | 'big-sur' | 'drag-strip';

interface CircuitSpec {
  id: TrackCircuitId;
  name: string;
  location: string;
  lengthKm: number;
  totalLaps: number;
  recordLap: string;
  skyColor: number;
  fogColor: number;
  fogDensity: number;
  asphaltColor: number;
  curbColor: number;
  barrierColor: number;
  isDragStrip: boolean;
  description: string;
}

const CIRCUITS: Record<TrackCircuitId, CircuitSpec> = {
  nurburgring: {
    id: 'nurburgring',
    name: 'Nürburgring GP Circuit',
    location: 'Eifel Forest, Germany',
    lengthKm: 3.6,
    totalLaps: 2,
    recordLap: '01:28.450',
    skyColor: 0x181824,
    fogColor: 0x0c0d14,
    fogDensity: 0.0035,
    asphaltColor: 0x1f2026,
    curbColor: 0xdc2626,
    barrierColor: 0x475569,
    isDragStrip: false,
    description: 'FIA Grade 1 European Grand Prix circuit featuring high-camber sweepers and heavy braking chicanes.',
  },
  'tokyo-c1': {
    id: 'tokyo-c1',
    name: 'Tokyo C1 Shuto Expressway',
    location: 'Shuto Expressway, Tokyo, Japan',
    lengthKm: 4.2,
    totalLaps: 2,
    recordLap: '01:34.120',
    skyColor: 0x050508,
    fogColor: 0x07070d,
    fogDensity: 0.004,
    asphaltColor: 0x121318,
    curbColor: 0x00f0ff,
    barrierColor: 0x334155,
    isDragStrip: false,
    description: 'Elevated urban expressway carved through midnight skyscraper canyons with reflective neon tarmac.',
  },
  'big-sur': {
    id: 'big-sur',
    name: 'Big Sur Mountain Pass',
    location: 'Highway 1, California, USA',
    lengthKm: 4.8,
    totalLaps: 1,
    recordLap: '02:04.880',
    skyColor: 0x24141c,
    fogColor: 0x180d14,
    fogDensity: 0.003,
    asphaltColor: 0x272428,
    curbColor: 0xf59e0b,
    barrierColor: 0x78716c,
    isDragStrip: false,
    description: 'Breathtaking coastal cliffs and mountain switchbacks alongside Pacific ocean vistas.',
  },
  'drag-strip': {
    id: 'drag-strip',
    name: 'Quarter-Mile Dragway (Santa Ana)',
    location: 'Santa Ana Raceway, California, USA',
    lengthKm: 0.402,
    totalLaps: 1,
    recordLap: '00:08.920',
    skyColor: 0x140c10,
    fogColor: 0x0a0608,
    fogDensity: 0.002,
    asphaltColor: 0x17171d,
    curbColor: 0xe11d48,
    barrierColor: 0x475569,
    isDragStrip: true,
    description: 'Championship NHRA-spec VHT prepped dragstrip with staging Christmas tree and timing beams.',
  },
};

type CameraMode = 'chase' | 'hood' | 'cockpit';
type SimState = 'staging' | 'countdown' | 'racing' | 'finished';

interface AiOpponent {
  id: string;
  name: string;
  color: string;
  mesh: THREE.Group;
  progressU: number;
  speedKmh: number;
  targetSpeedKmh: number;
  lateralOffset: number;
  lap: number;
}

export const RacingSimulator3D: React.FC<RacingSimulator3DProps> = ({
  config,
  onExit,
  showToast,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation Controls & State
  const [circuitId, setCircuitId] = useState<TrackCircuitId>('nurburgring');
  const [gameMode, setGameMode] = useState<RacingGameMode>('quick-race');
  const [cameraMode, setCameraMode] = useState<CameraMode>('chase');
  const [graphicsTier, setGraphicsTier] = useState<GraphicsQuality>('high');
  const [simState, setSimState] = useState<SimState>('staging');
  const [countdownNum, setCountdownNum] = useState<number>(3);

  // Synchronous State Refs to prevent stale closure in render loop
  const simStateRef = useRef<SimState>('staging');
  const cameraModeRef = useRef<CameraMode>('chase');
  const gameModeRef = useRef<RacingGameMode>('quick-race');

  const updateSimState = (state: SimState) => {
    simStateRef.current = state;
    setSimState(state);
  };

  const updateCameraMode = (mode: CameraMode) => {
    cameraModeRef.current = mode;
    setCameraMode(mode);
  };

  const updateGameMode = (mode: RacingGameMode) => {
    gameModeRef.current = mode;
    setGameMode(mode);
  };

  // Live Telemetry
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [rpm, setRpm] = useState<number>(800);
  const [currentGear, setCurrentGear] = useState<number>(1);
  const [currentLap, setCurrentLap] = useState<number>(1);
  const [totalLaps, setTotalLaps] = useState<number>(2);
  const [racePosition, setRacePosition] = useState<number>(1);
  const [lapTimeMs, setLapTimeMs] = useState<number>(0);
  const [bestLapTimeMs, setBestLapTimeMs] = useState<number | null>(null);
  const [boostPsi, setBoostPsi] = useState<number>(0);
  const [isDrifting, setIsDrifting] = useState<boolean>(false);

  // Drag Specific
  const [dragReactionTime, setDragReactionTime] = useState<number | null>(null);
  const [dragZeroToHundred, setDragZeroToHundred] = useState<number | null>(null);
  const [dragQuarterMileTime, setDragQuarterMileTime] = useState<number | null>(null);
  const [dragTrapSpeed, setDragTrapSpeed] = useState<number | null>(null);
  const [christmasTreeStage, setChristmasTreeStage] = useState<number>(0);

  // Finished Race Results
  const [finalResults, setFinalResults] = useState<{
    position: number;
    totalTimeStr: string;
    bestLapStr: string;
    maxSpeedKmh: number;
    xpEarned: number;
  } | null>(null);

  // Keyboard & Mobile Input Refs
  const keysRef = useRef<Record<string, boolean>>({});
  const mobileInputRef = useRef<{
    throttle: boolean;
    brake: boolean;
    steerLeft: boolean;
    steerRight: boolean;
    handbrake: boolean;
  }>({
    throttle: false,
    brake: false,
    steerLeft: false,
    steerRight: false,
    handbrake: false,
  });

  // Vehicle Dynamics Physics Refs
  const playerPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const playerHeadingRef = useRef<number>(0);
  const playerSteerAngleRef = useRef<number>(0);
  const playerSpeedKmhRef = useRef<number>(0);
  const playerProgressURef = useRef<number>(0);
  const currentLapRef = useRef<number>(1);
  const raceStartTimeRef = useRef<number>(0);
  const lapStartTimeRef = useRef<number>(0);
  const maxSpeedRecordedRef = useRef<number>(0);
  const opponentsRef = useRef<AiOpponent[]>([]);
  const trackSplineRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  const trackLengthRef = useRef<number>(1000);
  const dragZeroToHundredRef = useRef<number | null>(null);
  const dragQuarterMileRef = useRef<number | null>(null);
  const dragTrapSpeedRef = useRef<number | null>(null);

  const media = getVehicleMedia(config.modelType);
  const engine = getEngineForModel(config.modelType);
  const currentCircuit = CIRCUITS[circuitId];

  // ---------------------------------------------------------------------------
  // 1. THREE.JS SCENE SETUP & TRACK GENERATION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reset simulator internal values
    updateSimState('staging');
    setSpeedKmh(0);
    playerSpeedKmhRef.current = 0;
    playerProgressURef.current = 0;
    currentLapRef.current = 1;
    setCurrentLap(1);
    setTotalLaps(currentCircuit.totalLaps);
    setFinalResults(null);
    setDragReactionTime(null);
    setDragZeroToHundred(null);
    setDragQuarterMileTime(null);
    setDragTrapSpeed(null);
    setChristmasTreeStage(0);
    dragZeroToHundredRef.current = null;
    dragQuarterMileRef.current = null;
    dragTrapSpeedRef.current = null;

    const clientW = container.clientWidth || window.innerWidth;
    const clientH = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(currentCircuit.skyColor);
    scene.fog = new THREE.FogExp2(currentCircuit.fogColor, currentCircuit.fogDensity);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(72, clientW / Math.max(1, clientH), 0.1, 1200);
    camera.position.set(0, 2.2, 5.5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: graphicsTier === 'high',
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(clientW, clientH);
    renderer.setPixelRatio(graphicsTier === 'low' ? 1.0 : Math.min(window.devicePixelRatio, 1.8));
    renderer.shadowMap.enabled = graphicsTier !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.3);
    sunLight.position.set(80, 140, 60);
    if (graphicsTier !== 'low') {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 400;
      const d = 120;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
    }
    scene.add(sunLight);

    // 5. Generate Track Geometry & Spline
    let points: THREE.Vector3[] = [];
    if (currentCircuit.isDragStrip) {
      points = [
        new THREE.Vector3(0, 0, 50),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -100),
        new THREE.Vector3(0, 0, -200),
        new THREE.Vector3(0, 0, -300),
        new THREE.Vector3(0, 0, -402), // 1/4 Mile Mark
        new THREE.Vector3(0, 0, -600), // Runoff area
      ];
    } else if (circuitId === 'tokyo-c1') {
      points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -250),
        new THREE.Vector3(80, 4, -420),
        new THREE.Vector3(260, 6, -460),
        new THREE.Vector3(420, 2, -350),
        new THREE.Vector3(460, 0, -150),
        new THREE.Vector3(380, 0, 100),
        new THREE.Vector3(180, 0, 200),
        new THREE.Vector3(40, 0, 120),
      ];
    } else if (circuitId === 'big-sur') {
      points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-60, 5, -200),
        new THREE.Vector3(-180, 18, -380),
        new THREE.Vector3(-80, 28, -520),
        new THREE.Vector3(120, 22, -600),
        new THREE.Vector3(280, 12, -450),
        new THREE.Vector3(340, 6, -240),
        new THREE.Vector3(220, 2, -40),
        new THREE.Vector3(80, 0, 40),
      ];
    } else {
      points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -300),
        new THREE.Vector3(-70, 2, -440),
        new THREE.Vector3(-180, 5, -420),
        new THREE.Vector3(-260, 7, -260),
        new THREE.Vector3(-220, 6, -120),
        new THREE.Vector3(-80, 4, -60),
        new THREE.Vector3(60, 2, -180),
        new THREE.Vector3(190, 0, -320),
        new THREE.Vector3(320, 0, -240),
        new THREE.Vector3(340, 0, -60),
        new THREE.Vector3(220, 0, 80),
        new THREE.Vector3(80, 0, 60),
      ];
    }

    const spline = new THREE.CatmullRomCurve3(points, !currentCircuit.isDragStrip);
    trackSplineRef.current = spline;
    const trackLength = spline.getLength();
    trackLengthRef.current = trackLength;

    // Track Surface Mesh
    const trackWidth = currentCircuit.isDragStrip ? 14 : 18;
    const samples = currentCircuit.isDragStrip ? 80 : 360;
    const trackPoints = spline.getSpacedPoints(samples);

    // Build ribbon road mesh
    const roadGeo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= samples; i++) {
      const u = i / samples;
      const pt = spline.getPointAt(u);
      const tangent = spline.getTangentAt(u).normalize();
      const normal = new THREE.Vector3(0, 1, 0);
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      const left = pt.clone().addScaledVector(binormal, -trackWidth / 2);
      const right = pt.clone().addScaledVector(binormal, trackWidth / 2);

      vertices.push(left.x, left.y + 0.02, left.z);
      vertices.push(right.x, right.y + 0.02, right.z);

      uvs.push(0, u * 40);
      uvs.push(1, u * 40);

      if (i < samples) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setIndex(indices);
    roadGeo.computeVertexNormals();

    const roadMat = new THREE.MeshStandardMaterial({
      color: currentCircuit.asphaltColor,
      roughness: 0.65,
      metalness: 0.25,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    // Start / Finish Line Banner & Gantry
    const finishLineGeo = new THREE.PlaneGeometry(trackWidth, 2);
    finishLineGeo.rotateX(-Math.PI / 2);
    const finishLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const finishLine = new THREE.Mesh(finishLineGeo, finishLineMat);
    finishLine.position.set(0, 0.05, 0);
    scene.add(finishLine);

    // Track Outer Terrain Floor
    const terrainGeo = new THREE.PlaneGeometry(1600, 1600);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: circuitId === 'tokyo-c1' ? 0x050508 : circuitId === 'big-sur' ? 0x141812 : 0x0f140e,
      roughness: 0.95,
      metalness: 0.05,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.y = -0.1;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // Tokyo City Skyscrapers
    if (circuitId === 'tokyo-c1') {
      for (let b = 0; b < 60; b++) {
        const bHeight = 40 + Math.random() * 120;
        const bldgGeo = new THREE.BoxGeometry(20 + Math.random() * 30, bHeight, 20 + Math.random() * 30);
        const bldgMat = new THREE.MeshStandardMaterial({
          color: Math.random() > 0.4 ? 0x0f172a : 0x1e293b,
          roughness: 0.2,
          metalness: 0.8,
        });
        const bldg = new THREE.Mesh(bldgGeo, bldgMat);
        const radius = 90 + Math.random() * 240;
        const angle = Math.random() * Math.PI * 2;
        bldg.position.set(Math.cos(angle) * radius, bHeight / 2, Math.sin(angle) * radius);
        scene.add(bldg);
      }
    }

    // 6. Player 3D Vehicle Creation
    const playerGroup = new THREE.Group();
    const carLength = 4.6;
    const carWidth = 2.0;
    const carHeight = 1.15;

    // Body
    const bodyGeo = new THREE.BoxGeometry(carWidth, carHeight * 0.5, carLength);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.paintColor),
      metalness: config.paintFinish === 'metallic' ? 0.9 : config.paintFinish === 'matte' ? 0.2 : 0.6,
      roughness: config.paintFinish === 'matte' ? 0.8 : config.paintFinish === 'frozen' ? 0.5 : 0.15,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = carHeight * 0.45;
    bodyMesh.castShadow = true;
    playerGroup.add(bodyMesh);

    // Greenhouse / Cockpit Cabin
    const cabinGeo = new THREE.BoxGeometry(carWidth * 0.78, carHeight * 0.5, carLength * 0.5);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x050508,
      roughness: 0.1,
      metalness: 0.9,
    });
    const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
    cabinMesh.position.set(0, carHeight * 0.85, -carLength * 0.05);
    cabinMesh.castShadow = true;
    playerGroup.add(cabinMesh);

    // GT Wing Spoiler
    if (config.aero.carbonPackage || config.aero.spoilerStyle === 'gt-wing') {
      const wingGeo = new THREE.BoxGeometry(carWidth * 0.9, 0.08, 0.35);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x111116, metalness: 0.8, roughness: 0.2 });
      const wingMesh = new THREE.Mesh(wingGeo, wingMat);
      wingMesh.position.set(0, carHeight * 1.05, -carLength * 0.44);
      playerGroup.add(wingMesh);
    }

    // Headlights (LED Glow - facing forward along +Z)
    const headlightGeo = new THREE.BoxGeometry(0.35, 0.1, 0.1);
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hlLeft = new THREE.Mesh(headlightGeo, headlightMat);
    hlLeft.position.set(-carWidth * 0.36, carHeight * 0.45, carLength * 0.5);
    const hlRight = new THREE.Mesh(headlightGeo, headlightMat);
    hlRight.position.set(carWidth * 0.36, carHeight * 0.45, carLength * 0.5);
    playerGroup.add(hlLeft, hlRight);

    // Taillights (facing rear along -Z)
    const taillightGeo = new THREE.BoxGeometry(0.35, 0.1, 0.1);
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff1122 });
    const tlLeft = new THREE.Mesh(taillightGeo, taillightMat);
    tlLeft.position.set(-carWidth * 0.36, carHeight * 0.45, -carLength * 0.5);
    const tlRight = new THREE.Mesh(taillightGeo, taillightMat);
    tlRight.position.set(carWidth * 0.36, carHeight * 0.45, -carLength * 0.5);
    playerGroup.add(tlLeft, tlRight);

    // 4 Wheels (Front at +Z, Rear at -Z)
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 18);
    wheelGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(config.wheels.rimColor), metalness: 0.9, roughness: 0.2 });

    const frontLeftWheel = new THREE.Group();
    const w1 = new THREE.Mesh(wheelGeo, tireMat);
    frontLeftWheel.add(w1);
    frontLeftWheel.position.set(-carWidth * 0.5, 0.34, carLength * 0.32);

    const frontRightWheel = new THREE.Group();
    const w2 = new THREE.Mesh(wheelGeo, tireMat);
    frontRightWheel.add(w2);
    frontRightWheel.position.set(carWidth * 0.5, 0.34, carLength * 0.32);

    const rearLeftWheel = new THREE.Group();
    const w3 = new THREE.Mesh(wheelGeo, tireMat);
    rearLeftWheel.add(w3);
    rearLeftWheel.position.set(-carWidth * 0.5, 0.34, -carLength * 0.32);

    const rearRightWheel = new THREE.Group();
    const w4 = new THREE.Mesh(wheelGeo, tireMat);
    rearRightWheel.add(w4);
    rearRightWheel.position.set(carWidth * 0.5, 0.34, -carLength * 0.32);

    playerGroup.add(frontLeftWheel, frontRightWheel, rearLeftWheel, rearRightWheel);

    // Initial Position
    const startPoint = spline.getPointAt(0);
    const startTangent = spline.getTangentAt(0).normalize();
    playerGroup.position.copy(startPoint);
    playerGroup.position.y = 0.05;
    playerPosRef.current.copy(playerGroup.position);

    const initialHeading = Math.atan2(startTangent.x, startTangent.z);
    playerGroup.rotation.y = initialHeading;
    playerHeadingRef.current = initialHeading;

    scene.add(playerGroup);

    // 7. Spawn AI Opponents (for Quick Race)
    const opponents: AiOpponent[] = [];
    if (gameModeRef.current === 'quick-race' && !currentCircuit.isDragStrip) {
      const opponentData = [
        { id: 'ai-1', name: 'K. Takahashi (R35 Nismo)', color: '#dc2626', offset: -3.5, startU: 0.015 },
        { id: 'ai-2', name: 'M. Weber (M4 GT3)', color: '#2563eb', offset: 3.5, startU: 0.025 },
        { id: 'ai-3', name: 'S. Rossi (SF90 Corse)', color: '#eab308', offset: 0.0, startU: 0.038 },
      ];

      opponentData.forEach((ai) => {
        const aiGroup = new THREE.Group();
        const aiBodyGeo = new THREE.BoxGeometry(carWidth, carHeight * 0.5, carLength);
        const aiBodyMat = new THREE.MeshStandardMaterial({ color: ai.color, metalness: 0.8, roughness: 0.2 });
        const aiMesh = new THREE.Mesh(aiBodyGeo, aiBodyMat);
        aiMesh.position.y = carHeight * 0.45;
        aiMesh.castShadow = true;

        const aiCabinGeo = new THREE.BoxGeometry(carWidth * 0.78, carHeight * 0.5, carLength * 0.5);
        const aiCabinMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0f, metalness: 0.9, roughness: 0.1 });
        const aiCabin = new THREE.Mesh(aiCabinGeo, aiCabinMat);
        aiCabin.position.set(0, carHeight * 0.85, -carLength * 0.05);

        // AI Headlights (+Z) and Taillights (-Z)
        const aiHlLeft = new THREE.Mesh(headlightGeo, headlightMat);
        aiHlLeft.position.set(-carWidth * 0.36, carHeight * 0.45, carLength * 0.5);
        const aiHlRight = new THREE.Mesh(headlightGeo, headlightMat);
        aiHlRight.position.set(carWidth * 0.36, carHeight * 0.45, carLength * 0.5);

        const aiTlLeft = new THREE.Mesh(taillightGeo, taillightMat);
        aiTlLeft.position.set(-carWidth * 0.36, carHeight * 0.45, -carLength * 0.5);
        const aiTlRight = new THREE.Mesh(taillightGeo, taillightMat);
        aiTlRight.position.set(carWidth * 0.36, carHeight * 0.45, -carLength * 0.5);

        aiGroup.add(aiMesh, aiCabin, aiHlLeft, aiHlRight, aiTlLeft, aiTlRight);
        scene.add(aiGroup);

        opponents.push({
          id: ai.id,
          name: ai.name,
          color: ai.color,
          mesh: aiGroup,
          progressU: ai.startU,
          speedKmh: 0,
          targetSpeedKmh: 240 + Math.random() * 60,
          lateralOffset: ai.offset,
          lap: 1,
        });
      });
    }
    opponentsRef.current = opponents;

    // -------------------------------------------------------------------------
    // 8. SIMULATION PHYSICS & RENDER LOOP
    // -------------------------------------------------------------------------
    let animId: number;
    let clock = new THREE.Clock();

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const dt = Math.min(0.05, clock.getDelta());
      const now = performance.now();

      // Read Inputs
      const keys = keysRef.current;
      const mobile = mobileInputRef.current;

      const isAccelerating = keys['KeyW'] || keys['ArrowUp'] || mobile.throttle;
      const isBraking = keys['KeyS'] || keys['ArrowDown'] || mobile.brake;
      const isSteeringLeft = keys['KeyA'] || keys['ArrowLeft'] || mobile.steerLeft;
      const isSteeringRight = keys['KeyD'] || keys['ArrowRight'] || mobile.steerRight;
      const isHandbraking = keys['Space'] || mobile.handbrake;

      // Physics state calculations
      const currentSpeed = playerSpeedKmhRef.current;
      const hp = engine.powerHp || 650;
      const weight = 1550;
      const maxSpeed = parseInt(media.keySpecs.topSpeed) || 330;

      // Check current live simulation state from Ref (prevents stale closure)
      if (simStateRef.current === 'racing') {
        // A. ACCELERATION
        if (isAccelerating) {
          const powerFactor = (hp / weight) * 44.0;
          const speedRatio = currentSpeed / maxSpeed;
          const torqueDrop = Math.max(0.15, 1.0 - Math.pow(speedRatio, 1.8));
          const accel = powerFactor * torqueDrop;
          playerSpeedKmhRef.current += accel * dt;
          engineSound.setThrottle(1.0);
        } else {
          // Coasting drag
          playerSpeedKmhRef.current -= (12.0 + (currentSpeed * currentSpeed * 0.00035)) * dt;
          engineSound.setThrottle(0.05);
        }

        // B. BRAKING
        if (isBraking) {
          playerSpeedKmhRef.current -= 120.0 * dt;
          engineSound.playTireScreech(0.4);
        }

        // C. HANDBRAKE & DRIFTING
        if (isHandbraking && currentSpeed > 35) {
          playerSpeedKmhRef.current -= 65.0 * dt;
          setIsDrifting(true);
          engineSound.playTireScreech(0.85);
        } else {
          setIsDrifting(false);
        }

        // Clamp Speed
        playerSpeedKmhRef.current = Math.max(0, Math.min(maxSpeed * 1.04, playerSpeedKmhRef.current));
        maxSpeedRecordedRef.current = Math.max(maxSpeedRecordedRef.current, Math.round(playerSpeedKmhRef.current));

        // D. STEERING & YAW (Corrected directional response: A/Left turns left, D/Right turns right)
        const steerSpeedMultiplier = Math.max(0.35, 1.0 - (currentSpeed / maxSpeed) * 0.65);
        const steerRate = 2.4 * steerSpeedMultiplier;

        if (isSteeringLeft) {
          playerSteerAngleRef.current = THREE.MathUtils.lerp(playerSteerAngleRef.current, -0.42, dt * 8);
          playerHeadingRef.current -= steerRate * dt * (playerSpeedKmhRef.current / 90);
          if (isHandbraking || currentSpeed > 180) {
            engineSound.playTireScreech(0.65);
          }
        } else if (isSteeringRight) {
          playerSteerAngleRef.current = THREE.MathUtils.lerp(playerSteerAngleRef.current, 0.42, dt * 8);
          playerHeadingRef.current += steerRate * dt * (playerSpeedKmhRef.current / 90);
          if (isHandbraking || currentSpeed > 180) {
            engineSound.playTireScreech(0.65);
          }
        } else {
          playerSteerAngleRef.current = THREE.MathUtils.lerp(playerSteerAngleRef.current, 0, dt * 10);
        }

        // Turn Front Wheels
        frontLeftWheel.rotation.y = playerSteerAngleRef.current;
        frontRightWheel.rotation.y = playerSteerAngleRef.current;

        // E. TRANSLATE VEHICLE FORWARD
        const forwardVector = new THREE.Vector3(
          Math.sin(playerHeadingRef.current),
          0,
          Math.cos(playerHeadingRef.current)
        ).normalize();

        const velocityMps = (playerSpeedKmhRef.current / 3.6);
        playerPosRef.current.addScaledVector(forwardVector, velocityMps * dt);
        playerGroup.position.copy(playerPosRef.current);
        playerGroup.rotation.y = playerHeadingRef.current;

        // Rotate Wheels along roll axis
        const wheelRoll = (velocityMps / 0.34) * dt;
        w1.rotation.x += wheelRoll;
        w2.rotation.x += wheelRoll;
        w3.rotation.x += wheelRoll;
        w4.rotation.x += wheelRoll;

        // F. TRACK BOUNDARY & SPLINE PROGRESS
        if (spline) {
          const trackLen = trackLengthRef.current;
          const uStep = (velocityMps * dt) / trackLen;
          playerProgressURef.current = (playerProgressURef.current + uStep);

          // Drag Strip Specific Timing & Finish Check (1/4 Mile = 402m)
          if (currentCircuit.isDragStrip) {
            const elapsedSec = (now - raceStartTimeRef.current) / 1000;
            if (dragZeroToHundredRef.current === null && playerSpeedKmhRef.current >= 100) {
              dragZeroToHundredRef.current = elapsedSec;
              setDragZeroToHundred(Number(elapsedSec.toFixed(2)));
              showToast(`0-100 KM/H SPRINT: ${elapsedSec.toFixed(2)}s`);
            }

            const distTraveled = Math.abs(playerPosRef.current.z - startPoint.z);
            if (distTraveled >= 402 && dragQuarterMileRef.current === null) {
              dragQuarterMileRef.current = elapsedSec;
              dragTrapSpeedRef.current = Math.round(playerSpeedKmhRef.current);
              setDragQuarterMileTime(Number(elapsedSec.toFixed(2)));
              setDragTrapSpeed(Math.round(playerSpeedKmhRef.current));

              updateSimState('finished');
              engineSound.playCheckeredFlagFanfare();
              showToast(`1/4 MILE: ${elapsedSec.toFixed(2)}s @ ${Math.round(playerSpeedKmhRef.current)} KM/H!`);

              setFinalResults({
                position: 1,
                totalTimeStr: `${elapsedSec.toFixed(2)}s ET`,
                bestLapStr: `0-100 in ${dragZeroToHundredRef.current ? dragZeroToHundredRef.current.toFixed(2) : '--'}s`,
                maxSpeedKmh: Math.round(playerSpeedKmhRef.current),
                xpEarned: 1000,
              });
            }
          } else {
            // Standard Closed-Circuit Lap Progress
            if (playerProgressURef.current >= 1.0) {
              playerProgressURef.current -= 1.0;
              currentLapRef.current += 1;
              setCurrentLap(currentLapRef.current);
              showToast(`COMPLETED LAP ${currentLapRef.current - 1} / ${currentCircuit.totalLaps}`);

              const lapDuration = now - lapStartTimeRef.current;
              lapStartTimeRef.current = now;
              setBestLapTimeMs((prev) => (prev ? Math.min(prev, lapDuration) : lapDuration));

              if (currentLapRef.current > currentCircuit.totalLaps) {
                updateSimState('finished');
                engineSound.playCheckeredFlagFanfare();
                showToast('CHECKERED FLAG! RACE FINISHED!');
                const totalElapsed = now - raceStartTimeRef.current;
                setFinalResults({
                  position: racePosition,
                  totalTimeStr: formatMs(totalElapsed),
                  bestLapStr: formatMs(bestLapTimeMs || totalElapsed),
                  maxSpeedKmh: maxSpeedRecordedRef.current,
                  xpEarned: racePosition === 1 ? 750 : racePosition === 2 ? 450 : 250,
                });
              }
            }

            // Off-track grass penalty check
            const nearestPt = spline.getPointAt(playerProgressURef.current);
            const lateralDist = playerGroup.position.distanceTo(nearestPt);
            if (lateralDist > trackWidth / 2 + 1.5) {
              playerSpeedKmhRef.current = Math.max(0, playerSpeedKmhRef.current - 95.0 * dt);
              engineSound.playTireScreech(0.3);
            }
          }
        }

        // G. WIND RUSH ACOUSTICS
        engineSound.playWindRush(playerSpeedKmhRef.current);

        // H. UPDATE AI OPPONENTS
        if (opponentsRef.current.length > 0 && spline) {
          let aheadCount = 0;
          opponentsRef.current.forEach((ai) => {
            ai.speedKmh = THREE.MathUtils.lerp(ai.speedKmh, ai.targetSpeedKmh, dt * 0.4);
            const aiMps = ai.speedKmh / 3.6;
            ai.progressU = (ai.progressU + (aiMps * dt) / trackLengthRef.current) % 1.0;

            const aiPoint = spline.getPointAt(ai.progressU);
            const aiTangent = spline.getTangentAt(ai.progressU).normalize();
            const aiBinormal = new THREE.Vector3().crossVectors(aiTangent, new THREE.Vector3(0, 1, 0)).normalize();

            ai.mesh.position.copy(aiPoint).addScaledVector(aiBinormal, ai.lateralOffset);
            ai.mesh.position.y = 0.05;
            ai.mesh.rotation.y = Math.atan2(aiTangent.x, aiTangent.z);

            if (ai.progressU > playerProgressURef.current) {
              aheadCount++;
            }

            const distToAi = playerGroup.position.distanceTo(ai.mesh.position);
            if (distToAi < 2.6) {
              engineSound.playCollisionSound(1.2);
              playerSpeedKmhRef.current = Math.max(10, playerSpeedKmhRef.current * 0.82);
              ai.speedKmh *= 0.85;
            }
          });
          setRacePosition(aheadCount + 1);
        }

        // I. UPDATE TIMERS & UI TELEMETRY
        setLapTimeMs(now - lapStartTimeRef.current);
        setSpeedKmh(Math.round(playerSpeedKmhRef.current));

        const calculatedGear = Math.min(7, Math.max(1, Math.floor(playerSpeedKmhRef.current / 48) + 1));
        setCurrentGear(calculatedGear);
        const redline = engine.redlineRpm || 8000;
        const idle = engine.idleRpm || 800;
        const speedRatioInGear = (playerSpeedKmhRef.current % 52) / 52;
        const currentRpm = Math.min(redline, Math.round(idle + speedRatioInGear * (redline - idle)));
        setRpm(currentRpm);

        if (engine.aspiration.toLowerCase().includes('turbo')) {
          setBoostPsi(Number(((currentRpm / redline) * 22.5).toFixed(1)));
        }
      }

      // -----------------------------------------------------------------------
      // CAMERA CONTROLLER (Uses cameraModeRef to prevent stale closure)
      // -----------------------------------------------------------------------
      const activeCamMode = cameraModeRef.current;
      if (activeCamMode === 'chase') {
        const chaseDistance = 6.2 + (playerSpeedKmhRef.current / maxSpeed) * 1.8;
        const chaseHeight = 2.4;
        const camTargetPos = new THREE.Vector3()
          .copy(playerGroup.position)
          .sub(
            new THREE.Vector3(
              Math.sin(playerHeadingRef.current),
              0,
              Math.cos(playerHeadingRef.current)
            ).multiplyScalar(chaseDistance)
          );
        camTargetPos.y = playerGroup.position.y + chaseHeight;

        camera.position.lerp(camTargetPos, 0.12);
        camera.lookAt(playerGroup.position.x, playerGroup.position.y + 1.1, playerGroup.position.z);
        camera.fov = 72 + (playerSpeedKmhRef.current / maxSpeed) * 18;
        camera.updateProjectionMatrix();
      } else if (activeCamMode === 'hood') {
        camera.position.set(
          playerGroup.position.x + Math.sin(playerHeadingRef.current) * 1.2,
          playerGroup.position.y + 0.95,
          playerGroup.position.z + Math.cos(playerHeadingRef.current) * 1.2
        );
        const lookTarget = new THREE.Vector3(
          playerGroup.position.x + Math.sin(playerHeadingRef.current) * 20,
          playerGroup.position.y + 0.95,
          playerGroup.position.z + Math.cos(playerHeadingRef.current) * 20
        );
        camera.lookAt(lookTarget);
      } else {
        // Cockpit Camera
        camera.position.set(
          playerGroup.position.x - Math.sin(playerHeadingRef.current) * 0.1,
          playerGroup.position.y + 1.05,
          playerGroup.position.z - Math.cos(playerHeadingRef.current) * 0.1
        );
        const lookTarget = new THREE.Vector3(
          playerGroup.position.x + Math.sin(playerHeadingRef.current) * 30,
          playerGroup.position.y + 1.0,
          playerGroup.position.z + Math.cos(playerHeadingRef.current) * 30
        );
        camera.lookAt(lookTarget);
      }

      renderer.render(scene, camera);

      // Render 2D Circuit Mini-map
      renderMinimap();
    };

    animId = requestAnimationFrame(loop);

    // Keyboard Events
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'KeyC') {
        const next = cameraModeRef.current === 'chase' ? 'hood' : cameraModeRef.current === 'hood' ? 'cockpit' : 'chase';
        updateCameraMode(next);
      } else if (e.code === 'Enter' || e.code === 'Space') {
        if (simStateRef.current === 'staging') {
          handleStartRace();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    handleResize();

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
      engineSound.stop();
    };
  }, [circuitId, gameMode, graphicsTier]);

  // ---------------------------------------------------------------------------
  // 2. 2D CANVAS MINIMAP RENDERER
  // ---------------------------------------------------------------------------
  const renderMinimap = () => {
    const canvas = minimapCanvasRef.current;
    if (!canvas || !trackSplineRef.current || currentCircuit.isDragStrip) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pts = trackSplineRef.current.getSpacedPoints(80);

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    pts.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    });

    const w = canvas.width - 24;
    const h = canvas.height - 24;
    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;

    // Draw track path
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const cx = 12 + ((p.x - minX) / rangeX) * w;
      const cy = 12 + ((p.z - minZ) / rangeZ) * h;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.closePath();
    ctx.stroke();

    // Draw Opponents Dots
    opponentsRef.current.forEach((ai) => {
      const p = ai.mesh.position;
      const ax = 12 + ((p.x - minX) / rangeX) * w;
      const ay = 12 + ((p.z - minZ) / rangeZ) * h;
      ctx.fillStyle = ai.color;
      ctx.beginPath();
      ctx.arc(ax, ay, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Player Dot
    const pPos = playerPosRef.current;
    const px = 12 + ((pPos.x - minX) / rangeX) * w;
    const py = 12 + ((pPos.z - minZ) / rangeZ) * h;
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  // ---------------------------------------------------------------------------
  // 3. START COUNTDOWN SEQUENCE
  // ---------------------------------------------------------------------------
  const handleStartRace = () => {
    updateSimState('countdown');
    setCountdownNum(3);
    engineSound.setProfile(engine.soundProfile);
    engineSound.start();
    engineSound.playCountdownBeep(false);

    setTimeout(() => {
      setCountdownNum(2);
      engineSound.playCountdownBeep(false);
    }, 1000);

    setTimeout(() => {
      setCountdownNum(1);
      engineSound.playCountdownBeep(false);
    }, 2000);

    setTimeout(() => {
      setCountdownNum(0); // GO!
      engineSound.playCountdownBeep(true);
      updateSimState('racing');
      const now = performance.now();
      raceStartTimeRef.current = now;
      lapStartTimeRef.current = now;
      showToast('GREEN LIGHT! GO!');
    }, 3000);
  };

  const formatMs = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const m = Math.floor((ms % 1000) / 10);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full bg-[#08080a] text-white select-none overflow-hidden font-sans">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* -------------------------------------------------------------------- */}
      {/* OVERLAY: PRE-RACE STAGING & MODE SELECTION                           */}
      {/* -------------------------------------------------------------------- */}
      {simState === 'staging' && (
        <div className="absolute inset-0 z-40 bg-[#08080a]/92 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 pt-20 sm:pt-24 overflow-y-auto">
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <button
              onClick={onExit}
              className="flex items-center gap-2 text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-widest cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO GARAGE</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                QUALITY:
              </span>
              <div className="flex rounded-full bg-white/5 border border-white/10 p-0.5 font-mono text-[10px]">
                {(['low', 'medium', 'high'] as GraphicsQuality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => setGraphicsTier(q)}
                    className={`px-3 py-1 rounded-full uppercase font-bold cursor-pointer transition-all ${
                      graphicsTier === q ? 'bg-amber-400 text-black' : 'text-neutral-400'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center Stage: Circuit & Game Mode Selection */}
          <div className="max-w-5xl mx-auto w-full my-auto py-6 space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block mb-1">
                RACING SIMULATOR 3D // MOTORSPORT PLATFORM
              </span>
              <h1 className="font-syne font-black text-3xl sm:text-5xl text-white tracking-tighter uppercase leading-[0.95]">
                SELECT CIRCUIT & DISCIPLINE.
              </h1>
            </div>

            {/* Game Mode Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'quick-race', label: 'QUICK RACE (AI GRID)' },
                { id: 'time-trial', label: 'TIME TRIAL (HOT LAP)' },
                { id: 'drag', label: 'DRAG RACING (1/4 MILE)' },
                { id: 'free-drive', label: 'FREE DRIVE (TEST TRACK)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    updateGameMode(m.id as RacingGameMode);
                    if (m.id === 'drag') setCircuitId('drag-strip');
                    else if (circuitId === 'drag-strip') setCircuitId('nurburgring');
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    gameMode === m.id
                      ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                      : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Circuit Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(CIRCUITS) as TrackCircuitId[]).map((id) => {
                const c = CIRCUITS[id];
                const isSelected = circuitId === id;
                return (
                  <div
                    key={id}
                    onClick={() => setCircuitId(id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400/80 shadow-xl ring-1 ring-amber-400/30'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                          {c.lengthKm} KM
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </div>
                      <h4 className="font-syne font-bold text-base text-white">{c.name}</h4>
                      <p className="text-[11px] text-neutral-400 font-sans mt-1 line-clamp-2">
                        {c.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between font-mono text-[10px]">
                      <span className="text-neutral-500 uppercase">RECORD</span>
                      <span className="text-amber-400 font-bold">{c.recordLap}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Bar: Action Trigger */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono text-neutral-300">
                ACTIVE VEHICLE: <span className="text-white font-bold">{media.name}</span> ({engine.powerHp} HP)
              </span>
            </div>

            <button
              onClick={handleStartRace}
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-syne font-black text-sm uppercase tracking-wider transition-all shadow-2xl flex items-center justify-center gap-3 cursor-pointer hover:scale-105"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>COMMENCE SIMULATION (PRESS ENTER)</span>
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* OVERLAY: 3-2-1-GO COUNTDOWN BANNER                                   */}
      {/* -------------------------------------------------------------------- */}
      {simState === 'countdown' && (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-400 mb-4">
            START SEQUENCE
          </span>
          <div className="text-9xl sm:text-[12rem] font-syne font-black text-amber-400 animate-bounce leading-none drop-shadow-[0_0_50px_rgba(251,191,36,0.8)]">
            {countdownNum === 0 ? 'GO!' : countdownNum}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* OVERLAY: ACTIVE RACE HUD                                             */}
      {/* -------------------------------------------------------------------- */}
      {simState === 'racing' && (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6">
          {/* Top Bar: Lap, Position, Timing */}
          <div className="flex items-start justify-between">
            {/* Position & Lap Box */}
            <div className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 flex flex-col">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">POSITION</span>
                <span className="text-3xl font-syne font-black text-amber-400 leading-none mt-0.5">
                  P{racePosition}<span className="text-xs text-neutral-400 font-mono">/4</span>
                </span>
              </div>

              <div className="px-5 py-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 flex flex-col">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">LAP</span>
                <span className="text-3xl font-syne font-black text-white leading-none mt-0.5">
                  {currentLap}<span className="text-xs text-neutral-400 font-mono">/{totalLaps}</span>
                </span>
              </div>
            </div>

            {/* Lap Timer & Split */}
            <div className="flex items-center gap-4">
              <div className="px-5 py-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-right">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 block">CURRENT LAP</span>
                <span className="text-2xl font-mono font-bold text-white tracking-wider">
                  {formatMs(lapTimeMs)}
                </span>
                {bestLapTimeMs && (
                  <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                    BEST: {formatMs(bestLapTimeMs)}
                  </span>
                )}
              </div>

              {/* Mini-map Canvas */}
              {!currentCircuit.isDragStrip && (
                <div className="w-28 h-28 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 overflow-hidden relative shadow-lg">
                  <canvas ref={minimapCanvasRef} width={112} height={112} className="w-full h-full" />
                </div>
              )}
            </div>
          </div>

          {/* Center Drifting Indicator */}
          {isDrifting && (
            <div className="self-center px-6 py-2 rounded-full bg-amber-400 text-black font-syne font-black text-sm tracking-widest uppercase animate-pulse shadow-xl shadow-amber-400/40">
              DRIFT ANGLE ACTIVE // TIRE SCRUB
            </div>
          )}

          {/* Bottom HUD: Tachometer, Speed, Controls & Camera */}
          <div className="flex items-end justify-between">
            {/* Speedometer & Gear */}
            <div className="flex items-end gap-4">
              <div className="p-6 rounded-3xl bg-black/80 backdrop-blur-md border border-white/10 flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl sm:text-7xl font-grotesk font-black text-white tracking-tighter leading-none">
                    {speedKmh}
                  </span>
                  <span className="text-sm font-mono text-neutral-400 uppercase tracking-widest">
                    KM/H
                  </span>
                </div>

                {/* Tachometer Bar */}
                <div className="mt-3 w-48 sm:w-60 h-2.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 rounded-full ${
                      rpm > (engine.redlineRpm || 8000) * 0.9 ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
                    }`}
                    style={{
                      width: `${Math.min(100, (rpm / (engine.redlineRpm || 8000)) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1.5">
                  <span>{rpm} RPM</span>
                  <span className="text-amber-400 font-bold">{boostPsi} PSI BOOST</span>
                </div>
              </div>

              {/* Gear Indicator */}
              <div className="w-20 h-20 rounded-3xl bg-black/80 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center">
                <span className="text-[9px] font-mono text-neutral-400 uppercase">GEAR</span>
                <span className="text-3xl font-syne font-black text-amber-400 leading-none mt-0.5">
                  {currentGear}
                </span>
              </div>
            </div>

            {/* Quick Actions (Camera & Pause) */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => {
                  const next = cameraModeRef.current === 'chase' ? 'hood' : cameraModeRef.current === 'hood' ? 'cockpit' : 'chase';
                  updateCameraMode(next);
                }}
                className="px-4 py-2.5 rounded-2xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/10 font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>CAM: {cameraMode.toUpperCase()}</span>
              </button>

              <button
                onClick={() => updateSimState('staging')}
                className="p-2.5 rounded-2xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/10 cursor-pointer transition-all text-neutral-400 hover:text-white"
                title="Restart or change track"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MOBILE ON-SCREEN TOUCH CONTROLS                                       */}
      {/* -------------------------------------------------------------------- */}
      {simState === 'racing' && (
        <div className="sm:hidden absolute inset-x-0 bottom-4 z-40 px-4 flex justify-between items-end pointer-events-none">
          {/* Steering Left / Right */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onTouchStart={() => (mobileInputRef.current.steerLeft = true)}
              onTouchEnd={() => (mobileInputRef.current.steerLeft = false)}
              className="w-16 h-16 rounded-2xl bg-black/70 border border-white/20 active:bg-amber-400 active:text-black flex items-center justify-center font-bold text-lg select-none"
            >
              ◄
            </button>
            <button
              onTouchStart={() => (mobileInputRef.current.steerRight = true)}
              onTouchEnd={() => (mobileInputRef.current.steerRight = false)}
              className="w-16 h-16 rounded-2xl bg-black/70 border border-white/20 active:bg-amber-400 active:text-black flex items-center justify-center font-bold text-lg select-none"
            >
              ►
            </button>
          </div>

          {/* Pedals: Brake, Handbrake, Throttle */}
          <div className="pointer-events-auto flex items-end gap-2">
            <button
              onTouchStart={() => (mobileInputRef.current.handbrake = true)}
              onTouchEnd={() => (mobileInputRef.current.handbrake = false)}
              className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 text-[10px] font-mono font-bold uppercase active:bg-red-500 text-red-300 active:text-black flex items-center justify-center select-none"
            >
              DRIFT
            </button>

            <button
              onTouchStart={() => (mobileInputRef.current.brake = true)}
              onTouchEnd={() => (mobileInputRef.current.brake = false)}
              className="w-14 h-16 rounded-2xl bg-white/10 border border-white/20 text-xs font-mono font-bold uppercase active:bg-white active:text-black flex items-center justify-center select-none"
            >
              BRAKE
            </button>

            <button
              onTouchStart={() => (mobileInputRef.current.throttle = true)}
              onTouchEnd={() => (mobileInputRef.current.throttle = false)}
              className="w-16 h-20 rounded-2xl bg-amber-400/20 border border-amber-400/60 text-xs font-mono font-black uppercase active:bg-amber-400 text-amber-300 active:text-black flex items-center justify-center select-none"
            >
              GAS
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* OVERLAY: POST-RACE RESULTS & TELEMETRY BREAKDOWN                     */}
      {/* -------------------------------------------------------------------- */}
      {simState === 'finished' && finalResults && (
        <div className="absolute inset-0 z-50 bg-[#08080a]/95 backdrop-blur-2xl flex flex-col justify-center items-center p-6 sm:p-12 animate-fadeIn">
          <div className="max-w-xl w-full p-8 sm:p-10 rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mx-auto">
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400">
                OFFICIAL RACE CLASSIFICATION
              </span>
              <h2 className="font-syne font-black text-4xl text-white uppercase tracking-tight mt-1">
                {finalResults.position === 1
                  ? 'VICTORY — 1ST PLACE'
                  : `FINISHED P${finalResults.position}`}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                {currentCircuit.name} • {media.name}
              </p>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/10 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-neutral-500 uppercase block">
                  {currentCircuit.isDragStrip ? '1/4 MILE ET' : 'TOTAL TIME'}
                </span>
                <span className="text-lg font-bold text-white">{finalResults.totalTimeStr}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-neutral-500 uppercase block">
                  {currentCircuit.isDragStrip ? '0-100 SPRINT' : 'BEST LAP'}
                </span>
                <span className="text-lg font-bold text-amber-400">{finalResults.bestLapStr}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-neutral-500 uppercase block">
                  {currentCircuit.isDragStrip ? 'TRAP VELOCITY' : 'TOP VELOCITY'}
                </span>
                <span className="text-lg font-bold text-white">{finalResults.maxSpeedKmh} KM/H</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-neutral-500 uppercase block">XP REWARD</span>
                <span className="text-lg font-bold text-emerald-400">+{finalResults.xpEarned} XP</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => updateSimState('staging')}
                className="flex-1 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                RACE AGAIN
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-syne font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              >
                RETURN TO GARAGE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
