import React, { useState, useMemo } from 'react';
import {
  Car,
  Search,
  SlidersHorizontal,
  Flame,
  Volume2,
  Flag,
  ArrowRight,
  Zap,
  Activity,
  Check,
  Sparkles,
} from 'lucide-react';
import { CarModelType } from '../types';
import { VEHICLE_MEDIA_CATALOG, VehicleMediaData } from '../data/vehicleMedia';
import { getEngineForModel } from '../data/engines';
import { engineSound } from '../utils/audio';

interface EditorialCarsProps {
  selectedCar: CarModelType;
  onSelectCar: (model: CarModelType) => void;
  onViewDetails: (model: CarModelType) => void;
  onCustomize: (model: CarModelType) => void;
  onRace: (model: CarModelType) => void;
  showToast: (msg: string) => void;
}

type CarCategoryFilter =
  | 'All'
  | 'Hypercars'
  | 'Supercars'
  | 'Sports Cars'
  | 'Muscle Cars'
  | 'JDM'
  | 'Track Cars'
  | 'Electric Performance Cars';

type SortOption = 'default' | 'power-desc' | 'speed-desc' | 'accel-asc';

export const EditorialCars: React.FC<EditorialCarsProps> = ({
  selectedCar,
  onSelectCar,
  onViewDetails,
  onCustomize,
  onRace,
  showToast,
}) => {
  const [activeCategory, setActiveCategory] = useState<CarCategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [auditioningCar, setAuditioningCar] = useState<CarModelType | null>(null);

  const CATEGORIES: CarCategoryFilter[] = [
    'All',
    'Hypercars',
    'Supercars',
    'Sports Cars',
    'Muscle Cars',
    'JDM',
    'Track Cars',
    'Electric Performance Cars',
  ];

  const handleAuditionSound = (e: React.MouseEvent, model: CarModelType) => {
    e.stopPropagation();
    const eng = getEngineForModel(model);
    engineSound.setProfile(eng.soundProfile);
    engineSound.start();
    setAuditioningCar(model);
    showToast(`AUDITIONING ACOUSTICS: ${eng.name}`);

    // Dynamic rev sequence
    setTimeout(() => engineSound.setThrottle(0.85), 180);
    setTimeout(() => engineSound.setThrottle(0.15), 850);
    setTimeout(() => {
      engineSound.triggerExhaustBackfire();
      engineSound.setThrottle(0);
    }, 1400);
    setTimeout(() => {
      engineSound.stop();
      setAuditioningCar(null);
    }, 2200);
  };

  const filteredAndSortedCars = useMemo(() => {
    const allKeys = Object.keys(VEHICLE_MEDIA_CATALOG) as CarModelType[];

    // 1. Filter by category and search
    const filtered = allKeys.filter((key) => {
      const car = VEHICLE_MEDIA_CATALOG[key];
      const engine = getEngineForModel(key);

      // Category matching
      if (activeCategory !== 'All') {
        if (activeCategory === 'Hypercars') {
          if (car.category !== 'Hypercar' && car.category !== 'Hypercars') return false;
        } else if (activeCategory === 'Supercars') {
          if (car.category !== 'Supercar' && car.category !== 'Supercars') return false;
        } else if (activeCategory === 'Sports Cars') {
          if (
            car.category !== 'Sports Cars' &&
            car.category !== 'Coupé' &&
            car.category !== 'Executive Sedan' &&
            car.category !== 'SUV' &&
            car.category !== 'Cafe Racer' &&
            car.category !== 'Custom Bobber'
          )
            return false;
        } else if (activeCategory === 'Muscle Cars') {
          if (car.category !== 'Muscle' && car.category !== 'Muscle Cars') return false;
        } else if (activeCategory === 'JDM') {
          if (car.category !== 'JDM') return false;
        } else if (activeCategory === 'Track Cars') {
          if (
            car.category !== 'Track Cars' &&
            car.category !== 'Hyperbike' &&
            !key.includes('beast-v12')
          )
            return false;
        } else if (activeCategory === 'Electric Performance Cars') {
          if (
            car.category !== 'Electric Performance Cars' &&
            !key.includes('beast-ev') &&
            engine.soundProfile !== 'electric-motor'
          )
            return false;
        }
      }

      // Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = car.name.toLowerCase().includes(query);
        const matchesBrand = car.brand.toLowerCase().includes(query);
        const matchesEngine = engine.name.toLowerCase().includes(query);
        const matchesBadge = car.badge.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesEngine && !matchesBadge) return false;
      }

      return true;
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      const engA = getEngineForModel(a);
      const engB = getEngineForModel(b);

      if (sortBy === 'power-desc') {
        return engB.powerHp - engA.powerHp;
      }
      if (sortBy === 'speed-desc') {
        const topA = parseInt(VEHICLE_MEDIA_CATALOG[a].keySpecs.topSpeed) || 0;
        const topB = parseInt(VEHICLE_MEDIA_CATALOG[b].keySpecs.topSpeed) || 0;
        return topB - topA;
      }
      if (sortBy === 'accel-asc') {
        const a0100 = parseFloat(VEHICLE_MEDIA_CATALOG[a].keySpecs.zeroToSixty) || 9.9;
        const b0100 = parseFloat(VEHICLE_MEDIA_CATALOG[b].keySpecs.zeroToSixty) || 9.9;
        return a0100 - b0100;
      }
      return 0;
    });
  }, [activeCategory, searchQuery, sortBy]);

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-neutral-100 select-none pt-28 pb-24 px-6 sm:px-12 md:px-16 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/[0.08] pb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold">
                THE ULTIMATE CAR COLLECTION // VERIFIED SPECIFICATIONS
              </span>
            </div>
            <h1 className="font-syne font-black text-4xl sm:text-6xl text-white tracking-tighter uppercase leading-[0.95]">
              CARS CATALOG.
            </h1>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search car, brand, engine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/50 transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort car catalog"
                className="w-full sm:w-auto appearance-none pl-4 pr-8 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white uppercase tracking-wider focus:outline-none focus:border-amber-400/50 cursor-pointer"
              >
                <option value="default" className="bg-neutral-900 text-white">Sort: Default</option>
                <option value="power-desc" className="bg-neutral-900 text-white">Highest Power (HP)</option>
                <option value="accel-asc" className="bg-neutral-900 text-white">Fastest 0-100 km/h</option>
                <option value="speed-desc" className="bg-neutral-900 text-white">Top Speed</option>
              </select>
              <SlidersHorizontal className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cars Grid */}
        {filteredAndSortedCars.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-neutral-900/40 border border-white/[0.08]">
            <Car className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="font-syne font-bold text-xl text-white">No Vehicles Found</h3>
            <p className="text-xs font-mono text-neutral-500 mt-1">
              Try adjusting your search query or switching categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedCars.map((key) => {
              const car = VEHICLE_MEDIA_CATALOG[key];
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
                  {/* Photo Canvas */}
                  <div className="relative w-full h-64 overflow-hidden bg-black/80">
                    <img
                      src={car.photos.hero.url}
                      alt={car.name}
                      onError={(e) => {
                        e.currentTarget.src = car.photos.side?.url || car.photos.front?.url;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />

                    {/* Badge & Sound Button */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span
                        className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border border-white/10 text-white"
                        style={{ backgroundColor: `${car.accentHex}44` }}
                      >
                        {car.badge}
                      </span>

                      <button
                        onClick={(e) => handleAuditionSound(e, key)}
                        className={`p-2.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                          isAuditioning
                            ? 'bg-amber-400 text-black border-amber-400 animate-pulse'
                            : 'bg-black/60 text-white border-white/20 hover:bg-white/20'
                        }`}
                        title="Audition exhaust note"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Active Selection Indicator */}
                    {isSelected && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-black text-[10px] font-mono font-bold uppercase tracking-wider shadow-lg">
                        <Check className="w-3.5 h-3.5" />
                        <span>ACTIVE IN GARAGE</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
                        <span>{car.brand}</span>
                        <span>{car.category}</span>
                      </div>
                      <h3 className="font-syne font-bold text-xl text-white group-hover:text-amber-400 transition-colors">
                        {car.name}
                      </h3>
                      <p className="text-xs text-neutral-400 font-sans line-clamp-1 mt-1">
                        {car.tagline}
                      </p>
                    </div>

                    {/* Performance Spec Matrix */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.06] font-mono text-center">
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase block">POWER</span>
                        <span className="text-xs font-bold text-amber-400">{engine.powerHp} HP</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase block">0-100 KM/H</span>
                        <span className="text-xs font-bold text-white">{car.keySpecs.zeroToSixty}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase block">TOP SPEED</span>
                        <span className="text-xs font-bold text-white">{car.keySpecs.topSpeed.split(' ')[0]}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(key);
                        }}
                        className="flex-1 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-neutral-200 border border-white/10 font-mono text-[11px] font-bold uppercase tracking-wider transition-all text-center cursor-pointer"
                      >
                        DETAILS
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCustomize(key);
                        }}
                        className="flex-1 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-neutral-200 border border-white/10 font-mono text-[11px] font-bold uppercase tracking-wider transition-all text-center cursor-pointer"
                      >
                        CUSTOMIZE
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRace(key);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer shadow-md"
                        title="Race this vehicle"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
