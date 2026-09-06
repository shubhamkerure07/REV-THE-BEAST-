import React, { useState, useEffect } from 'react';
import { CarConfigState, CameraPreset, CarModelType, RealSpeedCalculation } from './types';
import { VehicleViewer } from './components/VehicleViewer';
import { Header } from './components/Header';
import { ConfiguratorPanel } from './components/ConfiguratorPanel';
import { VehicleGarageDrawer } from './components/VehicleGarageDrawer';
import { EngineRevOverlay } from './components/EngineRevOverlay';
import { DynoGraphHUD } from './components/DynoGraphHUD';
import { VehicleDetailsBar } from './components/VehicleDetailsBar';
import { EasyKeyboardGuide } from './components/EasyKeyboardGuide';
import { SpecsModal } from './components/SpecsModal';
import { getVehicleMedia } from './data/vehicleMedia';
import { getEngineForModel } from './data/engines';
import { Eye, EyeOff } from 'lucide-react';

const INITIAL_CONFIG: CarConfigState = {
  modelType: 'procedural-m4',
  viewMode: 'photos',
  paintColor: '#0a442e', // Isle of Man Green
  paintName: 'Isle of Man Green',
  paintFinish: 'metallic',
  carbonFiberRoof: true,
  windowTint: 0.65,
  lightsOn: true,
  haloGlowColor: '#ffffff',
  wheels: {
    rimColor: '#b0b5be',
    rimStyle: 'double-spoke',
    caliperColor: '#0066b1', // Motorsport Blue
    tireType: 'michelin-pilot',
  },
  aero: {
    carbonPackage: true,
    spoilerStyle: 'lip',
    frontSplitter: true,
    rearDiffuserFins: true,
  },
  openParts: {
    leftDoor: false,
    rightDoor: false,
    hood: false,
    trunk: false,
  },
  environment: 'showroom',
  cameraPreset: 'hero',
  autoRotate: false,
  rotateSpeed: 1.2,
  isDriving: false,
  driveSpeed: 1.0,
  exhaustSound: false,
  valveMode: 'sport',
  engineProfile: 's58-inline6',
};

