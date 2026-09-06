import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Info,
  ChevronUp,
  ChevronDown,
  Zap,
  Gauge,
  Wind,
  Weight,
  Layers,
  Activity,
  Compass,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { CarModelType } from '../types';
import { getVehicleSpecs } from '../data/vehicleSpecs';
import { getEngineForModel } from '../data/engines';
import { VEHICLE_MEDIA_CATALOG } from '../data/vehicleMedia';

interface VehicleDetailsBarProps {
  modelType: CarModelType;
  onOpenSpecsModal: () => void;
  gForce?: number;
  dragNewtons?: number;
}

export const VehicleDetailsBar: React.FC<VehicleDetailsBarProps> = ({
  modelType,
  onOpenSpecsModal,
  gForce = 0,
  dragNewtons = 0,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeGroup, setActiveGroup] = useState<'powertrain' | 'chassis' | 'aero'>('powertrain');

  const specs = getVehicleSpecs(modelType);
  const engine = getEngineForModel(modelType);
  const media = VEHICLE_MEDIA_CATALOG[modelType];

  return (
    <div
      id="vehicle-details-bar"
      className="fixed top-20 left-4 sm:left-6 z-30 pointer-events-auto flex flex-col items-start"
    >
      <AnimatePresence initial={false} mode="wait">
        {!isOpen ? (
          /* COLLAPSED MINI BADGE */
          <motion.div
            key="collapsed-details-badge"
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <button
              id="btn-expand-vehicle-details"
              onClick={() => setIsOpen(true)}
              className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black/95 text-slate-200 hover:text-white border border-white/15 hover:border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all cursor-pointer ring-1 ring-white/10"
              title="Click to expand detailed vehicle performance specifications and grouped engineering details"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0"
                  style={{ backgroundColor: media?.accentHex || '#3b82f6' }}
                />
                <span className="font-mono text-xs font-black tracking-wider text-white uppercase truncate max-w-[140px] sm:max-w-[200px]">
                  {media?.name || specs.model}
                </span>
              </div>

              <div className="hidden md:flex items-center gap-2 text-[11px] font-mono border-l border-white/15 pl-2 text-slate-300">
                <span className="text-amber-400 font-bold">{specs.acceleration.split('(')[0].trim()}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-bold">{specs.topSpeed.split('(')[0].trim()}</span>
                <span className="text-slate-500">•</span>
                <span className="text-rose-400 font-bold">{engine.powerHp} HP</span>
              </div>

              <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-slate-300 font-bold group-hover:bg-white/20 ml-1">
                SPECS ⤢
              </span>
            </button>
          </motion.div>
        ) : (
          /* EXPANDED DETAILED GROUPED SPECIFICATIONS CARD */
          <motion.div
            key="expanded-details-card"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="w-[340px] sm:w-[380px] max-w-[calc(100vw-2rem)] bg-black/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-3.5 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-slate-200 ring-1 ring-white/10"
          >
            {/* Header: Vehicle Name, Class & Collapse */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: media?.accentHex || '#3b82f6' }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-black tracking-tight text-white uppercase font-mono truncate">
                    {specs.model}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {specs.generation}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  id="btn-open-full-specs-modal"
                  onClick={onOpenSpecsModal}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all text-[10px] font-mono font-bold flex items-center gap-1"
                  title="Open full detailed modal"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="hidden sm:inline">FULL</span>
                </button>
                <button
                  id="btn-collapse-vehicle-details"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Collapse Details Panel"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Top Key Performance Metrics Grid */}
            <div className="grid grid-cols-4 gap-1.5 my-2.5 bg-white/[0.04] p-2 rounded-2xl border border-white/5 text-center font-mono">
              <div className="border-r border-white/10 pr-1">
                <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">0–100 KM/H</div>
                <div className="text-xs sm:text-sm font-black text-amber-400">
                  {specs.acceleration.match(/[\d.]+\s*s/)?.[0] || '2.5s'}
                </div>
              </div>

              <div className="border-r border-white/10 px-1">
                <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">TOP SPEED</div>
                <div className="text-xs sm:text-sm font-black text-emerald-400">
                  {specs.topSpeed.match(/[\d.]+\s*km\/h/)?.[0] || '340km/h'}
                </div>
              </div>

              <div className="border-r border-white/10 px-1">
                <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">OUTPUT</div>
                <div className="text-xs sm:text-sm font-black text-rose-400">
                  {engine.powerHp} HP
                </div>
              </div>

              <div className="pl-1">
                <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">MASS</div>
                <div className="text-xs sm:text-sm font-black text-cyan-300">
                  {specs.weight.match(/[\d,.]+\s*kg/)?.[0] || '1,570kg'}
                </div>
              </div>
            </div>

            {/* Feature Group Navigation Tabs */}
            <div className="flex p-0.5 bg-white/[0.05] rounded-xl border border-white/10 mb-2 font-mono text-[10px]">
              <button
                onClick={() => setActiveGroup('powertrain')}
                className={`flex-1 py-1 px-1.5 rounded-lg font-bold transition-all text-center ${
                  activeGroup === 'powertrain'
                    ? 'bg-white text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Powertrain
              </button>
              <button
                onClick={() => setActiveGroup('chassis')}
                className={`flex-1 py-1 px-1.5 rounded-lg font-bold transition-all text-center ${
                  activeGroup === 'chassis'
                    ? 'bg-white text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Chassis/Drive
              </button>
              <button
                onClick={() => setActiveGroup('aero')}
                className={`flex-1 py-1 px-1.5 rounded-lg font-bold transition-all text-center ${
                  activeGroup === 'aero'
                    ? 'bg-white text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Aero/Dynamics
              </button>
            </div>

            {/* Group Content with Smooth Animation */}
            <div className="min-h-[125px] bg-black/40 p-2.5 rounded-xl border border-white/5 font-mono text-[11px] space-y-1.5">
              {activeGroup === 'powertrain' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">ENGINE:</span>
                    <span className="text-white font-bold text-right truncate max-w-[200px]">{engine.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">DISPLACEMENT:</span>
                    <span className="text-amber-300 font-bold">{engine.displacement} ({engine.cylinders})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">ASPIRATION:</span>
                    <span className="text-rose-400 font-bold">{engine.aspiration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">REDLINE:</span>
                    <span className="text-emerald-400 font-bold">{engine.redlineRpm} RPM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">MAX BOOST:</span>
                    <span className="text-cyan-400 font-bold">{engine.maxBoostPsi ? `${engine.maxBoostPsi} PSI` : 'Naturally Aspirated'}</span>
                  </div>
                </motion.div>
              )}

              {activeGroup === 'chassis' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">DRIVETRAIN:</span>
                    <span className="text-white font-bold text-right truncate max-w-[200px]">{specs.drivetrain}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">TRANSMISSION:</span>
                    <span className="text-amber-300 font-bold text-right truncate max-w-[190px]">{specs.transmission}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">CURB MASS:</span>
                    <span className="text-cyan-300 font-bold">{specs.weight}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">WHEELBASE:</span>
                    <span className="text-emerald-400 font-bold">{specs.wheelbase}</span>
                  </div>
                </motion.div>
              )}

              {activeGroup === 'aero' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">AERO DRAG (NEWTONS):</span>
                    <span className="text-emerald-400 font-bold">{dragNewtons} N</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">LONGITUDINAL G-FORCE:</span>
                    <span className="text-amber-400 font-bold">
                      {gForce > 0 ? `+${gForce.toFixed(2)}G` : `${gForce.toFixed(2)}G`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">MAX TORQUE:</span>
                    <span className="text-cyan-400 font-bold">{engine.torqueNm} Nm ({engine.torqueLbFt} lb-ft)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">LENGTH × WIDTH:</span>
                    <span className="text-slate-300 font-bold">{specs.length} × {specs.width}</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer toggle */}
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-2">
              <button
                onClick={onOpenSpecsModal}
                className="text-slate-400 hover:text-white underline flex items-center gap-1"
              >
                <span>View Full Factory Sheet</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white underline"
              >
                Collapse
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
