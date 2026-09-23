import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, AlertOctagon, ArrowUpRight, 
  Droplets, Waves, CloudRain, Activity, RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { TrendsResponse } from '../types';
import { fetchTrends } from '../services/api';

interface TrendsDashboardProps {
  locationName: string;
}

export const TrendsDashboard: React.FC<TrendsDashboardProps> = ({
  locationName
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [trendsData, setTrendsData] = useState<TrendsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchTrends(locationName, timeRange)
      .then((data) => {
        if (isMounted) {
          setTrendsData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load trends data');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [locationName, timeRange]);

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'HIGH': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'MODERATE': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span>Historical Pollution Trends & Anomaly Timeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Observational time-series telemetry for <span className="text-cyan-300 font-semibold">{locationName}</span>
          </p>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <Calendar className="w-4 h-4 text-slate-400 ml-1.5 mr-1 shrink-0" />
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                timeRange === range
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-sm">Loading historical observation trends...</p>
        </div>
      ) : error || !trendsData ? (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-700/40 text-rose-300 text-center">
          <p className="text-sm font-semibold">{error || 'Unable to display trend data'}</p>
        </div>
      ) : (
        <>
          {/* 1. Main Risk Score Trajectory Chart */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Pollution Risk Score Trajectory (0 - 100)
                </h3>
                <p className="text-xs text-slate-400">
                  Continuous machine learning predicted risk trajectory with threshold danger zones
                </p>
              </div>
              <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Risk Score</span>
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendsData.data_points}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="display_date" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#030712',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '0.75rem'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="risk_score"
                    name="Pollution Risk Score"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#riskGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Side-by-Side Specific Metric Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Dissolved Oxygen vs BOD (Inverse Relationship) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Dissolved Oxygen vs. BOD Degradation
                </h3>
                <p className="text-xs text-slate-400">
                  Healthy baseline shows high DO & low BOD; organic influx flips this dynamic
                </p>
              </div>

              <div className="h-56 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendsData.data_points}
                    margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="display_date" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#030712',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                    <Line
                      type="monotone"
                      dataKey="dissolved_oxygen"
                      name="DO (mg/L)"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="bod"
                      name="BOD (mg/L)"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Turbidity vs Rainfall (Overland Runoff Response) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Turbidity & Precipitation Response
                </h3>
                <p className="text-xs text-slate-400">
                  Suspended particulates surge during storm events and overland erosion
                </p>
              </div>

              <div className="h-56 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendsData.data_points}
                    margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="display_date" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#030712',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                    <Line
                      type="monotone"
                      dataKey="turbidity"
                      name="Turbidity (NTU)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="rainfall"
                      name="Rainfall (mm)"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* 3. Pollution Risk Timeline Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Pollution Risk Timeline & Incident Log
                </h3>
                <p className="text-xs text-slate-400">
                  Chronological observation logs highlighting sudden risk jumps
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {trendsData.timeline.length} Records
              </span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3">Location</th>
                    <th className="pb-3 px-3 text-right">Risk Score</th>
                    <th className="pb-3 px-3">Risk Level</th>
                    <th className="pb-3 px-3 text-right">Delta</th>
                    <th className="pb-3 px-3 text-right">DO (mg/L)</th>
                    <th className="pb-3 px-3 text-right">BOD (mg/L)</th>
                    <th className="pb-3 px-3 text-right">Turbidity</th>
                    <th className="pb-3 px-3">Anomaly Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {trendsData.timeline.slice(0, 15).map((item, idx) => {
                    const badgeClass = getRiskBadgeColor(item.risk_level);
                    return (
                      <tr 
                        key={idx}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          item.is_surge ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono text-slate-200">{item.display_date}</td>
                        <td className="py-3 px-3 text-slate-300">{locationName}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white">
                          {item.risk_score.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border font-mono ${badgeClass}`}>
                            {item.risk_level}
                          </span>
                        </td>
                        <td className={`py-3 px-3 text-right font-mono font-bold ${
                          item.delta > 0 ? 'text-rose-400' : item.delta < 0 ? 'text-emerald-400' : 'text-slate-400'
                        }`}>
                          {item.delta > 0 ? `+${item.delta.toFixed(1)}%` : `${item.delta.toFixed(1)}%`}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">{item.dissolved_oxygen}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">{item.bod}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">{item.turbidity} NTU</td>
                        <td className="py-3 px-3">
                          {item.is_surge ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50">
                              <AlertOctagon className="w-3 h-3 mr-1 text-amber-400" />
                              ⚠ Early Warning
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Normal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
