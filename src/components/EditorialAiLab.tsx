import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Flame,
  Zap,
  Activity,
  Car,
  Flag,
  Check,
  Cpu,
  Sliders,
  Volume2,
} from 'lucide-react';
import { CarModelType, EngineSoundProfile, ExhaustMaterial, ExhaustStyle } from '../types';
import { engineSound } from '../utils/audio';

interface EditorialAiLabProps {
  onBack: () => void;
  onDeployToGarage: (newCar: {
    modelType: CarModelType;
    name: string;
    soundProfile: EngineSoundProfile;
    paintColor: string;
    exhaustStyle: ExhaustStyle;
    exhaustMaterial: ExhaustMaterial;
  }) => void;
  onRace: (model: CarModelType) => void;
  showToast: (msg: string) => void;
}

interface SynthesizedCar {
  name: string;
  codename: string;
  tagline: string;
  engine: string;
  powerHp: number;
  torqueNm: number;
  topSpeedKmh: number;
  zeroToSixtySec: number;
  weightKg: number;
  drivetrain: string;
  transmission: string;
  exhaust: string;
  soundProfile: EngineSoundProfile;
  exhaustStyle: ExhaustStyle;
  exhaustMaterial: ExhaustMaterial;
  paintColor: string;
  description: string;
  conceptImage: string;
}

