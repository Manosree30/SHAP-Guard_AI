import React, { useState } from 'react';
import { 
  Sliders, Play, RefreshCw, AlertTriangle, Sparkles, 
  CheckCircle, ArrowRight, Info, Zap 
} from 'lucide-react';
import { WaterQualityParams, PredictionResponse, DemoScenario } from '../types';

interface RiverAnalysisFormProps {
  params: WaterQualityParams;
  onChangeParams: (params: WaterQualityParams) => void;
  onAnalyze: () => Promise<void>;
  isLoading: boolean;
  prediction: PredictionResponse | null;
  selectedLocation: string;
  demoScenarios: DemoScenario[];
  onSelectScenario: (scenario: DemoScenario) => void;
  onNavigateToXai: () => void;
}

const PARAM_CONFIGS = [
  { key: 'ph', name: 'pH Level', unit: '', min: 0.0, max: 14.0, step: 0.1, safe: '6.5 - 8.5', category: 'Chemical' },
  { key: 'turbidity', name: 'Turbidity', unit: 'NTU', min: 0.0, max: 150.0, step: 0.5, safe: '0 - 10 NTU', category: 'Physical' },
  { key: 'dissolved_oxygen', name: 'Dissolved Oxygen', unit: 'mg/L', min: 0.0, max: 15.0, step: 0.1, safe: '> 6.0 mg/L', category: 'Biological' },
  { key: 'temperature', name: 'Temperature', unit: '°C', min: 10.0, max: 45.0, step: 0.5, safe: '18 - 28 °C', category: 'Physical' },
  { key: 'conductivity', name: 'Conductivity', unit: 'µS/cm', min: 50.0, max: 2000.0, step: 10.0, safe: '100 - 500 µS/cm', category: 'Chemical' },
  { key: 'tds', name: 'Total Dissolved Solids (TDS)', unit: 'mg/L', min: 20.0, max: 1500.0, step: 10.0, safe: '50 - 300 mg/L', category: 'Chemical' },
  { key: 'bod', name: 'Biochemical Oxygen Demand (BOD)', unit: 'mg/L', min: 0.0, max: 25.0, step: 0.2, safe: '< 3.0 mg/L', category: 'Biological' },
  { key: 'cod', name: 'Chemical Oxygen Demand (COD)', unit: 'mg/L', min: 0.0, max: 120.0, step: 1.0, safe: '< 15.0 mg/L', category: 'Chemical' },
  { key: 'rainfall', name: 'Rainfall', unit: 'mm', min: 0.0, max: 150.0, step: 1.0, safe: '0 - 50 mm', category: 'Environmental' },
  { key: 'water_flow', name: 'Water Flow Rate', unit: 'm³/s', min: 10.0, max: 600.0, step: 5.0, safe: '50 - 400 m³/s', category: 'Hydrological' },
] as const;

