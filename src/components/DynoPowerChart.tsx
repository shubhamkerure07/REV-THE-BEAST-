import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  CartesianGrid,
} from 'recharts';
import { EngineSpec } from '../types';
import { generateDynoCurve, calculateLivePower } from '../utils/dynoCalculator';
import { Zap, Gauge, Flame, Activity } from 'lucide-react';

interface DynoPowerChartProps {
  engine: EngineSpec;
  currentRpm: number;
  isSoundActive: boolean;
}

export const DynoPowerChart: React.FC<DynoPowerChartProps> = ({
  engine,
  currentRpm,
  isSoundActive,
}) => {
  const [torqueUnit, setTorqueUnit] = useState<'Nm' | 'lb-ft'>('Nm');

  // Baseline curve points (cached per engine)
  const curveData = useMemo(() => {
    return generateDynoCurve(engine, 28);
  }, [engine]);

  // Live power output at current RPM
  const livePower = useMemo(() => {
    const effectiveRpm = isSoundActive ? currentRpm : engine.idleRpm;
    return calculateLivePower(engine, effectiveRpm);
  }, [engine, currentRpm, isSoundActive]);

  // Find nearest curve point for reference dot placement
  const nearestPoint = useMemo(() => {
    const effectiveRpm = isSoundActive ? currentRpm : engine.idleRpm;
    let closest = curveData[0];
    let minDiff = Math.abs(curveData[0].rpm - effectiveRpm);

    for (let i = 1; i < curveData.length; i++) {
      const diff = Math.abs(curveData[i].rpm - effectiveRpm);
      if (diff < minDiff) {
        minDiff = diff;
        closest = curveData[i];
      }
    }
    return closest;
  }, [curveData, currentRpm, isSoundActive, engine.idleRpm]);

  // Chart data with unit selection
  const chartData = useMemo(() => {
    return curveData.map((d) => ({
      ...d,
      displayTorque: torqueUnit === 'Nm' ? d.torque : d.torqueLbFt,
    }));
  }, [curveData, torqueUnit]);

  const liveTorqueDisplay =
    torqueUnit === 'Nm' ? livePower.torqueNm : livePower.torqueLbFt;
  const maxTorqueDisplay =
    torqueUnit === 'Nm' ? engine.torqueNm : engine.torqueLbFt;

  return (
    <div className="w-full bg-black/60 rounded-2xl p-2.5 border border-white/10 shadow-inner">
      {/* Top Live Output Stats Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Live Horsepower */}
        <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-500/30 px-2 py-1 rounded-xl flex-1">
          <Zap className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[8px] uppercase tracking-wider text-rose-300 font-bold font-mono">
              OUTPUT HP
            </div>
            <div className="text-sm sm:text-base font-black text-rose-400 font-mono tracking-tight flex items-baseline gap-1">
              <span>{isSoundActive ? livePower.hp : 0}</span>
              <span className="text-[9px] text-rose-500/80 font-normal">/ {engine.powerHp}</span>
            </div>
          </div>
        </div>

        {/* Live Torque */}
        <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/30 px-2 py-1 rounded-xl flex-1">
          <Flame className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[8px] uppercase tracking-wider text-cyan-300 font-bold font-mono">
                TORQUE
              </span>
              <button
                onClick={() => setTorqueUnit(torqueUnit === 'Nm' ? 'lb-ft' : 'Nm')}
                className="text-[8px] font-mono font-bold text-cyan-400 hover:text-white bg-cyan-500/20 px-1 rounded transition-colors"
                title="Toggle Torque Unit"
              >
                {torqueUnit}
              </button>
            </div>
            <div className="text-sm sm:text-base font-black text-cyan-400 font-mono tracking-tight flex items-baseline gap-1">
              <span>{isSoundActive ? liveTorqueDisplay : 0}</span>
              <span className="text-[9px] text-cyan-500/80 font-normal">/ {maxTorqueDisplay}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Recharts Dyno Curve */}
      <div className="w-full h-36 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 12, right: 4, left: -22, bottom: 0 }}
          >
            <defs>
              <linearGradient id="hpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="torqueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="rpm"
              type="number"
              domain={[engine.idleRpm, engine.redlineRpm]}
              tick={{ fill: '#94a3b8', fontSize: 8, fontFamily: 'monospace' }}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />

            {/* Left Y Axis for Horsepower */}
            <YAxis
              yAxisId="hp"
              orientation="left"
              domain={[0, Math.ceil(engine.powerHp * 1.1)]}
              tick={{ fill: '#f43f5e', fontSize: 8, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
            />

            {/* Right Y Axis for Torque */}
            <YAxis
              yAxisId="torque"
              orientation="right"
              domain={[0, Math.ceil(maxTorqueDisplay * 1.1)]}
              tick={{ fill: '#06b6d4', fontSize: 8, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as (typeof chartData)[0];
                  return (
                    <div className="bg-black/90 border border-white/20 p-1.5 rounded-lg shadow-xl backdrop-blur-md text-[9px] font-mono">
                      <div className="text-white font-bold mb-0.5">{data.rpm.toLocaleString()} RPM</div>
                      <div className="text-rose-400 font-semibold">HP: {data.hp} HP</div>
                      <div className="text-cyan-400 font-semibold">
                        Torque: {data.displayTorque} {torqueUnit}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Horsepower Area & Line */}
            <Area
              yAxisId="hp"
              type="monotone"
              dataKey="hp"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#hpGradient)"
              isAnimationActive={false}
              name="Horsepower"
            />

            {/* Torque Area & Line */}
            <Area
              yAxisId="torque"
              type="monotone"
              dataKey="displayTorque"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#torqueGradient)"
              isAnimationActive={false}
              name="Torque"
            />

            {/* Live Vertical RPM Tracker */}
            {isSoundActive && (
              <ReferenceLine
                x={nearestPoint.rpm}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                label={{
                  value: `${Math.round(currentRpm)}`,
                  position: 'top',
                  fill: '#f59e0b',
                  fontSize: 8,
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                }}
              />
            )}

            {/* Active RPM HP Dot */}
            {isSoundActive && (
              <ReferenceDot
                yAxisId="hp"
                x={nearestPoint.rpm}
                y={livePower.hp}
                r={3.5}
                fill="#f43f5e"
                stroke="#ffffff"
                strokeWidth={1.5}
                isFront
              />
            )}

            {/* Active RPM Torque Dot */}
            {isSoundActive && (
              <ReferenceDot
                yAxisId="torque"
                x={nearestPoint.rpm}
                y={liveTorqueDisplay}
                r={3.5}
                fill="#06b6d4"
                stroke="#ffffff"
                strokeWidth={1.5}
                isFront
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend & Peak Specs */}
      <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 pt-1 border-t border-white/5 mt-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-rose-300 font-semibold">HP Curve</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-cyan-300 font-semibold">Torque ({torqueUnit})</span>
          </span>
        </div>
        <div className="text-amber-400 font-bold">
          {isSoundActive ? `${Math.round(currentRpm)} RPM` : 'ENGINE IDLE'}
        </div>
      </div>
    </div>
  );
};
