import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { ParameterStatus } from '../types';

interface ParameterStatusMatrixProps {
  statuses: ParameterStatus[];
}

export const ParameterStatusMatrix: React.FC<ParameterStatusMatrixProps> = ({
  statuses
}) => {
  if (!statuses || statuses.length === 0) return null;

  const getStatusIcon = (status: string) => {
    if (status.includes('critical')) {
      return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
    }
    if (status.includes('below') || status.includes('above') || status.includes('high')) {
      return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
  };

  const getStatusBadgeStyle = (status: string) => {
    if (status.includes('critical')) {
      return 'bg-rose-950/70 text-rose-300 border-rose-600/50';
    }
    if (status.includes('below') || status.includes('above') || status.includes('high')) {
      return 'bg-amber-950/70 text-amber-300 border-amber-600/50';
    }
    return 'bg-emerald-950/70 text-emerald-300 border-emerald-600/50';
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Water Quality Parameter Health Matrix</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic benchmark comparison against CPCB & WHO freshwater standard guidelines
          </p>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          10 Parameters Tracked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-4">
        {statuses.map((param) => {
          const badgeStyle = getStatusBadgeStyle(param.status);
          const icon = getStatusIcon(param.status);

          return (
            <div
              key={param.key}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 line-clamp-1">
                    {param.name}
                  </span>
                  {icon}
                </div>

                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-xl font-black text-white font-mono">
                    {param.value}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {param.unit}
                  </span>
                </div>

                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${badgeStyle}`}>
                    {param.badge_label}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-900 text-[10px] text-slate-400 space-y-0.5">
                <div>
                  <span className="text-slate-500">Benchmark: </span>
                  <span className="font-mono text-slate-300">{param.safe_range}</span>
                </div>
                <p className="text-slate-400 line-clamp-2 italic pt-0.5">
                  {param.narrative}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