export const RiverAnalysisForm: React.FC<RiverAnalysisFormProps> = ({
  params,
  onChangeParams,
  onAnalyze,
  isLoading,
  prediction,
  selectedLocation,
  demoScenarios,
  onSelectScenario,
  onNavigateToXai
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const handleParamChange = (key: keyof WaterQualityParams, value: number) => {
    onChangeParams({
      ...params,
      [key]: value
    });
  };

  const categories = ['All', 'Biological', 'Chemical', 'Physical', 'Environmental'];
  const filteredConfigs = activeCategory === 'All' 
    ? PARAM_CONFIGS 
    : PARAM_CONFIGS.filter(c => c.category === activeCategory || (activeCategory === 'Environmental' && c.category === 'Hydrological'));

  return (
    <div className="space-y-6">
      
      {/* Demo Scenario Quick-Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
              1-Click Demo Scenarios (Judge Evaluation)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Select a preset scenario to instantly populate realistic water quality parameters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {demoScenarios.map((scenario) => {
            const riskColor = 
              scenario.expected_risk === 'CRITICAL' ? 'border-rose-500/50 hover:bg-rose-950/40 text-rose-300' :
              scenario.expected_risk === 'HIGH' ? 'border-orange-500/50 hover:bg-orange-950/40 text-orange-300' :
              scenario.expected_risk === 'MODERATE' ? 'border-amber-500/50 hover:bg-amber-950/40 text-amber-300' :
              'border-emerald-500/50 hover:bg-emerald-950/40 text-emerald-300';

            return (
              <button
                key={scenario.id}
                onClick={() => onSelectScenario(scenario)}
                className={`text-left p-3 rounded-xl border bg-slate-950/60 transition-all ${riskColor} group`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                    {scenario.name}
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900 border border-current font-mono">
                    {scenario.expected_risk}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {scenario.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Parameter Input Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Water Quality & Hydrology Parameters</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Location: <span className="text-cyan-300 font-semibold">{selectedLocation}</span>
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      activeCategory === cat
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {filteredConfigs.map((cfg) => {
                const val = params[cfg.key as keyof WaterQualityParams];
                const isOutOfSafe = 
                  cfg.key === 'ph' ? (val < 6.5 || val > 8.5) :
                  cfg.key === 'dissolved_oxygen' ? (val < 6.0) :
                  cfg.key === 'turbidity' ? (val > 10.0) :
                  cfg.key === 'bod' ? (val > 3.0) :
                  cfg.key === 'cod' ? (val > 15.0) : false;

                return (
                  <div 
                    key={cfg.key}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <label className="text-xs font-semibold text-slate-200">
                          {cfg.name}
                        </label>
                        {isOutOfSafe && (
                          <span title="Parameter outside standard baseline" className="text-amber-400 text-xs">
                            ⚠
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Safe: {cfg.safe}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min={cfg.min}
                        max={cfg.max}
                        step={cfg.step}
                        value={val}
                        onChange={(e) => handleParamChange(cfg.key as keyof WaterQualityParams, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                      <div className="relative shrink-0 w-24">
                        <input
                          type="number"
                          min={cfg.min}
                          max={cfg.max}
                          step={cfg.step}
                          value={val}
                          onChange={(e) => handleParamChange(cfg.key as keyof WaterQualityParams, parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-right text-cyan-300 font-mono font-bold focus:border-cyan-400 focus:outline-none"
                        />
                        {cfg.unit && (
                          <span className="absolute right-7 top-1 text-[10px] text-slate-500 pointer-events-none">
                            {cfg.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Prominent Action Button */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <button
                onClick={onAnalyze}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-mono"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                    <span>RUNNING ML INFERENCE & XAI PIPELINE...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    <span>ANALYZE POLLUTION RISK</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Prediction Output Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Prediction Output Preview
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 border border-cyan-700/50 text-cyan-300 font-mono">
                  REAL-TIME ML INFERENCE
                </span>
              </div>

              {prediction ? (
                <div className="mt-4 space-y-4">
                  {/* Risk Badge Hero */}
                  <div className={`p-4 rounded-xl border bg-gradient-to-br ${
                    prediction.risk_level === 'CRITICAL' ? 'from-rose-950/70 to-red-900/40 border-rose-600/50 text-rose-400' :
                    prediction.risk_level === 'HIGH' ? 'from-orange-950/70 to-amber-900/40 border-orange-600/50 text-orange-400' :
                    prediction.risk_level === 'MODERATE' ? 'from-amber-950/70 to-yellow-900/40 border-amber-600/50 text-amber-400' :
                    'from-emerald-950/70 to-teal-900/40 border-emerald-600/50 text-emerald-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">
                        Predicted Pollution Risk
                      </span>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-black/40 border border-current">
                        {prediction.risk_level}
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-4xl font-black text-white font-mono">
                          {prediction.risk_score.toFixed(0)}
                        </span>
                        <span className="text-slate-400 text-sm font-semibold">/ 100</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">ML Confidence</span>
                        <span className="text-sm font-bold text-cyan-300 font-mono">
                          {prediction.confidence_pct}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Summary Teaser */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block mb-1">
                      XAI Environmental Summary
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {prediction.explanation.summary}
                    </p>
                  </div>

                  {/* Top 3 Pollution Drivers Quick List */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block">
                      Top Contributing Factors
                    </span>
                    {prediction.top_drivers.slice(0, 3).map((driver, idx) => (
                      <div 
                        key={driver.key}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 font-mono">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-200">{driver.name}</span>
                        </div>
                        <span className="font-mono font-bold text-rose-400">
                          +{driver.impact.toFixed(1)} pts
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Validation warnings if any */}
                  {prediction.validation_warnings.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-700/40 text-[11px] text-amber-300 flex items-start space-x-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                      <span>{prediction.validation_warnings[0]}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Sliders className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                  <p className="text-xs">Adjust parameters and click &ldquo;ANALYZE POLLUTION RISK&rdquo;</p>
                </div>
              )}
            </div>

            {/* Action to jump to XAI Full Deep Dive */}
            {prediction && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={onNavigateToXai}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-colors flex items-center justify-center space-x-2 group"
                >
                  <span>INSPECT FULL XAI ATTRIBUTION & ACTION PLAN</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
