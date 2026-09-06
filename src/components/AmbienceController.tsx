import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  Car,
  Flag,
  Building2,
  Compass,
  Zap,
} from 'lucide-react';
import { StudioEnvironment } from '../types';
import { ambienceSound, AmbienceState } from '../utils/ambienceAudio';

interface AmbienceControllerProps {
  currentEnvironment: StudioEnvironment;
  onChangeEnvironment: (env: StudioEnvironment) => void;
  isDriving?: boolean;
}

const ENVIRONMENT_SOUNDSCAPES: Array<{
  id: StudioEnvironment;
  name: string;
  category: string;
  description: string;
  icon: typeof Building2;
  accent: string;
  triggers: Array<{ label: string; action: () => void }>;
}> = [
  {
    id: 'city',
    name: 'City Traffic',
    category: 'Metropolis',
    description: 'Continuous tire & engine rumble, Doppler passing whooshes, and distant vehicle horns',
    icon: Building2,
    accent: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    triggers: [
      { label: 'Honk Horn', action: () => ambienceSound.triggerDistantCarHorn() },
      { label: 'Passing Car', action: () => ambienceSound.triggerPassingCarWhoosh() },
    ],
  },
  {
    id: 'race-track',
    name: 'Circuit Track',
    category: 'Motorsport',
    description: 'Grandstand open breeze, screaming 280km/h GT car flybys, and pit lane pneumatic air guns',
    icon: Flag,
    accent: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
    triggers: [
      { label: '280km/h Flyby', action: () => ambienceSound.triggerRaceCarFlyby() },
      { label: 'Pit Stop Gun', action: () => ambienceSound.triggerPitWheelWrench() },
    ],
  },
  {
    id: 'tokyo-highway',
    name: 'Tokyo Highway',
    category: 'Expressway',
    description: 'Wet asphalt tire spray hiss, concrete overpass resonance, and passing turbo spool',
    icon: Car,
    accent: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    triggers: [
      { label: 'Turbo Pass', action: () => ambienceSound.triggerPassingCarWhoosh() },
    ],
  },
  {
    id: 'monaco-tunnel',
    name: 'Monaco Tunnel',
    category: 'F1 Grand Prix',
    description: 'Enclosed arched concrete tunnel echo, trapped engine acoustics, and marina air',
    icon: Compass,
    accent: 'text-amber-300 border-amber-400/40 bg-amber-400/10',
    triggers: [
      { label: 'Tunnel Roar', action: () => ambienceSound.triggerRaceCarFlyby() },
    ],
  },
  {
    id: 'showroom',
    name: 'Luxury Showroom',
    category: 'Studio',
    description: 'Acoustically treated studio presence, whisper-quiet climate HVAC, and pristine quietude',
    icon: Sparkles,
    accent: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
    triggers: [],
  },
  {
    id: 'hypercar-vault',
    name: 'Hypercar Vault',
    category: 'High-Tech',
    description: 'Sterile cleanroom laminar airflow, sub-bass 50Hz transformer hum, and precision atmosphere',
    icon: Zap,
    accent: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    triggers: [],
  },
  {
    id: 'sunset',
    name: 'Sunset Horizon',
    category: 'Outdoor',
    description: 'Warm golden hour evening breeze and open-air scenic atmosphere',
    icon: Compass,
    accent: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
    triggers: [],
  },
];

