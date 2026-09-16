import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Activity,
  ShieldCheck,
  AlertOctagon,
  Plane,
  Bot,
  Gauge,
  Zap,
  RefreshCw,
  ShieldAlert,
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FraudPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Evaluator Form State
  const [amount, setAmount] = useState<number>(25000);
  const [isVpn, setIsVpn] = useState<boolean>(false);
  const [isHeadless, setIsHeadless] = useState<boolean>(false);
  const [currentCity, setCurrentCity] = useState<string>('Mumbai');
  const [latestEval, setLatestEval] = useState<any>(null);

  const fetchEvaluations = async () => {
    try {
      const res = await axios.get('/api/v1/fraud/evaluations');
      setEvaluations(res.data.evaluations);
    } catch (err) {
      console.error('Failed to load fraud evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleEvaluate = async (customParams?: any) => {
    try {
      const payload = customParams || {
        userId: 'usr_retail_01',
        amount,
        currency: 'INR',
        isVpnOrProxy: isVpn,
        userAgent: isHeadless
          ? 'Mozilla/5.0 HeadlessChrome/120.0 (Puppeteer Automation Bot)'
          : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        currentGeo:
          currentCity === 'Mumbai'
            ? { lat: 19.0760, lng: 72.8777, city: 'Mumbai' }
            : { lat: 51.5074, lng: -0.1278, city: 'London' }
      };

      const res = await axios.post('/api/v1/fraud/evaluate', payload);
      setLatestEval(res.data.evaluation);
      fetchEvaluations();
    } catch (err: any) {
      alert(`Fraud evaluation error: ${err.response?.data?.error || err.message}`);
    }
  };

  // Scenario 1: Impossible Travel
  const handleSimulateImpossibleTravel = async () => {
    try {
      const res = await axios.post('/api/v1/fraud/test-impossible-travel');
      setLatestEval(res.data.evaluation);
      fetchEvaluations();
    } catch (err: any) {
      alert(`Impossible travel error: ${err.response?.data?.error || err.message}`);
    }
  };

  // Scenario 2: Headless Bot Attack
  const handleSimulateBotAttack = () => {
    setIsHeadless(true);
    setIsVpn(true);
    handleEvaluate({
      userId: 'usr_bot_hacker_99',
      amount: 450000,
      currency: 'INR',
      isVpnOrProxy: true,
      userAgent: 'Mozilla/5.0 HeadlessChrome/120.0 (Selenium WebDriver / Puppeteer)',
      deviceFingerprint: 'unknown'
    });
  };

  // Scenario 3: Clean retail transaction
  const handleSimulateClean = () => {
    setIsHeadless(false);
    setIsVpn(false);
    setCurrentCity('Mumbai');
    handleEvaluate({
      userId: 'usr_retail_01',
      amount: 1500,
      currency: 'INR',
      isVpnOrProxy: false,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
      deviceFingerprint: 'fp_valid_iphone_safari',
      currentGeo: { lat: 19.0760, lng: 72.8777, city: 'Mumbai' }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-mono text-rose-400 font-semibold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Real-Time Multi-Vector Fraud Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Anomaly Detection & Behavioral Risk Scoring
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluates 5 orthogonal vectors: IP/Geo impossible travel, transaction velocity bursts, device fingerprinting, and baseline anomaly.
          </p>
        </div>

        <button
          onClick={fetchEvaluations}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 1-Click Scenario Trigger Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-400" />
          <span>Automated Scenario Presets:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSimulateImpossibleTravel}
            className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Simulate Impossible Travel (Mumbai → London)</span>
          </button>

          <button
            onClick={handleSimulateBotAttack}
            className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Simulate Headless Bot Attack</span>
          </button>

          <button
            onClick={handleSimulateClean}
            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Simulate Low-Risk Transaction</span>
          </button>
        </div>
      </div>

      {/* Multi-Vector Simulator & Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Form */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Gauge className="w-4 h-4 text-brand-400" />
            <span>Custom Multi-Vector Risk Vector Adjuster</span>
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Transaction Amount (INR)</span>
                <span className="font-mono text-brand-400">₹{amount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="600000"
                step="5000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Current Geolocation</label>
                <select
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                >
                  <option value="Mumbai">Mumbai, IN (19.076° N)</option>
                  <option value="London">London, UK (51.507° N)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Device Environment</label>
                <select
                  value={isHeadless ? 'HEADLESS' : 'BROWSER'}
                  onChange={(e) => setIsHeadless(e.target.value === 'HEADLESS')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                >
                  <option value="BROWSER">Real Safari / Chrome</option>
                  <option value="HEADLESS">Headless Puppeteer Bot</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
              <label htmlFor="vpnToggle" className="text-xs text-slate-300 cursor-pointer">
                Simulate Anonymizing Proxy / Tor Exit Node IP
              </label>
              <input
                type="checkbox"
                id="vpnToggle"
                checked={isVpn}
                onChange={(e) => setIsVpn(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-brand-500 cursor-pointer"
              />
            </div>

            <button
              onClick={() => handleEvaluate()}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all"
            >
              Run Multi-Vector Risk Calculation
            </button>
          </div>
        </div>

        {/* Live Risk Score Output Gauge Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Risk Engine Real-Time Output
              </span>
              {latestEval && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  latestEval.decision === 'APPROVE'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : latestEval.decision === 'CHALLENGE_MFA'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {latestEval.decision}
                </span>
              )}
            </div>

            {latestEval ? (
              <div className="space-y-4">
                {/* Gauge Score Number */}
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">
                    {latestEval.totalRiskScore}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 100 Risk Score</span>
                  <span className="ml-auto text-xs font-mono font-bold text-brand-300">
                    Level: {latestEval.riskLevel}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      latestEval.totalRiskScore >= 80
                        ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                        : latestEval.totalRiskScore >= 40
                        ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                        : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                    }`}
                    style={{ width: `${latestEval.totalRiskScore}%` }}
                  />
                </div>

                {/* 5-Vector Breakdown Bars */}
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px] font-mono">
                    <span>IP / Geo Risk (Max 25):</span>
                    <strong className="text-white">{latestEval.factorBreakdown.ipGeoRisk} pts</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] font-mono">
                    <span>Velocity Risk (Max 25):</span>
                    <strong className="text-white">{latestEval.factorBreakdown.velocityRisk} pts</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] font-mono">
                    <span>Device Fingerprint Risk (Max 20):</span>
                    <strong className="text-white">{latestEval.factorBreakdown.deviceFingerprintRisk} pts</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] font-mono">
                    <span>Anomaly Risk (Max 15):</span>
                    <strong className="text-white">{latestEval.factorBreakdown.anomalyRisk} pts</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] font-mono">
                    <span>Amount Risk (Max 15):</span>
                    <strong className="text-white">{latestEval.factorBreakdown.amountRisk} pts</strong>
                  </div>
                </div>

                {/* Triggered Reasons */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400 font-mono">Triggered Heuristics:</div>
                  <ul className="text-xs text-slate-300 space-y-0.5">
                    {latestEval.reasons?.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-brand-400">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Run evaluation or trigger a scenario preset above to see live multi-vector breakdown.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Evaluations History Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
        <h2 className="text-sm font-bold text-white">Recent Fraud Evaluations Log ({evaluations.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Evaluation ID</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Triggered Rules</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {evaluations.map((ev) => (
                <tr key={ev.evaluationId} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 text-brand-300 font-mono">{ev.evaluationId.slice(0, 16)}...</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{ev.totalRiskScore}/100</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">{ev.riskLevel}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      ev.decision === 'APPROVE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : ev.decision === 'CHALLENGE_MFA'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {ev.decision}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                    {ev.triggeredRules?.join(', ') || 'NONE'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(ev.evaluatedAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
