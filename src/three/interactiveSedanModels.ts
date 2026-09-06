import * as THREE from 'three';
import { CarConfigState, PaintFinish } from '../types';

export interface InteractiveModelInstance {
  root: THREE.Group;
  wheels: THREE.Group[];
  bodyMaterials: THREE.MeshPhysicalMaterial[];
  glassMaterials: THREE.MeshPhysicalMaterial[];
  lightMaterials: (THREE.MeshStandardMaterial | THREE.MeshBasicMaterial)[];
  updateConfig: (config: CarConfigState) => void;
  updateAnimations: (delta: number, config: CarConfigState) => void;
}

/**
 * Configure PBR physical material based on active paint finish and color
 */
function applyPaintStyle(
  mat: THREE.MeshPhysicalMaterial,
  colorHex: string,
  finish: PaintFinish
) {
  mat.color.set(colorHex);
  if (finish === 'metallic') {
    mat.metalness = 0.82;
    mat.roughness = 0.24;
    mat.clearcoat = 1.0;
    mat.clearcoatRoughness = 0.12;
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
    mat.roughness = 0.28;
    mat.clearcoat = 1.0;
    mat.clearcoatRoughness = 0.08;
  }
  mat.needsUpdate = true;
}

/**
 * Smooth shading helper that re-computes smooth vertex normals and disables flatShading
 */
export function applySmoothNormalsAndShading(group: THREE.Object3D) {
  group.traverse((child) => {
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
}

// ---------------------------------------------------------------------
// 1. BMW 5 SERIES TWIN-TURBO SEDAN (Modular Rounded Architecture)
// ---------------------------------------------------------------------
function createRoundedBoxGeometry(
  w: number,
  h: number,
  d: number,
  r: number,
  segments: number = 8
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x, y + r);
  shape.lineTo(x, y + h - r);
  shape.quadraticCurveTo(x, y + h, x + r, y + h);
  shape.lineTo(x + w - r, y + h);
  shape.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
  shape.lineTo(x + w, y + r);
  shape.quadraticCurveTo(x + w, y, x + w - r, y);
  shape.lineTo(x + r, y);
  shape.quadraticCurveTo(x, y, x, y + r);

  const extrude = new THREE.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: r * 0.6,
    bevelSize: r * 0.6,
    bevelSegments: Math.max(segments, 8),
    curveSegments: Math.max(segments, 16),
  });
  extrude.translate(0, 0, -d / 2);
  extrude.computeVertexNormals();
  return extrude;
}

