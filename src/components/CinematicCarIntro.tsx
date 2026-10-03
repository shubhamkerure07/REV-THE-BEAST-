import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Zap, FastForward, Play } from 'lucide-react';
import { CarModelType } from '../types';
import { getVehicleMedia } from '../data/vehicleMedia';
import { getEngineForModel } from '../data/engines';
import { engineSound } from '../utils/audio';

interface CinematicCarIntroProps {
  modelType: CarModelType;
  isOpen: boolean;
  onComplete: () => void;
}

export const CinematicCarIntro: React.FC<CinematicCarIntroProps> = ({
  modelType,
  isOpen,
  onComplete,
}) => {
  const [phase, setPhase] = useState<number>(0);
  const media = getVehicleMedia(modelType);
  const engine = getEngineForModel(modelType);

  useEffect(() => {
    if (!isOpen) {
      setPhase(0);
      return;
    }

    // Step 0: Black screen, trigger cold start sound
    setPhase(0);
    engineSound.triggerColdStart();

    // Step 1: Small spark / light halo appears at 700ms
    const t1 = setTimeout(() => {
      setPhase(1);
    }, 700);

    // Step 2: Headlights ignite with bright beam at 1400ms
    const t2 = setTimeout(() => {
      setPhase(2);
    }, 1400);

    // Step 3: Vehicle front revealed with dramatic lighting at 2200ms
    const t3 = setTimeout(() => {
      setPhase(3);
    }, 2200);

    // Step 4: Cinematic typography & performance stats reveal at 3200ms
    const t4 = setTimeout(() => {
      setPhase(4);
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen, modelType]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-6 sm:p-12 select-none overflow-hidden font-sans"
      >
        {/* Skip Button (Top Right) */}
        <div className="w-full flex justify-end z-30">
          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold tracking-wider backdrop-blur-md transition-all cursor-pointer active:scale-95"
          >
            <span>SKIP INTRO</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center Visual Staging */}
        <div className="relative w-full max-w-4xl h-96 flex items-center justify-center">
          {/* Phase 1: Small Pulsing Halo Spark */}
          {phase >= 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-cyan-400 blur-2xl pointer-events-none"
            />
          )}

          {/* Phase 2: Laser Headlight Optics Flare */}
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0.3 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 flex items-center justify-around pointer-events-none"
            >
              <div className="w-32 h-2 bg-gradient-to-r from-cyan-400 to-transparent blur-sm rotate-6" />
              <div className="w-32 h-2 bg-gradient-to-l from-cyan-400 to-transparent blur-sm -rotate-6" />
            </motion.div>
          )}

          {/* Phase 3 & 4: Dramatic Vehicle Silhouette Reveal */}
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <img
                src={media.photos.hero?.url || media.photos.front?.url}
                alt={media.name}
                className="max-h-72 object-contain drop-shadow-[0_20px_50px_rgba(255,255,255,0.12)] filter contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
            </motion.div>
          )}
        </div>

        {/* Phase 4: Big Bold Typography & Performance Stats */}
        <div className="w-full max-w-3xl z-20 flex flex-col items-center text-center">
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center gap-4"
            >
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-red-500 font-bold block mb-1">
                  {media.brand} • {media.category}
                </span>
                <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white uppercase drop-shadow-xl">
                  {media.name}
                </h1>
                <p className="text-sm font-mono text-neutral-400 mt-1">
                  {engine.displacement} • {engine.type}
                </p>
              </div>

              {/* Performance Stats Triple Pill */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-lg pt-2 font-mono">
                <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] text-neutral-400 block tracking-wider">POWER</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">
                    {engine.powerHp}
                  </span>
                  <span className="text-[10px] text-neutral-500 ml-1">HP</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] text-neutral-400 block tracking-wider">TOP SPEED</span>
                  <span className="text-xl sm:text-2xl font-black text-cyan-400">
                    {media.keySpecs.topSpeed.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-neutral-500 ml-1">KM/H</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] text-neutral-400 block tracking-wider">0–100 KM/H</span>
                  <span className="text-xl sm:text-2xl font-black text-red-500">
                    {media.keySpecs.zeroToSixty.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-neutral-500 ml-1">SEC</span>
                </div>
              </div>

              {/* Enter Showroom CTA */}
              <button
                onClick={onComplete}
                className="mt-4 px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white font-mono font-black text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:shadow-[0_0_40px_rgba(239,68,68,0.8)] transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>ENTER SHOWROOM</span>
                <Play className="w-4 h-4 fill-white" />
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
