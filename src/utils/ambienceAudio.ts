/**
 * High-Fidelity Procedural Web Audio Environment Ambience Synthesizer
 * 
 * Supports responsive, reactive soundscapes for vehicle environments:
 * - 'city' & 'neon-city': Urban traffic flow rumble, periodic Doppler passing car whooshes, distant dual-tone vehicle horns, high-rise air buffeting
 * - 'race-track' & 'nurburgring-dusk': Circuit grandstand wind, screaming 280km/h GT car Doppler flybys, pit lane pneumatic wheel gun air wrenches, apex kerb rumble
 * - 'tokyo-highway': Elevated expressway concrete resonance, wet asphalt tire spray hiss, passing turbo spool whooshes
 * - 'monaco-tunnel': Enclosed concrete tunnel reverb, reverberant hollow engine echo, harbor air
 * - 'showroom': High-end luxury dealership quietude, whisper-quiet climate control HVAC hum, pristine room presence
 * - 'hypercar-vault': Sterile cleanroom air filtration rush, sub-bass 50Hz transformer hum, pneumatic pressure drops
 * - 'sunset' / 'dubai-skyline' / 'dark-studio': Warm dusk outdoor breeze, desert highway horizon
 */

import { StudioEnvironment } from '../types';

export interface AmbienceState {
  isPlaying: boolean;
  environment: StudioEnvironment;
  volume: number; // 0.0 to 1.0
  activeEvent: string | null;
}

class AmbienceAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentEnv: StudioEnvironment = 'showroom';
  private volume: number = 0.55;
  private isPlaying: boolean = false;

  // Active audio nodes tracking for clean crossfades
  private activeNodes: AudioNode[] = [];
  private activeIntervals: number[] = [];
  private crossfadeGain: GainNode | null = null;

  // Event callbacks for UI reaction
  private stateSubscribers: Set<(state: AmbienceState) => void> = new Set();
  private lastEvent: string | null = null;
  private lastEventTimer: number | null = null;

  constructor() {
    // Audio context is lazily initialized on user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  /**
   * Generates a loopable audio buffer containing custom colored noise (pink, brown, or white)
   */
  private createNoiseBuffer(type: 'pink' | 'brown' | 'white' = 'pink', durationSec = 4): AudioBuffer {
    if (!this.ctx) throw new Error('No AudioContext');
    const bufferSize = this.ctx.sampleRate * durationSec;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
    let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;
    let lastOutL = 0;
    let lastOutR = 0;

    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;

      if (type === 'pink') {
        // Paul Kellet's pink noise algorithm
        b0L = 0.99886 * b0L + whiteL * 0.0555179;
        b1L = 0.99332 * b1L + whiteL * 0.0750759;
        b2L = 0.96900 * b2L + whiteL * 0.1538520;
        b3L = 0.86650 * b3L + whiteL * 0.3104856;
        b4L = 0.55000 * b4L + whiteL * 0.5329522;
        b5L = -0.7616 * b5L - whiteL * 0.0168980;
        left[i] = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362) * 0.11;
        b6L = whiteL * 0.115926;

        b0R = 0.99886 * b0R + whiteR * 0.0555179;
        b1R = 0.99332 * b1R + whiteR * 0.0750759;
        b2R = 0.96900 * b2R + whiteR * 0.1538520;
        b3R = 0.86650 * b3R + whiteR * 0.3104856;
        b4R = 0.55000 * b4R + whiteR * 0.5329522;
        b5R = -0.7616 * b5R - whiteR * 0.0168980;
        right[i] = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362) * 0.11;
        b6R = whiteR * 0.115926;
      } else if (type === 'brown') {
        // Brown/red noise (integrated white noise)
        lastOutL = (lastOutL + 0.02 * whiteL) / 1.02;
        left[i] = lastOutL * 3.5;
        lastOutR = (lastOutR + 0.02 * whiteR) / 1.02;
        right[i] = lastOutR * 3.5;
      } else {
        left[i] = whiteL * 0.15;
        right[i] = whiteR * 0.15;
      }
    }
    return buffer;
  }

  /**
   * Start or toggle the ambience audio
   */
  public start() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.5);

    this.renderCurrentEnvironment();
    this.notifySubscribers();
  }

  public stop() {
    if (!this.ctx || !this.masterGain) return;
    this.isPlaying = false;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);

    setTimeout(() => {
      this.teardownNodes();
      this.notifySubscribers();
    }, 450);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && this.isPlaying) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    this.notifySubscribers();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getEnvironment(): StudioEnvironment {
    return this.currentEnv;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Switch the ambience atmosphere. Reacts automatically to environment changes.
   */
  public setEnvironment(env: StudioEnvironment) {
    if (this.currentEnv === env && this.activeNodes.length > 0) return;
    this.currentEnv = env;

    if (this.isPlaying) {
      this.initContext();
      this.crossfadeToEnvironment(env);
    }
    this.notifySubscribers();
  }

  private teardownNodes() {
    this.activeIntervals.forEach((id) => clearInterval(id));
    this.activeIntervals = [];

    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.activeNodes = [];
  }

  /**
   * Smooth crossfade from current soundscape to the new environment
   */
  private crossfadeToEnvironment(env: StudioEnvironment) {
    if (!this.ctx || !this.masterGain) return;

    // Fade out previous env output
    if (this.crossfadeGain) {
      const oldGain = this.crossfadeGain;
      oldGain.gain.cancelScheduledValues(this.ctx.currentTime);
      oldGain.gain.setValueAtTime(oldGain.gain.value, this.ctx.currentTime);
      oldGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
      setTimeout(() => {
        try {
          oldGain.disconnect();
        } catch {}
      }, 650);
    }

    this.teardownNodes();

    // Create a new crossfade sub-master gain node
    this.crossfadeGain = this.ctx.createGain();
    this.crossfadeGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.crossfadeGain.gain.linearRampToValueAtTime(1.0, this.ctx.currentTime + 0.6);
    this.crossfadeGain.connect(this.masterGain);

    this.buildEnvironmentAudio(env, this.crossfadeGain);
  }

  private renderCurrentEnvironment() {
    if (!this.ctx || !this.masterGain) return;
    this.teardownNodes();

    this.crossfadeGain = this.ctx.createGain();
    this.crossfadeGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.crossfadeGain.connect(this.masterGain);

    this.buildEnvironmentAudio(this.currentEnv, this.crossfadeGain);
  }

  /**
   * Constructs the multi-layered Web Audio node graph for each environment
   */
  private buildEnvironmentAudio(env: StudioEnvironment, output: GainNode) {
    if (!this.ctx) return;

    switch (env) {
      case 'city':
      case 'neon-city':
        this.buildCityAmbience(output);
        break;

      case 'race-track':
      case 'nurburgring-dusk':
        this.buildRaceTrackAmbience(output);
        break;

      case 'tokyo-highway':
        this.buildTokyoHighwayAmbience(output);
        break;

      case 'monaco-tunnel':
        this.buildMonacoTunnelAmbience(output);
        break;

      case 'hypercar-vault':
        this.buildHypercarVaultAmbience(output);
        break;

      case 'sunset':
      case 'dubai-skyline':
      case 'dark-studio':
        this.buildOpenAirSunsetAmbience(output);
        break;

      case 'showroom':
      default:
        this.buildShowroomAmbience(output);
        break;
    }
  }

  /* =========================================================================
   * 1. CITY TRAFFIC & URBAN AMBIENCE ('city' / 'neon-city')
   * ========================================================================= */
  private buildCityAmbience(output: GainNode) {
    if (!this.ctx) return;
    this.emitEvent('City Traffic Flow Active');

    // Layer A: Constant City Traffic Low-End Rumble (brown noise + 180Hz bandpass)
    const trafficBuffer = this.createNoiseBuffer('brown', 5);
    const trafficSource = this.ctx.createBufferSource();
    trafficSource.buffer = trafficBuffer;
    trafficSource.loop = true;

    const trafficFilter = this.ctx.createBiquadFilter();
    trafficFilter.type = 'lowpass';
    trafficFilter.frequency.value = 240;

    const trafficGain = this.ctx.createGain();
    trafficGain.gain.value = 0.42;

    // Traffic Breathing LFO (makes distant highway traffic swell realistically)
    const trafficLfo = this.ctx.createOscillator();
    trafficLfo.type = 'sine';
    trafficLfo.frequency.value = 0.12; // slow 8s breathing wave
    const trafficLfoGain = this.ctx.createGain();
    trafficLfoGain.gain.value = 0.12;
    trafficLfo.connect(trafficLfoGain);
    trafficLfoGain.connect(trafficGain.gain);

    trafficSource.connect(trafficFilter);
    trafficFilter.connect(trafficGain);
    trafficGain.connect(output);

    trafficSource.start();
    trafficLfo.start();
    this.activeNodes.push(trafficSource, trafficFilter, trafficGain, trafficLfo, trafficLfoGain);

    // Layer B: Urban Air / High-Rise Wind Rush (pink noise + 2.2kHz bandpass)
    const airBuffer = this.createNoiseBuffer('pink', 4);
    const airSource = this.ctx.createBufferSource();
    airSource.buffer = airBuffer;
    airSource.loop = true;

    const airFilter = this.ctx.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.value = 1800;
    airFilter.Q.value = 0.7;

    const airGain = this.ctx.createGain();
    airGain.gain.value = 0.18;

    airSource.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(output);

    airSource.start();
    this.activeNodes.push(airSource, airFilter, airGain);

    // Layer C: Periodic Passing Car Whoosh (Stereo Doppler Pan)
    const passingCarInterval = window.setInterval(() => {
      if (this.isPlaying && (this.currentEnv === 'city' || this.currentEnv === 'neon-city')) {
        this.triggerPassingCarWhoosh(output);
      }
    }, 5500);
    this.activeIntervals.push(passingCarInterval);

    // Layer D: Distant Urban Vehicle Horns (Dual-tone sine chime with distance reverb)
    const hornInterval = window.setInterval(() => {
      if (this.isPlaying && (this.currentEnv === 'city' || this.currentEnv === 'neon-city')) {
        if (Math.random() > 0.3) {
          this.triggerDistantCarHorn(output);
        }
      }
    }, 8500);
    this.activeIntervals.push(hornInterval);
  }

  /**
   * Procedural Passing Car Doppler Sound Effect
   */
  public triggerPassingCarWhoosh(outputNode?: GainNode) {
    if (!this.ctx) return;
    const dest = outputNode || this.crossfadeGain || this.masterGain;
    if (!dest) return;

    this.emitEvent('Vehicle Flyby Panned');
    const now = this.ctx.currentTime;
    const duration = 2.8;
    const isLeftToRight = Math.random() > 0.5;

    // Noise burst for tire and air friction
    const whooshBuffer = this.createNoiseBuffer('pink', 3);
    const whooshSource = this.ctx.createBufferSource();
    whooshSource.buffer = whooshBuffer;

    const whooshFilter = this.ctx.createBiquadFilter();
    whooshFilter.type = 'bandpass';
    whooshFilter.Q.value = 2.5;

    // Filter frequency sweep: starts higher, drops as car passes (Doppler effect)
    whooshFilter.frequency.setValueAtTime(450, now);
    whooshFilter.frequency.exponentialRampToValueAtTime(950, now + duration * 0.45);
    whooshFilter.frequency.exponentialRampToValueAtTime(220, now + duration);

    const whooshGain = this.ctx.createGain();
    whooshGain.gain.setValueAtTime(0.0001, now);
    whooshGain.gain.exponentialRampToValueAtTime(0.38, now + duration * 0.45);
    whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Stereo Panning across the listener
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      const startPan = isLeftToRight ? -0.85 : 0.85;
      const endPan = isLeftToRight ? 0.85 : -0.85;
      panner.pan.setValueAtTime(startPan, now);
      panner.pan.linearRampToValueAtTime(endPan, now + duration);
    }

    // Engine Tone Hum underneath the whoosh
    const engineOsc = this.ctx.createOscillator();
    engineOsc.type = 'sawtooth';
    const baseFreq = 75 + Math.random() * 40;
    engineOsc.frequency.setValueAtTime(baseFreq * 1.3, now);
    engineOsc.frequency.exponentialRampToValueAtTime(baseFreq, now + duration * 0.45);
    engineOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + duration);

    const engineGain = this.ctx.createGain();
    engineGain.gain.setValueAtTime(0.0001, now);
    engineGain.gain.exponentialRampToValueAtTime(0.12, now + duration * 0.45);
    engineGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    whooshSource.connect(whooshFilter);
    whooshFilter.connect(whooshGain);

    engineOsc.connect(engineGain);

    if (panner) {
      whooshGain.connect(panner);
      engineGain.connect(panner);
      panner.connect(dest);
    } else {
      whooshGain.connect(dest);
      engineGain.connect(dest);
    }

    whooshSource.start(now);
    engineOsc.start(now);
    whooshSource.stop(now + duration + 0.1);
    engineOsc.stop(now + duration + 0.1);
  }

  /**
   * Procedural Distant City Vehicle Horn
   */
  public triggerDistantCarHorn(outputNode?: GainNode) {
    if (!this.ctx) return;
    const dest = outputNode || this.crossfadeGain || this.masterGain;
    if (!dest) return;

    this.emitEvent('Distant Traffic Horn');
    const now = this.ctx.currentTime;
    const duration = 0.65;

    // Classic dual-tone European/American horn (F4 + A4 or Eb4 + G4)
    const basePitch = 345 + (Math.random() > 0.5 ? 40 : 0);
    const secondPitch = basePitch * 1.25;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(basePitch, now);
    osc2.frequency.setValueAtTime(secondPitch, now);

    // Muffled distance filter (distance absorbs high frequencies)
    const muffleFilter = this.ctx.createBiquadFilter();
    muffleFilter.type = 'bandpass';
    muffleFilter.frequency.value = 750;
    muffleFilter.Q.value = 1.2;

    const hornGain = this.ctx.createGain();
    hornGain.gain.setValueAtTime(0.0001, now);
    hornGain.gain.linearRampToValueAtTime(0.09, now + 0.05);
    hornGain.gain.setValueAtTime(0.09, now + duration - 0.1);
    hornGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Random stereo pan position in the distance
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      panner.pan.setValueAtTime((Math.random() * 2 - 1) * 0.75, now);
    }

    osc1.connect(muffleFilter);
    osc2.connect(muffleFilter);
    muffleFilter.connect(hornGain);

    if (panner) {
      hornGain.connect(panner);
      panner.connect(dest);
    } else {
      hornGain.connect(dest);
    }

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);
  }

  /* =========================================================================
   * 2. RACE TRACK & CIRCUIT AMBIENCE ('race-track' / 'nurburgring-dusk')
   * ========================================================================= */
  private buildRaceTrackAmbience(output: GainNode) {
    if (!this.ctx) return;
    this.emitEvent('Circuit Atmosphere Active');

    // Layer A: Grandstand Open Plains Wind (pink noise + slow LFO modulation)
    const windBuffer = this.createNoiseBuffer('pink', 4);
    const windSource = this.ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 320;

    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.28;

    const windLfo = this.ctx.createOscillator();
    windLfo.type = 'sine';
    windLfo.frequency.value = 0.18; // Gusts every 5.5 seconds
    const windLfoGain = this.ctx.createGain();
    windLfoGain.gain.value = 0.14;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windGain.gain);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(output);

    windSource.start();
    windLfo.start();
    this.activeNodes.push(windSource, windFilter, windGain, windLfo, windLfoGain);

    // Layer B: Distant Circuit Drone / Pit Murmur (subtle low rumble)
    const rumbleBuffer = this.createNoiseBuffer('brown', 4);
    const rumbleSource = this.ctx.createBufferSource();
    rumbleSource.buffer = rumbleBuffer;
    rumbleSource.loop = true;

    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = 'bandpass';
    rumbleFilter.frequency.value = 160;
    rumbleFilter.Q.value = 1.8;

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.value = 0.32;

    rumbleSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(output);

    rumbleSource.start();
    this.activeNodes.push(rumbleSource, rumbleFilter, rumbleGain);

    // Layer C: Screaming 280km/h GT3 Race Car Straightaway Flybys
    const flybyInterval = window.setInterval(() => {
      if (this.isPlaying && (this.currentEnv === 'race-track' || this.currentEnv === 'nurburgring-dusk')) {
        this.triggerRaceCarFlyby(output);
      }
    }, 6200);
    this.activeIntervals.push(flybyInterval);

    // Layer D: Pit Lane Pneumatic Wheel-Nut Air Wrench (zip-zip-zip-zip)
    const wrenchInterval = window.setInterval(() => {
      if (this.isPlaying && (this.currentEnv === 'race-track' || this.currentEnv === 'nurburgring-dusk')) {
        if (Math.random() > 0.35) {
          this.triggerPitWheelWrench(output);
        }
      }
    }, 9500);
    this.activeIntervals.push(wrenchInterval);
  }

  /**
   * Procedural High-Speed GT3 Race Car Straightaway Flyby (Screaming V8/V10 Doppler zoom!)
   */
  public triggerRaceCarFlyby(outputNode?: GainNode) {
    if (!this.ctx) return;
    const dest = outputNode || this.crossfadeGain || this.masterGain;
    if (!dest) return;

    this.emitEvent('280km/h Race Car Flyby');
    const now = this.ctx.currentTime;
    const duration = 2.4;
    const isLeftToRight = Math.random() > 0.5;

    // Screaming naturally aspirated engine oscillator (high frequency that drops dramatically)
    const engineOsc = this.ctx.createOscillator();
    engineOsc.type = 'sawtooth';
    // Frequency starts screaming at 820Hz, drops to 240Hz past the grandstand
    engineOsc.frequency.setValueAtTime(840, now);
    engineOsc.frequency.exponentialRampToValueAtTime(760, now + duration * 0.35);
    engineOsc.frequency.exponentialRampToValueAtTime(260, now + duration * 0.65);
    engineOsc.frequency.exponentialRampToValueAtTime(160, now + duration);

    // Distortion shaper for racing exhaust scream
    const waveshaper = this.ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = Math.tanh(x * 2.2);
    }
    waveshaper.curve = curve;

    // Resonant bandpass filter
    const flybyFilter = this.ctx.createBiquadFilter();
    flybyFilter.type = 'bandpass';
    flybyFilter.frequency.setValueAtTime(1200, now);
    flybyFilter.frequency.exponentialRampToValueAtTime(1600, now + duration * 0.45);
    flybyFilter.frequency.exponentialRampToValueAtTime(400, now + duration);
    flybyFilter.Q.value = 3.5;

    // Volume swell
    const flybyGain = this.ctx.createGain();
    flybyGain.gain.setValueAtTime(0.0001, now);
    flybyGain.gain.exponentialRampToValueAtTime(0.36, now + duration * 0.42);
    flybyGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Fast stereo pan sweep across the circuit
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      panner.pan.setValueAtTime(isLeftToRight ? -1.0 : 1.0, now);
      panner.pan.linearRampToValueAtTime(isLeftToRight ? 1.0 : -1.0, now + duration);
    }

    // High velocity aerodynamic whoosh noise
    const noiseBuffer = this.createNoiseBuffer('pink', 3);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 650;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.24, now + duration * 0.45);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    engineOsc.connect(waveshaper);
    waveshaper.connect(flybyFilter);
    flybyFilter.connect(flybyGain);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    if (panner) {
      flybyGain.connect(panner);
      noiseGain.connect(panner);
      panner.connect(dest);
    } else {
      flybyGain.connect(dest);
      noiseGain.connect(dest);
    }

    engineOsc.start(now);
    noiseSource.start(now);
    engineOsc.stop(now + duration + 0.1);
    noiseSource.stop(now + duration + 0.1);
  }

  /**
   * Procedural Pit Lane Pneumatic Wheel-Gun Ratchet (Fast "zip-zip-zip-zip-zip")
   */
  public triggerPitWheelWrench(outputNode?: GainNode) {
    if (!this.ctx) return;
    const dest = outputNode || this.crossfadeGain || this.masterGain;
    if (!dest) return;

    this.emitEvent('Pit Stop Pneumatic Air Gun');
    const now = this.ctx.currentTime;
    const burstCount = 5; // 5 lug nuts
    const burstDuration = 0.05;
    const burstSpacing = 0.075;

    for (let i = 0; i < burstCount; i++) {
      const burstTime = now + i * burstSpacing;

      // High-pressure metallic air burst
      const noiseBuffer = this.createNoiseBuffer('white', 0.2);
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1650 + Math.random() * 200;
      bandpass.Q.value = 6.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, burstTime);
      gain.gain.linearRampToValueAtTime(0.22, burstTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, burstTime + burstDuration);

      noiseSource.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(dest);

      noiseSource.start(burstTime);
      noiseSource.stop(burstTime + burstDuration + 0.01);
    }
  }

  /* =========================================================================
   * 3. TOKYO HIGHWAY AMBIENCE ('tokyo-highway')
   * ========================================================================= */
  private buildTokyoHighwayAmbience(output: GainNode) {
    if (!this.ctx) return;
    this.emitEvent('Tokyo Highway Wet Asphalt');

    // Wet Asphalt Tire Spray Hiss (high frequency bandpass white noise)
    const sprayBuffer = this.createNoiseBuffer('white', 4);
    const spraySource = this.ctx.createBufferSource();
    spraySource.buffer = sprayBuffer;
    spraySource.loop = true;

    const sprayFilter = this.ctx.createBiquadFilter();
    sprayFilter.type = 'bandpass';
    sprayFilter.frequency.value = 3400;
    sprayFilter.Q.value = 0.9;

    const sprayGain = this.ctx.createGain();
    sprayGain.gain.value = 0.16;

    spraySource.connect(sprayFilter);
    sprayFilter.connect(sprayGain);
    sprayGain.connect(output);

    spraySource.start();
    this.activeNodes.push(spraySource, sprayFilter, sprayGain);

    // Concrete Overpass Highway Resonance
    const resonanceBuffer = this.createNoiseBuffer('brown', 4);
    const resonanceSource = this.ctx.createBufferSource();
    resonanceSource.buffer = resonanceBuffer;
    resonanceSource.loop = true;

    const resonanceFilter = this.ctx.createBiquadFilter();
    resonanceFilter.type = 'bandpass';
    resonanceFilter.frequency.value = 140;
    resonanceFilter.Q.value = 2.4;

    const resonanceGain = this.ctx.createGain();
    resonanceGain.gain.value = 0.38;

    resonanceSource.connect(resonanceFilter);
    resonanceFilter.connect(resonanceGain);
    resonanceGain.connect(output);

    resonanceSource.start();
    this.activeNodes.push(resonanceSource, resonanceFilter, resonanceGain);

    // Periodic Expressway Passing Turbo Whoosh
    const tokyoInterval = window.setInterval(() => {
      if (this.isPlaying && this.currentEnv === 'tokyo-highway') {
        this.triggerPassingCarWhoosh(output);
      }
    }, 6000);
    this.activeIntervals.push(tokyoInterval);
  }

  /* =========================================================================
   * 4. MONACO TUNNEL AMBIENCE ('monaco-tunnel')
   * ========================================================================= */
  private buildMonacoTunnelAmbience(output: GainNode) {
    if (!this.ctx) return;
    this.emitEvent('Monaco Grand Prix Tunnel Reverb');

    // Enclosed Curved Tunnel Acoustic Resonance Drone
    const tunnelOsc1 = this.ctx.createOscillator();
    const tunnelOsc2 = this.ctx.createOscillator();
    tunnelOsc1.type = 'sine';
    tunnelOsc2.type = 'triangle';
    tunnelOsc1.frequency.value = 82; // Tunnel cavern fundamental
    tunnelOsc2.frequency.value = 164;

    const tunnelFilter = this.ctx.createBiquadFilter();
    tunnelFilter.type = 'lowpass';
    tunnelFilter.frequency.value = 220;

    const tunnelGain = this.ctx.createGain();
    tunnelGain.gain.value = 0.22;

    tunnelOsc1.connect(tunnelFilter);
    tunnelOsc2.connect(tunnelFilter);
    tunnelFilter.connect(tunnelGain);
    tunnelGain.connect(output);

    tunnelOsc1.start();
    tunnelOsc2.start();
    this.activeNodes.push(tunnelOsc1, tunnelOsc2, tunnelFilter, tunnelGain);

    // Tunnel Air Draft (Pink noise + comb resonance)
    const airBuffer = this.createNoiseBuffer('pink', 4);
    const airSource = this.ctx.createBufferSource();
    airSource.buffer = airBuffer;
    airSource.loop = true;

    const airFilter = this.ctx.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.value = 480;
    airFilter.Q.value = 2.0;

    const airGain = this.ctx.createGain();
    airGain.gain.value = 0.24;

    airSource.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(output);

    airSource.start();
    this.activeNodes.push(airSource, airFilter, airGain);

    // Echoing Tunnel Flybys
    const tunnelInterval = window.setInterval(() => {
      if (this.isPlaying && this.currentEnv === 'monaco-tunnel') {
        this.triggerRaceCarFlyby(output);
      }
    }, 7000);
    this.activeIntervals.push(tunnelInterval);
  }

  /* =========================================================================
   * 5. SHOWROOM AMBIENCE ('showroom')
   * ========================================================================= */
  private buildShowroomAmbience(output: GainNode) {
    if (!this.ctx) return;
    this.emitEvent('Boutique Showroom Acoustic Presence');

    // Clean, high-end showroom HVAC air distribution (smooth gentle white noise with 800Hz lowpass)
    const hvacBuffer = this.createNoiseBuffer('pink', 4);
    const hvacSource = this.ctx.createBufferSource();
    hvacSource.buffer = hvacBuffer;
    hvacSource.loop = true;

    const hvacFilter = this.ctx.createBiquadFilter();
    hvacFilter.type = 'lowpass';
    hvacFilter.frequency.value = 350;

    const hvacGain = this.ctx.createGain();
    hvacGain.gain.value = 0.12;

    hvacSource.connect(hvacFilter);
    hvacFilter.connect(hvacGain);
    hvacGain.connect(output);

    hvacSource.start();
    this.activeNodes.push(hvacSource, hvacFilter, hvacGain);

    // Subtle 50Hz transformer quiet hum
    const humOsc = this.ctx.createOscillator();
    humOsc.type = 'sine';
    humOsc.frequency.value = 50;

    const humGain = this.ctx.createGain();
    humGain.gain.value = 0.04;

    humOsc.connect(humGain);
    humGain.connect(output);

    humOsc.start();
    this.activeNodes.push(humOsc, humGain);
  }

  /* =========================================================================
   * 6. HYPERCAR VAULT AMBIENCE ('hypercar-vault')
   * ========================================================================= */
  private buildHypercarVaultAmbience(output: GainNode) {
    if (!this.ctx) return;
    this.emitEvent('Hypercar Climate Vault');

    // Sterile Cleanroom Airflow
    const airflowBuffer = this.createNoiseBuffer('pink', 4);
    const airflowSource = this.ctx.createBufferSource();
    airflowSource.buffer = airflowBuffer;
    airflowSource.loop = true;

    const airflowFilter = this.ctx.createBiquadFilter();
    airflowFilter.type = 'bandpass';
    airflowFilter.frequency.value = 920;
    airflowFilter.Q.value = 1.0;

    const airflowGain = this.ctx.createGain();
    airflowGain.gain.value = 0.15;

    airflowSource.connect(airflowFilter);
    airflowFilter.connect(airflowGain);
    airflowGain.connect(output);

    airflowSource.start();
    this.activeNodes.push(airflowSource, airflowFilter, airflowGain);

    // Deep 60Hz Electrical Hum
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = 60;

    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.08;

    subOsc.connect(subGain);
    subGain.connect(output);

    subOsc.start();
    this.activeNodes.push(subOsc, subGain);
  }

  /* =========================================================================
   * 7. OPEN AIR / SUNSET AMBIENCE ('sunset' / 'dubai-skyline' / 'dark-studio')
   * ========================================================================= */
  private buildOpenAirSunsetAmbience(output: GainNode) {
    if (!this.ctx) return;
    this.emitEvent('Outdoor Horizon Atmosphere');

    // Warm Sunset Evening Breeze
    const breezeBuffer = this.createNoiseBuffer('pink', 4);
    const breezeSource = this.ctx.createBufferSource();
    breezeSource.buffer = breezeBuffer;
    breezeSource.loop = true;

    const breezeFilter = this.ctx.createBiquadFilter();
    breezeFilter.type = 'lowpass';
    breezeFilter.frequency.value = 400;

    const breezeGain = this.ctx.createGain();
    breezeGain.gain.value = 0.18;

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.08;
    lfo.connect(lfoGain);
    lfoGain.connect(breezeGain.gain);

    breezeSource.connect(breezeFilter);
    breezeFilter.connect(breezeGain);
    breezeGain.connect(output);

    breezeSource.start();
    lfo.start();
    this.activeNodes.push(breezeSource, breezeFilter, breezeGain, lfo, lfoGain);
  }

  /* =========================================================================
   * Subscriptions & State Notifications
   * ========================================================================= */
  private emitEvent(name: string) {
    this.lastEvent = name;
    if (this.lastEventTimer) clearTimeout(this.lastEventTimer);
    this.notifySubscribers();
    this.lastEventTimer = window.setTimeout(() => {
      this.lastEvent = null;
      this.notifySubscribers();
    }, 2500);
  }

  public subscribe(callback: (state: AmbienceState) => void): () => void {
    this.stateSubscribers.add(callback);
    callback({
      isPlaying: this.isPlaying,
      environment: this.currentEnv,
      volume: this.volume,
      activeEvent: this.lastEvent,
    });
    return () => this.stateSubscribers.delete(callback);
  }

  private notifySubscribers() {
    const state: AmbienceState = {
      isPlaying: this.isPlaying,
      environment: this.currentEnv,
      volume: this.volume,
      activeEvent: this.lastEvent,
    };
    this.stateSubscribers.forEach((cb) => {
      try {
        cb(state);
      } catch {}
    });
  }
}

export const ambienceSound = new AmbienceAudioEngine();
