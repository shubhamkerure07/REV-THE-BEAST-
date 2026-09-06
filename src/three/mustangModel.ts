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
    mat.metalness = 0.84;
    mat.roughness = 0.22;
    mat.clearcoat = 1.0;
    mat.clearcoatRoughness = 0.1;
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
    // gloss
    mat.metalness = 0.55;
    mat.roughness = 0.25;
    mat.clearcoat = 1.0;
    mat.clearcoatRoughness = 0.06;
  }
  mat.needsUpdate = true;
}

export function buildMustangGtModel(config: CarConfigState): InteractiveModelInstance {
  const root = new THREE.Group();
  root.name = 'MustangGT_Model';

  const bodyMaterials: THREE.MeshPhysicalMaterial[] = [];
  const glassMaterials: THREE.MeshPhysicalMaterial[] = [];
  const lightMaterials: (THREE.MeshStandardMaterial | THREE.MeshBasicMaterial)[] = [];
  const wheels: THREE.Group[] = [];

  // Primary Exterior Paint
  const paintMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(config.paintColor || '#c4122d'),
    metalness: 0.7,
    roughness: 0.25,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });
  applyPaintStyle(paintMat, config.paintColor || '#c4122d', config.paintFinish);
  bodyMaterials.push(paintMat);

  // Carbon / Matte Accent Material
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x18181c,
    roughness: 0.45,
    metalness: 0.5,
  });

  // Black Trim Material
  const blackTrimMat = new THREE.MeshStandardMaterial({
    color: 0x0e0f12,
    roughness: 0.6,
    metalness: 0.2,
  });

  // Chrome / Exhaust Material
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    roughness: 0.1,
    metalness: 0.95,
  });

  // Tinted Glass
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x111622,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.88,
    thickness: 0.4,
    transparent: true,
    opacity: 0.75 + config.windowTint * 0.22,
  });
  glassMaterials.push(glassMat);

  // Headlight Glow Material
  const headlightGlowMat = new THREE.MeshBasicMaterial({
    color: config.lightsOn ? 0xffffff : 0x444444,
  });
  lightMaterials.push(headlightGlowMat);

  // Taillight Tri-Bar Glow Material
  const taillightGlowMat = new THREE.MeshBasicMaterial({
    color: config.lightsOn ? 0xff1122 : 0x550000,
  });
  lightMaterials.push(taillightGlowMat);

  // ==========================================
  // 1. MUSTANG MAIN BODY & FASTBACK GREENHOUSE
  // ==========================================
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'Mustang_Body';

  // Lower Chassis / Floor
  const chassisGeom = new THREE.BoxGeometry(1.88, 0.28, 4.4, 4, 2, 8);
  const chassisMesh = new THREE.Mesh(chassisGeom, blackTrimMat);
  chassisMesh.position.set(0, 0.28, 0);
  bodyGroup.add(chassisMesh);

  // Main Chiseled Body Shell
  const mainBodyShape = new THREE.Shape();
  mainBodyShape.moveTo(-0.95, 0.26);
  mainBodyShape.lineTo(-0.96, 0.68);
  mainBodyShape.lineTo(-0.84, 0.95);
  mainBodyShape.lineTo(0.84, 0.95);
  mainBodyShape.lineTo(0.96, 0.68);
  mainBodyShape.lineTo(0.95, 0.26);
  mainBodyShape.closePath();

  const bodyExtrudeSettings = {
    steps: 1,
    depth: 4.5,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.07,
    bevelSegments: 6,
  };
  const bodyGeom = new THREE.ExtrudeGeometry(mainBodyShape, bodyExtrudeSettings);
  bodyGeom.rotateY(Math.PI);
  bodyGeom.translate(0, 0, 2.25);
  const bodyMesh = new THREE.Mesh(bodyGeom, paintMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  bodyGroup.add(bodyMesh);

  // Long Muscle Car Hood with Twin Heat Extractor Louvers
  const hoodGeom = new THREE.BoxGeometry(1.58, 0.12, 1.65, 6, 2, 8);
  const hoodMesh = new THREE.Mesh(hoodGeom, paintMat);
  hoodMesh.position.set(0, 0.88, 1.25);
  hoodMesh.rotation.x = -0.02;
  bodyGroup.add(hoodMesh);

  // Hood Heat Extractor Vents
  [-0.32, 0.32].forEach((xOffset) => {
    const ventGeom = new THREE.BoxGeometry(0.18, 0.02, 0.52);
    const ventMesh = new THREE.Mesh(ventGeom, blackTrimMat);
    ventMesh.position.set(xOffset, 0.95, 1.15);
    ventMesh.rotation.x = -0.02;
    bodyGroup.add(ventMesh);
  });

  // Fastback Roof & Sloping C-Pillars (Mustang Signature Fastback Silhouette)
  const cabinShape = new THREE.Shape();
  cabinShape.moveTo(-0.78, 0.92);
  cabinShape.lineTo(-0.68, 1.34);
  cabinShape.lineTo(0.68, 1.34);
  cabinShape.lineTo(0.78, 0.92);
  cabinShape.closePath();

  const cabinGeom = new THREE.ExtrudeGeometry(cabinShape, {
    steps: 1,
    depth: 2.15,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 6,
  });
  cabinGeom.rotateY(Math.PI);
  cabinGeom.translate(0, 0, 0.8);
  const cabinMesh = new THREE.Mesh(cabinGeom, config.carbonFiberRoof ? carbonMat : paintMat);
  cabinMesh.castShadow = true;
  bodyGroup.add(cabinMesh);

  // Windshield (Aggressive Rake)
  const windshieldGeom = new THREE.PlaneGeometry(1.36, 0.72);
  const windshield = new THREE.Mesh(windshieldGeom, glassMat);
  windshield.position.set(0, 1.14, 0.72);
  windshield.rotation.x = -Math.PI / 3.2;
  bodyGroup.add(windshield);

  // Fastback Rear Sloping Window
  const rearWindowGeom = new THREE.PlaneGeometry(1.24, 1.05);
  const rearWindow = new THREE.Mesh(rearWindowGeom, glassMat);
  rearWindow.position.set(0, 1.12, -0.92);
  rearWindow.rotation.x = Math.PI / 4.4;
  rearWindow.rotation.y = Math.PI;
  bodyGroup.add(rearWindow);

  // Side Glass
  [-0.72, 0.72].forEach((xPos) => {
    const sideGlassGeom = new THREE.PlaneGeometry(1.4, 0.34);
    const sideGlass = new THREE.Mesh(sideGlassGeom, glassMat);
    sideGlass.position.set(xPos, 1.12, -0.05);
    sideGlass.rotation.y = xPos > 0 ? Math.PI / 2 : -Math.PI / 2;
    bodyGroup.add(sideGlass);
  });

  // Muscular Wide Rear Wheel Haunches
  [-0.96, 0.96].forEach((xPos) => {
    const haunchGeom = new THREE.BoxGeometry(0.14, 0.38, 1.25, 4, 3, 6);
    const haunchMesh = new THREE.Mesh(haunchGeom, paintMat);
    haunchMesh.position.set(xPos, 0.72, -1.18);
    haunchMesh.rotation.y = xPos > 0 ? -0.04 : 0.04;
    bodyGroup.add(haunchMesh);
  });

  // Front Wide Fenders
  [-0.94, 0.94].forEach((xPos) => {
    const fenderGeom = new THREE.BoxGeometry(0.12, 0.36, 1.2, 4, 3, 6);
    const fenderMesh = new THREE.Mesh(fenderGeom, paintMat);
    fenderMesh.position.set(xPos, 0.70, 1.22);
    bodyGroup.add(fenderMesh);
  });

  // ==========================================
  // 2. AGGRESSIVE MUSTANG SHARK-NOSE GRILLE & LIGHTS
  // ==========================================
  // Mustang Hexagonal Grille
  const grilleGeom = new THREE.BoxGeometry(1.28, 0.36, 0.12);
  const grilleMesh = new THREE.Mesh(grilleGeom, blackTrimMat);
  grilleMesh.position.set(0, 0.64, 2.22);
  bodyGroup.add(grilleMesh);

  // Centered Running Pony Badge
  const badgeGeom = new THREE.BoxGeometry(0.12, 0.06, 0.04);
  const badgeMesh = new THREE.Mesh(badgeGeom, chromeMat);
  badgeMesh.position.set(0, 0.64, 2.29);
  bodyGroup.add(badgeMesh);

  // Mustang Tri-Bar Angular LED Headlights
  [-0.68, 0.68].forEach((xOffset) => {
    const lightHousingGeom = new THREE.BoxGeometry(0.38, 0.16, 0.22);
    const housing = new THREE.Mesh(lightHousingGeom, blackTrimMat);
    housing.position.set(xOffset, 0.72, 2.16);
    bodyGroup.add(housing);

    // Tri-Bar DRL Slits
    [-0.08, 0.0, 0.08].forEach((barOffset) => {
      const barGeom = new THREE.BoxGeometry(0.024, 0.11, 0.02);
      const barMesh = new THREE.Mesh(barGeom, headlightGlowMat);
      barMesh.position.set(xOffset + barOffset, 0.72, 2.27);
      barMesh.rotation.z = xOffset > 0 ? -0.15 : 0.15;
      bodyGroup.add(barMesh);
    });
  });

  // Lower Front Chin Splitter
  const splitterGeom = new THREE.BoxGeometry(1.84, 0.06, 0.42);
  const splitterMesh = new THREE.Mesh(splitterGeom, carbonMat);
  splitterMesh.position.set(0, 0.16, 2.24);
  bodyGroup.add(splitterMesh);

  // ==========================================
  // 3. REAR DECKLID & ICONIC TRI-BAR SEQUENTIAL TAILLIGHTS
  // ==========================================
  // Gloss Black Rear Center Decklid Panel
  const decklidGeom = new THREE.BoxGeometry(1.52, 0.34, 0.08);
  const decklidMesh = new THREE.Mesh(decklidGeom, blackTrimMat);
  decklidMesh.position.set(0, 0.74, -2.24);
  bodyGroup.add(decklidMesh);

  // Center GT Emblem
  const gtBadgeGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.02, 16);
  gtBadgeGeom.rotateX(Math.PI / 2);
  const gtBadge = new THREE.Mesh(gtBadgeGeom, chromeMat);
  gtBadge.position.set(0, 0.74, -2.29);
  bodyGroup.add(gtBadge);

  // Iconic Vertical Tri-Bar Taillights (3 red bars on each side)
  [-0.56, 0.56].forEach((xSide) => {
    [-0.10, 0.0, 0.10].forEach((barOff) => {
      const barGeom = new THREE.BoxGeometry(0.045, 0.24, 0.03);
      const barMesh = new THREE.Mesh(barGeom, taillightGlowMat);
      barMesh.position.set(xSide + barOff, 0.74, -2.28);
      bodyGroup.add(barMesh);
    });
  });

  // Rear Ducktail Lip Spoiler
  const spoilerGeom = new THREE.BoxGeometry(1.58, 0.07, 0.22);
  const spoilerMesh = new THREE.Mesh(spoilerGeom, config.aero.carbonPackage ? carbonMat : paintMat);
  spoilerMesh.position.set(0, 0.94, -2.18);
  spoilerMesh.rotation.x = 0.12;
  bodyGroup.add(spoilerMesh);

  // Rear Quad Exhaust Diffuser
  const diffuserGeom = new THREE.BoxGeometry(1.72, 0.18, 0.32);
  const diffuserMesh = new THREE.Mesh(diffuserGeom, carbonMat);
  diffuserMesh.position.set(0, 0.22, -2.22);
  bodyGroup.add(diffuserMesh);

  // Quad Chrome Exhaust Tips
  [-0.66, -0.52, 0.52, 0.66].forEach((xPos) => {
    const tipGeom = new THREE.CylinderGeometry(0.055, 0.055, 0.22, 24);
    tipGeom.rotateX(Math.PI / 2);
    const tipMesh = new THREE.Mesh(tipGeom, chromeMat);
    tipMesh.position.set(xPos, 0.22, -2.32);
    bodyGroup.add(tipMesh);
  });

  // Sleek Side Mirrors
  [-0.98, 0.98].forEach((xPos) => {
    const mirrorGeom = new THREE.BoxGeometry(0.22, 0.12, 0.16);
    const mirrorMesh = new THREE.Mesh(mirrorGeom, paintMat);
    mirrorMesh.position.set(xPos, 0.98, 0.52);
    bodyGroup.add(mirrorMesh);
  });

  root.add(bodyGroup);

  // ==========================================
  // 4. MUSTANG 5-SPOKE MUSCLE WHEELS & TIRES
  // ==========================================
  const wheelPositions = [
    { x: -0.92, y: 0.36, z: 1.35, isLeft: true },
    { x: 0.92, y: 0.36, z: 1.35, isLeft: false },
    { x: -0.95, y: 0.36, z: -1.35, isLeft: true },
    { x: 0.95, y: 0.36, z: -1.35, isLeft: false },
  ];

  const rimColorHex = config.wheels.rimColor || '#b0b5be';
  const rimMat = new THREE.MeshStandardMaterial({
    color: rimColorHex,
    metalness: 0.88,
    roughness: 0.22,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x141416,
    roughness: 0.88,
    metalness: 0.08,
  });

  const caliperMat = new THREE.MeshStandardMaterial({
    color: config.wheels.caliperColor || '#c4122d', // Brembo Red default
    metalness: 0.6,
    roughness: 0.28,
  });

  wheelPositions.forEach((pos) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(pos.x, pos.y, pos.z);

    // High-poly Tire Torus
    const tireGeom = new THREE.TorusGeometry(0.35, 0.12, 24, 48);
    tireGeom.rotateY(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeom, tireMat);
    tireMesh.castShadow = true;
    wheelGroup.add(tireMesh);

    // Deep-Dish Rim Barrel
    const rimGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.22, 36);
    rimGeom.rotateZ(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeom, rimMat);
    wheelGroup.add(rimMesh);

    // 5 Bold Mustang Muscle Spokes
    for (let i = 0; i < 5; i++) {
      const angle = (i * (Math.PI * 2)) / 5;
      const spokeGeom = new THREE.BoxGeometry(0.04, 0.24, 0.06);
      const spoke = new THREE.Mesh(spokeGeom, rimMat);
      spoke.position.set(pos.isLeft ? -0.06 : 0.06, Math.cos(angle) * 0.12, Math.sin(angle) * 0.12);
      spoke.rotation.x = angle;
      wheelGroup.add(spoke);
    }

    // Center Cap with Pony Emblem
    const capGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.03, 24);
    capGeom.rotateZ(Math.PI / 2);
    const capMesh = new THREE.Mesh(capGeom, chromeMat);
    capMesh.position.set(pos.isLeft ? -0.11 : 0.11, 0, 0);
    wheelGroup.add(capMesh);

    // Perforated Brake Rotor Disc
    const rotorGeom = new THREE.CylinderGeometry(0.23, 0.23, 0.02, 32);
    rotorGeom.rotateZ(Math.PI / 2);
    const rotorMesh = new THREE.Mesh(rotorGeom, chromeMat);
    rotorMesh.position.set(pos.isLeft ? -0.02 : 0.02, 0, 0);
    wheelGroup.add(rotorMesh);

    // Performance Caliper
    const caliperGeom = new THREE.BoxGeometry(0.06, 0.13, 0.16);
    const caliperMesh = new THREE.Mesh(caliperGeom, caliperMat);
    caliperMesh.position.set(pos.isLeft ? -0.04 : 0.04, 0.14, 0);
    wheelGroup.add(caliperMesh);

    root.add(wheelGroup);
    wheels.push(wheelGroup);
  });

  // Apply smooth vertex normals across all meshes
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
        mat.opacity = 0.75 + newConfig.windowTint * 0.22;
        mat.needsUpdate = true;
      });
      headlightGlowMat.color.set(newConfig.lightsOn ? 0xffffff : 0x444444);
      taillightGlowMat.color.set(newConfig.lightsOn ? 0xff1122 : 0x550000);
      rimMat.color.set(newConfig.wheels.rimColor);
      caliperMat.color.set(newConfig.wheels.caliperColor);
    },
    updateAnimations: (delta: number, curConfig: CarConfigState) => {
      if (curConfig.isDriving) {
        const speed = curConfig.driveSpeed * 14 * delta;
        wheels.forEach((w) => {
          w.rotation.x += speed;
        });
      }
    },
  };
}
