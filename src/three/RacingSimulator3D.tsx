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
    description: 'High-speed cambered coastal asphalt flanked by rugged Pacific sea cliffs and dusk lighting.',
  },
  'drag-strip': {
    id: 'drag-strip',
    name: 'Santa Pod 1/4 Mile Dragway',
    location: 'Bedfordshire, UK',
    lengthKm: 0.402,
    totalLaps: 1,
    recordLap: '00:08.420',
    skyColor: 0x11131c,
    fogColor: 0x0a0c12,
    fogDensity: 0.002,
    asphaltColor: 0x181920,
    curbColor: 0xeab308,
    barrierColor: 0x64748b,
    isDragStrip: true,
    description: 'Full 1/4-mile straight (402m) launch strip with Christmas Tree staging sensors and trap speed radar.',
  },
};

type CameraMode = 'chase' | 'hood' | 'cockpit';
type SimState = 'staging' | 'countdown' | 'racing' | 'finished';

interface AiOpponent {
  id: string;
  name: string;
  color: string;
  mesh: THREE.Group;
  progressU: number; // 0 to 1 along spline
  speedKmh: number;
  targetSpeedKmh: number;
  lateralOffset: number; // offset from track center line
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
  const [christmasTreeStage, setChristmasTreeStage] = useState<number>(0); // 0=off, 1=pre-stage, 2=stage, 3=yellow1, 4=yellow2, 5=yellow3, 6=green, 7=red fault

  // Finished Race Results
  const [finalResults, setFinalResults] = useState<{
    position: number;
    totalTimeStr: string;
    bestLapStr: string;
    maxSpeedKmh: number;
    xpEarned: number;
  } | null>(null);

  // Internal references
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

