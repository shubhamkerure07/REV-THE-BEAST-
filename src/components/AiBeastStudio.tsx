import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Zap,
  Flame,
  Check,
  RotateCcw,
  Sliders,
  X,
  Play,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { CarModelType, EngineSoundProfile, ExhaustMaterial, ExhaustStyle } from '../types';
import { engineSound } from '../utils/audio';
import { AnimatedAiSparkIcon, AnimatedEngineIcon, AnimatedAudioBarsIcon } from './AnimatedIcons';

interface AiBeastStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCar: (carConfig: {
    modelType: CarModelType;
    soundProfile: EngineSoundProfile;
    paintColor: string;
    exhaustStyle: ExhaustStyle;
    exhaustMaterial: ExhaustMaterial;
  }) => void;
}

interface GeneratedCarPreset {
  id: string;
  name: string;
  tagline: string;
  engine: string;
  soundProfile: EngineSoundProfile;
  powerHp: number;
  topSpeed: string;
  zeroToSixty: string;
  exhaustStyle: ExhaustStyle;
  exhaustMaterial: ExhaustMaterial;
  paintColor: string;
  modelType: CarModelType;
  conceptPrompt: string;
}

const AI_PRESET_CONCEPTS: GeneratedCarPreset[] = [
  {
    id: 'beast-v12-r',
    name: 'BEAST V12 R HYPER-PROTO',
    tagline: '9,200 RPM Naturally Aspirated Track Weapon',
    engine: '6.5L 60° Naturally Aspirated V12',
    soundProfile: 'v12-symphony',
    powerHp: 890,
    topSpeed: '365 km/h',
    zeroToSixty: '2.5 sec',
    exhaustStyle: 'quad',
    exhaustMaterial: 'titanium',
    paintColor: '#f59e0b',
    modelType: 'beast-v12-ai',
    conceptPrompt: 'Extreme lightweight carbon track car with naturally aspirated V12 scream and blown titanium diffuser.',
  },
  {
    id: 'beast-ev-nevera',
    name: 'BEAST EV HYPER-DRIVE',
    tagline: '1,914 HP All-Wheel Torque Vectoring Megacar',
    engine: 'Quad Permanent Magnet Synchronous Axial-Flux Motors',
    soundProfile: 'electric-motor',
    powerHp: 1914,
    topSpeed: '412 km/h',
    zeroToSixty: '1.74 sec',
    exhaustStyle: 'center',
    exhaustMaterial: 'carbon',
    paintColor: '#06b6d4',
    modelType: 'beast-ev',
    conceptPrompt: 'Next-gen solid-state battery electric hypercar with instantaneous 2,360 Nm torque and inverter whine.',
  },
  {
    id: 'beast-v10-gt',
    name: 'BEAST V10 COMPETIZIONE',
    tagline: 'High-Revving 8,700 RPM Exotic Screamer',
    engine: '5.2L Naturally Aspirated V10',
    soundProfile: 'v10-exotic',
    powerHp: 650,
    topSpeed: '335 km/h',
    zeroToSixty: '2.9 sec',
    exhaustStyle: 'dual',
    exhaustMaterial: 'racing',
    paintColor: '#ec4899',
    modelType: 'procedural-m4',
    conceptPrompt: 'European exotic silhouette with mid-mounted V10 and high-frequency 5th harmonic F1 howl.',
  },
];

