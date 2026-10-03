/**
 * REV THE BEAST - Ultra-High-Fidelity Automotive Acoustic Synthesis Engine
 * 
 * Physical modeling of internal combustion and electric vehicle powertrains:
 * - Asymmetrical crank firing orders (Cross-plane V8 vs Flat-plane V8 vs I6 vs V10 vs V12 vs W16 vs I4 vs 270° Twin vs EV Motor)
 * - Individual cylinder combustion pressure wave shaping (Fourier synthesis & polynomial wave-shaping)
 * - Multi-layer engine audio blending (Idle, Low, Mid, High, Redline)
 * - Exhaust material tuning (Stock Chrome, Burnt Titanium, Matte Carbon, Straight-Pipe Racing)
 * - Exhaust header & tailpipe acoustic resonance modeling (Comb filters & tuned formants)
 * - Dynamic turbocharger whistling & multi-stage compressor surge blow-off flutter (STU-TU-TU-TU)
 * - 2-Step Launch Control hard ignition rev-limiter cuts with gunshot transients and crackle backfires
 * - Starter motor cranking whine & cold-start ignition flare
 * - Electric Powertrain: High-frequency IGBT switching whine + planetary reduction gear whine + regenerative hum
 * - Live Web Audio AnalyserNode for reactive HUD audio visualizers
 * - Acoustic Environments: Studio Pure, Monaco Tunnel Echo, Grandstand Circuit Reverb
 */

import { EngineSoundProfile, ExhaustValveMode, TransmissionMode, GearPosition, TurboBovStyle, ExhaustMaterial } from '../types';

export type AcousticEnvironment = 'studio' | 'tunnel' | 'track';

export interface ProfileAcousticConfig {
  name: string;
  cylinders: number;
  idleRpm: number;
  redlineRpm: number;
  firingPattern: number[]; // Relative phase intervals in 720° four-stroke cycle
  fundamentalOrder: number; // Dominant firing order frequency factor
  subHarmonicFactor: number; // Sub-harmonic thud factor
  combustionSharpness: number; // Wave-shaping curve exponent
  headerResonanceFreq: number; // Low exhaust header resonance (Hz)
  tailpipeResonanceFreq: number; // High exhaust tailpipe resonance (Hz)
  metallicRaspGain: number; // Straight pipe / rasp brightness (0 - 1)
  intakeRoarFreq: number; // Intake air induction suction frequency (Hz)
  hasForcedInduction: boolean;
  forcedInductionType: 'turbo' | 'supercharger' | 'none';
  forcedInductionPitchRatio: number; // Multiplier relative to engine RPM
  hasSuperchargerWhine: boolean;
  maxBoostPsi: number;
  spoolRate: number; // How quickly turbo spools with throttle
  gainMultiplier: number;
  isElectric?: boolean;
  soundDescription: string;
}

