import React, { useState, useRef, useEffect } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Box,
  Cpu,
  Camera,
  Eye,
  EyeOff,
  Info,
  Maximize2,
  Radio,
  Play,
  Sparkles,
  ChevronDown,
  Car,
  Check,
} from 'lucide-react';
import { CarConfigState, CarModelType, ViewModeType } from '../types';
import { engineSound, AcousticEnvironment } from '../utils/audio';
import { getVehicleMedia } from '../data/vehicleMedia';
import { getEngineForModel, ALL_ENGINES } from '../data/engines';
import {
  AnimatedEngineIcon,
  AnimatedAudioBarsIcon,
  AnimatedAiSparkIcon,
  AnimatedWheelIcon,
} from './AnimatedIcons';

interface SupercarHeaderProps {
  config: CarConfigState;
  onChangeConfig: (updater: (prev: CarConfigState) => CarConfigState) => void;
  onSelectModelType?: (model: CarModelType) => void;
  onOpenSpecs: () => void;
  onOpenSoundLab: () => void;
  onOpenAiStudio: () => void;
  onPlayIntro: () => void;
  isCleanScreen: boolean;
  onToggleCleanScreen: () => void;
  showToast: (msg: string) => void;
}

export const SupercarHeader: React.FC<SupercarHeaderProps> = ({
  config,
  onChangeConfig,
  onSelectModelType,
  onOpenSpecs,
  onOpenSoundLab,
  onOpenAiStudio,
  onPlayIntro,
  isCleanScreen,
  onToggleCleanScreen,
  showToast,
}) => {
  const currentView = config.viewMode || '3d-car';
  const [isCarDropdownOpen, setIsCarDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentMedia = getVehicleMedia(config.modelType);
  const currentEngine = getEngineForModel(config.modelType);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCarDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectView = (view: ViewModeType) => {
    onChangeConfig((prev) => ({ ...prev, viewMode: view }));
    showToast(
      `View: ${
        view === '3d-car'
          ? '3D Interactive Supercar'
          : view === 'engine-3d'
          ? '3D Engine Machine'
          : view === 'photos'
          ? '4K Studio Gallery'
          : 'Video Reel'
      }`
    );
  };

  const handleToggleSound = () => {
    const nextSound = !config.exhaustSound;
    onChangeConfig((prev) => ({ ...prev, exhaustSound: nextSound }));
    if (nextSound) {
      engineSound.start();
      showToast('Engine acoustics active');
    } else {
      engineSound.stop();
      showToast('Engine muted');
    }
  };

  const handleSelectEnvironment = (env: AcousticEnvironment) => {
    engineSound.setEnvironment(env);
    showToast(`Acoustic Environment: ${env.toUpperCase()}`);
  };

  const handleSelectCar = (model: CarModelType) => {
    onSelectModelType?.(model);
    setIsCarDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 border-b border-white/10 flex items-center justify-between px-3 sm:px-6 bg-black/80 backdrop-blur-xl text-white select-none pointer-events-auto shadow-2xl">
      {/* Brand Emblem & Single Unified Car Selector Dropdown */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 flex items-center justify-center text-white shadow-[0_0_16px_rgba(239,68,68,0.5)] border border-white/20">
          <Flame className="w-5 h-5 text-white animate-pulse" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black tracking-tighter text-base sm:text-lg text-white">
                REV THE BEAST
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-600/30 text-red-300 border border-red-500/40 uppercase font-bold">
                PRO
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 hidden sm:block">
              Realistic 3D & Acoustic Physical Modeling
            </span>
          </div>

          {/* SINGLE DEDICATED CAR SELECTOR DROPDOWN */}
          <div ref={dropdownRef} className="relative ml-2">
            <button
              onClick={() => setIsCarDropdownOpen(!isCarDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/15 hover:border-white/30 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <Car className="w-3.5 h-3.5 text-red-500" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{currentMedia.name}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                  isCarDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isCarDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl bg-neutral-950/95 border border-white/20 shadow-2xl backdrop-blur-2xl p-1.5 z-50 flex flex-col gap-1">
                <div className="px-3 py-1.5 text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider border-b border-white/10">
                  SELECT VEHICLE
                </div>
                {ALL_ENGINES.map((eng) => {
                  const isSelected = config.modelType === eng.vehicleModel;
                  return (
                    <button
                      key={eng.id}
                      onClick={() => handleSelectCar(eng.vehicleModel)}
                      className={`flex items-center justify-between p-2 rounded-xl text-left font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-red-600 text-white shadow-md'
                          : 'hover:bg-neutral-900 text-neutral-300 hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{eng.name}</span>
                        <span
                          className={`text-[10px] ${
                            isSelected ? 'text-white/80' : 'text-neutral-500'
                          }`}
                        >
                          {eng.displacement} • {eng.powerHp} HP
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center: View Switcher Pill */}
      <div className="hidden md:flex items-center bg-neutral-900/90 rounded-full p-1 border border-white/10 text-xs font-mono">
        <button
          onClick={() => handleSelectView('3d-car')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
            currentView === '3d-car'
              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <AnimatedWheelIcon className="w-3.5 h-3.5" />
          <span>3D CAR</span>
        </button>

        <button
          onClick={() => handleSelectView('engine-3d')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
            currentView === 'engine-3d'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>3D ENGINE</span>
        </button>

        <button
          onClick={() => handleSelectView('photos')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
            currentView === 'photos'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>4K GALLERY</span>
        </button>
      </div>

      {/* Right: Sound Lab, AI Studio, Intro, Environment & Mute */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Intro Cinematic Button */}
        <button
          onClick={onPlayIntro}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 text-xs font-mono font-bold transition-all cursor-pointer"
          title="Play Cinematic Car Commercial Intro"
        >
          <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="hidden lg:inline">INTRO</span>
        </button>

        {/* Sound Lab Button */}
        <button
          onClick={onOpenSoundLab}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_20px_rgba(239,68,68,0.7)] transition-all cursor-pointer active:scale-95"
          title="Open Sound Lab"
        >
          <AnimatedAudioBarsIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SOUND LAB</span>
        </button>

        {/* AI Beast Studio Button */}
        <button
          onClick={onOpenAiStudio}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] transition-all cursor-pointer active:scale-95"
          title="Generate Car with Beast AI"
        >
          <AnimatedAiSparkIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">BEAST AI</span>
        </button>

        {/* Environment Reverb Selector */}
        <div className="hidden xl:flex items-center bg-neutral-900 rounded-lg p-0.5 border border-white/10 text-[10px] font-mono">
          {(['studio', 'tunnel', 'track'] as AcousticEnvironment[]).map((env) => (
            <button
              key={env}
              onClick={() => handleSelectEnvironment(env)}
              className={`px-2 py-1 rounded uppercase font-bold transition-all cursor-pointer ${
                engineSound.getEnvironment() === env
                  ? 'bg-white/20 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {env}
            </button>
          ))}
        </div>

        {/* Master Sound Button */}
        <button
          onClick={handleToggleSound}
          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-mono font-bold ${
            config.exhaustSound
              ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : 'bg-neutral-900 text-neutral-400 border-white/10 hover:text-white'
          }`}
          title={config.exhaustSound ? 'Mute Sound' : 'Enable Sound'}
        >
          {config.exhaustSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Clean Screen Mode */}
        <button
          onClick={onToggleCleanScreen}
          className={`p-2 rounded-xl border transition-all cursor-pointer text-xs font-mono font-bold flex items-center gap-1 ${
            isCleanScreen
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
              : 'bg-neutral-900 text-neutral-400 border-white/10 hover:text-white'
          }`}
          title="Toggle Clean Screen HUD (Press H)"
        >
          {isCleanScreen ? <Eye className="w-4 h-4 text-amber-400" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Vehicle Specs Blueprint Button */}
        <button
          onClick={onOpenSpecs}
          className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 transition-all cursor-pointer text-xs font-mono font-bold flex items-center gap-1.5"
          title="Vehicle Technical Specifications"
        >
          <Info className="w-4 h-4 text-sky-400" />
        </button>
      </div>
    </header>
  );
};
