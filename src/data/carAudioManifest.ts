/**
 * REV THE BEAST — VEHICLE AUDIO ASSET & SYNTHESIS MANIFEST
 * 
 * Strict Audio Architecture & Licensing Compliance:
 * - Documents authentic acoustic source specifications and real-time physical modeling synthesis for every vehicle.
 * - Explicitly identifies procedural Web Audio API harmonic synthesis approximations vs authentic physical recordings.
 * - Every vehicle configuration provides distinct audio behavior across Startup, Idle, Low RPM, Mid RPM, High RPM,
 *   Gear Shift, Exhaust Overrun Pops, Engine Shutdown, and Forced Induction (Turbo / Supercharger / Inverter).
 */

import { CarModelType, EngineSoundProfile, TurboBovStyle } from '../types';

export interface VehicleAudioAssetConfig {
  carId: CarModelType;
  carName: string;
  manufacturer: string;
  soundProfile: EngineSoundProfile;
  isSynthesizedApproximation: boolean;
  audioEngineType: 'Procedural Harmonic Physical Modeling' | 'Electric Inverter Carrier Synthesis' | 'Authentic Studio Acoustic Capture';
  sourceAndLicensing: {
    engineOrigin: string;
    acousticDesigner: string;
    licensingTerms: string;
    audioPipeline: string;
  };
  audioRoutines: {
    startup: {
      type: 'starter-crank-flare';
      crankDurationMs: number;
      flareRpm: number;
      flareTone: string;
    };
    idle: {
      idleRpm: number;
      dominantHarmonicHz: number;
      lopeCharacteristics: string;
    };
    lowRpm: {
      rangeRpm: [number, number];
      resonanceHz: number;
      subBassGain: number;
    };
    midRpm: {
      rangeRpm: [number, number];
      intakeRoarHz: number;
      raspGain: number;
    };
    highRpm: {
      rangeRpm: [number, number];
      screamingOrder: number;
      redlineHarmonics: string;
    };
    gearShift: {
      ignitionCutMs: number;
      backfireProbability: number;
      blipThrottleDeltaRpm: number;
    };
    exhaustOverrun: {
      backfireStyle: 'gunshot' | 'flame-crackle' | 'bavarian-burble' | 'supercar-flame' | 'none';
      flameTriggerAllowed: boolean;
    };
    shutdown: {
      decompressionMs: number;
      chuffFrequencyHz: number;
    };
    forcedInduction: {
      hasTurbo: boolean;
      hasSupercharger: boolean;
      turboBovStyle?: TurboBovStyle;
      maxBoostPsi?: number;
      spoolTone?: string;
    };
  };
}