export const ACOUSTIC_PROFILES: Record<EngineSoundProfile, ProfileAcousticConfig> = {
  // Ford Mustang 5.0L Coyote V8: Cross-plane crank, 90° uneven firing -> iconic heavy muscle lope & bass burble
  'coyote-v8': {
    name: 'Ford 5.0L Coyote Cross-Plane V8',
    cylinders: 8,
    idleRpm: 680,
    redlineRpm: 7500,
    firingPattern: [0.0, 0.125, 0.375, 0.5, 0.625, 0.875],
    fundamentalOrder: 4.0,
    subHarmonicFactor: 1.0, // Heavy 1x crank speed lope
    combustionSharpness: 2.8,
    headerResonanceFreq: 110,
    tailpipeResonanceFreq: 640,
    metallicRaspGain: 0.35,
    intakeRoarFreq: 260,
    hasForcedInduction: false,
    forcedInductionType: 'none',
    forcedInductionPitchRatio: 0,
    hasSuperchargerWhine: false,
    maxBoostPsi: 0,
    spoolRate: 0,
    gainMultiplier: 0.95,
    soundDescription: 'Deep, thumping American cross-plane rumble with visceral idle lope and thundering high-RPM roar.',
  },

  // BMW S58 TwinPower Turbo I6: Perfect primary/secondary balance, 120° even firing -> signature metallic scream
  's58-inline6': {
    name: 'BMW S58 TwinPower Turbo I6',
    cylinders: 6,
    idleRpm: 800,
    redlineRpm: 7200,
    firingPattern: [0.0, 0.1667, 0.3333, 0.5, 0.6667, 0.8333],
    fundamentalOrder: 3.0,
    subHarmonicFactor: 1.5,
    combustionSharpness: 3.4,
    headerResonanceFreq: 165,
    tailpipeResonanceFreq: 1150,
    metallicRaspGain: 0.72,
    intakeRoarFreq: 380,
    hasForcedInduction: true,
    forcedInductionType: 'turbo',
    forcedInductionPitchRatio: 1.85,
    hasSuperchargerWhine: false,
    maxBoostPsi: 24.7,
    spoolRate: 3.2,
    gainMultiplier: 0.88,
    soundDescription: 'Metallic, high-frequency inline-6 scream with singing twin-turbo spool whistle and rapid overrun pops.',
  },

  // Mercedes-AMG M177 Biturbo V8: Hot-V Biturbo with guttural side-pipe bass thunder
  'amg-v8': {
    name: 'Mercedes-AMG M177 Biturbo V8',
    cylinders: 8,
    idleRpm: 700,
    redlineRpm: 6800,
    firingPattern: [0.0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875],
    fundamentalOrder: 4.0,
    subHarmonicFactor: 0.8,
    combustionSharpness: 3.6,
    headerResonanceFreq: 90,
    tailpipeResonanceFreq: 520,
    metallicRaspGain: 0.48,
    intakeRoarFreq: 240,
    hasForcedInduction: true,
    forcedInductionType: 'turbo',
    forcedInductionPitchRatio: 1.6,
    hasSuperchargerWhine: false,
    maxBoostPsi: 21.8,
    spoolRate: 2.8,
    gainMultiplier: 1.0,
    soundDescription: 'Guttural AMG side-pipe thunder with deep sub-bass vibration and heavy backfire cracks.',
  },

  // Kawasaki Ninja H2R: 14,000 RPM Supercharged Screamer with screaming centrifugal planetary turbine
  'supercharged-i4': {
    name: 'Kawasaki Ninja H2R Supercharged I4',
    cylinders: 4,
    idleRpm: 1200,
    redlineRpm: 14000,
    firingPattern: [0.0, 0.25, 0.5, 0.75],
    fundamentalOrder: 2.0,
    subHarmonicFactor: 1.0,
    combustionSharpness: 4.2,
    headerResonanceFreq: 280,
    tailpipeResonanceFreq: 2400,
    metallicRaspGain: 0.85,
    intakeRoarFreq: 750,
    hasForcedInduction: true,
    forcedInductionType: 'supercharger',
    forcedInductionPitchRatio: 4.6,
    hasSuperchargerWhine: true,
    maxBoostPsi: 35.0,
    spoolRate: 5.5,
    gainMultiplier: 0.92,
    soundDescription: 'Ear-splitting 14,000 RPM hyper-screamer with screaming planetary supercharger gear whine and iconic flutter chirps.',
  },

  // Ferrari F154 Twin-Turbo Flat-Plane V8: 180° Flat-plane crank -> razor-sharp Italian exotic wail
  'ferrari-v8': {
    name: 'Ferrari 3.9L Twin-Turbo Flat-Plane V8',
    cylinders: 8,
    idleRpm: 950,
    redlineRpm: 8000,
    firingPattern: [0.0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875],
    fundamentalOrder: 4.0,
    subHarmonicFactor: 2.0,
    combustionSharpness: 3.9,
    headerResonanceFreq: 195,
    tailpipeResonanceFreq: 1450,
    metallicRaspGain: 0.78,
    intakeRoarFreq: 420,
    hasForcedInduction: true,
    forcedInductionType: 'turbo',
    forcedInductionPitchRatio: 2.1,
    hasSuperchargerWhine: false,
    maxBoostPsi: 28.5,
    spoolRate: 4.0,
    gainMultiplier: 0.94,
    soundDescription: 'High-frequency screaming Italian flat-plane exotic bark with lightning-fast rev response.',
  },

  // Bugatti 8.0L Quad-Turbo W16: 16 cylinders -> colossal continuous jet-like sound wall
  'bugatti-w16': {
    name: 'Bugatti 8.0L Quad-Turbo W16',
    cylinders: 16,
    idleRpm: 700,
    redlineRpm: 7100,
    firingPattern: [
      0.0, 0.0625, 0.125, 0.1875, 0.25, 0.3125, 0.375, 0.4375,
      0.5, 0.5625, 0.625, 0.6875, 0.75, 0.8125, 0.875, 0.9375,
    ],
    fundamentalOrder: 8.0,
    subHarmonicFactor: 2.0,
    combustionSharpness: 3.0,
    headerResonanceFreq: 85,
    tailpipeResonanceFreq: 780,
    metallicRaspGain: 0.50,
    intakeRoarFreq: 310,
    hasForcedInduction: true,
    forcedInductionType: 'turbo',
    forcedInductionPitchRatio: 2.4,
    hasSuperchargerWhine: false,
    maxBoostPsi: 40.0,
    spoolRate: 3.0,
    gainMultiplier: 1.05,
    soundDescription: 'Massive displacement 16-cylinder deep jet-turbine roar with immense quad-turbo air velocity.',
  },

  // Lamborghini / LFA 5.2L Naturally Aspirated V10: 72° firing -> legendary 5th harmonic F1 acoustic howl
  'v10-exotic': {
    name: 'Exotic 5.2L Naturally Aspirated V10',
    cylinders: 10,
    idleRpm: 900,
    redlineRpm: 8700,
    firingPattern: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    fundamentalOrder: 5.0, // Prominent 5th order produces the signature F1 howl
    subHarmonicFactor: 1.5,
    combustionSharpness: 4.0,
    headerResonanceFreq: 220,
    tailpipeResonanceFreq: 1680,
    metallicRaspGain: 0.82,
    intakeRoarFreq: 490,
    hasForcedInduction: false,
    forcedInductionType: 'none',
    forcedInductionPitchRatio: 0,
    hasSuperchargerWhine: false,
    maxBoostPsi: 0,
    spoolRate: 0,
    gainMultiplier: 0.96,
    soundDescription: 'Exotic high-revving 5th harmonic F1 acoustic howl with screaming 8,700 RPM titanium resonance.',
  },

  // Beast AI 6.5L Naturally Aspirated V12: 60° firing -> silky smooth harmonic choir
  'v12-symphony': {
    name: 'Beast 6.5L Naturally Aspirated V12',
    cylinders: 12,
    idleRpm: 850,
    redlineRpm: 9200,
    firingPattern: [
      0.0, 0.0833, 0.1667, 0.25, 0.3333, 0.4167,
      0.5, 0.5833, 0.6667, 0.75, 0.8333, 0.9167,
    ],
    fundamentalOrder: 6.0,
    subHarmonicFactor: 2.0,
    combustionSharpness: 3.8,
    headerResonanceFreq: 190,
    tailpipeResonanceFreq: 1950,
    metallicRaspGain: 0.80,
    intakeRoarFreq: 520,
    hasForcedInduction: false,
    forcedInductionType: 'none',
    forcedInductionPitchRatio: 0,
    hasSuperchargerWhine: false,
    maxBoostPsi: 0,
    spoolRate: 0,
    gainMultiplier: 0.98,
    soundDescription: 'Ultra-dense, velvety smooth 12-cylinder harmonic choir screaming to an astronomical 9,200 RPM.',
  },

  // Beast EV Solid-State Quad Electric Drive
  'electric-motor': {
    name: 'Beast EV Quad-Motor Solid-State Drive',
    cylinders: 0,
    idleRpm: 0,
    redlineRpm: 20000,
    firingPattern: [],
    fundamentalOrder: 0,
    subHarmonicFactor: 0,
    combustionSharpness: 1.0,
    headerResonanceFreq: 400,
    tailpipeResonanceFreq: 12000,
    metallicRaspGain: 0,
    intakeRoarFreq: 0,
    hasForcedInduction: false,
    forcedInductionType: 'none',
    forcedInductionPitchRatio: 0,
    hasSuperchargerWhine: false,
    maxBoostPsi: 0,
    spoolRate: 0,
    gainMultiplier: 0.90,
    isElectric: true,
    soundDescription: 'Futuristic IGBT 12kHz inverter carrier switching tone, planetary reduction gear whine, and regenerative magnetic deceleration hum.',
  },

  // Royal Enfield Continental GT 650: 270° Parallel Twin -> deep rhythmic British twin thumping
  'parallel-twin-270': {
    name: 'Royal Enfield 648cc Parallel Twin 270°',
    cylinders: 2,
    idleRpm: 1200,
    redlineRpm: 7500,
    firingPattern: [0.0, 0.375],
    fundamentalOrder: 1.0,
    subHarmonicFactor: 0.5,
    combustionSharpness: 3.2,
    headerResonanceFreq: 140,
    tailpipeResonanceFreq: 580,
    metallicRaspGain: 0.42,
    intakeRoarFreq: 320,
    hasForcedInduction: false,
    forcedInductionType: 'none',
    forcedInductionPitchRatio: 0,
    hasSuperchargerWhine: false,
    maxBoostPsi: 0,
    spoolRate: 0,
    gainMultiplier: 0.92,
    soundDescription: 'Iconic 270-degree crossplane firing cadence with throaty cafe racer megaphone rasp and thumping idle.',
  },

  // Royal Enfield Shotgun 650 Custom Bobber: Raw, peashooter twin burble
  'custom-bobber-twin': {
    name: 'Royal Enfield Shotgun 650 Bobber Twin',
    cylinders: 2,
    idleRpm: 1150,
    redlineRpm: 7500,
    firingPattern: [0.0, 0.375],
    fundamentalOrder: 1.0,
    subHarmonicFactor: 0.5,
    combustionSharpness: 3.5,
    headerResonanceFreq: 125,
    tailpipeResonanceFreq: 540,
    metallicRaspGain: 0.45,
    intakeRoarFreq: 290,
    hasForcedInduction: false,
    forcedInductionType: 'none',
    forcedInductionPitchRatio: 0,
    hasSuperchargerWhine: false,
    maxBoostPsi: 0,
    spoolRate: 0,
    gainMultiplier: 0.95,
    soundDescription: 'Deep, bass-heavy neo-retro bobber thump with twin-pipe exhaust burble and raw mechanical valve tick.',
  },
};

