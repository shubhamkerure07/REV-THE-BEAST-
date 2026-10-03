import React from 'react';
import {
  ArrowRight,
  Flame,
  Activity,
  Zap,
  Gauge,
  Compass,
  Sparkles,
  Flag,
  Car,
  Volume2,
} from 'lucide-react';
import { CarModelType } from '../types';
import { getVehicleMedia } from '../data/vehicleMedia';
import { getEngineForModel } from '../data/engines';
import {
  AnimatedEngineIcon,
  AnimatedExhaustIcon,
  AnimatedSpeedometerIcon,
  AnimatedTurboIcon,
  AnimatedAudioBarsIcon,
} from './AnimatedIcons';

interface EditorialStoryScrollProps {
  selectedCar: CarModelType;
  onOpenGarage: () => void;
  onOpenSoundLab: () => void;
  onOpenAiLab: () => void;
  onOpenRacing: () => void;
  onOpenCarDetail: () => void;
}

export const EditorialStoryScroll: React.FC<EditorialStoryScrollProps> = ({
  selectedCar,
  onOpenGarage,
  onOpenSoundLab,
  onOpenAiLab,
  onOpenRacing,
  onOpenCarDetail,
}) => {
  const media = getVehicleMedia(selectedCar);
  const engine = getEngineForModel(selectedCar);

  return (
    <div id="story-scroll-container" className="w-full bg-[#08080a] text-neutral-200 select-none">
      {/* SECTION 1: ARCHITECTURAL MONOGRAPH / MULTI-ANGLE PHOTOGRAPHY STRIP */}
      <section className="py-24 px-6 sm:px-12 md:px-16 border-t border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block mb-2">
                // 01 ARCHITECTURE & SCULPTURE
              </span>
              <h2 className="font-syne font-black text-4xl sm:text-6xl text-white tracking-tighter uppercase leading-[0.95]">
                BORN FROM
                <br />
                <span className="italic text-neutral-400">PURE SPEED.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm text-neutral-400 font-sans font-light leading-relaxed">
              Every curve, intake duct, and razor-sharp edge on the {media.name} serves a singular
              aerodynamic purpose: slicing through atmosphere while channeling colossal cooling volume
              directly to the powertrain.
            </p>
          </div>

          {/* Editorial 3-Photo Asymmetrical Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Large Hero Left Card */}
            <div className="md:col-span-8 group relative rounded-3xl overflow-hidden bg-neutral-900 min-h-[420px] md:min-h-[560px] border border-white/[0.08]">
              <img
                src={media.photos.side.url}
                alt="Side Profile"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    SIDE PROFILE SILHOUETTE
                  </span>
                  <h3 className="font-syne font-bold text-2xl text-white mt-1">
                    Unbroken Wedge Contour
                  </h3>
                </div>
                <span className="text-xs font-mono text-neutral-400 border border-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                  4,943 MM LENGTH
                </span>
              </div>
            </div>

            {/* Stacked Right Cards */}
            <div className="md:col-span-4 flex flex-col gap-6">
              {/* Front Fascia */}
              <div className="group relative rounded-3xl overflow-hidden bg-neutral-900 flex-1 min-h-[260px] border border-white/[0.08]">
                <img
                  src={media.photos.front.url}
                  alt="Front Angle"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    FRONT AERO MATRIX
                  </span>
                  <h4 className="font-syne font-bold text-lg text-white mt-0.5">
                    Carbon Aero Splitters
                  </h4>
                </div>
              </div>

              {/* Rear Diffuser & Exhaust */}
              <div className="group relative rounded-3xl overflow-hidden bg-neutral-900 flex-1 min-h-[260px] border border-white/[0.08]">
                <img
                  src={media.photos.rear.url}
                  alt="Rear View"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    REAR WING & DIFFUSER
                  </span>
                  <h4 className="font-syne font-bold text-lg text-white mt-0.5">
                    Active Downforce ALA
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: POWERTRAIN & PHYSICAL ACOUSTICS */}
      <section className="py-24 px-6 sm:px-12 md:px-16 border-t border-white/[0.08] bg-[#0c0c10] relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block">
                // 02 POWERTRAIN MECHANICS
              </span>
              <h2 className="font-syne font-black text-4xl sm:text-5xl text-white tracking-tighter uppercase leading-[0.95]">
                THE BEATING
                <br />
                <span className="italic text-amber-400">HEART.</span>
              </h2>

              <p className="text-sm text-neutral-300 font-sans font-light leading-relaxed">
                Featuring the {engine.name}. Every mechanical combustion cycle generates an asymmetric
                acoustic pressure pulse governed by genuine physical acoustics.
              </p>

              {/* Engine Specs Box */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between py-2 border-b border-white/[0.08] text-xs font-mono">
                  <span className="text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <AnimatedEngineIcon className="w-4 h-4 text-amber-400" />
                    <span>ENGINE ARCHITECTURE</span>
                  </span>
                  <span className="text-white font-bold">{engine.type}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-white/[0.08] text-xs font-mono">
                  <span className="text-neutral-400 uppercase tracking-widest">DISPLACEMENT</span>
                  <span className="text-white font-bold">{engine.displacement}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-white/[0.08] text-xs font-mono">
                  <span className="text-neutral-400 uppercase tracking-widest">REDLINE CEILING</span>
                  <span className="text-amber-400 font-bold">{engine.redlineRpm} RPM</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-white/[0.08] text-xs font-mono">
                  <span className="text-neutral-400 uppercase tracking-widest">FIRING ORDER</span>
                  <span className="text-white font-bold">{engine.firingOrder}</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4">
                <button
                  onClick={onOpenSoundLab}
                  className="px-6 py-3.5 rounded-full bg-amber-400 text-black hover:bg-amber-300 font-mono text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-all duration-300 shadow-xl cursor-pointer"
                >
                  <AnimatedAudioBarsIcon className="w-4 h-4 text-black" />
                  <span>TEST ACOUSTICS IN SOUND LAB</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Engine & Exhaust Photography Card */}
            <div className="lg:col-span-7 group relative rounded-3xl overflow-hidden bg-neutral-900 min-h-[460px] border border-white/[0.08] shadow-2xl">
              <img
                src={media.photos.engine.url}
                alt="Engine Bay"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono uppercase font-bold border border-amber-400/30">
                    60° V12 SYMPHONY
                  </span>
                  <span className="text-xs font-mono text-neutral-400">8,700 RPM WIDE OPEN</span>
                </div>
                <h3 className="font-syne font-bold text-2xl text-white">
                  6.5L Naturally Aspirated Multi-Point Injection
                </h3>
                <p className="text-xs text-neutral-300 font-sans mt-1 max-w-lg">
                  Titanium valves, dry-sump scavenging pumps, and tuned carbon fiber intake plenum
                  trumpets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: EXHAUST METALLURGY & ACOUSTICS */}
      <section className="py-24 px-6 sm:px-12 md:px-16 border-t border-white/[0.08] bg-[#08080a] relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block mb-2">
                // 03 EXHAUST ACOUSTICS
              </span>
              <h2 className="font-syne font-black text-4xl sm:text-6xl text-white tracking-tighter uppercase leading-[0.95]">
                BURNT TITANIUM
                <br />
                <span className="italic text-neutral-400">& FIRE BURSTS.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm text-neutral-400 font-sans font-light leading-relaxed">
              Straight-through inconel and titanium exhaust headers reduce backpressure to near zero,
              producing ear-splitting high-frequency screaming overtones and crackle overrun pops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Exhaust Photo */}
            <div className="group relative rounded-3xl overflow-hidden bg-neutral-900 min-h-[380px] border border-white/[0.08]">
              <img
                src={media.photos.exhaust.url}
                alt="Exhaust System"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  HIGH-EXIT DUAL OUTLETS
                </span>
                <h4 className="font-syne font-bold text-xl text-white mt-1">
                  Titanium Flame-Thrower System
                </h4>
              </div>
            </div>

            {/* Interactive Exhaust Acoustic Spec Cards */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-400/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <AnimatedExhaustIcon className="w-5 h-5 text-amber-400" />
                  <h4 className="font-syne font-bold text-lg text-white">Titanium Race Spec</h4>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Burnt-blue tips with ultra-thin 0.8mm wall tubing. Resonates at higher harmonic
                  frequencies, creating a screaming metallic F1 howl.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-400/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  <h4 className="font-syne font-bold text-lg text-white">Overrun Decat Backfires</h4>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Unburnt fuel ignited directly against superheated catalytic delete pipes on throttle
                  lift, generating rapid gunshot crackles and blue flame bursts.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-400/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-syne font-bold text-lg text-white">2-Step Launch Control</h4>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Dual-stage ignition retard holding stationary RPM at optimal boost launch threshold
                  with violent combustion explosions in the manifold.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ECOSYSTEM DESTINATION PORTALS */}
      <section className="py-24 px-6 sm:px-12 md:px-16 border-t border-white/[0.08] bg-[#08080a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block mb-2">
              // 04 THE REVOLUTIONARY ECOSYSTEM
            </span>
            <h2 className="font-syne font-black text-4xl sm:text-6xl text-white tracking-tighter uppercase leading-[0.95]">
              CHOOSE YOUR
              <br />
              <span className="italic text-neutral-400">DISCIPLINE.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Garage */}
            <div
              onClick={onOpenGarage}
              className="group p-8 rounded-3xl bg-neutral-900/60 hover:bg-neutral-900 border border-white/[0.08] hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between min-h-[300px] cursor-pointer shadow-xl hover:-translate-y-1"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform mb-6">
                  <Car className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block mb-1">
                  CENTRAL HUB
                </span>
                <h3 className="font-syne font-bold text-2xl text-white group-hover:text-amber-400 transition-colors">
                  The Garage
                </h3>
                <p className="text-xs text-neutral-400 mt-2 font-sans leading-relaxed">
                  Browse, inspect, and select from the curated multi-vehicle fleet and your custom builds.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <span>ENTER GARAGE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Sound Lab */}
            <div
              onClick={onOpenSoundLab}
              className="group p-8 rounded-3xl bg-neutral-900/60 hover:bg-neutral-900 border border-white/[0.08] hover:border-rose-400/50 transition-all duration-300 flex flex-col justify-between min-h-[300px] cursor-pointer shadow-xl hover:-translate-y-1"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform mb-6">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block mb-1">
                  ACOUSTIC LAB
                </span>
                <h3 className="font-syne font-bold text-2xl text-white group-hover:text-rose-400 transition-colors">
                  Sound Lab
                </h3>
                <p className="text-xs text-neutral-400 mt-2 font-sans leading-relaxed">
                  Live waveform canvas, heavy billet throttle pedal, exhaust flap tuning, and launch control.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                <span>OPEN SOUND LAB</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Beast AI */}
            <div
              onClick={onOpenAiLab}
              className="group p-8 rounded-3xl bg-neutral-900/60 hover:bg-neutral-900 border border-white/[0.08] hover:border-purple-400/50 transition-all duration-300 flex flex-col justify-between min-h-[300px] cursor-pointer shadow-xl hover:-translate-y-1"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block mb-1">
                  AI VEHICLE STUDIO
                </span>
                <h3 className="font-syne font-bold text-2xl text-white group-hover:text-purple-400 transition-colors">
                  Beast AI
                </h3>
                <p className="text-xs text-neutral-400 mt-2 font-sans leading-relaxed">
                  Synthesize fictional hypercars from natural language descriptions and get tuning blueprints.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                <span>CREATE WITH AI</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Circuit Racing */}
            <div
              onClick={onOpenRacing}
              className="group p-8 rounded-3xl bg-neutral-900/60 hover:bg-neutral-900 border border-white/[0.08] hover:border-cyan-400/50 transition-all duration-300 flex flex-col justify-between min-h-[300px] cursor-pointer shadow-xl hover:-translate-y-1"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform mb-6">
                  <Flag className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block mb-1">
                  MOTORSPORT CIRCUIT
                </span>
                <h3 className="font-syne font-bold text-2xl text-white group-hover:text-cyan-400 transition-colors">
                  Circuit Racing
                </h3>
                <p className="text-xs text-neutral-400 mt-2 font-sans leading-relaxed">
                  Tokyo Expressway and Nürburgring time-trials with minimal HUD, paddle shifters, and telemetry.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                <span>START TIME TRIAL</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
