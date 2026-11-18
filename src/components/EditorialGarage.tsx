import React, { useState, useEffect, useMemo } from 'react';
import {
  Car,
  Sparkles,
  Sliders,
  Flag,
  ArrowRight,
  Flame,
  Volume2,
  Check,
  Zap,
  Activity,
  Trash2,
  Trophy,
  Gauge,
  Scale,
  Award,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { CarModelType } from '../types';
import { VEHICLE_MEDIA_CATALOG } from '../data/vehicleMedia';
import { getEngineForModel } from '../data/engines';
import { engineSound } from '../utils/audio';
import { VEHICLE_PHYSICS_PROFILES } from '../utils/vehicleMechanics';

interface EditorialGarageProps {
  selectedCar: CarModelType;
  onSelectCar: (model: CarModelType) => void;
  onViewStory: (model: CarModelType) => void;
  onCustomize: (model: CarModelType) => void;
  onRace: (model: CarModelType) => void;
  onOpenSoundLab: (model: CarModelType) => void;
}

type GarageTopTab = 'fleet' | 'saved-builds' | 'comparison' | 'career';
type GarageFilter = 'all' | 'hypercars' | 'superbikes' | 'ai-beasts';

interface SavedBuild {
  id: string;
  date: string;
  modelType: CarModelType;
  paintColor: string;
  paintFinish: string;
  wheels?: any;
  exhaust?: any;
  tuning?: any;
}

export const EditorialGarage: React.FC<EditorialGarageProps> = ({
  selectedCar,
  onSelectCar,
  onViewStory,
  onCustomize,
  onRace,
  onOpenSoundLab,
}) => {
  const [activeTab, setActiveTab] = useState<GarageTopTab>('fleet');
  const [filter, setFilter] = useState<GarageFilter>('all');
  const [auditioningCar, setAuditioningCar] = useState<CarModelType | null>(null);

  // Saved Builds State
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);

  // Comparison State
  const [carA, setCarA] = useState<CarModelType>(selectedCar);
  const [carB, setCarB] = useState<CarModelType>('ferrari-sf90');

  // Load Saved Builds from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rev_beast_custom_builds');
      if (stored) {
        setSavedBuilds(JSON.parse(stored));
      }
    } catch {
      setSavedBuilds([]);
    }
  }, [activeTab]);

  const handleDeleteBuild = (id: string) => {
    try {
      const updated = savedBuilds.filter((b) => b.id !== id);
      setSavedBuilds(updated);
      localStorage.setItem('rev_beast_custom_builds', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const vehicleKeys = Object.keys(VEHICLE_MEDIA_CATALOG) as CarModelType[];

  const filteredVehicles = vehicleKeys.filter((key) => {
    const item = VEHICLE_MEDIA_CATALOG[key];
    if (filter === 'hypercars') {
      return item.category === 'Supercar' || item.category === 'Hypercar' || item.category === 'Coupé';
    }
    if (filter === 'superbikes') {
      return item.category === 'Hyperbike' || item.category === 'Cafe Racer';
    }
    if (filter === 'ai-beasts') {
      return key.includes('beast') || item.badge.includes('AI') || key.includes('custom');
    }
    return true;
  });

  const handleAuditionSound = (e: React.MouseEvent, model: CarModelType) => {
    e.stopPropagation();
    const eng = getEngineForModel(model);
    engineSound.setProfile(eng.soundProfile);
    engineSound.start();
    setAuditioningCar(model);

    // Dynamic throttle sequence
    setTimeout(() => engineSound.setThrottle(0.8), 200);
    setTimeout(() => engineSound.setThrottle(0.2), 900);
    setTimeout(() => {
      engineSound.triggerExhaustBackfire();
      engineSound.setThrottle(0);
    }, 1400);
    setTimeout(() => {
      engineSound.stop();
      setAuditioningCar(null);
    }, 2200);
  };

  // Specs for Comparison
  const specsA = useMemo(() => {
    const media = VEHICLE_MEDIA_CATALOG[carA];
    const engine = getEngineForModel(carA);
    const phys = VEHICLE_PHYSICS_PROFILES[carA] || VEHICLE_PHYSICS_PROFILES['procedural-m4'];
    const ptw = Math.round((phys.maxPowerHp / phys.curbWeightKg) * 1000);
    return { media, engine, phys, ptw };
  }, [carA]);

  const specsB = useMemo(() => {
    const media = VEHICLE_MEDIA_CATALOG[carB];
    const engine = getEngineForModel(carB);
    const phys = VEHICLE_PHYSICS_PROFILES[carB] || VEHICLE_PHYSICS_PROFILES['procedural-m4'];
    const ptw = Math.round((phys.maxPowerHp / phys.curbWeightKg) * 1000);
    return { media, engine, phys, ptw };
  }, [carB]);

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-neutral-100 pt-28 pb-24 px-6 sm:px-12 md:px-16 select-none animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Header & Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/[0.08] pb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold">
                CENTRAL MOTORING HEADQUARTERS
              </span>
            </div>
            <h1 className="font-syne font-black text-4xl sm:text-6xl text-white tracking-tighter uppercase leading-[0.95]">
              THE GARAGE.
            </h1>
          </div>

          {/* Primary Section Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] overflow-x-auto max-w-full">
            {[
              { id: 'fleet', label: 'FLEET ARCHIVE', icon: Car },
              { id: 'saved-builds', label: `SAVED BUILDS (${savedBuilds.length})`, icon: Sparkles },
              { id: 'comparison', label: 'COMPARISON', icon: Scale },
              { id: 'career', label: 'CAREER & RECORDS', icon: Trophy },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as GarageTopTab)}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: FLEET ARCHIVE */}
        {activeTab === 'fleet' && (
          <div className="space-y-8">
            {/* Filter Sub-Pills */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.03] border border-white/[0.08] overflow-x-auto">
                {[
                  { id: 'all', label: 'ALL MACHINES' },
                  { id: 'hypercars', label: 'SUPER & HYPERCARS' },
                  { id: 'superbikes', label: 'SUPERBIKES' },
                  { id: 'ai-beasts', label: 'AI BEASTS' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setFilter(pill.id as GarageFilter)}
                    className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      filter === pill.id
                        ? 'bg-white text-black'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                SHOWING <span className="text-white font-bold">{filteredVehicles.length}</span> VEHICLES IN FLEET
              </div>
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVehicles.map((key) => {
                const item = VEHICLE_MEDIA_CATALOG[key];
                const engine = getEngineForModel(key);
                const isSelected = selectedCar === key;
                const isAuditioning = auditioningCar === key;

                return (
                  <div
                    key={key}
                    onClick={() => onSelectCar(key)}
                    className={`group rounded-3xl overflow-hidden bg-neutral-900/60 border transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1.5 shadow-xl ${
                      isSelected
                        ? 'border-amber-400/80 ring-1 ring-amber-400/30'
                        : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    {/* Large Photography Container */}
                    <div className="relative w-full h-64 overflow-hidden bg-black/80">
                      <img
                        src={item.photos.hero.url}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.src = item.photos.side?.url || item.photos.front?.url;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span
                          className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border border-white/10 text-white"
                          style={{ backgroundColor: `${item.accentHex}44` }}
                        >
                          {item.badge}
                        </span>

                        {/* Quick Sound Audition Button */}
                        <button
                          onClick={(e) => handleAuditionSound(e, key)}
                          className={`p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                            isAuditioning
                              ? 'bg-amber-400 text-black border-amber-400 animate-pulse'
                              : 'bg-black/60 text-white border-white/20 hover:bg-white/20'
                          }`}
                          title="Audition exhaust acoustics"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Selected Indicator Checkmark */}
                      {isSelected && (
                        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-black text-[10px] font-mono font-bold uppercase tracking-wider shadow-lg">
                          <Check className="w-3.5 h-3.5" />
                          <span>SELECTED</span>
                        </div>
                      )}
                    </div>

                    {/* Information Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block mb-1">
                          {item.category} • {item.brand}
                        </span>
                        <h3 className="font-syne font-bold text-2xl text-white group-hover:text-amber-400 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-1 font-sans">
                          {item.keySpecs.soundType}
                        </p>
                      </div>

                      {/* Metric Chips */}
                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.08] text-center font-mono">
                        <div className="bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]">
                          <span className="text-[9px] text-neutral-400 block uppercase">OUTPUT</span>
                          <span className="text-sm font-black text-amber-400">{engine.powerHp} HP</span>
                        </div>
                        <div className="bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]">
                          <span className="text-[9px] text-neutral-400 block uppercase">0-100</span>
                          <span className="text-sm font-black text-white">{item.keySpecs.zeroToSixty.split(' ')[0]}s</span>
                        </div>
                        <div className="bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]">
                          <span className="text-[9px] text-neutral-400 block uppercase">V-MAX</span>
                          <span className="text-sm font-black text-neutral-300">{item.keySpecs.topSpeed.split(' ')[0]}</span>
                        </div>
                      </div>

                      {/* Multi-Action Triggers */}
                      <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] font-bold">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewStory(key);
                          }}
                          className="py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 transition-all text-center cursor-pointer"
                        >
                          STORY
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCustomize(key);
                          }}
                          className="py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 transition-all text-center cursor-pointer"
                        >
                          CUSTOMIZE
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRace(key);
                          }}
                          className="py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black transition-all text-center cursor-pointer shadow-md font-black"
                        >
                          RACE
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SAVED BUILDS */}
        {activeTab === 'saved-builds' && (
          <div className="space-y-6">
            {savedBuilds.length === 0 ? (
              <div className="p-16 rounded-3xl bg-neutral-900/40 border border-white/[0.08] text-center space-y-4">
                <Sparkles className="w-12 h-12 text-amber-400/60 mx-auto" />
                <h3 className="font-syne font-bold text-2xl text-white">NO SAVED BUILDS FOUND</h3>
                <p className="text-sm text-neutral-400 max-w-md mx-auto font-sans font-light">
                  Open the Customizer on any vehicle to select custom paint, aerodynamic packages, exhaust materials, and performance stages. Save your build to access it here.
                </p>
                <button
                  onClick={() => onCustomize(selectedCar)}
                  className="mt-4 px-6 py-2.5 rounded-full bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-amber-300 transition-all cursor-pointer"
                >
                  OPEN CUSTOMIZER
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedBuilds.map((b) => {
                  const media = VEHICLE_MEDIA_CATALOG[b.modelType];
                  return (
                    <div
                      key={b.id}
                      className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-6"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
                          <span>SAVED SPEC</span>
                          <span>{b.date}</span>
                        </div>
                        <h3 className="font-syne font-bold text-xl text-white">{media.name}</h3>
                        <p className="text-xs font-mono text-neutral-400">{media.category} • {media.brand}</p>

                        {/* Visual Spec Swatches */}
                        <div className="mt-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: b.paintColor }}
                            />
                            <span className="text-neutral-300 capitalize">{b.paintFinish}</span>
                          </div>
                          <span className="text-amber-400 font-bold uppercase">{b.exhaust?.material || 'OEM'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 font-mono text-[11px] font-bold">
                        <button
                          onClick={() => {
                            onSelectCar(b.modelType);
                            onCustomize(b.modelType);
                          }}
                          className="py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 transition-all text-center cursor-pointer"
                        >
                          LOAD
                        </button>
                        <button
                          onClick={() => {
                            onSelectCar(b.modelType);
                            onRace(b.modelType);
                          }}
                          className="py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black transition-all text-center cursor-pointer font-black"
                        >
                          RACE
                        </button>
                        <button
                          onClick={() => handleDeleteBuild(b.id)}
                          className="py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all flex items-center justify-center cursor-pointer"
                          title="Delete build"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VEHICLE COMPARISON */}
        {activeTab === 'comparison' && (
          <div className="space-y-8">
            {/* Vehicle Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle A Selector */}
              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-4">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block">
                  VEHICLE A (ALPHA)
                </span>
                <select
                  value={carA}
                  onChange={(e) => setCarA(e.target.value as CarModelType)}
                  className="w-full bg-black/60 border border-white/20 rounded-2xl px-4 py-3 text-sm font-syne font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  {vehicleKeys.map((k) => (
                    <option key={k} value={k} className="bg-neutral-900 text-white">
                      {VEHICLE_MEDIA_CATALOG[k].name} ({VEHICLE_MEDIA_CATALOG[k].category})
                    </option>
                  ))}
                </select>
                <div className="h-44 rounded-2xl overflow-hidden bg-black/80 relative">
                  <img
                    src={specsA.media.photos.hero.url}
                    alt={specsA.media.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 text-xs font-mono font-bold text-white">
                    {specsA.engine.powerHp} HP • {specsA.phys.curbWeightKg} KG
                  </div>
                </div>
              </div>

              {/* Vehicle B Selector */}
              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-4">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
                  VEHICLE B (BETA)
                </span>
                <select
                  value={carB}
                  onChange={(e) => setCarB(e.target.value as CarModelType)}
                  className="w-full bg-black/60 border border-white/20 rounded-2xl px-4 py-3 text-sm font-syne font-bold text-white focus:outline-none focus:border-cyan-400"
                >
                  {vehicleKeys.map((k) => (
                    <option key={k} value={k} className="bg-neutral-900 text-white">
                      {VEHICLE_MEDIA_CATALOG[k].name} ({VEHICLE_MEDIA_CATALOG[k].category})
                    </option>
                  ))}
                </select>
                <div className="h-44 rounded-2xl overflow-hidden bg-black/80 relative">
                  <img
                    src={specsB.media.photos.hero.url}
                    alt={specsB.media.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 text-xs font-mono font-bold text-white">
                    {specsB.engine.powerHp} HP • {specsB.phys.curbWeightKg} KG
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Comparison Metrics */}
            <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/50 border border-white/[0.08] space-y-6">
              <h3 className="font-syne font-bold text-xl text-white uppercase tracking-tight">
                MECHANICAL BENCHMARK SPECIFICATIONS
              </h3>

              <div className="space-y-4 font-mono text-xs">
                {/* Metric 1: Output Power */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="text-amber-400 font-bold">{specsA.engine.powerHp} HP</span>
                    <span className="uppercase tracking-widest">MAX HORSEPOWER</span>
                    <span className="text-cyan-400 font-bold">{specsB.engine.powerHp} HP</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 h-2 rounded-full overflow-hidden bg-neutral-800">
                    <div
                      className="h-full bg-amber-400 rounded-l-full"
                      style={{ width: `${Math.min(100, (specsA.engine.powerHp / 1600) * 100)}%` }}
                    />
                    <div
                      className="h-full bg-cyan-400 rounded-r-full ml-auto"
                      style={{ width: `${Math.min(100, (specsB.engine.powerHp / 1600) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Metric 2: Torque */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="text-amber-400 font-bold">{specsA.engine.torqueNm} NM</span>
                    <span className="uppercase tracking-widest">PEAK TORQUE</span>
                    <span className="text-cyan-400 font-bold">{specsB.engine.torqueNm} NM</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 h-2 rounded-full overflow-hidden bg-neutral-800">
                    <div
                      className="h-full bg-amber-400 rounded-l-full"
                      style={{ width: `${Math.min(100, (specsA.engine.torqueNm / 1600) * 100)}%` }}
                    />
                    <div
                      className="h-full bg-cyan-400 rounded-r-full ml-auto"
                      style={{ width: `${Math.min(100, (specsB.engine.torqueNm / 1600) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Metric 3: Top Speed */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="text-amber-400 font-bold">{specsA.phys.officialTopSpeedKmh} KM/H</span>
                    <span className="uppercase tracking-widest">ESTIMATED V-MAX</span>
                    <span className="text-cyan-400 font-bold">{specsB.phys.officialTopSpeedKmh} KM/H</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 h-2 rounded-full overflow-hidden bg-neutral-800">
                    <div
                      className="h-full bg-amber-400 rounded-l-full"
                      style={{ width: `${Math.min(100, (specsA.phys.officialTopSpeedKmh / 450) * 100)}%` }}
                    />
                    <div
                      className="h-full bg-cyan-400 rounded-r-full ml-auto"
                      style={{ width: `${Math.min(100, (specsB.phys.officialTopSpeedKmh / 450) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Metric 4: Power-to-Weight Ratio */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="text-amber-400 font-bold">{specsA.ptw} HP/TON</span>
                    <span className="uppercase tracking-widest">POWER-TO-WEIGHT</span>
                    <span className="text-cyan-400 font-bold">{specsB.ptw} HP/TON</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 h-2 rounded-full overflow-hidden bg-neutral-800">
                    <div
                      className="h-full bg-amber-400 rounded-l-full"
                      style={{ width: `${Math.min(100, (specsA.ptw / 1000) * 100)}%` }}
                    />
                    <div
                      className="h-full bg-cyan-400 rounded-r-full ml-auto"
                      style={{ width: `${Math.min(100, (specsB.ptw / 1000) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Qualitative Specs */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                    <span className="text-[10px] text-neutral-400 block uppercase">ENGINE CONFIGURATION</span>
                    <span className="text-white font-bold block">{specsA.engine.type}</span>
                    <span className="text-neutral-400 block">{specsA.engine.displacement}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1 text-right">
                    <span className="text-[10px] text-neutral-400 block uppercase">ENGINE CONFIGURATION</span>
                    <span className="text-white font-bold block">{specsB.engine.type}</span>
                    <span className="text-neutral-400 block">{specsB.engine.displacement}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CAREER & TELEMETRY */}
        {activeTab === 'career' && (
          <div className="space-y-8">
            {/* Overview Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                  RACE VICTORIES
                </span>
                <span className="font-syne font-black text-3xl text-white">12 WINS</span>
                <span className="text-xs text-neutral-400 font-mono block">18 Total Starts (66.7% Win Rate)</span>
              </div>

              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                  <Gauge className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                  PEAK VELOCITY RECORD
                </span>
                <span className="font-syne font-black text-3xl text-white">356 KM/H</span>
                <span className="text-xs text-neutral-400 font-mono block">Set on Dragway (Bugatti Chiron)</span>
              </div>

              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                  TOTAL DISTANCE LOGGED
                </span>
                <span className="font-syne font-black text-3xl text-white">418.5 KM</span>
                <span className="text-xs text-neutral-400 font-mono block">Across 4 Grand Prix circuits</span>
              </div>

              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-400/10 border border-purple-400/30 flex items-center justify-center text-purple-400">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                  DRIVER REPUTATION TIER
                </span>
                <span className="font-syne font-black text-3xl text-white">TIER S // APEX</span>
                <span className="text-xs text-neutral-400 font-mono block">9,450 XP Earned</span>
              </div>
            </div>

            {/* Circuit Best Laps Table */}
            <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-6">
              <h3 className="font-syne font-bold text-xl text-white uppercase tracking-tight">
                PERSONAL BEST CIRCUIT TIMINGS
              </h3>

              <div className="divide-y divide-white/[0.08] font-mono text-xs">
                {[
                  { track: 'Nürburgring GP Circuit', bestLap: '01:28.452', car: 'Lamborghini Aventador SVJ', condition: 'Dry Asphalt' },
                  { track: 'Tokyo C1 Midnight Loop', bestLap: '01:34.120', car: 'Nissan GT-R Nismo R35', condition: 'Night / Damp' },
                  { track: 'Big Sur Coastal Highway', bestLap: '02:05.884', car: 'Ferrari SF90 Stradale', condition: 'Golden Hour' },
                  { track: 'Quarter-Mile Dragway', bestLap: '00:09.112', car: 'Bugatti Chiron Pur Sport', condition: 'Prepped Surface' },
                ].map((rec, i) => (
                  <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-white font-bold block text-sm">{rec.track}</span>
                      <span className="text-neutral-400 text-[11px]">{rec.car} • {rec.condition}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-400 font-bold text-base">{rec.bestLap}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Driver Achievements */}
            <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-6">
              <h3 className="font-syne font-bold text-xl text-white uppercase tracking-tight">
                DRIVER BADGES & ACCOMPLISHMENTS
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'APEX PREDATOR', desc: 'Finish a 3-lap Grand Prix race without a single barrier collision.', unlocked: true },
                  { title: 'SUPERSONIC VELOCITY', desc: 'Break the 320 km/h threshold in any simulation mode.', unlocked: true },
                  { title: 'DRIFT MAESTRO', desc: 'Maintain a 35-degree handbrake drift angle through a hairpin turn.', unlocked: true },
                  { title: 'MASTER TUNER', desc: 'Configure and save a custom vehicle build in the studio.', unlocked: true },
                  { title: 'FLEET CONNOISSEUR', desc: 'Audition and drive all 13 machines across the collection.', unlocked: false },
                  { title: 'DRAG KING', desc: 'Achieve a sub-0.20s reaction time off the starting tree.', unlocked: true },
                ].map((ach, i) => (
                  <div
                    key={i}
                    className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                      ach.unlocked
                        ? 'bg-white/[0.03] border-amber-400/30'
                        : 'bg-white/[0.01] border-white/[0.04] opacity-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        ach.unlocked
                          ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                          : 'bg-white/5 text-neutral-500 border border-white/10'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-syne font-bold text-sm text-white">{ach.title}</h4>
                      <p className="text-xs text-neutral-400 font-sans mt-1 leading-relaxed">{ach.desc}</p>
                      <span
                        className={`text-[9px] font-mono uppercase font-bold tracking-wider mt-2 inline-block ${
                          ach.unlocked ? 'text-amber-400' : 'text-neutral-500'
                        }`}
                      >
                        {ach.unlocked ? 'COMPLETED' : 'LOCKED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
