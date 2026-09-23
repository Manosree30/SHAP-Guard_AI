import React from 'react';
import { 
  AlertTriangle, AlertOctagon, Flame, ShieldAlert, 
  Clock, ArrowRight, CheckCircle, RefreshCw 
} from 'lucide-react';
import { AlertItem } from '../types';

interface AlertsPanelProps {
  alerts: AlertItem[];
  onSelectStation: (stationName: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onSelectStation,
  onNavigateToTab
}) => {
  const getSeverityStyle = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          cardBg: 'from-rose-950/60 to-slate-950/90 border-rose-600/40',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/60',
          icon: Flame,
          iconColor: 'text-rose-400'
        };
      case 'HIGH':
        return {
          cardBg: 'from-orange-950/60 to-slate-950/90 border-orange-600/40',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/60',
          icon: AlertOctagon,
          iconColor: 'text-orange-400'
        };
      case 'MODERATE':
        return {
          cardBg: 'from-amber-950/60 to-slate-950/90 border-amber-600/40',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/60',
          icon: AlertTriangle,
          iconColor: 'text-amber-400'
        };
      default:
        return {
          cardBg: 'from-emerald-950/60 to-slate-950/90 border-emerald-600/40',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60',
          icon: CheckCircle,
          iconColor: 'text-emerald-400'
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alerts Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Active Environmental Alerts & Incident Feeds</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated threshold violation alerts and early pollution warnings generated in real-time
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 font-bold">
          {alerts.length} Active Incidents
        </span>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 gap-4">
        {alerts.map((alert) => {
          const style = getSeverityStyle(alert.severity);
          const Icon = style.icon;

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border bg-gradient-to-r ${style.cardBg} backdrop-blur-xl shadow-lg shadow-black/20 hover:scale-[1.005] transition-all`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Alert Core Info */}
                <div className="flex items-start space-x-4">
                  <div className={`p-2.5 rounded-xl bg-slate-900/80 border border-white/10 ${style.iconColor} shrink-0 mt-0.5`}>
                    <Icon className="w-6 h-6 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-black border font-mono ${style.badge}`}>
                        {alert.severity} RISK
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        {alert.station_name}
                      </span>
                      <span className="flex items-center text-[11px] text-slate-400 space-x-1 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{alert.timestamp}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      {alert.message}
                    </p>

                    <div className="pt-1.5 text-xs text-slate-400 space-y-0.5">
                      <div>
                        <span className="font-semibold text-slate-300">Primary Cause: </span>
                        <span className="italic text-slate-200">{alert.primary_reason}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-cyan-300">Recommended Action: </span>
                        <span className="text-slate-200">{alert.recommended_action}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inspect Action Button */}
                <div className="shrink-0 flex items-center">
                  <button
                    onClick={() => {
                      onSelectStation(alert.station_name.split(' (')[0]);
                      onNavigateToTab('analyze');
                    }}
                    className="w-full md:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 text-xs font-bold font-mono transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>ANALYZE RIVER</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
