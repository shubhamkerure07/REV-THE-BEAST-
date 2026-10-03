import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Zap,
  Activity,
  Gauge,
  Sliders,
  Flag,
  Volume2,
  Maximize2,
  Check,
  Compass,
} from 'lucide-react';
import { CarModelType, CameraPreset, ExhaustMaterial } from '../types';
import { getVehicleMedia, VehiclePhotoAngle } from '../data/vehicleMedia';
import { getEngineForModel } from '../data/engines';
import { VEHICLE_SPECS_MAP } from '../data/vehicleSpecs';
import { engineSound } from '../utils/audio';

interface EditorialCarDetailProps {
  modelType: CarModelType;
  onBack: () => void;
  onCustomize: (model: CarModelType) => void;
  onRace: (model: CarModelType) => void;
  onOpenSoundLab: (model: CarModelType) => void;
}

const GALLERY_ANGLES: { id: CameraPreset; label: string }[] = [
  { id: 'hero', label: 'HERO' },
  { id: 'front', label: 'FRONT' },
  { id: 'side', label: 'SIDE PROFILE' },
  { id: 'rear', label: 'REAR & WING' },
  { id: 'detail', label: 'CARBON DETAIL' },
  { id: 'interior', label: 'COCKPIT' },
  { id: 'engine', label: 'POWERTRAIN' },
  { id: 'wheel', label: 'ALLOY WHEEL' },
  { id: 'exhaust', label: 'EXHAUST SYSTEM' },
];

