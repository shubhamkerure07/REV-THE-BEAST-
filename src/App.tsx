import React, { useState, useEffect } from 'react';
import {
  CarConfigState,
  CarModelType,
  ExhaustStyle,
  ExhaustMaterial,
  PaintFinish,
} from './types';
import { EditorialHeader, AppView } from './components/EditorialHeader';
import { EditorialHero } from './components/EditorialHero';
import { EditorialStoryScroll } from './components/EditorialStoryScroll';
import { EditorialGarage } from './components/EditorialGarage';
import { EditorialCarDetail } from './components/EditorialCarDetail';
import { EditorialCustomizer } from './components/EditorialCustomizer';
import { EditorialSoundLab } from './components/EditorialSoundLab';
import { EditorialAiLab } from './components/EditorialAiLab';
import { EditorialRacing } from './components/EditorialRacing';
import { AudioMixerModal } from './components/AudioMixerModal';
import { getVehicleMedia } from './data/vehicleMedia';
import { getEngineForModel } from './data/engines';
import { engineSound } from './utils/audio';

const INITIAL_CONFIG: CarConfigState = {
  modelType: 'lambo-aventador',
  viewMode: '3d-car',
  paintColor: '#f77f21',
  paintName: 'Arancio Atlas',
  paintFinish: 'metallic' as PaintFinish,
  carbonFiberRoof: true,
  windowTint: 0.65,
  lightsOn: true,
  haloGlowColor: '#ffffff',
  wheels: {
    rimColor: '#1f2937',
    rimStyle: 'double-spoke',
    caliperColor: '#ef4444',
    tireType: 'michelin-pilot',
  },
  aero: {
    carbonPackage: true,
    spoilerStyle: 'gt-wing',
    frontSplitter: true,
    rearDiffuserFins: true,
  },
  exhaustConfig: {
    style: 'quad' as ExhaustStyle,
    material: 'titanium' as ExhaustMaterial,
  },
  openParts: {
    leftDoor: false,
    rightDoor: false,
    hood: false,
    trunk: false,
  },
  environment: 'race-track',
  cameraPreset: 'hero',
  autoRotate: false,
  rotateSpeed: 1.2,
  isDriving: false,
  driveSpeed: 1.0,
  exhaustSound: false,
  valveMode: 'sport',
  engineProfile: 'coyote-v8',
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [config, setConfig] = useState<CarConfigState>(INITIAL_CONFIG);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [isMixerOpen, setIsMixerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Synchronize engine acoustic profile on vehicle change
  const handleSelectCar = (modelType: CarModelType) => {
    const engine = getEngineForModel(modelType);
    setConfig((prev) => ({
      ...prev,
      modelType,
      engineProfile: engine.soundProfile,
    }));
    engineSound.setProfile(engine.soundProfile);
    const media = getVehicleMedia(modelType);
    showToast(`ACTIVE MACHINE: ${media.name.toUpperCase()}`);
  };

  // Audio Toggle
  const handleToggleAudio = () => {
    if (isAudioActive) {
      engineSound.stop();
      setIsAudioActive(false);
      showToast('AUDIO SYSTEM: OFF');
    } else {
      engineSound.start();
      engineSound.setThrottle(0.1);
      setIsAudioActive(true);
      showToast('AUDIO SYSTEM: ONLINE (ACOUSTIC ENGINE SYNTHESIS)');
    }
  };

  // Quick blip rev from hero
  const handleQuickRev = () => {
    engineSound.start();
    setIsAudioActive(true);
    engineSound.triggerThrottleBlip();
    showToast('THROTTLE REV // TRANSIENT BLIP');
  };

  // Scroll to Story in Home View
  const handleScrollToStory = () => {
    const target = document.getElementById('story-scroll-container');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMixerOpen((prev) => !prev);
      } else if (e.key === 'g' || e.key === 'G') {
        if (currentView !== 'racing') {
          e.preventDefault();
          setCurrentView('garage');
          showToast('VIEW: GARAGE');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  return (
    <div
      id="app-root"
      className="relative w-full min-h-screen bg-[#08080a] text-white overflow-x-hidden font-sans select-none"
    >
      {/* 1. Universal Editorial Navigation Header */}
      <EditorialHeader
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedCar={config.modelType}
        isAudioActive={isAudioActive}
        onToggleAudio={handleToggleAudio}
        onOpenMixer={() => setIsMixerOpen(true)}
      />

      {/* 2. Primary Dynamic View Content */}
      <main className="w-full min-h-screen">
        {/* VIEW A: HOME EDITORIAL EXPERIENCE (Hero + Story Scroll) */}
        {currentView === 'home' && (
          <div className="w-full animate-fade-in">
            <EditorialHero
              selectedCar={config.modelType}
              onEnterGarage={() => {
                setCurrentView('garage');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExploreCars={() => {
                setCurrentView('car-detail');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onScrollToStory={handleScrollToStory}
              onQuickRev={handleQuickRev}
            />
            <EditorialStoryScroll
              selectedCar={config.modelType}
              onOpenGarage={() => {
                setCurrentView('garage');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenSoundLab={() => {
                setCurrentView('sound-lab');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAiLab={() => {
                setCurrentView('ai-lab');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenRacing={() => {
                setCurrentView('racing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCarDetail={() => {
                setCurrentView('car-detail');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* VIEW B: EDITORIAL GARAGE */}
        {currentView === 'garage' && (
          <div className="w-full pt-20 animate-fade-in">
            <EditorialGarage
              selectedCar={config.modelType}
              onSelectCar={(model) => {
                handleSelectCar(model);
              }}
              onViewStory={(model) => {
                handleSelectCar(model);
                setCurrentView('car-detail');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onCustomize={(model) => {
                handleSelectCar(model);
                setCurrentView('customizer');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onRace={(model) => {
                handleSelectCar(model);
                setCurrentView('racing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenSoundLab={(model) => {
                handleSelectCar(model);
                setCurrentView('sound-lab');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* VIEW C: CAR DETAIL (9-Angle Photography Gallery & Monograph) */}
        {currentView === 'car-detail' && (
          <div className="w-full pt-20 animate-fade-in">
            <EditorialCarDetail
              modelType={config.modelType}
              onBack={() => {
                setCurrentView('garage');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onCustomize={(model) => {
                handleSelectCar(model);
                setCurrentView('customizer');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onRace={(model) => {
                handleSelectCar(model);
                setCurrentView('racing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenSoundLab={(model) => {
                handleSelectCar(model);
                setCurrentView('sound-lab');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* VIEW D: EDITORIAL CUSTOMIZER */}
        {currentView === 'customizer' && (
          <div className="w-full pt-20 animate-fade-in">
            <EditorialCustomizer
              config={config}
              onChangeConfig={setConfig}
              onBack={() => {
                setCurrentView('garage');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onRace={(model) => {
                handleSelectCar(model);
                setCurrentView('racing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              showToast={showToast}
            />
          </div>
        )}

        {/* VIEW E: SIGNATURE SOUND LAB */}
        {currentView === 'sound-lab' && (
          <div className="w-full pt-20 animate-fade-in">
            <EditorialSoundLab
              selectedCar={config.modelType}
              onSelectCar={(model) => {
                handleSelectCar(model);
              }}
              onBack={() => {
                setCurrentView('garage');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              showToast={showToast}
            />
          </div>
        )}

        {/* VIEW F: BEAST AI LAB */}
        {currentView === 'ai-lab' && (
          <div className="w-full pt-20 animate-fade-in">
            <EditorialAiLab
              onBack={() => {
                setCurrentView('garage');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDeployToGarage={(newCar) => {
                handleSelectCar(newCar.modelType);
                setConfig((prev) => ({
                  ...prev,
                  paintColor: newCar.paintColor,
                  exhaustConfig: {
                    style: newCar.exhaustStyle,
                    material: newCar.exhaustMaterial,
                  },
                }));
                setCurrentView('garage');
                showToast(`DEPLOYED ${newCar.name.toUpperCase()} TO GARAGE`);
              }}
              onRace={(model) => {
                handleSelectCar(model);
                setCurrentView('racing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              showToast={showToast}
            />
          </div>
        )}

        {/* VIEW G: CIRCUIT RACING SIMULATION */}
        {currentView === 'racing' && (
          <div className="w-full pt-20 animate-fade-in">
            <EditorialRacing
              config={config}
              onNavigate={(view) => {
                setCurrentView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              showToast={showToast}
            />
          </div>
        )}
      </main>

      {/* 3. Global Master Audio Mixer Modal */}
      <AudioMixerModal
        isOpen={isMixerOpen}
        onClose={() => setIsMixerOpen(false)}
        showToast={showToast}
      />

      {/* 4. Global High-Contrast Sleek Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-neutral-900/95 border border-white/20 text-white rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center gap-3 backdrop-blur-md animate-fade-in text-xs font-mono uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
