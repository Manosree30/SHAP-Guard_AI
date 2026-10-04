import React, { useState, useEffect, useRef } from 'react';
import { 
  Header 
} from './components/Header';
import { OverviewCards } from './components/OverviewCards';
import { EarlyWarningBanner } from './components/EarlyWarningBanner';
import { RiverAnalysisForm } from './components/RiverAnalysisForm';
import { ParameterStatusMatrix } from './components/ParameterStatusMatrix';
import { XaiExplanationView } from './components/XaiExplanationView';
import { TrendsDashboard } from './components/TrendsDashboard';
import { InteractiveMap } from './components/InteractiveMap';
import { AlertsPanel } from './components/AlertsPanel';
import { AboutModal } from './components/AboutModal';
import { LoginPage } from './components/LoginPage';

import { 
  StationItem, WaterQualityParams, PredictionResponse, 
  AlertItem, DemoScenario, EarlyWarningDetails 
} from './types';
import { 
  fetchStations, fetchAlerts, fetchScenarios, 
  predictWaterQuality, simulateStreamStep 
} from './services/api';
import { RefreshCw, Radio, Sparkles } from 'lucide-react';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hydroguard_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stations, setStations] = useState<StationItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('Cauvery River');
  const [demoScenarios, setDemoScenarios] = useState<DemoScenario[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  
  // Current active parameters
  const [params, setParams] = useState<WaterQualityParams>({
    ph: 6.65,
    turbidity: 58.0,
    dissolved_oxygen: 2.9,
    temperature: 29.5,
    conductivity: 780.0,
    tds: 620.0,
    bod: 9.5,
    cod: 42.0,
    rainfall: 6.0,
    water_flow: 42.0
  });

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [lastTelemetryTimestamp, setLastTelemetryTimestamp] = useState<string>(() => {
    const d = new Date();
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  });
  const [earlyWarning, setEarlyWarning] = useState<EarlyWarningDetails | null>({
    date: 'Recent Stream Observation',
    current_risk: 61.2,
    previous_risk: 42.1,
    delta: 19.1,
    message: 'Risk increased by +19.1 percentage points compared with baseline observation (42.1% → 61.2%).'
  });

  const streamingTimerRef = useRef<number | null>(null);

  // Initial Data Fetch on Authentication
  useEffect(() => {
    if (!isAuthenticated) return;

    async function init() {
      setIsInitialLoading(true);
      try {
        const [stList, scList, alList] = await Promise.all([
          fetchStations().catch(() => []),
          fetchScenarios().catch(() => []),
          fetchAlerts().catch(() => [])
        ]);

        setStations(stList);
        setDemoScenarios(scList);
        setAlerts(alList);

        // Run initial prediction for default Cauvery station
        const initialStation = stList.find(s => s.name === 'Cauvery River') || stList[0];
        if (initialStation) {
          setParams(initialStation.parameters);
          setSelectedLocation(initialStation.name);
          const initialPred = await predictWaterQuality(initialStation.parameters, initialStation.name);
          setPrediction(initialPred);
        }
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      } finally {
        setIsInitialLoading(false);
      }
    }
    init();
  }, [isAuthenticated]);

  // Handle Predict Action
  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const pred = await predictWaterQuality(params, selectedLocation);
      setPrediction(pred);
      const now = new Date();
      setLastTelemetryTimestamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today');

      // Update stations live state in local list
      setStations(prev => prev.map(s => {
        if (s.name === selectedLocation) {
          return {
            ...s,
            current_risk_score: pred.risk_score,
            current_risk_level: pred.risk_level,
            wqi: pred.wqi,
            parameters: { ...params }
          };
        }
        return s;
      }));
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Station Change
  const handleSelectLocation = (locName: string) => {
    setSelectedLocation(locName);
    const matched = stations.find(s => s.name === locName);
    if (matched) {
      setParams(matched.parameters);
      predictWaterQuality(matched.parameters, locName).then(pred => {
        setPrediction(pred);
        if (matched.spike_alert) {
          const delta = matched.current_risk_score - matched.previous_risk_score;
          setEarlyWarning({
            date: matched.last_updated,
            current_risk: matched.current_risk_score,
            previous_risk: matched.previous_risk_score,
            delta: Math.round(delta * 10) / 10,
            message: `Risk surged by +${delta.toFixed(1)} percentage points compared with the previous observation.`
          });
        } else {
          setEarlyWarning(null);
        }
      });
    }
  };

  // Handle Demo Scenario Selection
  const handleSelectScenario = (scenario: DemoScenario) => {
    setParams(scenario.parameters);
    predictWaterQuality(scenario.parameters, selectedLocation).then(pred => {
      setPrediction(pred);
    });
  };

  // Handle Map Inspect Station Action
  const handleAnalyzeFromMap = (st: StationItem) => {
    setSelectedLocation(st.name);
    setParams(st.parameters);
    predictWaterQuality(st.parameters, st.name).then(pred => {
      setPrediction(pred);
      setActiveTab('analyze');
    });
  };

  // Simulated IoT Streaming effect
  useEffect(() => {
    if (isStreaming) {
      streamingTimerRef.current = window.setInterval(async () => {
        try {
          const targetStation = stations.find(s => s.name === selectedLocation) || stations[0];
          const streamRes = await simulateStreamStep(targetStation?.id || 'cauvery');
          setParams(streamRes.stream_reading);
          setPrediction(streamRes);
          const now = new Date();
          setLastTelemetryTimestamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } catch (err) {
          console.error('Stream simulation error:', err);
        }
      }, 3500);
    } else {
      if (streamingTimerRef.current) {
        clearInterval(streamingTimerRef.current);
      }
    }

    return () => {
      if (streamingTimerRef.current) {
        clearInterval(streamingTimerRef.current);
      }
    };
  }, [isStreaming, selectedLocation, stations]);

  // Handle Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem('hydroguard_auth');
      localStorage.removeItem('hydroguard_user');
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
    setIsStreaming(false);
    setIsAuthenticated(false);
  };

  // If not authenticated, display the Login Screen directly
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center space-y-4 text-slate-300">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-xl shadow-cyan-500/30 animate-pulse">
          <RefreshCw className="w-8 h-8 animate-spin text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold font-mono text-cyan-400">HYDROGUARD-XAI</h2>
          <p className="text-xs text-slate-400 mt-1">Initializing Machine Learning & XAI Attribution Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stations={stations}
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
        alertCount={alerts.length}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        onOpenAbout={() => setIsAboutOpen(true)}
        demoScenarios={demoScenarios}
        onSelectScenario={handleSelectScenario}
        onLogout={handleLogout}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Simulated Streaming Ticker Indicator */}
        {isStreaming && (
          <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold font-mono">SIMULATED IoT SENSOR STREAM ACTIVE:</span>
              <span>Receiving simulated telemetry packets with dynamic environmental fluctuation for {selectedLocation} (Demo Mode)</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-400 font-bold">{lastTelemetryTimestamp}</span>
          </div>
        )}

        {/* Tab 1: DASHBOARD (Overview & Immediate 10-Second Judge Clarity) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Overview Metric Cards */}
            <OverviewCards
              location={selectedLocation}
              riskLevel={prediction?.risk_level || 'HIGH'}
              riskScore={prediction?.risk_score || 78.4}
              wqi={prediction?.wqi || 48.2}
              lastUpdated={lastTelemetryTimestamp}
              confidencePct={prediction?.confidence_pct || 91}
            />

            {/* Early Warning Surge Banner (if active) */}
            <EarlyWarningBanner
              details={earlyWarning}
              locationName={selectedLocation}
            />

            {/* Parameter Status Matrix */}
            {prediction && (
              <ParameterStatusMatrix statuses={prediction.parameter_statuses} />
            )}

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveTab('analyze')}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:scale-[1.01] group backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                    Experiment & Simulate
                  </span>
                  <span className="text-xs text-slate-500 font-mono">01 →</span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Analyze River Parameters
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust water quality sliders or load 1-click test scenarios to run real-time ML risk predictions.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('xai')}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:scale-[1.01] group backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                    Explainable AI
                  </span>
                  <span className="text-xs text-slate-500 font-mono">02 →</span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Inspect WHY River is at Risk
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  View exact Tree SHAP feature attributions, dominant pollution drivers, and targeted action plans.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('trends')}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:scale-[1.01] group backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                    Time-Series Surveillance
                  </span>
                  <span className="text-xs text-slate-500 font-mono">03 →</span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Historical Trends & Timeline
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Track 7-day, 30-day, and 90-day parameter fluctuations and sudden surge anomaly timestamps.
                </p>
              </div>
            </div>

            {/* Geospatial Overview */}
            <InteractiveMap
              stations={stations}
              selectedLocation={selectedLocation}
              onSelectStation={handleSelectLocation}
              onAnalyzeStation={handleAnalyzeFromMap}
            />
          </div>
        )}

        {/* Tab 2: ANALYZE RIVER (Interactive Two-Column Lab) */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            <RiverAnalysisForm
              params={params}
              onChangeParams={setParams}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              prediction={prediction}
              selectedLocation={selectedLocation}
              demoScenarios={demoScenarios}
              onSelectScenario={handleSelectScenario}
              onNavigateToXai={() => setActiveTab('xai')}
            />

            {prediction && (
              <ParameterStatusMatrix statuses={prediction.parameter_statuses} />
            )}
          </div>
        )}

        {/* Tab 3: XAI EXPLANATION (Explainability Deep Dive & Recommendations) */}
        {activeTab === 'xai' && (
          prediction ? (
            <XaiExplanationView
              prediction={prediction}
              locationName={selectedLocation}
            />
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <Sparkles className="w-10 h-10 mx-auto text-cyan-400 animate-pulse mb-3" />
              <p className="text-sm">Run an analysis in the &ldquo;Analyze River&rdquo; lab to generate XAI explanations.</p>
              <button
                onClick={() => setActiveTab('analyze')}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono uppercase"
              >
                Go to Analysis Lab
              </button>
            </div>
          )
        )}

        {/* Tab 4: TRENDS & TIMELINE */}
        {activeTab === 'trends' && (
          <TrendsDashboard locationName={selectedLocation} />
        )}

        {/* Tab 5: RIVER MAP */}
        {activeTab === 'map' && (
          <InteractiveMap
            stations={stations}
            selectedLocation={selectedLocation}
            onSelectStation={handleSelectLocation}
            onAnalyzeStation={handleAnalyzeFromMap}
          />
        )}

        {/* Tab 6: ALERTS */}
        {activeTab === 'alerts' && (
          <AlertsPanel
            alerts={alerts}
            onSelectStation={handleSelectLocation}
            onNavigateToTab={setActiveTab}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#060c1c]/80 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HYDROGUARD-XAI — Explainable AI River Pollution Risk Prediction Prototype</span>
          <span>Decision-Support Prototype &bull; Student Innovation Demonstration</span>
        </div>
      </footer>

      {/* About & Architecture Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

    </div>
  );
}
export default App;
