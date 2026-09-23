import React from 'react';
import { 
  Sparkles, TrendingUp, TrendingDown, CheckCircle, 
  AlertTriangle, ShieldAlert, ArrowRight, ClipboardList, Info, Flame 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, ReferenceLine, Cell 
} from 'recharts';
import { PredictionResponse, ActionRecommendation } from '../types';

interface XaiExplanationViewProps {
  prediction: PredictionResponse;
  locationName: string;
}

export const XaiExplanationView: React.FC<XaiExplanationViewProps> = ({
  prediction,
  locationName
}) => {
  // Format data for horizontal SHAP feature contribution bar chart
  const chartData = [...prediction.chart_drivers]
    .sort((a, b) => b.impact - a.impact)
    .map(d => ({
      name: d.name.length > 20 ? d.name.substring(0, 18) + '...' : d.name,
      fullName: d.name,
      impact: d.impact,
      valueFormatted: d.value_formatted,
      direction: d.direction
    }));

  const getPriorityBadge = (priority: ActionRecommendation['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/60';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-300 border-orange-500/60';
      case 'MEDIUM':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/60';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Hero Section: "Why is this river at risk?" */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-cyan-500/40 bg-gradient-to-br from-slate-900 via-[#071226] to-slate-950 backdrop-blur-xl shadow-2xl shadow-cyan-950/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Explainable AI (XAI) Attribution
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Why is {locationName} classified as{' '}
              <span className={
                prediction.risk_level === 'CRITICAL' ? 'text-rose-400 underline decoration-rose-500' :
                prediction.risk_level === 'HIGH' ? 'text-orange-400 underline decoration-orange-500' :
                prediction.risk_level === 'MODERATE' ? 'text-amber-400 underline decoration-amber-500' :
                'text-emerald-400 underline decoration-emerald-500'
              }>
                {prediction.risk_level} RISK
              </span>?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {prediction.explanation.detailed_text}
            </p>

            {/* Key contributing takeaways */}
            <div className="pt-2 space-y-1.5">
              <span className="text-xs font-bold uppercase text-slate-400 font-mono">
                Key Machine Learning Drivers:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                {prediction.explanation.key_points.map((point, i) => (
                  <li key={i} className="flex items-center space-x-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span className="line-clamp-1">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Score Badge Widget */}
          <div className="shrink-0 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-center min-w-[200px]">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              Predicted Risk Score
            </span>
            <div className="my-2 flex items-baseline space-x-1">
              <span className="text-5xl font-black text-white font-mono">
                {prediction.risk_score.toFixed(0)}
              </span>
              <span className="text-slate-400 text-sm font-semibold">/ 100</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
              prediction.risk_level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500' :
              prediction.risk_level === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border-orange-500' :
              prediction.risk_level === 'MODERATE' ? 'bg-amber-500/20 text-amber-300 border-amber-500' :
              'bg-emerald-500/20 text-emerald-300 border-emerald-500'
            }`}>
              {prediction.risk_level} SEVERITY
            </span>
            <span className="text-[10px] text-slate-400 mt-2 font-mono">
              Model Confidence: {prediction.confidence_pct}%
            </span>
          </div>

        </div>
      </div>

      {/* 2. Grid: Horizontal Feature Contribution Chart + Top Drivers Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Horizontal Feature Attribution Chart (SHAP Values) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Feature Importance & Risk Attribution (Tree SHAP)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact point contributions moving prediction from baseline ({prediction.base_value.toFixed(1)}) to final score
              </p>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="flex items-center space-x-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                <span>+ Risk Increasing</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                <span>- Risk Mitigating</span>
              </span>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis 
                  type="number" 
                  stroke="#64748b" 
                  fontSize={11}
                  tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  width={110} 
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isPositive = data.impact > 0;
                      return (
                        <div className="p-3 bg-slate-950/95 border border-slate-700 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white">{data.fullName}</p>
                          <p className="text-slate-300">Measured Value: <span className="font-mono text-cyan-300">{data.valueFormatted}</span></p>
                          <p className={isPositive ? 'text-rose-400 font-bold font-mono' : 'text-emerald-400 font-bold font-mono'}>
                            Attribution Impact: {isPositive ? `+${data.impact.toFixed(2)} pts` : `${data.impact.toFixed(2)} pts`}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {isPositive ? 'Significantly increases predicted pollution risk' : 'Acts as a natural buffering / risk-reducing factor'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={0} stroke="#475569" strokeWidth={1.5} />
                <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.impact > 0 ? (entry.impact > 8 ? '#ef4444' : '#f97316') : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 italic text-center">
            Calculated via tree decision-path attributions across 100 Random Forest estimators.
          </p>
        </div>

        {/* Top Pollution Drivers List */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                <span>Primary Pollution Drivers</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Ranked</span>
            </div>

            <div className="space-y-3 mt-4">
              {prediction.top_drivers.map((driver, idx) => (
                <div 
                  key={driver.key}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-5 h-5 rounded-lg bg-rose-950/80 border border-rose-600/40 flex items-center justify-center text-xs font-bold text-rose-300 font-mono">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-xs text-slate-100">{driver.name}</span>
                        <span className="block text-[11px] text-slate-400 font-mono">
                          Value: {driver.value_formatted}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-rose-400 block">
                        +{driver.impact.toFixed(1)} pts
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Risk Driver</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Natural Buffering / Mitigating Factors */}
              {prediction.mitigating_drivers.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block mb-2">
                    Natural Buffering Factors (Risk Mitigators)
                  </span>
                  {prediction.mitigating_drivers.slice(0, 2).map((driver) => (
                    <div 
                      key={driver.key}
                      className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs flex items-center justify-between mb-1.5"
                    >
                      <span className="font-medium text-emerald-200">{driver.name} ({driver.value_formatted})</span>
                      <span className="font-mono font-bold text-emerald-400">{driver.impact.toFixed(1)} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Baseline Ensemble Expectation: <span className="font-mono text-slate-200 font-bold">{prediction.base_value.toFixed(1)}%</span>
          </div>
        </div>

      </div>

      {/* 3. Actionable Environmental Recommendations */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-cyan-400" />
              <span>Recommended Environmental Interventions & Action Plan</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Prioritized interventions dynamically generated from top contributing pollution drivers
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {prediction.recommendations.length} Action Items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {prediction.recommendations.map((rec) => {
            const badgeClass = getPriorityBadge(rec.priority);

            return (
              <div 
                key={rec.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                      {rec.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border font-mono ${badgeClass}`}>
                      {rec.priority} PRIORITY
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">
                    {rec.title}
                  </h4>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {rec.action}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-900 text-[11px] text-slate-400 flex flex-col space-y-1">
                  <div>
                    <span className="font-semibold text-slate-300">Rationale: </span>
                    <span>{rec.rationale}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 italic">
                    {rec.disclaimer}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
