import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Flame,
  Volume2,
  VolumeX,
  Wind,
  Sliders,
  Play,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Activity,
  Gauge,
  Disc,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { engineSound } from '../utils/audio';
import {
  CarModelType,
  EngineSoundProfile,
  ExhaustValveMode,
  GearPosition,
  TransmissionMode,
  TurboBovStyle,
} from '../types';
import { getEngineForModel } from '../data/engines';
import {
  calculateRealVehicleSpeed,
  VEHICLE_PHYSICS_PROFILES,
  RealSpeedCalculation,
} from '../utils/vehicleMechanics';

interface EngineRevOverlayProps {
  isSoundActive: boolean;
  isDriving: boolean;
  modelType: CarModelType;
  engineProfile?: EngineSoundProfile;
  valveMode?: ExhaustValveMode;
  onToggleSound: () => void;
  onSelectEngineProfile?: (profile: EngineSoundProfile) => void;
  onSelectValveMode?: (mode: ExhaustValveMode) => void;
  onRpmChange?: (rpm: number) => void;
  onMechanicsChange?: (mech: RealSpeedCalculation) => void;
}

type FeatureGroupTab = 'powertrain' | 'acoustics' | 'transmission' | 'telemetry';

export const EngineRevOverlay: React.FC<EngineRevOverlayProps> = ({
  isSoundActive,
  isDriving,
  modelType,
  engineProfile,
  valveMode = 'sport' as ExhaustValveMode,
  onToggleSound,
  onSelectEngineProfile,
  onSelectValveMode,
  onRpmChange,
  onMechanicsChange,
}) => {
  const engine = getEngineForModel(modelType);
  const activeProfile = engineProfile || engine.soundProfile;
  const physicsProfile =
    VEHICLE_PHYSICS_PROFILES[modelType] || VEHICLE_PHYSICS_PROFILES['procedural-m4'];

  const [rpm, setRpm] = useState<number>(engine.idleRpm);
  const [currentGear, setCurrentGear] = useState<GearPosition>(1);
  const [transMode, setTransMode] = useState<TransmissionMode>('manual');
  const [turboStyle, setTurboStyle] = useState<TurboBovStyle>('wrc-flutter');
  const [isThrottling, setIsThrottling] = useState<boolean>(false);
  const [isLaunchControlActive, setIsLaunchControlActive] = useState<boolean>(false);
  const [isColdStarting, setIsColdStarting] = useState<boolean>(false);
  const [boostPsi, setBoostPsi] = useState<number>(0);
  const [activeGroup, setActiveGroup] = useState<FeatureGroupTab>('powertrain');
  const [manualSliderValue, setManualSliderValue] = useState<number>(0);
  const [isBackfireFiring, setIsBackfireFiring] = useState<boolean>(false);
  const [speedUnit, setSpeedUnit] = useState<'kmh' | 'mph'>('kmh');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Real-life mechanical calculations state
  const [mechanics, setMechanics] = useState<RealSpeedCalculation>({
    speedKmh: 0,
    speedMph: 0,
    wheelRpm: 0,
    currentGearRatio: physicsProfile.gearRatios[1] || 3.5,
    finalDriveRatio: physicsProfile.finalDriveRatio,
    maxSpeedInCurrentGearKmh: 65,
    dragForceNewtons: 0,
    gForceLongitudinal: 0,
    isGearDecoupled: false,
  });

  const animRef = useRef<number | null>(null);
  const revButtonRef = useRef<HTMLButtonElement | null>(null);
  const speedRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  // Sync profile with sound synthesizer
  useEffect(() => {
    engineSound.setProfile(activeProfile);
    if (!isSoundActive) {
      setRpm(engine.idleRpm);
    }
  }, [activeProfile, engine.idleRpm]);

  // Sync valve mode
  useEffect(() => {
    engineSound.setValveMode(valveMode as ExhaustValveMode);
  }, [valveMode]);

  // Subscribe to gear, boost, and exhaust events
  useEffect(() => {
    const unsubGear = engineSound.subscribeGear((g) => {
      setCurrentGear(g);
    });
    const unsubBoost = engineSound.subscribeBoost((b) => {
      setBoostPsi(b);
    });
    const unsubExhaust = engineSound.subscribeExhaustEvent(() => {
      setIsBackfireFiring(true);
      setTimeout(() => setIsBackfireFiring(false), 380);
    });
    return () => {
      unsubGear();
      unsubBoost();
      unsubExhaust();
    };
  }, []);

  // Sync sound engine state
  useEffect(() => {
    if (isSoundActive) {
      engineSound.start();
    } else {
      engineSound.stop();
      setIsThrottling(false);
      setIsLaunchControlActive(false);
      setRpm(0);
      speedRef.current = 0;
      setBoostPsi(0);
      const zeroMech = {
        speedKmh: 0,
        speedMph: 0,
        wheelRpm: 0,
        currentGearRatio: physicsProfile.gearRatios[1] || 3.5,
        finalDriveRatio: physicsProfile.finalDriveRatio,
        maxSpeedInCurrentGearKmh: 0,
        dragForceNewtons: 0,
        gForceLongitudinal: 0,
        isGearDecoupled: true,
      };
      setMechanics(zeroMech);
      onMechanicsChange?.(zeroMech);
    }
  }, [isSoundActive, physicsProfile]);

  // Continuous animation loop using REAL-LIFE VEHICLE MECHANICS
  useEffect(() => {
    const loop = (currentTime: number) => {
      const deltaSec = Math.min(0.05, (currentTime - lastTimeRef.current) / 1000);
      lastTimeRef.current = currentTime;

      if (isSoundActive) {
        const currentRpm = engineSound.getRpm();
        setRpm(currentRpm);
        onRpmChange?.(currentRpm);

        // Real-Life Mechanics calculation
        const result = calculateRealVehicleSpeed(
          modelType,
          currentRpm,
          currentGear,
          isDriving,
          speedRef.current,
          deltaSec
        );

        speedRef.current = result.speedKmh;
        setMechanics(result);
        onMechanicsChange?.(result);
      } else {
        setRpm(0);
        speedRef.current = 0;
        onRpmChange?.(0);
      }
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isSoundActive, isDriving, modelType, currentGear]);

  // Pointer capture for Hold-To-Rev
  const startThrottleRev = (e?: React.PointerEvent<HTMLButtonElement>) => {
    if (e) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
    if (!isSoundActive) {
      onToggleSound();
    }
    setIsThrottling(true);
    engineSound.setThrottle(0.98);
  };

  const endThrottleRev = (e?: React.PointerEvent<HTMLButtonElement>) => {
    if (e) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
    if (!isThrottling) return;
    setIsThrottling(false);
    engineSound.setThrottle(0);

    // Dynamic overrun burble & crackle on throttle lift
    setTimeout(() => {
      engineSound.playExhaustBurble();
    }, 180);
  };

  // Gear Controls
  const handleShiftUp = () => {
    if (!isSoundActive) onToggleSound();
    engineSound.shiftUp();
  };

  const handleShiftDown = () => {
    if (!isSoundActive) onToggleSound();
    engineSound.shiftDown();
  };

  const handleToggleTransmission = (mode: TransmissionMode) => {
    setTransMode(mode);
    engineSound.setTransmissionMode(mode);
  };

  const handleTriggerBov = (style?: TurboBovStyle) => {
    if (!isSoundActive) onToggleSound();
    engineSound.triggerBlowOffValve(style || turboStyle);
  };

  const handleSelectTurboStyle = (style: TurboBovStyle) => {
    setTurboStyle(style);
    engineSound.setTurboBovStyle(style);
    handleTriggerBov(style);
  };

  // Dedicated Exhaust Sound Triggers
  const handleTriggerExhaustBackfire = () => {
    if (!isSoundActive) onToggleSound();
    engineSound.triggerExhaustBackfire();
  };

  const handleCycleValveMode = () => {
    const modes: ExhaustValveMode[] = ['quiet', 'sport', 'track'];
    const nextIdx = (modes.indexOf(valveMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    onSelectValveMode?.(nextMode);
    if (!isSoundActive) onToggleSound();
    engineSound.playExhaustBurble();
  };

  // Launch Control (2-Step Limiter) toggle
  const handleToggleLaunchControl = () => {
    if (!isSoundActive) onToggleSound();
    const active = engineSound.toggleLaunchControl();
    setIsLaunchControlActive(active);
  };

  // Cold Start ignition sequence
  const handleColdStart = () => {
    if (!isSoundActive) onToggleSound();
    setIsColdStarting(true);
    engineSound.playColdStart(() => {
      setIsColdStarting(false);
    });
  };

  // Throttle Blip
  const handleThrottleBlip = () => {
    if (!isSoundActive) onToggleSound();
    engineSound.playThrottleBlip();
  };

  // Manual Throttle Fader Slider
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setManualSliderValue(val);
    if (!isSoundActive && val > 0) onToggleSound();
    engineSound.setThrottle(val / 100);
  };

  // =========================================================================
  // EASY & INTUITIVE KEYBOARD CONTROLS:
  // W / ArrowUp / Space / R : Accelerate / Rev (Hold to Rev)
  // S / ArrowDown : Brake / Decelerate
  // D / ArrowRight / E / ] : Shift Up
  // A / ArrowLeft / Q / [ : Shift Down
  // X / F : Exhaust Backfire & Detonation Pops
  // B / T : Turbo Blow-Off Valve Flutter
  // L : 2-Step Launch Control
  // C : Cold Start Ignition
  // M : Audio Sound Mute / Unmute
  // =========================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;
      const key = e.key.toLowerCase();
      const code = e.code;

      // Rev: W, ArrowUp, Space, R
      if (key === 'w' || code === 'ArrowUp' || code === 'Space' || key === 'r') {
        if (!e.repeat) {
          e.preventDefault();
          startThrottleRev();
        }
      }
      // Brake / Decel: S, ArrowDown
      else if (key === 's' || code === 'ArrowDown') {
        e.preventDefault();
        setIsThrottling(false);
        engineSound.setThrottle(0);
      }
      // Shift Up: D, ArrowRight, E, ]
      else if (key === 'd' || code === 'ArrowRight' || key === 'e' || key === ']') {
        e.preventDefault();
        handleShiftUp();
      }
      // Shift Down: A, ArrowLeft, Q, [
      else if (key === 'a' || code === 'ArrowLeft' || key === 'q' || key === '[') {
        e.preventDefault();
        handleShiftDown();
      }
      // Exhaust Backfire: X, F
      else if (key === 'x' || key === 'f') {
        e.preventDefault();
        handleTriggerExhaustBackfire();
      }
      // Turbo BOV: B, T
      else if (key === 'b' || key === 't') {
        e.preventDefault();
        handleTriggerBov();
      }
      // 2-Step Launch Control: L
      else if (key === 'l') {
        e.preventDefault();
        handleToggleLaunchControl();
      }
      // Cold Start Ignition: C
      else if (key === 'c') {
        e.preventDefault();
        handleColdStart();
      }
      // Mute / Sound toggle: M
      else if (key === 'm') {
        e.preventDefault();
        onToggleSound();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;
      const key = e.key.toLowerCase();
      const code = e.code;

      if (key === 'w' || code === 'ArrowUp' || code === 'Space' || key === 'r') {
        e.preventDefault();
        endThrottleRev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSoundActive, isThrottling]);

  const redline = engine.redlineRpm;
  const rpmPercent = Math.min(100, Math.max(0, (rpm / redline) * 100));

  // Dynamic badge and accent color
  const badgeColor =
    modelType === 'ninja-h2r'
      ? 'bg-emerald-500'
      : modelType === 'mustang-gt'
      ? 'bg-amber-500'
      : modelType === 'gwagon-g63'
      ? 'bg-rose-500'
      : modelType === 'ferrari-sf90'
      ? 'bg-red-600'
      : modelType === 'bugatti-chiron'
      ? 'bg-sky-500'
      : 'bg-blue-500';

  const accentGradient =
    modelType === 'ninja-h2r'
      ? 'from-emerald-500 via-teal-400 to-green-300'
      : modelType === 'mustang-gt'
      ? 'from-amber-500 via-orange-500 to-rose-500'
      : modelType === 'gwagon-g63'
      ? 'from-rose-500 via-red-500 to-amber-500'
      : modelType === 'ferrari-sf90'
      ? 'from-red-600 via-amber-500 to-yellow-400'
      : modelType === 'bugatti-chiron'
      ? 'from-sky-500 via-blue-600 to-indigo-400'
      : 'from-blue-600 via-sky-400 to-white';

  const currentDisplaySpeed = speedUnit === 'kmh' ? mechanics.speedKmh : mechanics.speedMph;

  return (
    <div
      id="engine-rev-overlay"
      className="fixed bottom-20 left-3 sm:left-6 z-30 pointer-events-auto flex flex-col items-start gap-2 max-w-[calc(100vw-1.5rem)]"
    >
      <AnimatePresence initial={false} mode="wait">
        {isMinimized ? (
          /* ========================================================================= */
          /* COLLAPSED SLEEK MINI HUD STRIP: MAXIMUM SCREEN VISIBILITY!              */
          /* ========================================================================= */
          <motion.div
            key="collapsed-hud-strip"
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex items-center gap-2 p-2 px-3 rounded-full bg-black/85 backdrop-blur-2xl border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.8)] text-slate-200 ring-1 ring-white/10"
          >
            {/* Model & Power dot */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-white/15">
              <span className={`w-2.5 h-2.5 rounded-full ${badgeColor} shadow-sm`} />
              <span className="text-[11px] font-mono font-black text-white uppercase truncate max-w-[90px]">
                {engine.code}
              </span>
            </div>

            {/* Compact RPM Readout */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-white/15 font-mono text-xs">
              <Gauge className="w-3 h-3 text-slate-400" />
              <span className={`font-black ${rpm > redline * 0.9 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                {isSoundActive ? rpm.toLocaleString() : engine.idleRpm.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-500">RPM</span>
            </div>

            {/* Compact Gear */}
            <div className="flex items-center gap-1 pr-2 border-r border-white/15 font-mono text-xs">
              <span className="text-[9px] text-slate-400 uppercase font-bold">G</span>
              <span className="text-amber-400 font-black">{currentGear}</span>
            </div>

            {/* Compact Velocity */}
            <div className="flex items-center gap-1 pr-2 border-r border-white/15 font-mono text-xs">
              <span className="text-cyan-400 font-black">
                {isSoundActive && isDriving ? currentDisplaySpeed : 0}
              </span>
              <button
                onClick={() => setSpeedUnit(speedUnit === 'kmh' ? 'mph' : 'kmh')}
                className="text-[9px] text-slate-400 hover:text-white underline font-bold"
              >
                {speedUnit.toUpperCase()}
              </button>
            </div>

            {/* Quick Hold to Rev Button */}
            <button
              id="mini-btn-throttle-rev"
              onPointerDown={startThrottleRev}
              onPointerUp={endThrottleRev}
              onPointerCancel={endThrottleRev}
              onPointerLeave={endThrottleRev}
              onContextMenu={(e) => e.preventDefault()}
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1 transition-all select-none cursor-pointer ${
                isThrottling
                  ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.7)] scale-95 ring-1 ring-rose-400'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isThrottling ? 'fill-white animate-bounce' : 'text-amber-400'}`} />
              <span>{isThrottling ? 'REDLINE!' : 'REV (W/↑)'}</span>
            </button>

            {/* Quick Backfire Button */}
            <button
              id="mini-btn-backfire"
              onClick={handleTriggerExhaustBackfire}
              className={`p-1.5 rounded-full border transition-all ${
                isBackfireFiring
                  ? 'bg-rose-600 border-rose-400 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/15'
              }`}
              title="Trigger Exhaust Detonation Backfire (X key)"
            >
              <Flame className="w-3.5 h-3.5" />
            </button>

            {/* Expand Cockpit Button */}
            <button
              id="mini-btn-expand-cockpit"
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all ml-0.5 cursor-pointer"
              title="Expand Full Digital Instrument Cluster"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* EXPANDED FULL DIGITAL COCKPIT: STRUCTURED INTO CLEAR FEATURE GROUPS!     */
          /* ========================================================================= */
          <motion.div
            key="expanded-cockpit-panel"
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            style={{ width: '389px' }}
            className="bg-black/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-3.5 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] w-[389px] max-w-[calc(100vw-2rem)] text-slate-200 ring-1 ring-white/10"
          >
            {/* Top Header: Model, Live Sound & Minimize */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${badgeColor}`} />
                <span className="text-[11px] font-black tracking-wider uppercase text-white font-mono truncate max-w-[150px]">
                  {engine.code}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                  {physicsProfile.driveType}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Audio Live toggle */}
                <button
                  id="btn-toggle-audio-live"
                  onClick={onToggleSound}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border transition-all flex items-center gap-1 ${
                    isSoundActive
                      ? 'bg-amber-500/25 border-amber-500/50 text-amber-300 shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Live Web Audio Engine Synthesizer (M key)"
                >
                  {isSoundActive ? <Volume2 className="w-3 h-3 text-amber-400" /> : <VolumeX className="w-3 h-3 text-slate-500" />}
                  <span>{isSoundActive ? 'LIVE' : 'MUTE'}</span>
                </button>

                {/* Minimize Button */}
                <button
                  id="btn-toggle-minimize"
                  onClick={() => setIsMinimized(true)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Minimize Cockpit Cluster to clear screen"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Engine Specification line */}
            <div className="text-[11px] text-slate-400 font-medium truncate mb-2">
              {engine.type}
            </div>

            {/* Big RPM, Gear & Real-Life Velocity Gauge Cluster */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 my-2 bg-white/[0.04] p-2.5 rounded-2xl border border-white/5 text-center">
              {/* Engine RPM */}
              <div className="border-r border-white/10 pr-1 text-left">
                <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-tighter font-bold flex items-center gap-1">
                  <Gauge className="w-2.5 h-2.5 text-slate-500" />
                  <span>RPM</span>
                </div>
                <div className="text-lg sm:text-xl font-black tracking-tighter text-white font-mono">
                  <span className={rpm > redline * 0.9 ? 'text-rose-500 animate-pulse' : ''}>
                    {isSoundActive ? rpm.toLocaleString() : engine.idleRpm.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Real Gear & Ratio */}
              <div className="border-r border-white/10 px-1">
                <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-tighter font-bold flex items-center justify-center gap-1">
                  <span>GEAR</span>
                  <span className="text-[8px] px-1 rounded bg-white/10 text-amber-300 uppercase">{transMode}</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono flex items-center justify-center gap-1">
                  <span>{currentGear}</span>
                </div>
              </div>

              {/* Real-Life Physical Velocity */}
              <div className="pl-1 text-right">
                <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-tighter font-bold flex items-center justify-end gap-1">
                  <button
                    onClick={() => setSpeedUnit(speedUnit === 'kmh' ? 'mph' : 'kmh')}
                    className="hover:text-white transition-colors underline decoration-dotted"
                    title="Toggle KM/H / MPH"
                  >
                    {speedUnit.toUpperCase()}
                  </button>
                </div>
                <div className="text-lg sm:text-xl font-black tracking-tighter text-cyan-400 font-mono">
                  <span>{isSoundActive && isDriving ? currentDisplaySpeed : '0'}</span>
                  <span className="text-[9px] text-slate-500 font-bold ml-1">{speedUnit.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Tachometer Bar */}
            <div className="space-y-1 mb-2.5">
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>IDLE: {engine.idleRpm}</span>
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Wind className="w-2.5 h-2.5" />
                  BOOST: {boostPsi.toFixed(1)} PSI
                </span>
                <span className="text-rose-400 font-bold">{redline} REDLINE</span>
              </div>
              <div className="h-2 w-full bg-black/90 rounded-full overflow-hidden p-0.5 border border-white/10 flex">
                <div
                  className={`h-full rounded-full transition-all duration-75 bg-gradient-to-r ${accentGradient} shadow-md`}
                  style={{ width: `${isSoundActive ? rpmPercent : 10}%` }}
                />
              </div>
            </div>

            {/* PRIMARY CONTROLS: Hold-To-Rev, Dedicated Exhaust Backfire, and BOV */}
            <div className="flex items-center gap-2 mb-2.5">
              {/* Main Hold to Rev Button */}
              <button
                ref={revButtonRef}
                id="btn-throttle-rev"
                onPointerDown={startThrottleRev}
                onPointerUp={endThrottleRev}
                onPointerCancel={endThrottleRev}
                onPointerLeave={endThrottleRev}
                onContextMenu={(e) => e.preventDefault()}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all select-none cursor-pointer ${
                  isThrottling
                    ? 'bg-rose-600 text-white shadow-[0_0_25px_rgba(225,29,72,0.7)] scale-95 ring-2 ring-rose-400'
                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/30 active:scale-95'
                }`}
              >
                <Zap className={`w-4 h-4 ${isThrottling ? 'fill-white animate-bounce' : 'text-amber-400'}`} />
                <span>{isThrottling ? 'REDLINE REV!' : 'HOLD TO REV'}</span>
              </button>

              {/* Dedicated DYNAMIC EXHAUST BACKFIRE / FLAME TRIGGER */}
              <button
                id="btn-exhaust-backfire"
                onClick={handleTriggerExhaustBackfire}
                className={`px-3 py-2.5 rounded-2xl border transition-all shadow-sm flex items-center gap-1.5 active:scale-90 select-none cursor-pointer ${
                  isBackfireFiring
                    ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.8)] scale-95'
                    : 'bg-gradient-to-r from-amber-600/30 to-rose-600/30 hover:from-amber-600/50 hover:to-rose-600/50 text-amber-300 border-amber-500/40'
                }`}
                title="Trigger High-Octane Unburnt Fuel Exhaust Backfire & Detonation Pops (X key)"
              >
                <Flame className={`w-4 h-4 ${isBackfireFiring ? 'fill-white text-white animate-spin' : 'text-amber-400 animate-pulse'}`} />
                <span className="text-[10px] font-bold font-mono">EXHAUST</span>
              </button>

              {/* Turbo BOV Sound Trigger */}
              <button
                id="btn-turbo-bov-trigger"
                onClick={() => handleTriggerBov()}
                className="px-2.5 py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all shadow-sm flex items-center gap-1 active:scale-90"
                title="Trigger Turbo Blow-Off / Compressor Surge (B or T key)"
              >
                <Wind className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-bold font-mono">BOV</span>
              </button>

              {/* Quick Acoustic Valve Toggle */}
              <button
                id="btn-cycle-valves"
                onClick={handleCycleValveMode}
                className={`p-2.5 rounded-2xl border transition-all text-xs font-mono font-bold flex items-center justify-center ${
                  valveMode === 'track'
                    ? 'bg-red-600/30 border-red-500 text-red-300'
                    : valveMode === 'sport'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                    : 'bg-blue-600/30 border-blue-500 text-blue-300'
                }`}
                title={`Current Exhaust Mode: ${valveMode.toUpperCase()} (Click to cycle)`}
              >
                <Disc className="w-4 h-4" />
              </button>
            </div>

            {/* Easy Key Shortcut Hint */}
            <div className="text-[9px] text-slate-400 text-center font-mono pb-2 border-b border-white/10 flex items-center justify-center gap-1 flex-wrap">
              <span>Drive: <kbd className="px-1 py-0.2 rounded bg-white/10 text-white font-bold">W / ↑</kbd></span>
              <span className="text-slate-600">•</span>
              <span>Gears: <kbd className="px-1 py-0.2 rounded bg-white/10 text-white font-bold">A/D</kbd> or <kbd className="px-1 py-0.2 rounded bg-white/10 text-white font-bold">←/→</kbd></span>
              <span className="text-slate-600">•</span>
              <span>Backfire: <kbd className="px-1 py-0.2 rounded bg-white/10 text-rose-300 font-bold">X</kbd></span>
            </div>

            {/* ================================================================= */}
            {/* ORGANIZED FEATURE GROUPS ACCORDION                                 */}
            {/* ================================================================= */}
            <div className="mt-2 space-y-2">
              {/* Group Nav Tabs */}
              <div className="flex p-0.5 bg-white/[0.04] rounded-xl border border-white/10 font-mono text-[10px]">
                <button
                  onClick={() => setActiveGroup('powertrain')}
                  className={`flex-1 py-1 px-1 rounded-lg font-bold transition-all text-center ${
                    activeGroup === 'powertrain'
                      ? 'bg-white text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🚀 Throttle
                </button>
                <button
                  onClick={() => setActiveGroup('acoustics')}
                  className={`flex-1 py-1 px-1 rounded-lg font-bold transition-all text-center ${
                    activeGroup === 'acoustics'
                      ? 'bg-white text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔊 Exhaust
                </button>
                <button
                  onClick={() => setActiveGroup('transmission')}
                  className={`flex-1 py-1 px-1 rounded-lg font-bold transition-all text-center ${
                    activeGroup === 'transmission'
                      ? 'bg-white text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🕹️ Gears
                </button>
                <button
                  onClick={() => setActiveGroup('telemetry')}
                  className={`flex-1 py-1 px-1 rounded-lg font-bold transition-all text-center ${
                    activeGroup === 'telemetry'
                      ? 'bg-white text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📊 Physics
                </button>
              </div>

              {/* Group 1: Powertrain & Throttle Systems */}
              {activeGroup === 'powertrain' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/5"
                >
                  {/* Ignition & Rev Presets */}
                  <div className="grid grid-cols-3 gap-1.5 font-mono">
                    <button
                      id="btn-launch-control"
                      onClick={handleToggleLaunchControl}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all border flex items-center justify-center gap-1 ${
                        isLaunchControlActive
                          ? 'bg-rose-600 text-white border-rose-400 shadow-md animate-pulse'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                      }`}
                    >
                      <Flame className="w-3 h-3 text-rose-400" />
                      <span>{isLaunchControlActive ? '2-STEP ON' : '2-Step'}</span>
                    </button>

                    <button
                      id="btn-cold-start"
                      onClick={handleColdStart}
                      disabled={isColdStarting}
                      className="py-1.5 px-2 rounded-xl text-[10px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                      <RotateCcw className={`w-3 h-3 text-blue-400 ${isColdStarting ? 'animate-spin' : ''}`} />
                      <span>{isColdStarting ? 'Crank...' : 'Cold Start'}</span>
                    </button>

                    <button
                      id="btn-throttle-blip"
                      onClick={handleThrottleBlip}
                      className="py-1.5 px-2 rounded-xl text-[10px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Blip</span>
                    </button>
                  </div>

                  {/* Continuous Throttle Fader Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>CONTINUOUS THROTTLE FADER</span>
                      <span className="text-white font-bold">{manualSliderValue}%</span>
                    </div>
                    <input
                      id="slider-throttle-fader"
                      type="range"
                      min="0"
                      max="100"
                      value={manualSliderValue}
                      onChange={handleSliderChange}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </motion.div>
              )}

              {/* Group 2: Acoustics & Active Exhaust Systems */}
              {activeGroup === 'acoustics' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/5"
                >
                  {/* Tailpipe Valve Mode */}
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono flex items-center justify-between">
                      <span>Exhaust Tailpipe System</span>
                      <span className="text-amber-400">{valveMode.toUpperCase()}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'quiet', label: 'Baffled', desc: 'Touring' },
                        { id: 'sport', label: 'Valves Open', desc: 'Crisp Rasp' },
                        { id: 'track', label: 'Straight Pipe', desc: 'Decat Loud' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          id={`valve-mode-${m.id}`}
                          onClick={() => onSelectValveMode?.(m.id as ExhaustValveMode)}
                          className={`py-1.5 px-1 rounded-xl text-center transition-all border ${
                            valveMode === m.id
                              ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                              : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
                          }`}
                        >
                          <div className="text-[10px] font-bold font-mono">{m.label}</div>
                          <div className="text-[8px] text-slate-500">{m.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Turbo Blow-Off Valve Style Selection */}
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase font-bold tracking-wider text-cyan-400 font-mono flex items-center gap-1">
                      <Wind className="w-3 h-3" />
                      <span>Turbo Blow-Off Valve Acoustics</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { id: 'wrc-flutter', label: 'WRC Rally', desc: 'Surge' },
                        { id: 'hks-ssqv', label: 'HKS SSQV', desc: 'Chirp' },
                        { id: 'greddy-surge', label: 'GReddy RS', desc: 'Rebound' },
                        { id: 'tial-vent', label: 'TiAL 50mm', desc: 'Dump' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          id={`turbo-style-${item.id}`}
                          onClick={() => handleSelectTurboStyle(item.id as TurboBovStyle)}
                          className={`p-1.5 rounded-xl text-left transition-all border ${
                            turboStyle === item.id
                              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-md'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                          }`}
                        >
                          <div className="text-[10px] font-bold font-mono">{item.label}</div>
                          <div className="text-[8px] text-slate-400">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Group 3: Transmission & Shifting */}
              {activeGroup === 'transmission' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/5"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    {/* Auto / Manual Mode */}
                    <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
                      <button
                        id="btn-mode-manual"
                        onClick={() => handleToggleTransmission('manual')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-all ${
                          transMode === 'manual'
                            ? 'bg-amber-500 text-black shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        MANUAL (A/D)
                      </button>
                      <button
                        id="btn-mode-auto"
                        onClick={() => handleToggleTransmission('auto')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-all ${
                          transMode === 'auto'
                            ? 'bg-cyan-500 text-black shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        AUTO DCT
                      </button>
                    </div>

                    {/* Paddle Shifters */}
                    <div className="flex items-center gap-1.5">
                      <button
                        id="paddle-shift-down"
                        onClick={handleShiftDown}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 text-white font-mono font-bold text-xs border border-white/15 transition-all shadow-sm"
                        title="Downshift Gear (A, Q or [)"
                      >
                        - DOWN
                      </button>
                      <button
                        id="paddle-shift-up"
                        onClick={handleShiftUp}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 active:scale-90 text-amber-300 font-mono font-bold text-xs border border-amber-500/40 transition-all shadow-sm"
                        title="Upshift Gear (D, E or ])"
                      >
                        + UP
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-2 py-1 rounded bg-black/30">
                    <span>Active Gear Ratio:</span>
                    <span className="text-amber-300 font-bold">
                      {typeof currentGear === 'number' ? `${mechanics.currentGearRatio.toFixed(2)}:1` : 'N/A'}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Group 4: Telemetry & Mechanics */}
              {activeGroup === 'telemetry' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5 bg-white/[0.03] p-2.5 rounded-xl border border-white/5 font-mono text-[10px]"
                >
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">LONGITUDINAL G-FORCE:</span>
                    <span
                      className={`font-bold ${
                        mechanics.gForceLongitudinal > 0.4
                          ? 'text-rose-400'
                          : mechanics.gForceLongitudinal < -0.2
                          ? 'text-cyan-300'
                          : 'text-slate-300'
                      }`}
                    >
                      {mechanics.gForceLongitudinal > 0 ? `+${mechanics.gForceLongitudinal.toFixed(2)}G` : `${mechanics.gForceLongitudinal.toFixed(2)}G`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">AERODYNAMIC DRAG:</span>
                    <span className="text-emerald-400 font-bold">{mechanics.dragForceNewtons} Newtons</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">GEAR SPEED LIMIT:</span>
                    <span className="text-white font-bold">{mechanics.maxSpeedInCurrentGearKmh} km/h</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">FINAL DRIVE RATIO:</span>
                    <span className="text-amber-300 font-bold">{physicsProfile.finalDriveRatio.toFixed(2)}:1</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

