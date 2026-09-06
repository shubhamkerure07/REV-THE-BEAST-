import { CarModelType, GearPosition } from '../types';

export interface VehiclePhysicsProfile {
  name: string;
  curbWeightKg: number;
  dragCoefficient: number; // Cd
  frontalAreaM2: number; // A in m^2
  rollingResistanceCoeff: number; // Crr (~0.015)
  driveType: 'RWD' | 'AWD' | 'FWD';
  tireWidthMm: number;
  tireAspectRatio: number;
  rimDiameterInches: number;
  rollingCircumferenceM: number; // meters per wheel revolution
  finalDriveRatio: number;
  gearRatios: Record<number, number>; // 1st to 8th
  redlineRpm: number;
  idleRpm: number;
  maxPowerHp: number;
  maxTorqueNm: number;
  officialTopSpeedKmh: number;
}

// Calculate rolling circumference from tire specification:
// diameter = (rimDiameter * 25.4) + 2 * (tireWidth * aspectRatio / 100) in mm
// circumference = pi * diameter / 1000 in meters
export function calculateTireCircumference(widthMm: number, aspect: number, rimInches: number): number {
  const diameterMm = rimInches * 25.4 + 2 * (widthMm * (aspect / 100));
  return (Math.PI * diameterMm) / 1000;
}

