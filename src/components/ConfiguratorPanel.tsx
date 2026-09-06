import React, { useState } from 'react';
import {
  Palette,
  Disc3,
  Sliders,
  Sun,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Gauge,
  Zap,
  Flame,
  Wind,
  Volume2,
  Activity,
  Play,
  RotateCcw,
  Car,
  Camera,
  Check,
  Radio,
} from 'lucide-react';
import { ambienceSound } from '../utils/ambienceAudio';
import {
  CarConfigState,
  CarModelType,
  PaintFinish,
  StudioEnvironment,
  EngineSoundProfile,
  ExhaustValveMode,
  CameraPreset,
} from '../types';
import { ALL_ENGINES, getEngineForModel } from '../data/engines';
import { engineSound } from '../utils/audio';
import { VEHICLE_MEDIA_CATALOG } from '../data/vehicleMedia';

interface ConfiguratorPanelProps {
  config: CarConfigState;
  onChangeConfig: (updater: (prev: CarConfigState) => CarConfigState) => void;
  onSelectModelType?: (model: CarModelType) => void;
}

type TabType = 'vehicles' | 'paint' | 'wheels-aero' | 'engine' | 'lighting-env';

const BMW_ICONIC_COLORS = [
  { id: 'iom-green', name: 'Isle of Man Green', hex: '#0a442e', finish: 'metallic' as PaintFinish },
  { id: 'marina-blue', name: 'Marina Bay Blue', hex: '#0047bb', finish: 'metallic' as PaintFinish },
  { id: 'sao-paulo', name: 'Sao Paulo Yellow', hex: '#d9e021', finish: 'gloss' as PaintFinish },
  { id: 'frozen-grey', name: 'Frozen Deep Grey', hex: '#2c2e33', finish: 'frozen' as PaintFinish },
  { id: 'toronto-red', name: 'Toronto Red', hex: '#c4122d', finish: 'gloss' as PaintFinish },
  { id: 'alpine-white', name: 'Alpine White', hex: '#f2f3f5', finish: 'gloss' as PaintFinish },
  { id: 'black-sapphire', name: 'Black Sapphire', hex: '#0f1115', finish: 'metallic' as PaintFinish },
  { id: 'tanzanite-blue', name: 'Tanzanite Blue II', hex: '#0c1b33', finish: 'metallic' as PaintFinish },
  { id: 'twilight-purple', name: 'Twilight Purple', hex: '#3d1645', finish: 'metallic' as PaintFinish },
  { id: 'fire-orange', name: 'Fire Orange III', hex: '#ff5500', finish: 'gloss' as PaintFinish },
];

const RIM_COLORS = [
  { id: 'bicolor', name: 'Bicolor Silver', hex: '#b0b5be' },
  { id: 'bronze', name: 'Satin Bronze', hex: '#876d49' },
  { id: 'stealth-black', name: 'Stealth Black', hex: '#16161a' },
  { id: 'shadow-chrome', name: 'Shadow Chrome', hex: '#4b5563' },
];

const CALIPER_COLORS = [
  { id: 'm-blue', name: 'Motorsport Blue', hex: '#0066b1' },
  { id: 'm-red', name: 'Racing Red', hex: '#dc2626' },
  { id: 'm-gold', name: 'Ceramic Gold', hex: '#d4af37' },
  { id: 'acid-green', name: 'Acid Green', hex: '#84cc16' },
];

const HALO_COLORS = [
  { name: 'Pure White (LED)', hex: '#ffffff' },
  { name: 'Laser Blue (Laserlight)', hex: '#38bdf8' },
  { name: 'Motorsport Yellow (CSL)', hex: '#facc15' },
  { name: 'Amber Glow', hex: '#fb923c' },
];

