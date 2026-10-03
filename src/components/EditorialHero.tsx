import React from 'react';
import { ChevronDown, ArrowRight, Sparkles, Volume2 } from 'lucide-react';
import { CarModelType } from '../types';
import { getVehicleMedia } from '../data/vehicleMedia';
import { getEngineForModel } from '../data/engines';

interface EditorialHeroProps {
  selectedCar: CarModelType;
  onEnterGarage: () => void;
  onExploreCars: () => void;
  onScrollToStory: () => void;
  onQuickRev?: () => void;
}

export const EditorialHero: React.FC<EditorialHeroProps> = ({
  selectedCar,
  onEnterGarage,
  onExploreCars,
  onScrollToStory,
  onQuickRev,
}) => {
  const media = getVehicleMedia(selectedCar);
  const engine = getEngineForModel(selectedCar);

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between pt-28 pb-12 px-6 sm:px-12 md:px-16 overflow-hidden select-none bg-[#08080a]">
      {/* Background High-Fidelity Cinematic Photography */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={media.photos.hero.url}
          alt={media.name}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Subtle Luxury Editorial Vignette & Contrast Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-[#08080a]/80" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#08080a]/50 to-[#08080a]/90 pointer-events-none" />
      </div>

      {/* Top Editorial Sub-Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-[0.25em]">
            CURATED AUTOMOTIVE MONOGRAPH // 2026 EDITION
          </span>
        </div>
        <div className="text-[11px] font-mono text-neutral-400 tracking-[0.2em] uppercase">
          Sant'Agata Bolognese • {media.badge}
        </div>
      </div>

      {/* Center Grand Typography & Editorial Statement */}
      <div className="relative z-10 max-w-5xl my-auto py-6 sm:py-8">
        <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block mb-2 sm:mb-3">
          {media.tagline}
        </span>

        <h1 className="font-syne font-black text-4xl sm:text-6xl md:text-8xl lg:text-9xl tracking-tighter uppercase text-white leading-[0.9] text-balance">
          ENGINEERED
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
            TO BE
          </span>
          <br />
          <span className="italic text-amber-400">UNCONTROLLED.</span>
        </h1>

        <p className="mt-4 sm:mt-6 max-w-xl text-xs sm:text-base text-neutral-300 font-sans font-light leading-relaxed">
          The relentless convergence of naturally aspirated V12 acoustic fury, aerospace carbon fiber
          architecture, and uncompromising motorsport aerodynamics.
        </p>

        {/* Primary Hero Actions */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <button
            onClick={onEnterGarage}
            className="w-full sm:w-auto justify-center px-8 py-3.5 sm:py-4 rounded-full bg-white text-black hover:bg-neutral-200 font-mono text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-2xl hover:scale-105 flex items-center gap-3 cursor-pointer group"
          >
            <span>ENTER GARAGE</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onExploreCars}
            className="w-full sm:w-auto justify-center px-8 py-3.5 sm:py-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/20 font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300 backdrop-blur-md cursor-pointer hover:border-white/40"
          >
            EXPLORE CARS
          </button>

          {onQuickRev && (
            <button
              onClick={onQuickRev}
              className="w-full sm:w-auto justify-center px-5 py-3.5 sm:py-4 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 cursor-pointer"
              title="Ignite and preview engine exhaust acoustics"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>TEST EXHAUST</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Editorial Metrics Strip & Scroll Indicator */}
      <div className="relative z-10 border-t border-white/[0.08] pt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        {/* Minimal High-Contrast Performance Numbers */}
        <div className="grid grid-cols-3 gap-3 sm:gap-12">
          <div>
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-400 block mb-1">
              MAX POWER
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-grotesk font-black text-2xl sm:text-4xl md:text-5xl text-white">
                {engine.powerHp}
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-amber-400 font-bold uppercase">HP</span>
            </div>
          </div>

          <div>
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-400 block mb-1">
              TOP SPEED
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-grotesk font-black text-2xl sm:text-4xl md:text-5xl text-white">
                {media.keySpecs.topSpeed.split(' ')[0]}
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-neutral-400 font-bold uppercase">KM/H</span>
            </div>
          </div>

          <div>
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-400 block mb-1">
              0 — 100 KM/H
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-grotesk font-black text-2xl sm:text-4xl md:text-5xl text-white">
                {media.keySpecs.zeroToSixty.split(' ')[0]}
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-neutral-400 font-bold uppercase">SEC</span>
            </div>
          </div>
        </div>

        {/* Scroll Story Button */}
        <button
          onClick={onScrollToStory}
          className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors font-mono text-xs tracking-widest uppercase cursor-pointer group"
        >
          <span>EXPLORE STORY</span>
          <div className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center group-hover:border-white/40 group-hover:translate-y-1 transition-all">
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>
      </div>
    </section>
  );
};
