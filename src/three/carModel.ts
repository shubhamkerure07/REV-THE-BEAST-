import * as THREE from 'three';
import { CarConfigState, PaintFinish } from '../types';

export interface CarModelInstance {
  root: THREE.Group;
  wheels: THREE.Group[];
  leftDoorPivot: THREE.Group;
  rightDoorPivot: THREE.Group;
  hoodPivot: THREE.Group;
  trunkPivot: THREE.Group;
  spoilerLipMesh: THREE.Mesh;
  spoilerGtWingGroup: THREE.Group;
  bodyMaterials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[];
  roofMaterial: THREE.MeshStandardMaterial;
  glassMaterial: THREE.MeshPhysicalMaterial;
  caliperMaterials: THREE.MeshStandardMaterial[];
  rimMaterials: THREE.MeshStandardMaterial[];
  headlightLightRings: THREE.MeshBasicMaterial[];
  kidneyGlowMaterial: THREE.MeshBasicMaterial;
  taillightMaterials: THREE.MeshBasicMaterial[];
  interiorScreenMaterial: THREE.MeshBasicMaterial;
  exhaustGlowMaterials: THREE.MeshBasicMaterial[];
  updateConfig: (config: CarConfigState) => void;
  updateAnimations: (delta: number, config: CarConfigState) => void;
}

/**
 * Creates canvas-generated textures for realistic carbon fiber and BMW badges
 */
function createCarbonFiberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, 64, 64);
  
  ctx.fillStyle = '#27272a';
  for (let x = 0; x < 64; x += 8) {
    for (let y = 0; y < 64; y += 8) {
      if ((x / 8 + y / 8) % 2 === 0) {
        ctx.fillRect(x, y, 4, 8);
      } else {
        ctx.fillRect(x + 4, y, 4, 8);
      }
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

function createBmwRoundelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  const cx = 128;
  const cy = 128;
  const r = 120;
  
  // Outer chrome ring
  ctx.fillStyle = '#c0c0c5';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  
  // Black border ring
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.arc(cx, cy, r - 12, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner blue & white quadrants
  const innerR = r - 36;
  
  // Quadrant 1 (Top Left: Blue)
  ctx.fillStyle = '#0066b1';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, innerR, Math.PI, 1.5 * Math.PI);
  ctx.closePath();
  ctx.fill();
  
  // Quadrant 2 (Top Right: White)
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, innerR, 1.5 * Math.PI, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  
  // Quadrant 3 (Bottom Right: Blue)
  ctx.fillStyle = '#0066b1';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, innerR, 0, 0.5 * Math.PI);
  ctx.closePath();
  ctx.fill();
  
  // Quadrant 4 (Bottom Left: White)
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, innerR, 0.5 * Math.PI, Math.PI);
  ctx.closePath();
  ctx.fill();
  
  // Chrome quadrant dividers
  ctx.strokeStyle = '#d4d4d8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - innerR, cy);
  ctx.lineTo(cx + innerR, cy);
  ctx.moveTo(cx, cy - innerR);
  ctx.lineTo(cx, cy + innerR);
  ctx.stroke();

  // Outer border text "BMW"
  ctx.fillStyle = '#e4e4e7';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B  M  W', cx, cy - r + 24);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createMPerformanceStripeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  
  // Cyan, Blue, Red M stripes
  ctx.fillStyle = '#00a3e0'; // Light Blue / Cyan
  ctx.fillRect(0, 0, 24, 32);
  ctx.fillStyle = '#002663'; // Dark Blue
  ctx.fillRect(24, 0, 24, 32);
  ctx.fillStyle = '#e4002b'; // Motorsport Red
  ctx.fillRect(48, 0, 24, 32);
  
  // Silver M
  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic bold 24px sans-serif';
  ctx.fillText('M', 80, 25);
  
  return new THREE.CanvasTexture(canvas);
}

function createTireTreadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#1c1c1e';
  ctx.fillRect(0, 0, 128, 128);
  
  ctx.fillStyle = '#121214';
  // Longitudinal grooves
  ctx.fillRect(20, 0, 12, 128);
  ctx.fillRect(52, 0, 12, 128);
  ctx.fillRect(84, 0, 12, 128);
  
  // Lateral sipes
  ctx.fillStyle = '#141416';
  for (let y = 0; y < 128; y += 16) {
    ctx.fillRect(0, y, 20, 3);
    ctx.fillRect(32, y + 4, 20, 3);
    ctx.fillRect(64, y + 8, 20, 3);
    ctx.fillRect(96, y + 12, 32, 3);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 16);
  return texture;
}

