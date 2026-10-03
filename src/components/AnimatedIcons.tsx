import React from 'react';

interface AnimatedIconProps {
  className?: string;
  size?: number;
}

/**
 * Animated Speedometer Icon with oscillating needle
 */
export const AnimatedSpeedometerIcon: React.FC<AnimatedIconProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2a10 10 0 0 0-10 10c0 4.2 2.6 7.8 6.4 9.3" />
    <path d="M22 12A10 10 0 0 0 12 2" />
    <path d="M21.6 15.6A10 10 0 0 1 17.6 21.3" />
    {/* Oscillating needle */}
    <line
      x1="12"
      y1="12"
      x2="17"
      y2="8"
      stroke="#ef4444"
      strokeWidth="2.5"
      className="origin-[12px_12px] animate-[spin_3s_ease-in-out_infinite_alternate]"
      style={{ transformOrigin: '12px 12px' }}
    />
    <circle cx="12" cy="12" r="2" fill="#ef4444" />
  </svg>
);

/**
 * Animated Mechanical Engine Piston Icon (reciprocating up and down)
 */
export const AnimatedEngineIcon: React.FC<AnimatedIconProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Engine block outline */}
    <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" />
    <path d="M2 10h2M2 14h2M20 10h2M20 14h2M9 2h6v4H9z" />
    {/* Reciprocating Piston Head */}
    <g className="animate-[bounce_0.8s_ease-in-out_infinite]">
      <rect x="7" y="9" width="10" height="3" rx="0.5" fill="#f59e0b" stroke="#f59e0b" />
      <line x1="12" y1="12" x2="12" y2="16" stroke="#f59e0b" strokeWidth="2" />
    </g>
  </svg>
);

/**
 * Animated Exhaust Flow / Sparks Icon
 */
export const AnimatedExhaustIcon: React.FC<AnimatedIconProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Exhaust pipe rim */}
    <circle cx="7" cy="12" r="5" stroke="currentColor" />
    <circle cx="7" cy="12" r="3" fill="#ef4444" opacity="0.6" />
    {/* Airflow / flame waves */}
    <path
      d="M13 9c2 0 3 1.5 5 1.5s3-1.5 4-1.5"
      stroke="#f97316"
      className="animate-[pulse_1s_ease-in-out_infinite]"
    />
    <path
      d="M13 12c1.5 0 2.5 1 4 1s2.5-1 4.5-1"
      stroke="#eab308"
      className="animate-[pulse_0.8s_ease-in-out_infinite_0.2s]"
    />
    <path
      d="M13 15c2 0 3-1.5 5-1.5s3 1.5 4 1.5"
      stroke="#ef4444"
      className="animate-[pulse_1.2s_ease-in-out_infinite_0.4s]"
    />
  </svg>
);

/**
 * Animated Turbo Spool Pulse Icon
 */
export const AnimatedTurboIcon: React.FC<AnimatedIconProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Turbine snail housing */}
    <path d="M12 21a9 9 0 1 0-9-9c0 2.8 1.3 5.4 3.5 7.1L12 21z" />
    {/* Spinning impeller blades */}
    <g className="origin-center animate-[spin_1.5s_linear_infinite]" style={{ transformOrigin: '12px 12px' }}>
      <path d="M12 7v5M12 12l4 3M12 12l-4 3" stroke="#38bdf8" strokeWidth="2.5" />
      <circle cx="12" cy="12" r="2.5" fill="#38bdf8" />
    </g>
  </svg>
);

/**
 * Animated Spinning Wheel / Rim Icon
 */
export const AnimatedWheelIcon: React.FC<AnimatedIconProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" />
    {/* 5-Spoke Spinning pattern */}
    <g className="origin-center animate-[spin_4s_linear_infinite]" style={{ transformOrigin: '12px 12px' }}>
      <line x1="12" y1="2" x2="12" y2="8" stroke="currentColor" />
      <line x1="12" y1="16" x2="12" y2="22" stroke="currentColor" />
      <line x1="2" y1="12" x2="8" y2="12" stroke="currentColor" />
      <line x1="16" y1="12" x2="22" y2="12" stroke="currentColor" />
    </g>
  </svg>
);

/**
 * Animated Audio Equalizer Bars Icon
 */
export const AnimatedAudioBarsIcon: React.FC<AnimatedIconProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <rect x="3" y="10" width="3" height="10" rx="1.5" fill="#ef4444" className="animate-[pulse_0.6s_ease-in-out_infinite]" />
    <rect x="8.5" y="4" width="3" height="16" rx="1.5" fill="#f59e0b" className="animate-[pulse_0.9s_ease-in-out_infinite_0.15s]" />
    <rect x="14" y="7" width="3" height="13" rx="1.5" fill="#10b981" className="animate-[pulse_0.75s_ease-in-out_infinite_0.3s]" />
    <rect x="19.5" y="11" width="3" height="9" rx="1.5" fill="#3b82f6" className="animate-[pulse_0.8s_ease-in-out_infinite_0.45s]" />
  </svg>
);

/**
 * Animated AI Neural Spark Icon
 */
export const AnimatedAiSparkIcon: React.FC<AnimatedIconProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path
      d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"
      className="animate-[pulse_1.5s_ease-in-out_infinite]"
      fill="currentColor"
      opacity="0.2"
    />
    <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" stroke="#a855f7" />
    <circle cx="12" cy="11" r="1.5" fill="#ec4899" className="animate-ping" />
  </svg>
);
