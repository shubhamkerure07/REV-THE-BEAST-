import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Palette,
  Disc3,
  Flame,
  ArrowLeft,
  Check,
  Volume2,
  Flag,
  Sparkles,
  Wind,
  Shield,
  Layers,
  Box,
  Camera,
  Zap,
  Gauge,
  Activity,
  Cpu,
} from 'lucide-react';
import {
  CarConfigState,
  CarModelType,
  ExhaustMaterial,
  ExhaustStyle,
  PaintFinish,
  TuningStageConfig,
  CameraPreset,
  StudioEnvironment,
} from '../types';
import { getVehicleMedia } from '../data/vehicleMedia';
import { getEngineForModel } from '../data/engines';
import { engineSound } from '../utils/audio';
import { CarViewer } from '../three/CarViewer';
import { getTunedPerformanceStats } from '../utils/vehicleMechanics';

const AVAILABLE_VEHICLES: { id: CarModelType; name: string; brand: string }[] = [
  { id: 'lambo-aventador', name: 'Aventador SVJ V12', brand: 'Lamborghini' },
  { id: 'procedural-m4', name: 'M4 Competition Coupé', brand: 'BMW' },
  { id: 'nissan-gtr-r35', name: 'GT-R Nismo (R35)', brand: 'Nissan' },
  { id: 'ferrari-sf90', name: 'SF90 Stradale', brand: 'Ferrari' },
  { id: 'bugatti-chiron', name: 'Chiron Super Sport', brand: 'Bugatti' },
  { id: 'mustang-gt', name: 'Mustang GT Fastback', brand: 'Ford' },
  { id: 'gwagon-g63', name: 'AMG G63 G-Wagon', brand: 'Mercedes-AMG' },
  { id: 'bmw-5series', name: '5 Series M Sport', brand: 'BMW' },
  { id: 'beast-v12-ai', name: 'Beast V12 R Prototype', brand: 'Beast AI' },
  { id: 'beast-ev', name: 'Nevera GT (EV)', brand: 'Beast EV' },
  { id: 'ninja-h2r', name: 'Ninja H2R Superbike', brand: 'Kawasaki' },
  { id: 're-gt650', name: 'Continental GT 650', brand: 'Royal Enfield' },
  { id: 're-shotgun650', name: 'Shotgun 650 Bobber', brand: 'Royal Enfield' },
];

const CAMERA_PRESETS: { id: CameraPreset; label: string }[] = [
  { id: 'hero', label: '3/4 Hero' },
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'rear', label: 'Rear' },
  { id: 'wheel', label: 'Wheels' },
  { id: 'exhaust', label: 'Exhaust' },
];

const LIGHTING_ENVIRONMENTS: { id: StudioEnvironment; label: string }[] = [
  { id: 'dark-studio', label: 'Showroom' },
  { id: 'neon-city', label: 'Neon Night' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'city', label: 'Daylight' },
];

interface EditorialCustomizerProps {
  config: CarConfigState;
  onChangeConfig: (updater: (prev: CarConfigState) => CarConfigState) => void;
  onBack: () => void;
  onRace: (model: CarModelType) => void;
  showToast: (msg: string) => void;
}

type CustomizerTab = 'paint' | 'wheels' | 'aero' | 'exhaust' | 'performance';

