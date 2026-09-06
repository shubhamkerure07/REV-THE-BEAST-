import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ChevronDown, ChevronUp, Zap, Flame, Play } from 'lucide-react';
import { EngineSpec } from '../types';
import { DynoPowerChart } from './DynoPowerChart';
import { calculateLivePower } from '../utils/dynoCalculator';
import { engineSound } from '../utils/audio';

interface DynoGraphHUDProps {
  engine: EngineSpec;
  currentRpm: number;
  isSoundActive: boolean;
  onToggleSound: () => void;
}

export const DynoGraphHUD: React.FC<DynoGraphHUDProps> = ({
  engine,
  currentRpm,
  isSoundActive,
  onToggleSound,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDynoRunning, setIsDynoRunning] = useState<boolean>(false);

  const effectiveRpm = isSoundActive ? currentRpm : engine.idleRpm;
  const livePower = calculateLivePower(engine, effectiveRpm);

  const handleRunDynoSweep = () => {
    if (!isSoundActive) onToggleSound();
    setIsDynoRunning(true);
    setIsOpen(true);
    engineSound.playDynoPull(() => {
      setIsDynoRunning(false);
    });
  };

  return (
    <div
      id="dyno-graph-hud-dock"
      className="fixed top-20 right-4 sm:right-6 z-30 pointer-events-auto flex flex-col items-end"
    >
      <AnimatePresence initial={false} mode="wait">
        {!isOpen ? (
          /* COLLAPSED MINI-HUD BADGE */
          <motion.div
            key="collapsed-dyno-badge"
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex items-center gap-1.5"
          >
            <button
              id="btn-expand-dyno-graph"
              onClick={() => setIsOpen(true)}
              className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black/95 text-slate-200 hover:text-white border border-rose-500/30 hover:border-rose-500/60 shadow-[0_4px_20px_rgba(244,63,94,0.25)] backdrop-blur-xl transition-all cursor-pointer ring-1 ring-white/10"
              title="Click to expand real-time Torque & Horsepower Dyno Curve"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>

              <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                <Activity className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                <span className="text-white tracking-wider">DYNO GRAPH</span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono border-l border-white/15 pl-2">
                <span className="text-rose-400 font-black">
                  {isSoundActive ? livePower.hp : engine.powerHp} HP
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-400 font-black">
                  {isSoundActive ? livePower.torqueNm : engine.torqueNm} Nm
                </span>
              </div>

              <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-slate-300 font-bold group-hover:bg-white/20">
                EXPAND ⤢
              </span>
            </button>
          </motion.div>
        ) : (
          /* EXPANDED FULL INTERACTIVE RECHARTS DYNO DOCK */
          <motion.div
            key="expanded-dyno-panel"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="w-[360px] sm:w-[390px] max-w-[calc(100vw-2rem)] bg-black/90 backdrop-blur-2xl border border-rose-500/30 rounded-3xl p-3.5 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-slate-200 ring-1 ring-white/10"
          >
            {/* Header: Title, Live Status & Collapse */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse" />
                <div className="text-xs font-black tracking-wider uppercase text-white font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  <span>Real-Time Dyno Telemetry</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Sweep Pull Button */}
                <button
                  id="btn-dyno-dock-sweep"
                  onClick={handleRunDynoSweep}
                  disabled={isDynoRunning}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border border-emerald-500/40 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-all flex items-center gap-1 disabled:opacity-50"
                  title="Run automated 0-Redline dyno power sweep"
                >
                  <Play className="w-2.5 h-2.5" />
                  <span>{isDynoRunning ? 'SWEEPING...' : 'PULL'}</span>
                </button>

                {/* Collapse Button */}
                <button
                  id="btn-collapse-dyno-graph"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Collapse Dyno Graph"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sub-label describing the active engine curve */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5">
              <span className="truncate">{engine.name} ({engine.code})</span>
              <span className="text-amber-400 shrink-0">{engine.redlineRpm} RPM REDLINE</span>
            </div>

            {/* Recharts Dynamic Interactive Dyno Chart */}
            <div className="mb-2">
              <DynoPowerChart
                engine={engine}
                currentRpm={currentRpm}
                isSoundActive={isSoundActive}
              />
            </div>

            {/* Footer Summary / Quick stats */}
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-white/10">
              <span className="flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-rose-400" />
                <span>MAX HP: {engine.powerHp} HP</span>
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-cyan-400" />
                <span>PEAK TORQUE: {engine.torqueNm} Nm</span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white underline"
              >
                Hide Graph
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