  const playerPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.4, 0));
  const playerVelocityRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
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
    setSimState('staging');
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

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(currentCircuit.skyColor);
    scene.fog = new THREE.FogExp2(currentCircuit.fogColor, currentCircuit.fogDensity);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(72, container.clientWidth / container.clientHeight, 0.1, 1200);
    camera.position.set(0, 2.2, 5.5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: graphicsTier === 'high',
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
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
      // Perfectly straight 550m strip
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
      // Winding elevated highway loop with sharp corners
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
      // Coastal mountain pass with elevation and ocean cliffs
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
      // Nürburgring GP Circuit (Grand Prix Circuit Loop)
      points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -300), // Main straight
        new THREE.Vector3(-70, 2, -440), // Turn 1 (Castrol S)
        new THREE.Vector3(-180, 5, -420),
        new THREE.Vector3(-260, 7, -260), // Mercedes Arena
        new THREE.Vector3(-220, 6, -120),
        new THREE.Vector3(-80, 4, -60),
        new THREE.Vector3(60, 2, -180), // Kurve
        new THREE.Vector3(190, 0, -320),
        new THREE.Vector3(320, 0, -240), // Kumho Kurve
        new THREE.Vector3(340, 0, -60),
        new THREE.Vector3(220, 0, 80), // Chicane
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
    const normals: number[] = [];

    for (let i = 0; i < trackPoints.length; i++) {
      const p = trackPoints[i];
      const nextP = trackPoints[(i + 1) % trackPoints.length];
      const tangent = new THREE.Vector3().subVectors(nextP, p).normalize();
      const normal = new THREE.Vector3(0, 1, 0);
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      const left = new THREE.Vector3().copy(p).addScaledVector(binormal, trackWidth / 2);
      const right = new THREE.Vector3().copy(p).addScaledVector(binormal, -trackWidth / 2);

      vertices.push(left.x, left.y + 0.02, left.z);
      vertices.push(right.x, right.y + 0.02, right.z);

      const u = i / trackPoints.length;
      uvs.push(0, u * 40);
      uvs.push(1, u * 40);

      normals.push(0, 1, 0);
      normals.push(0, 1, 0);
    }

    const indices: number[] = [];
    const maxVertPairs = trackPoints.length;
    for (let i = 0; i < maxVertPairs - (currentCircuit.isDragStrip ? 1 : 0); i++) {
      const next = (i + 1) % maxVertPairs;
      const v0 = i * 2;
      const v1 = i * 2 + 1;
      const v2 = next * 2;
      const v3 = next * 2 + 1;

      indices.push(v0, v1, v2);
      indices.push(v2, v1, v3);
    }

    roadGeo.setIndex(indices);
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

    const roadMat = new THREE.MeshStandardMaterial({
      color: currentCircuit.asphaltColor,
      roughness: 0.65,
      metalness: 0.2,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    // Ground Plane / Surrounding Terrain
    const groundGeo = new THREE.PlaneGeometry(1600, 1600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: circuitId === 'tokyo-c1' ? 0x090a0f : circuitId === 'big-sur' ? 0x1f1b1a : 0x141f17,
      roughness: 0.9,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.05;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Start/Finish Gantry & Overhead Truss
    const gantryGroup = new THREE.Group();
    const gantryPillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const pillarGeo = new THREE.BoxGeometry(0.8, 8, 0.8);
    const p1 = new THREE.Mesh(pillarGeo, gantryPillarMat);
    p1.position.set(-trackWidth / 2 - 1.2, 4, 0);
    const p2 = new THREE.Mesh(pillarGeo, gantryPillarMat);
    p2.position.set(trackWidth / 2 + 1.2, 4, 0);

    const beamGeo = new THREE.BoxGeometry(trackWidth + 3.2, 1.2, 1.2);
    const beam = new THREE.Mesh(beamGeo, gantryPillarMat);
    beam.position.set(0, 7.5, 0);

    const bannerMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
    const bannerGeo = new THREE.BoxGeometry(trackWidth, 1.4, 0.2);
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, 6.2, 0);

    gantryGroup.add(p1, p2, beam, banner);
    gantryGroup.position.set(0, 0, 0);
    scene.add(gantryGroup);

    // Guardrails / Armco Barriers along the track perimeter
    const barrierGeo = new THREE.BoxGeometry(0.25, 1.0, 4);
    const barrierMat = new THREE.MeshStandardMaterial({
      color: currentCircuit.barrierColor,
      metalness: 0.7,
      roughness: 0.3,
    });

    const barrierStride = currentCircuit.isDragStrip ? 8 : 12;
    for (let i = 0; i < trackPoints.length; i += barrierStride) {
      const p = trackPoints[i];
      const nextP = trackPoints[(i + 1) % trackPoints.length];
      const tangent = new THREE.Vector3().subVectors(nextP, p).normalize();
      const normal = new THREE.Vector3(0, 1, 0);
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      const bLeft = new THREE.Mesh(barrierGeo, barrierMat);
      bLeft.position.copy(p).addScaledVector(binormal, trackWidth / 2 + 0.8);
      bLeft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      scene.add(bLeft);

      const bRight = new THREE.Mesh(barrierGeo, barrierMat);
      bRight.position.copy(p).addScaledVector(binormal, -trackWidth / 2 - 0.8);
      bRight.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      scene.add(bRight);
    }

    // City Buildings if Tokyo C1
    if (circuitId === 'tokyo-c1') {
      const bldgGeo = new THREE.BoxGeometry(30, 120, 30);
      for (let i = 0; i < 40; i++) {
        const bldgMat = new THREE.MeshStandardMaterial({
          color: Math.random() > 0.4 ? 0x0f172a : 0x1e293b,
          roughness: 0.2,
          metalness: 0.8,
        });
        const bldg = new THREE.Mesh(bldgGeo, bldgMat);
        const radius = 90 + Math.random() * 240;
        const angle = Math.random() * Math.PI * 2;
        bldg.position.set(Math.cos(angle) * radius, 60, Math.sin(angle) * radius);
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
      wingMesh.position.set(0, carHeight * 1.05, carLength * 0.44);
      playerGroup.add(wingMesh);
    }

    // Headlights (LED Glow)
    const headlightGeo = new THREE.BoxGeometry(0.35, 0.1, 0.1);
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hlLeft = new THREE.Mesh(headlightGeo, headlightMat);
    hlLeft.position.set(-carWidth * 0.36, carHeight * 0.45, -carLength * 0.5);
    const hlRight = new THREE.Mesh(headlightGeo, headlightMat);
    hlRight.position.set(carWidth * 0.36, carHeight * 0.45, -carLength * 0.5);
    playerGroup.add(hlLeft, hlRight);

    // Taillights
    const taillightGeo = new THREE.BoxGeometry(0.35, 0.1, 0.1);
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff1122 });
    const tlLeft = new THREE.Mesh(taillightGeo, taillightMat);
    tlLeft.position.set(-carWidth * 0.36, carHeight * 0.45, carLength * 0.5);
    const tlRight = new THREE.Mesh(taillightGeo, taillightMat);
    tlRight.position.set(carWidth * 0.36, carHeight * 0.45, carLength * 0.5);
    playerGroup.add(tlLeft, tlRight);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 18);
    wheelGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(config.wheels.rimColor), metalness: 0.9, roughness: 0.2 });

    const frontLeftWheel = new THREE.Group();
    const w1 = new THREE.Mesh(wheelGeo, tireMat);
    frontLeftWheel.add(w1);
    frontLeftWheel.position.set(-carWidth * 0.5, 0.34, -carLength * 0.32);

    const frontRightWheel = new THREE.Group();
    const w2 = new THREE.Mesh(wheelGeo, tireMat);
    frontRightWheel.add(w2);
    frontRightWheel.position.set(carWidth * 0.5, 0.34, -carLength * 0.32);

    const rearLeftWheel = new THREE.Group();
    const w3 = new THREE.Mesh(wheelGeo, tireMat);
    rearLeftWheel.add(w3);
    rearLeftWheel.position.set(-carWidth * 0.5, 0.34, carLength * 0.32);

    const rearRightWheel = new THREE.Group();
    const w4 = new THREE.Mesh(wheelGeo, tireMat);
    rearRightWheel.add(w4);
    rearRightWheel.position.set(carWidth * 0.5, 0.34, carLength * 0.32);

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
    if (gameMode === 'quick-race' && !currentCircuit.isDragStrip) {
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

        aiGroup.add(aiMesh, aiCabin);
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
      const weight = 1550; // kg
      const maxSpeed = parseInt(media.keySpecs.topSpeed) || 330;

      if (simState === 'racing') {
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

        // D. STEERING & YAW
        const speedKmhNorm = Math.max(15, playerSpeedKmhRef.current);
        // Speed-dependent steering angle (tighter at high speeds)
        const steerSpeedMultiplier = Math.max(0.35, 1.0 - (currentSpeed / maxSpeed) * 0.65);
        const steerRate = 2.4 * steerSpeedMultiplier;

        if (isSteeringLeft) {
          playerSteerAngleRef.current = THREE.MathUtils.lerp(playerSteerAngleRef.current, 0.42, dt * 8);
          playerHeadingRef.current += steerRate * dt * (playerSpeedKmhRef.current / 90);
          if (isHandbraking || currentSpeed > 180) {
            engineSound.playTireScreech(0.65);
          }
        } else if (isSteeringRight) {
          playerSteerAngleRef.current = THREE.MathUtils.lerp(playerSteerAngleRef.current, -0.42, dt * 8);
          playerHeadingRef.current -= steerRate * dt * (playerSpeedKmhRef.current / 90);
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
          // Find closest U on track spline
          const trackLen = trackLengthRef.current;
          const uStep = (velocityMps * dt) / trackLen;
          playerProgressURef.current = (playerProgressURef.current + uStep);

          if (playerProgressURef.current >= 1.0) {
            playerProgressURef.current -= 1.0;
            currentLapRef.current += 1;
            setCurrentLap(currentLapRef.current);
            showToast(`COMPLETED LAP ${currentLapRef.current - 1} / ${currentCircuit.totalLaps}`);

            // Lap time check
            const now = performance.now();
            const lapDuration = now - lapStartTimeRef.current;
            lapStartTimeRef.current = now;
            setBestLapTimeMs((prev) => (prev ? Math.min(prev, lapDuration) : lapDuration));

            if (currentLapRef.current > currentCircuit.totalLaps) {
              // Finish Race
              setSimState('finished');
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
          const trackCenter = spline.getPointAt(playerProgressURef.current % 1.0);
          const distToCenter = playerPosRef.current.distanceTo(trackCenter);
          if (distToCenter > trackWidth / 2 + 1.5) {
            // In grass/gravel
            playerSpeedKmhRef.current = Math.max(0, playerSpeedKmhRef.current - 90.0 * dt);
            engineSound.playTireScreech(0.3);
          }
        }

        // G. WIND RUSH ACOUSTICS
        engineSound.playWindRush(playerSpeedKmhRef.current);

        // H. UPDATE AI OPPONENTS
        if (opponentsRef.current.length > 0 && spline) {
          let aheadCount = 0;
          opponentsRef.current.forEach((ai) => {
            // AI acceleration and speed target
            ai.speedKmh = THREE.MathUtils.lerp(ai.speedKmh, ai.targetSpeedKmh, dt * 0.4);
            const aiMps = ai.speedKmh / 3.6;
            ai.progressU = (ai.progressU + (aiMps * dt) / trackLengthRef.current) % 1.0;

            const aiPoint = spline.getPointAt(ai.progressU);
            const aiTangent = spline.getTangentAt(ai.progressU).normalize();
            const aiBinormal = new THREE.Vector3().crossVectors(aiTangent, new THREE.Vector3(0, 1, 0)).normalize();

            ai.mesh.position.copy(aiPoint).addScaledVector(aiBinormal, ai.lateralOffset);
            ai.mesh.position.y = 0.05;
            ai.mesh.rotation.y = Math.atan2(aiTangent.x, aiTangent.z);

            // Compute race rank
            if (ai.progressU > playerProgressURef.current) {
              aheadCount++;
            }

            // Player-to-AI Collision Check
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
        const now = performance.now();
        setLapTimeMs(now - lapStartTimeRef.current);
        setSpeedKmh(Math.round(playerSpeedKmhRef.current));

        // Simulated gear and RPM
        const gearRatios = [3.8, 2.4, 1.7, 1.3, 1.0, 0.8, 0.65];
        const calculatedGear = Math.min(7, Math.max(1, Math.floor(playerSpeedKmhRef.current / 48) + 1));
        setCurrentGear(calculatedGear);
        const redline = engine.redlineRpm || 8000;
        const idle = engine.idleRpm || 800;
        const gearSpeedMax = calculatedGear * 52;
        const speedRatioInGear = (playerSpeedKmhRef.current % 52) / 52;
        const currentRpm = Math.min(redline, Math.round(idle + speedRatioInGear * (redline - idle)));
        setRpm(currentRpm);

        if (engine.aspiration.toLowerCase().includes('turbo')) {
          setBoostPsi(Number(((currentRpm / redline) * 22.5).toFixed(1)));
        }
      }

      // -----------------------------------------------------------------------
      // CAMERA CONTROLLER
      // -----------------------------------------------------------------------
      if (cameraMode === 'chase') {
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
        // Dynamic FOV for speed sensation
        camera.fov = 72 + (playerSpeedKmhRef.current / maxSpeed) * 18;
        camera.updateProjectionMatrix();
      } else if (cameraMode === 'hood') {
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
        setCameraMode((prev) => (prev === 'chase' ? 'hood' : prev === 'hood' ? 'cockpit' : 'chase'));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
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

    // Map bounds
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
    setSimState('countdown');
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
      setSimState('racing');
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
    <div className="relative w-full h-screen bg-[#08080a] text-white select-none overflow-hidden font-sans">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* -------------------------------------------------------------------- */}
      {/* OVERLAY: PRE-RACE STAGING & MODE SELECTION                           */}
      {/* -------------------------------------------------------------------- */}
      {simState === 'staging' && (
        <div className="absolute inset-0 z-40 bg-[#08080a]/90 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
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
          <div className="max-w-5xl mx-auto w-full my-auto py-8 space-y-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block mb-2">
                RACING SIMULATOR 3D // MOTORSPORT PLATFORM
              </span>
              <h1 className="font-syne font-black text-4xl sm:text-6xl text-white tracking-tighter uppercase leading-[0.95]">
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
                    setGameMode(m.id as RacingGameMode);
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
                        ? 'bg-white/10 border-amber-400 shadow-xl ring-1 ring-amber-400/40'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                        {c.location}
                      </span>
                      <h3 className="font-syne font-bold text-lg text-white mb-2">{c.name}</h3>
                      <p className="text-xs text-neutral-400 font-sans line-clamp-2">{c.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-400 font-bold">{c.lengthKm} KM</span>
                      <span className="text-neutral-400">{c.totalLaps} {c.totalLaps === 1 ? 'LAP' : 'LAPS'}</span>
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
                ACTIVE WEAPON: <span className="text-white font-bold">{media.name}</span> ({engine.powerHp} HP)
              </span>
            </div>

            <button
              onClick={handleStartRace}
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-syne font-black text-sm uppercase tracking-wider transition-all shadow-2xl flex items-center justify-center gap-3 cursor-pointer hover:scale-105"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>COMMENCE SIMULATION</span>
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
                <div className="w-28 h-28 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 p-1 flex items-center justify-center">
                  <canvas ref={minimapCanvasRef} width={112} height={112} />
                </div>
              )}
            </div>
          </div>

          {/* Center Warning Prompts (Drift / Redline) */}
          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            {isDrifting && (
              <div className="px-5 py-1.5 rounded-full bg-amber-400 text-black font-mono font-black text-xs uppercase tracking-widest animate-pulse shadow-lg">
                DRIFT ANGLE ACTIVE
              </div>
            )}
            {rpm > (engine.redlineRpm || 8000) * 0.92 && (
              <div className="px-6 py-2 rounded-full bg-red-600 text-white font-mono font-black text-xs uppercase tracking-widest animate-bounce shadow-xl">
                ▲ SHIFT UP [AUTO SYNC] ▲
              </div>
            )}
          </div>

          {/* Bottom Deck: Speedometer & Tachometer */}
          <div className="flex items-end justify-between">
            {/* Camera Switcher Pill */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => setCameraMode((prev) => (prev === 'chase' ? 'hood' : prev === 'hood' ? 'cockpit' : 'chase'))}
                className="px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span className="capitalize">{cameraMode} Cam (Key: C)</span>
              </button>
            </div>

            {/* Central Instruments */}
            <div className="flex items-end gap-6 bg-black/70 backdrop-blur-xl border border-white/15 rounded-3xl p-5 shadow-2xl">
              {/* Gear Box */}
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                <span className="text-[9px] font-mono text-neutral-400 uppercase">GEAR</span>
                <span className="text-3xl font-syne font-black text-amber-400 leading-none mt-0.5">{currentGear}</span>
              </div>

              {/* Speedometer */}
              <div className="text-right">
                <div className="text-7xl font-syne font-black text-white leading-none tracking-tight">
                  {speedKmh}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mt-1 flex items-center justify-end gap-2">
                  <span className="text-amber-400 font-bold">KM / H</span>
                  <span>•</span>
                  <span>{Math.round(speedKmh * 0.621371)} MPH</span>
                  {boostPsi > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-cyan-400 font-bold">{boostPsi} PSI</span>
                    </>
                  )}
                </div>
              </div>

              {/* RPM Bar */}
              <div className="flex flex-col gap-1 w-32 pb-2">
                <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                  <span>RPM</span>
                  <span>{rpm}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 rounded-full transition-all duration-75"
                    style={{ width: `${Math.min(100, (rpm / (engine.redlineRpm || 8000)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MOBILE ON-SCREEN TOUCH CONTROLS (Always accessible)                  */}
      {/* -------------------------------------------------------------------- */}
      {simState === 'racing' && (
        <div className="sm:hidden absolute inset-x-0 bottom-4 z-40 px-4 flex justify-between items-end pointer-events-none">
          {/* Steering Left / Right */}
          <div className="flex gap-2 pointer-events-auto">
            <button
              onTouchStart={() => (mobileInputRef.current.steerLeft = true)}
              onTouchEnd={() => (mobileInputRef.current.steerLeft = false)}
              onMouseDown={() => (mobileInputRef.current.steerLeft = true)}
              onMouseUp={() => (mobileInputRef.current.steerLeft = false)}
              className="w-16 h-16 rounded-2xl bg-white/10 active:bg-amber-400/30 border border-white/20 flex items-center justify-center font-bold text-xl select-none"
            >
              ◀
            </button>
            <button
              onTouchStart={() => (mobileInputRef.current.steerRight = true)}
              onTouchEnd={() => (mobileInputRef.current.steerRight = false)}
              onMouseDown={() => (mobileInputRef.current.steerRight = true)}
              onMouseUp={() => (mobileInputRef.current.steerRight = false)}
              className="w-16 h-16 rounded-2xl bg-white/10 active:bg-amber-400/30 border border-white/20 flex items-center justify-center font-bold text-xl select-none"
            >
              ▶
            </button>
          </div>

          {/* Pedals: Brake & Gas */}
          <div className="flex gap-2 pointer-events-auto">
            <button
              onTouchStart={() => (mobileInputRef.current.brake = true)}
              onTouchEnd={() => (mobileInputRef.current.brake = false)}
              onMouseDown={() => (mobileInputRef.current.brake = true)}
              onMouseUp={() => (mobileInputRef.current.brake = false)}
              className="w-16 h-16 rounded-2xl bg-red-600/30 active:bg-red-600/60 border border-red-500/40 flex items-center justify-center font-mono font-bold text-xs uppercase"
            >
              BRAKE
            </button>
            <button
              onTouchStart={() => (mobileInputRef.current.throttle = true)}
              onTouchEnd={() => (mobileInputRef.current.throttle = false)}
              onMouseDown={() => (mobileInputRef.current.throttle = true)}
              onMouseUp={() => (mobileInputRef.current.throttle = false)}
              className="w-20 h-20 rounded-2xl bg-emerald-500/30 active:bg-emerald-500/60 border border-emerald-400/40 flex items-center justify-center font-mono font-black text-sm uppercase"
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
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 block mb-1">
                RACE RESULTS // {currentCircuit.name}
              </span>
              <h2 className="font-syne font-black text-4xl text-white uppercase">
                {finalResults.position === 1 ? 'VICTORY — P1 FINISH' : `FINISHED P${finalResults.position}`}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3 py-4 border-y border-white/10 font-mono text-center">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase block">TOTAL TIME</span>
                <span className="text-sm font-bold text-white">{finalResults.totalTimeStr}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase block">BEST LAP</span>
                <span className="text-sm font-bold text-emerald-400">{finalResults.bestLapStr}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase block">TOP SPEED</span>
                <span className="text-sm font-bold text-amber-400">{finalResults.maxSpeedKmh} KM/H</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-300">CAREER XP EARNED:</span>
              <span className="text-amber-400 font-bold">+{finalResults.xpEarned} XP</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSimState('staging')}
                className="flex-1 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                SELECT TRACK
              </button>
              <button
                onClick={handleStartRace}
                className="flex-1 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-black uppercase tracking-wider transition-all shadow-xl cursor-pointer"
              >
                RACE AGAIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
