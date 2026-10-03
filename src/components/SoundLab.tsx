import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Volume2,
  VolumeX,
  Wind,
  Zap,
  Sliders,
  Sparkles,
  RotateCcw,
  Check,
  X,
  FastForward,
} from 'lucide-react';
import { engineSound } from '../utils/audio';
import {
  CarModelType,
  EngineSoundProfile,
  ExhaustMaterial,
  ExhaustStyle,
  TurboBovStyle,
} from '../types';
import { ALL_ENGINES, getEngineForModel } from '../data/engines';
import { AUDIO_MANIFEST } from '../data/audioManifest';
import {
  AnimatedAudioBarsIcon,
  AnimatedExhaustIcon,
  AnimatedEngineIcon,
  AnimatedTurboIcon,
} from './AnimatedIcons';

interface SoundLabProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: CarModelType;
  onSelectModel: (model: CarModelType) => void;
  onChangeCameraAngle?: (angle: 'exhaust' | 'engine' | 'hero') => void;
  onChangeExhaustConfig?: (style: ExhaustStyle, material: ExhaustMaterial) => void;
}

export const SoundLab: React.FC<SoundLabProps> = ({
  isOpen,
  onClose,
  currentModel,
  onSelectModel,
  onChangeCameraAngle,
  onChangeExhaustConfig,
}) => {
  const engine = getEngineForModel(currentModel);
  const [selectedExhaust, setSelectedExhaust] = useState<ExhaustStyle>('quad');
  const [selectedMaterial, setSelectedMaterial] = useState<ExhaustMaterial>('titanium');
  const [selectedBov, setSelectedBov] = useState<TurboBovStyle>('wrc-flutter');
  const [isThrottling, setIsThrottling] = useState<boolean>(false);
  const [rpm, setRpm] = useState<number>(engine.idleRpm);

  // Audio spectrum visualizer canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const unsub = engineSound.subscribeRpm((r) => setRpm(r));
    return unsub;
  }, []);

  // Connect live Web Audio Analyser to Canvas visualizer
  useEffect(() => {
    if (!isOpen) return;
    let animId: number;

    const renderSpectrum = () => {
      const canvas = canvasRef.current;
      const analyser = engineSound.getAnalyser();
      if (canvas && analyser) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 2.2;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
            grad.addColorStop(0, '#ef4444');
            grad.addColorStop(0.5, '#f59e0b');
            grad.addColorStop(1, '#38bdf8');

            ctx.fillStyle = grad;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
          }
        }
      }
      animId = requestAnimationFrame(renderSpectrum);
    };

    animId = requestAnimationFrame(renderSpectrum);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExhaustChange = (style: ExhaustStyle, material: ExhaustMaterial) => {
    setSelectedExhaust(style);
    setSelectedMaterial(material);
    engineSound.setExhaustMaterial(material);
    onChangeExhaustConfig?.(style, material);
    onChangeCameraAngle?.('exhaust');
  };

  const handleModelChange = (model: CarModelType) => {
    onSelectModel(model);
    const eng = getEngineForModel(model);
    engineSound.setProfile(eng.soundProfile);
    onChangeCameraAngle?.('engine');
  };

  const handleThrottleDown = () => {
    setIsThrottling(true);
    engineSound.setThrottle(1.0);
  };

  const handleThrottleUp = () => {
    setIsThrottling(false);
    engineSound.setThrottle(0);
  };

  const manifestEntry = AUDIO_MANIFEST.find((m) => m.id === engine.soundProfile);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-x-2 bottom-3 top-16 md:inset-x-6 md:bottom-6 md:top-20 z-50 rounded-3xl bg-black/92 backdrop-blur-3xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col font-sans pointer-events-auto"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white shadow-lg">
              <AnimatedAudioBarsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-mono tracking-tight text-white flex items-center gap-2">
                <span>SOUND LAB & ACOUSTIC TUNER</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/30 text-red-400 border border-red-500/30 uppercase font-bold">
                  PHYSICAL MODELING
                </span>
              </h2>
              <p className="text-xs font-mono text-neutral-400">
                Interactive real-time connection: 3D Vehicle Geometry ↔ Engine Architecture ↔ Exhaust Acoustics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound Lab Body (Two-Column Layout) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto p-4 sm:p-6 gap-6">
          {/* LEFT COLUMN: Controls, Engine & Exhaust Selectors */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* 1. Vehicle & Engine Selection */}
            <div>
              <label className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase flex items-center gap-1.5 mb-2.5">
                <AnimatedEngineIcon className="w-4 h-4 text-amber-400" />
                <span>1. SELECT POWERPLANT / ARCHITECTURE</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_ENGINES.map((eng) => {
                  const isSelected = currentModel === eng.vehicleModel;
                  return (
                    <button
                      key={eng.id}
                      onClick={() => handleModelChange(eng.vehicleModel)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-800 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50'
                          : 'bg-neutral-950/80 border-white/10 hover:border-white/25 hover:bg-neutral-900'
                      }`}
                    >
                      <span className="block text-xs font-black font-mono text-white truncate">
                        {eng.name}
                      </span>
                      <span className="block text-[10px] font-mono text-neutral-400 mt-0.5">
                        {eng.displacement} • {eng.powerHp} HP
                      </span>
                      <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-amber-300">
                        {eng.aspiration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Exhaust System & Material Tuner */}
            <div>
              <label className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase flex items-center gap-1.5 mb-2.5">
                <AnimatedExhaustIcon className="w-4 h-4 text-red-400" />
                <span>2. EXHAUST SYSTEM & MATERIAL CONFIGURATION</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'titanium' as ExhaustMaterial, name: 'Burnt Titanium', note: 'Crisp metallic ring & blue tips' },
                  { id: 'carbon' as ExhaustMaterial, name: 'Matte Carbon', note: 'Deep resonant bass & thermal sleeve' },
                  { id: 'racing' as ExhaustMaterial, name: 'Racing Straight-Pipe', note: 'Max volume & unfiltered rasp' },
                  { id: 'chrome' as ExhaustMaterial, name: 'Polished Chrome', note: 'Balanced OEM sports tone' },
                ].map((mat) => {
                  const isSelected = selectedMaterial === mat.id;
                  return (
                    <button
                      key={mat.id}
                      onClick={() => handleExhaustChange(selectedExhaust, mat.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-800 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-1 ring-red-500/50'
                          : 'bg-neutral-950/80 border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-white">{mat.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-red-400" />}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 mt-1 block">
                        {mat.note}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Forced Induction / Turbo Surge (if applicable) */}
            {engine.maxBoostPsi && engine.maxBoostPsi > 0 && (
              <div>
                <label className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase flex items-center gap-1.5 mb-2.5">
                  <AnimatedTurboIcon className="w-4 h-4 text-cyan-400" />
                  <span>3. TURBOCHARGER BLOW-OFF & COMPRESSOR SURGE</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => engineSound.triggerBlowOffValve()}
                    className="flex-1 py-3 px-4 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg"
                  >
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span>TRIGGER BLOW-OFF FLUTTER (STU-TU-TU)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Live Audio Spectrum Analyzer, Real-time Rev Pad & Scientific Manifest */}
          <div className="lg:col-span-5 flex flex-col gap-4 bg-neutral-900/50 rounded-2xl p-4 border border-white/10">
            {/* Real-Time Audio Spectrum Canvas */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-neutral-400 flex items-center gap-1">
                  <AnimatedAudioBarsIcon className="w-3.5 h-3.5" /> LIVE ACOUSTIC SPECTRUM
                </span>
                <span className="text-amber-400 font-bold">{rpm} RPM</span>
              </div>
              <div className="w-full h-24 bg-black/80 rounded-xl overflow-hidden border border-white/10 relative">
                <canvas ref={canvasRef} width={340} height={96} className="w-full h-full" />
              </div>
            </div>

            {/* Large Interactive Rev & Accelerated Test Pad */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <span className="text-xs font-mono font-bold text-neutral-300">
                ACOUSTIC TEST CONTROLS:
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onMouseDown={handleThrottleDown}
                  onMouseUp={handleThrottleUp}
                  onMouseLeave={handleThrottleUp}
                  onTouchStart={handleThrottleDown}
                  onTouchEnd={handleThrottleUp}
                  className={`py-4 px-3 rounded-xl border-2 font-mono font-black text-sm tracking-wider uppercase flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isThrottling
                      ? 'bg-red-600 border-red-400 text-white shadow-[0_0_25px_rgba(239,68,68,0.7)] translate-y-0.5'
                      : 'bg-neutral-800 border-neutral-600 text-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <Flame className="w-5 h-5 text-amber-400 mb-1" />
                  <span>{isThrottling ? 'HOLDING REDLINE' : 'HOLD TO REV'}</span>
                </button>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => engineSound.triggerThrottleBlip()}
                    className="flex-1 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>DOWNSHIFT BLIP</span>
                  </button>

                  <button
                    onClick={() => engineSound.triggerExhaustBackfire()}
                    className="flex-1 py-2 px-3 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-500/30 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>GUNSHOT POP</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Audio Manifest & Transparency Note */}
            {manifestEntry && (
              <div className="mt-auto bg-black/60 rounded-xl p-3 border border-white/10 text-[11px] font-mono flex flex-col gap-1 text-neutral-300">
                <div className="flex items-center justify-between text-neutral-400 pb-1 border-b border-white/10">
                  <span className="font-bold text-white uppercase">{manifestEntry.engine}</span>
                  <span className="text-[9px] text-amber-400">PRO PHYSICAL SYNTH</span>
                </div>
                <div className="pt-1">
                  <span className="text-neutral-500">Firing Timing: </span>
                  <span className="text-neutral-300">{manifestEntry.firingOrder}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Acoustics: </span>
                  <span className="text-neutral-300">{manifestEntry.soundCharacter}</span>
                </div>
                <div className="text-[9px] text-neutral-500 pt-1 border-t border-white/5">
                  License: {manifestEntry.license}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
