import React from 'react';
import { AlertOctagon, TrendingUp, BellRing, ArrowUpRight } from 'lucide-react';
import { EarlyWarningDetails } from '../types';

interface EarlyWarningBannerProps {
  details: EarlyWarningDetails | null;
  locationName: string;
}

export const EarlyWarningBanner: React.FC<EarlyWarningBannerProps> = ({
  details,
  locationName
}) => {
  if (!details) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-amber-500/50 bg-gradient-to-r from-amber-950/80 via-orange-950/70 to-slate-950/80 backdrop-blur-xl shadow-xl shadow-amber-950/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title & Warning Message */}
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 animate-bounce">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 font-mono">
                ⚠ Early Pollution Warning
              </span>
              <span className="text-xs text-amber-300 font-semibold">
                Sudden Pollution Surge Detected
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mt-1">
              {locationName}: {details.message}
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Rapid parameter deterioration flagged by HydroGuard-XAI anomaly surveillance engine.
            </p>
          </div>
        </div>

        {/* Previous vs Current Metrics Badge */}
        <div className="flex items-center space-x-3 shrink-0 bg-slate-900/80 border border-amber-500/30 rounded-xl p-3">
          <div className="text-center px-2">
            <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono">Previous</span>
            <span className="text-base font-bold text-slate-300 font-mono">{details.previous_risk.toFixed(1)}%</span>
          </div>

          <div className="flex items-center text-amber-400 font-bold px-1">
            <ArrowUpRight className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-sm font-mono font-extrabold">+{details.delta.toFixed(1)}%</span>
          </div>

          <div className="text-center px-2">
            <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono">Current</span>
            <span className="text-base font-bold text-rose-400 font-mono">{details.current_risk.toFixed(1)}%</span>
          </div>
        </div>

      </div>

      <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex flex-wrap items-center justify-between text-[11px] text-amber-200/80">
        <span>Triggered at: {details.date}</span>
        <span className="italic">Advisory prototype notification — field team sampling advised.</span>
      </div>
    </div>
  );
};
