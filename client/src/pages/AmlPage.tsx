import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldAlert,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Search,
  Scale,
  Play,
  FileText,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AmlPage: React.FC = () => {
  const { currentProfile } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Screening form
  const [screenAmount, setScreenAmount] = useState<number>(65000);
  const [screenCurrency, setScreenCurrency] = useState<string>('INR');
  const [screenChannel, setScreenChannel] = useState<'CASH' | 'WIRE' | 'UPI'>('CASH');
  const [hasVerifiedPan, setHasVerifiedPan] = useState<boolean>(false);
  const [screenResult, setScreenResult] = useState<any>(null);

  // Sanctions search
  const [sanctionQuery, setSanctionQuery] = useState<string>('Vladimir Voronov');
  const [sanctionResult, setSanctionResult] = useState<any>(null);

  // goAML XML modal
  const [xmlModalContent, setXmlModalContent] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const url = activeTab === 'ALL' ? '/api/v1/aml/alerts' : `/api/v1/aml/alerts?jurisdiction=${activeTab}`;
      const res = await axios.get(url);
      setAlerts(res.data.alerts);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [activeTab]);

  const handleTestScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/v1/aml/screen/transaction', {
        userId: 'usr_retail_01',
        userName: 'Vikram Sharma',
        amount: screenAmount,
        currency: screenCurrency,
        channel: screenChannel,
        hasVerifiedPan
      });
      setScreenResult(res.data);
      fetchAlerts();
    } catch (err: any) {
      alert(`Screening error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleSanctionSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/v1/aml/screen/sanctions', {
        name: sanctionQuery
      });
      setSanctionResult(res.data);
    } catch (err: any) {
      alert(`Sanctions search error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleResolveAlert = async (alertId: string, status: string) => {
    try {
      await axios.patch(`/api/v1/aml/alerts/${alertId}/resolve`, {
        status,
        reviewer: currentProfile?.fullName || 'Compliance Officer',
        notes: `Adjudicated in sandbox console as ${status}`
      });
      fetchAlerts();
    } catch (err: any) {
      alert(`Resolve error: ${err.response?.data?.error || err.message}`);
    }
  };

  const loadPreset = (presetName: string) => {
    if (presetName === 'RULE_114B') {
      setScreenAmount(65000);
      setScreenCurrency('INR');
      setScreenChannel('CASH');
      setHasVerifiedPan(false);
    } else if (presetName === 'STRUCTURING') {
      setScreenAmount(49500);
      setScreenCurrency('INR');
      setScreenChannel('CASH');
      setHasVerifiedPan(false);
    } else if (presetName === 'CTR_10L') {
      setScreenAmount(1200000);
      setScreenCurrency('INR');
      setScreenChannel('CASH');
      setHasVerifiedPan(true);
    } else if (presetName === 'CBUAE_55K') {
      setScreenAmount(60000);
      setScreenCurrency('AED');
      setScreenChannel('CASH');
      setHasVerifiedPan(false);
    } else if (presetName === 'AUSTRAC_10K') {
      setScreenAmount(15000);
      setScreenCurrency('AUD');
      setScreenChannel('WIRE');
      setHasVerifiedPan(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-mono text-amber-400 font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Statutory AML & Sanctions Interception</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Anti-Money Laundering & Watchlist Screening
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-Jurisdiction Scope: India (FIU-IND Rule 114B & Rule 3 CTR), UAE (CBUAE goAML AED 55k), Australia (AUSTRAC), and UN Sanctions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-[11px] font-mono text-emerald-300">
            Multi-Jurisdiction Real-Time Engine
          </div>
          <button
            onClick={fetchAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Interactive Rules Execution Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Transaction AML Screener */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                <Scale className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Real-Time Transaction AML Screener</h2>
                <p className="text-[11px] text-slate-400">Test statutory cash thresholds and automated block enforcement</p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => loadPreset('RULE_114B')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-amber-300"
              >
                🇮🇳 ₹50k PAN Block
              </button>
              <button
                type="button"
                onClick={() => loadPreset('STRUCTURING')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-rose-300"
              >
                🇮🇳 ₹49.5k Smurf
              </button>
              <button
                type="button"
                onClick={() => loadPreset('CBUAE_55K')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-accent-cyan"
              >
                🇦🇪 AED 55k goAML
              </button>
              <button
                type="button"
                onClick={() => loadPreset('AUSTRAC_10K')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-emerald-300"
              >
                🇦🇺 AUD 10k TTR
              </button>
            </div>
          </div>

          <form onSubmit={handleTestScreening} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Amount</label>
                <input
                  type="number"
                  value={screenAmount}
                  onChange={(e) => setScreenAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Currency</label>
                <select
                  value={screenCurrency}
                  onChange={(e) => setScreenCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                >
                  <option value="INR">INR (₹ - India)</option>
                  <option value="AED">AED (د.إ - UAE)</option>
                  <option value="AUD">AUD ($ - Australia)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Channel</label>
                <select
                  value={screenChannel}
                  onChange={(e) => setScreenChannel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                >
                  <option value="CASH">CASH (Physical Deposit)</option>
                  <option value="WIRE">WIRE (RTGS / Swift)</option>
                  <option value="UPI">UPI / Instant Transfer</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasPan"
                  checked={hasVerifiedPan}
                  onChange={(e) => setHasVerifiedPan(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-brand-500"
                />
                <label htmlFor="hasPan" className="text-xs text-slate-300 cursor-pointer">
                  Customer has submitted verified Income Tax PAN Card (Rule 114B Compliance Check)
                </label>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${hasVerifiedPan ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                {hasVerifiedPan ? 'PAN VERIFIED' : 'NO PAN'}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>Evaluate Against Statutory AML Thresholds</span>
            </button>
          </form>

          {/* Screening Test Output */}
          {screenResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              screenResult.blocked
                ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                : screenResult.alertCount > 0
                ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>VERDICT: {screenResult.blocked ? 'TRANSACTION BLOCKED' : screenResult.alertCount > 0 ? 'ALERT FLAGGED (PROCEED WITH AUDIT)' : 'CLEARED STATUTORY AML'}</span>
                <span className="font-mono">{screenResult.alertCount} Alert(s) Triggered</span>
              </div>
              {screenResult.alerts?.map((a: any) => (
                <div key={a.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 space-y-1">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-amber-400 font-bold">[{a.jurisdiction}] {a.ruleName}</span>
                    <span className="text-rose-400 font-bold">{a.severity}</span>
                  </div>
                  <div className="text-[11px] text-slate-300">{a.details}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Citation: {a.legalCitation}</div>
                  {a.goAmlXmlPayload && (
                    <button
                      onClick={() => setXmlModalContent(a.goAmlXmlPayload)}
                      className="mt-1 px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-300 text-[10px] font-mono flex items-center gap-1"
                    >
                      <FileCode className="w-3 h-3" />
                      <span>View Generated UNODC goAML XML</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: UN/FATF Sanctions & PEP Watchlist */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Search className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Sanctions & PEP Watchlist</h2>
              <p className="text-[11px] text-slate-400">UN Security Council & Interpol lists</p>
            </div>
          </div>

          <form onSubmit={handleSanctionSearch} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Entity or Individual Name</label>
              <input
                type="text"
                value={sanctionQuery}
                onChange={(e) => setSanctionQuery(e.target.value)}
                placeholder="e.g. Vladimir Voronov"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Screen Against Global Sanctions</span>
            </button>
          </form>

          {sanctionResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              sanctionResult.isMatch
                ? 'bg-rose-950/50 border-rose-800 text-rose-300'
                : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>{sanctionResult.isMatch ? 'CRITICAL SANCTION MATCH' : 'NO SANCTIONS MATCH'}</span>
                <span className="font-mono">{sanctionResult.confidenceScore}% Match</span>
              </div>
              {sanctionResult.matchedEntity && (
                <div className="space-y-1 text-slate-300 font-mono text-[11px] pt-1 border-t border-rose-800/60">
                  <div>Name: <strong className="text-white">{sanctionResult.matchedEntity.name}</strong></div>
                  <div>List: {sanctionResult.matchedEntity.sourceList}</div>
                  <div>Designation: {sanctionResult.matchedEntity.designationDate}</div>
                  <div>PEP Status: {sanctionResult.matchedEntity.isPep ? 'CONFIRMED PEP' : 'NON-PEP'}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AML Alerts Registry */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white">Statutory AML Alerts Registry ({alerts.length})</h2>
            <p className="text-xs text-slate-400">All alerts generated by public law thresholds</p>
          </div>

          {/* Jurisdiction Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            {['ALL', 'FIU-IND', 'CBUAE', 'AUSTRAC'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg font-bold font-mono transition-colors ${
                  activeTab === tab ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Jurisdiction</th>
                <th className="py-3 px-4">Rule Code & Name</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {alerts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-brand-300">{a.jurisdiction}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-white font-bold">{a.ruleName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{a.legalCitation}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{a.userName}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {a.currency} {a.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      a.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-mono text-slate-300">{a.status}</span>
                  </td>
                  <td className="py-3.5 px-4 space-x-1.5 whitespace-nowrap">
                    {a.goAmlXmlPayload && (
                      <button
                        onClick={() => setXmlModalContent(a.goAmlXmlPayload)}
                        className="px-2 py-1 rounded-lg bg-blue-900/40 hover:bg-blue-800 text-blue-300 text-[10px] font-bold"
                        title="View & Download UNODC goAML XML"
                      >
                        goAML XML
                      </button>
                    )}
                    {a.status === 'OPEN' && (
                      <>
                        <button
                          onClick={() => handleResolveAlert(a.id, 'FILED_WITH_REGULATOR')}
                          className="px-2 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 text-[10px] font-bold"
                        >
                          File Regulator
                        </button>
                        <button
                          onClick={() => handleResolveAlert(a.id, 'FALSE_POSITIVE')}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* goAML XML Modal */}
      {xmlModalContent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-accent-cyan" />
                <h3 className="text-sm font-bold text-white">UNODC goAML High Cash XML Payload (CBUAE Standard)</h3>
              </div>
              <button
                onClick={() => setXmlModalContent(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl font-mono text-[11px] text-emerald-400 whitespace-pre">
              {xmlModalContent}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 font-mono">Standard: UNODC goAML 4.0 XML</span>
              <button
                onClick={() => {
                  const blob = new Blob([xmlModalContent], { type: 'application/xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `goAML_CBUAE_AED_55K.xml`;
                  a.click();
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download XML File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