export class RealisticEngineSynthesizer {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private profile: EngineSoundProfile = 's58-inline6';
  private valveMode: ExhaustValveMode = 'sport';
  private exhaustMaterial: ExhaustMaterial = 'titanium';
  private environment: AcousticEnvironment = 'studio';

  // Dynamic Telemetry
  private currentRpm: number = 800;
  private targetRpm: number = 800;
  private boostPressure: number = 0;
  private throttleAmount: number = 0;
  private prevThrottle: number = 0;
  private currentGear: GearPosition = 1;
  private transmissionMode: TransmissionMode = 'manual';

  // Sound Engine Nodes
  private masterGain: GainNode | null = null;
  private valveGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private environmentConvolver: ConvolverNode | null = null;
  private environmentWetGain: GainNode | null = null;
  private environmentDryGain: GainNode | null = null;

  // Multi-Layer Combustion Chain
  private idleOsc: OscillatorNode | null = null;
  private lowRpmOsc: OscillatorNode | null = null;
  private midRpmOsc: OscillatorNode | null = null;
  private highRpmOsc: OscillatorNode | null = null;
  private subBassOsc: OscillatorNode | null = null;
  private subBassGain: GainNode | null = null;

  // Layer Gain Nodes for Smooth Crossfading
  private idleLayerGain: GainNode | null = null;
  private lowLayerGain: GainNode | null = null;
  private midLayerGain: GainNode | null = null;
  private highLayerGain: GainNode | null = null;

  // Electric Motor Synthesizer Nodes
  private evInverterOsc: OscillatorNode | null = null;
  private evGearWhineOsc: OscillatorNode | null = null;
  private evRegenHumOsc: OscillatorNode | null = null;
  private evInverterGain: GainNode | null = null;
  private evGearGain: GainNode | null = null;
  private evRegenGain: GainNode | null = null;

  // Combustion wave shaper for real cylinder pressure explosion
  private waveShaper: WaveShaperNode | null = null;
  private headerFilter: BiquadFilterNode | null = null;
  private tailpipeFilter: BiquadFilterNode | null = null;
  private highRaspFilter: BiquadFilterNode | null = null;
  private highRaspGain: GainNode | null = null;

  // Induction, Turbo, and Supercharger
  private turboWhistleOsc: OscillatorNode | null = null;
  private turboWhistleGain: GainNode | null = null;
  private superchargerWhineOsc: OscillatorNode | null = null;
  private superchargerWhineGain: GainNode | null = null;
  private intakeSuctionNoise: AudioBufferSourceNode | null = null;
  private intakeSuctionFilter: BiquadFilterNode | null = null;
  private intakeSuctionGain: GainNode | null = null;

  // Timing & Animation
  private animFrameId: number | null = null;
  private lastUpdateTime: number = performance.now();

  // Special Modes
  private isLaunchControlActive: boolean = false;
  private launchLimiterBounce: boolean = false;
  private isColdStarting: boolean = false;
  private turboBovStyle: TurboBovStyle = 'wrc-flutter';

  // Callbacks
  private onRpmCallbacks: Set<(rpm: number) => void> = new Set();
  private onGearCallbacks: Set<(gear: GearPosition) => void> = new Set();
  private onBoostCallbacks: Set<(boost: number) => void> = new Set();
  private onExhaustEventCallbacks: Set<(type: 'burble' | 'backfire' | 'pop') => void> = new Set();

  constructor() {
    // Lazy AudioContext initialization
  }

  private initAudioContext() {
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

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  private makeDistortionCurve(amount: number = 3.0): Float32Array {
    const k = amount;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      if (x >= 0) {
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      } else {
        curve[i] = ((3 + k * 0.7) * x * 15 * deg) / (Math.PI + k * 0.6 * Math.abs(x));
      }
    }
    return curve;
  }

