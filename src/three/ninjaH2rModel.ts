import * as THREE from 'three';
import { CarConfigState, PaintFinish } from '../types';
import { InteractiveModelInstance, applySmoothNormalsAndShading } from './interactiveSedanModels';

function applyPaintStyle(
  mat: THREE.MeshPhysicalMaterial,
  colorHex: string,
  finish: PaintFinish
) {
  mat.color.set(colorHex);
  if (finish === 'metallic') {
    mat.metalness = 0.88;
    mat.roughness = 0.2;
    mat.clearcoat = 1.0;
    mat.clearcoatRoughness = 0.08;
  } else if (finish === 'frozen') {
    mat.metalness = 0.35;
    mat.roughness = 0.65;
    mat.clearcoat = 0.15;
    mat.clearcoatRoughness = 0.5;
  } else if (finish === 'matte') {
    mat.metalness = 0.1;
    mat.roughness = 0.85;
    mat.clearcoat = 0.0;
    mat.clearcoatRoughness = 0.0;
  } else {
    // gloss / mirror coat
    mat.metalness = 0.75;
    mat.roughness = 0.18;
    mat.clearcoat = 1.0;
    mat.clearcoatRoughness = 0.05;
  }
  mat.needsUpdate = true;
}

export function buildNinjaH2rModel(config: CarConfigState): InteractiveModelInstance {
  const root = new THREE.Group();
  root.name = 'Kawasaki_Ninja_H2R_Model';

  const bodyMaterials: THREE.MeshPhysicalMaterial[] = [];
  const glassMaterials: THREE.MeshPhysicalMaterial[] = [];
  const lightMaterials: (THREE.MeshStandardMaterial | THREE.MeshBasicMaterial)[] = [];
  const wheels: THREE.Group[] = [];

  // Mirror-Finish Silver/Black Paint (H2R Signature Mirror-Coated Spark Black)
  const paintMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(config.paintColor || '#1f2429'),
    metalness: 0.82,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
  });
  applyPaintStyle(paintMat, config.paintColor || '#1f2429', config.paintFinish);
  bodyMaterials.push(paintMat);

  // Kawasaki Iconic Metallic Trellis Green
  const trellisGreenMat = new THREE.MeshStandardMaterial({
    color: 0x1db954, // Kawasaki Racing Lime/Emerald Green
    metalness: 0.75,
    roughness: 0.28,
  });

  // Matte Carbon Fiber (H2R Aerospace Winglets & Fairings)
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x151618,
    metalness: 0.45,
    roughness: 0.5,
  });

  // Dark Engine & Mechanical Metal
  const engineMetalMat = new THREE.MeshStandardMaterial({
    color: 0x222428,
    metalness: 0.8,
    roughness: 0.35,
  });

  // Titanium Racing Exhaust with Heat Gradient Tint
  const titaniumExhaustMat = new THREE.MeshStandardMaterial({
    color: 0xc8cdd6,
    metalness: 0.92,
    roughness: 0.18,
  });

  // Chrome / Fork Stanchions
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf2f4f7,
    metalness: 0.98,
    roughness: 0.08,
  });

  // Gold Anodized (Ohlins Fork Caps / Brembo Calipers)
  const goldAnodizedMat = new THREE.MeshStandardMaterial({
    color: 0xcc9933,
    metalness: 0.85,
    roughness: 0.25,
  });

  // Windscreen
  const windscreenMat = new THREE.MeshPhysicalMaterial({
    color: 0x05070a,
    metalness: 0.1,
    roughness: 0.04,
    transmission: 0.85,
    transparent: true,
    opacity: 0.82 + config.windowTint * 0.16,
  });
  glassMaterials.push(windscreenMat);

  // LED Headlight Glow
  const headlightGlowMat = new THREE.MeshBasicMaterial({
    color: config.lightsOn ? 0xf4f9ff : 0x444444,
  });
  lightMaterials.push(headlightGlowMat);

  // LED Taillight Fin Glow
  const taillightGlowMat = new THREE.MeshBasicMaterial({
    color: config.lightsOn ? 0xff1422 : 0x550000,
  });
  lightMaterials.push(taillightGlowMat);

  // ==========================================
  // 1. CHASSIS, TRELLIS FRAME & INLINE-4 ENGINE
  // ==========================================
  const bikeBody = new THREE.Group();
  bikeBody.name = 'H2R_Body_Assembly';

  // 998cc Engine Block Assembly
  const engineBlockGeom = new THREE.BoxGeometry(0.38, 0.42, 0.58, 3, 3, 4);
  const engineBlock = new THREE.Mesh(engineBlockGeom, engineMetalMat);
  engineBlock.position.set(0, 0.54, 0.08);
  bikeBody.add(engineBlock);

  // Inline-4 Cylinder Head & Fin Detailing
  const cylHeadGeom = new THREE.BoxGeometry(0.42, 0.18, 0.44);
  const cylHead = new THREE.Mesh(cylHeadGeom, engineMetalMat);
  cylHead.position.set(0, 0.72, 0.16);
  cylHead.rotation.x = 0.25;
  bikeBody.add(cylHead);

  // Planetary Centrifugal Supercharger Housing (Distinctive Red Impeller Case on Left)
  const superchargerGeom = new THREE.CylinderGeometry(0.11, 0.11, 0.14, 24);
  superchargerGeom.rotateZ(Math.PI / 2);
  const superchargerCase = new THREE.Mesh(superchargerGeom, trellisGreenMat);
  superchargerCase.position.set(-0.21, 0.62, 0.18);
  bikeBody.add(superchargerCase);

  // Supercharger Impeller Hub Accent
  const impellerHubGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16);
  impellerHubGeom.rotateZ(Math.PI / 2);
  const impellerHub = new THREE.Mesh(impellerHubGeom, goldAnodizedMat);
  impellerHub.position.set(-0.28, 0.62, 0.18);
  bikeBody.add(impellerHub);

  // Signature Kawasaki Green Tubular Trellis Frame Tubes
  const trellisTubes = [
    { start: [-0.18, 0.95, 0.55], end: [-0.16, 0.52, -0.15] },
    { start: [0.18, 0.95, 0.55], end: [0.16, 0.52, -0.15] },
    { start: [-0.18, 0.95, 0.55], end: [-0.19, 0.58, 0.15] },
    { start: [0.18, 0.95, 0.55], end: [0.19, 0.58, 0.15] },
    { start: [-0.19, 0.58, 0.15], end: [-0.16, 0.52, -0.15] },
    { start: [0.19, 0.58, 0.15], end: [0.16, 0.52, -0.15] },
    { start: [-0.16, 0.52, -0.15], end: [-0.14, 0.88, -0.65] },
    { start: [0.16, 0.52, -0.15], end: [0.14, 0.88, -0.65] },
  ];

  trellisTubes.forEach((t) => {
    const p1 = new THREE.Vector3(t.start[0], t.start[1], t.start[2]);
    const p2 = new THREE.Vector3(t.end[0], t.end[1], t.end[2]);
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    const tubeGeom = new THREE.CylinderGeometry(0.022, 0.022, len, 16);
    tubeGeom.translate(0, len / 2, 0);
    tubeGeom.rotateX(Math.PI / 2);

    const tube = new THREE.Mesh(tubeGeom, trellisGreenMat);
    tube.position.copy(p1);
    tube.lookAt(p2);
    bikeBody.add(tube);
  });

  // Curved Radiator with Stone Guard
  const radGeom = new THREE.BoxGeometry(0.38, 0.32, 0.08);
  const rad = new THREE.Mesh(radGeom, carbonMat);
  rad.position.set(0, 0.62, 0.52);
  rad.rotation.x = -0.22;
  bikeBody.add(rad);

  // ==========================================
  // 2. SCULPTED FUEL TANK, SEAT COWL & COCKPIT
  // ==========================================
  // Chiseled Aerodynamic Fuel Tank
  const tankShape = new THREE.Shape();
  tankShape.moveTo(-0.24, 0.85);
  tankShape.lineTo(-0.21, 1.15);
  tankShape.lineTo(-0.08, 1.22);
  tankShape.lineTo(0.08, 1.22);
  tankShape.lineTo(0.21, 1.15);
  tankShape.lineTo(0.24, 0.85);
  tankShape.closePath();

  const tankGeom = new THREE.ExtrudeGeometry(tankShape, {
    steps: 1,
    depth: 0.65,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 4,
  });
  tankGeom.rotateY(Math.PI);
  tankGeom.translate(0, 0, 0.45);
  const tankMesh = new THREE.Mesh(tankGeom, paintMat);
  tankMesh.castShadow = true;
  bikeBody.add(tankMesh);

  // Fuel Filler Cap
  const capGeom = new THREE.CylinderGeometry(0.055, 0.055, 0.02, 24);
  const capMesh = new THREE.Mesh(capGeom, chromeMat);
  capMesh.position.set(0, 1.23, 0.22);
  bikeBody.add(capMesh);

  // Minimalist Racing Saddle (High Grip Alcantara)
  const saddleGeom = new THREE.BoxGeometry(0.26, 0.06, 0.34);
  const saddleMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 });
  const saddle = new THREE.Mesh(saddleGeom, saddleMat);
  saddle.position.set(0, 0.94, -0.24);
  saddle.rotation.x = 0.08;
  bikeBody.add(saddle);

  // Monocoque Aerodynamic Tail Cowl (Narrow upswept rear)
  const tailShape = new THREE.Shape();
  tailShape.moveTo(-0.16, 0.94);
  tailShape.lineTo(-0.06, 1.08);
  tailShape.lineTo(0.06, 1.08);
  tailShape.lineTo(0.16, 0.94);
  tailShape.closePath();

  const tailGeom = new THREE.ExtrudeGeometry(tailShape, {
    steps: 1,
    depth: 0.68,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 4,
  });
  tailGeom.rotateY(Math.PI);
  tailGeom.translate(0, 0, -0.38);
  const tailMesh = new THREE.Mesh(tailGeom, paintMat);
  bikeBody.add(tailMesh);

  // Twin Vertical LED Tail Light Fins
  [-0.08, 0.08].forEach((xPos) => {
    const finGeom = new THREE.BoxGeometry(0.015, 0.12, 0.04);
    const finMesh = new THREE.Mesh(finGeom, taillightGlowMat);
    finMesh.position.set(xPos, 1.02, -1.05);
    bikeBody.add(finMesh);
  });

  // ==========================================
  // 3. AERODYNAMIC FRONT COWL & AEROSPACE WINGLETS
  // ==========================================
  // Sharp Front Nose Fairing
  const noseGeom = new THREE.ConeGeometry(0.22, 0.55, 16);
  noseGeom.rotateX(-Math.PI / 2.6);
  const noseMesh = new THREE.Mesh(noseGeom, paintMat);
  noseMesh.position.set(0, 0.96, 0.88);
  bikeBody.add(noseMesh);

  // Ram-Air Supercharger Intake Opening on Left Cowl
  const ramAirGeom = new THREE.BoxGeometry(0.08, 0.14, 0.45);
  const ramAirMesh = new THREE.Mesh(ramAirGeom, carbonMat);
  ramAirMesh.position.set(-0.16, 0.94, 0.78);
  ramAirMesh.rotation.y = -0.15;
  bikeBody.add(ramAirMesh);

  // Ram-Air Duct Lime-Green Bezel Accent
  const ramBezelGeom = new THREE.BoxGeometry(0.02, 0.15, 0.04);
  const ramBezel = new THREE.Mesh(ramBezelGeom, trellisGreenMat);
  ramBezel.position.set(-0.19, 0.94, 0.98);
  bikeBody.add(ramBezel);

  // Center High-Intensity Projector Headlight
  const lightGeom = new THREE.SphereGeometry(0.05, 16, 16);
  const lightMesh = new THREE.Mesh(lightGeom, headlightGlowMat);
  lightMesh.position.set(0, 0.92, 1.10);
  bikeBody.add(lightMesh);

  // High-Bubble Aerodynamic Windscreen
  const screenGeom = new THREE.CylinderGeometry(0.18, 0.22, 0.42, 16, 1, true, 0, Math.PI);
  screenGeom.rotateX(Math.PI / 3.4);
  screenGeom.rotateZ(Math.PI);
  const screenMesh = new THREE.Mesh(screenGeom, windscreenMat);
  screenMesh.position.set(0, 1.14, 0.78);
  bikeBody.add(screenMesh);

  // Iconic Ninja H2R Upper Carbon Fiber Wings (in place of mirrors!)
  [-0.32, 0.32].forEach((xPos) => {
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(0.28 * (xPos > 0 ? 1 : -1), 0.06);
    wingShape.lineTo(0.24 * (xPos > 0 ? 1 : -1), 0.14);
    wingShape.lineTo(0, 0.1);
    wingShape.closePath();

    const wingGeom = new THREE.ExtrudeGeometry(wingShape, { depth: 0.015, bevelEnabled: false });
    const wingMesh = new THREE.Mesh(wingGeom, carbonMat);
    wingMesh.position.set(xPos > 0 ? 0.14 : -0.14, 1.08, 0.82);
    wingMesh.rotation.x = 0.2;
    wingMesh.rotation.y = xPos > 0 ? -0.25 : 0.25;
    bikeBody.add(wingMesh);
  });

  // Lower Side Fairing Aerodynamic Downforce Wings (Vortex Generators)
  [-0.26, 0.26].forEach((xPos) => {
    const wingGeom = new THREE.BoxGeometry(0.18, 0.02, 0.32);
    const wingMesh = new THREE.Mesh(wingGeom, carbonMat);
    wingMesh.position.set(xPos, 0.74, 0.42);
    wingMesh.rotation.z = xPos > 0 ? -0.22 : 0.22;
    wingMesh.rotation.x = -0.12;
    bikeBody.add(wingMesh);
  });

  // Clip-On Handlebars & Controls
  const barGeom = new THREE.CylinderGeometry(0.014, 0.014, 0.62, 16);
  barGeom.rotateZ(Math.PI / 2);
  const bars = new THREE.Mesh(barGeom, engineMetalMat);
  bars.position.set(0, 1.04, 0.55);
  bars.rotation.x = -0.18;
  bikeBody.add(bars);

  // Digital Color TFT Dashboard Display Screen
  const dashGeom = new THREE.BoxGeometry(0.12, 0.08, 0.02);
  const dashMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  const dash = new THREE.Mesh(dashGeom, dashMat);
  dash.position.set(0, 1.07, 0.62);
  dash.rotation.x = -0.65;
  bikeBody.add(dash);

  // ==========================================
  // 4. TITANIUM RACING MEGAPHONE EXHAUST
  // ==========================================
  // Exhaust Header Pipes (4 into 1 collector)
  for (let i = -1.5; i <= 1.5; i += 1) {
    const pipeGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.32, 12);
    const pipe = new THREE.Mesh(pipeGeom, titaniumExhaustMat);
    pipe.position.set(i * 0.08, 0.42, 0.34);
    pipe.rotation.x = -0.6;
    bikeBody.add(pipe);
  }

  // Titanium Megaphone Upswept Muffler
  const mufflerGeom = new THREE.CylinderGeometry(0.08, 0.045, 0.65, 24);
  mufflerGeom.rotateX(-Math.PI / 3.4);
  const muffler = new THREE.Mesh(mufflerGeom, titaniumExhaustMat);
  muffler.position.set(0.24, 0.48, -0.68);
  bikeBody.add(muffler);

  // Blue Heat-Treated Exhaust Tip End
  const exhaustTipGeom = new THREE.TorusGeometry(0.078, 0.012, 12, 24);
  const tipHeatMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6, // Blue titanium heat stain
    metalness: 0.95,
    roughness: 0.15,
  });
  exhaustTipGeom.rotateX(-Math.PI / 3.4);
  const exhaustTip = new THREE.Mesh(exhaustTipGeom, tipHeatMat);
  exhaustTip.position.set(0.24, 0.68, -0.98);
  bikeBody.add(exhaustTip);

  root.add(bikeBody);

  // ==========================================
  // 5. INVERTED FORKS & FRONT WHEEL ASSEMBLY
  // ==========================================
  const frontForkGroup = new THREE.Group();
  frontForkGroup.position.set(0, 0.34, 1.25);

  // Dual Telescopic Inverted Front Forks (Ohlins/KYB)
  [-0.11, 0.11].forEach((xPos) => {
    // Upper gold fork body
    const upperForkGeom = new THREE.CylinderGeometry(0.026, 0.026, 0.38, 16);
    const upperFork = new THREE.Mesh(upperForkGeom, goldAnodizedMat);
    upperFork.position.set(xPos, 0.45, -0.14);
    upperFork.rotation.x = 0.42; // Rake angle
    frontForkGroup.add(upperFork);

    // Lower polished chrome stanchions
    const lowerForkGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.32, 16);
    const lowerFork = new THREE.Mesh(lowerForkGeom, chromeMat);
    lowerFork.position.set(xPos, 0.18, -0.02);
    lowerFork.rotation.x = 0.42;
    frontForkGroup.add(lowerFork);
  });

  // Carbon Front Fender / Mudguard
  const fenderGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.14, 24, 1, true, 0, Math.PI * 0.7);
  fenderGeom.rotateZ(Math.PI / 2);
  const frontFender = new THREE.Mesh(fenderGeom, carbonMat);
  frontFender.position.set(0, 0.08, -0.06);
  frontFender.rotation.x = 0.4;
  frontForkGroup.add(frontFender);

  root.add(frontForkGroup);

  // Front 17-inch High Performance Wheel
  const frontWheelGroup = new THREE.Group();
  frontWheelGroup.position.set(0, 0.34, 1.25);

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x121315,
    roughness: 0.9,
    metalness: 0.06,
  });

  const starRimMat = new THREE.MeshStandardMaterial({
    color: config.wheels.rimColor || '#181a1f',
    metalness: 0.88,
    roughness: 0.24,
  });

  // 120/70 ZR17 Front Tire
  const frontTireGeom = new THREE.TorusGeometry(0.32, 0.065, 24, 48);
  frontTireGeom.rotateY(Math.PI / 2);
  const frontTire = new THREE.Mesh(frontTireGeom, tireMat);
  frontTire.castShadow = true;
  frontWheelGroup.add(frontTire);

  // Front Rim Barrel & Star Spokes
  const frontRimGeom = new THREE.CylinderGeometry(0.26, 0.26, 0.08, 36);
  frontRimGeom.rotateZ(Math.PI / 2);
  const frontRim = new THREE.Mesh(frontRimGeom, starRimMat);
  frontWheelGroup.add(frontRim);

  // 5 Aggressive Star Spokes
  for (let i = 0; i < 5; i++) {
    const angle = (i * (Math.PI * 2)) / 5;
    const spokeGeom = new THREE.BoxGeometry(0.024, 0.22, 0.04);
    const spoke = new THREE.Mesh(spokeGeom, starRimMat);
    spoke.position.set(0, Math.cos(angle) * 0.11, Math.sin(angle) * 0.11);
    spoke.rotation.x = angle;
    frontWheelGroup.add(spoke);
  }

  // Dual 330mm Brembo Semi-Floating Front Rotors
  [-0.07, 0.07].forEach((xPos) => {
    const rotorGeom = new THREE.CylinderGeometry(0.19, 0.19, 0.015, 32);
    rotorGeom.rotateZ(Math.PI / 2);
    const rotor = new THREE.Mesh(rotorGeom, chromeMat);
    rotor.position.set(xPos, 0, 0);
    frontWheelGroup.add(rotor);

    // Brembo Styleline Monobloc Radial Caliper
    const caliperGeom = new THREE.BoxGeometry(0.04, 0.12, 0.10);
    const caliper = new THREE.Mesh(caliperGeom, goldAnodizedMat);
    caliper.position.set(xPos, 0.12, 0.04);
    frontWheelGroup.add(caliper);
  });

  root.add(frontWheelGroup);
  wheels.push(frontWheelGroup);

  // ==========================================
  // 6. SINGLE-SIDED REAR SWINGARM & REAR WHEEL
  // ==========================================
  // Single-Sided Cast Aluminum Swingarm (Left Side)
  const swingarmGroup = new THREE.Group();
  swingarmGroup.position.set(0, 0.35, -0.45);

  const swingarmGeom = new THREE.BoxGeometry(0.07, 0.12, 0.82);
  const swingarm = new THREE.Mesh(swingarmGeom, engineMetalMat);
  swingarm.position.set(-0.14, 0, -0.38);
  swingarm.rotation.x = 0.08;
  swingarmGroup.add(swingarm);

  // Large Racing Rear Sprocket & Chain
  const sprocketGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.02, 32);
  sprocketGeom.rotateZ(Math.PI / 2);
  const sprocket = new THREE.Mesh(sprocketGeom, goldAnodizedMat);
  sprocket.position.set(-0.11, 0, -0.78);
  swingarmGroup.add(sprocket);

  root.add(swingarmGroup);

  // Rear 200/55 ZR17 Wide Hypersport Wheel
  const rearWheelGroup = new THREE.Group();
  rearWheelGroup.position.set(0, 0.35, -1.23);

  // Wide 200-section rear tire
  const rearTireGeom = new THREE.TorusGeometry(0.33, 0.11, 24, 48);
  rearTireGeom.rotateY(Math.PI / 2);
  const rearTire = new THREE.Mesh(rearTireGeom, tireMat);
  rearTire.castShadow = true;
  rearWheelGroup.add(rearTire);

  // Rear Star Rim Hub (Open on right side due to single-sided swingarm!)
  const rearRimGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 36);
  rearRimGeom.rotateZ(Math.PI / 2);
  const rearRim = new THREE.Mesh(rearRimGeom, starRimMat);
  rearWheelGroup.add(rearRim);

  // Star Spokes
  for (let i = 0; i < 5; i++) {
    const angle = (i * (Math.PI * 2)) / 5;
    const spokeGeom = new THREE.BoxGeometry(0.03, 0.22, 0.05);
    const spoke = new THREE.Mesh(spokeGeom, starRimMat);
    spoke.position.set(0.02, Math.cos(angle) * 0.11, Math.sin(angle) * 0.11);
    spoke.rotation.x = angle;
    rearWheelGroup.add(spoke);
  }

  // Exposed Center Wheel Nut on Right Side
  const nutGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16);
  nutGeom.rotateZ(Math.PI / 2);
  const nut = new THREE.Mesh(nutGeom, goldAnodizedMat);
  nut.position.set(0.09, 0, 0);
  rearWheelGroup.add(nut);

  root.add(rearWheelGroup);
  wheels.push(rearWheelGroup);

  // Smooth vertex normals across all motorcycle geometries
  applySmoothNormalsAndShading(root);

  return {
    root,
    wheels,
    bodyMaterials,
    glassMaterials,
    lightMaterials,
    updateConfig: (newConfig: CarConfigState) => {
      bodyMaterials.forEach((mat) => {
        applyPaintStyle(mat, newConfig.paintColor, newConfig.paintFinish);
      });
      glassMaterials.forEach((mat) => {
        mat.opacity = 0.82 + newConfig.windowTint * 0.16;
        mat.needsUpdate = true;
      });
      headlightGlowMat.color.set(newConfig.lightsOn ? 0xf4f9ff : 0x444444);
      taillightGlowMat.color.set(newConfig.lightsOn ? 0xff1422 : 0x550000);
      starRimMat.color.set(newConfig.wheels.rimColor);
    },
    updateAnimations: (delta: number, curConfig: CarConfigState) => {
      if (curConfig.isDriving) {
        const speed = curConfig.driveSpeed * 18 * delta; // Bike wheels spin fast
        wheels.forEach((w) => {
          w.rotation.x += speed;
        });
      }
    },
  };
}

function darkCarbonLike(base: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
  return base;
}