export const EditorialCarDetail: React.FC<EditorialCarDetailProps> = ({
  modelType,
  onBack,
  onCustomize,
  onRace,
  onOpenSoundLab,
}) => {
  const media = getVehicleMedia(modelType);
  const engine = getEngineForModel(modelType);
  const specs = VEHICLE_SPECS_MAP[modelType] || VEHICLE_SPECS_MAP['procedural-m4'];

  const [activeAngle, setActiveAngle] = useState<CameraPreset>('hero');
  const [selectedExhaustMat, setSelectedExhaustMat] = useState<ExhaustMaterial>('titanium');
  const [isPlayingAcoustic, setIsPlayingAcoustic] = useState<boolean>(false);

  const currentPhoto: VehiclePhotoAngle = media.photos[activeAngle] || media.photos.hero;

  const handleAuditionExhaust = (mat: ExhaustMaterial) => {
    setSelectedExhaustMat(mat);
    engineSound.setProfile(engine.soundProfile);
    engineSound.setExhaustMaterial(mat);
    engineSound.start();
    setIsPlayingAcoustic(true);

    setTimeout(() => engineSound.setThrottle(0.85), 150);
    setTimeout(() => engineSound.setThrottle(0.2), 900);
    setTimeout(() => {
      engineSound.triggerExhaustBackfire();
      engineSound.setThrottle(0);
    }, 1500);
    setTimeout(() => {
      engineSound.stop();
      setIsPlayingAcoustic(false);
    }, 2400);
  };

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-neutral-100 select-none pt-24 pb-28">
      {/* 1. TOP BREADCRUMB & BACK NAV */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 mb-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN TO FLEET</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onCustomize(modelType)}
            className="px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 font-mono text-xs uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>CUSTOMIZE</span>
          </button>

          <button
            onClick={() => onRace(modelType)}
            className="px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs uppercase font-black tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>RACE THIS CAR</span>
          </button>
        </div>
      </div>

      {/* 2. CINEMATIC PRODUCT HERO HEADER */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 mb-12">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <span
              className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-3 inline-block"
              style={{
                backgroundColor: `${media.accentHex}22`,
                borderColor: `${media.accentHex}66`,
                color: media.accentHex,
              }}
            >
              {media.badge} • {media.category}
            </span>
            <h1 className="font-syne font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tighter uppercase leading-[0.95]">
              {media.name}
            </h1>
          </div>
          <p className="text-sm font-sans font-light text-neutral-400 max-w-md text-left md:text-right">
            {media.tagline}
          </p>
        </div>
      </div>

      {/* 3. MULTI-ANGLE 4K PHOTOGRAPHY SHOWCASE */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 mb-16">
        {/* Main Display Stage */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-neutral-900 border border-white/[0.08] shadow-2xl h-[55vh] sm:h-[65vh] md:h-[75vh]">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.title}
            onError={(e) => {
              e.currentTarget.src = media.photos.hero.url;
            }}
            className="w-full h-full object-cover sm:object-contain object-center transition-all duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Caption Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block mb-1">
                // ANGLE: {activeAngle.toUpperCase()}
              </span>
              <h3 className="font-syne font-bold text-xl sm:text-2xl text-white">
                {currentPhoto.title}
              </h3>
              <p className="text-xs text-neutral-300 font-sans mt-0.5 max-w-lg">
                {currentPhoto.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* 9-Angle Photography Switcher Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] scrollbar-thin">
          {GALLERY_ANGLES.map((angle) => {
            const isActive = activeAngle === angle.id;
            return (
              <button
                key={angle.id}
                onClick={() => setActiveAngle(angle.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {angle.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. PERFORMANCE TELEMETRY SECTION */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 mb-20">
        <div className="border-t border-white/[0.08] pt-12">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block mb-3">
            // TELEMETRY BENCHMARKS
          </span>
          <h2 className="font-syne font-black text-3xl sm:text-5xl text-white tracking-tighter uppercase mb-8">
            BY THE NUMBERS.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-2">
                PEAK HORSEPOWER
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-grotesk font-black text-4xl sm:text-5xl text-amber-400">
                  {engine.powerHp}
                </span>
                <span className="text-xs font-mono text-neutral-400">HP</span>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                {specs.power.split('@')[1] || '@ REDLINE'}
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-2">
                PEAK TORQUE
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-grotesk font-black text-4xl sm:text-5xl text-white">
                  {engine.torqueNm}
                </span>
                <span className="text-xs font-mono text-neutral-400">NM</span>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                {specs.torque.split('@')[1] || 'INSTANT RESPONSE'}
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-2">
                0 — 100 KM/H
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-grotesk font-black text-4xl sm:text-5xl text-white">
                  {media.keySpecs.zeroToSixty.split(' ')[0]}
                </span>
                <span className="text-xs font-mono text-neutral-400">SEC</span>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                LAUNCH ACCELERATION
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-2">
                TOP SPEED
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-grotesk font-black text-4xl sm:text-5xl text-white">
                  {media.keySpecs.topSpeed.split(' ')[0]}
                </span>
                <span className="text-xs font-mono text-neutral-400">KM/H</span>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                MAX VELOCITY
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ENGINE ARCHITECTURE & FIRING HARMONICS */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-8 sm:p-12 rounded-3xl bg-neutral-900/50 border border-white/[0.08]">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block">
              // ACOUSTIC & MECHANICAL ANATOMY
            </span>
            <h2 className="font-syne font-black text-3xl sm:text-5xl text-white tracking-tighter uppercase leading-[0.95]">
              {engine.name}
            </h2>
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              {engine.soundDescription}
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-white/[0.06]">
                <span className="text-neutral-400 uppercase">Crank Firing Order</span>
                <span className="text-white font-bold">{engine.firingOrder}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.06]">
                <span className="text-neutral-400 uppercase">Redline Threshold</span>
                <span className="text-amber-400 font-bold">{engine.redlineRpm} RPM</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.06]">
                <span className="text-neutral-400 uppercase">Aspiration</span>
                <span className="text-white font-bold">{engine.aspiration}</span>
              </div>
            </div>

            {/* Quick Test Audio Button */}
            <div className="pt-2">
              <button
                onClick={() => onOpenSoundLab(modelType)}
                className="px-6 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/20 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4 text-amber-400" />
                <span>EXPLORE SOUND LAB</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden bg-black/60 border border-white/10 h-80">
            <img
              src={media.photos.engine.url}
              alt="Engine"
              onError={(e) => {
                e.currentTarget.src = media.photos.hero.url;
              }}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 6. EXHAUST METALLURGY SELECTOR (DIRECT ACOUSTIC AUDITION) */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 mb-20">
        <div className="border-t border-white/[0.08] pt-12">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block mb-3">
            // EXHAUST SYSTEM ACOUSTIC AUDITION
          </span>
          <h2 className="font-syne font-black text-3xl sm:text-5xl text-white tracking-tighter uppercase mb-6">
            METALLURGIC HARMONICS.
          </h2>
          <p className="text-sm text-neutral-400 max-w-xl mb-8 font-sans">
            Selecting different exhaust alloys shifts the frequency formants, backpressure resonance, and
            combustion rasp in real time. Click an alloy to audition.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'titanium',
                name: 'Burnt Titanium Race',
                desc: 'Ultralight 0.8mm thin wall. Searing high-RPM metallic howl with aggressive flame bursts.',
              },
              {
                id: 'carbon',
                name: 'Carbon Inconel',
                desc: 'Carbon composite shrouded tips. Dampened midrange with crisp acoustic sharpness.',
              },
              {
                id: 'racing',
                name: 'Straight-Pipe Decat',
                desc: 'Zero backpressure catalytic delete. Raw, unfiltered combustion explosions on overrun.',
              },
              {
                id: 'chrome',
                name: 'Factory Chrome Quad',
                desc: 'OEM balance of deep resonant bass and controlled highway cruising quietness.',
              },
            ].map((mat) => {
              const isSelected = selectedExhaustMat === mat.id;
              return (
                <button
                  key={mat.id}
                  onClick={() => handleAuditionExhaust(mat.id as ExhaustMaterial)}
                  className={`p-6 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-400/10 border-amber-400/80 shadow-xl'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-syne font-bold text-lg text-white">{mat.name}</span>
                      {isSelected && isPlayingAcoustic && (
                        <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 font-sans leading-relaxed">{mat.desc}</p>
                  </div>
                  <div className="pt-4 flex items-center gap-2 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>AUDITION EXHAUST</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
