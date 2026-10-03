import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Volume2,
  VolumeX,
  Wind,
  Zap,
  Gauge,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Camera,
  Cpu,
} from 'lucide-react';
import { engineSound, AcousticEnvironment } from '../utils/audio';
import {
  CarModelType,
  CameraPreset,
  EngineSoundProfile,
  ExhaustValveMode,
  GearPosition,
  TransmissionMode,
} from '../types';
import { getEngineForModel } from '../data/engines';
import {
  calculateRealVehicleSpeed,
  VEHICLE_PHYSICS_PROFILES,
  RealSpeedCalculation,
} from '../utils/vehicleMechanics';
import {
  AnimatedSpeedometerIcon,
  AnimatedEngineIcon,
  AnimatedExhaustIcon,
  AnimatedTurboIcon,
  AnimatedAudioBarsIcon,
  AnimatedAiSparkIcon,
  AnimatedWheelIcon,
} from './AnimatedIcons';

interface SupercarCockpitProps {
  modelType: CarModelType;
  isSoundActive: boolean;
  onToggleSound: () => void;
  onSelectModelType?: (model: CarModelType) => void;
  onOpenSpecs?: () => void;
  onOpenSoundLab?: () => void;
  onOpenAiStudio?: () => void;
  onSelectCameraPreset?: (preset: CameraPreset) => void;
  currentCameraPreset?: CameraPreset;
  onRpmChange?: (rpm: number) => void;
  onMechanicsChange?: (mech: RealSpeedCalculation) => void;
}