export function buildBmw5SeriesModel(config: CarConfigState): InteractiveModelInstance {
  const root = new THREE.Group();
  root.name = 'Bmw5Series_Root';

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: config.paintColor,
    metalness: 0.6,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  applyPaintStyle(bodyMat, config.paintColor, config.paintFinish);

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x0c0d0f,
    metalness: 0.8,
    roughness: 0.35,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d1420,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.55,
    transparent: true,
    opacity: config.windowTint,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xc9cdd3,
    metalness: 1,
    roughness: 0.15,
  });

  const lightMat = new THREE.MeshStandardMaterial({
    color: config.lightsOn ? new THREE.Color(config.haloGlowColor) : new THREE.Color(0x777777),
    emissive: config.lightsOn ? new THREE.Color(config.haloGlowColor) : new THREE.Color(0x000000),
    emissiveIntensity: config.lightsOn ? 0.7 : 0.0,
    roughness: 0.3,
  });

  const tailMat = new THREE.MeshStandardMaterial({
    color: 0x9e1a1a,
    emissive: config.lightsOn ? 0x9e1a1a : 0x220505,
    emissiveIntensity: config.lightsOn ? 0.65 : 0.1,
    roughness: 0.3,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.9,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: config.wheels.rimColor,
    metalness: 0.9,
    roughness: 0.25,
  });

  // Lower body (main shell)
  const lowerBodyGeo = createRoundedBoxGeometry(4.6, 0.85, 1.9, 0.14, 4);
  const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyMat);
  lowerBody.rotation.x = Math.PI / 2;
  lowerBody.position.set(0, 0.62, 0);
  lowerBody.castShadow = true;
  lowerBody.receiveShadow = true;
  root.add(lowerBody);

  // Cabin / greenhouse
  const cabinGeo = createRoundedBoxGeometry(2.15, 0.62, 1.72, 0.16, 4);
  const cabin = new THREE.Mesh(cabinGeo, bodyMat);
  cabin.rotation.x = Math.PI / 2;
  cabin.position.set(-0.15, 1.12, 0);
  cabin.castShadow = true;
  root.add(cabin);

  // Windshield + rear glass
  const windshieldGeo = new THREE.BoxGeometry(0.06, 0.5, 1.55);
  const windshield = new THREE.Mesh(windshieldGeo, glassMat);
  windshield.position.set(0.88, 1.15, 0);
  windshield.rotation.z = -0.55;
  root.add(windshield);

  const rearGlass = new THREE.Mesh(windshieldGeo, glassMat);
  rearGlass.position.set(-1.12, 1.12, 0);
  rearGlass.rotation.z = 0.5;
  root.add(rearGlass);

  // Side windows
  const sideGlassGeo = new THREE.BoxGeometry(1.85, 0.42, 0.04);
  [1, -1].forEach((side) => {
    const g = new THREE.Mesh(sideGlassGeo, glassMat);
    g.position.set(-0.15, 1.15, side * 0.855);
    root.add(g);
  });

  // Hood & trunk crease details
  const hoodDetail = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 1.3), trimMat);
  hoodDetail.position.set(1.55, 1.02, 0);
  root.add(hoodDetail);

  // Front fascia / grille center
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 1.15), trimMat);
  grille.position.set(2.28, 0.72, 0);
  root.add(grille);

  // Kidney-style twin grille chrome accents
  [0.32, -0.32].forEach((z) => {
    const k = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.42), chromeMat);
    k.position.set(2.3, 0.72, z);
    root.add(k);
  });

  // Front & rear bumpers
  const bumper = new THREE.Mesh(createRoundedBoxGeometry(0.5, 0.85, 1.95, 0.12, 3), bodyMat);
  bumper.rotation.x = Math.PI / 2;
  bumper.rotation.y = Math.PI / 2;
  bumper.position.set(2.35, 0.55, 0);
  bumper.scale.set(1, 1, 0.55);
  root.add(bumper);

  const rearBumper = bumper.clone();
  rearBumper.position.set(-2.35, 0.55, 0);
  root.add(rearBumper);

  // Adaptive Headlights
  [0.55, -0.55].forEach((z) => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.34), lightMat);
    hl.position.set(2.34, 0.85, z);
    root.add(hl);
  });

  // Taillights
  [0.62, -0.62].forEach((z) => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.4), tailMat);
    tl.position.set(-2.34, 0.85, z);
    root.add(tl);
  });

  // Side mirrors
  [0.98, -0.98].forEach((z) => {
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.14), bodyMat);
    mirror.position.set(0.65, 1.05, z);
    root.add(mirror);
  });

  // Door seams
  [0.05, -0.75].forEach((x) => {
    const seam = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 0.55, 1.85),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 })
    );
    seam.position.set(x, 0.85, 0);
    root.add(seam);
  });

  // Door handles
  [0.4, -0.4].forEach((x) => {
    [0.96, -0.96].forEach((z) => {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.03), chromeMat);
      handle.position.set(x, 0.92, z);
      root.add(handle);
    });
  });

  // 4 Wheels
  function makeWheel(): THREE.Group {
    const group = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.115, 24, 48), tireMat);
    tire.rotation.y = Math.PI / 2;
    tire.castShadow = true;
    group.add(tire);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.22, 36), rimMat);
    rim.rotation.z = Math.PI / 2;
    group.add(rim);

    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.04), rimMat);
      spoke.rotation.x = (i / 5) * Math.PI * 2;
      group.add(spoke);
    }

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.24, 24), trimMat);
    hub.rotation.z = Math.PI / 2;
    group.add(hub);

    return group;
  }

  const wheelPositions: [number, number, number][] = [
    [1.5, 0.36, 0.98],
    [1.5, 0.36, -0.98],
    [-1.5, 0.36, 0.98],
    [-1.5, 0.36, -0.98],
  ];
  const wheels = wheelPositions.map((p) => {
    const w = makeWheel();
    w.position.set(...p);
    root.add(w);
    return w;
  });

  applySmoothNormalsAndShading(root);

  return {
    root,
    wheels,
    bodyMaterials: [bodyMat],
    glassMaterials: [glassMat],
    lightMaterials: [lightMat, tailMat],
    updateConfig(cfg: CarConfigState) {
      applyPaintStyle(bodyMat, cfg.paintColor, cfg.paintFinish);
      rimMat.color.set(cfg.wheels.rimColor);
      glassMat.opacity = cfg.windowTint;
      glassMat.needsUpdate = true;

      const lightCol = cfg.lightsOn ? new THREE.Color(cfg.haloGlowColor) : new THREE.Color(0x777777);
      lightMat.color.copy(lightCol);
      lightMat.emissive.copy(cfg.lightsOn ? lightCol : new THREE.Color(0x000000));
      lightMat.emissiveIntensity = cfg.lightsOn ? 0.7 : 0.0;

      tailMat.emissiveIntensity = cfg.lightsOn ? 0.65 : 0.1;
    },
    updateAnimations(delta: number, cfg: CarConfigState) {
      if (cfg.isDriving) {
        const speed = cfg.driveSpeed * 16;
        wheels.forEach((w) => {
          w.rotation.z -= delta * speed;
        });
      }
    },
  };
}

