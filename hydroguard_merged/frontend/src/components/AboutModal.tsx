import React from 'react';
import { 
  X, Droplets, Cpu, Sparkles, ShieldCheck, 
  Layers, CheckCircle2, AlertTriangle, BookOpen 
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-lg shadow-cyan-500/20">
            <Droplets className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-mono tracking-tight">
              HYDROGUARD-XAI
            </h2>
            <p className="text-sm text-cyan-400 font-semibold">
              Explainable AI Framework for Early River Pollution Risk Prediction
            </p>
          </div>
        </div>

        <div className="space-y-6 mt-6 text-slate-300 text-sm leading-relaxed">
          
          {/* Problem & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <h3 className="text-sm font-bold text-rose-400 uppercase font-mono mb-2 flex items-center space-x-1.5">
                <span>The Problem</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Conventional river pollution monitoring relies heavily on manual grab sampling and delayed laboratory testing. By the time contamination is officially confirmed, toxic pollutants may have dispersed downstream, contaminating drinking water intakes and degrading fragile river ecosystems.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <h3 className="text-sm font-bold text-cyan-400 uppercase font-mono mb-2 flex items-center space-x-1.5">
                <span>The Solution</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                HydroGuard-XAI combines continuous IoT telemetry, machine learning ensembles, tree-based feature explainability (XAI), and early warning analytics. It shifts environmental surveillance from reactive damage control to proactive, explainable risk prevention.
              </p>
            </div>
          </div>

          {/* Key Innovations */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Core Innovation Pillars</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-xs font-bold text-cyan-300 block mb-1">1. PREDICT</span>
                <p className="text-[11px] text-slate-400">
                  Dual Random Forest Classifier and Regressor predicting continuous risk score (0-100) and severity tiers (LOW, MODERATE, HIGH, CRITICAL).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-xs font-bold text-cyan-300 block mb-1">2. EXPLAIN (XAI)</span>
                <p className="text-[11px] text-slate-400">
                  Tree SHAP exact feature attributions and dynamic natural language narrative synthesis showing WHY the risk score was generated.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-xs font-bold text-cyan-300 block mb-1">3. ACT</span>
                <p className="text-[11px] text-slate-400">
                  Prioritized, context-aware operational recommendations for rapid field dispatch, utility intake alerts, and source audits.
                </p>
              </div>
            </div>
          </div>

          {/* Model Architecture & Benchmark Metrics */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase font-mono mb-2 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              <span>Prototype Evaluation Metrics</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Accuracy</span>
                <span className="text-lg font-black text-cyan-400 font-mono">94.6%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">F1-Score</span>
                <span className="text-lg font-black text-cyan-400 font-mono">94.3%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Regression MAE</span>
                <span className="text-lg font-black text-cyan-400 font-mono">1.00 pt</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">R² Correlation</span>
                <span className="text-lg font-black text-cyan-400 font-mono">0.997</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 italic text-center">
              Metrics calculated on 2,400 prototype simulated river telemetry observations covering diverse hydro-chemical scenarios.
            </p>
          </div>

          {/* Statutory / Regulatory Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-amber-300 text-xs flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-bold block text-amber-200">Prototype Decision-Support Notice:</span>
              <p className="mt-0.5 text-amber-300/90 leading-relaxed">
                This prototype is intended for innovation demonstration, decision support, and field-verification assistance. Predictions and automated recommendations should not replace accredited laboratory testing, certified ground sensors, or official regulatory statutory assessments.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider transition-colors"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
};