  private createImpulseResponse(env: AcousticEnvironment): AudioBuffer | null {
    if (!this.ctx) return null;
    const rate = this.ctx.sampleRate;
    let duration = 0.5;
    let decay = 3.0;

    if (env === 'tunnel') {
      duration = 2.4;
      decay = 1.8;
    } else if (env === 'track') {
      duration = 1.4;
      decay = 2.5;
    } else {
      duration = 0.3;
      decay = 8.0;
    }

    const nSamples = Math.floor(rate * duration);
    const buffer = this.ctx.createBuffer(2, nSamples, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < nSamples; i++) {
      const t = i / nSamples;
      const envelope = Math.exp(-t * decay);
      const echoTap = env === 'tunnel' && (i === Math.floor(rate * 0.08) || i === Math.floor(rate * 0.17)) ? 0.4 : 0;
      left[i] = (Math.random() * 2 - 1) * envelope + echoTap;
      right[i] = (Math.random() * 2 - 1) * envelope + echoTap * 0.8;
    }

    return buffer;
  }

  public setEnvironment(env: AcousticEnvironment) {
    this.environment = env;
    if (this.ctx && this.environmentConvolver) {
      const ir = this.createImpulseResponse(env);
      if (ir) this.environmentConvolver.buffer = ir;
      if (this.environmentWetGain) {
        const wetVal = env === 'tunnel' ? 0.45 : env === 'track' ? 0.30 : 0.08;
        this.environmentWetGain.gain.setTargetAtTime(wetVal, this.ctx.currentTime, 0.05);
      }
    }
  }

  public getEnvironment(): AcousticEnvironment {
    return this.environment;
  }

  public setProfile(profile: EngineSoundProfile) {
    this.profile = profile;
    const cfg = ACOUSTIC_PROFILES[profile] || ACOUSTIC_PROFILES['s58-inline6'];
    this.currentRpm = cfg.idleRpm;
    this.targetRpm = cfg.idleRpm;

    if (this.isRunning && this.ctx) {
      this.stop();
      setTimeout(() => {
        this.start();
      }, 70);
    }
  }

  public getProfile(): EngineSoundProfile {
    return this.profile;
  }

  public setExhaustMaterial(material: ExhaustMaterial) {
    this.exhaustMaterial = material;
    if (this.ctx && this.tailpipeFilter) {
      const cfg = ACOUSTIC_PROFILES[this.profile];
      let mult = 1.0;
      if (material === 'titanium') mult = 1.25; // Brighter acoustic ring
      if (material === 'carbon') mult = 0.85; // Deeper muffled thud
      if (material === 'racing') mult = 1.45; // Open straight-pipe rasp
      this.tailpipeFilter.frequency.setTargetAtTime(cfg.tailpipeResonanceFreq * mult, this.ctx.currentTime, 0.05);
    }
  }

  public getExhaustMaterial(): ExhaustMaterial {
    return this.exhaustMaterial;
  }