export const VEHICLE_PHYSICS_PROFILES: Record<CarModelType, VehiclePhysicsProfile> = {
  'procedural-m4': {
    name: 'BMW M4 Competition Coupé (G82)',
    curbWeightKg: 1725,
    dragCoefficient: 0.34,
    frontalAreaM2: 2.25,
    rollingResistanceCoeff: 0.014,
    driveType: 'RWD',
    tireWidthMm: 285,
    tireAspectRatio: 30,
    rimDiameterInches: 20,
    rollingCircumferenceM: calculateTireCircumference(285, 30, 20), // ~2.08m
    finalDriveRatio: 3.15,
    // ZF 8-speed M Steptronic
    gearRatios: {
      1: 5.00,
      2: 3.20,
      3: 2.14,
      4: 1.72,
      5: 1.31,
      6: 1.00,
      7: 0.82,
      8: 0.64,
    },
    redlineRpm: 7200,
    idleRpm: 800,
    maxPowerHp: 503,
    maxTorqueNm: 650,
    officialTopSpeedKmh: 290,
  },

  'ferrari-sf90': {
    name: 'Ferrari SF90 Stradale',
    curbWeightKg: 1570,
    dragCoefficient: 0.34,
    frontalAreaM2: 2.10,
    rollingResistanceCoeff: 0.013,
    driveType: 'AWD',
    tireWidthMm: 315,
    tireAspectRatio: 30,
    rimDiameterInches: 20,
    rollingCircumferenceM: calculateTireCircumference(315, 30, 20), // ~2.13m
    finalDriveRatio: 3.65,
    // Ferrari 8-speed F1 Dual Clutch
    gearRatios: {
      1: 3.40,
      2: 2.19,
      3: 1.63,
      4: 1.28,
      5: 1.05,
      6: 0.84,
      7: 0.68,
      8: 0.54,
    },
    redlineRpm: 8000,
    idleRpm: 950,
    maxPowerHp: 986,
    maxTorqueNm: 800,
    officialTopSpeedKmh: 340,
  },

  'bugatti-chiron': {
    name: 'Bugatti Chiron Super Sport',
    curbWeightKg: 1995,
    dragCoefficient: 0.36,
    frontalAreaM2: 2.22,
    rollingResistanceCoeff: 0.014,
    driveType: 'AWD',
    tireWidthMm: 355,
    tireAspectRatio: 25,
    rimDiameterInches: 21,
    rollingCircumferenceM: calculateTireCircumference(355, 25, 21), // ~2.18m
    finalDriveRatio: 2.80,
    // Ricardo 7-speed Dual Clutch
    gearRatios: {
      1: 3.16,
      2: 2.06,
      3: 1.48,
      4: 1.13,
      5: 0.89,
      6: 0.72,
      7: 0.58,
    },
    redlineRpm: 7100,
    idleRpm: 900,
    maxPowerHp: 1578,
    maxTorqueNm: 1600,
    officialTopSpeedKmh: 440,
  },

  'mustang-gt': {
    name: 'Ford Mustang GT Fastback 5.0',
    curbWeightKg: 1732,
    dragCoefficient: 0.35,
    frontalAreaM2: 2.28,
    rollingResistanceCoeff: 0.015,
    driveType: 'RWD',
    tireWidthMm: 275,
    tireAspectRatio: 40,
    rimDiameterInches: 19,
    rollingCircumferenceM: calculateTireCircumference(275, 40, 19), // ~2.16m
    finalDriveRatio: 3.73,
    // 10-Speed SelectShift Automatic
    gearRatios: {
      1: 4.70,
      2: 2.99,
      3: 2.15,
      4: 1.77,
      5: 1.52,
      6: 1.28,
      7: 1.00,
      8: 0.85,
    },
    redlineRpm: 7500,
    idleRpm: 750,
    maxPowerHp: 480,
    maxTorqueNm: 563,
    officialTopSpeedKmh: 250,
  },

  'gwagon-g63': {
    name: 'Mercedes-AMG G63',
    curbWeightKg: 2560,
    dragCoefficient: 0.53,
    frontalAreaM2: 3.20,
    rollingResistanceCoeff: 0.018,
    driveType: 'AWD',
    tireWidthMm: 295,
    tireAspectRatio: 40,
    rimDiameterInches: 22,
    rollingCircumferenceM: calculateTireCircumference(295, 40, 22), // ~2.32m
    finalDriveRatio: 3.27,
    // AMG SPEEDSHIFT TCT 9G
    gearRatios: {
      1: 5.35,
      2: 3.24,
      3: 2.25,
      4: 1.64,
      5: 1.21,
      6: 1.00,
      7: 0.86,
      8: 0.72,
    },
    redlineRpm: 6500,
    idleRpm: 700,
    maxPowerHp: 577,
    maxTorqueNm: 850,
    officialTopSpeedKmh: 240,
  },

  'ninja-h2r': {
    name: 'Kawasaki Ninja H2R Superbike',
    curbWeightKg: 216,
    dragCoefficient: 0.42,
    frontalAreaM2: 0.65,
    rollingResistanceCoeff: 0.012,
    driveType: 'RWD',
    tireWidthMm: 200,
    tireAspectRatio: 55,
    rimDiameterInches: 17,
    rollingCircumferenceM: calculateTireCircumference(200, 55, 17), // ~2.00m
    finalDriveRatio: 2.389, // Sprockets 18T / 43T
    // Dog-Ring 6-speed
    gearRatios: {
      1: 3.188,
      2: 2.526,
      3: 2.045,
      4: 1.727,
      5: 1.524,
      6: 1.348,
    },
    redlineRpm: 14000,
    idleRpm: 1200,
    maxPowerHp: 310,
    maxTorqueNm: 165,
    officialTopSpeedKmh: 400,
  },

  're-gt650': {
    name: 'Royal Enfield Continental GT 650',
    curbWeightKg: 212,
    dragCoefficient: 0.56,
    frontalAreaM2: 0.82,
    rollingResistanceCoeff: 0.015,
    driveType: 'RWD',
    tireWidthMm: 130,
    tireAspectRatio: 70,
    rimDiameterInches: 18,
    rollingCircumferenceM: calculateTireCircumference(130, 70, 18), // ~1.98m
    finalDriveRatio: 2.667, // Sprockets 15T / 40T
    // 6-Speed Constant Mesh
    gearRatios: {
      1: 2.615,
      2: 1.813,
      3: 1.333,
      4: 1.040,
      5: 0.885,
      6: 0.778,
    },
    redlineRpm: 7500,
    idleRpm: 1100,
    maxPowerHp: 47,
    maxTorqueNm: 52,
    officialTopSpeedKmh: 170,
  },

  're-shotgun650': {
    name: 'Royal Enfield Shotgun 650 Bobber',
    curbWeightKg: 240,
    dragCoefficient: 0.60,
    frontalAreaM2: 0.86,
    rollingResistanceCoeff: 0.016,
    driveType: 'RWD',
    tireWidthMm: 150,
    tireAspectRatio: 70,
    rimDiameterInches: 16,
    rollingCircumferenceM: calculateTireCircumference(150, 70, 16), // ~1.94m
    finalDriveRatio: 2.667,
    // 6-Speed Constant Mesh
    gearRatios: {
      1: 2.615,
      2: 1.813,
      3: 1.333,
      4: 1.040,
      5: 0.885,
      6: 0.778,
    },
    redlineRpm: 7500,
    idleRpm: 1100,
    maxPowerHp: 47,
    maxTorqueNm: 52,
    officialTopSpeedKmh: 170,
  },

  'bmw-5series': {
    name: 'BMW 5 Series Sedan (G60)',
    curbWeightKg: 1800,
    dragCoefficient: 0.23,
    frontalAreaM2: 2.35,
    rollingResistanceCoeff: 0.014,
    driveType: 'AWD',
    tireWidthMm: 275,
    tireAspectRatio: 35,
    rimDiameterInches: 20,
    rollingCircumferenceM: calculateTireCircumference(275, 35, 20), // ~2.11m
    finalDriveRatio: 2.93,
    // Steptronic 8-speed
    gearRatios: {
      1: 5.25,
      2: 3.36,
      3: 2.17,
      4: 1.72,
      5: 1.32,
      6: 1.00,
      7: 0.82,
      8: 0.64,
    },
    redlineRpm: 6800,
    idleRpm: 750,
    maxPowerHp: 382,
    maxTorqueNm: 500,
    officialTopSpeedKmh: 250,
  },
};

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

