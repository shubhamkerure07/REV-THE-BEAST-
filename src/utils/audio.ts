/**
 * High-Performance Web Audio Synthesizer for Authentic Vehicle Rev Acoustics:
 * - BMW S58 TwinPower Turbo Inline-6 (7,200 RPM, metallic rasp, turbo spool whistle, overrun crackles)
 * - Ford 5.0L Coyote V8 (7,500 RPM, cross-plane muscle lope, aggressive bark)
 * - Mercedes-AMG M177 Biturbo V8 (6,800 RPM, deep guttural bass, side-pipe backfires)
 * - Kawasaki Ninja H2R Supercharged I4 (14,000 RPM hyper-screamer, planetary supercharger gear whine, blow-off valve flutter)
 *
 * Supported Rev & Engine Modes:
 * - Hold to Rev (smooth instantaneous throttle response)
 * - Launch Control 2-Step Rev Limiter (bounces against limiter with rapid pops)
 * - Cold Start Ignition Sequence (cranking starter -> high idle flare -> smooth rumble)
 * - Dyno Pull Acceleration Run (gears 1-4 with crisp shift cuts)
 * - Downshift Throttle Blip
 * - Active Exhaust Valve Modes: Quiet, Sport, Track / Straight Pipe
 */

import { EngineSoundProfile, ExhaustValveMode, TransmissionMode, GearPosition, TurboBovStyle } from '../types';

export interface ProfileConfig {
  name: string;
  idleRpm: number;
  redlineRpm: number;
  cylinders: number;
  baseOrder: number;
  subHarmonic: number;
  hasForcedInduction: boolean;
  forcedInductionType: 'turbo' | 'supercharger' | 'none';
  forcedInductionPitch: number;
  filterBase: number;
  filterTop: number;
  filterQ: number;
  gainBoost: number;
}

const PROFILES: Record<EngineSoundProfile, ProfileConfig> = {
  's58-inline6': {
    name: 'BMW S58 TwinPower Turbo I6',
    idleRpm: 800,
    redlineRpm: 7200,
    cylinders: 6,
    baseOrder: 3.0,
    subHarmonic: 1.5,
    hasForcedInduction: true,
    forcedInductionType: 'turbo',
    forcedInductionPitch: 0.38,
    filterBase: 360,
    filterTop: 2200,
    filterQ: 2.2,
    gainBoost: 0.35,
  },
  'coyote-v8': {
    name: 'Ford 5.0L Coyote V8',
    idleRpm: 680,
    redlineRpm: 7500,
    cylinders: 8,
    baseOrder: 4.0,
    subHarmonic: 1.0,
    hasForcedInduction: false,
    forcedInductionType: 'none',
    forcedInductionPitch: 0,
    filterBase: 280,
    filterTop: 2400,
    filterQ: 3.2,
    gainBoost: 0.40,
  },
  'amg-v8': {
    name: 'Mercedes-AMG M177 Biturbo V8',
    idleRpm: 700,
    redlineRpm: 6800,
    cylinders: 8,
    baseOrder: 4.0,
    subHarmonic: 0.8,
    hasForcedInduction: true,
    forcedInductionType: 'turbo',
    forcedInductionPitch: 0.32,
    filterBase: 240,
    filterTop: 1800,
    filterQ: 3.6,
    gainBoost: 0.42,
  },
  'supercharged-i4': {
    name: 'Kawasaki Ninja H2R Supercharged I4',
    idleRpm: 1200,
    redlineRpm: 14000,
    cylinders: 4,
    baseOrder: 2.0,
    subHarmonic: 1.0,
    hasForcedInduction: true,
    forcedInductionType: 'supercharger',
    forcedInductionPitch: 0.44,
    filterBase: 520,
    filterTop: 4500,
    filterQ: 1.8,
    gainBoost: 0.36,
  },
  'ferrari-v8': {
    name: 'Ferrari 3.9L Twin-Turbo Flat-Plane V8',
    idleRpm: 950,
    redlineRpm: 8000,
    cylinders: 8,
    baseOrder: 4.0,
    subHarmonic: 2.0,
    hasForcedInduction: true,
    forcedInductionType: 'turbo',
    forcedInductionPitch: 0.46,
    filterBase: 440,
    filterTop: 3600,
    filterQ: 2.8,
    gainBoost: 0.42,
  },
  'bugatti-w16': {
    name: 'Bugatti 8.0L Quad-Turbo W16',
    idleRpm: 700,
    redlineRpm: 7100,
    cylinders: 16,
    baseOrder: 8.0,
    subHarmonic: 2.0,
    hasForcedInduction: true,
    forcedInductionType: 'turbo',
    forcedInductionPitch: 0.52,
    filterBase: 240,
    filterTop: 2600,
    filterQ: 3.5,
    gainBoost: 0.48,
  },
  'parallel-twin-270': {
    name: 'Royal Enfield 648cc Parallel Twin 270°',
    idleRpm: 1200,
    redlineRpm: 7500,
    cylinders: 2,
    baseOrder: 1.0,
    subHarmonic: 0.5,
    hasForcedInduction: false,
    forcedInductionType: 'none',
    forcedInductionPitch: 0,
    filterBase: 380,
    filterTop: 2400,
    filterQ: 2.2,
    gainBoost: 0.38,
  },
  'custom-bobber-twin': {
    name: 'Royal Enfield Shotgun 650 Custom Bobber',
    idleRpm: 1150,
    redlineRpm: 7500,
    cylinders: 2,
    baseOrder: 1.0,
    subHarmonic: 0.5,
    hasForcedInduction: false,
    forcedInductionType: 'none',
    forcedInductionPitch: 0,
    filterBase: 300,
    filterTop: 2000,
    filterQ: 3.0,
    gainBoost: 0.42,
  },
};

class EngineSoundEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private profile: EngineSoundProfile = 's58-inline6';
  private valveMode: ExhaustValveMode = 'sport';

  private idleOsc1: OscillatorNode | null = null;
  private idleOsc2: OscillatorNode | null = null;
  private idleOsc3: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private inductionOsc: OscillatorNode | null = null;
  private inductionGain: GainNode | null = null;
  private mainGain: GainNode | null = null;
  private valveGain: GainNode | null = null;
  private lowpass: BiquadFilterNode | null = null;
  private bassPeak: BiquadFilterNode | null = null;
  private noiseNode: AudioNode | null = null;
  private noiseGain: GainNode | null = null;

  private currentRpm: number = 800;
  private targetRpm: number = 800;
  private animFrameId: number | null = null;

  // Transmission and Gears
  private currentGear: GearPosition = 1;
  private transmissionMode: TransmissionMode = 'manual';
  private lastShiftTime: number = 0;

  // Real-Time Turbo Sound Maker State
  private turboBovStyle: TurboBovStyle = 'wrc-flutter';
  private boostPressure: number = 0;
  private maxBoostPsi: number = 24.5;
  private throttleAmount: number = 0;
  private prevThrottle: number = 0;

  // Launch control & special modes state
  private isLaunchControl: boolean = false;
  private launchTimerId: number | null = null;
  private isDynoPull: boolean = false;
  private dynoTimerId: number | null = null;
  private onRpmUpdateCallbacks: Set<(rpm: number) => void> = new Set();
  private onGearUpdateCallbacks: Set<(gear: GearPosition) => void> = new Set();
  private onBoostUpdateCallbacks: Set<(boost: number) => void> = new Set();
  private onExhaustEventCallbacks: Set<(event: 'burble' | 'backfire' | 'pop') => void> = new Set();

  constructor() {
    // Lazy audio setup
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setProfile(profile: EngineSoundProfile) {
    this.profile = profile;
    const cfg = PROFILES[profile];
    this.currentRpm = cfg.idleRpm;
    this.targetRpm = cfg.idleRpm;

    if (this.isRunning && this.ctx) {
      this.stop();
      setTimeout(() => {
        this.start();
      }, 80);
    }
  }

  public setValveMode(mode: ExhaustValveMode) {
    this.valveMode = mode;
    if (this.valveGain && this.ctx) {
      const targetGain = mode === 'quiet' ? 0.45 : mode === 'track' ? 1.45 : 1.0;
      this.valveGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    if (this.lowpass && this.ctx) {
      const mult = mode === 'quiet' ? 0.65 : mode === 'track' ? 1.35 : 1.0;
      const cfg = PROFILES[this.profile];
      this.lowpass.frequency.setTargetAtTime(cfg.filterBase * mult, this.ctx.currentTime, 0.05);
    }
  }

  public getValveMode(): ExhaustValveMode {
    return this.valveMode;
  }

  public getProfile(): EngineSoundProfile {
    return this.profile;
  }

  public getProfileConfig(): ProfileConfig {
    return PROFILES[this.profile];
  }

  public getMaxRpm(): number {
    return PROFILES[this.profile].redlineRpm;
  }

  public getIdleRpm(): number {
    return PROFILES[this.profile].idleRpm;
  }

  public start() {
    this.initContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.isRunning) return;
    this.isRunning = true;

    const ctx = this.ctx;
    const cfg = PROFILES[this.profile];

    this.currentRpm = cfg.idleRpm;
    this.targetRpm = cfg.idleRpm;

    this.mainGain = ctx.createGain();
    this.mainGain.gain.setValueAtTime(0.01, ctx.currentTime);
    this.mainGain.gain.exponentialRampToValueAtTime(cfg.gainBoost, ctx.currentTime + 0.2);

    this.valveGain = ctx.createGain();
    const initialValveGain = this.valveMode === 'quiet' ? 0.45 : this.valveMode === 'track' ? 1.45 : 1.0;
    this.valveGain.gain.setValueAtTime(initialValveGain, ctx.currentTime);

    // Primary lowpass filter representing engine block & muffler
    this.lowpass = ctx.createBiquadFilter();
    this.lowpass.type = 'lowpass';
    const filterMult = this.valveMode === 'quiet' ? 0.65 : this.valveMode === 'track' ? 1.35 : 1.0;
    this.lowpass.frequency.setValueAtTime(cfg.filterBase * filterMult, ctx.currentTime);
    this.lowpass.Q.setValueAtTime(cfg.filterQ, ctx.currentTime);

    // Bass peaking filter for throaty muscle lope or screaming turbine
    this.bassPeak = ctx.createBiquadFilter();
    this.bassPeak.type = 'peaking';
    this.bassPeak.frequency.setValueAtTime(
      this.profile === 'coyote-v8' || this.profile === 'amg-v8' ? 62 : 110,
      ctx.currentTime
    );
    this.bassPeak.Q.setValueAtTime(1.8, ctx.currentTime);
    this.bassPeak.gain.setValueAtTime(
      this.profile === 'coyote-v8' || this.profile === 'amg-v8' ? 9.0 : 4.0,
      ctx.currentTime
    );

    // Engine cylinder firing harmonics
    this.idleOsc1 = ctx.createOscillator();
    this.idleOsc1.type = this.profile === 'coyote-v8' ? 'triangle' : 'sawtooth';
    this.idleOsc1.frequency.setValueAtTime((cfg.idleRpm / 60) * cfg.baseOrder, ctx.currentTime);

    this.idleOsc2 = ctx.createOscillator();
    this.idleOsc2.type = 'sawtooth';
    this.idleOsc2.frequency.setValueAtTime((cfg.idleRpm / 60) * cfg.baseOrder * 2, ctx.currentTime);

    this.idleOsc3 = ctx.createOscillator();
    this.idleOsc3.type = 'sine';
    this.idleOsc3.frequency.setValueAtTime((cfg.idleRpm / 60) * cfg.baseOrder * 3, ctx.currentTime);

    // Sub-harmonic for cross-plane V8 lope
    this.subOsc = ctx.createOscillator();
    this.subOsc.type = this.profile === 'coyote-v8' ? 'sawtooth' : 'sine';
    this.subOsc.frequency.setValueAtTime((cfg.idleRpm / 60) * cfg.subHarmonic, ctx.currentTime);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(
      this.profile === 'coyote-v8' || this.profile === 'amg-v8' ? 0.38 : 0.15,
      ctx.currentTime
    );
    this.subOsc.connect(subGain);
    subGain.connect(this.bassPeak);

    // Forced Induction Whine / Spool
    if (cfg.hasForcedInduction) {
      this.inductionOsc = ctx.createOscillator();
      this.inductionOsc.type = cfg.forcedInductionType === 'supercharger' ? 'sawtooth' : 'sine';
      this.inductionOsc.frequency.setValueAtTime(
        cfg.forcedInductionType === 'supercharger' ? 950 : 700,
        ctx.currentTime
      );

      this.inductionGain = ctx.createGain();
      this.inductionGain.gain.setValueAtTime(
        cfg.forcedInductionType === 'supercharger' ? 0.03 : 0.015,
        ctx.currentTime
      );
      this.inductionOsc.connect(this.inductionGain);
      this.inductionGain.connect(this.mainGain);
      this.inductionOsc.start();
    }

    // Exhaust gas turbulence noise
    try {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(this.profile === 'coyote-v8' ? 70 : 95, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1.5, ctx.currentTime);

      this.noiseGain = ctx.createGain();
      this.noiseGain.gain.setValueAtTime(0.045, ctx.currentTime);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.mainGain);
      whiteNoise.start();
      this.noiseNode = whiteNoise;
    } catch {
      // Noise buffer fallback safe
    }

    // Connect audio routing graph
    this.idleOsc1.connect(this.bassPeak);
    this.idleOsc2.connect(this.bassPeak);
    this.idleOsc3.connect(this.bassPeak);
    this.bassPeak.connect(this.lowpass);
    this.lowpass.connect(this.valveGain);
    this.valveGain.connect(this.mainGain);
    this.mainGain.connect(ctx.destination);

    this.idleOsc1.start();
    this.idleOsc2.start();
    this.idleOsc3.start();
    this.subOsc.start();

    this.startRpmLoop();
  }

  public stop() {
    this.isLaunchControl = false;
    this.isDynoPull = false;
    if (this.launchTimerId) clearInterval(this.launchTimerId);
    if (this.dynoTimerId) clearTimeout(this.dynoTimerId);

    if (!this.isRunning || !this.ctx) return;
    this.isRunning = false;

    if (this.mainGain && this.ctx) {
      try {
        this.mainGain.gain.setValueAtTime(this.mainGain.gain.value, this.ctx.currentTime);
        this.mainGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      } catch {}
    }

    setTimeout(() => {
      try {
        this.idleOsc1?.stop();
        this.idleOsc2?.stop();
        this.idleOsc3?.stop();
        this.subOsc?.stop();
        this.inductionOsc?.stop();
        if (this.noiseNode && 'stop' in this.noiseNode) {
          (this.noiseNode as AudioBufferSourceNode).stop();
        }
      } catch {}
      this.idleOsc1 = null;
      this.idleOsc2 = null;
      this.idleOsc3 = null;
      this.subOsc = null;
      this.inductionOsc = null;
      this.inductionGain = null;
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    }, 180);
  }

  /**
   * Set throttle from 0 (idle) to 1.0 (redline)
   */
  public setThrottle(amount: number) {
    this.initContext();
    if (!this.isRunning) {
      this.start();
    }
    const clamped = Math.max(0, Math.min(1, amount));
    const cfg = PROFILES[this.profile];
    this.targetRpm = cfg.idleRpm + clamped * (cfg.redlineRpm - cfg.idleRpm);

    // Realistic Turbo Blow-Off Valve release upon sudden throttle drop from high boost
    if (clamped < 0.15 && this.prevThrottle > 0.48 && this.boostPressure > 3.0 && cfg.hasForcedInduction) {
      this.triggerBlowOffValve();
    }

    this.prevThrottle = clamped;
    this.throttleAmount = clamped;
  }

  /**
   * Set direct RPM target
   */
  public setTargetRpm(target: number) {
    this.initContext();
    if (!this.isRunning) {
      this.start();
    }
    const cfg = PROFILES[this.profile];
    this.targetRpm = Math.max(cfg.idleRpm, Math.min(cfg.redlineRpm, target));
  }

  /**
   * Cold Start Routine:
   * 1. Starter motor cranking sound
   * 2. Sudden high-idle ignition bark (~2,200 RPM)
   * 3. Gradual smooth descent to warm idle
   */
  public playColdStart(onComplete?: () => void) {
    this.initContext();
    this.stop();

    if (!this.ctx) return;
    const ctx = this.ctx;

    // 1. Cranking Starter Chirps
    const crankTimes = [0, 0.15, 0.3, 0.45];
    crankTimes.forEach((delay) => {
      const crankOsc = ctx.createOscillator();
      crankOsc.type = 'sawtooth';
      crankOsc.frequency.setValueAtTime(140, ctx.currentTime + delay);
      crankOsc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + delay + 0.1);

      const crankGain = ctx.createGain();
      crankGain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
      crankGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.11);

      crankOsc.connect(crankGain);
      crankGain.connect(ctx.destination);
      crankOsc.start(ctx.currentTime + delay);
      crankOsc.stop(ctx.currentTime + delay + 0.12);
    });

    // 2. Catch & Flare
    setTimeout(() => {
      this.start();
      const cfg = PROFILES[this.profile];
      // Flare up to cold high idle
      this.targetRpm = Math.min(cfg.redlineRpm * 0.45, 2400);

      setTimeout(() => {
        this.playExhaustBurble();
      }, 400);

      // Settle down to normal idle
      setTimeout(() => {
        this.targetRpm = cfg.idleRpm;
        if (onComplete) onComplete();
      }, 1800);
    }, 600);
  }

  /**
   * Launch Control / 2-Step Rev Limiter
   * Holds engine bouncing rapidly against 4,500 RPM with staccato backfires!
   */
  public toggleLaunchControl(active?: boolean): boolean {
    this.initContext();
    if (!this.isRunning) {
      this.start();
    }

    const nextState = active !== undefined ? active : !this.isLaunchControl;
    this.isLaunchControl = nextState;

    if (this.launchTimerId) {
      clearInterval(this.launchTimerId);
      this.launchTimerId = null;
    }

    if (this.isLaunchControl) {
      const limitRpm = this.profile === 'supercharged-i4' ? 8500 : 4500;
      let bounce = false;

      this.launchTimerId = window.setInterval(() => {
        bounce = !bounce;
        this.targetRpm = limitRpm + (bounce ? 250 : -250);
        if (Math.random() > 0.4) {
          this.playStutterPop();
        }
      }, 70);
    } else {
      this.targetRpm = PROFILES[this.profile].idleRpm;
    }

    return this.isLaunchControl;
  }

  public getIsLaunchControl(): boolean {
    return this.isLaunchControl;
  }

  /**
   * Dyno Pull Acceleration Run through gears 1, 2, 3, 4
   */
  public playDynoPull(onComplete?: () => void) {
    this.initContext();
    if (!this.isRunning) {
      this.start();
    }

    this.isDynoPull = true;
    const cfg = PROFILES[this.profile];

    // Gear 1
    this.setThrottle(0.95);

    setTimeout(() => {
      // Gear shift 1 -> 2
      this.playShiftCut();
      this.targetRpm = cfg.redlineRpm * 0.62;

      setTimeout(() => {
        this.setThrottle(0.95);

        setTimeout(() => {
          // Gear shift 2 -> 3
          this.playShiftCut();
          this.targetRpm = cfg.redlineRpm * 0.68;

          setTimeout(() => {
            this.setThrottle(0.95);

            setTimeout(() => {
              // Lift off & decelerate
              this.setThrottle(0);
              this.playExhaustBurble();
              this.isDynoPull = false;
              if (onComplete) onComplete();
            }, 1200);
          }, 200);
        }, 1100);
      }, 200);
    }, 1100);
  }

  /**
   * Instant Throttle Blip (Downshift rev match)
   */
  public playThrottleBlip() {
    this.initContext();
    if (!this.isRunning) {
      this.start();
    }
    const cfg = PROFILES[this.profile];
    const prevTarget = this.targetRpm;
    this.targetRpm = Math.min(cfg.redlineRpm * 0.75, this.currentRpm + 3000);

    setTimeout(() => {
      this.playExhaustBurble();
      this.targetRpm = prevTarget;
    }, 280);
  }

  private startRpmLoop() {
    const update = () => {
      if (!this.isRunning || !this.ctx) return;
      const cfg = PROFILES[this.profile];

      // Ultra responsive throttle attack, realistic inertia return
      const isThrottleUp = this.targetRpm > this.currentRpm;
      const lerpFactor = isThrottleUp
        ? this.profile === 'supercharged-i4' ? 0.16 : 0.11
        : 0.05;
      this.currentRpm += (this.targetRpm - this.currentRpm) * lerpFactor;

      const baseFreq = (this.currentRpm / 60) * cfg.baseOrder;
      const time = this.ctx.currentTime;

      if (this.idleOsc1) this.idleOsc1.frequency.setTargetAtTime(baseFreq, time, 0.015);
      if (this.idleOsc2) this.idleOsc2.frequency.setTargetAtTime(baseFreq * 2, time, 0.015);
      if (this.idleOsc3) this.idleOsc3.frequency.setTargetAtTime(baseFreq * 3, time, 0.015);
      if (this.subOsc) {
        this.subOsc.frequency.setTargetAtTime((this.currentRpm / 60) * cfg.subHarmonic, time, 0.015);
      }

      // Forced induction tracking
      if (this.inductionOsc && this.inductionGain) {
        if (cfg.forcedInductionType === 'supercharger') {
          const scFreq = 800 + (this.currentRpm / cfg.redlineRpm) * 5000;
          this.inductionOsc.frequency.setTargetAtTime(scFreq, time, 0.02);
          const scGain = 0.02 + (this.currentRpm / cfg.redlineRpm) * 0.075;
          this.inductionGain.gain.setTargetAtTime(scGain, time, 0.02);
        } else if (cfg.forcedInductionType === 'turbo') {
          const turboFreq = 450 + (this.currentRpm / cfg.redlineRpm) * 3200;
          this.inductionOsc.frequency.setTargetAtTime(turboFreq, time, 0.02);
          const turboGain = 0.01 + (this.currentRpm / cfg.redlineRpm) * 0.045;
          this.inductionGain.gain.setTargetAtTime(turboGain, time, 0.02);
        }
      }

      // Exhaust filter tracks engine pitch
      if (this.lowpass) {
        const rpmNorm = (this.currentRpm - cfg.idleRpm) / (cfg.redlineRpm - cfg.idleRpm);
        const mult = this.valveMode === 'quiet' ? 0.65 : this.valveMode === 'track' ? 1.4 : 1.0;
        const filterCutoff = (cfg.filterBase + rpmNorm * (cfg.filterTop - cfg.filterBase)) * mult;
        this.lowpass.frequency.setTargetAtTime(filterCutoff, time, 0.02);
      }

      if (this.noiseGain) {
        const rpmNorm = (this.currentRpm - cfg.idleRpm) / (cfg.redlineRpm - cfg.idleRpm);
        const noiseVol = 0.035 + rpmNorm * 0.16;
        this.noiseGain.gain.setTargetAtTime(noiseVol, time, 0.025);
      }

      // Boost Pressure Simulation tracking throttle and RPM
      if (cfg.hasForcedInduction) {
        const targetBoost = Math.max(0, this.throttleAmount * (this.currentRpm / cfg.redlineRpm) * this.maxBoostPsi);
        this.boostPressure += (targetBoost - this.boostPressure) * 0.12;
      } else {
        this.boostPressure = 0;
      }
      this.notifyBoostUpdate();

      // Real-Time Automatic Transmission
      const now = Date.now();
      if (
        this.transmissionMode === 'auto' &&
        !this.isLaunchControl &&
        !this.isDynoPull &&
        typeof this.currentGear === 'number'
      ) {
        if (
          this.throttleAmount > 0.35 &&
          this.currentRpm >= cfg.redlineRpm * 0.88 &&
          this.currentGear < 8 &&
          now - this.lastShiftTime > 1300
        ) {
          this.shiftUp();
          this.lastShiftTime = now;
        } else if (
          this.throttleAmount > 0.65 &&
          this.currentRpm <= cfg.idleRpm * 2.2 &&
          this.currentGear > 1 &&
          now - this.lastShiftTime > 1400
        ) {
          this.shiftDown();
          this.lastShiftTime = now;
        }
      }

      this.notifyRpmUpdate();

      this.animFrameId = requestAnimationFrame(update);
    };
    this.animFrameId = requestAnimationFrame(update);
  }

  public getRpm(): number {
    return Math.round(this.currentRpm);
  }

  public subscribeRpm(callback: (rpm: number) => void): () => void {
    this.onRpmUpdateCallbacks.add(callback);
    callback(this.getRpm());
    return () => this.onRpmUpdateCallbacks.delete(callback);
  }

  private notifyRpmUpdate() {
    const rpm = this.getRpm();
    this.onRpmUpdateCallbacks.forEach((cb) => {
      try {
        cb(rpm);
      } catch {}
    });
  }

  /**
   * Gear Shift Ignition Cut Sound ("DSG Fart" / Shift Pop)
   */
  public playShiftCut() {
    if (!this.ctx || !this.isRunning) return;
    const ctx = this.ctx;

    const cutOsc = ctx.createOscillator();
    cutOsc.type = 'sawtooth';
    cutOsc.frequency.setValueAtTime(55, ctx.currentTime);

    const cutGain = ctx.createGain();
    cutGain.gain.setValueAtTime(0.35, ctx.currentTime);
    cutGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    cutOsc.connect(cutGain);
    cutGain.connect(ctx.destination);
    cutOsc.start();
    cutOsc.stop(ctx.currentTime + 0.13);
  }

  /**
   * Staccato Limiter Pop for Launch Control
   */
  private playStutterPop() {
    if (!this.ctx || !this.isRunning) return;
    const ctx = this.ctx;

    const popOsc = ctx.createOscillator();
    popOsc.type = 'square';
    popOsc.frequency.setValueAtTime(60 + Math.random() * 40, ctx.currentTime);

    const popGain = ctx.createGain();
    const vol = this.valveMode === 'track' ? 0.35 : 0.22;
    popGain.gain.setValueAtTime(vol, ctx.currentTime);
    popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    popOsc.connect(popGain);
    popGain.connect(ctx.destination);
    popOsc.start();
    popOsc.stop(ctx.currentTime + 0.07);
  }

  /**
   * Signature Overrun Burble, Supercharger Flutter, or Gunshot Backfire
   */
  public playExhaustBurble() {
    this.initContext();
    if (!this.isRunning) {
      this.start();
    }
    if (!this.ctx) return;
    const ctx = this.ctx;

    const isTrack = this.valveMode === 'track';
    const mult = isTrack ? 1.4 : this.valveMode === 'quiet' ? 0.5 : 1.0;

    if (this.profile === 'supercharged-i4') {
      // Kawasaki Ninja H2R Supercharger Flutter / Blow-Off Chirp
      const pulses = [0, 0.055, 0.11, 0.165];
      pulses.forEach((offset, idx) => {
        const chirpOsc = ctx.createOscillator();
        chirpOsc.type = 'sine';
        chirpOsc.frequency.setValueAtTime(1900 - idx * 260, ctx.currentTime + offset);
        chirpOsc.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + offset + 0.05);

        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime((0.22 / (idx + 1)) * mult, ctx.currentTime + offset);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.055);

        chirpOsc.connect(chirpGain);
        chirpGain.connect(ctx.destination);
        chirpOsc.start(ctx.currentTime + offset);
        chirpOsc.stop(ctx.currentTime + offset + 0.06);
      });
    } else if (this.profile === 'coyote-v8') {
      // Mustang 5.0L Cross-Plane Deep Throaty Bark & Cannon Pop
      const popOsc = ctx.createOscillator();
      popOsc.type = 'triangle';
      popOsc.frequency.setValueAtTime(48, ctx.currentTime);
      popOsc.frequency.exponentialRampToValueAtTime(22, ctx.currentTime + 0.2);

      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.32 * mult, ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      popOsc.connect(popGain);
      popGain.connect(ctx.destination);
      popOsc.start();
      popOsc.stop(ctx.currentTime + 0.24);
    } else if (this.profile === 'amg-v8') {
      // Mercedes-AMG G63 Heavy Side-Pipe Gunshot Crack
      const popOsc = ctx.createOscillator();
      popOsc.type = 'sawtooth';
      popOsc.frequency.setValueAtTime(42, ctx.currentTime);

      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.38 * mult, ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      popOsc.connect(popGain);
      popGain.connect(ctx.destination);
      popOsc.start();
      popOsc.stop(ctx.currentTime + 0.2);
    } else if (this.profile === 'ferrari-v8') {
      // Ferrari Flat-Plane High-Frequency Razor Anti-Lag Crackles
      const crackTimes = [0, 0.05, 0.11, 0.18];
      crackTimes.forEach((delay) => {
        const popOsc = ctx.createOscillator();
        popOsc.type = 'sawtooth';
        popOsc.frequency.setValueAtTime(180, ctx.currentTime + delay);
        popOsc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + delay + 0.04);
        const popGain = ctx.createGain();
        popGain.gain.setValueAtTime(0.36 * mult, ctx.currentTime + delay);
        popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.055);
        popOsc.connect(popGain);
        popGain.connect(ctx.destination);
        popOsc.start(ctx.currentTime + delay);
        popOsc.stop(ctx.currentTime + delay + 0.06);
      });
    } else if (this.profile === 'bugatti-w16') {
      // Bugatti W16 Earth-Shaking Sub-Bass Boom & Turbo Surge
      const popOsc = ctx.createOscillator();
      popOsc.type = 'triangle';
      popOsc.frequency.setValueAtTime(36, ctx.currentTime);
      popOsc.frequency.exponentialRampToValueAtTime(18, ctx.currentTime + 0.35);
      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.48 * mult, ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
      popOsc.connect(popGain);
      popGain.connect(ctx.destination);
      popOsc.start();
      popOsc.stop(ctx.currentTime + 0.4);
    } else if (this.profile === 'parallel-twin-270' || this.profile === 'custom-bobber-twin') {
      // Royal Enfield 270° Twin Throaty Megaphone / Bobber Overrun Burble
      const pops = [0, 0.08, 0.17];
      pops.forEach((delay, idx) => {
        const popOsc = ctx.createOscillator();
        popOsc.type = 'sine';
        popOsc.frequency.setValueAtTime(95 - idx * 15, ctx.currentTime + delay);
        popOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + delay + 0.06);
        const popGain = ctx.createGain();
        popGain.gain.setValueAtTime(0.28 * mult, ctx.currentTime + delay);
        popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.065);
        popOsc.connect(popGain);
        popGain.connect(ctx.destination);
        popOsc.start(ctx.currentTime + delay);
        popOsc.stop(ctx.currentTime + delay + 0.07);
      });
    } else {
      // BMW S58 Twin-Turbo Multi-Pop Burble
      const popTimes = [0, 0.075, 0.15];
      popTimes.forEach((delay) => {
        const popOsc = ctx.createOscillator();
        popOsc.type = 'square';
        popOsc.frequency.setValueAtTime(68, ctx.currentTime + delay);
        const popGain = ctx.createGain();
        popGain.gain.setValueAtTime(0.16 * mult, ctx.currentTime + delay);
        popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.07);
        popOsc.connect(popGain);
        popGain.connect(ctx.destination);
        popOsc.start(ctx.currentTime + delay);
        popOsc.stop(ctx.currentTime + delay + 0.08);
      });
    }

    this.notifyExhaustEvent('burble');
  }

  /**
   * Visceral Real-Life Exhaust Backfire & Gunshot Overrun Detonation:
   * Simulates unburnt high-octane fuel igniting against red-hot turbo downpipes and exhaust manifolds
   */
  public triggerExhaustBackfire() {
    this.initContext();
    if (!this.isRunning) {
      this.start();
    }
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const isTrack = this.valveMode === 'track';
    const volumeMultiplier = isTrack ? 1.6 : this.valveMode === 'quiet' ? 0.45 : 1.0;

    // 1. Primary Supersonic Explosion Shockwave (30-55Hz Sub-Bass Punch)
    const shockwaveOsc = ctx.createOscillator();
    shockwaveOsc.type = this.profile === 'coyote-v8' || this.profile === 'amg-v8' ? 'sawtooth' : 'triangle';
    shockwaveOsc.frequency.setValueAtTime(
      this.profile === 'bugatti-w16' ? 32 : this.profile === 'supercharged-i4' ? 65 : 44,
      now
    );
    shockwaveOsc.frequency.exponentialRampToValueAtTime(14, now + 0.28);

    const shockwaveGain = ctx.createGain();
    shockwaveGain.gain.setValueAtTime(0.55 * volumeMultiplier, now);
    shockwaveGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    shockwaveOsc.connect(shockwaveGain);
    shockwaveGain.connect(ctx.destination);
    shockwaveOsc.start(now);
    shockwaveOsc.stop(now + 0.32);

    // 2. Metallic Exhaust Pipe Ringing (Acoustic Tube Resonance)
    const pipeRingOsc = ctx.createOscillator();
    pipeRingOsc.type = 'sawtooth';
    const ringFreq = this.profile === 'supercharged-i4' ? 1400 : 780;
    pipeRingOsc.frequency.setValueAtTime(ringFreq, now);
    pipeRingOsc.frequency.exponentialRampToValueAtTime(ringFreq * 0.4, now + 0.12);

    const pipeFilter = ctx.createBiquadFilter();
    pipeFilter.type = 'bandpass';
    pipeFilter.frequency.setValueAtTime(ringFreq, now);
    pipeFilter.Q.setValueAtTime(6.0, now);

    const pipeGain = ctx.createGain();
    pipeGain.gain.setValueAtTime(0.32 * volumeMultiplier, now);
    pipeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    pipeRingOsc.connect(pipeFilter);
    pipeFilter.connect(pipeGain);
    pipeGain.connect(ctx.destination);
    pipeRingOsc.start(now);
    pipeRingOsc.stop(now + 0.15);

    // 3. Staccato Overrun Secondary Firecrackers (2 to 4 rapid micro-pops)
    const crackleCount = isTrack ? 4 : 2;
    for (let i = 0; i < crackleCount; i++) {
      const delay = 0.05 + i * 0.045 + Math.random() * 0.02;
      const popOsc = ctx.createOscillator();
      popOsc.type = 'square';
      popOsc.frequency.setValueAtTime(120 + Math.random() * 90, now + delay);
      popOsc.frequency.exponentialRampToValueAtTime(35, now + delay + 0.04);

      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime((0.28 / (i + 1)) * volumeMultiplier, now + delay);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.045);

      popOsc.connect(popGain);
      popGain.connect(ctx.destination);
      popOsc.start(now + delay);
      popOsc.stop(now + delay + 0.05);
    }

    this.notifyExhaustEvent('backfire');
  }

  public subscribeExhaustEvent(callback: (event: 'burble' | 'backfire' | 'pop') => void): () => void {
    this.onExhaustEventCallbacks.add(callback);
    return () => this.onExhaustEventCallbacks.delete(callback);
  }

  private notifyExhaustEvent(event: 'burble' | 'backfire' | 'pop') {
    this.onExhaustEventCallbacks.forEach((cb) => {
      try {
        cb(event);
      } catch {}
    });
  }

  /**
   * Real-Time Turbo Sound Maker:
   * Authentic Blow-Off Valve (BOV) & Compressor Surge Flutter
   */
  public triggerBlowOffValve(customStyle?: TurboBovStyle) {
    this.initContext();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const style = customStyle || this.turboBovStyle;
    const now = ctx.currentTime;

    if (style === 'wrc-flutter') {
      // Legendary Group B / WRC Rally Compressor Surge "SUTUTUTU-TU-TU"
      const flutterPulses = [0, 0.048, 0.098, 0.15, 0.205, 0.265, 0.33];
      flutterPulses.forEach((offset, idx) => {
        const decay = Math.pow(0.72, idx);
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const startFreq = 2300 - idx * 160;
        osc.frequency.setValueAtTime(startFreq, now + offset);
        osc.frequency.exponentialRampToValueAtTime(800 - idx * 70, now + offset + 0.042);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(startFreq, now + offset);
        filter.Q.setValueAtTime(8.0, now + offset);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.38 * decay, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.045);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.05);
      });
    } else if (style === 'hks-ssqv') {
      // Iconic High-Pitch Metallic Sequential Chirp + High Pressure Psssh
      const chirp1 = ctx.createOscillator();
      chirp1.type = 'sawtooth';
      chirp1.frequency.setValueAtTime(3200, now);
      chirp1.frequency.exponentialRampToValueAtTime(1400, now + 0.06);

      const chirpGain1 = ctx.createGain();
      chirpGain1.gain.setValueAtTime(0.35, now);
      chirpGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      chirp1.connect(chirpGain1);
      chirpGain1.connect(ctx.destination);
      chirp1.start(now);
      chirp1.stop(now + 0.075);

      const chirp2 = ctx.createOscillator();
      chirp2.type = 'sine';
      chirp2.frequency.setValueAtTime(2600, now + 0.05);
      chirp2.frequency.exponentialRampToValueAtTime(900, now + 0.16);

      const chirpGain2 = ctx.createGain();
      chirpGain2.gain.setValueAtTime(0.28, now + 0.05);
      chirpGain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      chirp2.connect(chirpGain2);
      chirpGain2.connect(ctx.destination);
      chirp2.start(now + 0.05);
      chirp2.stop(now + 0.24);
    } else if (style === 'greddy-surge') {
      // Aggressive GReddy Deep Whoosh with 4 Rapid Flutter Rebounds
      const pulseDelays = [0, 0.06, 0.12, 0.19];
      pulseDelays.forEach((offset, idx) => {
        const decay = Math.pow(0.65, idx);
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1600 - idx * 220, now + offset);
        osc.frequency.exponentialRampToValueAtTime(450, now + offset + 0.055);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.42 * decay, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.065);
      });
    } else {
      // TiAL 50mm High-Flow Atmospheric Vent PSSSHHHHH
      const hissOsc = ctx.createOscillator();
      hissOsc.type = 'sawtooth';
      hissOsc.frequency.setValueAtTime(2800, now);
      hissOsc.frequency.exponentialRampToValueAtTime(600, now + 0.35);

      const hissFilter = ctx.createBiquadFilter();
      hissFilter.type = 'lowpass';
      hissFilter.frequency.setValueAtTime(3500, now);
      hissFilter.frequency.exponentialRampToValueAtTime(1200, now + 0.38);

      const hissGain = ctx.createGain();
      hissGain.gain.setValueAtTime(0.45, now);
      hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      hissOsc.connect(hissFilter);
      hissFilter.connect(hissGain);
      hissGain.connect(ctx.destination);
      hissOsc.start(now);
      hissOsc.stop(now + 0.42);
    }
  }

  // Transmission & Gear Controls
  public shiftUp(): boolean {
    this.initContext();
    if (!this.isRunning) this.start();

    if (typeof this.currentGear === 'number') {
      if (this.currentGear < 8) {
        this.currentGear = (this.currentGear + 1) as GearPosition;
        this.playShiftCut();
        const cfg = PROFILES[this.profile];
        this.currentRpm = Math.max(cfg.idleRpm + 400, this.currentRpm * 0.74);
        this.notifyGearUpdate();
        return true;
      }
    } else if (this.currentGear === 'N' || this.currentGear === 'P') {
      this.currentGear = 1;
      this.playShiftCut();
      this.notifyGearUpdate();
      return true;
    }
    return false;
  }

  public shiftDown(): boolean {
    this.initContext();
    if (!this.isRunning) this.start();

    if (typeof this.currentGear === 'number') {
      if (this.currentGear > 1) {
        this.currentGear = (this.currentGear - 1) as GearPosition;
        this.playThrottleBlip();
        const cfg = PROFILES[this.profile];
        this.currentRpm = Math.min(cfg.redlineRpm * 0.94, this.currentRpm * 1.30);
        this.notifyGearUpdate();
        return true;
      }
    }
    return false;
  }

  public setGear(gear: GearPosition) {
    this.currentGear = gear;
    this.notifyGearUpdate();
  }

  public getGear(): GearPosition {
    return this.currentGear;
  }

  public setTransmissionMode(mode: TransmissionMode) {
    this.transmissionMode = mode;
  }

  public getTransmissionMode(): TransmissionMode {
    return this.transmissionMode;
  }

  public setTurboBovStyle(style: TurboBovStyle) {
    this.turboBovStyle = style;
  }

  public getTurboBovStyle(): TurboBovStyle {
    return this.turboBovStyle;
  }

  public getBoostPressure(): number {
    return Math.max(0, Math.round(this.boostPressure * 10) / 10);
  }

  public subscribeGear(callback: (gear: GearPosition) => void): () => void {
    this.onGearUpdateCallbacks.add(callback);
    callback(this.currentGear);
    return () => this.onGearUpdateCallbacks.delete(callback);
  }

  public subscribeBoost(callback: (boost: number) => void): () => void {
    this.onBoostUpdateCallbacks.add(callback);
    callback(this.getBoostPressure());
    return () => this.onBoostUpdateCallbacks.delete(callback);
  }

  private notifyGearUpdate() {
    this.onGearUpdateCallbacks.forEach((cb) => {
      try {
        cb(this.currentGear);
      } catch {}
    });
  }

  private notifyBoostUpdate() {
    const boost = this.getBoostPressure();
    this.onBoostUpdateCallbacks.forEach((cb) => {
      try {
        cb(boost);
      } catch {}
    });
  }

  public getActive(): boolean {
    return this.isRunning;
  }
}

export const engineSound = new EngineSoundEngine();