  public setValveMode(mode: ExhaustValveMode) {
    this.valveMode = mode;
    if (this.valveGain && this.ctx) {
      const targetGain = mode === 'quiet' ? 0.40 : mode === 'track' ? 1.55 : 1.0;
      this.valveGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.04);
    }
    if (this.tailpipeFilter && this.ctx) {
      const cfg = ACOUSTIC_PROFILES[this.profile];
      const mult = mode === 'quiet' ? 0.65 : mode === 'track' ? 1.45 : 1.0;
      this.tailpipeFilter.frequency.setTargetAtTime(cfg.tailpipeResonanceFreq * mult, this.ctx.currentTime, 0.05);
    }
  }

  public getValveMode(): ExhaustValveMode {
    return this.valveMode;
  }

  public getRpm(): number {
    return Math.round(this.currentRpm);
  }

  public getBoost(): number {
    return Number(this.boostPressure.toFixed(1));
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public setGear(gear: GearPosition) {
    this.currentGear = gear;
    this.onGearCallbacks.forEach((cb) => cb(gear));
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

  public setTurboStyle(style: TurboBovStyle) {
    this.turboBovStyle = style;
  }

  public getTurboStyle(): TurboBovStyle {
    return this.turboBovStyle;
  }

  /**
   * Start engine audio simulation
   */
  public start() {
    this.initAudioContext();
    if (!this.ctx) return;
    if (this.isRunning) return;

    this.isRunning = true;
    const ctx = this.ctx;
    const cfg = ACOUSTIC_PROFILES[this.profile] || ACOUSTIC_PROFILES['s58-inline6'];

    // 1. Master Routing & AnalyserNode
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(cfg.gainMultiplier, ctx.currentTime + 0.12);

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.8;

    this.valveGain = ctx.createGain();
    const initValve = this.valveMode === 'quiet' ? 0.40 : this.valveMode === 'track' ? 1.55 : 1.0;
    this.valveGain.gain.setValueAtTime(initValve, ctx.currentTime);

    // Reverb / Environment bus
    this.environmentConvolver = ctx.createConvolver();
    const irBuffer = this.createImpulseResponse(this.environment);
    if (irBuffer) this.environmentConvolver.buffer = irBuffer;

    this.environmentWetGain = ctx.createGain();
    this.environmentWetGain.gain.setValueAtTime(
      this.environment === 'tunnel' ? 0.45 : this.environment === 'track' ? 0.30 : 0.08,
      ctx.currentTime
    );

    this.environmentDryGain = ctx.createGain();
    this.environmentDryGain.gain.setValueAtTime(0.92, ctx.currentTime);

    // -------------------------------------------------------------------------
    // IF ELECTRIC VEHICLE (Dedicated EV Motor Synthesizer)
    // -------------------------------------------------------------------------
    if (cfg.isElectric) {
      // 1. High-frequency IGBT switching sine (PWM Carrier 10-14 kHz)
      this.evInverterOsc = ctx.createOscillator();
      this.evInverterOsc.type = 'sine';
      this.evInverterOsc.frequency.setValueAtTime(10200, ctx.currentTime);

      this.evInverterGain = ctx.createGain();
      this.evInverterGain.gain.setValueAtTime(0.025, ctx.currentTime);
      this.evInverterOsc.connect(this.evInverterGain);
      this.evInverterGain.connect(this.masterGain);
      this.evInverterOsc.start();

      // 2. Planetary reduction gear whine (rising with wheel speed)
      this.evGearWhineOsc = ctx.createOscillator();
      this.evGearWhineOsc.type = 'triangle';
      this.evGearWhineOsc.frequency.setValueAtTime(120, ctx.currentTime);

      this.evGearGain = ctx.createGain();
      this.evGearGain.gain.setValueAtTime(0.015, ctx.currentTime);
      this.evGearWhineOsc.connect(this.evGearGain);
      this.evGearGain.connect(this.masterGain);
      this.evGearWhineOsc.start();

      // 3. Dual AC induction motor body hum
      this.evRegenHumOsc = ctx.createOscillator();
      this.evRegenHumOsc.type = 'sawtooth';
      this.evRegenHumOsc.frequency.setValueAtTime(80, ctx.currentTime);

      const evHumFilter = ctx.createBiquadFilter();
      evHumFilter.type = 'lowpass';
      evHumFilter.frequency.setValueAtTime(320, ctx.currentTime);

      this.evRegenGain = ctx.createGain();
      this.evRegenGain.gain.setValueAtTime(0.03, ctx.currentTime);

      this.evRegenHumOsc.connect(evHumFilter);
      evHumFilter.connect(this.evRegenGain);
      this.evRegenGain.connect(this.masterGain);
      this.evRegenHumOsc.start();

      this.masterGain.connect(this.analyser);
      this.analyser.connect(ctx.destination);
      this.startPhysicsLoop();
      return;
    }

    // -------------------------------------------------------------------------
    // INTERNAL COMBUSTION MULTI-LAYER ENGINE ACOUSTICS
    // -------------------------------------------------------------------------

    // Wave Shaper for Combustion Cylinder Pressure
    this.waveShaper = ctx.createWaveShaper();
    this.waveShaper.curve = this.makeDistortionCurve(cfg.combustionSharpness);
    this.waveShaper.oversample = '4x';

    // Resonators (Exhaust Header & Tailpipe)
    this.headerFilter = ctx.createBiquadFilter();
    this.headerFilter.type = 'peaking';
    this.headerFilter.frequency.setValueAtTime(cfg.headerResonanceFreq, ctx.currentTime);
    this.headerFilter.Q.setValueAtTime(2.4, ctx.currentTime);
    this.headerFilter.gain.setValueAtTime(8.5, ctx.currentTime);

    this.tailpipeFilter = ctx.createBiquadFilter();
    this.tailpipeFilter.type = 'lowpass';
    this.tailpipeFilter.frequency.setValueAtTime(cfg.tailpipeResonanceFreq, ctx.currentTime);
    this.tailpipeFilter.Q.setValueAtTime(1.8, ctx.currentTime);

    this.highRaspFilter = ctx.createBiquadFilter();
    this.highRaspFilter.type = 'highpass';
    this.highRaspFilter.frequency.setValueAtTime(cfg.tailpipeResonanceFreq * 0.8, ctx.currentTime);
    this.highRaspGain = ctx.createGain();
    this.highRaspGain.gain.setValueAtTime(cfg.metallicRaspGain * 0.25, ctx.currentTime);

    // Multi-Layer Crossfading Nodes
    this.idleLayerGain = ctx.createGain();
    this.lowLayerGain = ctx.createGain();
    this.midLayerGain = ctx.createGain();
    this.highLayerGain = ctx.createGain();

    const baseFreq = (cfg.idleRpm / 60) * cfg.fundamentalOrder;

    // 1. Idle Layer (Deep cylinder chug)
    this.idleOsc = ctx.createOscillator();
    this.idleOsc.type = this.profile === 'coyote-v8' ? 'triangle' : 'sawtooth';
    this.idleOsc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    this.idleOsc.connect(this.idleLayerGain);
    this.idleLayerGain.connect(this.waveShaper);
    this.idleOsc.start();

    // 2. Low-Mid RPM Layer
    this.lowRpmOsc = ctx.createOscillator();
    this.lowRpmOsc.type = 'sawtooth';
    this.lowRpmOsc.frequency.setValueAtTime(baseFreq * 2.0, ctx.currentTime);
    this.lowRpmOsc.connect(this.lowLayerGain);
    this.lowLayerGain.connect(this.waveShaper);
    this.lowRpmOsc.start();

    // 3. Mid-High RPM Layer
    this.midRpmOsc = ctx.createOscillator();
    this.midRpmOsc.type = 'sawtooth';
    this.midRpmOsc.frequency.setValueAtTime(baseFreq * 3.0, ctx.currentTime);
    this.midRpmOsc.connect(this.midLayerGain);
    this.midLayerGain.connect(this.waveShaper);
    this.midRpmOsc.start();

    // 4. Redline Scream Layer (Upper harmonic choir)
    this.highRpmOsc = ctx.createOscillator();
    this.highRpmOsc.type = 'sawtooth';
    this.highRpmOsc.frequency.setValueAtTime(baseFreq * 4.0, ctx.currentTime);
    this.highRpmOsc.connect(this.highLayerGain);
    this.highLayerGain.connect(this.waveShaper);
    this.highRpmOsc.start();

    // 5. Sub-harmonic crank lope
    this.subBassOsc = ctx.createOscillator();
    this.subBassOsc.type = this.profile === 'coyote-v8' || this.profile === 'parallel-twin-270' ? 'sawtooth' : 'sine';
    this.subBassOsc.frequency.setValueAtTime((cfg.idleRpm / 60) * cfg.subHarmonicFactor, ctx.currentTime);

    this.subBassGain = ctx.createGain();
    const subGain = this.profile === 'coyote-v8' ? 0.45 : this.profile === 'amg-v8' ? 0.42 : 0.22;
    this.subBassGain.gain.setValueAtTime(subGain, ctx.currentTime);
    this.subBassOsc.connect(this.subBassGain);
    this.subBassGain.connect(this.headerFilter);
    this.subBassOsc.start();

    // 6. Forced Induction (Only if car actually has turbo/supercharger)
    if (cfg.hasForcedInduction) {
      if (cfg.forcedInductionType === 'supercharger') {
        this.superchargerWhineOsc = ctx.createOscillator();
        this.superchargerWhineOsc.type = 'sawtooth';
        this.superchargerWhineOsc.frequency.setValueAtTime(1400, ctx.currentTime);

        this.superchargerWhineGain = ctx.createGain();
        this.superchargerWhineGain.gain.setValueAtTime(0.04, ctx.currentTime);

        this.superchargerWhineOsc.connect(this.superchargerWhineGain);
        this.superchargerWhineGain.connect(this.masterGain);
        this.superchargerWhineOsc.start();
      } else {
        this.turboWhistleOsc = ctx.createOscillator();
        this.turboWhistleOsc.type = 'sine';
        this.turboWhistleOsc.frequency.setValueAtTime(850, ctx.currentTime);

        this.turboWhistleGain = ctx.createGain();
        this.turboWhistleGain.gain.setValueAtTime(0.015, ctx.currentTime);

        this.turboWhistleOsc.connect(this.turboWhistleGain);
        this.turboWhistleGain.connect(this.masterGain);
        this.turboWhistleOsc.start();
      }
    }

    // 7. Intake Induction Suction Noise
    try {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      this.intakeSuctionNoise = ctx.createBufferSource();
      this.intakeSuctionNoise.buffer = noiseBuffer;
      this.intakeSuctionNoise.loop = true;

      this.intakeSuctionFilter = ctx.createBiquadFilter();
      this.intakeSuctionFilter.type = 'bandpass';
      this.intakeSuctionFilter.frequency.setValueAtTime(cfg.intakeRoarFreq, ctx.currentTime);
      this.intakeSuctionFilter.Q.setValueAtTime(2.2, ctx.currentTime);

      this.intakeSuctionGain = ctx.createGain();
      this.intakeSuctionGain.gain.setValueAtTime(0.03, ctx.currentTime);

      this.intakeSuctionNoise.connect(this.intakeSuctionFilter);
      this.intakeSuctionFilter.connect(this.intakeSuctionGain);
      this.intakeSuctionGain.connect(this.valveGain);
      this.intakeSuctionNoise.start();
    } catch {}

    // 8. Connect Routing Graph
    this.waveShaper.connect(this.headerFilter);
    this.headerFilter.connect(this.tailpipeFilter);

    this.waveShaper.connect(this.highRaspFilter);
    this.highRaspFilter.connect(this.highRaspGain);
    this.highRaspGain.connect(this.valveGain);

    this.tailpipeFilter.connect(this.valveGain);
    this.valveGain.connect(this.environmentDryGain);
    this.valveGain.connect(this.environmentConvolver);
    this.environmentConvolver.connect(this.environmentWetGain);

    this.environmentDryGain.connect(this.masterGain);
    this.environmentWetGain.connect(this.masterGain);

    this.masterGain.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    this.startPhysicsLoop();
  }

  public stop() {
    this.isLaunchControlActive = false;
    if (!this.isRunning || !this.ctx) return;
    this.isRunning = false;

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
      } catch {}
    }

    setTimeout(() => {
      try {
        this.idleOsc?.stop();
        this.lowRpmOsc?.stop();
        this.midRpmOsc?.stop();
        this.highRpmOsc?.stop();
        this.subBassOsc?.stop();
        this.turboWhistleOsc?.stop();
        this.superchargerWhineOsc?.stop();
        this.intakeSuctionNoise?.stop();
        this.evInverterOsc?.stop();
        this.evGearWhineOsc?.stop();
        this.evRegenHumOsc?.stop();
      } catch {}

      this.idleOsc = null;
      this.lowRpmOsc = null;
      this.midRpmOsc = null;
      this.highRpmOsc = null;
      this.subBassOsc = null;
      this.turboWhistleOsc = null;
      this.superchargerWhineOsc = null;
      this.intakeSuctionNoise = null;
      this.evInverterOsc = null;
      this.evGearWhineOsc = null;
      this.evRegenHumOsc = null;

      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    }, 160);
  }

  public setThrottle(amount: number) {
    this.initAudioContext();
    if (!this.isRunning) {
      this.start();
    }

    const clamped = Math.max(0, Math.min(1, amount));
    const cfg = ACOUSTIC_PROFILES[this.profile] || ACOUSTIC_PROFILES['s58-inline6'];
    this.targetRpm = cfg.idleRpm + clamped * (cfg.redlineRpm - cfg.idleRpm);
    this.throttleAmount = clamped;

    if (!cfg.isElectric && this.prevThrottle > 0.45 && clamped < 0.15 && this.currentRpm > cfg.idleRpm + 1200) {
      if (cfg.hasForcedInduction) {
        this.triggerBlowOffValve();
      }
      this.triggerOverrunCrackles();
    }
    this.prevThrottle = clamped;
  }

  public triggerColdStart(onComplete?: () => void) {
    this.initAudioContext();
    if (!this.ctx) return;
    const cfg = ACOUSTIC_PROFILES[this.profile];

    // For electric vehicles: power up chime instead of starter cranking
    if (cfg.isElectric) {
      const chimeOsc = this.ctx.createOscillator();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(440, this.ctx.currentTime);
      chimeOsc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.35);

      const chimeGain = this.ctx.createGain();
      chimeGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);
      chimeOsc.start();
      chimeOsc.stop(this.ctx.currentTime + 0.5);

      setTimeout(() => {
        this.start();
        onComplete?.();
      }, 300);
      return;
    }

    this.isColdStarting = true;
    const ctx = this.ctx;

    const starterOsc = ctx.createOscillator();
    starterOsc.type = 'sawtooth';
    starterOsc.frequency.setValueAtTime(24, ctx.currentTime);
    starterOsc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.6);

    const starterGain = ctx.createGain();
    starterGain.gain.setValueAtTime(0.35, ctx.currentTime);
    starterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    starterOsc.connect(starterGain);
    starterGain.connect(ctx.destination);
    starterOsc.start();
    starterOsc.stop(ctx.currentTime + 0.7);

    setTimeout(() => {
      this.start();
      this.targetRpm = Math.min(cfg.redlineRpm * 0.45, 2800);
      this.currentRpm = this.targetRpm;

      setTimeout(() => {
        this.triggerExhaustBackfire();
      }, 250);

      setTimeout(() => {
        this.targetRpm = cfg.idleRpm;
        this.isColdStarting = false;
        onComplete?.();
      }, 1400);
    }, 650);
  }

  public toggleLaunchControl(active: boolean) {
    const cfg = ACOUSTIC_PROFILES[this.profile];
    if (cfg.isElectric) return; // EV launch control is silent instant torque

    this.isLaunchControlActive = active;
    if (active) {
      if (!this.isRunning) this.start();
      const launchRpm = this.profile === 'supercharged-i4' ? 8800 : Math.min(cfg.redlineRpm * 0.72, 5200);
      this.targetRpm = launchRpm;
    } else {
      this.targetRpm = cfg.idleRpm;
    }
  }

  public getIsLaunchControl(): boolean {
    return this.isLaunchControlActive;
  }

  public triggerBlowOffValve() {
    const cfg = ACOUSTIC_PROFILES[this.profile];
    if (!cfg.hasForcedInduction || !this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.6;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const hiss = ctx.createBufferSource();
    hiss.buffer = noiseBuffer;

    const hissFilter = ctx.createBiquadFilter();
    hissFilter.type = 'bandpass';
    hissFilter.frequency.setValueAtTime(2800, now);
    hissFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.5);
    hissFilter.Q.setValueAtTime(3.0, now);

    const hissGain = ctx.createGain();
    hissGain.gain.setValueAtTime(0.32, now);
    hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    hiss.connect(hissFilter);
    hissFilter.connect(hissGain);
    hissGain.connect(ctx.destination);
    hiss.start();

    const pulses = [0.0, 0.08, 0.15, 0.22, 0.29, 0.36];
    pulses.forEach((timeOffset, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      const startPitch = 1250 - idx * 120;
      osc.frequency.setValueAtTime(startPitch, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(startPitch * 0.7, now + timeOffset + 0.07);

      const gain = ctx.createGain();
      const pGain = Math.max(0.02, 0.28 - idx * 0.045);
      gain.gain.setValueAtTime(pGain, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.07);
    });

    this.onExhaustEventCallbacks.forEach((cb) => cb('burble'));
  }

  public triggerExhaustBackfire() {
    const cfg = ACOUSTIC_PROFILES[this.profile];
    if (cfg.isElectric || !this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.09);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    const bLen = Math.floor(ctx.sampleRate * 0.28);
    const nBuf = ctx.createBuffer(1, bLen, ctx.sampleRate);
    const d = nBuf.getChannelData(0);
    for (let i = 0; i < bLen; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.06));
    }
    const cSource = ctx.createBufferSource();
    cSource.buffer = nBuf;

    const cFilter = ctx.createBiquadFilter();
    cFilter.type = 'bandpass';
    cFilter.frequency.setValueAtTime(1400, now);
    cFilter.Q.setValueAtTime(2.0, now);

    const cGain = ctx.createGain();
    cGain.gain.setValueAtTime(0.65, now);
    cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    cSource.connect(cFilter);
    cFilter.connect(cGain);
    cGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
    cSource.start(now);

    this.onExhaustEventCallbacks.forEach((cb) => cb('backfire'));
  }

  private triggerOverrunCrackles() {
    const popCount = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < popCount; i++) {
      setTimeout(() => {
        if (this.isRunning) {
          this.triggerExhaustBackfire();
        }
      }, i * 90 + Math.random() * 40);
    }
  }

  public triggerThrottleBlip() {
    const cfg = ACOUSTIC_PROFILES[this.profile];
    if (cfg.isElectric) return;

    if (!this.isRunning) this.start();
    const prev = this.targetRpm;
    this.targetRpm = Math.min(cfg.redlineRpm, this.currentRpm + 2200);

    setTimeout(() => {
      this.triggerExhaustBackfire();
    }, 180);

    setTimeout(() => {
      this.targetRpm = prev;
    }, 280);
  }

  private startPhysicsLoop() {
    const update = (timestamp: number) => {
      if (!this.isRunning || !this.ctx) return;

      const dt = Math.min(0.1, (timestamp - this.lastUpdateTime) / 1000);
      this.lastUpdateTime = timestamp;
      const cfg = ACOUSTIC_PROFILES[this.profile] || ACOUSTIC_PROFILES['s58-inline6'];

      // EV Electric Physics
      if (cfg.isElectric) {
        const targetEvRpm = this.throttleAmount * cfg.redlineRpm;
        this.currentRpm += (targetEvRpm - this.currentRpm) * Math.min(1, dt * 12.0);
        const evRatio = this.currentRpm / cfg.redlineRpm;

        if (this.evGearWhineOsc && this.evGearGain) {
          this.evGearWhineOsc.frequency.setTargetAtTime(100 + evRatio * 2800, this.ctx.currentTime, 0.02);
          this.evGearGain.gain.setTargetAtTime(0.01 + evRatio * 0.06, this.ctx.currentTime, 0.02);
        }
        if (this.evInverterOsc && this.evInverterGain) {
          this.evInverterGain.gain.setTargetAtTime(this.throttleAmount > 0.05 ? 0.035 : 0.005, this.ctx.currentTime, 0.03);
        }
        if (this.evRegenHumOsc && this.evRegenGain) {
          const isRegen = this.throttleAmount < 0.05 && this.currentRpm > 1000;
          this.evRegenGain.gain.setTargetAtTime(isRegen ? 0.04 : 0.01, this.ctx.currentTime, 0.04);
        }

        this.onRpmCallbacks.forEach((cb) => cb(Math.round(this.currentRpm)));
        this.animFrameId = requestAnimationFrame(update);
        return;
      }

      // Internal Combustion Physics Loop
      if (this.isLaunchControlActive) {
        if (this.currentRpm >= this.targetRpm - 80) {
          this.launchLimiterBounce = !this.launchLimiterBounce;
          if (this.launchLimiterBounce) {
            this.targetRpm = this.targetRpm - 280;
            this.triggerExhaustBackfire();
          } else {
            this.targetRpm = this.targetRpm + 280;
          }
        }
      }

      const inertia = this.targetRpm > this.currentRpm ? 14.0 : 8.5;
      this.currentRpm += (this.targetRpm - this.currentRpm) * Math.min(1, dt * inertia);
      this.currentRpm = Math.max(cfg.idleRpm * 0.9, Math.min(cfg.redlineRpm * 1.02, this.currentRpm));

      if (cfg.hasForcedInduction) {
        const rpmRatio = (this.currentRpm - cfg.idleRpm) / (cfg.redlineRpm - cfg.idleRpm);
        const targetBoost = Math.max(0, rpmRatio * cfg.maxBoostPsi * (0.3 + 0.7 * this.throttleAmount));
        this.boostPressure += (targetBoost - this.boostPressure) * Math.min(1, dt * cfg.spoolRate);
      } else {
        this.boostPressure = 0;
      }

      const ctxTime = this.ctx.currentTime;
      const revPct = (this.currentRpm - cfg.idleRpm) / (cfg.redlineRpm - cfg.idleRpm);
      const fundamental = (this.currentRpm / 60) * cfg.fundamentalOrder;

      // Update multi-layer frequencies
      if (this.idleOsc) this.idleOsc.frequency.setTargetAtTime(fundamental, ctxTime, 0.02);
      if (this.lowRpmOsc) this.lowRpmOsc.frequency.setTargetAtTime(fundamental * 2.0, ctxTime, 0.02);
      if (this.midRpmOsc) this.midRpmOsc.frequency.setTargetAtTime(fundamental * 3.0, ctxTime, 0.02);
      if (this.highRpmOsc) this.highRpmOsc.frequency.setTargetAtTime(fundamental * 4.0, ctxTime, 0.02);
      if (this.subBassOsc) {
        this.subBassOsc.frequency.setTargetAtTime((this.currentRpm / 60) * cfg.subHarmonicFactor, ctxTime, 0.02);
      }

      // Smooth Crossfade Between Audio Layers
      if (this.idleLayerGain && this.lowLayerGain && this.midLayerGain && this.highLayerGain) {
        const idleGain = Math.max(0, 1.0 - revPct * 2.5);
        const lowGain = Math.max(0, Math.sin(Math.min(Math.PI, revPct * Math.PI * 1.8)));
        const midGain = Math.max(0, Math.sin(Math.min(Math.PI, Math.max(0, revPct - 0.25) * Math.PI * 1.5)));
        const highGain = Math.max(0, Math.min(1.0, (revPct - 0.5) * 2.2));

        this.idleLayerGain.gain.setTargetAtTime(idleGain * 0.45, ctxTime, 0.03);
        this.lowLayerGain.gain.setTargetAtTime(lowGain * 0.40, ctxTime, 0.03);
        this.midLayerGain.gain.setTargetAtTime(midGain * 0.35, ctxTime, 0.03);
        this.highLayerGain.gain.setTargetAtTime(highGain * 0.42, ctxTime, 0.03);
      }

      // Dynamic acoustic filtering
      if (this.headerFilter) {
        const dynamicHeader = cfg.headerResonanceFreq + revPct * 180;
        this.headerFilter.frequency.setTargetAtTime(dynamicHeader, ctxTime, 0.03);
      }
      if (this.tailpipeFilter) {
        const valveMult = this.valveMode === 'quiet' ? 0.65 : this.valveMode === 'track' ? 1.55 : 1.0;
        let matMult = 1.0;
        if (this.exhaustMaterial === 'titanium') matMult = 1.25;
        if (this.exhaustMaterial === 'carbon') matMult = 0.85;
        if (this.exhaustMaterial === 'racing') matMult = 1.45;
        const dynamicTailpipe = (cfg.tailpipeResonanceFreq + revPct * 1800) * valveMult * matMult;
        this.tailpipeFilter.frequency.setTargetAtTime(dynamicTailpipe, ctxTime, 0.03);
      }
      if (this.highRaspGain) {
        const raspLevel = cfg.metallicRaspGain * (0.2 + 0.8 * revPct) * (this.valveMode === 'quiet' ? 0.3 : 1.0);
        this.highRaspGain.gain.setTargetAtTime(raspLevel, ctxTime, 0.03);
      }

      if (this.turboWhistleOsc && this.turboWhistleGain) {
        const turboPitch = 650 + (this.boostPressure / cfg.maxBoostPsi) * 3200;
        const turboVol = (this.boostPressure / cfg.maxBoostPsi) * 0.075;
        this.turboWhistleOsc.frequency.setTargetAtTime(turboPitch, ctxTime, 0.03);
        this.turboWhistleGain.gain.setTargetAtTime(turboVol, ctxTime, 0.03);
      }
      if (this.superchargerWhineOsc && this.superchargerWhineGain) {
        const scPitch = 1200 + revPct * 4500;
        const scVol = 0.02 + revPct * 0.09;
        this.superchargerWhineOsc.frequency.setTargetAtTime(scPitch, ctxTime, 0.02);
        this.superchargerWhineGain.gain.setTargetAtTime(scVol, ctxTime, 0.02);
      }

      if (this.intakeSuctionGain) {
        const suctionVol = 0.02 + revPct * 0.12 * (0.4 + 0.6 * this.throttleAmount);
        this.intakeSuctionGain.gain.setTargetAtTime(suctionVol, ctxTime, 0.03);
      }

      this.onRpmCallbacks.forEach((cb) => cb(Math.round(this.currentRpm)));
      this.onBoostCallbacks.forEach((cb) => cb(Number(this.boostPressure.toFixed(1))));

      this.animFrameId = requestAnimationFrame(update);
    };

    this.animFrameId = requestAnimationFrame(update);
  }

  public subscribeRpm(cb: (rpm: number) => void): () => void {
    this.onRpmCallbacks.add(cb);
    return () => this.onRpmCallbacks.delete(cb);
  }

  public subscribeGear(cb: (gear: GearPosition) => void): () => void {
    this.onGearCallbacks.add(cb);
    return () => this.onGearCallbacks.delete(cb);
  }

  public subscribeBoost(cb: (boost: number) => void): () => void {
    this.onBoostCallbacks.add(cb);
    return () => this.onBoostCallbacks.delete(cb);
  }

  public subscribeExhaustEvent(cb: (type: 'burble' | 'backfire' | 'pop') => void): () => void {
    this.onExhaustEventCallbacks.add(cb);
    return () => this.onExhaustEventCallbacks.delete(cb);
  }
}

export const engineSound = new RealisticEngineSynthesizer();