export const AiBeastStudio: React.FC<AiBeastStudioProps> = ({
  isOpen,
  onClose,
  onApplyCar,
}) => {
  const [selectedConcept, setSelectedConcept] = useState<GeneratedCarPreset>(AI_PRESET_CONCEPTS[0]);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  if (!isOpen) return null;

  const handleSynthesize = (preset: GeneratedCarPreset) => {
    setIsSynthesizing(true);
    setSelectedConcept(preset);

    setTimeout(() => {
      setIsSynthesizing(false);
      onApplyCar({
        modelType: preset.modelType,
        soundProfile: preset.soundProfile,
        paintColor: preset.paintColor,
        exhaustStyle: preset.exhaustStyle,
        exhaustMaterial: preset.exhaustMaterial,
      });
      engineSound.setProfile(preset.soundProfile);
      engineSound.setExhaustMaterial(preset.exhaustMaterial);
      onClose();
    }, 700);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-3 bottom-4 top-16 md:inset-x-12 md:bottom-8 md:top-20 z-50 rounded-3xl bg-black/95 backdrop-blur-3xl border border-purple-500/30 shadow-[0_20px_60px_rgba(168,85,247,0.25)] overflow-hidden flex flex-col font-sans pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 text-white shadow-lg">
              <AnimatedAiSparkIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black font-mono tracking-tight text-white flex items-center gap-2">
                <span>BEAST AI VEHICLE & ACOUSTIC STUDIO</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/40 uppercase font-bold">
                  AUTONOMOUS GENERATOR
                </span>
              </h2>
              <p className="text-xs font-mono text-neutral-400">
                AI synthesizes: Vehicle Geometry ↔ Engine Architecture ↔ Performance Telemetry ↔ Sound Profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto p-4 sm:p-6 gap-6">
          {/* Left Column: Preset Concepts */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="text-xs font-mono font-bold tracking-widest text-purple-300 uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>SELECT OR SYNTHESIZE AN AI BEAST CONCEPT</span>
            </span>

            <div className="flex flex-col gap-3">
              {AI_PRESET_CONCEPTS.map((preset) => {
                const isSelected = selectedConcept.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedConcept(preset)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.3)] ring-1 ring-purple-400'
                        : 'bg-neutral-900/60 border-white/10 hover:border-white/25 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shadow-md"
                          style={{ backgroundColor: preset.paintColor }}
                        />
                        <span className="font-mono font-black text-sm text-white">
                          {preset.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {preset.powerHp} HP
                      </span>
                    </div>

                    <p className="text-xs font-mono text-neutral-300">{preset.conceptPrompt}</p>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 pt-1 border-t border-white/5">
                      <span>{preset.engine}</span>
                      <span>•</span>
                      <span className="text-purple-300">{preset.topSpeed}</span>
                      <span>•</span>
                      <span className="text-red-400">{preset.zeroToSixty} 0–100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Concept Specs Blueprint & Deploy Button */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-neutral-900/60 rounded-2xl p-5 border border-purple-500/20">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono font-bold text-neutral-400 tracking-wider">
                  TARGET SPECIFICATION
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase">
                  GAME SOUND DESIGN
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">POWERTRAIN:</span>
                  <span className="text-white font-bold text-right">{selectedConcept.engine}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">MAX OUTPUT:</span>
                  <span className="text-amber-400 font-bold">{selectedConcept.powerHp} HP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">TOP SPEED:</span>
                  <span className="text-cyan-400 font-bold">{selectedConcept.topSpeed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">0–100 KM/H:</span>
                  <span className="text-red-400 font-bold">{selectedConcept.zeroToSixty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">EXHAUST SPEC:</span>
                  <span className="text-white font-bold uppercase">
                    {selectedConcept.exhaustStyle} {selectedConcept.exhaustMaterial}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">ACOUSTIC PROFILE:</span>
                  <span className="text-purple-300 font-bold uppercase">
                    {selectedConcept.soundProfile}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-[10px] font-mono text-neutral-400">
                <span className="text-white font-bold block mb-1">Acoustic Attribution Notice:</span>
                This vehicle is a conceptual prototype. REV-THE-BEAST maps this concept to an original, physically synthesized multi-layer acoustic model.
              </div>
            </div>

            {/* Deploy to 3D Showroom CTA */}
            <button
              onClick={() => handleSynthesize(selectedConcept)}
              disabled={isSynthesizing}
              className="mt-6 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-black text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Cpu className="w-4 h-4" />
              <span>{isSynthesizing ? 'SYNTHESIZING VEHICLE...' : 'DEPLOY CONCEPT TO 3D SHOWROOM'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