export const SupercarCockpit: React.FC<SupercarCockpitProps> = ({
  modelType,
  isSoundActive,
  onToggleSound,
  onSelectModelType,
  onOpenSpecs,
  onOpenSoundLab,
  onOpenAiStudio,
  onSelectCameraPreset,
  currentCameraPreset = 'hero',
  onRpmChange,
  onMechanicsChange,
}) => {
  const engine = getEngineForModel(modelType);
  const physicsProfile =
    VEHICLE_PHYSICS_PROFILES[modelType] || VEHICLE_PHYSICS_PROFILES['procedural-m4'];

  // Telemetry state
  const [rpm, setRpm] = useState<number>(engine.idleRpm);
  const [boostPsi, setBoostPsi] = useState<number>(0);
  const [currentGear, setCurrentGear] = useState<GearPosition>(1);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [valveMode, setValveMode] = useState<ExhaustValveMode>('sport');

  // Interactive controls state
  const [isPedalPressed, setIsPedalPressed] = useState<boolean>(false);
  const [pedalThrottle, setPedalThrottle] = useState<number>(0);
  const [is2StepActive, setIs2StepActive] = useState<boolean>(false);
  const [isColdStarting, setIsColdStarting] = useState<boolean>(false);
  const [isBackfireFiring, setIsBackfireFiring] = useState<boolean>(false);
  const [isCockpitCollapsed, setIsCockpitCollapsed] = useState<boolean>(false);

  const speedRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const pedalRef = useRef<HTMLDivElement>(null);

  // Sync profile when model changes
  useEffect(() => {
    engineSound.setProfile(engine.soundProfile);
    if (!isSoundActive) {
      setRpm(engine.idleRpm);
      setSpeedKmh(0);
      speedRef.current = 0;
    }
  }, [engine.soundProfile, engine.idleRpm, isSoundActive]);

  // Subscribe to audio synthesizer events
  useEffect(() => {
    const unsubRpm = engineSound.subscribeRpm((currentRpm) => {
      setRpm(currentRpm);
      onRpmChange?.(currentRpm);
    });

    const unsubBoost = engineSound.subscribeBoost((boost) => {
      setBoostPsi(boost);
    });

    const unsubGear = engineSound.subscribeGear((g) => {
      setCurrentGear(g);
    });

    const unsubExhaust = engineSound.subscribeExhaustEvent(() => {
      setIsBackfireFiring(true);
      setTimeout(() => setIsBackfireFiring(false), 350);
    });

    return () => {
      unsubRpm();
      unsubBoost();
      unsubGear();
      unsubExhaust();
    };
  }, [onRpmChange]);

  // Physics calculation loop
  useEffect(() => {
    let animId: number;
    const updatePhysics = (time: number) => {
      const dt = Math.min(0.1, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      const calc = calculateRealVehicleSpeed(
        modelType,
        rpm,
        currentGear,
        speedRef.current,
        dt,
        isPedalPressed
      );

      speedRef.current = calc.speedKmh;
      setSpeedKmh(Math.round(calc.speedKmh));
      onMechanicsChange?.(calc);

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [modelType, rpm, currentGear, isPedalPressed, onMechanicsChange]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!isPedalPressed) {
          handlePedalDown(1.0);
        }
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleIgnitionToggle();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleToggle2Step();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        engineSound.triggerBlowOffValve();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        engineSound.triggerExhaustBackfire();
      } else if (e.key === 'q' || e.key === 'Q') {
        handleShiftDown();
      } else if (e.key === 'e' || e.key === 'E') {
        handleShiftUp();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handlePedalUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPedalPressed, isSoundActive, currentGear]);

  const handlePedalDown = (amount: number = 1.0) => {
    if (!isSoundActive) {
      onToggleSound();
    }
    setIsPedalPressed(true);
    setPedalThrottle(amount);
    engineSound.setThrottle(amount);
  };

  const handlePedalUp = () => {
    setIsPedalPressed(false);
    setPedalThrottle(0);
    engineSound.setThrottle(0);
  };

  const handleIgnitionToggle = () => {
    if (!isSoundActive) {
      setIsColdStarting(true);
      engineSound.triggerColdStart(() => {
        setIsColdStarting(false);
      });
      onToggleSound();
    } else {
      engineSound.stop();
      onToggleSound();
      setIs2StepActive(false);
    }
  };

  const handleToggle2Step = () => {
    const nextVal = !is2StepActive;
    setIs2StepActive(nextVal);
    engineSound.toggleLaunchControl(nextVal);
    if (nextVal && !isSoundActive) {
      onToggleSound();
    }
  };

  const handleShiftUp = () => {
    if (typeof currentGear === 'number') {
      const nextGear = Math.min(6, currentGear + 1) as GearPosition;
      engineSound.setGear(nextGear);
      setCurrentGear(nextGear);
      engineSound.triggerExhaustBackfire();
    } else if (currentGear === 'N') {
      engineSound.setGear(1);
      setCurrentGear(1);
    }
  };

  const handleShiftDown = () => {
    if (typeof currentGear === 'number') {
      const nextGear = Math.max(1, currentGear - 1) as GearPosition;
      engineSound.setGear(nextGear);
      setCurrentGear(nextGear);
      engineSound.triggerThrottleBlip();
    }
  };

  const handleSelectValve = (mode: ExhaustValveMode) => {
    setValveMode(mode);
    engineSound.setValveMode(mode);
  };

  const redline = engine.redlineRpm || 7500;
  const idle = engine.idleRpm || 0;
  const rpmPct = Math.min(1, Math.max(0, (rpm - idle) / (Math.max(1, redline - idle))));
  const isAtRedline = rpm >= redline * 0.95;
  const hpOutput = Math.round(rpmPct * engine.powerHp);
  const torqueOutput = Math.round(Math.min(1, rpmPct * 1.2) * engine.torqueNm);

  const radius = 80;
  const circumference = 2 * Math.PI * radius * 0.75;
  const strokeDashoffset = circumference - rpmPct * circumference;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none flex flex-col items-center select-none font-sans">
      {/* Dynamic Exhaust Detonation Flash */}
      <AnimatePresence>
        {isBackfireFiring && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 pointer-events-none z-50 bg-gradient-to-t from-orange-600/30 via-red-600/10 to-transparent mix-blend-screen"
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-auto w-full max-w-4xl px-3 pb-3">
        <div className="relative rounded-2xl bg-black/88 backdrop-blur-2xl border border-white/15 shadow-[0_8px_40px_rgba(0,0,0,0.85)] p-3 sm:p-5 overflow-hidden transition-all">
          <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:8px_8px] opacity-25 pointer-events-none" />

          {/* Top Bar inside Cockpit: Vehicle name, Camera Presets, Collapse toggle & Status */}
          <div className="relative z-10 flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="font-mono font-black tracking-widest text-white uppercase text-sm truncate max-w-[200px]">
                {engine.name}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-neutral-300 border border-white/10">
                {engine.aspiration}
              </span>
            </div>

            {/* Quick Camera Preset Gliders */}
            {onSelectCameraPreset && (
              <div className="hidden md:flex items-center bg-neutral-900 rounded-lg p-0.5 border border-white/10 text-[10px] font-mono">
                {(['hero', 'front', 'rear', 'exhaust', 'wheel', 'engine'] as CameraPreset[]).map(
                  (angle) => (
                    <button
                      key={angle}
                      onClick={() => onSelectCameraPreset(angle)}
                      className={`px-2 py-1 rounded uppercase font-bold transition-all cursor-pointer ${
                        currentCameraPreset === angle
                          ? 'bg-amber-400 text-black shadow-md'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {angle}
                    </button>
                  )
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Sound Lab Trigger Button */}
              {onOpenSoundLab && (
                <button
                  onClick={onOpenSoundLab}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
                  title="Open Sound Lab"
                >
                  <AnimatedAudioBarsIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">SOUND LAB</span>
                </button>
              )}

              {/* AI Studio Trigger Button */}
              {onOpenAiStudio && (
                <button
                  onClick={onOpenAiStudio}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
                  title="Generate Car with Beast AI"
                >
                  <AnimatedAiSparkIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">BEAST AI</span>
                </button>
              )}

              {/* Exhaust Valve Mode Selector */}
              <div className="flex items-center bg-neutral-900/90 rounded-lg p-0.5 border border-white/10 text-[11px] font-mono">
                {(['quiet', 'sport', 'track'] as ExhaustValveMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleSelectValve(mode)}
                    className={`px-2 py-1 rounded-md uppercase font-bold transition-all cursor-pointer ${
                      valveMode === mode
                        ? mode === 'track'
                          ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                          : 'bg-white/20 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {mode === 'track' ? 'BEAST' : mode}
                  </button>
                ))}
              </div>

              {/* Minimize/Expand Toggle */}
              <button
                onClick={() => setIsCockpitCollapsed(!isCockpitCollapsed)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all cursor-pointer"
                title={isCockpitCollapsed ? 'Expand Cockpit' : 'Minimize Cockpit'}
              >
                {isCockpitCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collapsible Cockpit Body */}
          {!isCockpitCollapsed && (
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* LEFT COLUMN: Telemetry Gauges (Speed, Boost, Power) */}
              <div className="md:col-span-4 flex flex-col gap-2 bg-neutral-900/60 rounded-xl p-3 border border-white/10">
                {/* Speedometer */}
                <div className="flex items-baseline justify-between border-b border-white/10 pb-1.5">
                  <span className="text-[11px] font-mono text-neutral-400 tracking-wider flex items-center gap-1.5">
                    <AnimatedSpeedometerIcon className="w-4 h-4 text-cyan-400" />
                    <span>SPEED</span>
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono tracking-tight text-white">
                      {speedKmh}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">KM/H</span>
                  </div>
                </div>

                {/* Boost Gauge (if forced induction) */}
                {engine.maxBoostPsi && engine.maxBoostPsi > 0 ? (
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                      <AnimatedTurboIcon className="w-3.5 h-3.5" /> BOOST
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-75"
                          style={{ width: `${(boostPsi / engine.maxBoostPsi) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono font-bold text-white w-12 text-right">
                        {boostPsi} <span className="text-[9px] text-neutral-400">PSI</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-[11px] font-mono text-neutral-400">
                    <span className="flex items-center gap-1">
                      <AnimatedEngineIcon className="w-3.5 h-3.5 text-amber-400" /> ASPIRATION
                    </span>
                    <span className="text-amber-400 font-bold">{engine.aspiration}</span>
                  </div>
                )}

                {/* Live Dyno Output (HP & Torque) */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                  <div className="bg-black/50 rounded-lg p-1.5 border border-white/5">
                    <span className="text-neutral-500 block text-[9px]">LIVE POWER</span>
                    <span className="text-sm font-bold text-amber-400">{hpOutput}</span>
                    <span className="text-[9px] text-neutral-400 ml-1">HP</span>
                  </div>
                  <div className="bg-black/50 rounded-lg p-1.5 border border-white/5">
                    <span className="text-neutral-500 block text-[9px]">LIVE TORQUE</span>
                    <span className="text-sm font-bold text-red-400">{torqueOutput}</span>
                    <span className="text-[9px] text-neutral-400 ml-1">NM</span>
                  </div>
                </div>
              </div>

              {/* CENTER COLUMN: Curved Radial OLED Tachometer & Shift Lights */}
              <div className="md:col-span-4 flex flex-col items-center justify-center relative py-1">
                {/* Shift Lights Arc */}
                <div className="flex gap-1 mb-1">
                  {[0.6, 0.7, 0.8, 0.88, 0.94, 0.98].map((threshold, idx) => {
                    const isLit = rpmPct >= threshold;
                    const isFlashingRed = isAtRedline && threshold > 0.9;
                    const color =
                      idx < 2 ? 'bg-emerald-500' : idx < 4 ? 'bg-amber-400' : 'bg-red-500';
                    return (
                      <div
                        key={idx}
                        className={`w-3.5 h-1.5 rounded-sm transition-all duration-75 ${
                          isLit
                            ? `${color} shadow-[0_0_8px_currentColor] ${isFlashingRed ? 'animate-ping' : ''}`
                            : 'bg-neutral-800 border border-white/5'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* SVG Radial Gauge */}
                <div className="relative w-44 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-135" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke="#262626"
                      strokeWidth="12"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * 0.25}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke={isAtRedline ? '#ef4444' : rpmPct > 0.7 ? '#f59e0b' : '#38bdf8'}
                      strokeWidth="12"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-75"
                    />
                  </svg>

                  {/* Center Digital Readout */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400">RPM</span>
                    <span
                      className={`text-2xl font-black font-mono tracking-tighter ${
                        isAtRedline ? 'text-red-500 animate-pulse' : 'text-white'
                      }`}
                    >
                      {rpm}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[11px] font-mono font-bold text-neutral-400">GEAR</span>
                      <span className="text-base font-black font-mono px-1.5 py-0.2 rounded bg-white/10 text-white border border-white/20">
                        {currentGear}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Paddle Shifter Buttons */}
                <div className="flex items-center gap-4 mt-1">
                  <button
                    onClick={handleShiftDown}
                    className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-white/10 text-xs font-mono font-bold cursor-pointer transition-all active:scale-95"
                    title="Downshift Paddle (Press Q)"
                  >
                    ◀ DOWN (Q)
                  </button>
                  <button
                    onClick={handleShiftUp}
                    className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-white/10 text-xs font-mono font-bold cursor-pointer transition-all active:scale-95"
                    title="Upshift Paddle (Press E)"
                  >
                    UP (E) ▶
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Heavy Billet Metal Throttle Pedal & Action Buttons */}
              <div className="md:col-span-4 flex flex-col gap-2 items-center justify-center">
                <div
                  ref={pedalRef}
                  onMouseDown={() => handlePedalDown(1.0)}
                  onMouseUp={handlePedalUp}
                  onMouseLeave={handlePedalUp}
                  onTouchStart={() => handlePedalDown(1.0)}
                  onTouchEnd={handlePedalUp}
                  className={`w-full max-w-[200px] h-24 rounded-xl relative cursor-pointer select-none transition-all flex flex-col items-center justify-center border-2 shadow-2xl active:scale-[0.98] ${
                    isPedalPressed
                      ? 'bg-gradient-to-b from-red-600 via-orange-600 to-amber-700 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.6)] translate-y-1'
                      : 'bg-gradient-to-b from-neutral-800 via-neutral-900 to-black border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  <div className="flex flex-col gap-1.5 w-3/4 mb-1 pointer-events-none">
                    <div className="h-1 bg-white/20 rounded-full" />
                    <div className="h-1 bg-white/20 rounded-full" />
                    <div className="h-1 bg-white/20 rounded-full" />
                    <div className="h-1 bg-white/20 rounded-full" />
                  </div>
                  <span className="font-mono font-black text-sm tracking-wider text-white uppercase pointer-events-none flex items-center gap-1.5">
                    <Flame className={`w-4 h-4 ${isPedalPressed ? 'text-amber-200 animate-bounce' : 'text-red-500'}`} />
                    {isPedalPressed ? 'REV WIDE OPEN' : 'PRESS & HOLD'}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-400 pointer-events-none mt-0.5">
                    (or hold Spacebar / ↑)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 w-full max-w-[220px]">
                  <button
                    onClick={handleIgnitionToggle}
                    className={`py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSoundActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30 animate-pulse'
                    }`}
                    title="Start / Stop Engine (Press S)"
                  >
                    <span>IGNITION</span>
                    <span className="text-[8px] opacity-75">{isSoundActive ? 'STOP' : 'START'}</span>
                  </button>

                  <button
                    onClick={handleToggle2Step}
                    className={`py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                      is2StepActive
                        ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-white/10'
                    }`}
                    title="2-Step Launch Limiter (Press L)"
                  >
                    <span>2-STEP</span>
                    <span className="text-[8px] opacity-75">{is2StepActive ? 'ACTIVE' : 'LAUNCH'}</span>
                  </button>

                  <button
                    onClick={() => engineSound.triggerExhaustBackfire()}
                    className="py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold bg-neutral-800 hover:bg-red-950 text-neutral-300 hover:text-red-300 border border-white/10 hover:border-red-500/50 transition-all cursor-pointer flex flex-col items-center justify-center active:scale-95"
                    title="Gunshot Pops & Flames (Press P)"
                  >
                    <span>POPS</span>
                    <span className="text-[8px] opacity-75">BANGS</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