const ICONIC_PALETTES = [
  { id: 'arancio-atlas', name: 'Arancio Atlas (Amber Orange)', hex: '#f77f21', finish: 'metallic' as PaintFinish },
  { id: 'rosso-mars', name: 'Rosso Mars (Racing Crimson)', hex: '#c4122d', finish: 'gloss' as PaintFinish },
  { id: 'iom-green', name: 'Isle of Man Green', hex: '#0a442e', finish: 'metallic' as PaintFinish },
  { id: 'blu-cepheus', name: 'Blu Cepheus (Electric Sky)', hex: '#38bdf8', finish: 'gloss' as PaintFinish },
  { id: 'sao-paulo', name: 'Sao Paulo Yellow', hex: '#d9e021', finish: 'gloss' as PaintFinish },
  { id: 'frozen-deep-grey', name: 'Frozen Deep Grey', hex: '#27272a', finish: 'frozen' as PaintFinish },
  { id: 'bianco-monocerus', name: 'Bianco Monocerus (Pure White)', hex: '#f4f4f5', finish: 'gloss' as PaintFinish },
  { id: 'nero-nemesis', name: 'Nero Nemesis (Stealth Matte)', hex: '#18181b', finish: 'matte' as PaintFinish },
  { id: 'twilight-purple', name: 'Twilight Purple Metallic', hex: '#4c1d95', finish: 'metallic' as PaintFinish },
];

const RIM_FINISHES = [
  { id: 'bicolor', name: 'Bicolor Silver', hex: '#d4d4d8' },
  { id: 'satin-bronze', name: 'Satin Bronze', hex: '#854d0e' },
  { id: 'stealth-black', name: 'Stealth Matte Black', hex: '#18181b' },
  { id: 'shadow-chrome', name: 'Shadow Gloss Chrome', hex: '#52525b' },
];

const CALIPER_ACCENTS = [
  { id: 'racing-red', name: 'Racing Red', hex: '#dc2626' },
  { id: 'ceramic-gold', name: 'Ceramic Gold', hex: '#eab308' },
  { id: 'motorsport-blue', name: 'Motorsport Blue', hex: '#2563eb' },
  { id: 'acid-green', name: 'Acid Green', hex: '#84cc16' },
];

const EXHAUST_CONFIGS: {
  style: ExhaustStyle;
  material: ExhaustMaterial;
  name: string;
  desc: string;
}[] = [
  {
    style: 'quad',
    material: 'titanium',
    name: 'Titanium Quad Race System',
    desc: 'Burnt-blue dual wall piping. Searing high-frequency wail with overrun backfire crackles.',
  },
  {
    style: 'center',
    material: 'carbon',
    name: 'Center-Exit Carbon Track Spec',
    desc: 'Lightweight forged carbon shroud. Tight acoustic resonance and throatier midrange note.',
  },
  {
    style: 'dual',
    material: 'racing',
    name: 'Straight-Pipe Decat Flame System',
    desc: 'Zero catalytic resistance. Unfiltered raw combustion roar with high-temp blue flame bursts.',
  },
  {
    style: 'quad',
    material: 'chrome',
    name: 'Factory OEM Chrome System',
    desc: 'Original factory exhaust harmonics with active valve damping for quiet cruising.',
  },
];