/**
 * Real-life mechanical calculation of vehicle velocity:
 *
 * v (km/h) = [Engine RPM * Tire Circumference (m) * 60] / [Gear Ratio * Final Drive Ratio * 1000]
 *
 * In Park ('P') or Neutral ('N'), the engine is physically disconnected from the driveline.
 * In Gear, the speed is locked to the physical powertrain ratio (with simulated tire slip and inertia).
 */
export function calculateRealVehicleSpeed(
  modelType: CarModelType,
  currentRpm: number,
  currentGear: GearPosition,
  isDriving: boolean,
  previousSpeedKmh: number = 0,
  deltaTimeSec: number = 0.016
): RealSpeedCalculation {
  const profile = VEHICLE_PHYSICS_PROFILES[modelType] || VEHICLE_PHYSICS_PROFILES['procedural-m4'];

  // Handle neutral or park decoupling
  if (currentGear === 'N' || currentGear === 'P' || !isDriving) {
    // When decoupled, speed decays naturally via aero drag & rolling resistance
    const airDensity = 1.225; // kg/m^3
    const vMps = (previousSpeedKmh * 1000) / 3600;
    const dragForce = 0.5 * airDensity * profile.dragCoefficient * profile.frontalAreaM2 * (vMps * vMps);
    const rollingResistance = profile.rollingResistanceCoeff * profile.curbWeightKg * 9.81;
    const totalDecelForce = dragForce + rollingResistance;
    const decelMps2 = totalDecelForce / profile.curbWeightKg;

    const newSpeedMps = Math.max(0, vMps - decelMps2 * deltaTimeSec * 2.5);
    const speedKmh = Math.round((newSpeedMps * 3600) / 1000);

    return {
      speedKmh,
      speedMph: Math.round(speedKmh * 0.621371),
      wheelRpm: 0,
      currentGearRatio: 0,
      finalDriveRatio: profile.finalDriveRatio,
      maxSpeedInCurrentGearKmh: 0,
      dragForceNewtons: Math.round(dragForce),
      gForceLongitudinal: 0,
      isGearDecoupled: true,
    };
  }

  // Gear is a numeric gear (1 to 8)
  const gearNum = typeof currentGear === 'number' ? currentGear : 1;
  const gearRatio = profile.gearRatios[gearNum] || profile.gearRatios[1] || 3.5;
  const totalRatio = gearRatio * profile.finalDriveRatio;

  // Maximum theoretical speed in this gear at redline:
  const maxSpeedAtRedline =
    (profile.redlineRpm * profile.rollingCircumferenceM * 0.06) / totalRatio;
  const maxSpeedInCurrentGearKmh = Math.min(profile.officialTopSpeedKmh, Math.round(maxSpeedAtRedline));

  // Current theoretical mechanical speed from current RPM:
  const theoreticalSpeedKmh =
    (Math.max(0, currentRpm) * profile.rollingCircumferenceM * 0.06) / totalRatio;

  // Apply real-life aerodynamic drag ceiling:
  // F_drag = 0.5 * rho * Cd * A * v^2
  const cappedSpeed = Math.min(maxSpeedInCurrentGearKmh, theoreticalSpeedKmh);

  // Smooth realistic inertia filter (simulates tire grip and vehicle mass inertia)
  const inertiaFactor = Math.min(1.0, (1500 / profile.curbWeightKg) * 0.12);
  const targetSpeedKmh = Math.min(profile.officialTopSpeedKmh, cappedSpeed);
  const smoothedSpeedKmh = previousSpeedKmh + (targetSpeedKmh - previousSpeedKmh) * inertiaFactor;
  const finalSpeedKmh = Math.max(0, Math.round(smoothedSpeedKmh));

  // Wheel RPM
  const wheelRpm = Math.round(currentRpm / totalRatio);

  // Aerodynamic drag force at this speed:
  const vMps = (finalSpeedKmh * 1000) / 3600;
  const dragForce = Math.round(
    0.5 * 1.225 * profile.dragCoefficient * profile.frontalAreaM2 * (vMps * vMps)
  );

  // Approximate longitudinal G-force:
  const speedDeltaMps = ((finalSpeedKmh - previousSpeedKmh) * 1000) / 3600;
  const accelMps2 = speedDeltaMps / Math.max(0.001, deltaTimeSec);
  const gForce = Math.round((accelMps2 / 9.81) * 100) / 100;

  return {
    speedKmh: finalSpeedKmh,
    speedMph: Math.round(finalSpeedKmh * 0.621371),
    wheelRpm,
    currentGearRatio: gearRatio,
    finalDriveRatio: profile.finalDriveRatio,
    maxSpeedInCurrentGearKmh,
    dragForceNewtons: dragForce,
    gForceLongitudinal: Math.max(-1.2, Math.min(1.8, gForce)),
    isGearDecoupled: false,
  };
}
