import React from 'react';
import {
  Flame,
  Zap,
  Activity,
  Shield,
  Cpu,
  Compass,
  ArrowRight,
  Flag,
  Car,
  Volume2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { AppView } from '../types';

interface EditorialAboutProps {
  onNavigate: (view: AppView) => void;
}

export const EditorialAbout: React.FC<EditorialAboutProps> = ({ onNavigate }) => {
  return (
    <div className="w-full min-h-screen bg-[#08080a] text-neutral-100 select-none pt-28 pb-24 px-6 sm:px-12 md:px-16 animate-fadeIn">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Top Header */}
        <div className="border-b border-white/[0.08] pb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold">
              PLATFORM MANIFESTO // 2026 EDITION
            </span>
          </div>
          <h1 className="font-syne font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tighter uppercase leading-[0.95]">
            BUILT TO BE <span className="text-amber-400">DRIVEN.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-sm sm:text-base text-neutral-300 font-sans leading-relaxed font-light">
            REV THE BEAST is a pure passion project engineering the pinnacle of browser-based automotive experiences.
            It harmonizes the responsive vehicle dynamics of <span className="text-white font-medium">Forza Horizon</span>, 
            the nocturnal underground pulse of <span className="text-white font-medium">Need for Speed</span>, 
            the mechanical and acoustic precision of <span className="text-white font-medium">Gran Turismo</span>, 
            and the visual depth of a bespoke luxury configurator.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-neutral-900/60 border border-white/[0.08] flex flex-col justify-between hover:border-amber-400/40 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-syne font-bold text-xl text-white mb-2">
                Real-Time 3D Physics
              </h3>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Powered by a high-frequency simulation loop modeling curb weight, aerodynamic drag ($C_d \times A$),
                center of gravity pitch and roll, tire slip angles, and realistic drivetrain torque curves.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full WebGL / Three.js Engine</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-neutral-900/60 border border-white/[0.08] flex flex-col justify-between hover:border-amber-400/40 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-6">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="font-syne font-bold text-xl text-white mb-2">
                Individual Acoustic Synthesis
              </h3>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Every vehicle has a unique audio configuration running on the native Web Audio API.
                Asymmetrical firing patterns, combustion waveshaping, turbocharger flutter, and backfire pops.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Pre-baked Audio Stems</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-neutral-900/60 border border-white/[0.08] flex flex-col justify-between hover:border-amber-400/40 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-syne font-bold text-xl text-white mb-2">
                100% Free & Open Tech
              </h3>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                No paywalls, no premium subscriptions, no fake multiplayer claims, and no telemetry tracking.
                Your garage, saved specs, lap times, and career achievements live directly in local persistence.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Private LocalStorage Storage</span>
            </div>
          </div>
        </div>

        {/* Technical Specification Matrix */}
        <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900/40 border border-white/[0.08] space-y-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block">
            SIMULATOR ARCHITECTURE SPECIFICATIONS
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block mb-1">
                GRAPHICS FRAMEWORK
              </span>
              <span className="text-lg font-bold text-white">Three.js / WebGL</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block mb-1">
                ACOUSTIC ENGINE
              </span>
              <span className="text-lg font-bold text-amber-400">Web Audio API</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block mb-1">
                SIMULATION MODES
              </span>
              <span className="text-lg font-bold text-white">4 Playable Modes</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block mb-1">
                CIRCUITS & TRACKS
              </span>
              <span className="text-lg font-bold text-white">4 Dynamic Tracks</span>
            </div>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/[0.08]">
          <div className="flex flex-col">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              Ready to experience true automotive performance?
            </span>
            <span className="font-syne font-bold text-lg text-white">
              Choose your machine or enter the racing circuit now.
            </span>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('cars')}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
            >
              EXPLORE CARS
            </button>
            <button
              onClick={() => onNavigate('racing')}
              className="flex-1 sm:flex-none px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2 text-center"
            >
              <Flag className="w-4 h-4" />
              <span>ENTER RACING</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
