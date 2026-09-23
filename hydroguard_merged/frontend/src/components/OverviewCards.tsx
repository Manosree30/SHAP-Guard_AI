import React from 'react';
import { 
  ShieldAlert, ShieldCheck, ShieldAlert as ShieldWarning, Flame, 
  Activity, Gauge, Clock, Sparkles 
} from 'lucide-react';
import { RiskLevel } from '../types';

interface OverviewCardsProps {
  location: string;
  riskLevel: RiskLevel;
  riskScore: number;
  wqi: number;
  lastUpdated: string;
  confidencePct: number;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  location,
  riskLevel,
  riskScore,
  wqi,
  lastUpdated,
  confidencePct
}) => {
  // Risk styling helper
  const getRiskDetails = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'from-rose-950/70 to-red-900/40 border-rose-600/50 text-rose-400',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/60',
          icon: Flame,
          desc: 'Severe ecological hazard detected. Immediate intervention required.'
        };
      case 'HIGH':
        return {
          bg: 'from-orange-950/70 to-amber-900/40 border-orange-600/50 text-orange-400',
          badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/60',
          icon: ShieldAlert,
          desc: 'Significant pollution loading. Field inspection recommended.'
        };
      case 'MODERATE':
        return {
          bg: 'from-amber-950/70 to-yellow-900/40 border-amber-600/50 text-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/60',
          icon: ShieldWarning,
          desc: 'Mild parameter stress. Regular monitoring advised.'
        };
      default:
        return {
          bg: 'from-emerald-950/70 to-teal-900/40 border-emerald-600/50 text-emerald-400',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60',
          icon: ShieldCheck,
          desc: 'Parameters within healthy baseline ecological limits.'
        };
    }
  };

  const riskMeta = getRiskDetails(riskLevel);
  const RiskIcon = riskMeta.icon;

  // WQI description
  const getWqiRating = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-950/50 border-emerald-600/40' };
    if (score >= 70) return { label: 'Good', color: 'text-teal-400', bg: 'bg-teal-950/50 border-teal-600/40' };
    if (score >= 50) return { label: 'Fair', color: 'text-amber-400', bg: 'bg-amber-950/50 border-amber-600/40' };
    if (score >= 35) return { label: 'Marginal', color: 'text-orange-400', bg: 'bg-orange-950/50 border-orange-600/40' };
    return { label: 'Poor', color: 'text-rose-400', bg: 'bg-rose-950/50 border-rose-600/40' };
  };

  const wqiRating = getWqiRating(wqi);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Current Risk Card */}
      <div className={`relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-br backdrop-blur-xl ${riskMeta.bg} shadow-lg shadow-black/30 transition-all hover:scale-[1.01]`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Current Risk
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${riskMeta.badgeBg}`}>
            {riskLevel}
          </span>
        </div>
        <div className="mt-3 flex items-baseline space-x-3">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10">
            <RiskIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-white font-mono">
              {riskLevel} RISK
            </h3>
            <p className="text-[11px] text-slate-300/80 mt-0.5 line-clamp-1">
              {location}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300/90 mt-3 pt-2.5 border-t border-white/10">
          {riskMeta.desc}
        </p>
      </div>

      {/* 2. Risk Score Card */}
      <div className="relative overflow-hidden rounded-2xl p-5 border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl shadow-lg shadow-black/30 transition-all hover:scale-[1.01]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Pollution Risk Score
          </span>
          <Gauge className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-black text-white font-mono">
              {riskScore.toFixed(0)}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            riskScore > 50 ? 'text-rose-400 bg-rose-950/50' : 'text-emerald-400 bg-emerald-950/50'
          }`}>
            {riskScore.toFixed(1)}%
          </span>
        </div>
        {/* Visual Progress Bar */}
        <div className="mt-3.5 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              riskScore > 75 ? 'bg-gradient-to-r from-orange-500 to-rose-500' :
              riskScore > 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
              riskScore > 25 ? 'bg-gradient-to-r from-teal-500 to-amber-500' :
              'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
          <span>0 (Safe)</span>
          <span>50 (Moderate)</span>
          <span>100 (Critical)</span>
        </div>
      </div>

      {/* 3. Water Quality Index (WQI) Card */}
      <div className="relative overflow-hidden rounded-2xl p-5 border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl shadow-lg shadow-black/30 transition-all hover:scale-[1.01]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Water Quality Index
          </span>
          <Activity className="w-4 h-4 text-teal-400" />
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-black text-white font-mono">
              {wqi.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${wqiRating.bg} ${wqiRating.color}`}>
            {wqiRating.label}
          </span>
        </div>
        <div className="mt-3.5 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(5, wqi))}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Canadian WQI standard calculation
        </p>
      </div>

      {/* 4. Telemetry & Last Analysis Card */}
      <div className="relative overflow-hidden rounded-2xl p-5 border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl shadow-lg shadow-black/30 transition-all hover:scale-[1.01]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Last Analysis
          </span>
          <Clock className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-3">
          <div className="text-lg font-bold text-white font-mono">
            {lastUpdated}
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">
              ML Confidence: <span className="font-bold text-cyan-300 font-mono">{confidencePct}%</span>
            </span>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800 font-mono">
          Model: Random Forest Ensemble (Demo)
        </p>
      </div>
    </div>
  );
};
