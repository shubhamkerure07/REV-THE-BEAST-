import React from 'react';
import { StudioEnvironment } from '../types';

interface UniqueBackgroundProps {
  environment: StudioEnvironment;
  lightsOn: boolean;
  isRevving?: boolean;
  rpmRatio?: number;
}

export const UniqueBackground: React.FC<UniqueBackgroundProps> = ({
  environment,
  lightsOn,
  isRevving = false,
  rpmRatio = 0,
}) => {
  const getBackgroundContent = () => {
    switch (environment) {
      case 'city':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Metropolis City Skyline & Street Traffic Lights */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#060814] via-[#0d1224] to-[#04060d]" />
            {/* Distant High-Rise Building Silhouette Glow */}
            <div className="absolute bottom-28 left-0 right-0 h-96 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700/30 via-indigo-950/20 to-transparent" />
            {/* Urban Streetlamp & Traffic Light Glows */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-50" />
            {/* Wet Downtown Asphalt with Traffic Reflections */}
            <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#020308] via-indigo-950/20 to-transparent border-b border-indigo-500/20">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f60a_1px,transparent_1px),linear-gradient(to_bottom,#3b82f60a_1px,transparent_1px)] bg-[size:3.5rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,#000_70%,transparent_100%)]" />
            </div>
            {/* Red & Amber Passing Tail-light streaks */}
            <div className="absolute bottom-20 left-0 right-0 flex justify-between px-10 opacity-30">
              <div className="w-72 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent blur-sm animate-pulse" />
              <div className="w-80 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-sm animate-pulse" />
            </div>
          </div>
        );

      case 'race-track':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Grand Prix Race Circuit Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0e0712] via-[#140b1a] to-[#050406]" />
            {/* Circuit Floodlights Glow */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-amber-500/15 via-purple-600/10 to-transparent blur-2xl" />
            {/* Apex Racing Kerbs (Red & White FIA Stripes) */}
            <div className="absolute bottom-0 left-0 right-0 h-5 bg-[repeating-linear-gradient(90deg,#ef4444_0,#ef4444_50px,#ffffff_50px,#ffffff_100px)] opacity-40 shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
            {/* Asphalt Track Surface Texture */}
            <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black via-rose-950/15 to-transparent border-t border-white/10" />
            {/* Pit Wall & Grandstand Horizon Silhouette */}
            <div className="absolute bottom-36 left-0 right-0 h-24 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-md" />
          </div>
        );

      case 'tokyo-highway':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Tokyo Midnight Rain & Neon Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#0b0f19] to-[#020617]" />
            {/* Distant Cyberpunk Skyline Silhouette */}
            <div className="absolute bottom-0 left-0 right-0 h-96 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/40 via-purple-950/20 to-transparent" />
            
            {/* Overhead Highway Light Streaks */}
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent" />
            <div
              className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-3xl transition-opacity duration-700 ${
                lightsOn ? 'opacity-40 bg-cyan-400/20' : 'opacity-15 bg-cyan-500/10'
              }`}
            />
            {/* Wet Asphalt Reflection Lines */}
            <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-black via-cyan-950/20 to-transparent border-b border-cyan-500/20">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:4rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,#000_70%,transparent_100%)]" />
            </div>

            {/* Passing neon speed trails */}
            <div
              className={`absolute bottom-24 left-10 w-96 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1px] transition-all duration-300 ${
                isRevving ? 'opacity-80 scale-x-125' : 'opacity-20'
              }`}
            />
            <div
              className={`absolute bottom-28 right-12 w-80 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent blur-[1px] transition-all duration-300 ${
                isRevving ? 'opacity-80 scale-x-125' : 'opacity-20'
              }`}
            />
          </div>
        );

      case 'monaco-tunnel':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* F1 Grand Prix Tunnel Vault */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#090a0f] via-[#0f111a] to-[#050608]" />
            {/* Tunnel Arch Lights */}
            <div className="absolute top-0 left-0 right-0 flex justify-around opacity-40">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-24 h-48 bg-gradient-to-b from-amber-400/30 to-transparent blur-xl"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            {/* Glowing Marina Harbor Ambience */}
            <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#050608] via-amber-950/20 to-transparent" />
            {/* Racing Kerbs Red & White Subtle Edge */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(90deg,#ef4444_0,#ef4444_40px,#ffffff_40px,#ffffff_80px)] opacity-25 [mask-image:linear-gradient(to_top,black,transparent)]" />
          </div>
        );

      case 'nurburgring-dusk':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Golden Amber Sunset over Eifel Mountains */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#180e07] via-[#100b0d] to-[#040405]" />
            {/* Sunset Horizon Glow */}
            <div className="absolute top-1/3 left-0 right-0 h-64 bg-gradient-to-t from-transparent via-amber-600/15 to-transparent blur-3xl" />
            {/* Red Sky Line */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-48 bg-gradient-to-r from-orange-600/10 via-rose-500/20 to-amber-500/10 blur-3xl rounded-full" />
            {/* Track Asphalt Texture */}
            <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-[#040405] via-[#09080b] to-transparent border-t border-white/5" />
          </div>
        );

      case 'hypercar-vault':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Minimalist Dark Architectural Carbon Room */}
            <div className="absolute inset-0 bg-[#070709]" />
            {/* Floating Suspended Ceiling Light Bars */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[85%] max-w-5xl h-2 flex justify-between gap-6 opacity-60">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-1 h-1 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
              ))}
            </div>
            {/* Precision Floor Grid Guides */}
            <div className="absolute bottom-0 left-0 right-0 h-80 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:5rem_2.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_100%,#000_60%,transparent_100%)]" />
            {/* Center Podium Glow */}
            <div
              className={`absolute bottom-16 left-1/2 -translate-x-1/2 w-[700px] h-32 rounded-full blur-3xl transition-all duration-500 ${
                lightsOn ? 'bg-cyan-500/15 opacity-80' : 'bg-white/5 opacity-40'
              }`}
            />
          </div>
        );

      case 'dubai-skyline':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Futuristic Dubai Marina Twilight */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b0816] via-[#120f24] to-[#040308]" />
            {/* Violet Gold Twilight Flare */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-r from-purple-600/20 via-amber-500/20 to-indigo-600/20 blur-3xl rounded-full opacity-60" />
            {/* Illuminated Marina Reflection */}
            <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#040308] via-purple-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent blur-[1px]" />
          </div>
        );

      case 'neon-city':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#08020f] via-[#10051d] to-[#030105]" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-72 bg-gradient-to-r from-fuchsia-600/25 via-cyan-500/20 to-purple-600/25 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-black via-fuchsia-950/20 to-transparent" />
          </div>
        );

      case 'showroom':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#111318] via-[#0d0f14] to-[#060709]" />
            {/* Architectural ceiling spot */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.04] blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#060709] to-transparent" />
          </div>
        );

      case 'dark-studio':
      case 'sunset':
      default:
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[#060709]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-white/[0.02] blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#030304] to-transparent" />
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 z-0 select-none pointer-events-none transition-colors duration-1000">
      {getBackgroundContent()}

      {/* Dynamic Throttle / Rev Overdrive Lighting */}
      <div
        className="absolute inset-0 transition-opacity duration-200 pointer-events-none"
        style={{
          opacity: Math.max(0, Math.min(0.35, rpmRatio * 0.45)),
          background: 'radial-gradient(circle at 50% 60%, rgba(249, 115, 22, 0.18) 0%, transparent 65%)',
        }}
      />
    </div>
  );
};
