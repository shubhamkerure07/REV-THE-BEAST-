import { EngineSpec } from '../types';

export interface DynoDataPoint {
  rpm: number;
  hp: number;
  torque: number; // in Nm
  torqueLbFt: number;
}

export interface LivePowerOutput {
  rpm: number;
  hp: number;
  torqueNm: number;
  torqueLbFt: number;
  hpPercent: number;
  torquePercent: number;
}

/**
 * Calculates realistic instantaneous Horsepower and Torque for an engine at a given RPM.
 */
export function calculateLivePower(engine: EngineSpec, rpm: number): LivePowerOutput {
  const idle = engine.idleRpm;
  const redline = engine.redlineRpm;
  const clampedRpm = Math.max(idle, Math.min(redline, rpm));
  const norm = (clampedRpm - idle) / (redline - idle); // 0.0 to 1.0

  let torqueFactor = 0;

  switch (engine.aspiration) {
    case 'Twin-Turbo':
    case 'Biturbo Hot-Inside-V':
    case 'Twin-Scroll Turbo':
    case 'Quad-Turbo': {
      // Rapid turbo spool to flat plateau, then taper near redline
      if (norm < 0.2) {
        torqueFactor = 0.45 + (norm / 0.2) * 0.5; // Spool up from 45% to 95%
      } else if (norm < 0.75) {
        torqueFactor = 0.95 + Math.sin(((norm - 0.2) / 0.55) * Math.PI) * 0.05; // Peak plateau 100%
      } else {
        const dropNorm = (norm - 0.75) / 0.25;
        torqueFactor = 1.0 - dropNorm * 0.22; // Gentle taper down to ~78% at redline
      }
      break;
    }

    case 'Supercharged': {
      // Centrifugal supercharger builds boost with RPM (progressive)
      if (norm < 0.3) {
        torqueFactor = 0.5 + norm * 0.5;
      } else {
        torqueFactor = 0.65 + Math.sin(norm * (Math.PI / 2)) * 0.35;
      }
      break;
    }

    case 'Naturally Aspirated':
    case 'Naturally Aspirated Parallel Twin':
    default: {
      // Classic NA curve with torque peak at ~60-65% RPM
      const peakNorm = 0.62;
      const distFromPeak = Math.abs(norm - peakNorm);
      torqueFactor = Math.max(0.45, 1.0 - Math.pow(distFromPeak * 1.35, 1.6) * 0.45);
      break;
    }
  }

  const currentTorqueNm = Math.round(engine.torqueNm * Math.max(0.1, torqueFactor));
  const currentTorqueLbFt = Math.round(currentTorqueNm * 0.73756);

  // HP derived from Torque and RPM: HP = (Torque_lbft * RPM) / 5252
  // We scale to align with the manufacturer stated peak HP
  const theoreticalHp = (currentTorqueLbFt * clampedRpm) / 5252;
  const theoreticalPeakHp = (engine.torqueLbFt * (redline * 0.88)) / 5252;
  const hpScale = theoreticalPeakHp > 0 ? engine.powerHp / theoreticalPeakHp : 1;
  const currentHp = Math.round(Math.min(engine.powerHp * 1.02, theoreticalHp * hpScale));

  return {
    rpm: clampedRpm,
    hp: Math.max(0, currentHp),
    torqueNm: currentTorqueNm,
    torqueLbFt: currentTorqueLbFt,
    hpPercent: Math.min(100, Math.round((currentHp / engine.powerHp) * 100)),
    torquePercent: Math.min(100, Math.round((currentTorqueNm / engine.torqueNm) * 100)),
  };
}

/**
 * Generates an array of Dyno points across the engine's RPM spectrum
 */
export function generateDynoCurve(engine: EngineSpec, steps = 24): DynoDataPoint[] {
  const points: DynoDataPoint[] = [];
  const minRpm = Math.floor(engine.idleRpm / 100) * 100;
  const maxRpm = engine.redlineRpm;
  const stepSize = Math.round((maxRpm - minRpm) / (steps - 1));

  for (let i = 0; i < steps; i++) {
    const currentRpm = i === steps - 1 ? maxRpm : minRpm + i * stepSize;
    const { hp, torqueNm, torqueLbFt } = calculateLivePower(engine, currentRpm);
    points.push({
      rpm: currentRpm,
      hp,
      torque: torqueNm,
      torqueLbFt,
    });
  }

  return points;
}