export default function App() {
  const [config, setConfig] = useState<CarConfigState>(INITIAL_CONFIG);
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [isGarageOpen, setIsGarageOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Engine & Mechanical Telemetry State
  const [liveRpm, setLiveRpm] = useState<number>(0);
  const [liveMechanics, setLiveMechanics] = useState<RealSpeedCalculation | null>(null);

  // Master Screen Visibility Mode: allows users to hide all HUD overlays for clean viewing
  const [isCleanScreenMode, setIsCleanScreenMode] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSelectModelType = (modelType: CarModelType) => {
    const engine = getEngineForModel(modelType);
    setConfig((prev) => ({
      ...prev,
      modelType,
      engineProfile: engine.soundProfile,
      cameraPreset: 'hero',
    }));
    const media = getVehicleMedia(modelType);
    showToast(`Switched to ${media.name} (${media.keySpecs.engine})`);
  };

  // Keyboard shortcut for toggling clean screen mode (H key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setIsCleanScreenMode((prev) => {
          const nextVal = !prev;
          showToast(nextVal ? 'Clean Screen Mode: HUD hidden (Press H to restore)' : 'HUD Visible: All gauges active');
          return nextVal;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTakeScreenshot = () => {
    const media = getVehicleMedia(config.modelType);
    const photo = media.photos[config.cameraPreset || 'hero'] || media.photos.hero;

    // Trigger instant download of the current high-res media photo
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `${config.modelType}_${config.cameraPreset || 'hero'}.jpg`;
    link.target = '_blank';
    link.rel = 'noreferrer noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Captured high-definition studio snapshot of ${media.name}!`);
  };

  const activeEngine = getEngineForModel(config.modelType);

  return (
    <div id="app-container" className="relative w-screen h-screen bg-neutral-950 overflow-hidden font-sans">
      {/* High-Performance Photo, Video Reel & 3D Rev Machine Showcase */}
      <VehicleViewer
        config={config}
        onChangeConfig={setConfig}
        onOpenSpecs={() => setIsSpecsOpen(true)}
        showToast={showToast}
      />

      {/* Top Header */}
      <Header
        config={config}
        onChangeConfig={setConfig}
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onTakeScreenshot={handleTakeScreenshot}
        onSelectModelType={handleSelectModelType}
      />

      {/* Clean Screen Visibility Floating Toggle Button */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <button
          id="btn-toggle-clean-screen"
          onClick={() => {
            setIsCleanScreenMode(!isCleanScreenMode);
            showToast(!isCleanScreenMode ? 'Clean Screen Mode: HUD hidden (Press H to restore)' : 'HUD Restored');
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider border shadow-xl backdrop-blur-xl transition-all cursor-pointer ${
            isCleanScreenMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30'
              : 'bg-black/60 text-slate-300 hover:text-white border-white/15 hover:border-white/30'
          }`}
          title="Toggle Clean Screen Mode (Hide all HUD overlays for unobstructed car viewing, or press H)"
        >
          {isCleanScreenMode ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
          <span>{isCleanScreenMode ? 'RESTORE HUD (H)' : 'CLEAN SCREEN (H)'}</span>
        </button>
      </div>

      {/* Dedicated Left-Side Vehicle Fleet Vault Drawer */}
      <VehicleGarageDrawer
        currentModel={config.modelType}
        onSelectModel={(model) => {
          handleSelectModelType(model);
        }}
        isOpen={isGarageOpen}
        onToggle={() => setIsGarageOpen(!isGarageOpen)}
      />

      {/* Right-Side Configurator Studio Drawer (Paint, Engine, Wheels, Studio) */}
      <ConfiguratorPanel
        config={config}
        onChangeConfig={setConfig}
        onSelectModelType={handleSelectModelType}
      />

      {/* ========================================================================= */}
      {/* FLOATING, COLLAPSIBLE HUD COMPONENTS (Hidden when Clean Screen is active) */}
      {/* ========================================================================= */}
      {!isCleanScreenMode && (
        <>
          {/* Top-Left: Vehicle Technical Details & Specs Bar */}
          <VehicleDetailsBar
            modelType={config.modelType}
            onOpenSpecsModal={() => setIsSpecsOpen(true)}
            gForce={liveMechanics?.gForceLongitudinal || 0}
            dragNewtons={liveMechanics?.dragForceNewtons || 0}
          />

          {/* Top-Right: Relocated Dyno Power & Torque Graph HUD */}
          <DynoGraphHUD
            engine={activeEngine}
            currentRpm={liveRpm}
            isSoundActive={config.exhaustSound}
            onToggleSound={() =>
              setConfig((prev) => ({ ...prev, exhaustSound: !prev.exhaustSound }))
            }
          />

          {/* Bottom-Left: Refactored Collapsible Digital Cockpit & Engine State Hub */}
          <EngineRevOverlay
            isSoundActive={config.exhaustSound}
            isDriving={config.isDriving}
            modelType={config.modelType}
            engineProfile={config.engineProfile}
            valveMode={config.valveMode}
            onToggleSound={() =>
              setConfig((prev) => ({ ...prev, exhaustSound: !prev.exhaustSound }))
            }
            onSelectEngineProfile={(profile) =>
              setConfig((prev) => ({ ...prev, engineProfile: profile }))
            }
            onSelectValveMode={(mode) =>
              setConfig((prev) => ({ ...prev, valveMode: mode }))
            }
            onRpmChange={(rpm) => setLiveRpm(rpm)}
            onMechanicsChange={(mech) => setLiveMechanics(mech)}
          />

          {/* Bottom-Right: Collapsible Easy Keyboard Shortcuts Guide */}
          <EasyKeyboardGuide />
        </>
      )}

      {/* Technical Specs Modal */}
      <SpecsModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
        modelType={config.modelType}
      />

      {/* Notifications Toast */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-black/90 text-white border border-white/20 backdrop-blur-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