export const EditorialCustomizer: React.FC<EditorialCustomizerProps> = ({
  config,
  onChangeConfig,
  onBack,
  onRace,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<CustomizerTab>('paint');
  const [isAuditioning, setIsAuditioning] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'3d' | 'studio'>('3d');

  const media = getVehicleMedia(config.modelType);
  const engine = getEngineForModel(config.modelType);

  // Active tuning or fallback to stage 0
  const currentTuning: TuningStageConfig = useMemo(() => {
    return (
      config.tuning || {
        ecuStage: 0,
        turboStage: 0,
        exhaustStage: 0,
        tireStage: 0,
        brakeStage: 0,
        suspensionStage: 0,
      }
    );
  }, [config.tuning]);

  // Compute live tuned performance stats
  const tunedStats = useMemo(() => {
    return getTunedPerformanceStats(config.modelType, currentTuning);
  }, [config.modelType, currentTuning]);

  const updateTuning = (updater: (prev: TuningStageConfig) => TuningStageConfig) => {
    onChangeConfig((prev) => {
      const nextTuning = updater(currentTuning);
      return {
        ...prev,
        tuning: nextTuning,
      };
    });
  };

  const handleAuditionExhaust = (mat: ExhaustMaterial, style: ExhaustStyle) => {
    onChangeConfig((prev) => ({
      ...prev,
      exhaustConfig: { material: mat, style },
    }));

    engineSound.setProfile(engine.soundProfile);
    engineSound.setExhaustMaterial(mat);
    engineSound.start();
    setIsAuditioning(true);

    showToast(`Exhaust updated: ${mat.toUpperCase()} • Acoustics adjusted`);

    setTimeout(() => engineSound.setThrottle(0.9), 150);
    setTimeout(() => engineSound.setThrottle(0.2), 900);
    setTimeout(() => {
      engineSound.triggerExhaustBackfire();
      engineSound.setThrottle(0);
    }, 1500);
    setTimeout(() => {
      engineSound.stop();
      setIsAuditioning(false);
    }, 2300);
  };

  const handleSaveBuild = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('rev_beast_custom_builds') || '[]');
      saved.push({
        id: `build-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        modelType: config.modelType,
        paintColor: config.paintColor,
        paintFinish: config.paintFinish,
        wheels: config.wheels,
        exhaust: config.exhaustConfig,
        tuning: currentTuning,
      });
      localStorage.setItem('rev_beast_custom_builds', JSON.stringify(saved));
      showToast('Bespoke build saved to your personal garage!');
    } catch {
      showToast('Build recorded successfully');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-neutral-100 select-none pt-12 pb-24 px-4 sm:px-8 md:px-12 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation & Vehicle Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>GARAGE</span>
            </button>

            {/* In-Customizer Machine Switcher Dropdown */}
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl px-3 py-1.5">
              <span className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-widest">
                MACHINE:
              </span>
              <select
                value={config.modelType}
                onChange={(e) => {
                  const newModel = e.target.value as CarModelType;
                  onChangeConfig((prev) => ({ ...prev, modelType: newModel }));
                  showToast(`Selected: ${AVAILABLE_VEHICLES.find((v) => v.id === newModel)?.name || newModel}`);
                }}
                className="bg-transparent text-xs font-mono text-white font-bold cursor-pointer outline-none border-none pr-2 focus:ring-0"
              >
                {AVAILABLE_VEHICLES.map((v) => (
                  <option key={v.id} value={v.id} className="bg-neutral-900 text-white font-mono">
                    {v.brand} — {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleSaveBuild}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
            >
              SAVE BUILD
            </button>

            <button
              onClick={() => onRace(config.modelType)}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 text-center"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>RACE THIS SPEC</span>
            </button>
          </div>
        </div>

        {/* Studio Grid: Left Studio Canvas + Right Customizer Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLS: 3D INTERACTIVE CANVAS / PHOTOGRAPHY PREVIEW */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Mode Switcher Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === '3d'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-950/40'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D Interactive</span>
                </button>
                <button
                  onClick={() => setViewMode('studio')}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'studio'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-950/40'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Photo Studio</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-neutral-400 tracking-widest uppercase">
                {viewMode === '3d' ? (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    360° Drag Orbit • Scroll Zoom
                  </span>
                ) : (
                  <span>Curated Editorial Glaze</span>
                )}
              </div>
            </div>

            <div className="relative w-full rounded-3xl overflow-hidden bg-neutral-900 border border-white/[0.08] shadow-2xl h-[48vh] sm:h-[58vh] md:h-[66vh]">
              {viewMode === '3d' ? (
                <div className="w-full h-full relative">
                  <CarViewer config={config} />

                  {/* Top-Left Engine Tag */}
                  <div className="absolute top-4 left-4 pointer-events-none px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white flex items-center gap-2 z-10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>3D REAL-TIME SHADER ENGINE</span>
                  </div>

                  {/* Top-Right: Studio Lighting Environment Switcher */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-2xl pointer-events-auto z-10">
                    {LIGHTING_ENVIRONMENTS.map((env) => {
                      const isCurrent = (config.environment || 'dark-studio') === env.id;
                      return (
                        <button
                          key={env.id}
                          onClick={() => {
                            onChangeConfig((prev) => ({ ...prev, environment: env.id }));
                            showToast(`Lighting: ${env.label}`);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                              : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          {env.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom-Center: Camera Preset Focus Buttons */}
                  <div className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/10 p-1 rounded-full pointer-events-auto shadow-2xl z-10 max-w-[95%] overflow-x-auto scrollbar-none">
                    {CAMERA_PRESETS.map((preset) => {
                      const isCurrent = (config.cameraPreset || 'hero') === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            onChangeConfig((prev) => ({ ...prev, cameraPreset: preset.id }));
                          }}
                          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                            isCurrent
                              ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                              : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={media.photos.side.url}
                    alt={media.name}
                    onError={(e) => {
                      e.currentTarget.src = media.photos.hero.url;
                    }}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30 pointer-events-none" />
                </>
              )}

              {/* Bottom Canvas Overlay Info */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none z-10">
                <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block">
                    {media.brand} // {media.category}
                  </span>
                  <h3 className="font-syne font-bold text-xl sm:text-2xl text-white">
                    {media.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs font-mono text-neutral-300">
                    <span className="capitalize">{config.paintFinish} Sheen</span>
                    <span>•</span>
                    <span className="uppercase">{(config.exhaustConfig?.material || 'titanium')} Exhaust</span>
                  </div>
                </div>

                {isAuditioning && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white font-mono text-xs font-bold animate-bounce shadow-xl shadow-red-950/60">
                    <Flame className="w-4 h-4 fill-white" />
                    <span>ACOUSTICS AUDITION ACTIVE</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dyno Performance Metrics Banner */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/[0.08] grid grid-cols-2 sm:grid-cols-5 gap-3 text-center font-mono text-xs">
              <div className="p-2 rounded-xl bg-white/[0.02]">
                <span className="text-[9px] text-neutral-400 uppercase block">TUNED OUTPUT</span>
                <span className="text-base font-black text-red-500">{tunedStats.powerHp} HP</span>
                {tunedStats.powerGain > 0 && (
                  <span className="text-[9px] text-emerald-400 font-bold block">+{tunedStats.powerGain} HP</span>
                )}
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02]">
                <span className="text-[9px] text-neutral-400 uppercase block">PEAK TORQUE</span>
                <span className="text-base font-black text-white">{tunedStats.torqueNm} NM</span>
                {tunedStats.torqueGain > 0 && (
                  <span className="text-[9px] text-emerald-400 font-bold block">+{tunedStats.torqueGain} NM</span>
                )}
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02]">
                <span className="text-[9px] text-neutral-400 uppercase block">0-100 KM/H</span>
                <span className="text-base font-black text-white">{tunedStats.zeroToHundredSec}s</span>
                <span className="text-[9px] text-cyan-400 font-bold block">Sprint</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02]">
                <span className="text-[9px] text-neutral-400 uppercase block">TOP VELOCITY</span>
                <span className="text-base font-black text-white">{tunedStats.topSpeedKmh} KM/H</span>
                <span className="text-[9px] text-neutral-400 block">V-Max</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02]">
                <span className="text-[9px] text-neutral-400 uppercase block">MASS SAVED</span>
                <span className="text-base font-black text-purple-400">-{tunedStats.weightSavedKg} KG</span>
                <span className="text-[9px] text-purple-300 block">{tunedStats.curbWeightKg} kg Total</span>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: CUSTOMIZER CATEGORIES & OPTIONS */}
          <div className="lg:col-span-5 space-y-6">
            {/* Category Navigation Bar */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-x-auto scrollbar-none">
              {[
                { id: 'paint', label: 'PAINT', icon: Palette },
                { id: 'wheels', label: 'WHEELS', icon: Disc3 },
                { id: 'aero', label: 'AERO', icon: Wind },
                { id: 'exhaust', label: 'EXHAUST', icon: Flame },
                { id: 'performance', label: 'TUNING', icon: Cpu },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as CustomizerTab)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: PAINT CUSTOMIZER */}
            {activeTab === 'paint' && (
              <div className="space-y-6 p-6 rounded-3xl bg-neutral-900/50 border border-white/[0.08] animate-fadeIn">
                {/* Paint Sheen Selection */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block mb-3">
                    SURFACE SHEEN COAT
                  </span>
                  <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                    {(['gloss', 'metallic', 'matte', 'frozen'] as PaintFinish[]).map((finish) => (
                      <button
                        key={finish}
                        onClick={() => onChangeConfig((p) => ({ ...p, paintFinish: finish }))}
                        className={`py-2 rounded-xl uppercase font-bold tracking-wider border transition-all cursor-pointer ${
                          config.paintFinish === finish
                            ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/40'
                            : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white'
                        }`}
                      >
                        {finish}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Iconic Automotive Palette Swatches */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block mb-3">
                    CURATED MOTORSPORT PALETTE
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {ICONIC_PALETTES.map((color) => {
                      const isSelected = config.paintColor === color.hex;
                      return (
                        <button
                          key={color.id}
                          onClick={() => {
                            onChangeConfig((p) => ({
                              ...p,
                              paintColor: color.hex,
                              paintName: color.name,
                              paintFinish: color.finish,
                            }));
                            showToast(`Color: ${color.name}`);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                            isSelected
                              ? 'border-white bg-white/[0.08] shadow-lg ring-1 ring-white/30'
                              : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20'
                          }`}
                        >
                          <div
                            className="w-full h-8 rounded-lg border border-white/20 shadow-inner flex items-center justify-center"
                            style={{ backgroundColor: color.hex }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                          </div>
                          <span className="text-[10px] font-mono text-neutral-300 font-bold truncate">
                            {color.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Window Tint Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-neutral-400 uppercase tracking-wider">WINDOW CERAMIC TINT</span>
                    <span className="text-red-500 font-bold">{Math.round(config.windowTint * 100)}% OPACITY</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={Math.round(config.windowTint * 100)}
                    onChange={(e) =>
                      onChangeConfig((p) => ({ ...p, windowTint: Number(e.target.value) / 100 }))
                    }
                    className="w-full accent-red-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: WHEELS & BRAKES */}
            {activeTab === 'wheels' && (
              <div className="space-y-6 p-6 rounded-3xl bg-neutral-900/50 border border-white/[0.08] animate-fadeIn">
                {/* Rim Finish */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block mb-3">
                    ALLOY RIM FINISH
                  </span>
                  <div className="space-y-2">
                    {RIM_FINISHES.map((rim) => {
                      const isSelected = config.wheels.rimColor === rim.hex;
                      return (
                        <button
                          key={rim.id}
                          onClick={() =>
                            onChangeConfig((p) => ({
                              ...p,
                              wheels: { ...p.wheels, rimColor: rim.hex },
                            }))
                          }
                          className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-red-500/10 border-red-500/60 shadow-md shadow-red-950/30'
                              : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: rim.hex }}
                            />
                            <span className="text-xs font-mono font-bold text-white">{rim.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-red-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Caliper Finish */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block mb-3">
                    BRAKE CALIPER ACCENT
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {CALIPER_ACCENTS.map((caliper) => {
                      const isSelected = config.wheels.caliperColor === caliper.hex;
                      return (
                        <button
                          key={caliper.id}
                          onClick={() =>
                            onChangeConfig((p) => ({
                              ...p,
                              wheels: { ...p.wheels, caliperColor: caliper.hex },
                            }))
                          }
                          className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white/[0.08] border-white'
                              : 'bg-white/[0.02] border-white/[0.06] hover:border-white/20'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: caliper.hex }}
                          />
                          <span className="text-xs font-mono text-neutral-300 font-bold">
                            {caliper.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AERODYNAMICS */}
            {activeTab === 'aero' && (
              <div className="space-y-4 p-6 rounded-3xl bg-neutral-900/50 border border-white/[0.08] animate-fadeIn">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block mb-2">
                  MOTORSPORT DOWNFORCE & SPOILERS
                </span>

                <div className="space-y-3">
                  {/* Spoiler Style */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                    <span className="text-xs font-mono font-bold text-white uppercase block">
                      AERODYNAMIC REAR WING
                    </span>
                    <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                      {(['gt-wing', 'ducktail', 'lip', 'none'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() =>
                            onChangeConfig((p) => ({
                              ...p,
                              aero: { ...p.aero, spoilerStyle: style },
                            }))
                          }
                          className={`py-2 rounded-xl uppercase font-bold tracking-wider border transition-all cursor-pointer ${
                            config.aero.spoilerStyle === style
                              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/40'
                              : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Carbon Fiber Splitter */}
                  <div
                    onClick={() =>
                      onChangeConfig((p) => ({
                        ...p,
                        aero: { ...p.aero, frontSplitter: !p.aero.frontSplitter },
                      }))
                    }
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between cursor-pointer hover:border-white/20"
                  >
                    <div>
                      <span className="text-sm font-syne font-bold text-white block">
                        Carbon Fiber Front Splitter
                      </span>
                      <span className="text-xs text-neutral-400 font-sans">
                        Channels high-velocity underbody airflow to generate 180kg frontal downforce.
                      </span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        config.aero.frontSplitter
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'border-white/20'
                      }`}
                    >
                      {config.aero.frontSplitter && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Rear Diffuser */}
                  <div
                    onClick={() =>
                      onChangeConfig((p) => ({
                        ...p,
                        aero: { ...p.aero, rearDiffuserFins: !p.aero.rearDiffuserFins },
                      }))
                    }
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between cursor-pointer hover:border-white/20"
                  >
                    <div>
                      <span className="text-sm font-syne font-bold text-white block">
                        Extended Venturi Diffuser Fins
                      </span>
                      <span className="text-xs text-neutral-400 font-sans">
                        Accelerates underfloor air expansion for rear ground-effect suction.
                      </span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        config.aero.rearDiffuserFins
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'border-white/20'
                      }`}
                    >
                      {config.aero.rearDiffuserFins && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: EXHAUST SYSTEM */}
            {activeTab === 'exhaust' && (
              <div className="space-y-4 p-6 rounded-3xl bg-neutral-900/50 border border-white/[0.08] animate-fadeIn">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-500 font-bold block mb-1">
                    EXHAUST LAB // DIRECT ACOUSTIC TRANSFORMATION
                  </span>
                  <p className="text-xs text-neutral-400 font-sans">
                    Choosing an exhaust configuration modulates acoustic frequency filters, backpressure, and overrun resonance.
                  </p>
                </div>

                <div className="space-y-3">
                  {EXHAUST_CONFIGS.map((ex) => {
                    const isSelected =
                      (config.exhaustConfig?.material || 'titanium') === ex.material &&
                      (config.exhaustConfig?.style || 'quad') === ex.style;

                    return (
                      <button
                        key={`${ex.style}-${ex.material}`}
                        onClick={() => handleAuditionExhaust(ex.material, ex.style)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-red-500/10 border-red-500 shadow-xl shadow-red-950/30'
                            : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-syne font-bold text-base text-white">{ex.name}</span>
                          <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5" /> AUDITION
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 font-sans leading-snug">{ex.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: MECHANICAL PERFORMANCE TUNING */}
            {activeTab === 'performance' && (
              <div className="space-y-4 p-6 rounded-3xl bg-neutral-900/50 border border-white/[0.08] animate-fadeIn">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-500 font-bold block mb-1">
                    PERFORMANCE ENGINEERING & SIMULATION PARAMETERS
                  </span>
                  <p className="text-xs text-neutral-400 font-sans">
                    Stages directly modulate the 3D physics engine powertrain model, tire friction circle, and suspension dynamics.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* ECU Calibration */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-white font-bold uppercase">ECU FUEL & IGNITION CALIBRATION</span>
                      <span className="text-red-500 font-bold">STAGE {currentTuning.ecuStage}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                      {[
                        { stage: 0, label: 'STOCK' },
                        { stage: 1, label: 'STAGE 1 (+12%)' },
                        { stage: 2, label: 'STAGE 2 (+25%)' },
                        { stage: 3, label: 'STAGE 3 (+42%)' },
                      ].map((s) => (
                        <button
                          key={s.stage}
                          onClick={() => updateTuning((t) => ({ ...t, ecuStage: s.stage as any }))}
                          className={`py-2 rounded-xl font-bold uppercase tracking-wider border transition-all cursor-pointer text-[10px] ${
                            currentTuning.ecuStage === s.stage
                              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/40'
                              : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Turbo / Forced Induction */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-white font-bold uppercase">TURBOCHARGER / BOOST STAGE</span>
                      <span className="text-cyan-400 font-bold">STAGE {currentTuning.turboStage}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                      {[
                        { stage: 0, label: 'FACTORY BOOST' },
                        { stage: 1, label: 'BALL-BEARING (+15%)' },
                        { stage: 2, label: 'TWIN RACE (+35%)' },
                      ].map((s) => (
                        <button
                          key={s.stage}
                          onClick={() => updateTuning((t) => ({ ...t, turboStage: s.stage as any }))}
                          className={`py-2 rounded-xl font-bold uppercase tracking-wider border transition-all cursor-pointer text-[10px] ${
                            currentTuning.turboStage === s.stage
                              ? 'bg-cyan-400 text-black border-cyan-400'
                              : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tires & Grip Compound */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-white font-bold uppercase">TIRE COMPOUND & TRACTION</span>
                      <span className="text-emerald-400 font-bold">STAGE {currentTuning.tireStage}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                      {[
                        { stage: 0, label: 'STREET SPORT' },
                        { stage: 1, label: 'SEMI-SLICKS (CUP 2)' },
                        { stage: 2, label: 'FULL RACING SLICKS' },
                      ].map((s) => (
                        <button
                          key={s.stage}
                          onClick={() => updateTuning((t) => ({ ...t, tireStage: s.stage as any }))}
                          className={`py-2 rounded-xl font-bold uppercase tracking-wider border transition-all cursor-pointer text-[10px] ${
                            currentTuning.tireStage === s.stage
                              ? 'bg-emerald-400 text-black border-emerald-400'
                              : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brakes & Suspension */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Brakes */}
                    <button
                      onClick={() =>
                        updateTuning((t) => ({ ...t, brakeStage: (t.brakeStage === 1 ? 0 : 1) as any }))
                      }
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        currentTuning.brakeStage === 1
                          ? 'bg-yellow-400/10 border-yellow-400'
                          : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-white uppercase">
                          CARBON CERAMIC BRAKES
                        </span>
                        {currentTuning.brakeStage === 1 && <Check className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <p className="text-[11px] text-neutral-400 font-sans leading-tight">
                        420mm drilled rotors. -14kg unsprung mass, zero thermal brake fade.
                      </p>
                    </button>

                    {/* Suspension */}
                    <button
                      onClick={() =>
                        updateTuning((t) => ({
                          ...t,
                          suspensionStage: (t.suspensionStage === 1 ? 0 : 1) as any,
                        }))
                      }
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        currentTuning.suspensionStage === 1
                          ? 'bg-purple-400/10 border-purple-400'
                          : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-white uppercase">
                          KW CLUBSPORT COILOVERS
                        </span>
                        {currentTuning.suspensionStage === 1 && <Check className="w-4 h-4 text-purple-400" />}
                      </div>
                      <p className="text-[11px] text-neutral-400 font-sans leading-tight">
                        -25mm ride height. Stiffer anti-roll bars, reduced body roll in hairpins.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
