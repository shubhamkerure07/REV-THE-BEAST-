import React from 'react';
import { Camera, Volume2, VolumeX, Car, Info, Sparkles, Film, Image as ImageIcon } from 'lucide-react';
import { CarConfigState, CarModelType } from '../types';
import { AmbienceController } from './AmbienceController';

interface HeaderProps {
  config: CarConfigState;
  onChangeConfig: (updater: (prev: CarConfigState) => CarConfigState) => void;
  onOpenSpecs: () => void;
  onTakeScreenshot: () => void;
  onSelectModelType?: (model: CarModelType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onChangeConfig,
  onOpenSpecs,
  onTakeScreenshot,
  onSelectModelType,
}) => {
  const getVehicleDisplay = () => {
    switch (config.modelType) {
      case 'ferrari-sf90':
        return { name: 'FERRARI SF90', badge: 'V8 HYBRID 1000HP', initial: 'SF' };
      case 'bugatti-chiron':
        return { name: 'BUGATTI CHIRON', badge: 'QUAD-TURBO W16 1500HP', initial: 'EB' };
      case 're-gt650':
        return { name: 'CONTINENTAL GT 650', badge: 'PARALLEL-TWIN 270°', initial: 'RE' };
      case 're-shotgun650':
        return { name: 'SHOTGUN 650', badge: 'NEO-RETRO BOBBER', initial: 'RE' };
      case 'mustang-gt':
        return { name: 'MUSTANG GT', badge: 'COYOTE 5.0 V8', initial: 'GT' };
      case 'gwagon-g63':
        return { name: 'AMG G63', badge: '4.0L V8 BITURBO', initial: 'G' };
      case 'ninja-h2r':
        return { name: 'NINJA H2R', badge: 'SUPERCHARGED 326HP', initial: 'K' };
      case 'bmw-5series':
        return { name: 'BMW 5 SERIES', badge: 'M SPORT SEDAN', initial: '5' };
      case 'procedural-m4':
      default:
        return { name: 'BMW M4', badge: 'COMPETITION TWIN-TURBO', initial: 'M' };
    }
  };

  const vInfo = getVehicleDisplay();

  return (
    <header
      id="app-header"
      className="absolute top-0 left-0 right-0 z-30 h-16 border-b border-white/10 flex items-center justify-between px-4 sm:px-8 bg-black/50 backdrop-blur-md text-slate-200 pointer-events-auto shadow-2xl"
    >
      {/* Brand & Vehicle Title */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-black text-white shrink-0 tracking-tighter bg-black/60 shadow-[0_0_12px_rgba(255,255,255,0.2)]">
            {vInfo.initial}
          </div>
          <div>
            <div className="text-base sm:text-lg font-black tracking-tighter flex items-center gap-2 text-white">
              <span>{vInfo.name}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-slate-200">
                {vInfo.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Vehicle Switcher Tabs (Desktop) */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400">
          {[
            { id: 'ferrari-sf90' as CarModelType, label: 'Ferrari SF90' },
            { id: 'bugatti-chiron' as CarModelType, label: 'Bugatti Chiron' },
            { id: 'procedural-m4' as CarModelType, label: 'M4 Coupé' },
            { id: 'mustang-gt' as CarModelType, label: 'Mustang GT' },
            { id: 'ninja-h2r' as CarModelType, label: 'Ninja H2R' },
            { id: 're-gt650' as CarModelType, label: 'RE GT650' },
            { id: 're-shotgun650' as CarModelType, label: 'RE Shotgun 650' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectModelType?.(item.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                config.modelType === item.id
                  ? 'bg-white/20 text-white ring-1 ring-white/30'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Photos vs Video Reel Toggle */}
        <button
          id="btn-toggle-view-mode"
          onClick={() =>
            onChangeConfig((prev) => ({
              ...prev,
              viewMode: prev.viewMode === 'video' ? 'photos' : 'video',
            }))
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full text-xs font-bold tracking-wider transition-all border ${
            config.viewMode === 'video'
              ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.4)]'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:text-white'
          }`}
          title="Toggle Cinematic Video Reel vs HD Photos"
        >
          {config.viewMode === 'video' ? <Film className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{config.viewMode === 'video' ? 'VIDEO ACTIVE' : 'VIDEO REEL'}</span>
        </button>

        {/* Driving Simulation Toggle */}
        <button
          id="toggle-drive-mode"
          onClick={() =>
            onChangeConfig((prev) => ({
              ...prev,
              isDriving: !prev.isDriving,
              exhaustSound: !prev.isDriving ? true : prev.exhaustSound,
            }))
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full text-xs font-bold tracking-wider transition-all border ${
            config.isDriving
              ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.4)] animate-pulse'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:text-white'
          }`}
          title="Simulate High-Speed Road Motion"
        >
          <Car className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{config.isDriving ? 'DRIVING' : 'DRIVE'}</span>
        </button>

        {/* Engine Audio Master Toggle */}
        <button
          id="toggle-engine-sound"
          onClick={() =>
            onChangeConfig((prev) => ({
              ...prev,
              exhaustSound: !prev.exhaustSound,
            }))
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full text-xs font-bold tracking-wider transition-all border ${
            config.exhaustSound
              ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:text-white'
          }`}
          title="Acoustic Engine Synthesizer"
        >
          {config.exhaustSound ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{config.exhaustSound ? 'AUDIO ON' : 'AUDIO'}</span>
        </button>

        {/* Background Ambience Controller */}
        <AmbienceController
          currentEnvironment={config.environment}
          onChangeEnvironment={(env) =>
            onChangeConfig((prev) => ({
              ...prev,
              environment: env,
            }))
          }
          isDriving={config.isDriving}
        />

        {/* Screenshot / Snapshot */}
        <button
          id="btn-take-screenshot"
          onClick={onTakeScreenshot}
          className="p-2 rounded-full text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:text-white transition-all shadow-sm"
          title="Save High-Res Snapshot"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>

        <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

        {/* Specs Modal Trigger */}
        <button
          id="btn-open-specs"
          onClick={onOpenSpecs}
          className="bg-white text-black px-4 sm:px-6 py-2 rounded-full text-xs font-bold tracking-widest hover:bg-slate-200 transition-colors shadow-lg flex items-center gap-1.5"
          title="Vehicle Specifications"
        >
          <Info className="w-3.5 h-3.5 text-black" />
          <span>SPECS</span>
        </button>
      </div>
    </header>
  );
};
