import React, { useState } from 'react';
import { 
  Compass, MapPin, Activity, ShieldAlert, 
  ArrowRight, Droplets, Waves, CheckCircle2 
} from 'lucide-react';
import { StationItem, RiskLevel } from '../types';

interface InteractiveMapProps {
  stations: StationItem[];
  selectedLocation: string;
  onSelectStation: (stationName: string) => void;
  onAnalyzeStation: (station: StationItem) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  stations,
  selectedLocation,
  onSelectStation,
  onAnalyzeStation
}) => {
  const [activeStationId, setActiveStationId] = useState<string>(
    stations.find(s => s.name === selectedLocation)?.id || stations[0]?.id || 'cauvery'
  );

  const activeStation = stations.find(s => s.id === activeStationId) || stations[0];

  const getMarkerColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL': return { bg: 'bg-rose-500', border: 'border-rose-300', pulse: 'bg-rose-400', text: 'text-rose-400', badge: 'bg-rose-950/80 text-rose-300 border-rose-500/60' };
      case 'HIGH': return { bg: 'bg-orange-500', border: 'border-orange-300', pulse: 'bg-orange-400', text: 'text-orange-400', badge: 'bg-orange-950/80 text-orange-300 border-orange-500/60' };
      case 'MODERATE': return { bg: 'bg-amber-500', border: 'border-amber-300', pulse: 'bg-amber-400', text: 'text-amber-400', badge: 'bg-amber-950/80 text-amber-300 border-amber-500/60' };
      default: return { bg: 'bg-emerald-500', border: 'border-emerald-300', pulse: 'bg-emerald-400', text: 'text-emerald-400', badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60' };
    }
  };

  // Convert GPS lat/long to relative percentage positions on visual river basin canvas
  // Bounds roughly covering Tamil Nadu River Basins (Lat 8.0 - 12.0 N, Lng 76.5 - 79.5 E)
  const getMapCoords = (lat: number, lng: number) => {
    const minLat = 8.2;
    const maxLat = 12.0;
    const minLng = 76.6;
    const maxLng = 79.5;

    const x = ((lng - minLng) / (maxLng - minLng)) * 80 + 10;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 75 + 12;

    return { left: `${Math.min(90, Math.max(10, x))}%`, top: `${Math.min(88, Math.max(10, y))}%` };
  };

  return (
    <div className="space-y-6">
      
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>Regional River Basin Monitoring Map</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Geospatial surveillance stations color-coded by real-time ML pollution risk classification
          </p>
        </div>

        {/* Risk Legend */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Low (0-25)</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Moderate (26-50)</span>
          </span>
          <span className="flex items-center space-x-1 text-orange-400">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            <span>High (51-75)</span>
          </span>
          <span className="flex items-center space-x-1 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Critical (76-100)</span>
          </span>
        </div>
      </div>

      {/* Grid: Map Canvas + Selected Station Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Map Canvas */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
          
          {/* Simulated Cartographic Background with River Tributary Paths */}
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                </pattern>
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Cauvery River Trunk */}
              <path d="M 50 120 Q 180 160 300 190 T 520 220 T 700 270" fill="none" stroke="url(#riverGrad)" strokeWidth="6" strokeLinecap="round" />
              {/* Bhavani Tributary */}
              <path d="M 120 80 Q 220 120 300 190" fill="none" stroke="url(#riverGrad)" strokeWidth="3" strokeLinecap="round" />
              {/* Noyyal Tributary */}
              <path d="M 160 220 Q 280 230 420 210" fill="none" stroke="url(#riverGrad)" strokeWidth="3" strokeLinecap="round" />
              {/* Vaigai River */}
              <path d="M 220 340 Q 380 360 560 390" fill="none" stroke="url(#riverGrad)" strokeWidth="4" strokeLinecap="round" />
              {/* Tamaraibarani River */}
              <path d="M 260 420 Q 360 430 480 440" fill="none" stroke="url(#riverGrad)" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700/60 text-slate-300 text-xs font-mono">
              Cauvery & Southern Peninsular River Basins
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              GPS Simulated Coordinate Grid
            </span>
          </div>

          {/* Interactive Station Markers */}
          <div className="relative w-full h-[360px] my-2">
            {stations.map((st) => {
              const coords = getMapCoords(st.lat, st.lng);
              const markerTheme = getMarkerColor(st.current_risk_level);
              const isSelected = st.id === activeStationId;

              return (
                <div
                  key={st.id}
                  style={{ left: coords.left, top: coords.top }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  onClick={() => {
                    setActiveStationId(st.id);
                    onSelectStation(st.name);
                  }}
                >
                  {/* Outer Pulsing Ping */}
                  <div className="relative flex items-center justify-center">
                    <span className={`animate-ping absolute inline-flex h-8 w-8 rounded-full ${markerTheme.pulse} opacity-40`} />
                    
                    {/* Core Marker Pin */}
                    <div className={`relative flex items-center justify-center w-7 h-7 rounded-full shadow-lg ${markerTheme.bg} border-2 ${
                      isSelected ? 'border-white ring-4 ring-cyan-500/50 scale-125' : markerTheme.border
                    } transition-all duration-300`}>
                      <MapPin className="w-3.5 h-3.5 text-slate-950 fill-current" />
                    </div>

                    {/* Tooltip Label */}
                    <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-lg bg-slate-950/90 border border-slate-700 text-white text-[11px] font-bold shadow-xl pointer-events-none transition-all ${
                      isSelected ? 'opacity-100 scale-100' : 'opacity-80 group-hover:opacity-100 scale-95 group-hover:scale-100'
                    }`}>
                      {st.name} ({st.current_risk_score.toFixed(0)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Click any marker to inspect telemetry and launch ML explanation.</span>
            <span className="font-mono">Sensor Nodes: {stations.length} Active</span>
          </div>

        </div>

        {/* Right Column: Station Detail Card */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between">
          {activeStation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                    Station Inspector
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {activeStation.name}
                  </h3>
                  <p className="text-xs text-slate-400">{activeStation.station_name}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black border font-mono ${getMarkerColor(activeStation.current_risk_level).badge}`}>
                  {activeStation.current_risk_level}
                </span>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Risk Score</span>
                  <span className="text-2xl font-black text-white font-mono">{activeStation.current_risk_score.toFixed(1)}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">WQI Index</span>
                  <span className="text-2xl font-black text-teal-400 font-mono">{activeStation.wqi.toFixed(1)}</span>
                </div>
              </div>

              {/* Telemetry Summary */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                  Status Telemetry Summary
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {activeStation.status_summary}
                </p>
                <p className="text-[10px] text-slate-500 font-mono pt-1">
                  Last Updated: {activeStation.last_updated}
                </p>
              </div>

              {/* Key Parameter Snapshot */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                  Live Parameter Snapshot
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-950/40 border border-slate-800/80 flex justify-between">
                    <span className="text-slate-400">pH:</span>
                    <span className="text-white font-bold">{activeStation.parameters.ph}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/40 border border-slate-800/80 flex justify-between">
                    <span className="text-slate-400">Turbidity:</span>
                    <span className="text-white font-bold">{activeStation.parameters.turbidity} NTU</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/40 border border-slate-800/80 flex justify-between">
                    <span className="text-slate-400">DO:</span>
                    <span className="text-white font-bold">{activeStation.parameters.dissolved_oxygen} mg/L</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/40 border border-slate-800/80 flex justify-between">
                    <span className="text-slate-400">BOD:</span>
                    <span className="text-white font-bold">{activeStation.parameters.bod} mg/L</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => onAnalyzeStation(activeStation)}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider font-mono shadow-md shadow-cyan-600/20 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>LOAD PARAMETERS INTO ANALYSIS LAB</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-10">Select a station to inspect</p>
          )}
        </div>

      </div>
    </div>
  );
};