export const AmbienceController: React.FC<AmbienceControllerProps> = ({
  currentEnvironment,
  onChangeEnvironment,
}) => {
  const [state, setState] = useState<AmbienceState>({
    isPlaying: ambienceSound.getIsPlaying(),
    environment: currentEnvironment,
    volume: ambienceSound.getVolume(),
    activeEvent: null,
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Sync with audio engine state
  useEffect(() => {
    const unsub = ambienceSound.subscribe((s) => {
      setState(s);
    });
    return unsub;
  }, []);

  // React when environment prop changes from anywhere in the app
  useEffect(() => {
    ambienceSound.setEnvironment(currentEnvironment);
  }, [currentEnvironment]);

  const handleTogglePlay = () => {
    ambienceSound.toggle();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    ambienceSound.setVolume(val);
    if (!state.isPlaying && val > 0) {
      ambienceSound.start();
    }
  };

  const handleSelectEnvironment = (envId: StudioEnvironment) => {
    onChangeEnvironment(envId);
    ambienceSound.setEnvironment(envId);
    if (!state.isPlaying) {
      ambienceSound.start();
    }
  };

  const activeSoundscape =
    ENVIRONMENT_SOUNDSCAPES.find((s) => s.id === currentEnvironment) ||
    ENVIRONMENT_SOUNDSCAPES.find((s) => s.id === 'showroom') ||
    ENVIRONMENT_SOUNDSCAPES[0];

  return (
    <div id="ambience-controller" className="relative pointer-events-auto">
      {/* Header Ambience Quick Pill Button */}
      <button
        id="btn-ambience-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full text-xs font-bold tracking-wider transition-all border shadow-sm ${
          state.isPlaying
            ? 'bg-emerald-600/30 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/40'
            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:text-white'
        }`}
        title="Background Environment Ambience Soundscape"
      >
        <Radio className={`w-3.5 h-3.5 ${state.isPlaying ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
        <span className="hidden md:inline font-mono">
          {state.isPlaying ? activeSoundscape.name.toUpperCase() : 'AMBIENCE'}
        </span>
        <span className="md:hidden">
          {state.isPlaying ? 'ENV ON' : 'ENV'}
        </span>

        {/* Mini animated audio visualizer waves when sound is active */}
        {state.isPlaying && (
          <span className="flex items-end gap-0.5 h-3 ml-0.5">
            <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="w-0.5 h-3 bg-emerald-300 rounded-full animate-bounce" />
            <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </span>
        )}

        {isOpen ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
      </button>

      {/* Interactive Dropdown / Popover Soundscape Console */}
      {isOpen && (
        <div
          id="ambience-console-flyout"
          className="absolute top-12 right-0 w-80 sm:w-96 p-4 rounded-3xl bg-neutral-950/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 text-slate-200 animate-fadeIn ring-1 ring-white/10"
        >
          {/* Header row */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-white/10 border border-white/15 text-emerald-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                  <span>ENVIRONMENT AMBIENCE</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Dynamic high-fidelity environment acoustics
                </div>
              </div>
            </div>

            {/* Main Ambience Power Toggle */}
            <button
              id="btn-ambience-power"
              onClick={handleTogglePlay}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 border shadow-sm ${
                state.isPlaying
                  ? 'bg-emerald-500 text-black border-emerald-400 font-black'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/15'
              }`}
            >
              {state.isPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>ACTIVE</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>MUTED</span>
                </>
              )}
            </button>
          </div>

          {/* Active Soundscape Card */}
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                  {activeSoundscape.category}
                </span>
                <span className="text-xs font-bold text-white font-mono">
                  {activeSoundscape.name}
                </span>
              </div>
              {state.activeEvent && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  {state.activeEvent}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
              {activeSoundscape.description}
            </p>

            {/* Dedicated sound event trigger buttons for current environment */}
            {activeSoundscape.triggers.length > 0 && (
              <div className="flex items-center gap-1.5 pt-2 border-t border-white/10">
                <span className="text-[9px] font-mono text-slate-500 uppercase mr-1">Cue FX:</span>
                {activeSoundscape.triggers.map((trig) => (
                  <button
                    key={trig.label}
                    onClick={() => {
                      if (!state.isPlaying) ambienceSound.start();
                      trig.action();
                    }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all active:scale-95 shadow-sm"
                  >
                    + {trig.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Fader Slider */}
          <div className="space-y-1.5 mb-3 bg-black/40 p-2.5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-slate-500" />
                <span>AMBIENCE VOLUME</span>
              </span>
              <span className="text-white font-bold">{Math.round(state.volume * 100)}%</span>
            </div>
            <input
              id="slider-ambience-volume"
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={state.volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Environment Selection Grid */}
          <div className="space-y-1.5">
            <div className="text-[9px] font-mono uppercase font-bold tracking-wider text-slate-400">
              Select Soundscape Atmosphere
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {ENVIRONMENT_SOUNDSCAPES.map((env) => {
                const IconComponent = env.icon;
                const isSelected = currentEnvironment === env.id;
                return (
                  <button
                    key={env.id}
                    id={`ambience-env-${env.id}`}
                    onClick={() => handleSelectEnvironment(env.id)}
                    className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2 ${
                      isSelected
                        ? `${env.accent} border-current shadow-sm`
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    <div className="truncate">
                      <div className="text-[11px] font-bold font-mono truncate">{env.name}</div>
                      <div className="text-[8px] text-slate-400 truncate">{env.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
