import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Box,
  CheckCircle2,
  ExternalLink,
  X,
  FileCode,
  Layers,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { CarConfigState, CarModelType } from '../types';
import {
  loadModelFromFile,
  buildCadNavPresetModel,
  ImportedModelInstance,
} from '../three/customModelLoader';

interface CadNavModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CarConfigState;
  onModelLoaded: (instance: ImportedModelInstance) => void;
  onResetToDefault: () => void;
  onLoadPreset: () => void;
  onSelectModelType?: (modelType: CarModelType) => void;
  onProcessingChange?: (processing: boolean) => void;
}

export const CadNavModelModal: React.FC<CadNavModelModalProps> = ({
  isOpen,
  onClose,
  config,
  onModelLoaded,
  onResetToDefault,
  onLoadPreset,
  onSelectModelType,
  onProcessingChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    onProcessingChange?.(true);
    setErrorMessage(null);
    try {
      const instance = await loadModelFromFile(file, config);
      onModelLoaded(instance);
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'Failed to load 3D file. Please ensure it is a valid .obj, .gltf, .glb, or .stl model from CadNav.'
      );
    } finally {
      setIsLoading(false);
      onProcessingChange?.(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files: File[] = Array.from(e.dataTransfer.files);
      const targetFile =
        files.find((f: File) => {
          const ext = f.name.split('.').pop()?.toLowerCase();
          return ext === 'obj' || ext === 'gltf' || ext === 'glb' || ext === 'stl';
        }) || files[0];
      await handleFileProcess(targetFile);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      const targetFile =
        files.find((f: File) => {
          const ext = f.name.split('.').pop()?.toLowerCase();
          return ext === 'obj' || ext === 'gltf' || ext === 'glb' || ext === 'stl';
        }) || files[0];
      await handleFileProcess(targetFile);
    }
  };

  return (
    <div
      id="cadnav-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        id="cadnav-model-dialog"
        className="relative w-full max-w-2xl bg-[#070709] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200 max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        {/* Close Button */}
        <button
          id="btn-close-cadnav-modal"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-all border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with CadNav branding and attribution */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black italic tracking-tighter bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                CadNav 3D Car Studio
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                100,000+ Models
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-wide mt-0.5">
              Import & render free 3D models and CAD meshes downloaded from{' '}
              <a
                href="http://www.cadnav.com"
                target="_blank"
                rel="noreferrer noopener"
                className="text-blue-400 hover:underline inline-flex items-center gap-0.5 font-bold"
              >
                cadnav.com <ExternalLink className="w-3 h-3 inline" />
              </a>
            </p>
          </div>
        </div>

        {/* Currently Active Model Card */}
        <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Active 3D Model
              </div>
              <div className="text-base font-black text-white flex items-center gap-2">
                <span>
                  {config.modelType === 'procedural-m4'
                    ? 'BMW M4 Competition Coupé (OEM Standard)'
                    : config.modelType === 'bmw-5series'
                    ? 'BMW 5 Series Twin-Turbo Sedan'
                    : config.modelType === 'sedan-lofted'
                    ? 'Lofted Aerodynamic Sedan'
                    : config.modelType === 'sedan-executive'
                    ? 'Executive Contour Sedan'
                    : config.modelType === 'cadnav-gt3'
                    ? 'CadNav M4 GT3 Racepack (Aero Concept)'
                    : config.importedMeta?.name || 'Custom Imported 3D Model'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {config.importedMeta
                  ? `${config.importedMeta.polygons.toLocaleString()} Polygons • ${config.importedMeta.vertices.toLocaleString()} Vertices • ${config.importedMeta.meshes} Meshes`
                  : config.modelType === 'bmw-5series'
                  ? 'Twin-turbo 380kW executive architecture with signature kidney grilles and modular cabin'
                  : config.modelType === 'sedan-lofted'
                  ? 'Lofted aerodynamic profile shell with flared fenders and tapered greenhouse'
                  : config.modelType === 'sedan-executive'
                  ? 'Beveled contour sedan with horizontal chrome grille slats and beltline trim'
                  : 'Procedural high-polygon geometry with openable body panels'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {config.modelType !== 'procedural-m4' && (
              <button
                id="btn-reset-to-oem"
                onClick={() => {
                  onResetToDefault();
                  onClose();
                }}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESTORE M4 OEM</span>
              </button>
            )}
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div className="space-y-4">
          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
            Import Downloaded CadNav 3D Car Model
          </div>

          <div
            id="cadnav-dropzone"
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-400 bg-blue-500/10 scale-[0.99]'
                : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".obj,.gltf,.glb,.stl"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-300">
              <UploadCloud className="w-7 h-7 text-blue-400" />
            </div>

            <div className="text-base font-bold text-white mb-1">
              {isLoading ? 'Processing & Scaling 3D Model...' : 'Drag & drop CadNav file here'}
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              Drop your extracted <span className="text-white font-mono">.OBJ</span>,{' '}
              <span className="text-white font-mono">.GLTF</span>,{' '}
              <span className="text-white font-mono">.GLB</span>, or{' '}
              <span className="text-white font-mono">.STL</span> file downloaded from CadNav.
            </p>

            <button
              type="button"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs tracking-widest uppercase hover:bg-slate-200 transition-colors shadow-lg inline-flex items-center gap-2"
            >
              <FileCode className="w-4 h-4" />
              <span>SELECT 3D FILE</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preset One-Click CadNav Model Option */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Instant CadNav Preset Model
              </span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                NO UPLOAD REQUIRED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-load-cadnav-gt3"
                onClick={() => {
                  if (onSelectModelType) {
                    onSelectModelType('cadnav-gt3');
                  } else {
                    onLoadPreset();
                  }
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  config.modelType === 'cadnav-gt3'
                    ? 'bg-blue-600/20 border-blue-400 ring-1 ring-blue-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    CadNav M4 GT3 Aero
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                    GT3
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Swan-neck GT wing, widebody race fenders, front aero splitter, centerlock racing wheels.
                </p>
              </button>

              <button
                id="btn-load-oem-m4"
                onClick={() => {
                  if (onSelectModelType) {
                    onSelectModelType('procedural-m4');
                  } else {
                    onResetToDefault();
                  }
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  config.modelType === 'procedural-m4'
                    ? 'bg-blue-600/20 border-blue-400 ring-1 ring-blue-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    BMW M4 Coupé
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                    OEM
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Double kidney grille with Iconic Glow, opening hood, frameless doors, S58 engine bay.
                </p>
              </button>

              <button
                id="btn-load-bmw-5series"
                onClick={() => {
                  onSelectModelType?.('bmw-5series');
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  config.modelType === 'bmw-5series'
                    ? 'bg-blue-600/20 border-blue-400 ring-1 ring-blue-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    BMW 5 Series Sedan
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                    SEDAN
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Twin-turbo 380kW executive sedan, dual kidney grilles, greenhouse cabin, 50:50 weight balance.
                </p>
              </button>

              <button
                id="btn-load-sedan-lofted"
                onClick={() => {
                  onSelectModelType?.('sedan-lofted');
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  config.modelType === 'sedan-lofted'
                    ? 'bg-blue-600/20 border-blue-400 ring-1 ring-blue-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-blue-400" />
                    Lofted Aero Sedan
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                    LOFTED
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Lofted aerodynamic profile shell, flared performance wheel arches, tapered greenhouse glass.
                </p>
              </button>

              <button
                id="btn-load-mustang-gt"
                onClick={() => {
                  onSelectModelType?.('mustang-gt');
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  config.modelType === 'mustang-gt'
                    ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Ford Mustang GT
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    5.0L V8
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Fastback muscle silhouette, shark-nose grille, tri-bar LED lighting, hood heat extractors, quad exhaust.
                </p>
              </button>

              <button
                id="btn-load-gwagon-g63"
                onClick={() => {
                  onSelectModelType?.('gwagon-g63');
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  config.modelType === 'gwagon-g63'
                    ? 'bg-rose-600/20 border-rose-400 ring-1 ring-rose-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-rose-400" />
                    Mercedes-AMG G63
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                    AMG V8
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Boxy SUV silhouette, Panamericana grille, fender turn signals, side-exit dual exhaust, tailgate spare tire.
                </p>
              </button>

              <button
                id="btn-load-ninja-h2r"
                onClick={() => {
                  onSelectModelType?.('ninja-h2r');
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all sm:col-span-2 ${
                  config.modelType === 'ninja-h2r'
                    ? 'bg-emerald-600/20 border-emerald-400 ring-1 ring-emerald-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    Kawasaki Ninja H2R Superbike
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    310 HP SUPERCHARGED
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Aerospace carbon downforce winglets, emerald green trellis frame, planetary supercharger intake, single-sided swingarm & titanium megaphone pipe.
                </p>
              </button>

              <button
                id="btn-load-sedan-executive"
                onClick={() => {
                  onSelectModelType?.('sedan-executive');
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all sm:col-span-2 ${
                  config.modelType === 'sedan-executive'
                    ? 'bg-blue-600/20 border-blue-400 ring-1 ring-blue-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    Executive Contour Sedan
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                    EXECUTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Beveled edge profile, horizontal chrome slats, high beltline chrome trim, executive luxury stance.
                </p>
              </button>
            </div>
          </div>

          {/* CadNav Official License & Compliance Info */}
          <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>CadNav Licensing & Terms</span>
              <a
                href="http://www.cadnav.com/3d-models/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                Browse CadNav Free 3D Models <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="leading-relaxed">
              In compliance with CadNav.com terms: 3D models and textures are free for use as part of artworks
              or applications with attribution. Free 3D Models library provided by{' '}
              <span className="text-slate-300 font-semibold">cadnav.com</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
