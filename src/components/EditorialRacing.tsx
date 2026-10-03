import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CarConfigState, CarModelType } from '../types';
import { getVehicleMedia } from '../data/vehicleMedia';
import { getEngineForModel } from '../data/engines';
import { engineSound } from '../utils/audio';

interface TrackInfo {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  corners: number;
  recordTime: string;
  recordHolder: string;
  surface: string;
  timeOfDay: string;
  difficulty: 'MEDIUM' | 'HARD' | 'EXTREME' | 'LEGENDARY';
  backgroundImage: string;
  accentColor: string;
  description: string;
}

const TRACKS: TrackInfo[] = [
  {
    id: 'tokyo-expressway',
    name: 'TOKYO C1 INNER LOOP',
    location: 'Shuto Expressway, Tokyo, Japan',
    distanceKm: 14.2,
    corners: 28,
    recordTime: '03:48.220',
    recordHolder: 'Mid Night Club Spec',
    surface: 'Wet Asphalt / Neon Reflections',
    timeOfDay: '02:40 AM (Midnight)',
    difficulty: 'HARD',
    backgroundImage:
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2000&q=85',
    accentColor: '#00f0ff',
    description:
      'High-speed elevated toll expressway through Tokyo skyscraper canyons. Tight tunnels, narrow crash barriers, and wet reflection slicks demand razor-sharp precision.',
  },
  {
    id: 'nordschleife',
    name: 'NÜRBURGRING NORDSCHLEIFE',
    location: 'Eifel Forest, Nürburg, Germany',
    distanceKm: 20.8,
    corners: 73,
    recordTime: '06:35.183',
    recordHolder: 'AMG One Production Record',
    surface: 'Dry Coarse Tarmac / High Curbs',
    timeOfDay: '11:15 AM (Overcast)',
    difficulty: 'LEGENDARY',
    backgroundImage:
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=2000&q=85',
    accentColor: '#10b981',
    description:
      'The infamous Green Hell. 300 meters of violent elevation swings, blind crests, Karussell banking, and unrelenting compression forces.',
  },
  {
    id: 'monaco-gp',
    name: 'CIRCUIT DE MONACO',
    location: 'Monte Carlo, Principality of Monaco',
    distanceKm: 3.34,
    corners: 19,
    recordTime: '01:10.166',
    recordHolder: 'F1 V6 Turbo-Hybrid',
    surface: 'Polished Harbor Street Tarmac',
    timeOfDay: '04:30 PM (Golden Hour)',
    difficulty: 'EXTREME',
    backgroundImage:
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=2000&q=85',
    accentColor: '#eab308',
    description:
      'The crown jewel of motorsport. Armco barriers brushing your side mirrors, the legendary acoustic scream inside the Harbor Tunnel, and Sainte-Dévote braking.',
  },
  {
    id: 'pacific-coast',
    name: 'BIG SUR CANYON PASS',
    location: 'Highway 1, California, USA',
    distanceKm: 18.6,
    corners: 42,
    recordTime: '05:12.780',
    recordHolder: 'GT3 RS Track Spec',
    surface: 'Sun-baked Coastal Asphalt',
    timeOfDay: '07:20 PM (Sunset Dusk)',
    difficulty: 'MEDIUM',
    backgroundImage:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=85',
    accentColor: '#f97316',
    description:
      'Carved into Pacific ocean sea cliffs. Sweeping fast cambered curves, ocean sea-spray mist, and dramatic dusk light streaks at wide-open throttle.',
  },
];

interface EditorialRacingProps {
  config: CarConfigState;
  onNavigate: (view: 'garage' | 'customizer' | 'sound-lab') => void;
  showToast: (msg: string) => void;
}

type RacePhase = 'select-track' | 'countdown' | 'racing' | 'results';

