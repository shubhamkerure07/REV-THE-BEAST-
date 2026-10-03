import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  CarConfigState,
  CarModelType,
  ExhaustMaterial,
  ExhaustStyle,
  PaintFinish,
} from '../types';
import { getVehicleMedia } from '../data/vehicleMedia';
import { getEngineForModel } from '../data/engines';
import { engineSound } from '../utils/audio';

interface EditorialCustomizerProps {
  config: CarConfigState;
  onChangeConfig: (updater: (prev: CarConfigState) => CarConfigState) => void;
  onBack: () => void;
  onRace: (model: CarModelType) => void;
  showToast: (msg: string) => void;
}

type CustomizerTab = 'paint' | 'wheels' | 'exhaust' | 'aero';

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

  const media = getVehicleMedia(config.modelType);
  const engine = getEngineForModel(config.modelType);

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
      });
      localStorage.setItem('rev_beast_custom_builds', JSON.stringify(saved));
      showToast('Build saved to your personal garage!');
    } catch {
      showToast('Build recorded successfully');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-neutral-100 select-none pt-24 pb-24 px-6 sm:px-12 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-6 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>BACK TO DETAILS</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveBuild}
              className="px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              SAVE BUILD
            </button>

            <button
              onClick={() => onRace(config.modelType)}
              className="px-6 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-2"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>RACE THIS SPEC</span>
            </button>
          </div>
        </div>

        {/* Studio Grid: Left Studio Canvas / Photography Preview + Right Studio Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT 7 COLS: PHOTOGRAPHY PREVIEW WITH REAL-TIME GLAZE */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative w-full rounded-3xl overflow-hidden bg-neutral-900 border border-white/[0.08] shadow-2xl h-[45vh] sm:h-[55vh] md:h-[65vh]">
              {/* Base High-Resolution Car Photograph */}
              <img
                src={media.photos.side.url}
                alt={media.name}
                onError={(e) => {
                  e.currentTarget.src = media.photos.hero.url;
                }}
                className="w-full h-full object-cover object-center"
              />

              {/* Real-Time Paint Color Glaze Filter */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  backgroundColor: config.paintColor,
                  mixBlendMode: config.paintFinish === 'matte' ? 'color-burn' : 'soft-light',
                  opacity: config.paintFinish === 'frozen' ? 0.35 : config.paintFinish === 'matte' ? 0.45 : 0.3,
                }}
              />

              {/* Realistic Sheen / Clearcoat Highlight Layer */}
              {config.paintFinish === 'metallic' && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent mix-blend-screen opacity-50" />
              )}
              {config.paintFinish === 'frozen' && (
                <div className="absolute inset-0 pointer-events-none bg-black/20 backdrop-blur-[0.5px] opacity-40" />
              )}

              {/* Studio Backdrop Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

              {/* Live Status Badge */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block mb-1">
                    STUDIO SPECIFICATION
                  </span>
                  <h3 className="font-syne font-bold text-2xl text-white">
                    {media.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs font-mono text-neutral-300">
                    <span className="capitalize">{config.paintFinish} Sheen</span>
                    <span>•</span>
                    <span className="uppercase">{config.exhaustConfig.material} Exhaust</span>
                  </div>
                </div>

                {isAuditioning && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400 text-black font-mono text-xs font-bold animate-bounce shadow-xl">
                    <Flame className="w-4 h-4 fill-black" />
                    <span>REV ACOUSTICS ACTIVE</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Helper Notice */}
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-2">
              <span>Dynamic Photographic Glaze • Real Acoustic Filtering</span>
              <span className="text-amber-400 font-bold">{engine.powerHp} HP • {engine.type}</span>
            </div>
          </div>

          {/* RIGHT 5 COLS: CUSTOMIZER CATEGORIES & OPTIONS */}
          <div className="lg:col-span-5 space-y-6">
            {/* Category Navigation Bar */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              {[
                { id: 'paint', label: 'PAINT', icon: <Palette className="w-3.5 h-3.5" /> },
                { id: 'wheels', label: 'WHEELS', icon: <Disc3 className="w-3.5 h-3.5" /> },
                { id: 'exhaust', label: 'EXHAUST', icon: <Flame className="w-3.5 h-3.5" /> },
                { id: 'aero', label: 'AERODYNAMICS', icon: <Wind className="w-3.5 h-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CustomizerTab)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-black shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
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
                            ? 'bg-amber-400 text-black border-amber-400 shadow-md'
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
                            showToast(`Color selected: ${color.name}`);
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
                              ? 'bg-amber-400/10 border-amber-400/60 shadow-md'
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
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
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

            {/* TAB 3: EXHAUST SYSTEM & ACOUSTIC MODULATION */}
            {activeTab === 'exhaust' && (
              <div className="space-y-4 p-6 rounded-3xl bg-neutral-900/50 border border-white/[0.08] animate-fadeIn">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold block mb-1">
                    EXHAUST LAB // DIRECT ACOUSTIC TRANSFORMATION
                  </span>
                  <p className="text-xs text-neutral-400 font-sans">
                    Choosing an exhaust configuration modulates the acoustic frequency filters and resonance in real-time.
                  </p>
                </div>

                <div className="space-y-3">
                  {EXHAUST_CONFIGS.map((ex) => {
                    const isSelected =
                      config.exhaustConfig.material === ex.material &&
                      config.exhaustConfig.style === ex.style;

                    return (
                      <button
                        key={`${ex.style}-${ex.material}`}
                        onClick={() => handleAuditionExhaust(ex.material, ex.style)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-400/10 border-amber-400 shadow-xl'
                            : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-syne font-bold text-base text-white">{ex.name}</span>
                          <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
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

            {/* TAB 4: AERODYNAMICS */}
            {activeTab === 'aero' && (
              <div className="space-y-4 p-6 rounded-3xl bg-neutral-900/50 border border-white/[0.08] animate-fadeIn">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block mb-2">
                  MOTORSPORT DOWNFORCE PACKAGE
                </span>

                <div className="space-y-3">
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
                          ? 'bg-amber-400 border-amber-400 text-black'
                          : 'border-white/20'
                      }`}
                    >
                      {config.aero.frontSplitter && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>

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
                          ? 'bg-amber-400 border-amber-400 text-black'
                          : 'border-white/20'
                      }`}
                    >
                      {config.aero.rearDiffuserFins && <Check className="w-3.5 h-3.5" />}
                    </div>
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
