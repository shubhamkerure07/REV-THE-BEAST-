import React, { useState } from 'react';
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
} from 'lucide-react';
import { CarModelType } from '../types';
import { VEHICLE_MEDIA_CATALOG, VehicleMediaData } from '../data/vehicleMedia';
import { getEngineForModel } from '../data/engines';
import { engineSound } from '../utils/audio';

interface EditorialGarageProps {
  selectedCar: CarModelType;
  onSelectCar: (model: CarModelType) => void;
  onViewStory: (model: CarModelType) => void;
  onCustomize: (model: CarModelType) => void;
  onRace: (model: CarModelType) => void;
  onOpenSoundLab: (model: CarModelType) => void;
}

type GarageFilter = 'all' | 'hypercars' | 'superbikes' | 'ai-beasts';

export const EditorialGarage: React.FC<EditorialGarageProps> = ({
  selectedCar,
  onSelectCar,
  onViewStory,
  onCustomize,
  onRace,
  onOpenSoundLab,
}) => {
  const [filter, setFilter] = useState<GarageFilter>('all');
  const [auditioningCar, setAuditioningCar] = useState<CarModelType | null>(null);

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

    // Quick burst of revs
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

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-neutral-100 pt-28 pb-24 px-6 sm:px-12 md:px-16 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Top Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/[0.08] pb-8 mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold">
                CENTRAL PRODUCT FLEET
              </span>
            </div>
            <h1 className="font-syne font-black text-4xl sm:text-6xl text-white tracking-tighter uppercase leading-[0.95]">
              THE GARAGE.
            </h1>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.03] border border-white/[0.08] overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'ALL VEHICLES' },
              { id: 'hypercars', label: 'SUPER & HYPERCARS' },
              { id: 'superbikes', label: 'SUPERBIKES' },
              { id: 'ai-beasts', label: 'AI BEASTS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as GarageFilter)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  filter === tab.id
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicles Grid */}
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
    </div>
  );
};