// ---------------------------------------------------------------------
// 2. LOFTED AERODYNAMIC SEDAN (Spline curve & 3D Taper Algorithm)
// ---------------------------------------------------------------------
export function buildSedanLoftedModel(config: CarConfigState): InteractiveModelInstance {
  const root = new THREE.Group();
  root.name = 'SedanLofted_Root';

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: config.paintColor,
    metalness: 0.65,
    roughness: 0.26,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  applyPaintStyle(bodyMat, config.paintColor, config.paintFinish);

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x0c0d0f,
    metalness: 0.8,
    roughness: 0.4,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0c1420,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.5,
    transparent: true,
    opacity: config.windowTint,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xc9cdd3,
    metalness: 1,
    roughness: 0.15,
  });

  const lightMat = new THREE.MeshStandardMaterial({
    color: config.lightsOn ? new THREE.Color(config.haloGlowColor) : new THREE.Color(0xfff2d0),
    emissive: config.lightsOn ? new THREE.Color(config.haloGlowColor) : new THREE.Color(0x000000),
    emissiveIntensity: config.lightsOn ? 0.65 : 0.1,
    roughness: 0.3,
  });

  const tailMat = new THREE.MeshStandardMaterial({
    color: 0x9e1a1a,
    emissive: config.lightsOn ? 0x9e1a1a : 0x330000,
    emissiveIntensity: config.lightsOn ? 0.55 : 0.1,
    roughness: 0.3,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.92,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: config.wheels.rimColor,
    metalness: 0.9,
    roughness: 0.25,
  });

  const archMat = new THREE.MeshStandardMaterial({
    color: 0x08090a,
    roughness: 0.9,
  });

  function clamp(v: number, a: number, b: number) {
    return Math.max(a, Math.min(b, v));
  }
  function smoothstep(a: number, b: number, x: number) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  // Side-profile control points (x = length, y = height), nose at +x
  const profilePts: [number, number][] = [
    [2.44, 0.16],
    [2.5, 0.34],
    [2.45, 0.55],
    [2.3, 0.66],
    [1.55, 0.745],
    [1.05, 0.8],
    [0.42, 1.28],
    [-0.35, 1.345],
    [-0.9, 1.32],
    [-1.52, 0.97],
    [-2.0, 1.015],
    [-2.32, 0.86],
    [-2.47, 0.58],
    [-2.5, 0.32],
    [-2.44, 0.16],
    [2.44, 0.16],
  ];
  const curvePts = profilePts.map((p) => new THREE.Vector2(p[0], p[1]));
  const spline = new THREE.SplineCurve(curvePts);
  const sampled = spline.getPoints(140);

  const shape = new THREE.Shape();
  shape.moveTo(sampled[0].x, sampled[0].y);
  for (let i = 1; i < sampled.length; i++) {
    shape.lineTo(sampled[i].x, sampled[i].y);
  }
  shape.closePath();

  const CAR_WIDTH = 1.94;
  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: CAR_WIDTH,
    bevelEnabled: false,
    curveSegments: 1,
  });
  bodyGeo.translate(0, 0, -CAR_WIDTH / 2);

  // Taper function: nose/tail narrow, greenhouse narrows, fenders flare
  function taper(x: number, y: number): number {
    const nose = smoothstep(1.9, 2.5, x);
    const tail = smoothstep(-1.9, -2.5, -x);
    const lf = 1 - 0.42 * nose - 0.42 * tail;

    let vf = 1;
    if (y > 0.82) {
      const g = smoothstep(0.82, 1.34, y);
      vf = 1 - 0.3 * g;
    }

    let fender = 0;
    for (const wx of [1.5, -1.5]) {
      const d = Math.abs(x - wx);
      if (y < 0.7 && d < 0.6) {
        const radial = 1 - d / 0.6;
        const vert = 1 - Math.max(0, (y - 0.3) / 0.4);
        fender += radial * vert * 0.1;
      }
    }
    return lf * vf + fender;
  }

  const posAttr = bodyGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    const s = taper(x, y);
    posAttr.setZ(i, z * s);
  }
  posAttr.needsUpdate = true;
  bodyGeo.computeVertexNormals();

  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  // Glass planes: windshield, rear screen
  function glassPlane(
    p1: [number, number],
    p2: [number, number],
    width: number,
    insetY: number = 0
  ): THREE.Mesh {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const len = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const g = new THREE.Mesh(new THREE.BoxGeometry(len, 0.045, width), glassMat);
    g.position.set((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 + insetY, 0);
    g.rotation.z = angle;
    return g;
  }

  root.add(glassPlane([1.05, 0.815], [0.42, 1.3], 1.62, 0.01)); // Windshield
  root.add(glassPlane([-0.9, 1.31], [-1.52, 0.985], 1.55, 0.01)); // Rear screen

  // Side windows (extruded polygon)
  const sideWinShape = new THREE.Shape();
  sideWinShape.moveTo(1.0, 0.86);
  sideWinShape.lineTo(0.4, 1.27);
  sideWinShape.lineTo(-0.88, 1.29);
  sideWinShape.lineTo(-1.45, 0.98);
  sideWinShape.lineTo(-1.45, 0.86);
  sideWinShape.lineTo(1.0, 0.86);
  const sideWinGeo = new THREE.ExtrudeGeometry(sideWinShape, { depth: 0.02, bevelEnabled: false });
  sideWinGeo.translate(0, 0, -0.01);
  [1, -1].forEach((side) => {
    const w = new THREE.Mesh(sideWinGeo, glassMat);
    w.position.z = side * 0.815;
    root.add(w);
  });

  // Pillars (A-pillar and C-pillar)
  function makePillar(x: number, y: number, h: number, angle: number): THREE.Mesh {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, 1.9), trimMat);
    p.position.set(x, y, 0);
    p.rotation.z = angle;
    return p;
  }
  root.add(makePillar(1.03, 0.9, 0.32, -0.85)); // A-pillar
  root.add(makePillar(-1.48, 0.97, 0.32, 0.65)); // C-pillar

  // Front fascia details: grille + chrome accents + headlights
  const frontGrille = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.26, 1.05), trimMat);
  frontGrille.position.set(2.42, 0.6, 0);
  root.add(frontGrille);

  [0.3, -0.3].forEach((z) => {
    const k = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.36), chromeMat);
    k.position.set(2.43, 0.6, z);
    root.add(k);
  });

  [0.62, -0.62].forEach((z) => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.3), lightMat);
    hl.position.set(2.42, 0.72, z);
    root.add(hl);
  });

  // Rear taillights & license plate
  [0.66, -0.66].forEach((z) => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.34), tailMat);
    tl.position.set(-2.44, 0.72, z);
    root.add(tl);
  });

  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.12, 0.32),
    new THREE.MeshStandardMaterial({ color: 0xdfe2e6, roughness: 0.6 })
  );
  plate.position.set(-2.47, 0.45, 0);
  root.add(plate);

  // Side mirrors
  [0.98, -0.98].forEach((z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.13), bodyMat);
    m.position.set(0.75, 0.98, z);
    root.add(m);
  });

  // Door handles
  [0.35, -0.55].forEach((x) => {
    [0.86, -0.86].forEach((z) => {
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), chromeMat);
      h.position.set(x, 0.78, z);
      root.add(h);
    });
  });

  // Door seam lines
  [-0.05, -0.85].forEach((x) => {
    const seam = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.5, 1.86),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 })
    );
    seam.position.set(x, 0.55, 0);
    root.add(seam);
  });

  // Rocker / lower body cladding
  const rocker = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.1, 1.98), trimMat);
  rocker.position.set(0, 0.2, 0);
  root.add(rocker);

  // 4 Wheels
  function makeLoftedWheel(): THREE.Group {
    const g = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.335, 0.115, 24, 48), tireMat);
    tire.rotation.y = Math.PI / 2;
    tire.castShadow = true;
    g.add(tire);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.2, 36), rimMat);
    rim.rotation.z = Math.PI / 2;
    g.add(rim);

    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.38, 0.035), rimMat);
      spoke.rotation.x = (i / 5) * Math.PI * 2;
      g.add(spoke);
    }

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 24), trimMat);
    hub.rotation.z = Math.PI / 2;
    g.add(hub);

    return g;
  }

  const TRACK = 0.94;
  const wheelPos: [number, number, number][] = [
    [1.5, 0.335, TRACK],
    [1.5, 0.335, -TRACK],
    [-1.5, 0.335, TRACK],
    [-1.5, 0.335, -TRACK],
  ];
  const wheels = wheelPos.map((p) => {
    const w = makeLoftedWheel();
    w.position.set(...p);
    root.add(w);
    return w;
  });

  // Wheel-arch trim (visual arc above each wheel opening)
  [1.5, -1.5].forEach((x) => {
    [1, -1].forEach((side) => {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.028, 16, 48, Math.PI), archMat);
      arch.position.set(x, 0.6, side * (TRACK - 0.02));
      arch.rotation.z = Math.PI;
      root.add(arch);
    });
  });

  applySmoothNormalsAndShading(root);

  return {
    root,
    wheels,
    bodyMaterials: [bodyMat],
    glassMaterials: [glassMat],
    lightMaterials: [lightMat, tailMat],
    updateConfig(cfg: CarConfigState) {
      applyPaintStyle(bodyMat, cfg.paintColor, cfg.paintFinish);
      rimMat.color.set(cfg.wheels.rimColor);
      glassMat.opacity = cfg.windowTint;
      glassMat.needsUpdate = true;

      const lightCol = cfg.lightsOn ? new THREE.Color(cfg.haloGlowColor) : new THREE.Color(0xfff2d0);
      lightMat.color.copy(lightCol);
      lightMat.emissive.copy(cfg.lightsOn ? lightCol : new THREE.Color(0x000000));
      lightMat.emissiveIntensity = cfg.lightsOn ? 0.7 : 0.0;

      tailMat.emissiveIntensity = cfg.lightsOn ? 0.6 : 0.1;
    },
    updateAnimations(delta: number, cfg: CarConfigState) {
      if (cfg.isDriving) {
        const speed = cfg.driveSpeed * 16;
        wheels.forEach((w) => {
          w.rotation.z -= delta * speed;
        });
      }
    },
  };
}