export const EditorialAiLab: React.FC<EditorialAiLabProps> = ({
  onBack,
  onDeployToGarage,
  onRace,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'advisor'>('create');
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [synthesizedCar, setSynthesizedCar] = useState<SynthesizedCar | null>(null);

  // Advisor State
  const [advisorGoal, setAdvisorGoal] = useState<string>('acceleration');

  const QUICK_PROMPTS = [
    'Create an 850 HP naturally aspirated V12 screaming track weapon',
    'Create a 1,200 HP twin-turbo V8 high-speed midnight highway monster',
    'Create a 1,900 HP quad-motor electric hypercar with torque vectoring',
    'Create a lightweight 750 HP supercharged hyperbike for closed-circuit records',
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const p = prompt.toLowerCase();
      let soundProfile: EngineSoundProfile = 'v12-symphony';
      let hp = 850;
      let zeroSixty = 2.6;
      let vMax = 355;
      let eng = '6.5L Naturally Aspirated 60° V12';
      let drive = 'AWD Torque-Vectoring';
      let color = '#f59e0b';
      let name = 'BEAST V12 PROTO-X';
      let img = 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1920&q=85';

      if (p.includes('electric') || p.includes('ev') || p.includes('battery')) {
        soundProfile = 'electric-motor';
        hp = 1914;
        zeroSixty = 1.85;
        vMax = 412;
        eng = 'Quad Axial-Flux Electric Synchronous Motors';
        color = '#06b6d4';
        name = 'BEAST VOLT HYPERDRIVE';
        img = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1920&q=85';
      } else if (p.includes('v8') || p.includes('muscle') || p.includes('drag')) {
        soundProfile = 'coyote-v8';
        hp = 1050;
        zeroSixty = 2.4;
        vMax = 360;
        eng = '5.2L Supercharged Flat-Plane Predator V8';
        color = '#e11d48';
        name = 'BEAST APEX V8 INTERCEPTOR';
        img = 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1920&q=85';
      } else if (p.includes('bike') || p.includes('motorcycle') || p.includes('supercharged')) {
        soundProfile = 'supercharged-i4';
        hp = 330;
        zeroSixty = 2.2;
        vMax = 405;
        eng = '998cc Centrifugal Supercharged Inline-4';
        color = '#84cc16';
        name = 'BEAST TURBINE SUPERBIKE';
        img = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1920&q=85';
      }

      const car: SynthesizedCar = {
        name,
        codename: `PROJECT-${Math.floor(100 + Math.random() * 900)}`,
        tagline: 'Synthesized via Neural Automotive Genesis Engine',
        engine: eng,
        powerHp: hp,
        torqueNm: Math.round(hp * 1.15),
        topSpeedKmh: vMax,
        zeroToSixtySec: zeroSixty,
        weightKg: 1380,
        drivetrain: drive,
        transmission: '7-Speed Dual-Clutch Sequential Pneumatic',
        exhaust: 'Inconel Equal-Length Titanium Flame Headers',
        soundProfile,
        exhaustStyle: 'quad',
        exhaustMaterial: 'titanium',
        paintColor: color,
        description: `Custom synthesized architecture tailored to request "${prompt}". Features bespoke aerodynamics and titanium exhaust harmonics.`,
        conceptImage: img,
      };

      setSynthesizedCar(car);
      setIsGenerating(false);
      showToast(`Vehicle Synthesized: ${car.name}!`);
    }, 1200);
  };

  const handleAuditionSynthesizedSound = () => {
    if (!synthesizedCar) return;
    engineSound.setProfile(synthesizedCar.soundProfile);
    engineSound.setExhaustMaterial(synthesizedCar.exhaustMaterial);
    engineSound.start();

    showToast(`Auditioning ${synthesizedCar.soundProfile} acoustics`);

    setTimeout(() => engineSound.setThrottle(0.85), 150);
    setTimeout(() => engineSound.setThrottle(0.2), 900);
    setTimeout(() => {
      engineSound.triggerExhaustBackfire();
      engineSound.setThrottle(0);
    }, 1500);
    setTimeout(() => engineSound.stop(), 2300);
  };

  const handleDeploy = () => {
    if (!synthesizedCar) return;
    onDeployToGarage({
      modelType: 'beast-v12-ai',
      name: synthesizedCar.name,
      soundProfile: synthesizedCar.soundProfile,
      paintColor: synthesizedCar.paintColor,
      exhaustStyle: synthesizedCar.exhaustStyle,
      exhaustMaterial: synthesizedCar.exhaustMaterial,
    });
    showToast(`${synthesizedCar.name} added to your active garage!`);
  };

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-neutral-100 select-none pt-24 pb-28 px-6 sm:px-12 md:px-16">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/[0.08] pb-6 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold">
                GENERATIVE AUTOMOTIVE INTELLIGENCE
              </span>
            </div>
            <h1 className="font-syne font-black text-4xl sm:text-6xl text-white tracking-tighter uppercase leading-[0.95]">
              BEAST AI LAB.
            </h1>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>RETURN TO SHOWROOM</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] max-w-md">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            CREATE YOUR BEAST
          </button>
          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'advisor'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            AI BUILD ADVISOR
          </button>
        </div>

        {/* TAB 1: CREATE YOUR OWN BEAST */}
        {activeTab === 'create' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Input Prompt Box */}
            <div className="p-8 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-4">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest font-bold block">
                DESCRIBE THE HYPERCAR OR VEHICLE YOU WANT TO ENGINEER
              </span>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="e.g. A 1,000 HP lightweight twin-turbo V8 track weapon with titanium exhaust..."
                  className="flex-1 px-5 py-4 rounded-2xl bg-black/60 border border-white/15 text-white placeholder:text-neutral-500 font-mono text-sm focus:outline-none focus:border-purple-400 transition-colors"
                />

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'SYNTHESIZING...' : 'GENERATE BEAST'}</span>
                </button>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase mr-1">
                  SUGGESTIONS:
                </span>
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(qp);
                    }}
                    className="px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-400 hover:text-white text-xs font-sans transition-all text-left cursor-pointer"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

            {/* Synthesized Vehicle Result Card */}
            {synthesizedCar && (
              <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900/80 border border-purple-500/40 shadow-2xl space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Concept Image */}
                  <div className="lg:col-span-6 rounded-2xl overflow-hidden bg-black/80 border border-white/10 h-72 sm:h-84 relative">
                    <img
                      src={synthesizedCar.conceptImage}
                      alt={synthesizedCar.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-purple-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                      {synthesizedCar.codename}
                    </div>
                  </div>

                  {/* Right Specs & Information */}
                  <div className="lg:col-span-6 space-y-4">
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold block mb-1">
                        SYNTHESIS COMPLETE
                      </span>
                      <h2 className="font-syne font-black text-3xl sm:text-4xl text-white">
                        {synthesizedCar.name}
                      </h2>
                      <p className="text-xs text-neutral-300 font-sans mt-2 leading-relaxed">
                        {synthesizedCar.description}
                      </p>
                    </div>

                    {/* Performance Chips */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.08] text-center font-mono">
                      <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.04]">
                        <span className="text-[9px] text-neutral-400 block uppercase">OUTPUT</span>
                        <span className="text-base font-black text-amber-400">
                          {synthesizedCar.powerHp} HP
                        </span>
                      </div>
                      <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.04]">
                        <span className="text-[9px] text-neutral-400 block uppercase">0-100</span>
                        <span className="text-base font-black text-white">
                          {synthesizedCar.zeroToSixtySec}s
                        </span>
                      </div>
                      <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.04]">
                        <span className="text-[9px] text-neutral-400 block uppercase">V-MAX</span>
                        <span className="text-base font-black text-white">
                          {synthesizedCar.topSpeedKmh} KM/H
                        </span>
                      </div>
                    </div>

                    {/* Action Triggers */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs font-bold">
                      <button
                        onClick={handleDeploy}
                        className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-2"
                      >
                        <Car className="w-4 h-4" />
                        <span>ADD TO GARAGE</span>
                      </button>

                      <button
                        onClick={handleAuditionSynthesizedSound}
                        className="px-5 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Volume2 className="w-4 h-4 text-amber-400" />
                        <span>AUDITION SOUND</span>
                      </button>

                      <button
                        onClick={() => onRace('beast-v12-ai')}
                        className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-black uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-2 font-black"
                      >
                        <Flag className="w-4 h-4" />
                        <span>RACE</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI BUILD ADVISOR */}
        {activeTab === 'advisor' && (
          <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-8 animate-fadeIn">
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold block mb-1">
                INTELLIGENT TUNING BLUEPRINT
              </span>
              <h2 className="font-syne font-black text-3xl sm:text-4xl text-white">
                BUILD MY CAR ADVISOR.
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-xl font-sans">
                Tell the advisor your performance objective. The AI computes optimal powertrain,
                exhaust backpressure ratio, and aerodynamics package.
              </p>
            </div>

            {/* Goal Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'acceleration', title: 'Maximum 1/4 Mile Launch', subtitle: 'Target: 0-100 in <2.2s' },
                { id: 'nurburgring', title: 'Circuit Apex Downforce', subtitle: 'Target: Sub-7 min Ring time' },
                { id: 'vmax', title: 'High-Velocity Autobahn V-Max', subtitle: 'Target: >380 km/h top speed' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setAdvisorGoal(g.id)}
                  className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
                    advisorGoal === g.id
                      ? 'bg-purple-600/15 border-purple-500 shadow-xl'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <span className="font-syne font-bold text-base text-white block">{g.title}</span>
                  <span className="text-xs text-neutral-400 font-mono mt-1 block">{g.subtitle}</span>
                </button>
              ))}
            </div>

            {/* Recommended Blueprint */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold block">
                WHY THIS BUILD? // RECOMMENDED BLUEPRINT
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[9px] text-neutral-500 uppercase block">RECOMMENDED ENGINE</span>
                  <strong className="text-white text-sm">
                    {advisorGoal === 'acceleration' ? 'Electric Quad-Motor / SF90 TwinTurbo V8' : advisorGoal === 'nurburgring' ? '6.5L V12 Naturally Aspirated' : '8.0L W16 Quad-Turbo'}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[9px] text-neutral-500 uppercase block">EXHAUST SPEC</span>
                  <strong className="text-amber-400 text-sm">
                    {advisorGoal === 'nurburgring' ? 'Titanium Equal-Length Race' : 'Straight-Pipe Decat'}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[9px] text-neutral-500 uppercase block">AERODYNAMICS</span>
                  <strong className="text-white text-sm">
                    {advisorGoal === 'nurburgring' ? 'High-Angle Carbon GT Wing' : 'Low-Drag Active Wing Slipstream'}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[9px] text-neutral-500 uppercase block">TIRES & SUSPENSION</span>
                  <strong className="text-cyan-400 text-sm">
                    {advisorGoal === 'acceleration' ? 'Soft Drag Slicks (AWD)' : 'Pirelli Trofeo R Motorsport'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