export const CAR_AUDIO_MANIFEST: Record<CarModelType, VehicleAudioAssetConfig> = {
  'lambo-aventador': {
    carId: 'lambo-aventador',
    carName: 'Lamborghini Aventador SVJ',
    manufacturer: 'Automobili Lamborghini S.p.A.',
    soundProfile: 'v12-symphony',
    isSynthesizedApproximation: true,
    audioEngineType: 'Procedural Harmonic Physical Modeling',
    sourceAndLicensing: {
      engineOrigin: '6.5L L539 60° Naturally Aspirated V12 (Sant\'Agata Bolognese)',
      acousticDesigner: 'REV THE BEAST Audio Engineering Team',
      licensingTerms: 'Synthesized Procedural Web Audio API — Royalty-Free / Zero-Copyright Claim / Client-Side Real-Time Synthesis',
      audioPipeline: 'Multi-harmonic 6th-order Chebyshev polynomial wave shaping + titanium exhaust cavity resonant formants',
    },
    audioRoutines: {
      startup: {
        type: 'starter-crank-flare',
        crankDurationMs: 650,
        flareRpm: 3200,
        flareTone: 'High-pitch V12 starter whirr bursting into an authoritative 3,200 RPM flare',
      },
      idle: {
        idleRpm: 850,
        dominantHarmonicHz: 85,
        lopeCharacteristics: 'Rhythmic, smooth mechanical valve ticking with deep 12-cylinder idle resonance',
      },
      lowRpm: {
        rangeRpm: [850, 3500],
        resonanceHz: 190,
        subBassGain: 0.85,
      },
      midRpm: {
        rangeRpm: [3500, 6500],
        intakeRoarHz: 520,
        raspGain: 0.80,
      },
      highRpm: {
        rangeRpm: [6500, 8700],
        screamingOrder: 6.0,
        redlineHarmonics: 'Searing high-frequency metallic Italian V12 howl at 8,700 RPM',
      },
      gearShift: {
        ignitionCutMs: 90,
        backfireProbability: 0.85,
        blipThrottleDeltaRpm: 2400,
      },
      exhaustOverrun: {
        backfireStyle: 'supercar-flame',
        flameTriggerAllowed: true,
      },
      shutdown: {
        decompressionMs: 950,
        chuffFrequencyHz: 45,
      },
      forcedInduction: {
        hasTurbo: false,
        hasSupercharger: false,
      },
    },
  },

  'procedural-m4': {
    carId: 'procedural-m4',
    carName: 'BMW M4 Competition G82',
    manufacturer: 'BMW M GmbH',
    soundProfile: 's58-inline6',
    isSynthesizedApproximation: true,
    audioEngineType: 'Procedural Harmonic Physical Modeling',
    sourceAndLicensing: {
      engineOrigin: '3.0L S58 TwinPower Turbo Inline-6 (Munich, Germany)',
      acousticDesigner: 'REV THE BEAST Audio Engineering Team',
      licensingTerms: 'Synthesized Procedural Web Audio API — Royalty-Free / Zero-Copyright Claim',
      audioPipeline: '3rd-order harmonic inline-6 acoustic balance + singing twin mono-scroll turbo spool whistle',
    },
    audioRoutines: {
      startup: {
        type: 'starter-crank-flare',
        crankDurationMs: 500,
        flareRpm: 2400,
        flareTone: 'Crisp starter pulse followed by a sharp cold-start catalyst heating bark',
      },
      idle: {
        idleRpm: 800,
        dominantHarmonicHz: 40,
        lopeCharacteristics: 'Perfect primary and secondary engine balance with zero crank shake',
      },
      lowRpm: {
        rangeRpm: [800, 3000],
        resonanceHz: 165,
        subBassGain: 0.70,
      },
      midRpm: {
        rangeRpm: [3000, 5500],
        intakeRoarHz: 380,
        raspGain: 0.72,
      },
      highRpm: {
        rangeRpm: [5500, 7200],
        screamingOrder: 3.0,
        redlineHarmonics: 'Sharp, metallic Bavarian inline-6 roar with twin-turbo whistle',
      },
      gearShift: {
        ignitionCutMs: 70,
        backfireProbability: 0.75,
        blipThrottleDeltaRpm: 2000,
      },
      exhaustOverrun: {
        backfireStyle: 'bavarian-burble',
        flameTriggerAllowed: true,
      },
      shutdown: {
        decompressionMs: 800,
        chuffFrequencyHz: 40,
      },
      forcedInduction: {
        hasTurbo: true,
        hasSupercharger: false,
        turboBovStyle: 'wrc-flutter',
        maxBoostPsi: 24.7,
        spoolTone: 'High-frequency ceramic twin-turbo spool singing above 2,800 RPM',
      },
    },
  },

  'mustang-gt': {
    carId: 'mustang-gt',
    carName: 'Ford Mustang Dark Horse GT',
    manufacturer: 'Ford Motor Company',
    soundProfile: 'coyote-v8',
    isSynthesizedApproximation: true,
    audioEngineType: 'Procedural Harmonic Physical Modeling',
    sourceAndLicensing: {
      engineOrigin: '5.0L Coyote Cross-Plane DOHC 32V V8 (Flat Rock, Michigan)',
      acousticDesigner: 'REV THE BEAST Audio Engineering Team',
      licensingTerms: 'Synthesized Procedural Web Audio API — Royalty-Free / Zero-Copyright Claim',
      audioPipeline: 'Cross-plane 90° firing intervals generating authentic American muscle V8 bass lope',
    },
    audioRoutines: {
      startup: {
        type: 'starter-crank-flare',
        crankDurationMs: 750,
        flareRpm: 2600,
        flareTone: 'Heavy high-torque starter thump followed by deep thunderous cross-plane rumble',
      },
      idle: {
        idleRpm: 680,
        dominantHarmonicHz: 45,
        lopeCharacteristics: 'Iconic uneven cam lope with visceral chest-thumping bass exhaust pulses',
      },
      lowRpm: {
        rangeRpm: [680, 2800],
        resonanceHz: 110,
        subBassGain: 0.98,
      },
      midRpm: {
        rangeRpm: [2800, 5200],
        intakeRoarHz: 260,
        raspGain: 0.35,
      },
      highRpm: {
        rangeRpm: [5200, 7500],
        screamingOrder: 4.0,
        redlineHarmonics: 'Roaring, earth-shaking American muscle crescendo at 7,500 RPM',
      },
      gearShift: {
        ignitionCutMs: 110,
        backfireProbability: 0.60,
        blipThrottleDeltaRpm: 1800,
      },
      exhaustOverrun: {
        backfireStyle: 'gunshot',
        flameTriggerAllowed: true,
      },
      shutdown: {
        decompressionMs: 1100,
        chuffFrequencyHz: 35,
      },
      forcedInduction: {
        hasTurbo: false,
        hasSupercharger: false,
      },
    },
  },

  'ferrari-sf90': {
    carId: 'ferrari-sf90',
    carName: 'Ferrari SF90 Stradale',
    manufacturer: 'Ferrari N.V.',
    soundProfile: 'ferrari-v8',
    isSynthesizedApproximation: true,
    audioEngineType: 'Procedural Harmonic Physical Modeling',
    sourceAndLicensing: {
      engineOrigin: '4.0L F154 FA 90° Twin-Turbo Flat-Plane V8 (Maranello, Italy)',
      acousticDesigner: 'REV THE BEAST Audio Engineering Team',
      licensingTerms: 'Synthesized Procedural Web Audio API — Royalty-Free / Zero-Copyright Claim',
      audioPipeline: '180° Flat-plane crank acoustics (behaves as two I4s) + rapid spool twin turbochargers',
    },
    audioRoutines: {
      startup: {
        type: 'starter-crank-flare',
        crankDurationMs: 400,
        flareRpm: 3400,
        flareTone: 'Electric RAC-e motor rotation followed by explosive flat-plane combustion flare',
      },
      idle: {
        idleRpm: 900,
        dominantHarmonicHz: 60,
        lopeCharacteristics: 'Taut, high-frequency flat-plane vibration like an F1 car at warm idle',
      },
      lowRpm: {
        rangeRpm: [900, 3200],
        resonanceHz: 180,
        subBassGain: 0.75,
      },
      midRpm: {
        rangeRpm: [3200, 6000],
        intakeRoarHz: 460,
        raspGain: 0.82,
      },
      highRpm: {
        rangeRpm: [6000, 8000],
        screamingOrder: 4.0,
        redlineHarmonics: 'Piercing, laser-sharp Maranello flat-plane scream at 8,000 RPM',
      },
      gearShift: {
        ignitionCutMs: 45,
        backfireProbability: 0.90,
        blipThrottleDeltaRpm: 2600,
      },
      exhaustOverrun: {
        backfireStyle: 'supercar-flame',
        flameTriggerAllowed: true,
      },
      shutdown: {
        decompressionMs: 850,
        chuffFrequencyHz: 50,
      },
      forcedInduction: {
        hasTurbo: true,
        hasSupercharger: false,
        turboBovStyle: 'tial-vent',
        maxBoostPsi: 23.2,
      },
    },
  },

  'bugatti-chiron': {
    carId: 'bugatti-chiron',
    carName: 'Bugatti Chiron Super Sport',
    manufacturer: 'Bugatti Automobiles S.A.S.',
    soundProfile: 'bugatti-w16',
    isSynthesizedApproximation: true,
    audioEngineType: 'Procedural Harmonic Physical Modeling',
    sourceAndLicensing: {
      engineOrigin: '8.0L Quad-Turbocharged 64V W16 (Molsheim, France)',
      acousticDesigner: 'REV THE BEAST Audio Engineering Team',
      licensingTerms: 'Synthesized Procedural Web Audio API — Royalty-Free / Zero-Copyright Claim',
      audioPipeline: 'Dual-VR8 16-cylinder harmonic matrix + quad-stage sequential turbochargers',
    },
    audioRoutines: {
      startup: {
        type: 'starter-crank-flare',
        crankDurationMs: 850,
        flareRpm: 2500,
        flareTone: 'Massive turbine-like starter rotation followed by a low-frequency tectonic earthquake',
      },
      idle: {
        idleRpm: 750,
        dominantHarmonicHz: 100,
        lopeCharacteristics: 'Infrasonic bass pressure with seamless 16-cylinder ignition overlap',
      },
      lowRpm: {
        rangeRpm: [750, 3000],
        resonanceHz: 95,
        subBassGain: 1.0,
      },
      midRpm: {
        rangeRpm: [3000, 5200],
        intakeRoarHz: 340,
        raspGain: 0.50,
      },
      highRpm: {
        rangeRpm: [5200, 7100],
        screamingOrder: 8.0,
        redlineHarmonics: 'Deafening jet-engine roar combining quad turbos with 1,600 horsepower thrust',
      },
      gearShift: {
        ignitionCutMs: 65,
        backfireProbability: 0.70,
        blipThrottleDeltaRpm: 1900,
      },
      exhaustOverrun: {
        backfireStyle: 'flame-crackle',
        flameTriggerAllowed: true,
      },
      shutdown: {
        decompressionMs: 1200,
        chuffFrequencyHz: 30,
      },
      forcedInduction: {
        hasTurbo: true,
        hasSupercharger: false,
        turboBovStyle: 'greddy-surge',
        maxBoostPsi: 40.6,
      },
    },
  },

  'nissan-gtr-r35': {
    carId: 'nissan-gtr-r35',
    carName: 'Nissan GT-R Nismo (R35)',
    manufacturer: 'Nissan Motor Co., Ltd.',
    soundProfile: 'vr38-twin-turbo',
    isSynthesizedApproximation: true,
    audioEngineType: 'Procedural Harmonic Physical Modeling',
    sourceAndLicensing: {
      engineOrigin: '3.8L VR38DETT Twin-Turbocharged V6 (Takumi Cleanroom, Yokohama)',
      acousticDesigner: 'REV THE BEAST Audio Engineering Team',
      licensingTerms: 'Synthesized Procedural Web Audio API — Royalty-Free / Zero-Copyright Claim',
      audioPipeline: '60° V6 harmonic intervals + IHI twin turbochargers + Fujitsubo titanium exhaust',
    },
    audioRoutines: {
      startup: {
        type: 'starter-crank-flare',
        crankDurationMs: 550,
        flareRpm: 2700,
        flareTone: 'Sharp starter engagement with distinctive Japanese Takumi twin-turbo ignition bark',
      },
      idle: {
        idleRpm: 750,
        dominantHarmonicHz: 38,
        lopeCharacteristics: 'Crisp mechanical valvetrain tick with tight twin-pipe exhaust heartbeat',
      },
      lowRpm: {
        rangeRpm: [750, 2800],
        resonanceHz: 180,
        subBassGain: 0.82,
      },
      midRpm: {
        rangeRpm: [2800, 5400],
        intakeRoarHz: 410,
        raspGain: 0.70,
      },
      highRpm: {
        rangeRpm: [5400, 7200],
        screamingOrder: 3.0,
        redlineHarmonics: 'Aggressive Japanese twin-turbo V6 metallic roar at 7,200 RPM redline',
      },
      gearShift: {
        ignitionCutMs: 60,
        backfireProbability: 0.80,
        blipThrottleDeltaRpm: 2100,
      },
      exhaustOverrun: {
        backfireStyle: 'flame-crackle',
        flameTriggerAllowed: true,
      },
      shutdown: {
        decompressionMs: 850,
        chuffFrequencyHz: 42,
      },
      forcedInduction: {
        hasTurbo: true,
        hasSupercharger: false,
        turboBovStyle: 'hks-ssqv',
        maxBoostPsi: 21.8,
      },
    },
  },

  'ninja-h2r': {
    carId: 'ninja-h2r',
    carName: 'Kawasaki Ninja H2R',
    manufacturer: 'Kawasaki Heavy Industries',
    soundProfile: 'supercharged-i4',
    isSynthesizedApproximation: true,
    audioEngineType: 'Procedural Harmonic Physical Modeling',
    sourceAndLicensing: {
      engineOrigin: '998cc Supercharged Inline-4 (Akashi, Japan)',
      acousticDesigner: 'REV THE BEAST Audio Engineering Team',
      licensingTerms: 'Synthesized Procedural Web Audio API — Royalty-Free / Zero-Copyright Claim',
      audioPipeline: 'Planetary gear centrifugal supercharger spinning at 130,000 RPM + screaming 14,000 RPM redline',
    },
    audioRoutines: {
      startup: {
        type: 'starter-crank-flare',
        crankDurationMs: 350,
        flareRpm: 4000,
        flareTone: 'Instant high-compression motorcycle starter burst into a high-pitched supercharger whistle',
      },
      idle: {
        idleRpm: 1350,
        dominantHarmonicHz: 90,
        lopeCharacteristics: 'Rapid superbike mechanical idle with distinct planetary supercharger gear whine',
      },
      lowRpm: {
        rangeRpm: [1350, 5000],
        resonanceHz: 250,
        subBassGain: 0.50,
      },
      midRpm: {
        rangeRpm: [5000, 9500],
        intakeRoarHz: 620,
        raspGain: 0.85,
      },
      highRpm: {
        rangeRpm: [9500, 14000],
        screamingOrder: 2.0,
        redlineHarmonics: 'Deafening F1-style 14,000 RPM superbike scream with high-pressure supercharger boost',
      },
      gearShift: {
        ignitionCutMs: 35,
        backfireProbability: 0.95,
        blipThrottleDeltaRpm: 3200,
      },
      exhaustOverrun: {
        backfireStyle: 'gunshot',
        flameTriggerAllowed: true,
      },
      shutdown: {
        decompressionMs: 650,
        chuffFrequencyHz: 60,
      },
      forcedInduction: {
        hasTurbo: false,
        hasSupercharger: true,
        maxBoostPsi: 20.5,
      },
    },
  },

  'gwagon-g63': {
    carId: 'gwagon-g63',
    carName: 'Mercedes-AMG G63',
    manufacturer: 'Mercedes-AMG GmbH',
    soundProfile: 'amg-v8',
    isSynthesizedApproximation: true,
    audioEngineType: 'Procedural Harmonic Physical Modeling',
    sourceAndLicensing: {
      engineOrigin: '4.0L M177 BiTurbo Hot-V V8 (Affalterbach, Germany)',
      acousticDesigner: 'REV THE BEAST Audio Engineering Team',
      licensingTerms: 'Synthesized Procedural Web Audio API — Royalty-Free / Zero-Copyright Claim',
      audioPipeline: 'Hot-inside-V turbo layout exiting through side exhaust pipes right beneath the passenger doors',
    },
    audioRoutines: {
      startup: {
        type: 'starter-crank-flare',
        crankDurationMs: 600,
        flareRpm: 2300,
        flareTone: 'Guttural side-pipe starter bark resonating off surrounding pavement',
      },
      idle: {
        idleRpm: 700,
        dominantHarmonicHz: 47,
        lopeCharacteristics: 'Heavy, throbbing German V8 side-pipe rumble',
      },
      lowRpm: {
        rangeRpm: [700, 2800],
        resonanceHz: 125,
        subBassGain: 0.92,
      },
      midRpm: {
        rangeRpm: [2800, 5000],
        intakeRoarHz: 310,
        raspGain: 0.60,
      },
      highRpm: {
        rangeRpm: [5000, 6800],
        screamingOrder: 4.0,
        redlineHarmonics: 'Thunderous AMG acoustic roar with heavy twin-turbo boost',
      },
      gearShift: {
        ignitionCutMs: 80,
        backfireProbability: 0.70,
        blipThrottleDeltaRpm: 1900,
      },
      exhaustOverrun: {
        backfireStyle: 'flame-crackle',
        flameTriggerAllowed: true,
      },
      shutdown: {
        decompressionMs: 1000,
        chuffFrequencyHz: 38,
      },
      forcedInduction: {
        hasTurbo: true,
        hasSupercharger: false,
        turboBovStyle: 'wrc-flutter',
        maxBoostPsi: 18.9,
      },
    },
  },

  'bmw-5series': {
    carId: 'bmw-5series',
    carName: 'BMW M5 Competition F90',
    manufacturer: 'BMW M GmbH',
    soundProfile: 'amg-v8',
    isSynthesizedApproximation: true,
    audioEngineType: 'Procedural Harmonic Physical Modeling',
    sourceAndLicensing: {
      engineOrigin: '4.4L S63B44T4 Twin-Scroll BiTurbo V8 (Dingolfing, Germany)',
      acousticDesigner: 'REV THE BEAST Audio Engineering Team',
      licensingTerms: 'Synthesized Procedural Web Audio API — Royalty-Free / Zero-Copyright Claim',
      audioPipeline: 'Cross-bank exhaust manifold connecting to twin twin-scroll turbochargers',
    },
    audioRoutines: {
      startup: {
        type: 'starter-crank-flare',
        crankDurationMs: 520,
        flareRpm: 2200,
        flareTone: 'Sophisticated executive starter tone opening into an aggressive dual-valve exhaust rumble',
      },
      idle: {
        idleRpm: 720,
        dominantHarmonicHz: 48,
        lopeCharacteristics: 'Controlled, ultra-refined executive sports sedan idle rhythm',
      },
      lowRpm: {
        rangeRpm: [720, 2600],
        resonanceHz: 135,
        subBassGain: 0.88,
      },
      midRpm: {
        rangeRpm: [2600, 5200],
        intakeRoarHz: 320,
        raspGain: 0.65,
      },
      highRpm: {
        rangeRpm: [5200, 7000],
        screamingOrder: 4.0,
        redlineHarmonics: 'Violent high-speed autobahn V8 wail with rapid 8-speed M Steptronic shifts',
      },
      gearShift: {
        ignitionCutMs: 60,
        backfireProbability: 0.85,
        blipThrottleDeltaRpm: 2000,
      },
      exhaustOverrun: {
        backfireStyle: 'bavarian-burble',
        flameTriggerAllowed: true,
      },
      shutdown: {
        decompressionMs: 900,
        chuffFrequencyHz: 42,
      },
      forcedInduction: {
        hasTurbo: true,
        hasSupercharger: false,
        turboBovStyle: 'wrc-flutter',
        maxBoostPsi: 21.0,
      },
    },
  },

  're-gt650': {
    carId: 're-gt650',
    carName: 'Royal Enfield Continental GT 650',
    manufacturer: 'Royal Enfield',
    soundProfile: 'parallel-twin-270',
    isSynthesizedApproximation: true,
    audioEngineType: 'Procedural Harmonic Physical Modeling',
    sourceAndLicensing: {
      engineOrigin: '648cc Parallel Twin 270° Crank (Bruntingthorpe / Chennai)',
      acousticDesigner: 'REV THE BEAST Audio Engineering Team',
      licensingTerms: 'Synthesized Procedural Web Audio API — Royalty-Free / Zero-Copyright Claim',
      audioPipeline: '270-degree cross-plane crank firing order with tuned megaphone exhaust acoustics',
    },
    audioRoutines: {
      startup: {
        type: 'starter-crank-flare',
        crankDurationMs: 450,
        flareRpm: 2100,
        flareTone: 'Classic British cafe racer starter whirr followed by warm twin exhaust chuff',
      },
      idle: {
        idleRpm: 1200,
        dominantHarmonicHz: 40,
        lopeCharacteristics: 'Rhythmic, syncopated 270-degree heartbeat thump with distinct valve clatter',
      },
      lowRpm: {
        rangeRpm: [1200, 3500],
        resonanceHz: 140,
        subBassGain: 0.80,
      },
      midRpm: {
        rangeRpm: [3500, 5800],
        intakeRoarHz: 280,
        raspGain: 0.55,
      },
      highRpm: {
        rangeRpm: [5800, 7500],
        screamingOrder: 1.0,
        redlineHarmonics: 'Throaty, full-bodied twin-cylinder wail with megaphone exhaust resonance',
      },
      gearShift: {
        ignitionCutMs: 120,
        backfireProbability: 0.40,
        blipThrottleDeltaRpm: 1500,
      },
      exhaustOverrun: {
        backfireStyle: 'flame-crackle',
        flameTriggerAllowed: false,
      },
      shutdown: {
        decompressionMs: 700,
        chuffFrequencyHz: 30,
      },
      forcedInduction: {
        hasTurbo: false,
        hasSupercharger: false,
      },
    },
  },

  're-shotgun650': {
    carId: 're-shotgun650',
    carName: 'Royal Enfield Shotgun 650',
    manufacturer: 'Royal Enfield',
    soundProfile: 'custom-bobber-twin',
    isSynthesizedApproximation: true,
    audioEngineType: 'Procedural Harmonic Physical Modeling',
    sourceAndLicensing: {
      engineOrigin: '648cc Custom Bobber 270° Twin',
      acousticDesigner: 'REV THE BEAST Audio Engineering Team',
      licensingTerms: 'Synthesized Procedural Web Audio API — Royalty-Free / Zero-Copyright Claim',
      audioPipeline: 'Shortened pea-shooter blacked-out exhausts with throatier low-frequency bass',
    },
    audioRoutines: {
      startup: {
        type: 'starter-crank-flare',
        crankDurationMs: 450,
        flareRpm: 2000,
        flareTone: 'Deep bobber starter crank into low-frequency bass burble',
      },
      idle: {
        idleRpm: 1150,
        dominantHarmonicHz: 38,
        lopeCharacteristics: 'Sub-bass bobber thump with raw mechanical valve tick',
      },
      lowRpm: {
        rangeRpm: [1150, 3200],
        resonanceHz: 130,
        subBassGain: 0.88,
      },
      midRpm: {
        rangeRpm: [3200, 5600],
        intakeRoarHz: 260,
        raspGain: 0.50,
      },
      highRpm: {
        rangeRpm: [5600, 7500],
        screamingOrder: 1.0,
        redlineHarmonics: 'Heavy, resonant twin-pipe roar echoing off urban walls',
      },
      gearShift: {
        ignitionCutMs: 110,
        backfireProbability: 0.45,
        blipThrottleDeltaRpm: 1400,
      },
      exhaustOverrun: {
        backfireStyle: 'flame-crackle',
        flameTriggerAllowed: false,
      },
      shutdown: {
        decompressionMs: 750,
        chuffFrequencyHz: 28,
      },
      forcedInduction: {
        hasTurbo: false,
        hasSupercharger: false,
      },
    },
  },

  'beast-v12-ai': {
    carId: 'beast-v12-ai',
    carName: 'Beast V12 Proto-X',
    manufacturer: 'REV THE BEAST Motorsport Engineering',
    soundProfile: 'v12-symphony',
    isSynthesizedApproximation: true,
    audioEngineType: 'Procedural Harmonic Physical Modeling',
    sourceAndLicensing: {
      engineOrigin: '6.5L Ultra-High-Rev Naturally Aspirated 60° V12 Prototype',
      acousticDesigner: 'REV THE BEAST Audio Engineering Team',
      licensingTerms: 'Synthesized Procedural Web Audio API — Royalty-Free / Zero-Copyright Claim',
      audioPipeline: 'Inconel equal-length long-tube headers with straight titanium race decat pipes',
    },
    audioRoutines: {
      startup: {
        type: 'starter-crank-flare',
        crankDurationMs: 500,
        flareRpm: 3800,
        flareTone: 'Lightning-fast pneumatic starter bursting into a searing 3,800 RPM blue-flame roar',
      },
      idle: {
        idleRpm: 850,
        dominantHarmonicHz: 85,
        lopeCharacteristics: 'Aggressive race-cam lobe overlap with razor-sharp throttle responsiveness',
      },
      lowRpm: {
        rangeRpm: [850, 3800],
        resonanceHz: 210,
        subBassGain: 0.90,
      },
      midRpm: {
        rangeRpm: [3800, 6800],
        intakeRoarHz: 540,
        raspGain: 0.88,
      },
      highRpm: {
        rangeRpm: [6800, 9200],
        screamingOrder: 6.0,
        redlineHarmonics: 'Ear-splitting, harmonic F1 V12 scream at 9,200 RPM with gunshot shift cuts',
      },
      gearShift: {
        ignitionCutMs: 40,
        backfireProbability: 0.98,
        blipThrottleDeltaRpm: 2800,
      },
      exhaustOverrun: {
        backfireStyle: 'gunshot',
        flameTriggerAllowed: true,
      },
      shutdown: {
        decompressionMs: 900,
        chuffFrequencyHz: 48,
      },
      forcedInduction: {
        hasTurbo: false,
        hasSupercharger: false,
      },
    },
  },

  'beast-ev': {
    carId: 'beast-ev',
    carName: 'Beast Volt Hyperdrive',
    manufacturer: 'REV THE BEAST Electric Powertrain Systems',
    soundProfile: 'electric-motor',
    isSynthesizedApproximation: true,
    audioEngineType: 'Electric Inverter Carrier Synthesis',
    sourceAndLicensing: {
      engineOrigin: 'Quad Axial-Flux 800V Silicon Carbide Inverter Electric Drive',
      acousticDesigner: 'REV THE BEAST Audio Engineering Team',
      licensingTerms: 'Synthesized Procedural Web Audio API — Royalty-Free / Zero-Copyright Claim',
      audioPipeline: 'High-frequency IGBT switching wave carrier (12 kHz) + planetary gear reduction harmonics',
    },
    audioRoutines: {
      startup: {
        type: 'starter-crank-flare',
        crankDurationMs: 200,
        flareRpm: 1000,
        flareTone: 'Dual high-voltage contactor click followed by a futuristic rising magnetic chime',
      },
      idle: {
        idleRpm: 0,
        dominantHarmonicHz: 0,
        lopeCharacteristics: 'Silent zero-emission stillness with subtle cooling fan whisper',
      },
      lowRpm: {
        rangeRpm: [0, 4000],
        resonanceHz: 300,
        subBassGain: 0.30,
      },
      midRpm: {
        rangeRpm: [4000, 12000],
        intakeRoarHz: 0,
        raspGain: 0.0,
      },
      highRpm: {
        rangeRpm: [12000, 20000],
        screamingOrder: 0,
        redlineHarmonics: 'Screaming 12,000Hz magnetic inverter carrier whine resembling a sci-fi hyperdrive',
      },
      gearShift: {
        ignitionCutMs: 0,
        backfireProbability: 0.0,
        blipThrottleDeltaRpm: 0,
      },
      exhaustOverrun: {
        backfireStyle: 'none',
        flameTriggerAllowed: false,
      },
      shutdown: {
        decompressionMs: 400,
        chuffFrequencyHz: 1200,
      },
      forcedInduction: {
        hasTurbo: false,
        hasSupercharger: false,
      },
    },
  },
};

export function getAudioManifestForCar(carId: CarModelType): VehicleAudioAssetConfig {
  return CAR_AUDIO_MANIFEST[carId] || CAR_AUDIO_MANIFEST['procedural-m4'];
}
