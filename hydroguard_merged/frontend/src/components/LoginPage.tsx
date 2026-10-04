import React, { useState } from 'react';
import { 
  Droplets, Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles, 
  Activity, ArrowRight, AlertCircle, CheckCircle2, Waves, Cpu
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const DEMO_EMAIL = 'admin@hydroguard.ai';
  const DEMO_PASSWORD = 'hydroguard123';

  const handleFillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    // Simulate realistic authentication delay for a polished UX feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (cleanEmail === DEMO_EMAIL.toLowerCase() && cleanPassword === DEMO_PASSWORD) {
      // Store auth state
      try {
        localStorage.setItem('hydroguard_auth', 'true');
        localStorage.setItem(
          'hydroguard_user',
          JSON.stringify({
            email: cleanEmail,
            role: 'Environmental Officer / Admin',
            authenticatedAt: new Date().toISOString()
          })
        );
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
      setIsLoading(false);
      onLoginSuccess();
    } else {
      setIsLoading(false);
      setError('Invalid email or password. Please use the demo credentials below.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Decorative Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl overflow-hidden relative z-10">
        
        {/* LEFT SIDE: Environmental & AI Branding */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between relative bg-gradient-to-br from-[#061126]/90 via-[#07193b]/70 to-[#040c1e]/90 border-b lg:border-b-0 lg:border-r border-slate-800/80">
          
          {/* Subtle Grid / Water pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen Environmental Intelligence</span>
            </div>

            <div className="flex items-center space-x-3.5 pt-2">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 shadow-lg shadow-cyan-500/30 text-white font-bold">
                <Droplets className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-400"></span>
                </span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-200 to-blue-400 font-mono">
                  HYDROGUARD-XAI
                </h1>
                <p className="text-xs text-slate-400 font-medium tracking-wide">
                  Explainable AI for River Pollution Risk Prediction
                </p>
              </div>
            </div>
          </div>

          {/* Core Mission & Feature Highlights */}
          <div className="relative z-10 my-8 sm:my-10 space-y-6">
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              AI-powered monitoring and explainable risk assessment for healthier rivers. Predict water quality anomalies before ecological damage occurs with Tree-SHAP attribution.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Tree SHAP Explainability:</span> Clear, transparent root-cause breakdown of exact chemical drivers (BOD, Turbidity, DO).
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <Activity className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Real-Time River Surveillance:</span> Live telemetry with early surge warnings across multiple monitoring stations.
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <Waves className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Actionable Interventions:</span> Targeted remediation guidelines generated instantly for river basin authorities.
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Live Telemetry Status Pill */}
          <div className="relative z-10 pt-4 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-slate-300">System Ready • Model Loaded</span>
            </div>
            <span className="text-cyan-400 font-semibold">v1.0 Hackathon Demo</span>
          </div>

        </div>

        {/* RIGHT SIDE: Centered Login Card */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-[#070e20]/60">
          
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center space-x-2">
                <span>Welcome Back</span>
                <span className="text-cyan-400">.</span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Sign in to continue to your monitoring dashboard
              </p>
            </div>

            {/* Error Message Box */}
            {error && (
              <div 
                role="alert"
                className="flex items-start space-x-3 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs sm:text-sm animate-shake"
              >
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Field */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="login-email" 
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="admin@hydroguard.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="login-password" 
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:via-teal-400 hover:to-blue-500 text-slate-950 font-bold text-sm font-mono uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials Box */}
            <div className="pt-3">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-slate-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-cyan-300 font-mono font-bold">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>HACKATHON DEMO ACCESS</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-2 hover:bg-cyan-900/40 px-2 py-0.5 rounded transition-all cursor-pointer font-bold"
                  >
                    Auto-fill
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Email</span>
                    <span className="text-cyan-200 font-medium select-all">admin@hydroguard.ai</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Password</span>
                    <span className="text-cyan-200 font-medium select-all">hydroguard123</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-tight">
                  Click <strong className="text-cyan-300">Auto-fill</strong> above to quickly load credentials for test evaluation.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Footer Info */}
      <div className="absolute bottom-4 text-center text-xs text-slate-600 font-mono">
        HYDROGUARD-XAI &bull; Explainable River Intelligence System
      </div>
    </div>
  );
};
