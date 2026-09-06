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
    mat.metalness = 0.85;
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

export function buildGwagonModel(config: CarConfigState): InteractiveModelInstance {
  const root = new THREE.Group();
  root.name = 'GWagon_G63_Model';

  const bodyMaterials: THREE.MeshPhysicalMaterial[] = [];
  const glassMaterials: THREE.MeshPhysicalMaterial[] = [];
  const lightMaterials: (THREE.MeshStandardMaterial | THREE.MeshBasicMaterial)[] = [];
  const wheels: THREE.Group[] = [];

  // Exterior Paint
  const paintMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(config.paintColor || '#1c1e22'),
    metalness: 0.7,
    roughness: 0.25,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });
  applyPaintStyle(paintMat, config.paintColor || '#1c1e22', config.paintFinish);
  bodyMaterials.push(paintMat);

  // Black Trim / Rub-strip
  const blackTrimMat = new THREE.MeshStandardMaterial({
    color: 0x111215,
    roughness: 0.75,
    metalness: 0.15,
  });

  // Matte Black Carbon Accent
  const darkMatteMat = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    roughness: 0.5,
    metalness: 0.3,
  });

  // Chrome / Brushed Aluminum
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf0f2f5,
    roughness: 0.12,
    metalness: 0.95,
  });

  // Tinted Glass
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0c10,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.86,
    thickness: 0.5,
    transparent: true,
    opacity: 0.78 + config.windowTint * 0.2,
  });
  glassMaterials.push(glassMat);

  // Round Headlight LED Ring Glow
  const headlightGlowMat = new THREE.MeshBasicMaterial({
    color: config.lightsOn ? 0xffffff : 0x444444,
  });
  lightMaterials.push(headlightGlowMat);

  // Turn Signal Amber Glow
  const indicatorGlowMat = new THREE.MeshBasicMaterial({
    color: config.lightsOn ? 0xffa500 : 0x774400,
  });
  lightMaterials.push(indicatorGlowMat);

  // Taillight Glow
  const taillightGlowMat = new THREE.MeshBasicMaterial({
    color: config.lightsOn ? 0xff1824 : 0x550000,
  });
  lightMaterials.push(taillightGlowMat);

  // ==========================================
  // 1. G-WAGON BOXY CHASSIS & UPRIGHT CABIN
  // ==========================================
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'GWagon_Body';

  // High-Ground Clearance Heavy Frame
  const chassisGeom = new THREE.BoxGeometry(1.85, 0.36, 4.3, 4, 2, 8);
  const chassis = new THREE.Mesh(chassisGeom, blackTrimMat);
  chassis.position.set(0, 0.42, 0);
  bodyGroup.add(chassis);

  // Main Upright Box Body
  const lowerBodyGeom = new THREE.BoxGeometry(1.92, 0.75, 4.25, 4, 3, 8);
  const lowerBody = new THREE.Mesh(lowerBodyGeom, paintMat);
  lowerBody.position.set(0, 0.95, 0.02);
  lowerBody.castShadow = true;
  lowerBody.receiveShadow = true;
  bodyGroup.add(lowerBody);

  // Upright Greenhouse Cabin (Classic G-Class High Roof)
  const cabinGeom = new THREE.BoxGeometry(1.78, 0.76, 2.75, 4, 2, 6);
  const cabin = new THREE.Mesh(cabinGeom, paintMat);
  cabin.position.set(0, 1.66, -0.28);
  cabin.castShadow = true;
  bodyGroup.add(cabin);

  // Flat Roof Panel with Longitudinal Ribs
  const roofGeom = new THREE.BoxGeometry(1.82, 0.08, 2.82);
  const roof = new THREE.Mesh(roofGeom, paintMat);
  roof.position.set(0, 2.06, -0.28);
  bodyGroup.add(roof);

  // Roof Rails (Left & Right)
  [-0.82, 0.82].forEach((xPos) => {
    const railGeom = new THREE.BoxGeometry(0.04, 0.05, 2.6);
    const rail = new THREE.Mesh(railGeom, blackTrimMat);
    rail.position.set(xPos, 2.12, -0.28);
    bodyGroup.add(rail);
  });

  // Flat Upright Windshield
  const windshieldGeom = new THREE.PlaneGeometry(1.58, 0.65);
  const windshield = new THREE.Mesh(windshieldGeom, glassMat);
  windshield.position.set(0, 1.66, 1.10);
  windshield.rotation.x = -0.16; // Iconic nearly vertical rake
  bodyGroup.add(windshield);

  // Flat Vertical Rear Cargo Glass
  const rearWindowGeom = new THREE.PlaneGeometry(1.48, 0.58);
  const rearWindow = new THREE.Mesh(rearWindowGeom, glassMat);
  rearWindow.position.set(0, 1.66, -1.66);
  rearWindow.rotation.y = Math.PI;
  bodyGroup.add(rearWindow);

  // Side Passenger Windows (3 Boxy Windows per side)
  [-0.90, 0.90].forEach((xPos) => {
    [-0.85, -0.28, 0.35].forEach((zPos) => {
      const windowGeom = new THREE.PlaneGeometry(0.72, 0.48);
      const sideWin = new THREE.Mesh(windowGeom, glassMat);
      sideWin.position.set(xPos, 1.65, zPos);
      sideWin.rotation.y = xPos > 0 ? Math.PI / 2 : -Math.PI / 2;
      bodyGroup.add(sideWin);
    });
  });

  // Characteristic Protective Waistline Rub-Strips with Chrome Inlay
  [-0.97, 0.97].forEach((xPos) => {
    const stripGeom = new THREE.BoxGeometry(0.03, 0.06, 4.15);
    const strip = new THREE.Mesh(stripGeom, blackTrimMat);
    strip.position.set(xPos, 1.18, 0);
    bodyGroup.add(strip);

    const inlayGeom = new THREE.BoxGeometry(0.032, 0.018, 4.12);
    const inlay = new THREE.Mesh(inlayGeom, chromeMat);
    inlay.position.set(xPos, 1.18, 0);
    bodyGroup.add(inlay);
  });

  // Retro External Door Hinges (2 on each door, 8 total)
  [-0.98, 0.98].forEach((xPos) => {
    [0.72, 0.18, -0.38, -0.92].forEach((zPos) => {
      [1.32, 0.88].forEach((yPos) => {
        const hingeGeom = new THREE.BoxGeometry(0.04, 0.06, 0.04);
        const hinge = new THREE.Mesh(hingeGeom, blackTrimMat);
        hinge.position.set(xPos, yPos, zPos);
        bodyGroup.add(hinge);
      });
    });
  });

  // Muscular Squared-Off Fender Flares
  [-1.04, 1.04].forEach((xPos) => {
    // Front flared arch
    const frontArchGeom = new THREE.BoxGeometry(0.18, 0.38, 1.18);
    const frontArch = new THREE.Mesh(frontArchGeom, paintMat);
    frontArch.position.set(xPos, 0.78, 1.34);
    bodyGroup.add(frontArch);

    // Rear flared arch
    const rearArchGeom = new THREE.BoxGeometry(0.18, 0.38, 1.18);
    const rearArch = new THREE.Mesh(rearArchGeom, paintMat);
    rearArch.position.set(xPos, 0.78, -1.34);
    bodyGroup.add(rearArch);
  });

  // ==========================================
  // 2. FRONT FACIA: PANAMERICANA GRILLE & LIGHTS
  // ==========================================
  // Flat Vertical Front Hood / Bonnets
  const hoodGeom = new THREE.BoxGeometry(1.68, 0.16, 1.48);
  const hood = new THREE.Mesh(hoodGeom, paintMat);
  hood.position.set(0, 1.28, 1.40);
  bodyGroup.add(hood);

  // Hood Power Bulge / Center Peak
  const bulgeGeom = new THREE.BoxGeometry(1.24, 0.05, 1.32);
  const bulge = new THREE.Mesh(bulgeGeom, paintMat);
  bulge.position.set(0, 1.38, 1.40);
  bodyGroup.add(bulge);

  // Top Fender-Mounted Turn Signal Pods (Classic G-Wagon Feature!)
  [-0.78, 0.78].forEach((xPos) => {
    const podBaseGeom = new THREE.BoxGeometry(0.14, 0.08, 0.22);
    const podBase = new THREE.Mesh(podBaseGeom, blackTrimMat);
    podBase.position.set(xPos, 1.38, 1.84);
    bodyGroup.add(podBase);

    const podLensGeom = new THREE.BoxGeometry(0.11, 0.05, 0.16);
    const podLens = new THREE.Mesh(podLensGeom, indicatorGlowMat);
    podLens.position.set(xPos, 1.43, 1.84);
    bodyGroup.add(podLens);
  });

  // Panamericana Vertical Slat Grille Housing
  const grilleHousingGeom = new THREE.BoxGeometry(1.58, 0.52, 0.12);
  const grilleHousing = new THREE.Mesh(grilleHousingGeom, darkMatteMat);
  grilleHousing.position.set(0, 0.94, 2.14);
  bodyGroup.add(grilleHousing);

  // Panamericana Vertical Chrome Slats (14 slats)
  for (let i = -6; i <= 6; i++) {
    const slatGeom = new THREE.BoxGeometry(0.02, 0.36, 0.025);
    const slat = new THREE.Mesh(slatGeom, chromeMat);
    slat.position.set(i * 0.085, 0.94, 2.21);
    bodyGroup.add(slat);
  }

  // Giant Center Mercedes 3-Pointed Star
  const starRingGeom = new THREE.TorusGeometry(0.14, 0.02, 16, 32);
  const starRing = new THREE.Mesh(starRingGeom, chromeMat);
  starRing.position.set(0, 0.94, 2.22);
  bodyGroup.add(starRing);

  // Iconic Circular LED Headlights
  [-0.64, 0.64].forEach((xPos) => {
    // Outer black bucket
    const bucketGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 32);
    bucketGeom.rotateX(Math.PI / 2);
    const bucket = new THREE.Mesh(bucketGeom, blackTrimMat);
    bucket.position.set(xPos, 0.94, 2.17);
    bodyGroup.add(bucket);

    // Glowing Round LED Halo Ring
    const haloGeom = new THREE.TorusGeometry(0.13, 0.022, 16, 32);
    const halo = new THREE.Mesh(haloGeom, headlightGlowMat);
    halo.position.set(xPos, 0.94, 2.22);
    bodyGroup.add(halo);

    // Central Projector Lens
    const projGeom = new THREE.SphereGeometry(0.06, 16, 16);
    const proj = new THREE.Mesh(projGeom, headlightGlowMat);
    proj.position.set(xPos, 0.94, 2.21);
    bodyGroup.add(proj);
  });

  // Rugged AMG Front Bumper with Bull-Bar Accent
  const bumperGeom = new THREE.BoxGeometry(1.94, 0.28, 0.32);
  const bumper = new THREE.Mesh(bumperGeom, darkMatteMat);
  bumper.position.set(0, 0.54, 2.20);
  bodyGroup.add(bumper);

  // Brushed Silver Front Skid Plate Guard
  const skidGeom = new THREE.BoxGeometry(1.24, 0.12, 0.24);
  const skid = new THREE.Mesh(skidGeom, chromeMat);
  skid.position.set(0, 0.36, 2.24);
  bodyGroup.add(skid);

  // ==========================================
  // 3. AMG SIDE-EXIT DUAL EXHAUST PIPES
  // ==========================================
  // Signature G63 Side Exhaust Tips (protruding right below passenger doors before rear wheels!)
  [-1.02, 1.02].forEach((xPos) => {
    [-0.45, -0.62].forEach((zPos) => {
      const tipGeom = new THREE.CylinderGeometry(0.048, 0.048, 0.18, 24);
      tipGeom.rotateZ(Math.PI / 2);
      const tip = new THREE.Mesh(tipGeom, chromeMat);
      tip.position.set(xPos > 0 ? xPos - 0.02 : xPos + 0.02, 0.36, zPos);
      tip.rotation.y = xPos > 0 ? 0.2 : -0.2;
      bodyGroup.add(tip);
    });
  });

  // Heavy Metal Side Steps / Running Boards
  [-1.06, 1.06].forEach((xPos) => {
    const stepGeom = new THREE.BoxGeometry(0.18, 0.05, 2.4);
    const step = new THREE.Mesh(stepGeom, chromeMat);
    step.position.set(xPos, 0.44, -0.05);
    bodyGroup.add(step);

    const stepTreadGeom = new THREE.BoxGeometry(0.14, 0.02, 2.3);
    const tread = new THREE.Mesh(stepTreadGeom, blackTrimMat);
    tread.position.set(xPos, 0.47, -0.05);
    bodyGroup.add(tread);
  });

  // ==========================================
  // 4. REAR DOOR & FULL-SIZE MOUNTED SPARE TIRE
  // ==========================================
  // Rear Tailgate Door Panel
  const rearDoorGeom = new THREE.BoxGeometry(1.76, 0.74, 0.08);
  const rearDoor = new THREE.Mesh(rearDoorGeom, paintMat);
  rearDoor.position.set(0, 0.95, -2.14);
  bodyGroup.add(rearDoor);

  // Rear Mounted Full-Size Spare Wheel with Chrome Ring
  const spareGroup = new THREE.Group();
  spareGroup.position.set(0.08, 1.10, -2.26);

  const spareCoverGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.18, 36);
  spareCoverGeom.rotateX(Math.PI / 2);
  const spareCover = new THREE.Mesh(spareCoverGeom, paintMat);
  spareGroup.add(spareCover);

  const spareRingGeom = new THREE.TorusGeometry(0.42, 0.028, 16, 48);
  const spareRing = new THREE.Mesh(spareRingGeom, chromeMat);
  spareGroup.add(spareRing);

  // Mercedes Star on Spare Cover
  const spareStarGeom = new THREE.TorusGeometry(0.11, 0.015, 16, 24);
  const spareStar = new THREE.Mesh(spareStarGeom, chromeMat);
  spareStar.position.set(0, 0, -0.10);
  spareGroup.add(spareStar);
  bodyGroup.add(spareGroup);

  // Rear Horizontal LED Taillights in Bumper
  [-0.68, 0.68].forEach((xPos) => {
    const tailGeom = new THREE.BoxGeometry(0.32, 0.08, 0.04);
    const tailMesh = new THREE.Mesh(tailGeom, taillightGlowMat);
    tailMesh.position.set(xPos, 0.58, -2.16);
    bodyGroup.add(tailMesh);
  });

  // Chunky Rear Off-Road Bumper
  const rearBumperGeom = new THREE.BoxGeometry(1.92, 0.24, 0.22);
  const rearBumper = new THREE.Mesh(rearBumperGeom, darkMatteMat);
  rearBumper.position.set(0, 0.54, -2.14);
  bodyGroup.add(rearBumper);

  // G63 & AMG Badges
  const badgeGeom = new THREE.BoxGeometry(0.14, 0.04, 0.02);
  const g63Badge = new THREE.Mesh(badgeGeom, chromeMat);
  g63Badge.position.set(-0.58, 1.25, -2.19);
  bodyGroup.add(g63Badge);

  root.add(bodyGroup);

  // ==========================================
  // 5. 22-INCH AMG CROSS-SPOKE OFF-ROAD WHEELS
  // ==========================================
  const wheelPositions = [
    { x: -1.02, y: 0.44, z: 1.38, isLeft: true },
    { x: 1.02, y: 0.44, z: 1.38, isLeft: false },
    { x: -1.02, y: 0.44, z: -1.38, isLeft: true },
    { x: 1.02, y: 0.44, z: -1.38, isLeft: false },
  ];

  const rimColorHex = config.wheels.rimColor || '#1c1e22';
  const rimMat = new THREE.MeshStandardMaterial({
    color: rimColorHex,
    metalness: 0.88,
    roughness: 0.24,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x141416,
    roughness: 0.92,
    metalness: 0.05,
  });

  const caliperMat = new THREE.MeshStandardMaterial({
    color: config.wheels.caliperColor || '#c4122d', // Red AMG Calipers
    metalness: 0.65,
    roughness: 0.25,
  });

  wheelPositions.forEach((pos) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(pos.x, pos.y, pos.z);

    // Chunky High-Profile Off-Road Tire
    const tireGeom = new THREE.TorusGeometry(0.42, 0.15, 24, 48);
    tireGeom.rotateY(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeom, tireMat);
    tireMesh.castShadow = true;
    wheelGroup.add(tireMesh);

    // 22" AMG Cross-Spoke Rim Barrel
    const rimGeom = new THREE.CylinderGeometry(0.33, 0.33, 0.26, 36);
    rimGeom.rotateZ(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeom, rimMat);
    wheelGroup.add(rimMesh);

    // Outer Silver Polished Flange Lip
    const lipGeom = new THREE.TorusGeometry(0.33, 0.018, 16, 36);
    lipGeom.rotateY(Math.PI / 2);
    const lipMesh = new THREE.Mesh(lipGeom, chromeMat);
    lipMesh.position.set(pos.isLeft ? -0.13 : 0.13, 0, 0);
    wheelGroup.add(lipMesh);

    // Cross-Spoke Multi Mesh Pattern (10-spoke cross)
    for (let i = 0; i < 10; i++) {
      const angle = (i * (Math.PI * 2)) / 10;
      const spokeGeom = new THREE.BoxGeometry(0.038, 0.28, 0.04);
      const spoke = new THREE.Mesh(spokeGeom, rimMat);
      spoke.position.set(pos.isLeft ? -0.06 : 0.06, Math.cos(angle) * 0.14, Math.sin(angle) * 0.14);
      spoke.rotation.x = angle;
      wheelGroup.add(spoke);
    }

    // Center Hub Cap with Star
    const capGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.04, 24);
    capGeom.rotateZ(Math.PI / 2);
    const capMesh = new THREE.Mesh(capGeom, darkMatteMat);
    capMesh.position.set(pos.isLeft ? -0.12 : 0.12, 0, 0);
    wheelGroup.add(capMesh);

    // Massive 400mm AMG Ventilated Brake Rotor
    const rotorGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.024, 32);
    rotorGeom.rotateZ(Math.PI / 2);
    const rotorMesh = new THREE.Mesh(rotorGeom, chromeMat);
    rotorMesh.position.set(pos.isLeft ? -0.03 : 0.03, 0, 0);
    wheelGroup.add(rotorMesh);

    // AMG 6-Piston High Performance Caliper
    const caliperGeom = new THREE.BoxGeometry(0.08, 0.18, 0.18);
    const caliperMesh = new THREE.Mesh(caliperGeom, caliperMat);
    caliperMesh.position.set(pos.isLeft ? -0.05 : 0.05, 0.16, 0);
    wheelGroup.add(caliperMesh);

    root.add(wheelGroup);
    wheels.push(wheelGroup);
  });

  // Compute smooth vertex normals
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
        mat.opacity = 0.78 + newConfig.windowTint * 0.2;
        mat.needsUpdate = true;
      });
      headlightGlowMat.color.set(newConfig.lightsOn ? 0xffffff : 0x444444);
      taillightGlowMat.color.set(newConfig.lightsOn ? 0xff1824 : 0x550000);
      rimMat.color.set(newConfig.wheels.rimColor);
      caliperMat.color.set(newConfig.wheels.caliperColor);
    },
    updateAnimations: (delta: number, curConfig: CarConfigState) => {
      if (curConfig.isDriving) {
        const speed = curConfig.driveSpeed * 12 * delta;
        wheels.forEach((w) => {
          w.rotation.x += speed;
        });
      }
    },
  };
}
