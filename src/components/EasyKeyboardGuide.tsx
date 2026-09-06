import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, ChevronUp, ChevronDown, Zap, Flame, Wind, Play } from 'lucide-react';

export const EasyKeyboardGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div
      id="easy-keyboard-guide"
      className="fixed bottom-3 right-3 sm:right-6 z-30 pointer-events-auto flex flex-col items-end"
    >
      <AnimatePresence initial={false} mode="wait">
        {!isOpen ? (
          /* COLLAPSED MINI BADGE */
          <motion.div
            key="collapsed-keys-badge"
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <button
              id="btn-expand-keyboard-guide"
              onClick={() => setIsOpen(true)}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black/95 text-slate-300 hover:text-white border border-white/15 hover:border-white/30 shadow-lg backdrop-blur-xl transition-all cursor-pointer ring-1 ring-white/10 text-xs font-mono"
              title="Show Easy Keyboard Controls"
            >
              <Keyboard className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-white">EASY KEYS:</span>
              <span className="text-slate-300 hidden sm:inline">
                <kbd className="px-1 py-0.2 rounded bg-white/10 text-amber-300">W</kbd> / <kbd className="px-1 py-0.2 rounded bg-white/10 text-amber-300">↑</kbd> Rev
              </span>
              <span className="text-slate-300 hidden md:inline">
                • <kbd className="px-1 py-0.2 rounded bg-white/10 text-white">A</kbd>/<kbd className="px-1 py-0.2 rounded bg-white/10 text-white">D</kbd> Shift
              </span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold text-slate-300">
                KEYS ⤢
              </span>
            </button>
          </motion.div>
        ) : (
          /* EXPANDED EASY CONTROLS CARD */
          <motion.div
            key="expanded-keys-panel"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="w-[320px] sm:w-[360px] bg-black/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-3.5 shadow-2xl text-slate-200 ring-1 ring-white/10 font-mono"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black tracking-wider uppercase text-white">
                  Easy Keyboard Controls
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Collapse Keyboard Guide"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Intuitive Key Mappings Grid */}
            <div className="space-y-2 text-xs">
              {/* Throttle Rev */}
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-white/[0.04] border border-white/5">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Throttle / Redline Rev</span>
                </span>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-amber-500/25 border border-amber-400 text-amber-300 font-black">W</kbd>
                  <span className="text-slate-500">or</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-amber-500/25 border border-amber-400 text-amber-300 font-black">↑</kbd>
                  <span className="text-slate-500">or</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-amber-500/25 border border-amber-400 text-amber-300 font-black">SPACE</kbd>
                </div>
              </div>

              {/* Shifting Gears */}
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-white/[0.04] border border-white/5">
                <span className="text-slate-300 font-bold">Shift Gears (Down / Up)</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white font-bold">A / ←</kbd>
                  <span className="text-slate-500">/</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white font-bold">D / →</kbd>
                </div>
              </div>

              {/* Brake / Decel */}
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-white/[0.04] border border-white/5">
                <span className="text-slate-300 font-bold">Brake / Decelerate</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white font-bold">S</kbd>
                  <span className="text-slate-500">or</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white font-bold">↓</kbd>
                </div>
              </div>

              {/* Exhaust Backfire Flame */}
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-white/[0.04] border border-white/5">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>Exhaust Detonation Pops</span>
                </span>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">X</kbd>
                  <span className="text-slate-500">or</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">F</kbd>
                </div>
              </div>

              {/* Turbo Blow-Off Flutter */}
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-white/[0.04] border border-white/5">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Wind className="w-3 h-3 text-cyan-400" />
                  <span>Turbo BOV Flutter</span>
                </span>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold">B</kbd>
                  <span className="text-slate-500">or</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold">T</kbd>
                </div>
              </div>

              {/* Launch & Cold Start */}
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-white/[0.04] border border-white/5 text-[11px]">
                <span className="text-slate-300 font-bold">2-Step Launch / Cold Start</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white font-bold">L</kbd>
                  <span className="text-slate-500">/</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white font-bold">C</kbd>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2.5 pt-1.5 border-t border-white/10">
              <span>Standard WASD + Arrow Keys supported</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white underline"
              >
                Hide
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