export const ConfiguratorPanel: React.FC<ConfiguratorPanelProps> = ({
  config,
  onChangeConfig,
  onSelectModelType,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('vehicles');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isDynoRunning, setIsDynoRunning] = useState<boolean>(false);
  const [isColdStarting, setIsColdStarting] = useState<boolean>(false);
  const [is2StepActive, setIs2StepActive] = useState<boolean>(false);

  const currentEngine = getEngineForModel(config.modelType);

  const handleSelectVehicle = (modelType: CarModelType) => {
    if (onSelectModelType) {
      onSelectModelType(modelType);
    } else {
      onChangeConfig((prev) => ({
        ...prev,
        modelType,
      }));
    }
  };

  return (
    <aside
      id="configurator-panel"
      className={`absolute top-16 right-4 bottom-20 z-20 transition-all duration-300 pointer-events-auto flex items-start gap-2 ${
        isCollapsed ? 'translate-x-[calc(100%-2.5rem)]' : 'translate-x-0'
      }`}
    >
      {/* Collapse / Expand Tab */}
      <button
        id="toggle-panel-collapse"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mt-4 p-2 rounded-full bg-black/70 text-slate-300 hover:text-white border border-white/10 shadow-xl backdrop-blur-md transition-all cursor-pointer"
        title={isCollapsed ? 'Expand Studio Panel' : 'Collapse Panel'}
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Main Drawer Window */}
      <div className="w-80 sm:w-92 h-full bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-white/10 p-1.5 gap-1 bg-black/40 overflow-x-auto">
          <button
            id="tab-vehicles"
            onClick={() => setActiveTab('vehicles')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'vehicles'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>GARAGE</span>
          </button>

          <button
            id="tab-paint"
            onClick={() => setActiveTab('paint')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'paint'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>PAINT</span>
          </button>

          <button
            id="tab-engine"
            onClick={() => setActiveTab('engine')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'engine'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>REV/ENGINE</span>
          </button>

          <button
            id="tab-wheels-aero"
            onClick={() => setActiveTab('wheels-aero')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'wheels-aero'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>WHEELS</span>
          </button>

          <button
            id="tab-lighting-env"
            onClick={() => setActiveTab('lighting-env')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'lighting-env'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>STUDIO</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/20">
          {/* ================= 1. VEHICLES GARAGE TAB ================= */}
          {activeTab === 'vehicles' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono mb-1">
                  Select Vehicle Platform
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  High-definition multi-angle photography, real engine sound synthesizers, and cinematic reels.
                </p>
              </div>

              <div className="space-y-2.5">
                {(Object.keys(VEHICLE_MEDIA_CATALOG) as CarModelType[]).map((mKey) => {
                  const item = VEHICLE_MEDIA_CATALOG[mKey];
                  const isSelected = config.modelType === mKey;
                  return (
                    <button
                      key={mKey}
                      id={`card-vehicle-${mKey}`}
                      onClick={() => handleSelectVehicle(mKey)}
                      className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center gap-3 cursor-pointer group ${
                        isSelected
                          ? 'bg-white/10 border-white/40 shadow-xl ring-1 ring-white/20'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                      }`}
                    >
                      {/* Vehicle Thumbnail */}
                      <div className="relative w-16 h-14 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10">
                        <img
                          src={item.photos.hero.thumbnail}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white truncate">{item.name}</span>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase font-mono shrink-0"
                            style={{ backgroundColor: `${item.accentHex}33`, color: item.accentHex }}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {item.keySpecs.engine}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                          <span>{item.keySpecs.horsepower}</span>
                          <span>•</span>
                          <span className="text-blue-400">{item.keySpecs.zeroToSixty}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 2. PAINT CUSTOMIZER TAB ================= */}
          {activeTab === 'paint' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Finish Selection */}
              <div className="space-y-2">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono">
                  Paint Finish Sheen
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['gloss', 'metallic', 'matte', 'frozen'] as PaintFinish[]).map((finish) => (
                    <button
                      key={finish}
                      id={`btn-finish-${finish}`}
                      onClick={() => onChangeConfig((prev) => ({ ...prev, paintFinish: finish }))}
                      className={`py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all border ${
                        config.paintFinish === finish
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono">
                    Exterior Palette
                  </span>
                  <span className="text-xs text-white font-medium">{config.paintName}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {BMW_ICONIC_COLORS.map((color) => {
                    const isSelected = config.paintColor === color.hex;
                    return (
                      <button
                        key={color.id}
                        id={`btn-color-${color.id}`}
                        onClick={() =>
                          onChangeConfig((prev) => ({
                            ...prev,
                            paintColor: color.hex,
                            paintName: color.name,
                            paintFinish: color.finish,
                          }))
                        }
                        className={`group relative h-11 rounded-xl transition-all border p-0.5 ${
                          isSelected
                            ? 'scale-105 border-white shadow-lg ring-2 ring-white/40'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                        title={color.name}
                      >
                        <div
                          className="w-full h-full rounded-lg shadow-inner flex items-center justify-center"
                          style={{ backgroundColor: color.hex }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Color Input */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono">
                  Custom Paint Code
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.paintColor}
                    onChange={(e) =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        paintColor: e.target.value,
                        paintName: `Bespoke (${e.target.value.toUpperCase()})`,
                      }))
                    }
                    className="w-10 h-10 rounded-xl bg-transparent border border-white/20 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.paintColor}
                    onChange={(e) =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        paintColor: e.target.value,
                        paintName: `Bespoke (${e.target.value.toUpperCase()})`,
                      }))
                    }
                    className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white tracking-wider focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. ENGINE & SOUND CENTER TAB ================= */}
          {activeTab === 'engine' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Header Badge */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold font-mono tracking-widest">
                    ACTIVE POWERTRAIN
                  </span>
                  <span className="text-[10px] font-bold text-blue-400 font-mono">
                    {currentEngine.aspiration}
                  </span>
                </div>
                <div className="text-sm font-black text-white">{currentEngine.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{currentEngine.displacement} • {currentEngine.cylinders}</div>
              </div>

              {/* Sound Profile Switcher */}
              <div className="space-y-2">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono">
                  Engine Acoustic Profile
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      profile: 's58-inline6' as EngineSoundProfile,
                      name: 'S58 Twin-Turbo',
                      desc: '7,200 RPM • Turbo Spool & Burble',
                    },
                    {
                      profile: 'coyote-v8' as EngineSoundProfile,
                      name: '5.0L Coyote V8',
                      desc: '7,500 RPM • American V8 Bark',
                    },
                    {
                      profile: 'amg-v8' as EngineSoundProfile,
                      name: 'AMG Biturbo V8',
                      desc: '6,800 RPM • Side-Pipe Thunder',
                    },
                    {
                      profile: 'supercharged-i4' as EngineSoundProfile,
                      name: 'Ninja H2R SC',
                      desc: '14,000 RPM • Blower Flutter',
                    },
                  ].map((p) => {
                    const isSelected = (config.engineProfile || currentEngine.soundProfile) === p.profile;
                    return (
                      <button
                        key={p.profile}
                        id={`btn-profile-${p.profile}`}
                        onClick={() => {
                          onChangeConfig((prev) => ({ ...prev, engineProfile: p.profile }));
                          engineSound.setProfile(p.profile);
                          if (!config.exhaustSound) {
                            onChangeConfig((prev) => ({ ...prev, exhaustSound: true }));
                          }
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-blue-600/30 border-blue-400 text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exhaust Acoustic Valves */}
              <div className="space-y-2">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono">
                  Exhaust Acoustic Flap Valves
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['quiet', 'sport', 'track'] as ExhaustValveMode[]).map((mode) => {
                    const isSelected = (config.valveMode || 'sport') === mode;
                    return (
                      <button
                        key={mode}
                        id={`btn-valve-${mode}`}
                        onClick={() => {
                          onChangeConfig((prev) => ({ ...prev, valveMode: mode }));
                          engineSound.setValveMode(mode);
                        }}
                        className={`py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode === 'track' ? 'Straight Pipe' : mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Rev Performance Routines */}
              <div className="space-y-2">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono">
                  Engine Sound Routines
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {/* 2-Step Launch Control */}
                  <button
                    id="btn-panel-2step"
                    onClick={() => {
                      if (!config.exhaustSound) onChangeConfig((prev) => ({ ...prev, exhaustSound: true }));
                      const active = engineSound.toggleLaunchControl();
                      setIs2StepActive(active);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      is2StepActive
                        ? 'bg-rose-600 border-rose-400 text-white shadow-lg animate-pulse'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-rose-400 mb-1" />
                    <div className="text-xs font-bold">2-Step Limiter</div>
                    <div className="text-[10px] text-slate-400">Rapid fire pops at 4,500 RPM</div>
                  </button>

                  {/* Cold Start */}
                  <button
                    id="btn-panel-coldstart"
                    onClick={() => {
                      if (!config.exhaustSound) onChangeConfig((prev) => ({ ...prev, exhaustSound: true }));
                      setIsColdStarting(true);
                      engineSound.playColdStart(() => setIsColdStarting(false));
                    }}
                    disabled={isColdStarting}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all"
                  >
                    <RotateCcw className={`w-4 h-4 text-blue-400 mb-1 ${isColdStarting ? 'animate-spin' : ''}`} />
                    <div className="text-xs font-bold">Cold Start</div>
                    <div className="text-[10px] text-slate-400">Starter crank & high idle roar</div>
                  </button>

                  {/* Dyno Acceleration Pull */}
                  <button
                    id="btn-panel-dynopull"
                    onClick={() => {
                      if (!config.exhaustSound) onChangeConfig((prev) => ({ ...prev, exhaustSound: true }));
                      setIsDynoRunning(true);
                      engineSound.playDynoPull(() => setIsDynoRunning(false));
                    }}
                    disabled={isDynoRunning}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all"
                  >
                    <Play className="w-4 h-4 text-emerald-400 mb-1" />
                    <div className="text-xs font-bold">Dyno Pull (1-4)</div>
                    <div className="text-[10px] text-slate-400">Gears 1 to 4 with shift cuts</div>
                  </button>

                  {/* Downshift Throttle Blip */}
                  <button
                    id="btn-panel-blip"
                    onClick={() => {
                      if (!config.exhaustSound) onChangeConfig((prev) => ({ ...prev, exhaustSound: true }));
                      engineSound.playThrottleBlip();
                    }}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all"
                  >
                    <Zap className="w-4 h-4 text-amber-400 mb-1" />
                    <div className="text-xs font-bold">Throttle Blip</div>
                    <div className="text-[10px] text-slate-400">Double-clutch downshift note</div>
                  </button>
                </div>
              </div>

              {/* Detailed Powertrain Specifications */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono">
                  Output Specifications
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">MAX OUTPUT</div>
                    <div className="text-white font-bold font-mono">{currentEngine.powerHp} HP ({currentEngine.powerKw} kW)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">PEAK TORQUE</div>
                    <div className="text-white font-bold font-mono">{currentEngine.torqueLbFt} lb-ft ({currentEngine.torqueNm} Nm)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">MAX REDLINE</div>
                    <div className="text-rose-400 font-bold font-mono">{currentEngine.redlineRpm.toLocaleString()} RPM</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">BOOST / COMP</div>
                    <div className="text-blue-400 font-bold font-mono">
                      {currentEngine.maxBoostPsi ? `${currentEngine.maxBoostPsi} PSI` : currentEngine.compressionRatio}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. WHEELS & AERO TAB ================= */}
          {activeTab === 'wheels-aero' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Rim Color */}
              <div className="space-y-2">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono">
                  Forged Rim Finish
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {RIM_COLORS.map((rim) => (
                    <button
                      key={rim.id}
                      onClick={() =>
                        onChangeConfig((prev) => ({
                          ...prev,
                          wheels: { ...prev.wheels, rimColor: rim.hex },
                        }))
                      }
                      className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                        config.wheels.rimColor === rim.hex
                          ? 'bg-white/10 border-white text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: rim.hex }} />
                      <span className="text-xs font-medium">{rim.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brake Calipers */}
              <div className="space-y-2">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono">
                  M Performance Calipers
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {CALIPER_COLORS.map((caliper) => (
                    <button
                      key={caliper.id}
                      onClick={() =>
                        onChangeConfig((prev) => ({
                          ...prev,
                          wheels: { ...prev.wheels, caliperColor: caliper.hex },
                        }))
                      }
                      className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                        config.wheels.caliperColor === caliper.hex
                          ? 'bg-white/10 border-white text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: caliper.hex }} />
                      <span className="text-xs font-medium">{caliper.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Carbon Package Toggles */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono">
                  Carbon Fiber Aerodynamics
                </div>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                    <span className="text-xs font-medium text-slate-200">Carbon Fiber Roof</span>
                    <input
                      type="checkbox"
                      checked={config.carbonFiberRoof}
                      onChange={(e) =>
                        onChangeConfig((prev) => ({ ...prev, carbonFiberRoof: e.target.checked }))
                      }
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                    <span className="text-xs font-medium text-slate-200">M Carbon Exterior Package</span>
                    <input
                      type="checkbox"
                      checked={config.aero.carbonPackage}
                      onChange={(e) =>
                        onChangeConfig((prev) => ({
                          ...prev,
                          aero: { ...prev.aero, carbonPackage: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ================= 5. LIGHTING & STUDIO TAB ================= */}
          {activeTab === 'lighting-env' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Headlight Lighting Controls */}
              <div className="space-y-2">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono">
                  Headlight Optics
                </div>
                <button
                  onClick={() => onChangeConfig((prev) => ({ ...prev, lightsOn: !prev.lightsOn }))}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all border flex items-center justify-between ${
                    config.lightsOn
                      ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  <span>M LASERLIGHT OPTICS</span>
                  <span className="font-mono text-[10px]">{config.lightsOn ? 'ENGAGED' : 'OFF'}</span>
                </button>
              </div>

              {/* Halo Daytime Running Light Color */}
              <div className="space-y-2">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono">
                  Halo Ring Light Hue
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {HALO_COLORS.map((halo) => (
                    <button
                      key={halo.name}
                      onClick={() => onChangeConfig((prev) => ({ ...prev, haloGlowColor: halo.hex }))}
                      className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2 ${
                        config.haloGlowColor === halo.hex
                          ? 'bg-white/10 border-white text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: halo.hex }} />
                      <span className="text-xs font-medium truncate">{halo.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Studio Environment Backdrop */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono">
                  Studio Atmosphere
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'city' as StudioEnvironment, label: 'City Traffic', sub: 'Urban Street' },
                    { id: 'race-track' as StudioEnvironment, label: 'Race Track', sub: 'Circuit Pit' },
                    { id: 'tokyo-highway' as StudioEnvironment, label: 'Tokyo Highway', sub: 'Wet Asphalt' },
                    { id: 'monaco-tunnel' as StudioEnvironment, label: 'Monaco Tunnel', sub: 'F1 Vault' },
                    { id: 'showroom' as StudioEnvironment, label: 'Showroom', sub: 'Luxury Studio' },
                    { id: 'neon-city' as StudioEnvironment, label: 'Neon City', sub: 'Cyberpunk' },
                    { id: 'sunset' as StudioEnvironment, label: 'Golden Hour', sub: 'Open Desert' },
                    { id: 'hypercar-vault' as StudioEnvironment, label: 'Hypercar Vault', sub: 'Cleanroom' },
                    { id: 'dark-studio' as StudioEnvironment, label: 'Dark Studio', sub: 'Minimal' },
                  ].map((env) => (
                    <button
                      key={env.id}
                      onClick={() => {
                        onChangeConfig((prev) => ({ ...prev, environment: env.id }));
                        ambienceSound.setEnvironment(env.id);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        config.environment === env.id
                          ? 'bg-white text-black border-white font-bold shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">{env.label}</div>
                      <div className={`text-[9px] ${config.environment === env.id ? 'text-neutral-700' : 'text-slate-400'}`}>
                        {env.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reactive Environment Ambience Audio Section */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase font-bold tracking-widest text-slate-400 font-mono flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ambience Audio</span>
                  </div>
                  <button
                    onClick={() => {
                      const active = ambienceSound.toggle();
                      onChangeConfig((prev) => ({ ...prev, ambienceSound: active }));
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all border ${
                      ambienceSound.getIsPlaying()
                        ? 'bg-emerald-500 text-black border-emerald-400 font-black'
                        : 'bg-white/10 text-slate-300 border-white/10 hover:text-white'
                    }`}
                  >
                    {ambienceSound.getIsPlaying() ? 'PLAYING' : 'MUTED'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Synthesizes dynamic acoustic soundscapes reacting in real time to the active environment.
                </p>

                {/* Ambience Volume */}
                <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>AMBIENCE LEVEL</span>
                    <span className="text-white font-bold">{Math.round(ambienceSound.getVolume() * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    defaultValue={ambienceSound.getVolume()}
                    onChange={(e) => ambienceSound.setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                {/* Instant Atmosphere FX Cues */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (!ambienceSound.getIsPlaying()) ambienceSound.start();
                      if (config.environment === 'city' || config.environment === 'neon-city') {
                        ambienceSound.triggerDistantCarHorn();
                      } else {
                        ambienceSound.triggerPitWheelWrench();
                      }
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white text-center transition-all"
                  >
                    {config.environment === 'city' || config.environment === 'neon-city'
                      ? '🔊 Honk Horn'
                      : '🔧 Pit Wheel Gun'}
                  </button>
                  <button
                    onClick={() => {
                      if (!ambienceSound.getIsPlaying()) ambienceSound.start();
                      if (config.environment === 'race-track' || config.environment === 'nurburgring-dusk') {
                        ambienceSound.triggerRaceCarFlyby();
                      } else {
                        ambienceSound.triggerPassingCarWhoosh();
                      }
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white text-center transition-all"
                  >
                    {config.environment === 'race-track' || config.environment === 'nurburgring-dusk'
                      ? '🏎️ 280km/h Flyby'
                      : '💨 Vehicle Pass'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary Card */}
        <div className="p-4 border-t border-white/10 bg-black/40">
          <div className="p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold">
                {VEHICLE_MEDIA_CATALOG[config.modelType]?.name || 'Vehicle'}
              </span>
              <span className="text-[10px] text-blue-400 font-mono font-bold">
                {config.viewMode === 'video' ? 'VIDEO MODE' : 'PHOTO STUDIO'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black tracking-tight text-white font-mono">
                {currentEngine.powerHp} HP
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {currentEngine.code}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
