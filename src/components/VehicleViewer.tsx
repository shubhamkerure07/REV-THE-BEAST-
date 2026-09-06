import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
  Sparkles,
  Layers,
  Sun,
  Moon,
  Compass,
  Cpu,
} from 'lucide-react';
import { CarConfigState, CameraPreset, ViewModeType } from '../types';
import { getVehicleMedia, VehiclePhotoAngle, VehicleVideoReel } from '../data/vehicleMedia';
import { engineSound } from '../utils/audio';
import { UniqueBackground } from './UniqueBackground';
import { EngineRevMachine3D } from './EngineRevMachine3D';

interface VehicleViewerProps {
  config: CarConfigState;
  onChangeConfig: (updater: (prev: CarConfigState) => CarConfigState) => void;
  onOpenSpecs: () => void;
  showToast: (msg: string) => void;
}

export const VehicleViewer: React.FC<VehicleViewerProps> = ({
  config,
  onChangeConfig,
  onOpenSpecs,
  showToast,
}) => {
  const media = getVehicleMedia(config.modelType);
  const currentAngleKey = config.cameraPreset || 'hero';
  const currentPhoto: VehiclePhotoAngle =
    media.photos[currentAngleKey] || media.photos.hero;

  const [activeTab, setActiveTab] = useState<ViewModeType>(config.viewMode || 'photos');
  const [activeVideoIdx, setActiveVideoIdx] = useState<number>(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(true);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [isFlameActive, setIsFlameActive] = useState<boolean>(false);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync tab with config if updated externally
  useEffect(() => {
    if (config.viewMode && config.viewMode !== activeTab) {
      setActiveTab(config.viewMode);
    }
  }, [config.viewMode]);

  // When model changes, reset image load state
  useEffect(() => {
    setImgLoaded(false);
  }, [config.modelType, config.cameraPreset]);

  // Listen for exhaust sound burble to trigger flame VFX
  const triggerFlameVFX = () => {
    setIsFlameActive(true);
    setTimeout(() => {
      setIsFlameActive(false);
    }, 450);
  };

  // Listen for exhaust sound events to trigger flame VFX automatically
  useEffect(() => {
    const unsub = engineSound.subscribeExhaustEvent(() => {
      triggerFlameVFX();
    });
    return unsub;
  }, []);

  const handleAngleSelect = (preset: CameraPreset) => {
    onChangeConfig((prev) => ({ ...prev, cameraPreset: preset, viewMode: 'photos' }));
    setActiveTab('photos');
  };

  const handleHotspotClick = (action: string) => {
    if (action === 'exhaust') {
      engineSound.triggerExhaustBackfire();
      triggerFlameVFX();
      showToast('Exhaust detonation backfire! Unburnt fuel ignition triggered.');
    } else if (action === 'engine') {
      handleAngleSelect('front');
      showToast(`Viewing ${media.keySpecs.engine}`);
    } else if (action === 'interior') {
      handleAngleSelect('interior');
      showToast('Viewing Cockpit & Driver Instrument Cluster');
    } else if (action === 'wheel') {
      handleAngleSelect('hero');
      showToast('Viewing High-Performance Alloy Wheels & Brake Calipers');
    } else if (action === 'lights') {
      onChangeConfig((prev) => ({ ...prev, lightsOn: !prev.lightsOn }));
      showToast(config.lightsOn ? 'Laserlight optics dimmed' : 'Laserlight optics engaged');
    }
  };

  // Streamlined authentic photo angles ("use less but their actual photo")
  const ANGLE_PILLS: Array<{ id: CameraPreset; label: string }> = [
    { id: 'hero', label: '3/4 Stance' },
    { id: 'front', label: 'Front Fascia' },
    { id: 'rear', label: 'Rear & Exhaust' },
    { id: 'interior', label: 'Cockpit' },
  ];

  // Paint filter styles based on selected color and finish
  const getPaintOverlayStyle = () => {
    // Only apply tint overlay to exterior angles
    if (['interior', 'engine', 'wheel'].includes(currentAngleKey)) {
      return null;
    }

    const hex = config.paintColor;
    const finish = config.paintFinish;

    let opacity = 0.22;
    let blendMode: React.CSSProperties['mixBlendMode'] = 'color';

    if (finish === 'metallic') {
      opacity = 0.28;
      blendMode = 'color-burn';
    } else if (finish === 'matte') {
      opacity = 0.26;
      blendMode = 'soft-light';
    } else if (finish === 'frozen') {
      opacity = 0.32;
      blendMode = 'hard-light';
    } else {
      // gloss
      opacity = 0.24;
      blendMode = 'color';
    }

    return {
      backgroundColor: hex,
      opacity,
      mixBlendMode: blendMode,
    };
  };

  return (
    <div
      id="vehicle-studio-viewer"
      className="relative w-full h-full bg-neutral-950 flex flex-col justify-center items-center select-none overflow-hidden"
    >
      {/* Dynamic Background Atmosphere / Studio Lighting */}
      <UniqueBackground environment={config.environment} isDriving={config.isDriving} />

      {/* Grid Floor Graphic */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40 z-0" />

      {/* Main Showcase Stage */}
      <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center p-2 sm:p-6 pb-20 pt-16 z-10">
        {activeTab === '3d-rev-machine' ? (
          /* ================= 3D REV MACHINE ENGINE MODE ================= */
          <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center rounded-3xl overflow-hidden bg-black/60 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] backdrop-blur-md">
            <EngineRevMachine3D modelType={config.modelType} valveMode={config.valveMode} />
          </div>
        ) : activeTab === 'photos' ? (
          /* ================= PHOTO GALLERY MODE ================= */
          <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl backdrop-blur-sm group">
            {/* Driving Motion Simulation (Road Blur) */}
            {config.isDriving && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10 animate-pulse">
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-rose-600/80 backdrop-blur-md text-white font-mono text-xs font-bold tracking-widest flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>SIMULATED HIGH-SPEED ROAD DYNAMICS ACTIVE</span>
                </div>
              </div>
            )}

            {/* Vehicle Photo Container */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {/* High-Resolution Main Vehicle Photograph */}
              <img
                id="vehicle-main-photo"
                src={currentPhoto.url}
                alt={`${media.name} - ${currentPhoto.title}`}
                onLoad={() => setImgLoaded(true)}
                className={`w-full h-full object-cover sm:object-contain transition-all duration-500 transform ${
                  config.isDriving ? 'scale-105 animate-pulse' : 'scale-100'
                } ${imgLoaded ? 'opacity-100 filter-none' : 'opacity-0 scale-95 blur-sm'}`}
              />

              {/* Dynamic Paint Color Glaze Filter */}
              {getPaintOverlayStyle() && (
                <div
                  id="vehicle-paint-glaze"
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={getPaintOverlayStyle()!}
                />
              )}

              {/* Headlight Illumination Beam Effect */}
              {config.lightsOn && ['hero', 'front'].includes(currentAngleKey) && (
                <div
                  id="headlight-beam-vfx"
                  className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-cyan-400/10 to-white/20 mix-blend-screen opacity-75 animate-pulse"
                />
              )}

              {/* Rear Exhaust Flame VFX */}
              {(isFlameActive || (config.exhaustSound && config.isDriving)) && (
                <div
                  id="exhaust-flame-burst"
                  className="absolute bottom-16 right-1/4 pointer-events-none z-20 flex items-center gap-1 animate-bounce"
                >
                  <div className="w-12 h-6 bg-gradient-to-r from-blue-400 via-amber-400 to-rose-600 rounded-full blur-md opacity-90 scale-125" />
                  <Flame className="w-8 h-8 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-ping" />
                </div>
              )}

              {/* Interactive Visual Hotspots */}
              {showHotspots &&
                currentPhoto.hotspots?.map((spot) => (
                  <button
                    key={spot.id}
                    id={`hotspot-${spot.id}`}
                    onClick={() => handleHotspotClick(spot.action)}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/spot flex items-center gap-2 pointer-events-auto cursor-pointer"
                    title={spot.label}
                  >
                    <span className="relative flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-white/90 text-black items-center justify-center font-bold text-[10px] shadow-lg border border-black/20">
                        +
                      </span>
                    </span>
                    <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover/spot:opacity-100 transition-opacity">
                      {spot.label}
                    </span>
                  </button>
                ))}
            </div>

            {/* Photo Caption Overlay (Centered Bottom, Discreet) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-center pointer-events-none shadow-xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: media.accentHex }} />
                <span className="text-[10px] uppercase font-bold tracking-widest text-white font-mono">
                  {currentPhoto.title}
                </span>
              </div>
              <span className="text-white/20 text-xs">•</span>
              <div className="text-xs text-slate-300 font-medium">{currentPhoto.subtitle}</div>
            </div>

            {/* Hotspot Toggle Button (Top Left of Viewer) */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <button
                id="btn-toggle-hotspots"
                onClick={() => setShowHotspots(!showHotspots)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border flex items-center gap-1.5 ${
                  showHotspots
                    ? 'bg-white/20 border-white/30 text-white shadow-md'
                    : 'bg-black/50 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showHotspots ? 'HOTSPOTS ON' : 'HOTSPOTS OFF'}</span>
              </button>

              <button
                id="btn-headlights-toggle"
                onClick={() => onChangeConfig((prev) => ({ ...prev, lightsOn: !prev.lightsOn }))}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border flex items-center gap-1.5 ${
                  config.lightsOn
                    ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                    : 'bg-black/50 border-white/10 text-slate-400 hover:text-white'
                }`}
                title="Toggle Headlight Beam Optics"
              >
                {config.lightsOn ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{config.lightsOn ? 'LIGHTS ON' : 'LIGHTS OFF'}</span>
              </button>
            </div>

            {/* Quick Navigation Arrows */}
            <button
              id="btn-angle-prev"
              onClick={() => {
                const keys = ANGLE_PILLS.map((p) => p.id);
                const currentIdx = keys.indexOf(currentAngleKey);
                const prevIdx = (currentIdx - 1 + keys.length) % keys.length;
                handleAngleSelect(keys[prevIdx]);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/15 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20"
              title="Previous Angle"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              id="btn-angle-next"
              onClick={() => {
                const keys = ANGLE_PILLS.map((p) => p.id);
                const currentIdx = keys.indexOf(currentAngleKey);
                const nextIdx = (currentIdx + 1) % keys.length;
                handleAngleSelect(keys[nextIdx]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/15 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20"
              title="Next Angle"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* ================= CINEMATIC VIDEO REEL MODE ================= */
          <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center rounded-3xl overflow-hidden bg-black border border-white/15 shadow-2xl">
            <video
              ref={videoRef}
              src={media.videos[activeVideoIdx]?.videoUrl || media.videos[0]?.videoUrl}
              poster={media.videos[activeVideoIdx]?.posterUrl || media.videos[0]?.posterUrl}
              autoPlay
              loop
              muted={isVideoMuted}
              playsInline
              className="w-full h-full object-cover"
              onPlay={() => setIsPlayingVideo(true)}
              onPause={() => setIsPlayingVideo(false)}
            />

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Top Video Header */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>CINEMATIC TRACK ACTION REEL</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {media.videos[activeVideoIdx]?.title || 'Vehicle Acceleration & Exhaust Sounds'}
                </div>
              </div>

              {/* Video Selector Tabs */}
              {media.videos.length > 1 && (
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
                  {media.videos.map((vid, idx) => (
                    <button
                      key={vid.id}
                      onClick={() => setActiveVideoIdx(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeVideoIdx === idx
                          ? 'bg-rose-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Clip {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Video Controls */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  id="btn-play-pause-video"
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPlayingVideo) {
                        videoRef.current.pause();
                      } else {
                        videoRef.current.play();
                      }
                    }
                  }}
                  className="p-2.5 rounded-full bg-white text-black hover:bg-slate-200 transition-all shadow-lg"
                >
                  {isPlayingVideo ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
                </button>

                <button
                  id="btn-mute-video"
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/15 transition-all"
                >
                  {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-xs font-mono text-slate-300 bg-black/50 px-3 py-1.5 rounded-full border border-white/10">
                {media.videos[activeVideoIdx]?.duration || '0:30'} REEL
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Angle / Media Switcher Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-full bg-black/70 backdrop-blur-xl border border-white/10 shadow-2xl max-w-[95vw] overflow-x-auto">
        {/* Photos vs Video vs 3D Rev Machine Tab Toggle */}
        <div className="flex items-center gap-1 border-r border-white/15 pr-2 mr-1 shrink-0">
          <button
            id="tab-view-photos"
            onClick={() => {
              setActiveTab('photos');
              onChangeConfig((prev) => ({ ...prev, viewMode: 'photos' }));
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'photos'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>PHOTOS</span>
          </button>

          <button
            id="tab-view-video"
            onClick={() => {
              setActiveTab('video');
              onChangeConfig((prev) => ({ ...prev, viewMode: 'video' }));
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'video'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>VIDEO REEL</span>
          </button>

          <button
            id="tab-view-3d-rev-machine"
            onClick={() => {
              setActiveTab('3d-rev-machine');
              onChangeConfig((prev) => ({ ...prev, viewMode: '3d-rev-machine' }));
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === '3d-rev-machine'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>3D REV MACHINE</span>
          </button>
        </div>

        {/* Angle Buttons (Visible in Photos mode) */}
        {activeTab === 'photos' && (
          <div className="flex items-center gap-1 shrink-0">
            {ANGLE_PILLS.map((angle) => {
              const isSelected = currentAngleKey === angle.id;
              return (
                <button
                  key={angle.id}
                  id={`btn-angle-${angle.id}`}
                  onClick={() => handleAngleSelect(angle.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-white/20 text-white ring-1 ring-white/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {angle.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
