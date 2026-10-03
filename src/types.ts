export type PaintFinish = 'gloss' | 'metallic' | 'matte' | 'frozen';

export interface CarColor {
  id: string;
  name: string;
  hex: string;
  metalness: number;
  roughness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
}

export interface WheelConfig {
  rimColor: string;
  rimStyle: 'double-spoke' | 'star-spoke' | 'multi-spoke';
  caliperColor: string;
  tireType: 'michelin-pilot' | 'track-slick';
}

export interface AeroConfig {
  carbonPackage: boolean;
  spoilerStyle: 'lip' | 'gt-wing' | 'none';
  frontSplitter: boolean;
  rearDiffuserFins: boolean;
}

export type ExhaustStyle = 'quad' | 'dual' | 'center' | 'side';
export type ExhaustMaterial = 'chrome' | 'titanium' | 'carbon' | 'racing';

export interface ExhaustConfig {
  style: ExhaustStyle;
  material: ExhaustMaterial;
}

export interface OpenableParts {
  leftDoor: boolean;
  rightDoor: boolean;
  hood: boolean;
  trunk: boolean;
}

export type StudioEnvironment =
  | 'city'
  | 'race-track'
  | 'tokyo-highway'
  | 'monaco-tunnel'
  | 'nurburgring-dusk'
  | 'hypercar-vault'
  | 'dubai-skyline'
  | 'dark-studio'
  | 'neon-city'
  | 'showroom'
  | 'sunset';

export type CameraPreset =
  | 'hero'
  | 'front'
  | 'side'
  | 'rear'
  | 'top'
  | 'interior'
  | 'engine'
  | 'wheel'
  | 'exhaust'
  | 'detail';

export type CarModelType =
  | 'lambo-aventador'
  | 'procedural-m4'
  | 'ferrari-sf90'
  | 'bugatti-chiron'
  | 're-gt650'
  | 're-shotgun650'
  | 'mustang-gt'
  | 'gwagon-g63'
  | 'ninja-h2r'
  | 'bmw-5series'
  | 'beast-ev'
  | 'beast-v12-ai';

export type EngineSoundProfile =
  | 's58-inline6'
  | 'coyote-v8'
  | 'amg-v8'
  | 'supercharged-i4'
  | 'ferrari-v8'
  | 'bugatti-w16'
  | 'parallel-twin-270'
  | 'custom-bobber-twin'
  | 'v10-exotic'
  | 'v12-symphony'
  | 'electric-motor';

export type ExhaustValveMode = 'quiet' | 'sport' | 'track';

export type TransmissionMode = 'manual' | 'auto';

export type GearPosition = 'P' | 'R' | 'N' | 'D' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type TurboBovStyle = 'wrc-flutter' | 'hks-ssqv' | 'greddy-surge' | 'tial-vent';

export type ViewModeType = 'photos' | 'video' | 'engine-3d' | '3d-car';

export interface EngineSpec {
  id: string;
  name: string;
  code: string;
  type: string;
  displacement: string;
  cylinders: string;
  aspiration:
    | 'Twin-Turbo'
    | 'Naturally Aspirated'
    | 'Biturbo Hot-Inside-V'
    | 'Supercharged'
    | 'Twin-Scroll Turbo'
    | 'Quad-Turbo'
    | 'Naturally Aspirated Parallel Twin'
    | 'Naturally Aspirated V10'
    | 'Naturally Aspirated V12'
    | 'Quad-Motor Electric Drive';
  powerHp: number;
  powerKw: number;
  torqueNm: number;
  torqueLbFt: number;
  redlineRpm: number;
  idleRpm: number;
  maxBoostPsi?: number;
  compressionRatio: string;
  soundProfile: EngineSoundProfile;
  soundDescription: string;
  firingOrder: string;
  vehicleModel: CarModelType;
}

export interface CarConfigState {
  modelType: CarModelType;
  engineProfile?: EngineSoundProfile;
  paintColor: string;
  paintName: string;
  paintFinish: PaintFinish;
  carbonFiberRoof: boolean;
  windowTint: number; // 0.1 to 0.9 opacity
  lightsOn: boolean;
  haloGlowColor: string;
  wheels: WheelConfig;
  aero: AeroConfig;
  exhaustConfig?: ExhaustConfig;
  openParts: OpenableParts;
  environment: StudioEnvironment;
  cameraPreset: CameraPreset;
  autoRotate: boolean;
  rotateSpeed: number;
  isDriving: boolean;
  driveSpeed: number;
  exhaustSound: boolean;
  ambienceSound?: boolean;
  ambienceVolume?: number;
  viewMode?: ViewModeType;
  valveMode?: ExhaustValveMode;
  transmissionMode?: TransmissionMode;
  turboBovStyle?: TurboBovStyle;
  gearPosition?: GearPosition;
}

export interface CarSpecification {
  model: string;
  generation: string;
  engine: string;
  power: string;
  torque: string;
  acceleration: string;
  topSpeed: string;
  transmission: string;
  weight: string;
  drivetrain: string;
  length: string;
  width: string;
  height: string;
  wheelbase: string;
}

export interface RealSpeedCalculation {
  speedKmh: number;
  speedMph: number;
  wheelRpm: number;
  currentGearRatio: number;
  finalDriveRatio: number;
  maxSpeedInCurrentGearKmh: number;
  dragForceNewtons: number;
  gForceLongitudinal: number;
  isGearDecoupled: boolean;
}
