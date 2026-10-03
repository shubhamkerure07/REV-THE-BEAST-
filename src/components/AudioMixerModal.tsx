import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sliders, X, Sparkles, Wind, Disc, Zap } from 'lucide-react';
import { engineSound, AcousticEnvironment } from '../utils/audio';
import { ambienceSound } from '../utils/ambienceAudio';
import { ExhaustValveMode } from '../types';

interface AudioMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const AudioMixerModal: React.FC<AudioMixerModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [engineVolume, setEngineVolume] = useState<number>(85);
  const [ambienceVolume, setAmbienceVolume] = useState<number>(45);
  const [acousticEnv, setAcousticEnv] = useState<AcousticEnvironment>('studio');
  const [valveMode, setValveMode] = useState<ExhaustValveMode>('sport');
  const [isAmbiencePlaying, setIsAmbiencePlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // sync current states
      setValveMode(engineSound.getValveMode());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAcousticEnvChange = (env: AcousticEnvironment) => {
    setAcousticEnv(env);
    engineSound.setEnvironment(env);
    showToast(`ACOUSTIC SPACE: ${env.toUpperCase()}`);
  };

  const handleValveChange = (mode: ExhaustValveMode) => {
    setValveMode(mode);
    engineSound.setValveMode(mode);
    showToast(`EXHAUST VALVES: ${mode.toUpperCase()}`);
  };

  const toggleAmbience = () => {
    if (isAmbiencePlaying) {
      ambienceSound.stop();
      setIsAmbiencePlaying(false);
      showToast('Atmospheric Soundscape: MUTED');
    } else {
      ambienceSound.start();
      setIsAmbiencePlaying(true);
      showToast('Atmospheric Soundscape: ACTIVE');
    }
  };

  const toggleMasterMute = () => {
    if (isMuted) {
      setIsMuted(false);
      ambienceSound.setVolume(ambienceVolume / 100);
      showToast('AUDIO UNMUTED');
    } else {
      setIsMuted(true);
      ambienceSound.setVolume(0);
      engineSound.stop();
      showToast('MASTER AUDIO MUTED');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-neutral-900/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-400">
              <Sliders size={20} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                MASTER ACOUSTIC CONSOLE
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-syne tracking-tight">
                AUDIO MASTERING & REVERB
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMasterMute}
              className={`p-2.5 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
              }`}
              title="Master Mute"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 text-neutral-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body Controls */}
        <div className="space-y-6 py-6">
          {/* 1. Engine Acoustic Level */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                POWERTRAIN SYNTHESIS GAIN
              </span>
              <span className="text-amber-400 font-bold">{engineVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={engineVolume}
              onChange={(e) => setEngineVolume(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-neutral-800 rounded-lg"
            />
          </div>

          {/* 2. Atmospheric Ambience Level */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <Wind size={14} className="text-cyan-400" />
                ATMOSPHERIC CIRCUIT AMBIENCE
              </span>
              <span className="text-cyan-400 font-bold">
                {isAmbiencePlaying ? `${ambienceVolume}%` : 'MUTED'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                disabled={!isAmbiencePlaying}
                value={ambienceVolume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAmbienceVolume(val);
                  ambienceSound.setVolume(val / 100);
                }}
                className="flex-1 accent-cyan-400 cursor-pointer h-2 bg-neutral-800 rounded-lg disabled:opacity-30"
              />
              <button
                onClick={toggleAmbience}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono uppercase tracking-wider transition-all ${
                  isAmbiencePlaying
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    : 'bg-white/5 text-neutral-400 border-white/10'
                }`}
              >
                {isAmbiencePlaying ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* 3. Reverb Acoustic Space */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Disc size={14} className="text-emerald-400" />
              ACOUSTIC CONVOLUTION IMPULSE
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['studio', 'tunnel', 'track'] as AcousticEnvironment[]).map((env) => {
                const isSelected = acousticEnv === env;
                return (
                  <button
                    key={env}
                    onClick={() => handleAcousticEnvChange(env)}
                    className={`py-3 px-3 rounded-xl border text-center font-mono text-xs uppercase tracking-wider transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 text-neutral-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold">{env.toUpperCase()}</div>
                    <div className="text-[9px] text-neutral-500 mt-0.5">
                      {env === 'studio' ? 'Dry Crisp' : env === 'tunnel' ? 'Echo Wall' : 'Grandstand'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Active Exhaust Flap Valves */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Sparkles size={14} className="text-red-400" />
              ACTIVE EXHAUST BYPASS VALVES
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['quiet', 'sport', 'track'] as ExhaustValveMode[]).map((mode) => {
                const isSelected = valveMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => handleValveChange(mode)}
                    className={`py-3 px-3 rounded-xl border text-center font-mono text-xs uppercase tracking-wider transition-all ${
                      isSelected
                        ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'bg-white/5 text-neutral-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold">{mode.toUpperCase()}</div>
                    <div className="text-[9px] text-neutral-500 mt-0.5">
                      {mode === 'quiet' ? '-6 dB Baffle' : mode === 'sport' ? 'Tuned Flap' : 'Straight Open'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Live Acoustic Transient Triggers */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-3">
              INSTANT ACOUSTIC SAMPLING
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  engineSound.triggerThrottleBlip();
                  showToast('REV: Throttle Heel-and-Toe Blip');
                }}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-neutral-200 transition-all text-center"
              >
                BLIP REV
              </button>
              <button
                onClick={() => {
                  engineSound.triggerBlowOffValve();
                  showToast('TURBO: Compressor Surge Flutter');
                }}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-neutral-200 transition-all text-center"
              >
                BLOW-OFF VALVE
              </button>
              <button
                onClick={() => {
                  engineSound.triggerExhaustBackfire();
                  showToast('EXHAUST: Gunshot Overrun Pop');
                }}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-neutral-200 transition-all text-center"
              >
                GUNSHOT POP
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-white text-black font-black font-syne uppercase tracking-wider text-xs hover:bg-amber-400 transition-all"
          >
            CONFIRM & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
