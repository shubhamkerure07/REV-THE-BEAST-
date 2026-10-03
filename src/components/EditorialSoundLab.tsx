import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Zap,
  Activity,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  Disc3,
  Wind,
} from 'lucide-react';
import { CarModelType, ExhaustValveMode, TurboBovStyle } from '../types';
import { ALL_ENGINES, getEngineForModel } from '../data/engines';
import { getVehicleMedia } from '../data/vehicleMedia';
import { engineSound } from '../utils/audio';
import {
  AnimatedAudioBarsIcon,
  AnimatedEngineIcon,
  AnimatedExhaustIcon,
  AnimatedSpeedometerIcon,
  AnimatedTurboIcon,
} from './AnimatedIcons';

interface EditorialSoundLabProps {
  selectedCar: CarModelType;
  onSelectCar: (model: CarModelType) => void;
  onBack: () => void;
  showToast: (msg: string) => void;
}

export const EditorialSoundLab: React.FC<EditorialSoundLabProps> = ({
  selectedCar,
  onSelectCar,
  onBack,
  showToast,
}) => {
  const engine = getEngineForModel(selectedCar);
  const media = getVehicleMedia(selectedCar);

  const [isAudioRunning, setIsAudioRunning] = useState<boolean>(false);
  const [rpm, setRpm] = useState<number>(engine.idleRpm);
  const [boostPsi, setBoostPsi] = useState<number>(0);
  const [throttle, setThrottle] = useState<number>(0);
  const [isPedalPressed, setIsPedalPressed] = useState<boolean>(false);
  const [valveMode, setValveMode] = useState<ExhaustValveMode>('sport');
  const [is2StepActive, setIs2StepActive] = useState<boolean>(false);
  const [isColdStarting, setIsColdStarting] = useState<boolean>(false);
  const [isFlameDetonating, setIsFlameDetonating] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync profile when selected car changes
  useEffect(() => {
    engineSound.setProfile(engine.soundProfile);
    if (!isAudioRunning) {
      setRpm(engine.idleRpm);
    }
  }, [engine.soundProfile, engine.idleRpm, isAudioRunning]);

  // Subscribe to audio engine updates
  useEffect(() => {
    const unsubRpm = engineSound.subscribeRpm((r) => setRpm(r));
    const unsubBoost = engineSound.subscribeBoost((b) => setBoostPsi(b));
    const unsubExhaust = engineSound.subscribeExhaustEvent(() => {
      setIsFlameDetonating(true);
      setTimeout(() => setIsFlameDetonating(false), 300);
    });

    return () => {
      unsubRpm();
      unsubBoost();
      unsubExhaust();
    };
  }, []);

  // Keyboard controls: Space to rev, S to ignite, B to blow off
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!isPedalPressed) {
          handlePedalDown(1.0);
        }
      } else if (e.key === 's' || e.key === 'S') {
        handleIgnitionToggle();
      } else if (e.key === 'b' || e.key === 'B') {
        engineSound.triggerBlowOffValve();
      } else if (e.key === 'l' || e.key === 'L') {
        handleToggle2Step();
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
  }, [isPedalPressed, isAudioRunning]);

  // Oscilloscope & Spectrum Visualizer Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderSpectrum = () => {
      animId = requestAnimationFrame(renderSpectrum);
      const analyser = engineSound.getAnalyser();

      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid lines
      ctx.strokeStyle = '#ffffff08';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      if (!analyser || !isAudioRunning) {
        // Idle flat-line waveform
        ctx.strokeStyle = '#f59e0b44';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

        // Gradient from Sant'Agata amber to racing red
        const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(0.7, '#ef4444');
        grad.addColorStop(1, '#ffffff');

        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
        if (x > canvas.width) break;
      }
    };

    renderSpectrum();
    return () => cancelAnimationFrame(animId);
  }, [isAudioRunning]);

  const handleIgnitionToggle = () => {
    if (!isAudioRunning) {
      setIsColdStarting(true);
      engineSound.triggerColdStart(() => {
        setIsColdStarting(false);
      });
      setIsAudioRunning(true);
      showToast('Ignition cranked • Engine alive at idle');
    } else {
      engineSound.stop();
      setIsAudioRunning(false);
      setIs2StepActive(false);
      showToast('Ignition stopped');
    }
  };

  const handlePedalDown = (amt: number = 1.0) => {
    if (!isAudioRunning) {
      handleIgnitionToggle();
    }
    setIsPedalPressed(true);
    setThrottle(amt);
    engineSound.setThrottle(amt);
  };

  const handlePedalUp = () => {
    setIsPedalPressed(false);
    setThrottle(0);
    engineSound.setThrottle(0);
  };

  const handleSelectValve = (mode: ExhaustValveMode) => {
    setValveMode(mode);
    engineSound.setValveMode(mode);
    showToast(`Exhaust Valve: ${mode.toUpperCase()}`);
  };

  const handleToggle2Step = () => {
    const nextVal = !is2StepActive;
    setIs2StepActive(nextVal);
    engineSound.toggleLaunchControl(nextVal);
    if (nextVal && !isAudioRunning) {
      handleIgnitionToggle();
    }
    showToast(nextVal ? '2-Step Launch Limiter Armed (Hold Spacebar!)' : '2-Step Disarmed');
  };

  const redline = engine.redlineRpm || 8000;
  const idle = engine.idleRpm || 800;
  const rpmRatio = Math.min(1, Math.max(0, (rpm - idle) / (redline - idle)));
  const isNearRedline = rpm >= redline * 0.95;

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-neutral-100 select-none pt-24 pb-28 px-6 sm:px-12 md:px-16">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/[0.08] pb-6 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold">
                PHYSICAL ACOUSTIC LAB
              </span>
            </div>
            <h1 className="font-syne font-black text-4xl sm:text-6xl text-white tracking-tighter uppercase leading-[0.95]">
              SOUND LAB.
            </h1>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>BACK TO PRODUCT</span>
          </button>
        </div>

        {/* Powertrain Architectural Selector Row */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block mb-3">
            SELECT VEHICLE ACOUSTIC ARCHITECTURE
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {ALL_ENGINES.slice(0, 6).map((eng) => {
              const isSelected = selectedCar === eng.vehicleModel;
              return (
                <button
                  key={eng.id}
                  onClick={() => onSelectCar(eng.vehicleModel)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-400/15 border-amber-400 text-white shadow-xl'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20 text-neutral-400'
                  }`}
                >
                  <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider block mb-1">
                    {eng.cylinders.split(' ')[0]}
                  </span>
                  <span className="font-syne font-bold text-xs text-white truncate block">
                    {eng.name.split(' ')[0]} {eng.name.split(' ')[1]}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 mt-2 block">
                    {eng.redlineRpm} RPM MAX
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Acoustic Laboratory Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLS: OSCILLOSCOPE CANVAS & RPM TACHOMETER */}
          <div className="lg:col-span-7 space-y-6">
            {/* Real-Time HTML5 Spectrum Oscilloscope */}
            <div className="relative rounded-3xl overflow-hidden bg-[#0a0a0f] border border-white/[0.08] shadow-2xl p-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs font-mono">
                <span className="text-neutral-400 flex items-center gap-2">
                  <AnimatedAudioBarsIcon className="w-4 h-4 text-amber-400" />
                  <span>ACOUSTIC FREQUENCY SPECTRUM (FOURIER HARMONICS)</span>
                </span>
                <span className={`font-bold ${isAudioRunning ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  {isAudioRunning ? 'AUDIO RUNNING' : 'MUTED'}
                </span>
              </div>

              <canvas
                ref={canvasRef}
                width={700}
                height={220}
                className="w-full h-52 mt-3 rounded-xl bg-black/60"
              />

              {/* Flame detonation flash */}
              {isFlameDetonating && (
                <div className="absolute inset-0 bg-red-600/20 mix-blend-screen pointer-events-none animate-pulse" />
              )}
            </div>

            {/* Tachometer Readout Banner */}
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                  LIVE CRANK SPEED
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`font-grotesk font-black text-5xl sm:text-6xl ${
                      isNearRedline ? 'text-rose-500 animate-pulse' : 'text-white'
                    }`}
                  >
                    {Math.round(rpm)}
                  </span>
                  <span className="text-sm font-mono text-neutral-400 font-bold">RPM</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 font-mono text-xs">
                <span className="text-neutral-400">
                  REDLINE: <strong className="text-amber-400">{engine.redlineRpm} RPM</strong>
                </span>
                <span className="text-neutral-400">
                  BOOST: <strong className="text-cyan-400">{boostPsi} PSI</strong>
                </span>
                <span className="text-neutral-400">
                  VALVES: <strong className="text-rose-400 uppercase">{valveMode}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: TACTILE PEDAL & ACOUSTIC CONTROLS */}
          <div className="lg:col-span-5 space-y-6">
            {/* Ignition Starter Switch */}
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="font-syne font-bold text-lg text-white block">Engine Ignition</span>
                <span className="text-xs text-neutral-400 font-sans">
                  {isAudioRunning ? 'Online at idle' : 'Press to crank starter motor'}
                </span>
              </div>

              <button
                onClick={handleIgnitionToggle}
                className={`px-6 py-3.5 rounded-full font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xl ${
                  isAudioRunning
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20'
                }`}
              >
                {isColdStarting ? 'CRANKING...' : isAudioRunning ? 'STOP ENGINE' : 'START ENGINE'}
              </button>
            </div>

            {/* INTERACTIVE HEAVY BILLET THROTTLE PEDAL */}
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold">
                  TACTILE BILLET THROTTLE PEDAL
                </span>
                <span className="text-xs font-mono text-amber-400">PRESS & HOLD (OR SPACEBAR)</span>
              </div>

              {/* Big Machined Aluminum Pedal */}
              <div
                onMouseDown={() => handlePedalDown(1.0)}
                onMouseUp={handlePedalUp}
                onTouchStart={() => handlePedalDown(1.0)}
                onTouchEnd={handlePedalUp}
                className={`relative w-full h-36 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer select-none shadow-2xl ${
                  isPedalPressed
                    ? 'bg-gradient-to-b from-amber-500 via-amber-600 to-rose-600 border-amber-300 scale-[0.98] shadow-amber-500/40 text-black'
                    : 'bg-gradient-to-b from-neutral-800 to-neutral-900 border-white/20 hover:border-white/40 text-white'
                }`}
              >
                {/* Machined Billet Grooves */}
                <div className="flex flex-col gap-2 w-3/4 opacity-40">
                  <div className="h-1.5 bg-black/60 rounded-full" />
                  <div className="h-1.5 bg-black/60 rounded-full" />
                  <div className="h-1.5 bg-black/60 rounded-full" />
                  <div className="h-1.5 bg-black/60 rounded-full" />
                </div>

                <div className="mt-3 flex items-center gap-2 font-mono text-sm font-black uppercase tracking-widest">
                  <Flame className="w-5 h-5 fill-current" />
                  <span>{isPedalPressed ? 'FULL THROTTLE // WIDE OPEN' : 'PRESS & HOLD TO REV'}</span>
                </div>
              </div>
            </div>

            {/* Acoustic Laboratory Switches: Valves, 2-Step, Blow-Off */}
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block mb-2">
                EXHAUST FLAP & OVERRUN TRIGGER
              </span>

              {/* Exhaust Valve Modes */}
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {(['quiet', 'sport', 'track'] as ExhaustValveMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleSelectValve(mode)}
                    className={`py-2 rounded-xl uppercase font-bold tracking-wider border transition-all cursor-pointer ${
                      valveMode === mode
                        ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                        : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {mode === 'track' ? 'BEAST' : mode}
                  </button>
                ))}
              </div>

              {/* 2-Step and Blow-off Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleToggle2Step}
                  className={`p-3 rounded-2xl border font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    is2StepActive
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg animate-pulse'
                      : 'bg-white/[0.03] border-white/[0.08] text-neutral-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{is2StepActive ? '2-STEP ARMED' : 'ARM 2-STEP'}</span>
                </button>

                <button
                  onClick={() => {
                    engineSound.triggerBlowOffValve();
                    showToast('Turbo surge blow-off flutter triggered!');
                  }}
                  className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span>BLOW-OFF (STU-TU)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
