import React, { useState } from 'react';
import { CarModelType } from '../types';
import { VEHICLE_MEDIA_CATALOG } from '../data/vehicleMedia';
import { ChevronRight, ChevronLeft, Sparkles, Flame, Gauge, Zap } from 'lucide-react';

interface VehicleGarageDrawerProps {
  currentModel: CarModelType;
  onSelectModel: (model: CarModelType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

type VehicleCategoryFilter = 'all' | 'supercars' | 'muscle-suv' | 'motorcycles';

export const VehicleGarageDrawer: React.FC<VehicleGarageDrawerProps> = ({
  currentModel,
  onSelectModel,
  isOpen,
  onToggle,
}) => {
  const [filter, setFilter] = useState<VehicleCategoryFilter>('all');

  const allVehicles = Object.values(VEHICLE_MEDIA_CATALOG);

  const filteredVehicles = allVehicles.filter((v) => {
    if (filter === 'all') return true;
    if (filter === 'supercars') return v.id === 'ferrari-sf90' || v.id === 'bugatti-chiron' || v.id === 'procedural-m4';
    if (filter === 'muscle-suv') return v.id === 'mustang-gt' || v.id === 'gwagon-g63' || v.id === 'bmw-5series';
    if (filter === 'motorcycles') return v.id === 're-gt650' || v.id === 're-shotgun650' || v.id === 'ninja-h2r';
    return true;
  });

  return (
    <>
      {/* Floating Left Side Trigger Button */}
      <button
        id="vehicle-drawer-toggle-btn"
        onClick={onToggle}
        className={`fixed top-20 left-4 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#090b10]/85 hover:bg-[#121622] border border-white/15 text-slate-100 backdrop-blur-xl shadow-2xl transition-all duration-300 group hover:border-amber-400/50 hover:shadow-amber-500/10 ${
          isOpen ? 'translate-x-80 sm:translate-x-96 bg-[#121622] border-amber-400/40' : 'translate-x-0'
        }`}
        title={isOpen ? 'Collapse Vehicle Garage' : 'Open Vehicle Garage'}
      >
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-xs font-semibold tracking-wider uppercase">Garage</span>
        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
          {allVehicles.length}
        </span>
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
        )}
      </button>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Slide-out Left Vehicle Drawer */}
      <aside
        id="vehicle-garage-left-drawer"
        className={`fixed top-0 left-0 bottom-0 z-40 w-80 sm:w-96 bg-[#07090e]/95 border-r border-white/10 backdrop-blur-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wider uppercase">Fleet Vault</h2>
              <p className="text-[11px] text-slate-400">Select machine to configure & rev</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 border-b border-white/5 flex gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All ({allVehicles.length})
          </button>
          <button
            onClick={() => setFilter('supercars')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filter === 'supercars'
                ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Supercars
          </button>
          <button
            onClick={() => setFilter('motorcycles')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filter === 'motorcycles'
                ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Motorcycles
          </button>
          <button
            onClick={() => setFilter('muscle-suv')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filter === 'muscle-suv'
                ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Muscle & SUV
          </button>
        </div>

        {/* Vehicle Card List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/15">
          {filteredVehicles.map((vehicle) => {
            const isSelected = currentModel === vehicle.id;
            return (
              <div
                key={vehicle.id}
                id={`vehicle-card-${vehicle.id}`}
                onClick={() => onSelectModel(vehicle.id)}
                className={`group relative rounded-2xl p-3 cursor-pointer transition-all duration-300 border ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-500/15 via-white/[0.04] to-black/60 border-amber-400/70 shadow-lg shadow-amber-500/10'
                    : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                }`}
              >
                {/* Thumbnail Image */}
                <div className="relative w-full h-32 rounded-xl overflow-hidden bg-black/50 border border-white/5 mb-2.5">
                  <img
                    src={vehicle.photos.hero.thumbnail || vehicle.photos.hero.url}
                    alt={vehicle.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-medium text-slate-300">
                    {vehicle.category}
                  </div>

                  {/* Active Indicator Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 fill-black" />
                      Active
                    </div>
                  )}

                  {/* 0-100 pill */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-amber-300">
                    {vehicle.keySpecs.zeroToSixty.split(' ')[0]} {vehicle.keySpecs.zeroToSixty.split(' ')[1] || '0-100'}
                  </div>

                  {/* Horsepower pill */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400">
                    {vehicle.keySpecs.horsepower.split(' ')[0]} HP
                  </div>
                </div>

                {/* Vehicle Meta */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      {vehicle.brand}
                    </span>
                    <h3 className={`text-sm font-bold tracking-tight line-clamp-1 transition-colors ${
                      isSelected ? 'text-amber-400' : 'text-white group-hover:text-amber-200'
                    }`}>
                      {vehicle.name}
                    </h3>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                  {vehicle.keySpecs.engine}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Quick Switch Note */}
        <div className="p-3.5 border-t border-white/10 bg-black/40 text-center text-[11px] text-slate-400">
          Click any vehicle to instantly switch sound, specs, & 3D machine
        </div>
      </aside>
    </>
  );
};
