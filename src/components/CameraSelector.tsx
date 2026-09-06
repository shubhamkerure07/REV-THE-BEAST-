import React from 'react';
import { CameraPreset } from '../types';
import { Compass, Eye, Shield, Disc, ArrowUp, LayoutGrid, Disc3 } from 'lucide-react';

interface CameraSelectorProps {
  currentPreset: CameraPreset;
  onSelectPreset: (preset: CameraPreset) => void;
}

const PRESETS: { id: CameraPreset; label: string; icon: React.ReactNode }[] = [
  { id: 'hero', label: '3/4 Angle', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'front', label: 'Front Grille', icon: <Shield className="w-3.5 h-3.5" /> },
  { id: 'side', label: 'Profile', icon: <Eye className="w-3.5 h-3.5" /> },
  { id: 'rear', label: 'Rear Quad', icon: <Disc className="w-3.5 h-3.5" /> },
  { id: 'top', label: 'Top Aero', icon: <ArrowUp className="w-3.5 h-3.5" /> },
  { id: 'interior', label: 'Cockpit', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { id: 'wheel', label: 'M Wheels', icon: <Disc3 className="w-3.5 h-3.5" /> },
];

export const CameraSelector: React.FC<CameraSelectorProps> = ({
  currentPreset,
  onSelectPreset,
}) => {
  return (
    <div
      id="camera-preset-selector"
      className="absolute bottom-16 sm:bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-1.5 p-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-x-auto max-w-[95vw] no-scrollbar pointer-events-auto"
    >
      <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-2.5 hidden sm:block">
        VIEW
      </div>
      {PRESETS.map((preset) => {
        const isActive = currentPreset === preset.id;
        return (
          <button
            key={preset.id}
            id={`camera-preset-${preset.id}`}
            onClick={() => onSelectPreset(preset.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all tracking-wide ${
              isActive
                ? 'bg-white text-black shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {preset.icon}
            <span>{preset.label}</span>
          </button>
        );
      })}
    </div>
  );
};