export const EditorialRacing: React.FC<EditorialRacingProps> = ({
  config,
  onNavigate,
  showToast,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<TrackInfo>(TRACKS[0]);
  const [phase, setPhase] = useState<RacePhase>('select-track');
  const [countdown, setCountdown] = useState<number>(3);

  // Dynamic Telemetry
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [currentGear, setCurrentGear] = useState<number>(1);
  const [rpm, setRpm] = useState<number>(800);
  const [boostPsi, setBoostPsi] = useState<number>(0);
  const [throttle, setThrottle] = useState<number>(0);
  const [isBraking, setIsBraking] = useState<boolean>(false);
  const [drsActive, setDrsActive] = useState<boolean>(false);

  // Race Progress
  const [progressDistanceKm, setProgressDistanceKm] = useState<number>(0);
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(0);
  const [topSpeedRecorded, setTopSpeedRecorded] = useState<number>(0);

  // Vehicle data
  const media = getVehicleMedia(config.modelType);
  const engine = getEngineForModel(config.modelType);
  const maxRpm = engine.redlineRpm || 8000;
  const idleRpm = engine.idleRpm || 800;

  // Refs for physics animation loop
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const raceStartTimeRef = useRef<number>(0);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Clean up sound and animation on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      engineSound.stop();
    };
  }, []);

  // Gear ratios for realistic speed/RPM transmission simulation
  const gearRatios = [3.82, 2.36, 1.68, 1.31, 1.05, 0.87, 0.72];
  const finalDrive = 3.44;

  // Start countdown sequence
  const startRaceCountdown = () => {
    setPhase('countdown');
    setCountdown(3);
    setSpeedKmh(0);
    setCurrentGear(1);
    setProgressDistanceKm(0);
    setElapsedTimeMs(0);
    setTopSpeedRecorded(0);

    // Warm up engine
    engineSound.start();
    engineSound.setThrottle(0.2);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 2) {
        engineSound.setThrottle(0.6);
        engineSound.triggerThrottleBlip();
      } else if (count === 1) {
        engineSound.setThrottle(0.85);
      } else if (count === 0) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase('racing');
          raceStartTimeRef.current = performance.now();
          lastTimeRef.current = performance.now();
          showToast('GREEN LIGHT! ACCELERATE WITH [SPACE] OR [W]');
        }, 600);
      }
    }, 950);
  };

  // Keyboard controls listener
  useEffect(() => {
    if (phase !== 'racing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.code;
      keysPressedRef.current[key] = true;

      if (key === 'KeyE' || key === 'ArrowUp') {
        // Shift Up
        e.preventDefault();
        shiftUp();
      } else if (key === 'KeyQ' || key === 'ArrowDown') {
        // Shift Down
        e.preventDefault();
        shiftDown();
      } else if (key === 'KeyB') {
        // DRS / Nitro
        e.preventDefault();
        setDrsActive((prev) => !prev);
        showToast(!drsActive ? 'DRS AERO OPEN (+15% TOP SPEED)' : 'DRS CLOSED');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase, currentGear, drsActive]);

  // Gear Shift Actions
  const shiftUp = useCallback(() => {
    if (currentGear >= 7) return;
    const nextGear = currentGear + 1;
    setCurrentGear(nextGear);
    engineSound.setGear(nextGear as any);
    engineSound.triggerExhaustBackfire();
    // RPM drops on upshift
    setRpm((prev) => Math.max(idleRpm + 1000, prev * 0.72));
  }, [currentGear, idleRpm]);

  const shiftDown = useCallback(() => {
    if (currentGear <= 1) return;
    const prevGear = currentGear - 1;
    setCurrentGear(prevGear);
    engineSound.setGear(prevGear as any);
    engineSound.triggerThrottleBlip();
    // RPM blips up on downshift
    setRpm((prev) => Math.min(maxRpm * 0.95, prev * 1.35));
  }, [currentGear, idleRpm, maxRpm]);

  // Physics Simulation Loop
  useEffect(() => {
    if (phase !== 'racing') return;

    const loop = (timestamp: number) => {
      const dt = Math.min(0.08, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      // Update race timer
      const elapsed = timestamp - raceStartTimeRef.current;
      setElapsedTimeMs(elapsed);

      // Check input states
      const keys = keysPressedRef.current;
      const isThrottlePressed =
        keys['Space'] || keys['KeyW'] || keys['Numpad8'] || throttle > 0.05;
      const isBrakePressed =
        keys['KeyS'] || keys['Backspace'] || keys['Numpad2'] || isBraking;

      const targetThrottle = isThrottlePressed ? 1.0 : 0.0;
      const effectiveBrake = isBrakePressed ? 1.0 : 0.0;

      // Calculate acceleration
      const horsePower = engine.horsePower || 700;
      const weightKg = 1520;
      const currentGearRatio = gearRatios[currentGear - 1] || 1.0;
      const aeroDragFactor = drsActive ? 0.00038 : 0.00052;

      // Current maximum speed possible in this gear
      const maxSpeedInGear = (maxRpm / (currentGearRatio * finalDrive * 12)) * 3.6;

      setSpeedKmh((prevSpeed) => {
        let newSpeed = prevSpeed;

        if (isThrottlePressed) {
          const powerRatio = horsePower / weightKg;
          const driveTorque =
            powerRatio * currentGearRatio * (1 - prevSpeed / (maxSpeedInGear * 1.05));
          const netAccel = Math.max(0, driveTorque * 28 - prevSpeed * prevSpeed * aeroDragFactor);
          newSpeed += netAccel * dt;
        } else {
          // Coasting drag
          newSpeed -= (8.0 + prevSpeed * prevSpeed * aeroDragFactor * 1.2) * dt;
        }

        if (effectiveBrake > 0) {
          // High-performance carbon ceramic braking
          newSpeed -= 95.0 * dt;
        }

        newSpeed = Math.max(0, Math.min(media.specs.topSpeedKmh * 1.05, newSpeed));

        // Track top speed
        setTopSpeedRecorded((prevTop) => Math.max(prevTop, Math.round(newSpeed)));

        // Synchronize RPM to wheel speed and gear ratio
        let calculatedRpm = idleRpm + (newSpeed / maxSpeedInGear) * (maxRpm - idleRpm);

        // If at redline in current gear, bounce rev limiter
        if (calculatedRpm >= maxRpm) {
          calculatedRpm = maxRpm - (Math.random() * 250);
          engineSound.triggerExhaustBackfire();
        }

        setRpm(Math.round(calculatedRpm));
        engineSound.setThrottle(isThrottlePressed ? 1.0 : 0.05);

        // Boost calculation for turbo engines
        if (engine.aspiration.toLowerCase().includes('turbo')) {
          const targetBoost = isThrottlePressed ? (calculatedRpm / maxRpm) * 24.5 : 0;
          setBoostPsi(Number(targetBoost.toFixed(1)));
        }

        return newSpeed;
      });

      // Update distance traveled
      setProgressDistanceKm((prevDist) => {
        const distDelta = (speedKmh / 3600) * dt;
        const newDist = prevDist + distDelta;

        // Finish line check
        if (newDist >= selectedTrack.distanceKm) {
          // Completed Race!
          setPhase('results');
          engineSound.setThrottle(0);
          showToast('RACE COMPLETE! CHECKERED FLAG!');
        }

        return newDist;
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [
    phase,
    throttle,
    isBraking,
    currentGear,
    drsActive,
    speedKmh,
    selectedTrack.distanceKm,
    engine,
    media.specs.topSpeedKmh,
  ]);

  // Format Milliseconds to MM:SS.ms
  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
  };

  const progressPercent = Math.min(
    100,
    (progressDistanceKm / selectedTrack.distanceKm) * 100
  );
  const rpmPercent = Math.min(100, (rpm / maxRpm) * 100);

  // Speed-based blur/vibration intensity
  const speedRatio = speedKmh / media.specs.topSpeedKmh;
  const shakeOffset = speedRatio > 0.7 ? (Math.random() - 0.5) * (speedRatio * 8) : 0;

  return (
    <div className="relative w-full min-h-screen bg-neutral-950 text-white overflow-hidden select-none font-sans">
      {/* ------------------------------------------------------------------ */}
      {/* PHASE 1: TRACK SELECTION SCREEN */}
      {/* ------------------------------------------------------------------ */}
      {phase === 'select-track' && (
        <div className="relative w-full min-h-screen flex flex-col justify-between p-6 sm:p-12 z-10">
          {/* Background Track Wallpaper with Dark Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={selectedTrack.backgroundImage}
              alt={selectedTrack.name}
              className="w-full h-full object-cover object-center filter brightness-40 scale-105 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.85)_100%)]" />
          </div>

          {/* Top Bar */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">
                  CIRCUIT GRAND PRIX // STAGE 01
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black font-syne tracking-tight text-white">
                SELECT BATTLEGROUND
              </h1>
            </div>

            {/* Active Machine Preview Capsule */}
            <div className="flex items-center gap-4 bg-white/[0.04] backdrop-blur-md border border-white/10 px-5 py-3 rounded-full">
              <div className="w-12 h-8 rounded overflow-hidden">
                <img
                  src={media.angles.side}
                  alt={media.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                  WEAPON OF CHOICE
                </div>
                <div className="text-sm font-bold text-white font-syne truncate max-w-[180px]">
                  {media.name}
                </div>
              </div>
              <div className="text-right border-l border-white/10 pl-4">
                <div className="text-xs font-mono font-bold text-amber-400">
                  {engine.horsePower} HP
                </div>
                <div className="text-[10px] font-mono text-neutral-400">
                  {media.specs.topSpeedKmh} KM/H
                </div>
              </div>
            </div>
          </div>

          {/* Center: Selected Track Deep Dive */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 border border-white/15 text-xs font-mono uppercase tracking-wider text-neutral-200">
                <span>{selectedTrack.location}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{selectedTrack.difficulty}</span>
              </div>

              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black font-syne tracking-tighter text-white uppercase leading-none">
                {selectedTrack.name}
              </h2>

              <p className="text-base sm:text-lg text-neutral-300 font-editorial max-w-2xl leading-relaxed">
                {selectedTrack.description}
              </p>

              {/* Circuit Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                <div className="p-4 bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-xl">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    LAP DISTANCE
                  </div>
                  <div className="text-2xl font-black font-syne text-white mt-1">
                    {selectedTrack.distanceKm}{' '}
                    <span className="text-xs text-neutral-400 font-mono">KM</span>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-xl">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    APEX TURNS
                  </div>
                  <div className="text-2xl font-black font-syne text-white mt-1">
                    {selectedTrack.corners}{' '}
                    <span className="text-xs text-neutral-400 font-mono">CORNERS</span>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-xl">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    LAP RECORD
                  </div>
                  <div className="text-2xl font-black font-syne text-emerald-400 font-mono mt-1">
                    {selectedTrack.recordTime}
                  </div>
                </div>

                <div className="p-4 bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-xl">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    CONDITIONS
                  </div>
                  <div className="text-xs font-bold font-syne text-white mt-2 truncate">
                    {selectedTrack.timeOfDay}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Track Cards Carousel */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-3">
              <div className="text-xs uppercase font-mono tracking-widest text-neutral-400 mb-2">
                SELECT TRACK CIRCUIT // 04 AVAILABLE
              </div>
              {TRACKS.map((track) => {
                const isSelected = track.id === selectedTrack.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => setSelectedTrack(track)}
                    className={`relative w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group overflow-hidden ${
                      isSelected
                        ? 'bg-white/10 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.15)] translate-x-2'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <img
                          src={track.backgroundImage}
                          alt={track.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-white/20 border border-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-black font-syne text-white group-hover:text-amber-400 transition-colors">
                          {track.name}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-400">
                          {track.distanceKm} km • {track.corners} turns
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          isSelected
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                            : 'bg-white/5 text-neutral-400 border-white/10'
                        }`}
                      >
                        {track.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
            <button
              onClick={() => onNavigate('garage')}
              className="text-xs uppercase font-mono tracking-widest text-neutral-400 hover:text-white transition-colors"
            >
              ← RETURN TO GARAGE
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('customizer')}
                className="px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest text-neutral-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                TUNE MACHINE SPECS
              </button>
              <button
                onClick={startRaceCountdown}
                className="group relative px-10 py-4 rounded-full bg-white text-black font-black font-syne uppercase tracking-wider text-sm hover:bg-amber-400 hover:shadow-[0_0_40px_rgba(251,191,36,0.5)] transition-all duration-300 flex items-center gap-3"
              >
                <span>COMMENCE GRAND PRIX</span>
                <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* PHASE 2: 3-2-1-GO COUNTDOWN OVERLAY */}
      {/* ------------------------------------------------------------------ */}
      {phase === 'countdown' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl">
          <div className="flex items-center gap-6 mb-12">
            {[1, 2, 3].map((val) => (
              <div
                key={val}
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                  countdown <= 4 - val
                    ? 'bg-red-600 border-red-400 shadow-[0_0_50px_rgba(239,68,68,0.9)] scale-110'
                    : 'bg-neutral-900 border-neutral-700 opacity-30'
                }`}
              />
            ))}
          </div>

          <div className="text-8xl sm:text-9xl font-black font-syne tracking-tighter text-white animate-pulse">
            {countdown > 0 ? countdown : 'GREEN!'}
          </div>

          <div className="text-sm font-mono tracking-widest uppercase text-neutral-400 mt-6">
            HOLD [SPACE] TO ACCELERATE • WARMING SLICKS
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* PHASE 3: LIVE RACING HUD & SIMULATOR */}
      {/* ------------------------------------------------------------------ */}
      {phase === 'racing' && (
        <div
          className="relative w-full h-screen overflow-hidden flex flex-col justify-between p-4 sm:p-8"
          style={{
            transform: `translate(${shakeOffset}px, ${shakeOffset * 0.5}px)`,
          }}
        >
          {/* Dynamic Highway / Track Speed Canvas Background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={selectedTrack.backgroundImage}
              alt={selectedTrack.name}
              className="w-full h-full object-cover filter brightness-50 transition-all duration-100"
              style={{
                transform: `scale(${1 + speedRatio * 0.25})`,
                filter: `blur(${speedRatio * 3}px) brightness(${0.5 + speedRatio * 0.2})`,
              }}
            />
            {/* Speed Streak Lines simulation */}
            {speedKmh > 120 && (
              <div
                className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(255,255,255,0.2) 16px, transparent 18px)',
                  backgroundSize: '100% 100px',
                  animation: `moveRoad ${Math.max(0.1, 1.2 - speedRatio)}s linear infinite`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
          </div>

          {/* Top HUD Bar: Sector Progress & Lap Timer */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
            {/* Track & Vehicle Pill */}
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded text-[11px] font-mono uppercase tracking-wider text-amber-400 border border-white/10">
                {selectedTrack.name}
              </span>
              <span className="hidden sm:inline text-xs font-mono text-neutral-400">
                {media.name} • {engine.displacement} {engine.aspiration}
              </span>
            </div>

            {/* Lap Timer Counter */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                  LAP TIME
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider">
                  {formatTime(elapsedTimeMs)}
                </div>
              </div>
              <div className="hidden sm:block text-right border-l border-white/10 pl-6">
                <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                  RECORD SPLIT
                </div>
                <div className="text-sm font-mono text-emerald-400">
                  {selectedTrack.recordTime}
                </div>
              </div>
            </div>
          </div>

          {/* Circuit Progress Bar Indicator */}
          <div className="relative z-10 my-2">
            <div className="flex justify-between text-[10px] font-mono uppercase text-neutral-400 mb-1">
              <span>START // GRID</span>
              <span className="text-amber-400 font-bold">
                SECTOR: {progressDistanceKm.toFixed(2)} / {selectedTrack.distanceKm} KM ({progressPercent.toFixed(0)}%)
              </span>
              <span>CHECKERED FLAG</span>
            </div>
            <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-white/10 relative">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 rounded-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Center Stage: Vehicle Cockpit Sighting & Action Prompts */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none">
            {/* Speedometer Center Readout */}
            <div className="text-center">
              <div className="text-8xl sm:text-9xl lg:text-[10rem] font-black font-syne tracking-tighter text-white leading-none drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]">
                {Math.round(speedKmh)}
              </div>
              <div className="flex items-center justify-center gap-3 text-sm sm:text-base font-mono uppercase tracking-widest text-neutral-400 mt-2">
                <span className="text-amber-400 font-bold">KM / H</span>
                <span>•</span>
                <span>{Math.round(speedKmh * 0.621371)} MPH</span>
                {boostPsi > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{boostPsi} PSI BOOST</span>
                  </>
                )}
              </div>
            </div>

            {/* Over-rev Shift Indicator */}
            {rpmPercent > 88 && (
              <div className="mt-4 px-6 py-2 rounded-full bg-red-600/90 text-white font-mono font-black text-xs uppercase tracking-widest animate-bounce shadow-[0_0_30px_rgba(239,68,68,0.8)]">
                ▲ UPSHIFT NOW [KEY: E] ▲
              </div>
            )}
          </div>

          {/* Bottom HUD: Professional Motorsport Telemetry Deck */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl">
            {/* Left: Gear Indicator */}
            <div className="md:col-span-3 flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/[0.05] border border-white/15 flex flex-col items-center justify-center shadow-inner">
                <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                  GEAR
                </span>
                <span className="text-4xl sm:text-5xl font-black font-syne text-amber-400 leading-none mt-1">
                  {currentGear}
                </span>
                <span className="text-[9px] font-mono text-neutral-500">MANUAL</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={shiftUp}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-mono font-bold text-white transition-all flex items-center gap-2"
                >
                  <span>UPSHIFT</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] text-amber-400">
                    E
                  </kbd>
                </button>
                <button
                  onClick={shiftDown}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-mono font-bold text-neutral-300 transition-all flex items-center gap-2"
                >
                  <span>DOWNSHIFT</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] text-neutral-400">
                    Q
                  </kbd>
                </button>
              </div>
            </div>

            {/* Center: Tachometer Curve & Shift Lights */}
            <div className="md:col-span-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">
                  RPM: <strong className="text-white font-mono text-sm">{rpm}</strong>
                </span>
                <span className="text-neutral-500">REDLINE: {maxRpm} RPM</span>
              </div>

              {/* Multi-segment Shift Light LED Bar */}
              <div className="grid grid-cols-20 gap-1 h-3">
                {Array.from({ length: 20 }).map((_, i) => {
                  const segPct = (i / 20) * 100;
                  const isLit = rpmPercent >= segPct;
                  let colorClass = 'bg-neutral-800';
                  if (isLit) {
                    if (segPct < 60) colorClass = 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
                    else if (segPct < 85)
                      colorClass = 'bg-amber-400 shadow-[0_0_10px_#fbbf24]';
                    else colorClass = 'bg-red-500 animate-pulse shadow-[0_0_14px_#ef4444]';
                  }
                  return (
                    <div
                      key={i}
                      className={`h-full rounded-sm transition-all duration-75 ${colorClass}`}
                    />
                  );
                })}
              </div>

              {/* Continuous Tachometer Line */}
              <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 transition-all duration-75"
                  style={{ width: `${rpmPercent}%` }}
                />
              </div>

              {/* DRS & Boost Indicators */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setDrsActive((prev) => !prev)}
                  className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-widest border transition-all ${
                    drsActive
                      ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                      : 'bg-white/5 text-neutral-400 border-white/10 hover:border-white/30'
                  }`}
                >
                  DRS WING: {drsActive ? 'DEPLOYED [B]' : 'STOWED [B]'}
                </button>

                <div className="text-[11px] font-mono text-neutral-400">
                  TOP SPEED: <span className="text-white font-bold">{topSpeedRecorded} KM/H</span>
                </div>
              </div>
            </div>

            {/* Right: Pedal Controls (Gas & Brake Buttons for Touch/Mouse) */}
            <div className="md:col-span-3 flex items-center justify-end gap-3">
              <button
                onMouseDown={() => setIsBraking(true)}
                onMouseUp={() => setIsBraking(false)}
                onTouchStart={() => setIsBraking(true)}
                onTouchEnd={() => setIsBraking(false)}
                className={`flex-1 py-4 px-3 rounded-xl border text-center font-mono font-bold text-xs uppercase tracking-wider transition-all select-none ${
                  isBraking
                    ? 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] scale-95'
                    : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <div>BRAKE</div>
                <div className="text-[9px] text-neutral-400">[S / DOWN]</div>
              </button>

              <button
                onMouseDown={() => setThrottle(1.0)}
                onMouseUp={() => setThrottle(0.0)}
                onTouchStart={() => setThrottle(1.0)}
                onTouchEnd={() => setThrottle(0.0)}
                className={`flex-1 py-4 px-3 rounded-xl border text-center font-mono font-black text-xs uppercase tracking-wider transition-all select-none ${
                  throttle > 0.5
                    ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.7)] scale-95'
                    : 'bg-white text-black border-white hover:bg-neutral-200'
                }`}
              >
                <div>THROTTLE</div>
                <div className="text-[9px] text-neutral-700">[SPACE / W]</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* PHASE 4: RACE FINISHED // TELEMETRY RESULTS SCREEN */}
      {/* ------------------------------------------------------------------ */}
      {phase === 'results' && (
        <div className="relative w-full min-h-screen flex flex-col justify-between p-6 sm:p-12 z-20">
          {/* Background Wallpaper */}
          <div className="absolute inset-0 z-0">
            <img
              src={selectedTrack.backgroundImage}
              alt={selectedTrack.name}
              className="w-full h-full object-cover filter brightness-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/50" />
          </div>

          {/* Top Finish Badge */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏁</span>
              <div>
                <div className="text-xs uppercase font-mono tracking-widest text-emerald-400">
                  SESSION CONCLUDED // MISSION SUCCESS
                </div>
                <h2 className="text-3xl sm:text-5xl font-black font-syne text-white tracking-tight">
                  CHECKERED FLAG DEBRIEF
                </h2>
              </div>
            </div>

            <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
              GOLD BEAST CERTIFIED
            </span>
          </div>

          {/* Center Debrief Dashboard */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-8">
            {/* Left: Headline Time and Car */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="text-xs uppercase font-mono tracking-widest text-neutral-400">
                  TOTAL CIRCUIT TIME
                </div>
                <div className="text-6xl sm:text-8xl font-black font-mono text-white tracking-tighter mt-2">
                  {formatTime(elapsedTimeMs)}
                </div>
                <div className="text-sm font-mono text-neutral-400 mt-2">
                  Target record was {selectedTrack.recordTime} ({selectedTrack.recordHolder})
                </div>
              </div>

              {/* Machine Benchmarks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-neutral-400">
                    TOP SPEED HIT
                  </div>
                  <div className="text-3xl font-black font-syne text-amber-400 mt-1">
                    {topSpeedRecorded} <span className="text-xs font-mono text-neutral-400">KM/H</span>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-neutral-400">
                    AVG SPEED
                  </div>
                  <div className="text-3xl font-black font-syne text-white mt-1">
                    {Math.round(
                      (selectedTrack.distanceKm / (elapsedTimeMs / 3600000)) || 0
                    )}{' '}
                    <span className="text-xs font-mono text-neutral-400">KM/H</span>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-neutral-400">
                    MAX POWER EXTRACTED
                  </div>
                  <div className="text-3xl font-black font-syne text-emerald-400 mt-1">
                    {engine.horsePower} <span className="text-xs font-mono text-neutral-400">HP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Vehicle Spec Card */}
            <div className="lg:col-span-5 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="w-full h-48 rounded-xl overflow-hidden mb-4">
                  <img
                    src={media.angles.hero}
                    alt={media.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                  PILOT MACHINE
                </div>
                <h3 className="text-2xl font-black font-syne text-white mt-1">
                  {media.name}
                </h3>
                <p className="text-xs font-editorial text-neutral-400 mt-2">
                  {engine.displacement} {engine.aspiration} • {engine.cylinders} Cylinders • Redline {engine.redlineRpm} RPM
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">ACOUSTIC PROFILE</span>
                <span className="text-amber-400 font-bold uppercase">{config.engineProfile}</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
            <button
              onClick={() => {
                setPhase('select-track');
              }}
              className="px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest text-neutral-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              ← CHANGE TRACK
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('customizer')}
                className="px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest text-neutral-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                CUSTOMIZER TUNING
              </button>
              <button
                onClick={() => onNavigate('sound-lab')}
                className="px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest text-neutral-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                SOUND LAB ACOUSTICS
              </button>
              <button
                onClick={startRaceCountdown}
                className="px-8 py-3 rounded-full bg-white text-black font-black font-syne uppercase tracking-wider text-xs hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all"
              >
                RACE AGAIN ↻
              </button>
              <button
                onClick={() => onNavigate('garage')}
                className="px-8 py-3 rounded-full bg-amber-400 text-black font-black font-syne uppercase tracking-wider text-xs hover:bg-amber-300 transition-all"
              >
                RETURN TO GARAGE →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