// ---------------------------------------------------------------------
// 3. EXECUTIVE CONTOUR SEDAN (Beveled Edge Profile)
// ---------------------------------------------------------------------
export function buildSedanExecutiveModel(config: CarConfigState): InteractiveModelInstance {
  const root = new THREE.Group();
  root.name = 'SedanExecutive_Root';

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: config.paintColor,
    metalness: 0.6,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  applyPaintStyle(bodyMat, config.paintColor, config.paintFinish);

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x0c0d0f,
    metalness: 0.8,
    roughness: 0.4,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0c1420,
    metalness: 0.2,
    roughness: 0.08,
    transmission: 0.4,
    transparent: true,
    opacity: config.windowTint,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xc9cdd3,
    metalness: 1,
    roughness: 0.15,
  });

  const lightMat = new THREE.MeshStandardMaterial({
    color: config.lightsOn ? new THREE.Color(config.haloGlowColor) : new THREE.Color(0xfff2d0),
    emissive: config.lightsOn ? new THREE.Color(config.haloGlowColor) : new THREE.Color(0x000000),
    emissiveIntensity: config.lightsOn ? 0.65 : 0.1,
    roughness: 0.3,
  });

  const tailMat = new THREE.MeshStandardMaterial({
    color: 0x9e1a1a,
    emissive: config.lightsOn ? 0x9e1a1a : 0x2e0505,
    emissiveIntensity: config.lightsOn ? 0.55 : 0.1,
    roughness: 0.3,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.9,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: config.wheels.rimColor,
    metalness: 0.9,
    roughness: 0.25,
  });

  const CAR_WIDTH = 1.9;
  const HALF_W = CAR_WIDTH / 2;

  const P: Record<string, [number, number]> = {
    frontBumperBottom: [2.3, 0.42],
    frontBumperTop: [2.3, 0.68],
    hoodFront: [2.05, 0.8],
    hoodMid: [1.65, 0.86],
    windshieldBase: [1.2, 0.92],
    windshieldTop: [0.75, 1.34],
    roofFront: [0.35, 1.4],
    roofRear: [-0.3, 1.4],
    rearWindowTop: [-0.75, 1.32],
    rearWindowBase: [-1.15, 1.05],
    trunk: [-1.65, 0.88],
    rearBumperTop: [-2.3, 0.68],
    rearBumperBottom: [-2.3, 0.42],
  };

  const shape = new THREE.Shape();
  shape.moveTo(...P.frontBumperBottom);
  shape.lineTo(...P.frontBumperTop);
  shape.lineTo(...P.hoodFront);
  shape.lineTo(...P.hoodMid);
  shape.lineTo(...P.windshieldBase);
  shape.lineTo(...P.windshieldTop);
  shape.lineTo(...P.roofFront);
  shape.lineTo(...P.roofRear);
  shape.lineTo(...P.rearWindowTop);
  shape.lineTo(...P.rearWindowBase);
  shape.lineTo(...P.trunk);
  shape.lineTo(...P.rearBumperTop);
  shape.lineTo(...P.rearBumperBottom);
  shape.lineTo(-1.85, 0.42);
  shape.quadraticCurveTo(-1.5, 0.8, -1.15, 0.42);
  shape.lineTo(1.15, 0.42);
  shape.quadraticCurveTo(1.5, 0.8, 1.85, 0.42);
  shape.lineTo(...P.frontBumperBottom);

  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: CAR_WIDTH,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3,
    curveSegments: 8,
  });
  bodyGeo.translate(0, 0, -HALF_W);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  root.add(bodyMesh);

  // Helper panel between two 2D profile coordinates
  function panelBetween(
    p1: [number, number],
    p2: [number, number],
    zCenter: number,
    depth: number,
    thickness: number,
    material: THREE.Material,
    padding: number = 0
  ): THREE.Mesh {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const length = Math.sqrt(dx * dx + dy * dy) + padding;
    const angle = Math.atan2(dy, dx);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, thickness, depth), material);
    mesh.position.set((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, zCenter);
    mesh.rotation.z = angle;
    return mesh;
  }

  // Glass panels
  const GLASS_Z = HALF_W - 0.02;
  [GLASS_Z, -GLASS_Z].forEach((z) => {
    root.add(panelBetween(P.windshieldBase, P.windshieldTop, z, 0.03, 0.05, glassMat, 0.06));
    root.add(panelBetween(P.rearWindowTop, P.rearWindowBase, z, 0.03, 0.05, glassMat, 0.06));
    const sideWindow = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.34, 0.03), glassMat);
    sideWindow.position.set(0.0, 1.16, z);
    root.add(sideWindow);
  });

  // Beltline trim
  [HALF_W - 0.005, -(HALF_W - 0.005)].forEach((z) => {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.03, 0.02), chromeMat);
    trim.position.set(-0.15, 0.98, z);
    root.add(trim);
  });

  // Front grille with horizontal slats
  const frontGrille = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.9), trimMat);
  frontGrille.position.set(2.32, 0.63, 0);
  root.add(frontGrille);
  for (let i = -2; i <= 2; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.86), chromeMat);
    slat.position.set(2.34, 0.53 + i * 0.045, 0);
    root.add(slat);
  }

  // Headlights
  [0.5, -0.5].forEach((z) => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.13, 0.3), lightMat);
    hl.position.set(2.32, 0.72, z);
    root.add(hl);
  });

  // Rear taillights & license plate
  [0.58, -0.58].forEach((z) => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.36), tailMat);
    tl.position.set(-2.32, 0.72, z);
    root.add(tl);
  });
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.14, 0.34),
    new THREE.MeshStandardMaterial({ color: 0xdedede, roughness: 0.6 })
  );
  plate.position.set(-2.33, 0.55, 0);
  root.add(plate);

  // Side mirrors
  [HALF_W + 0.03, -(HALF_W + 0.03)].forEach((z) => {
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.12), bodyMat);
    mirror.position.set(1.05, 1.02, z);
    root.add(mirror);
  });

  // Door handles
  [0.35, -0.65].forEach((x) => {
    [HALF_W + 0.005, -(HALF_W + 0.005)].forEach((z) => {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.025), chromeMat);
      handle.position.set(x, 0.85, z);
      root.add(handle);
    });
  });

  // Rocker sill
  [HALF_W - 0.01, -(HALF_W - 0.01)].forEach((z) => {
    const sill = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.06, 0.02), trimMat);
    sill.position.set(-0.15, 0.44, z);
    root.add(sill);
  });

  // 4 Wheels
  function makeExecutiveWheel(): THREE.Group {
    const group = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.115, 24, 48), tireMat);
    tire.rotation.y = Math.PI / 2;
    tire.castShadow = true;
    group.add(tire);

    const rimMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.2, 36), rimMat);
    rimMesh.rotation.z = Math.PI / 2;
    group.add(rimMesh);

    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.38, 0.035), rimMat);
      spoke.rotation.x = (i / 5) * Math.PI * 2;
      group.add(spoke);
    }

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.22, 24), trimMat);
    hub.rotation.z = Math.PI / 2;
    group.add(hub);

    return group;
  }

  const WHEEL_Z = HALF_W - 0.13;
  const wheelPositions: [number, number, number][] = [
    [1.5, 0.34, WHEEL_Z],
    [1.5, 0.34, -WHEEL_Z],
    [-1.5, 0.34, WHEEL_Z],
    [-1.5, 0.34, -WHEEL_Z],
  ];
  const wheels = wheelPositions.map((p) => {
    const w = makeExecutiveWheel();
    w.position.set(...p);
    root.add(w);
    return w;
  });

  applySmoothNormalsAndShading(root);

  return {
    root,
    wheels,
    bodyMaterials: [bodyMat],
    glassMaterials: [glassMat],
    lightMaterials: [lightMat, tailMat],
    updateConfig(cfg: CarConfigState) {
      applyPaintStyle(bodyMat, cfg.paintColor, cfg.paintFinish);
      rimMat.color.set(cfg.wheels.rimColor);
      glassMat.opacity = cfg.windowTint;
      glassMat.needsUpdate = true;

      const lightCol = cfg.lightsOn ? new THREE.Color(cfg.haloGlowColor) : new THREE.Color(0xfff2d0);
      lightMat.color.copy(lightCol);
      lightMat.emissive.copy(cfg.lightsOn ? lightCol : new THREE.Color(0x000000));
      lightMat.emissiveIntensity = cfg.lightsOn ? 0.7 : 0.0;

      tailMat.emissiveIntensity = cfg.lightsOn ? 0.6 : 0.1;
    },
    updateAnimations(delta: number, cfg: CarConfigState) {
      if (cfg.isDriving) {
        const speed = cfg.driveSpeed * 16;
        wheels.forEach((w) => {
          w.rotation.z -= delta * speed;
        });
      }
    },
  };
}
