import React from 'react';
import { 
  Activity, Droplets, MapPin, AlertTriangle, Sparkles, 
  TrendingUp, Compass, Info, Radio, RefreshCw 
} from 'lucide-react';
import { StationItem, DemoScenario } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stations: StationItem[];
  selectedLocation: string;
  onSelectLocation: (locName: string) => void;
  alertCount: number;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenAbout: () => void;
  demoScenarios: DemoScenario[];
  onSelectScenario: (scenario: DemoScenario) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  stations,
  selectedLocation,
  onSelectLocation,
  alertCount,
  isStreaming,
  onToggleStreaming,
  onOpenAbout,
  demoScenarios,
  onSelectScenario
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#060c1c]/90 backdrop-blur-md border-b border-cyan-900/30 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-md shadow-cyan-500/20 text-white font-bold">
              <Droplets className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 font-mono">
                  HYDROGUARD-XAI
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/80 border border-cyan-600/40 text-cyan-300 font-mono">
                  PROTOTYPE v1.0
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium hidden sm:block">
                Explainable AI for Early River Pollution Risk Prediction
              </p>
            </div>
          </div>

          {/* Quick River Selector & IoT Simulator Controls */}
          <div className="flex items-center space-x-3">
            {/* Location Selector */}
            <div className="relative flex items-center bg-slate-900/80 border border-slate-700/60 rounded-lg px-3 py-1.5 shadow-inner">
              <MapPin className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => onSelectLocation(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-slate-200 font-medium focus:outline-none cursor-pointer pr-4"
              >
                {stations.map((st) => (
                  <option key={st.id} value={st.name} className="bg-slate-900 text-slate-200">
                    {st.name} ({st.current_risk_level})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Stream Telemetry Toggle */}
            <button
              onClick={onToggleStreaming}
              title="Toggle Simulated Real-time IoT Sensor Stream"
              className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isStreaming
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:border-cyan-500/50'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'animate-pulse text-emerald-400' : 'text-slate-400'}`} />
              <span>{isStreaming ? 'Live IoT: ON' : 'Live IoT: OFF'}</span>
            </button>

            {/* Quick Demo Scenario Dropdown */}
            <div className="hidden xl:flex items-center bg-cyan-950/50 border border-cyan-800/40 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              <span className="mr-1 text-slate-400">Demo:</span>
              <select
                onChange={(e) => {
                  const sc = demoScenarios.find(s => s.id === e.target.value);
                  if (sc) onSelectScenario(sc);
                }}
                className="bg-transparent text-cyan-200 text-xs font-semibold focus:outline-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">Select Demo Scenario...</option>
                {demoScenarios.map(sc => (
                  <option key={sc.id} value={sc.id} className="bg-slate-900 text-slate-200">
                    {sc.name} ({sc.expected_risk})
                  </option>
                ))}
              </select>
            </div>

            {/* About Modal Trigger */}
            <button
              onClick={onOpenAbout}
              title="About HydroGuard-XAI Architecture"
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 border-t border-slate-800/60 no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'analyze', label: 'Analyze River', icon: Droplets },
            { id: 'xai', label: 'XAI Explanation', icon: Sparkles },
            { id: 'trends', label: 'Trends & Timeline', icon: TrendingUp },
            { id: 'map', label: 'River Map', icon: Compass },
            { id: 'alerts', label: 'Alerts', icon: AlertTriangle, count: alertCount }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/50">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
