import React, { useState } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Sliders,
  Car,
  Flag,
  Sparkles,
  Activity,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { CarModelType } from '../types';
import { getVehicleMedia } from '../data/vehicleMedia';
import { AnimatedAudioBarsIcon } from './AnimatedIcons';

export type AppView = 'home' | 'garage' | 'car-detail' | 'customizer' | 'sound-lab' | 'ai-lab' | 'racing';

interface EditorialHeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  selectedCar: CarModelType;
  isAudioActive: boolean;
  onToggleAudio: () => void;
  onOpenMixer: () => void;
}

export const EditorialHeader: React.FC<EditorialHeaderProps> = ({
  currentView,
  onNavigate,
  selectedCar,
  isAudioActive,
  onToggleAudio,
  onOpenMixer,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const media = getVehicleMedia(selectedCar);

  const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'EDITORIAL', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'garage', label: 'GARAGE', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'sound-lab', label: 'SOUND LAB', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'ai-lab', label: 'BEAST AI', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'racing', label: 'CIRCUIT', icon: <Flag className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-20 px-6 md:px-12 flex items-center justify-between bg-gradient-to-b from-[#08080a]/90 via-[#08080a]/60 to-transparent backdrop-blur-md border-b border-white/[0.06] transition-all">
        {/* Brand Emblem */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/15 flex items-center justify-center text-amber-400 group-hover:border-amber-400/50 group-hover:bg-amber-400/10 transition-all">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-syne font-black text-lg md:text-xl tracking-tighter text-white uppercase">
                REV <span className="text-amber-400 font-normal">//</span> THE BEAST
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase bg-amber-400/10 text-amber-300 border border-amber-400/30">
                2.0
              </span>
            </div>
            <span className="text-[9px] font-mono text-neutral-400 tracking-[0.2em] uppercase hidden md:block">
              Editorial Automotive Experience
            </span>
          </div>
        </button>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] p-1.5 rounded-full backdrop-blur-xl">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-lg shadow-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Active Car Pill + Audio Controls */}
        <div className="flex items-center gap-3">
          {/* Active Car Indicator Pill */}
          <button
            onClick={() => onNavigate('car-detail')}
            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono transition-all cursor-pointer group"
            title="Inspect active vehicle detail page"
          >
            <span
              className="w-2 h-2 rounded-full shadow-sm"
              style={{ backgroundColor: media.accentHex }}
            />
            <span className="text-white font-bold truncate max-w-[130px] md:max-w-[160px]">
              {media.name}
            </span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest hidden md:inline">
              {media.badge}
            </span>
          </button>

          {/* Quick Sound Toggle Button */}
          <button
            onClick={onToggleAudio}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isAudioActive
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-white/[0.04] border-white/10 text-neutral-400 hover:text-white'
            }`}
            title={isAudioActive ? 'Mute engine audio' : 'Start physical engine sound'}
          >
            {isAudioActive ? (
              <AnimatedAudioBarsIcon className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Audio Mixer Settings Trigger */}
          <button
            onClick={onOpenMixer}
            className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Open Audio & Ambience Mixer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-full bg-white/[0.06] border border-white/15 text-white cursor-pointer"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Fullscreen Editorial Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#08080a]/98 backdrop-blur-2xl flex flex-col p-8 justify-between animate-fadeIn">
          {/* Mobile Header Top */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="font-syne font-black text-xl tracking-tighter text-white uppercase">
                REV // THE BEAST
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/10 text-white cursor-pointer hover:bg-white/20 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation List */}
          <div className="flex flex-col gap-6 my-auto">
            {navItems.map((item, idx) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-baseline justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="text-xs font-mono text-neutral-500 font-bold">
                      0{idx + 1}
                    </span>
                    <span
                      className={`font-syne font-black text-3xl sm:text-4xl tracking-tight uppercase transition-all ${
                        isActive
                          ? 'text-amber-400 pl-2'
                          : 'text-neutral-300 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span className="text-neutral-600 font-mono text-xs">→</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Active Vehicle Card */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                Active Selection
              </span>
              <span className="text-sm font-bold text-white font-syne">{media.name}</span>
            </div>
            <button
              onClick={() => {
                onNavigate('car-detail');
                setMobileMenuOpen(false);
              }}
              className="px-4 py-2 rounded-full bg-amber-400 text-black font-mono text-xs font-black uppercase tracking-wider"
            >
              View Story
            </button>
          </div>
        </div>
      )}
    </>
  );
};