export function buildBmwCarModel(initialConfig: CarConfigState): CarModelInstance {
  const root = new THREE.Group();
  root.name = 'BMW_M4_Root';

  const carbonTexture = createCarbonFiberTexture();
  const roundelTexture = createBmwRoundelTexture();
  const mBadgeTexture = createMPerformanceStripeTexture();
  const tireTreadTexture = createTireTreadTexture();

  // Base Materials
  const bodyPaintMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(initialConfig.paintColor),
    metalness: 0.85,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 0.95,
  });

  const bodyMaterials = [bodyPaintMaterial];

  const carbonMaterial = new THREE.MeshStandardMaterial({
    map: carbonTexture,
    roughness: 0.35,
    metalness: 0.5,
    color: new THREE.Color(0x222224),
  });

  const blackGlossMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x0a0a0c),
    roughness: 0.15,
    metalness: 0.8,
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xdcdce0),
    roughness: 0.1,
    metalness: 0.95,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x181820),
    transmission: 0.88,
    opacity: 1.0,
    transparent: true,
    roughness: 0.05,
    ior: 1.52,
    metalness: 0.1,
  });

  const caliperMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialConfig.wheels.caliperColor),
    metalness: 0.8,
    roughness: 0.25,
  });

  const caliperMaterials = [caliperMaterial];

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialConfig.wheels.rimColor),
    metalness: 0.92,
    roughness: 0.22,
  });

  const rimMaterials = [rimMaterial];

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1a1a1c),
    roughness: 0.85,
    metalness: 0.08,
    bumpMap: tireTreadTexture,
    bumpScale: 0.02,
  });

  const brakeRotorMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x8e8e93),
    metalness: 0.95,
    roughness: 0.28,
  });

  // Lighting Materials
  const headlightLightRingMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initialConfig.haloGlowColor),
  });
  const headlightLightRings = [headlightLightRingMat];

  const kidneyGlowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initialConfig.haloGlowColor),
  });

  const taillightGlowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xff1824),
  });
  const taillightMaterials = [taillightGlowMaterial];

  const exhaustGlowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xff4500),
  });
  const exhaustGlowMaterials = [exhaustGlowMat];

  const interiorScreenMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x3b82f6),
  });

  // -------------------------------------------------------------
  // 1. CAR BODY - Sculpted Sections
  // -------------------------------------------------------------
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'Car_Body_Main';

  // Lower chassis floor & subframe
  const floorGeo = new THREE.BoxGeometry(1.72, 0.12, 4.2);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.9 });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.set(0, 0.26, 0);
  bodyGroup.add(floorMesh);

  // Main Middle Cabin Tub (tapered)
  const tubGeo = new THREE.BoxGeometry(1.86, 0.44, 2.3);
  const tubMesh = new THREE.Mesh(tubGeo, bodyPaintMaterial);
  tubMesh.position.set(0, 0.46, 0.05);
  tubMesh.castShadow = true;
  tubMesh.receiveShadow = true;
  bodyGroup.add(tubMesh);

  // Muscular Flared Front Fenders (Left and Right)
  const fenderGeo = new THREE.BoxGeometry(0.24, 0.38, 0.95);
  
  const frontFenderL = new THREE.Mesh(fenderGeo, bodyPaintMaterial);
  frontFenderL.position.set(-0.95, 0.48, 1.4);
  frontFenderL.castShadow = true;
  bodyGroup.add(frontFenderL);

  const frontFenderR = new THREE.Mesh(fenderGeo, bodyPaintMaterial);
  frontFenderR.position.set(0.95, 0.48, 1.4);
  frontFenderR.castShadow = true;
  bodyGroup.add(frontFenderR);

  // Muscular Flared Rear Quarters / Haunches (Left and Right)
  const rearFenderGeo = new THREE.BoxGeometry(0.26, 0.42, 1.1);
  const rearFenderL = new THREE.Mesh(rearFenderGeo, bodyPaintMaterial);
  rearFenderL.position.set(-0.97, 0.52, -1.35);
  rearFenderL.castShadow = true;
  bodyGroup.add(rearFenderL);

  const rearFenderR = new THREE.Mesh(rearFenderGeo, bodyPaintMaterial);
  rearFenderR.position.set(0.97, 0.52, -1.35);
  rearFenderR.castShadow = true;
  bodyGroup.add(rearFenderR);

  // Side Skirts with Aero Blades
  const sideSkirtGeo = new THREE.BoxGeometry(0.12, 0.08, 2.0);
  const sideSkirtL = new THREE.Mesh(sideSkirtGeo, carbonMaterial);
  sideSkirtL.position.set(-0.96, 0.22, 0.05);
  const sideSkirtR = new THREE.Mesh(sideSkirtGeo, carbonMaterial);
  sideSkirtR.position.set(0.96, 0.22, 0.05);
  bodyGroup.add(sideSkirtL, sideSkirtR);

  // Side M Gills / Air Breather with M Badge behind front wheels
  const gillGeo = new THREE.BoxGeometry(0.04, 0.16, 0.28);
  const gillL = new THREE.Mesh(gillGeo, blackGlossMaterial);
  gillL.position.set(-0.96, 0.52, 0.85);
  const gillR = new THREE.Mesh(gillGeo, blackGlossMaterial);
  gillR.position.set(0.96, 0.52, 0.85);
  bodyGroup.add(gillL, gillR);

  // M Badges on Gills
  const gillBadgeGeo = new THREE.PlaneGeometry(0.02, 0.08);
  const gillBadgeMat = new THREE.MeshBasicMaterial({ map: mBadgeTexture, transparent: true });
  const gillBadgeL = new THREE.Mesh(gillBadgeGeo, gillBadgeMat);
  gillBadgeL.rotation.y = -Math.PI / 2;
  gillBadgeL.position.set(-0.985, 0.52, 0.85);
  const gillBadgeR = new THREE.Mesh(gillBadgeGeo, gillBadgeMat);
  gillBadgeR.rotation.y = Math.PI / 2;
  gillBadgeR.position.set(0.985, 0.52, 0.85);
  bodyGroup.add(gillBadgeL, gillBadgeR);

  // -------------------------------------------------------------
  // 2. GREENHOUSE (Cabin, Carbon Roof, Windows, Hofmeister Kink)
  // -------------------------------------------------------------
  const greenhouseGroup = new THREE.Group();
  greenhouseGroup.name = 'Greenhouse';

  // Sleek Carbon Fiber Roof with iconic M central depression
  const roofMainGeo = new THREE.BoxGeometry(1.42, 0.05, 1.65);
  const roofMesh = new THREE.Mesh(roofMainGeo, carbonMaterial);
  roofMesh.position.set(0, 1.25, -0.15);
  roofMesh.castShadow = true;
  greenhouseGroup.add(roofMesh);

  // M double-bubble center channel
  const roofRidgeL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 1.6), carbonMaterial);
  roofRidgeL.position.set(-0.4, 1.28, -0.15);
  const roofRidgeR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 1.6), carbonMaterial);
  roofRidgeR.position.set(0.4, 1.28, -0.15);
  greenhouseGroup.add(roofRidgeL, roofRidgeR);

  // A-Pillars (Windshield pillars)
  const aPillarGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.85, 24);
  const aPillarL = new THREE.Mesh(aPillarGeo, bodyPaintMaterial);
  aPillarL.rotation.z = 0.28;
  aPillarL.rotation.x = -0.68;
  aPillarL.position.set(-0.72, 0.95, 0.42);

  const aPillarR = new THREE.Mesh(aPillarGeo, bodyPaintMaterial);
  aPillarR.rotation.z = -0.28;
  aPillarR.rotation.x = -0.68;
  aPillarR.position.set(0.72, 0.95, 0.42);
  greenhouseGroup.add(aPillarL, aPillarR);

  // C-Pillars with Hofmeister Kink
  const cPillarGeo = new THREE.BoxGeometry(0.12, 0.65, 0.5);
  const cPillarL = new THREE.Mesh(cPillarGeo, bodyPaintMaterial);
  cPillarL.rotation.x = 0.65;
  cPillarL.position.set(-0.75, 0.94, -0.85);

  const cPillarR = new THREE.Mesh(cPillarGeo, bodyPaintMaterial);
  cPillarR.rotation.x = 0.65;
  cPillarR.position.set(0.75, 0.94, -0.85);
  greenhouseGroup.add(cPillarL, cPillarR);

  // Windshield (Front Glass)
  const windshieldGeo = new THREE.PlaneGeometry(1.4, 0.86);
  const windshield = new THREE.Mesh(windshieldGeo, glassMaterial);
  windshield.rotation.x = -Math.PI / 2.75;
  windshield.position.set(0, 0.97, 0.44);
  greenhouseGroup.add(windshield);

  // Rear Sloped Window
  const rearWindowGeo = new THREE.PlaneGeometry(1.36, 0.98);
  const rearWindow = new THREE.Mesh(rearWindowGeo, glassMaterial);
  rearWindow.rotation.x = Math.PI / 3.0;
  rearWindow.position.set(0, 0.96, -0.78);
  greenhouseGroup.add(rearWindow);

  // Side Quarter Glass with Hofmeister Kink angle
  const sideGlassGeo = new THREE.PlaneGeometry(0.68, 0.36);
  const sideGlassL = new THREE.Mesh(sideGlassGeo, glassMaterial);
  sideGlassL.rotation.y = -Math.PI / 2;
  sideGlassL.position.set(-0.84, 0.94, -0.45);
  const sideGlassR = new THREE.Mesh(sideGlassGeo, glassMaterial);
  sideGlassR.rotation.y = Math.PI / 2;
  sideGlassR.position.set(0.84, 0.94, -0.45);
  greenhouseGroup.add(sideGlassL, sideGlassR);

  bodyGroup.add(greenhouseGroup);

  // -------------------------------------------------------------
  // 3. BMW ICONIC FRONT FASCIA (Kidney Grille, Iconic Glow, Headlights)
  // -------------------------------------------------------------
  const frontFasciaGroup = new THREE.Group();
  frontFasciaGroup.name = 'Front_Fascia';

  // Front Bumper / Apron
  const frontBumperGeo = new THREE.BoxGeometry(1.82, 0.46, 0.65);
  const frontBumper = new THREE.Mesh(frontBumperGeo, bodyPaintMaterial);
  frontBumper.position.set(0, 0.42, 2.05);
  frontBumper.castShadow = true;
  frontFasciaGroup.add(frontBumper);

  // Carbon Front Splitter
  const frontSplitterGeo = new THREE.BoxGeometry(1.9, 0.05, 0.45);
  const frontSplitter = new THREE.Mesh(frontSplitterGeo, carbonMaterial);
  frontSplitter.position.set(0, 0.16, 2.22);
  frontSplitter.castShadow = true;
  frontFasciaGroup.add(frontSplitter);

  // Side Splitter Aero Winglets
  const wingletGeo = new THREE.BoxGeometry(0.04, 0.14, 0.22);
  const wingletL = new THREE.Mesh(wingletGeo, carbonMaterial);
  wingletL.position.set(-0.95, 0.22, 2.22);
  const wingletR = new THREE.Mesh(wingletGeo, carbonMaterial);
  wingletR.position.set(0.95, 0.22, 2.22);
  frontFasciaGroup.add(wingletL, wingletR);

  // Lower Center Air Intake (Honeycomb black)
  const lowerIntakeGeo = new THREE.BoxGeometry(1.1, 0.18, 0.1);
  const lowerIntake = new THREE.Mesh(lowerIntakeGeo, blackGlossMaterial);
  lowerIntake.position.set(0, 0.26, 2.36);
  frontFasciaGroup.add(lowerIntake);

  // Side Air Curtains (Left and Right brake cooling vents)
  const sideVentGeo = new THREE.BoxGeometry(0.24, 0.28, 0.1);
  const sideVentL = new THREE.Mesh(sideVentGeo, blackGlossMaterial);
  sideVentL.position.set(-0.76, 0.32, 2.32);
  const sideVentR = new THREE.Mesh(sideVentGeo, blackGlossMaterial);
  sideVentR.position.set(0.76, 0.32, 2.32);
  frontFasciaGroup.add(sideVentL, sideVentR);

  // --- THE ICONIC VERTICAL BMW KIDNEY GRILLES ---
  // Left Kidney
  const kidneyWidth = 0.26;
  const kidneyHeight = 0.42;

  // Kidney Grille Backing
  const kidneyBackingGeo = new THREE.PlaneGeometry(kidneyWidth, kidneyHeight);
  const kidneyBackingL = new THREE.Mesh(kidneyBackingGeo, blackGlossMaterial);
  kidneyBackingL.position.set(-0.16, 0.48, 2.385);
  const kidneyBackingR = new THREE.Mesh(kidneyBackingGeo, blackGlossMaterial);
  kidneyBackingR.position.set(0.16, 0.48, 2.385);
  frontFasciaGroup.add(kidneyBackingL, kidneyBackingR);

  // Vertical Double-Slats inside Kidneys
  for (let i = -1; i <= 1; i++) {
    const slatGeo = new THREE.BoxGeometry(0.015, kidneyHeight * 0.92, 0.03);
    const slatL = new THREE.Mesh(slatGeo, blackGlossMaterial);
    slatL.position.set(-0.16 + i * 0.065, 0.48, 2.395);
    const slatR = new THREE.Mesh(slatGeo, blackGlossMaterial);
    slatR.position.set(0.16 + i * 0.065, 0.48, 2.395);
    frontFasciaGroup.add(slatL, slatR);
  }

  // Kidney Grille Outer Contours - Iconic Glow Strip (Torus / Loop)
  const kidneyOutlineShape = new THREE.Shape();
  const kw = 0.13;
  const kh = 0.21;
  const rad = 0.05;
  kidneyOutlineShape.moveTo(-kw + rad, -kh);
  kidneyOutlineShape.lineTo(kw - rad, -kh);
  kidneyOutlineShape.quadraticCurveTo(kw, -kh, kw, -kh + rad);
  kidneyOutlineShape.lineTo(kw, kh - rad);
  kidneyOutlineShape.quadraticCurveTo(kw, kh, kw - rad, kh);
  kidneyOutlineShape.lineTo(-kw + rad, kh);
  kidneyOutlineShape.quadraticCurveTo(-kw, kh, -kw, kh - rad);
  kidneyOutlineShape.lineTo(-kw, -kh + rad);
  kidneyOutlineShape.quadraticCurveTo(-kw, -kh, -kw + rad, -kh);

  const kidneyPoints = kidneyOutlineShape.getPoints();
  const kidneyGlowGeo = new THREE.BufferGeometry().setFromPoints(kidneyPoints);

  const kidneyGlowLineL = new THREE.LineLoop(kidneyGlowGeo, kidneyGlowMaterial);
  kidneyGlowLineL.position.set(-0.16, 0.48, 2.402);
  kidneyGlowLineL.scale.set(1.04, 1.04, 1.04);

  const kidneyGlowLineR = new THREE.LineLoop(kidneyGlowGeo, kidneyGlowMaterial);
  kidneyGlowLineR.position.set(0.16, 0.48, 2.402);
  kidneyGlowLineR.scale.set(1.04, 1.04, 1.04);
  frontFasciaGroup.add(kidneyGlowLineL, kidneyGlowLineR);

  // Chrome / Gloss Black frame ring for kidneys
  const kidneyFrameMeshL = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.012, 16, 48),
    blackGlossMaterial
  );
  kidneyFrameMeshL.scale.set(0.9, 1.45, 1);
  kidneyFrameMeshL.position.set(-0.16, 0.48, 2.39);

  const kidneyFrameMeshR = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.012, 16, 48),
    blackGlossMaterial
  );
  kidneyFrameMeshR.scale.set(0.9, 1.45, 1);
  kidneyFrameMeshR.position.set(0.16, 0.48, 2.39);
  frontFasciaGroup.add(kidneyFrameMeshL, kidneyFrameMeshR);

  // ///M Competition Grille Badge (on right kidney slat)
  const mGrilleBadge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.04, 0.02),
    new THREE.MeshBasicMaterial({ map: mBadgeTexture, transparent: true })
  );
  mGrilleBadge.position.set(0.12, 0.58, 2.41);
  frontFasciaGroup.add(mGrilleBadge);

  // Front BMW Roundel Emblem (on hood nose tip above grille)
  const roundelGeo = new THREE.CircleGeometry(0.045, 48);
  const roundelMat = new THREE.MeshStandardMaterial({
    map: roundelTexture,
    metalness: 0.8,
    roughness: 0.2,
  });
  const frontRoundel = new THREE.Mesh(roundelGeo, roundelMat);
  frontRoundel.rotation.x = -Math.PI / 4.5;
  frontRoundel.position.set(0, 0.725, 2.22);
  frontFasciaGroup.add(frontRoundel);

  // --- BMW SHARP HEADLIGHTS WITH ANGEL EYES (DRL) ---
  const headlightHousingGeo = new THREE.BoxGeometry(0.48, 0.16, 0.26);
  const headlightGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x050810,
    transmission: 0.85,
    roughness: 0.05,
    metalness: 0.2,
    transparent: true,
  });

  const headlightL = new THREE.Mesh(headlightHousingGeo, headlightGlassMat);
  headlightL.position.set(-0.62, 0.58, 2.18);
  headlightL.rotation.y = -0.22;
  headlightL.rotation.z = 0.05;

  const headlightR = new THREE.Mesh(headlightHousingGeo, headlightGlassMat);
  headlightR.position.set(0.62, 0.58, 2.18);
  headlightR.rotation.y = 0.22;
  headlightR.rotation.z = -0.05;
  frontFasciaGroup.add(headlightL, headlightR);

  // Twin LED Angel Eye Light Rings in Each Headlight
  [-0.72, -0.52].forEach((xPos) => {
    const ringGeo = new THREE.RingGeometry(0.038, 0.052, 16);
    const ringMesh = new THREE.Mesh(ringGeo, headlightLightRingMat);
    ringMesh.position.set(xPos, 0.58, 2.28);
    ringMesh.rotation.y = -0.22;
    frontFasciaGroup.add(ringMesh);

    // Laser Blue center projector
    const laserLens = new THREE.Mesh(
      new THREE.CircleGeometry(0.024, 16),
      new THREE.MeshBasicMaterial({ color: 0x0088ff })
    );
    laserLens.position.set(xPos, 0.58, 2.27);
    laserLens.rotation.y = -0.22;
    frontFasciaGroup.add(laserLens);
  });

  [0.52, 0.72].forEach((xPos) => {
    const ringGeo = new THREE.RingGeometry(0.038, 0.052, 16);
    const ringMesh = new THREE.Mesh(ringGeo, headlightLightRingMat);
    ringMesh.position.set(xPos, 0.58, 2.28);
    ringMesh.rotation.y = 0.22;
    frontFasciaGroup.add(ringMesh);

    const laserLens = new THREE.Mesh(
      new THREE.CircleGeometry(0.024, 16),
      new THREE.MeshBasicMaterial({ color: 0x0088ff })
    );
    laserLens.position.set(xPos, 0.58, 2.27);
    laserLens.rotation.y = 0.22;
    frontFasciaGroup.add(laserLens);
  });

  bodyGroup.add(frontFasciaGroup);

  // -------------------------------------------------------------
  // 4. REAR FASCIA (Diffuser, Quad Exhausts, OLED Taillights, Spoilers)
  // -------------------------------------------------------------
  const rearFasciaGroup = new THREE.Group();
  rearFasciaGroup.name = 'Rear_Fascia';

  // Rear Bumper
  const rearBumperGeo = new THREE.BoxGeometry(1.86, 0.5, 0.65);
  const rearBumper = new THREE.Mesh(rearBumperGeo, bodyPaintMaterial);
  rearBumper.position.set(0, 0.44, -1.95);
  rearBumper.castShadow = true;
  rearFasciaGroup.add(rearBumper);

  // Carbon Fiber Rear Diffuser with 4 vertical fins
  const diffuserGeo = new THREE.BoxGeometry(1.5, 0.22, 0.35);
  const diffuser = new THREE.Mesh(diffuserGeo, carbonMaterial);
  diffuser.position.set(0, 0.22, -2.18);
  diffuser.castShadow = true;
  rearFasciaGroup.add(diffuser);

  // Diffuser vertical aero fins
  [-0.45, -0.15, 0.15, 0.45].forEach((fx) => {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.18, 0.32), carbonMaterial);
    fin.position.set(fx, 0.2, -2.2);
    rearFasciaGroup.add(fin);
  });

  // Quad Exhaust Tips (2 Left, 2 Right)
  const exhaustGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.24, 32);
  exhaustGeo.rotateX(Math.PI / 2);

  const exhaustInnerGeo = new THREE.CircleGeometry(0.04, 32);

  [-0.62, -0.48, 0.48, 0.62].forEach((ex) => {
    const tip = new THREE.Mesh(exhaustGeo, chromeMaterial);
    tip.position.set(ex, 0.22, -2.28);
    rearFasciaGroup.add(tip);

    // Subtle internal exhaust glow / dark hole
    const inner = new THREE.Mesh(exhaustInnerGeo, exhaustGlowMat);
    inner.position.set(ex, 0.22, -2.39);
    rearFasciaGroup.add(inner);
  });

  // 3D L-Shaped BMW OLED Taillights
  // Left Taillight (3D flowing light bar)
  const taillightShapeL = new THREE.BoxGeometry(0.48, 0.12, 0.1);
  const tlMeshL = new THREE.Mesh(taillightShapeL, taillightGlowMaterial);
  tlMeshL.position.set(-0.65, 0.66, -2.22);
  tlMeshL.rotation.y = 0.12;

  const tlBladeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.08), taillightGlowMaterial);
  tlBladeL.position.set(-0.84, 0.62, -2.19);
  rearFasciaGroup.add(tlMeshL, tlBladeL);

  // Right Taillight
  const tlMeshR = new THREE.Mesh(taillightShapeL, taillightGlowMaterial);
  tlMeshR.position.set(0.65, 0.66, -2.22);
  tlMeshR.rotation.y = -0.12;

  const tlBladeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.08), taillightGlowMaterial);
  tlBladeR.position.set(0.84, 0.62, -2.19);
  rearFasciaGroup.add(tlMeshR, tlBladeR);

  // Rear BMW Roundel
  const rearRoundel = new THREE.Mesh(roundelGeo, roundelMat);
  rearRoundel.rotation.x = Math.PI / 12;
  rearRoundel.position.set(0, 0.76, -2.25);
  rearFasciaGroup.add(rearRoundel);

  // Rear ///M4 Competition Emblem
  const m4Badge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.09, 0.024),
    new THREE.MeshBasicMaterial({ map: mBadgeTexture, transparent: true })
  );
  m4Badge.position.set(0.52, 0.74, -2.26);
  rearFasciaGroup.add(m4Badge);

  bodyGroup.add(rearFasciaGroup);

  // -------------------------------------------------------------
  // 5. SPOILERS: Flush M Carbon Lip vs High M Performance GT Wing
  // -------------------------------------------------------------
  // Option A: Carbon Lip Spoiler (mounted on trunk edge)
  const lipGeo = new THREE.BoxGeometry(1.24, 0.035, 0.14);
  const spoilerLipMesh = new THREE.Mesh(lipGeo, carbonMaterial);
  spoilerLipMesh.position.set(0, 0.86, -2.18);
  spoilerLipMesh.castShadow = true;
  bodyGroup.add(spoilerLipMesh);

  // Option B: High Carbon GT Wing with Endplates & Stalks
  const spoilerGtWingGroup = new THREE.Group();
  spoilerGtWingGroup.name = 'GT_Wing';

  // Main aerofoil blade
  const wingBladeGeo = new THREE.BoxGeometry(1.58, 0.04, 0.32);
  const wingBlade = new THREE.Mesh(wingBladeGeo, carbonMaterial);
  wingBlade.position.set(0, 1.18, -2.05);
  wingBlade.rotation.x = 0.06;
  wingBlade.castShadow = true;
  spoilerGtWingGroup.add(wingBlade);

  // Wing Stalks (Pylons)
  const pylonGeo = new THREE.BoxGeometry(0.03, 0.36, 0.12);
  const pylonL = new THREE.Mesh(pylonGeo, blackGlossMaterial);
  pylonL.position.set(-0.45, 0.98, -2.05);
  const pylonR = new THREE.Mesh(pylonGeo, blackGlossMaterial);
  pylonR.position.set(0.45, 0.98, -2.05);
  spoilerGtWingGroup.add(pylonL, pylonR);

  // Aero Endplates
  const endplateGeo = new THREE.BoxGeometry(0.02, 0.18, 0.34);
  const endplateL = new THREE.Mesh(endplateGeo, carbonMaterial);
  endplateL.position.set(-0.8, 1.18, -2.05);
  const endplateR = new THREE.Mesh(endplateGeo, carbonMaterial);
  endplateR.position.set(0.8, 1.18, -2.05);
  spoilerGtWingGroup.add(endplateL, endplateR);

  spoilerGtWingGroup.visible = initialConfig.aero.spoilerStyle === 'gt-wing';
  bodyGroup.add(spoilerGtWingGroup);

  // -------------------------------------------------------------
  // 6. DETAILED INTERIOR (Bucket Seats, Curved Screen, M Wheel)
  // -------------------------------------------------------------
  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'Interior';

  // Interior Tub Base
  const interiorTub = new THREE.Mesh(
    new THREE.BoxGeometry(1.52, 0.15, 1.7),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.9 })
  );
  interiorTub.position.set(0, 0.38, -0.05);
  interiorGroup.add(interiorTub);

  // BMW Curved Display (Dual 12.3" + 14.9" curved digital cockpit screen)
  const screenBezelGeo = new THREE.BoxGeometry(0.85, 0.14, 0.04);
  const screenBezel = new THREE.Mesh(screenBezelGeo, blackGlossMaterial);
  screenBezel.position.set(0, 0.84, 0.58);
  screenBezel.rotation.x = -0.15;
  interiorGroup.add(screenBezel);

  const screenActiveGeo = new THREE.PlaneGeometry(0.82, 0.12);
  const screenActive = new THREE.Mesh(screenActiveGeo, interiorScreenMat);
  screenActive.position.set(0, 0.84, 0.605);
  screenActive.rotation.x = -0.15;
  interiorGroup.add(screenActive);

  // M Sport Steering Wheel with Center Stripe
  const wheelRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.022, 12, 28),
    new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.6 })
  );
  wheelRim.rotation.x = -Math.PI / 3.2;
  wheelRim.position.set(-0.38, 0.76, 0.46);
  interiorGroup.add(wheelRim);

  // Center Airbag Hub
  const wheelHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16),
    blackGlossMaterial
  );
  wheelHub.rotation.x = Math.PI / 2 - Math.PI / 3.2;
  wheelHub.position.set(-0.38, 0.76, 0.46);
  interiorGroup.add(wheelHub);

  // M Carbon Sport Bucket Seats (Driver & Passenger)
  [-0.42, 0.42].forEach((seatX) => {
    // Seat base cushion
    const seatBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.14, 0.48),
      new THREE.MeshStandardMaterial({ color: 0x202024, roughness: 0.6 })
    );
    seatBase.position.set(seatX, 0.48, -0.12);
    interiorGroup.add(seatBase);

    // High Backrest with Integrated Headrest
    const seatBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.55, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x202024, roughness: 0.6 })
    );
    seatBack.position.set(seatX, 0.78, -0.32);
    seatBack.rotation.x = 0.22;
    interiorGroup.add(seatBack);

    // Carbon fiber back shell
    const seatShell = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.58, 0.03),
      carbonMaterial
    );
    seatShell.position.set(seatX, 0.78, -0.38);
    seatShell.rotation.x = 0.22;
    interiorGroup.add(seatShell);

    // M Tri-color Stripe Down Center of Seat
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(0.05, 0.45),
      new THREE.MeshBasicMaterial({ map: mBadgeTexture, transparent: true })
    );
    stripe.position.set(seatX, 0.78, -0.25);
    stripe.rotation.x = 0.22;
    interiorGroup.add(stripe);
  });

  // Center Console & Shifter
  const consoleMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.22, 0.85),
    carbonMaterial
  );
  consoleMesh.position.set(0, 0.52, 0.1);
  interiorGroup.add(consoleMesh);

  bodyGroup.add(interiorGroup);

  // -------------------------------------------------------------
  // 7. OPENABLE HOOD (Bonnet) & ENGINE BAY
  // -------------------------------------------------------------
  // Pivot point for Hood: Hinged at the cowl/windshield base (Z: 0.75, Y: 0.86)
  const hoodPivot = new THREE.Group();
  hoodPivot.name = 'Hood_Pivot';
  hoodPivot.position.set(0, 0.86, 0.75);

  // The sculpted hood mesh itself, relative to its hinge
  const hoodMeshGeo = new THREE.BoxGeometry(1.72, 0.06, 1.48);
  const hoodMesh = new THREE.Mesh(hoodMeshGeo, bodyPaintMaterial);
  hoodMesh.position.set(0, -0.06, 0.74);
  hoodMesh.castShadow = true;
  bodyMaterials.push(bodyPaintMaterial);
  hoodPivot.add(hoodMesh);

  // Twin Power Dome Hood Creases (iconic BMW M bonnet bulge)
  [-0.32, 0.32].forEach((hx) => {
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.04, 1.35),
      bodyPaintMaterial
    );
    ridge.position.set(hx, -0.03, 0.74);
    hoodPivot.add(ridge);
  });

  bodyGroup.add(hoodPivot);

  // Engine Bay (Revealed when hood opens!)
  const engineBayGroup = new THREE.Group();
  engineBayGroup.name = 'M_TwinPower_Turbo_Engine';

  // Engine Bay Compartment Liner
  const engineBayLiner = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.38, 1.3),
    new THREE.MeshStandardMaterial({ color: 0x161618, roughness: 0.8 })
  );
  engineBayLiner.position.set(0, 0.48, 1.45);
  engineBayGroup.add(engineBayLiner);

  // BMW M Carbon Strut Tower Brace (Wishbone V-shape brace across engine bay)
  const braceGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8);
  braceGeo.rotateZ(Math.PI / 2);

  const strutBraceL = new THREE.Mesh(braceGeo, carbonMaterial);
  strutBraceL.position.set(0, 0.72, 1.3);
  strutBraceL.rotation.y = 0.32;
  const strutBraceR = new THREE.Mesh(braceGeo, carbonMaterial);
  strutBraceR.position.set(0, 0.72, 1.3);
  strutBraceR.rotation.y = -0.32;
  engineBayGroup.add(strutBraceL, strutBraceR);

  // Engine Block & ///M Power Carbon Cover
  const engineCover = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.22, 0.75),
    carbonMaterial
  );
  engineCover.position.set(0, 0.58, 1.42);
  engineCover.castShadow = true;
  engineBayGroup.add(engineCover);

  // ///M Power Logo Plate on Engine
  const mPowerPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.12),
    new THREE.MeshBasicMaterial({ map: mBadgeTexture, transparent: true })
  );
  mPowerPlate.rotation.x = -Math.PI / 2;
  mPowerPlate.position.set(0, 0.695, 1.42);
  engineBayGroup.add(mPowerPlate);

  // Twin Turbo Air Intakes & Charge Pipes
  [-0.24, 0.24].forEach((tx) => {
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.45, 12),
      blackGlossMaterial
    );
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(tx, 0.62, 1.82);
    engineBayGroup.add(pipe);
  });

  bodyGroup.add(engineBayGroup);

  // -------------------------------------------------------------
  // 8. OPENABLE DOORS & M AERO WING MIRRORS
  // -------------------------------------------------------------
  // Left Door Pivot (hinge at A-pillar base: X: -0.92, Y: 0.52, Z: 0.72)
  const leftDoorPivot = new THREE.Group();
  leftDoorPivot.name = 'Left_Door_Pivot';
  leftDoorPivot.position.set(-0.92, 0.52, 0.72);

  // Left Door Mesh (relative to hinge)
  const doorGeo = new THREE.BoxGeometry(0.08, 0.48, 1.25);
  const leftDoorMesh = new THREE.Mesh(doorGeo, bodyPaintMaterial);
  leftDoorMesh.position.set(0, 0, -0.62);
  leftDoorMesh.castShadow = true;
  leftDoorPivot.add(leftDoorMesh);

  // Left Door Window Frame & Glass
  const doorWindowGeo = new THREE.PlaneGeometry(0.02, 0.38);
  const leftDoorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.38, 1.18), glassMaterial);
  leftDoorGlass.position.set(0, 0.42, -0.62);
  leftDoorPivot.add(leftDoorGlass);

  // Left M Aerodynamic Wing Mirror (Twin-stalk design)
  const mirrorGroupL = new THREE.Group();
  mirrorGroupL.position.set(-0.06, 0.28, -0.15);
  const mirrorShellL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.22), carbonMaterial);
  mirrorShellL.position.set(-0.12, 0, 0);
  const mirrorGlassL = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.95, roughness: 0.05 })
  );
  mirrorGlassL.rotation.y = Math.PI / 2;
  mirrorGlassL.position.set(-0.03, 0, 0);
  mirrorGroupL.add(mirrorShellL, mirrorGlassL);
  leftDoorPivot.add(mirrorGroupL);

  bodyGroup.add(leftDoorPivot);

  // Right Door Pivot (hinge at A-pillar base: X: 0.92, Y: 0.52, Z: 0.72)
  const rightDoorPivot = new THREE.Group();
  rightDoorPivot.name = 'Right_Door_Pivot';
  rightDoorPivot.position.set(0.92, 0.52, 0.72);

  const rightDoorMesh = new THREE.Mesh(doorGeo, bodyPaintMaterial);
  rightDoorMesh.position.set(0, 0, -0.62);
  rightDoorMesh.castShadow = true;
  rightDoorPivot.add(rightDoorMesh);

  const rightDoorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.38, 1.18), glassMaterial);
  rightDoorGlass.position.set(0, 0.42, -0.62);
  rightDoorPivot.add(rightDoorGlass);

  // Right M Wing Mirror
  const mirrorGroupR = new THREE.Group();
  mirrorGroupR.position.set(0.06, 0.28, -0.15);
  const mirrorShellR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.22), carbonMaterial);
  mirrorShellR.position.set(0.12, 0, 0);
  const mirrorGlassR = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.95, roughness: 0.05 })
  );
  mirrorGlassR.rotation.y = -Math.PI / 2;
  mirrorGlassR.position.set(0.03, 0, 0);
  mirrorGroupR.add(mirrorShellR, mirrorGlassR);
  rightDoorPivot.add(mirrorGroupR);

  bodyGroup.add(rightDoorPivot);

  // -------------------------------------------------------------
  // 9. OPENABLE TRUNK LID
  // -------------------------------------------------------------
  const trunkPivot = new THREE.Group();
  trunkPivot.name = 'Trunk_Pivot';
  trunkPivot.position.set(0, 0.88, -1.35);

  const trunkMeshGeo = new THREE.BoxGeometry(1.48, 0.06, 0.82);
  const trunkMesh = new THREE.Mesh(trunkMeshGeo, bodyPaintMaterial);
  trunkMesh.position.set(0, -0.04, -0.42);
  trunkMesh.castShadow = true;
  trunkPivot.add(trunkMesh);

  bodyGroup.add(trunkPivot);

  root.add(bodyGroup);

  // -------------------------------------------------------------
  // 10. WHEELS & BRAKES (4 High-Detail Rotating Wheel Assemblies)
  // -------------------------------------------------------------
  const wheelAssemblies: THREE.Group[] = [];
  const wheelPositions = [
    { x: -0.96, y: 0.35, z: 1.42, isFront: true, isLeft: true },  // Front Left
    { x: 0.96, y: 0.35, z: 1.42, isFront: true, isLeft: false },  // Front Right
    { x: -0.98, y: 0.36, z: -1.38, isFront: false, isLeft: true }, // Rear Left
    { x: 0.98, y: 0.36, z: -1.38, isFront: false, isLeft: false }, // Rear Right
  ];

  wheelPositions.forEach((pos, idx) => {
    const wheelAnchor = new THREE.Group();
    wheelAnchor.name = `Wheel_Anchor_${idx}`;
    wheelAnchor.position.set(pos.x, pos.y, pos.z);

    // Brake Rotor & Caliper (Static: attached to suspension, DOES NOT rotate with wheel!)
    const brakeGroup = new THREE.Group();
    brakeGroup.name = `Brake_Assembly_${idx}`;

    // Ventilated Cross-Drilled Brake Disc Rotor
    const rotorGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 36);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotorMesh = new THREE.Mesh(rotorGeo, brakeRotorMaterial);
    brakeGroup.add(rotorMesh);

    // Multi-Piston BMW M Brake Caliper
    const caliperGeo = new THREE.BoxGeometry(0.08, 0.16, 0.12);
    const caliperMesh = new THREE.Mesh(caliperGeo, caliperMaterial);
    caliperMesh.position.set(pos.isLeft ? -0.02 : 0.02, 0.12, 0.08);
    brakeGroup.add(caliperMesh);

    wheelAnchor.add(brakeGroup);

    // Rotating Wheel Assembly (Tire + Rim + Hub)
    const rotatingWheel = new THREE.Group();
    rotatingWheel.name = `Wheel_Rotating_${idx}`;

    // Performance Tire
    const tireRadius = 0.36;
    const tireWidth = pos.isFront ? 0.22 : 0.26;
    const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, 48);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeo, tireMaterial);
    tireMesh.castShadow = true;
    rotatingWheel.add(tireMesh);

    // Wheel Rim Outer Barrel
    const rimBarrelGeo = new THREE.CylinderGeometry(tireRadius * 0.78, tireRadius * 0.78, tireWidth * 0.95, 48);
    rimBarrelGeo.rotateZ(Math.PI / 2);
    const rimBarrelMesh = new THREE.Mesh(rimBarrelGeo, rimMaterial);
    rotatingWheel.add(rimBarrelMesh);

    // Rim Spokes (M Double-Spoke Design)
    const spokeCount = 5;
    for (let s = 0; s < spokeCount; s++) {
      const angle = (s / spokeCount) * Math.PI * 2;
      [-0.08, 0.08].forEach((offsetAngle) => {
        const spokeGeo = new THREE.BoxGeometry(0.025, 0.24, 0.03);
        const spoke = new THREE.Mesh(spokeGeo, rimMaterial);
        spoke.position.set(
          pos.isLeft ? -tireWidth * 0.42 : tireWidth * 0.42,
          Math.sin(angle + offsetAngle) * 0.14,
          Math.cos(angle + offsetAngle) * 0.14
        );
        spoke.rotation.x = angle + offsetAngle;
        rotatingWheel.add(spoke);
      });
    }

    // Central Wheel Hub Cap with BMW Roundel
    const wheelCapGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 32);
    wheelCapGeo.rotateZ(Math.PI / 2);
    const wheelCap = new THREE.Mesh(wheelCapGeo, roundelMat);
    wheelCap.position.set(pos.isLeft ? -tireWidth * 0.49 : tireWidth * 0.49, 0, 0);
    rotatingWheel.add(wheelCap);

    wheelAnchor.add(rotatingWheel);
    root.add(wheelAnchor);
    wheelAssemblies.push(rotatingWheel);
  });

  // -------------------------------------------------------------
  // UPDATE METHODS & REAL-TIME ANIMATIONS
  // -------------------------------------------------------------
  function updateConfig(config: CarConfigState) {
    // 1. Paint Finish & Color
    const color = new THREE.Color(config.paintColor);
    bodyPaintMaterial.color.copy(color);

    if (config.paintFinish === 'gloss') {
      bodyPaintMaterial.metalness = 0.85;
      bodyPaintMaterial.roughness = 0.16;
      bodyPaintMaterial.clearcoat = 1.0;
      bodyPaintMaterial.clearcoatRoughness = 0.06;
    } else if (config.paintFinish === 'metallic') {
      bodyPaintMaterial.metalness = 0.94;
      bodyPaintMaterial.roughness = 0.24;
      bodyPaintMaterial.clearcoat = 1.0;
      bodyPaintMaterial.clearcoatRoughness = 0.12;
    } else if (config.paintFinish === 'matte') {
      bodyPaintMaterial.metalness = 0.35;
      bodyPaintMaterial.roughness = 0.68;
      bodyPaintMaterial.clearcoat = 0.0;
    } else if (config.paintFinish === 'frozen') {
      // BMW Frozen Satin
      bodyPaintMaterial.metalness = 0.72;
      bodyPaintMaterial.roughness = 0.44;
      bodyPaintMaterial.clearcoat = 0.25;
      bodyPaintMaterial.clearcoatRoughness = 0.45;
    }

    // 2. Carbon Roof toggle
    if (config.carbonFiberRoof) {
      roofMesh.material = carbonMaterial;
    } else {
      roofMesh.material = bodyPaintMaterial;
    }

    // 3. Window Tint
    glassMaterial.opacity = config.windowTint;
    glassMaterial.transmission = 1.0 - config.windowTint * 0.8;

    // 4. Wheels: Rim & Caliper
    rimMaterial.color.copy(new THREE.Color(config.wheels.rimColor));
    caliperMaterial.color.copy(new THREE.Color(config.wheels.caliperColor));

    // 5. Lights & Kidney Glow
    if (config.lightsOn) {
      const haloColor = new THREE.Color(config.haloGlowColor);
      headlightLightRingMat.color.copy(haloColor);
      kidneyGlowMaterial.color.copy(haloColor);
      taillightGlowMaterial.color.setHex(0xff1824);
      interiorScreenMat.color.setHex(0x3b82f6);
    } else {
      headlightLightRingMat.color.setHex(0x333338);
      kidneyGlowMaterial.color.setHex(0x222226);
      taillightGlowMaterial.color.setHex(0x550a0e);
      interiorScreenMat.color.setHex(0x0f172a);
    }

    // 6. Spoiler Option
    spoilerLipMesh.visible = config.aero.spoilerStyle === 'lip';
    spoilerGtWingGroup.visible = config.aero.spoilerStyle === 'gt-wing';
  }

  // Smooth door / hood / trunk opening interpolation
  const currentAngles = {
    leftDoor: 0,
    rightDoor: 0,
    hood: 0,
    trunk: 0,
  };

  function updateAnimations(delta: number, config: CarConfigState) {
    const targetLeftDoor = config.openParts.leftDoor ? -0.85 : 0;
    const targetRightDoor = config.openParts.rightDoor ? 0.85 : 0;
    const targetHood = config.openParts.hood ? -0.75 : 0;
    const targetTrunk = config.openParts.trunk ? 0.82 : 0;

    const lerpSpeed = Math.min(1, delta * 6.5);
    currentAngles.leftDoor += (targetLeftDoor - currentAngles.leftDoor) * lerpSpeed;
    currentAngles.rightDoor += (targetRightDoor - currentAngles.rightDoor) * lerpSpeed;
    currentAngles.hood += (targetHood - currentAngles.hood) * lerpSpeed;
    currentAngles.trunk += (targetTrunk - currentAngles.trunk) * lerpSpeed;

    leftDoorPivot.rotation.y = currentAngles.leftDoor;
    rightDoorPivot.rotation.y = currentAngles.rightDoor;
    hoodPivot.rotation.x = currentAngles.hood;
    trunkPivot.rotation.x = currentAngles.trunk;

    // Wheel spin when driving
    if (config.isDriving) {
      const spinDelta = delta * config.driveSpeed * 14;
      wheelAssemblies.forEach((wheel) => {
        wheel.rotation.x += spinDelta;
      });

      // Subtle suspension vibration
      root.position.y = Math.sin(Date.now() * 0.02) * 0.005;
    } else {
      root.position.y = 0;
    }
  }

  // Ensure all meshes across the procedural model have smooth vertex normals & no flatShading
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.computeVertexNormals();
      }
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if ('flatShading' in m) {
            (m as any).flatShading = false;
            m.needsUpdate = true;
          }
        });
      }
    }
  });

  return {
    root,
    wheels: wheelAssemblies,
    leftDoorPivot,
    rightDoorPivot,
    hoodPivot,
    trunkPivot,
    spoilerLipMesh,
    spoilerGtWingGroup,
    bodyMaterials,
    roofMaterial: carbonMaterial,
    glassMaterial,
    caliperMaterials,
    rimMaterials,
    headlightLightRings,
    kidneyGlowMaterial,
    taillightMaterials,
    interiorScreenMaterial: interiorScreenMat,
    exhaustGlowMaterials,
    updateConfig,
    updateAnimations,
  };
}
