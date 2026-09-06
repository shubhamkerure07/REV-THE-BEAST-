import React from 'react';
import { X, Gauge, Zap, Wind, Weight, Layers, ShieldCheck } from 'lucide-react';
import { CarModelType, CarSpecification } from '../types';
import { VEHICLE_MEDIA_CATALOG } from '../data/vehicleMedia';
import { getEngineForModel } from '../data/engines';
import { VEHICLE_SPECS_MAP } from '../data/vehicleSpecs';

interface SpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelType?: CarModelType;
}

export const SpecsModal: React.FC<SpecsModalProps> = ({ isOpen, onClose, modelType = 'procedural-m4' as CarModelType }) => {
  if (!isOpen) return null;

  const currentModel: CarModelType = modelType || 'procedural-m4';
  const specs = VEHICLE_SPECS_MAP[currentModel] || VEHICLE_SPECS_MAP['procedural-m4'];
  const media = VEHICLE_MEDIA_CATALOG[currentModel];
  const engine = getEngineForModel(currentModel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div
        id="specs-modal-content"
        className="relative w-full max-w-xl bg-[#050505]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20"
      >
        {/* Close Button */}
        <button
          id="btn-close-specs"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white shrink-0 shadow-lg font-black text-sm font-mono"
            style={{ backgroundColor: `${media?.accentHex || '#3b82f6'}33` }}
          >
            {modelType === 'ninja-h2r' ? 'K' : modelType === 'mustang-gt' ? 'GT' : modelType === 'gwagon-g63' ? 'G' : 'M'}
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter text-white">
              {specs.model}
            </h2>
            <p className="text-xs text-slate-400 font-medium tracking-wide">{specs.generation}</p>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <Zap className="w-5 h-5 mx-auto mb-1 text-amber-400" />
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">0-100 KM/H</div>
            <div className="text-sm sm:text-base font-black text-white font-mono mt-0.5">{media?.keySpecs.zeroToSixty || '3.4s'}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <Gauge className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">MAX POWER</div>
            <div className="text-sm sm:text-base font-black text-white font-mono mt-0.5">{engine.powerHp} HP</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <Wind className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">V-MAX</div>
            <div className="text-sm sm:text-base font-black text-white font-mono mt-0.5">{media?.keySpecs.topSpeed || '290 km/h'}</div>
          </div>
        </div>

        {/* Technical Data Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold border-b border-white/10 pb-2">
            Powertrain & Performance Engineering
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Engine Code & Type</span>
              <span className="text-slate-200 font-semibold">{specs.engine}</span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Peak Torque</span>
              <span className="text-slate-200 font-semibold">{specs.torque}</span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Transmission</span>
              <span className="text-slate-200 font-semibold">{specs.transmission}</span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Drivetrain & Diff</span>
              <span className="text-slate-200 font-semibold">{specs.drivetrain}</span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Weight & Balance</span>
              <span className="text-slate-200 font-semibold">{specs.weight}</span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Chassis Dimensions</span>
              <span className="text-slate-200 font-semibold">{specs.length} × {specs.width} × {specs.height}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
