import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Umbrella,
  ShieldCheck,
  FilePlus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coins,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const InsurancePage: React.FC = () => {
  const { currentUser, currentProfile } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quote Calculator State
  const [selectedProduct, setSelectedProduct] = useState<string>('prd_health_01');
  const [userAge, setUserAge] = useState<number>(32);
  const [coverageAmount, setCoverageAmount] = useState<number>(500000);
  const [quoteResult, setQuoteResult] = useState<any>(null);

  // Claim Form State
  const [claimPolicyId, setClaimPolicyId] = useState<string>('');
  const [claimAmount, setClaimAmount] = useState<number>(35000);
  const [claimDescription, setClaimDescription] = useState<string>('Emergency hospitalization in Lilavati Hospital');

  const fetchInsuranceData = async () => {
    try {
      const [prodRes, polRes, clmRes] = await Promise.all([
        axios.get('/api/v1/insurance/products'),
        axios.get('/api/v1/insurance/policies'),
        axios.get('/api/v1/insurance/claims')
      ]);
      setProducts(prodRes.data.products);
      setPolicies(prodRes.data.policies);
      setClaims(clmRes.data.claims);

      if (polRes.data.policies.length > 0) {
        setClaimPolicyId(polRes.data.policies[0].id);
      }
    } catch (err) {
      console.error('Failed to load insurance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsuranceData();
  }, []);

  const handleCalculateQuote = async () => {
    try {
      const res = await axios.post('/api/v1/insurance/quote', {
        productId: selectedProduct,
        userAge,
        requestedCoverage: coverageAmount
      });
      setQuoteResult(res.data.quote);
    } catch (err: any) {
      alert(`Quote calculation error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleIssuePolicy = async () => {
    try {
      const res = await axios.post('/api/v1/insurance/policies', {
        userId: currentUser?.id || 'usr_retail_01',
        productId: selectedProduct,
        coverageAmount,
        userAge
      });
      alert(`Policy ${res.data.policy.policyNumber} successfully issued!`);
      fetchInsuranceData();
    } catch (err: any) {
      alert(`Policy issuance error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleFileClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/v1/insurance/claims', {
        policyId: claimPolicyId,
        userId: currentUser?.id || 'usr_retail_01',
        claimAmount,
        description: claimDescription
      });
      alert(`Claim filed! Number: ${res.data.claim.claimNumber} (Fraud Risk Score: ${res.data.claim.claimFraudScore}/100)`);
      fetchInsuranceData();
    } catch (err: any) {
      alert(`Claim error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleAdjudicateClaim = async (claimId: string, status: string) => {
    try {
      await axios.patch(`/api/v1/insurance/claims/${claimId}/adjudicate`, {
        status,
        reviewer: currentProfile?.fullName || 'Sarah Chen (Underwriter)',
        notes: `Adjudicated in console as ${status}`
      });
      fetchInsuranceData();
    } catch (err: any) {
      alert(`Adjudication error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            <Umbrella className="w-4 h-4" />
            <span>Insurance & Actuarial Underwriting</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Policy Underwriting & Claims Fraud Scoring
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Actuarial premium pricing models, digital policy issuance, and automated claims fraud scoring.
          </p>
        </div>

        <button
          onClick={fetchInsuranceData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Products Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              setSelectedProduct(p.id);
              setCoverageAmount(p.maxCoverageLimit / 2);
            }}
            className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedProduct === p.id ? 'border-brand-500 ring-1 ring-brand-500/50 bg-slate-900/90' : 'border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                {p.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                From ₹{p.baseAnnualPremium.toLocaleString()}/yr
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{p.name}</h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{p.description}</p>
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Max Cover:</span>
              <strong className="text-white">₹{(p.maxCoverageLimit / 100000).toFixed(1)} Lakhs</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Quote Calculator & Claims Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Actuarial Quote Engine */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-brand-400" />
            <span>Actuarial Quote Calculator & Policy Underwriter</span>
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Coverage Amount</span>
                <span className="font-mono text-brand-300">₹{coverageAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="100000"
                max="2000000"
                step="50000"
                value={coverageAmount}
                onChange={(e) => setCoverageAmount(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Policyholder Age</span>
                <span className="font-mono text-slate-300">{userAge} Years</span>
              </div>
              <input
                type="range"
                min="18"
                max="65"
                value={userAge}
                onChange={(e) => setUserAge(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleCalculateQuote}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs transition-all"
              >
                Calculate Premium Quote
              </button>

              <button
                onClick={handleIssuePolicy}
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all"
              >
                Issue Digital Policy
              </button>
            </div>

            {quoteResult && (
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/80 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-cyan-300">
                  <span>ACTUARIAL QUOTE GENERATED</span>
                  <span className="text-base font-black text-white">
                    ₹{quoteResult.annualPremium.toLocaleString()} / year
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  Product: {quoteResult.product.name} • Coverage: ₹{coverageAmount.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Claim with Fraud Score */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FilePlus className="w-4 h-4 text-cyan-400" />
            <span>File Insurance Claim (With Automated Fraud Scoring)</span>
          </h2>

          <form onSubmit={handleFileClaim} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Select Active Policy</label>
              <select
                value={claimPolicyId}
                onChange={(e) => setClaimPolicyId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
              >
                {policies.map((pol) => (
                  <option key={pol.id} value={pol.id}>
                    {pol.policyNumber} - {pol.productName} (Cover: ₹{pol.coverageAmount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Claim Amount (INR)</label>
              <input
                type="number"
                value={claimAmount}
                onChange={(e) => setClaimAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Claim Incident Description</label>
              <textarea
                value={claimDescription}
                onChange={(e) => setClaimDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              Submit Claim for Underwriting Review
            </button>
          </form>
        </div>
      </div>

      {/* Claims Registry & Adjudication */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
        <h2 className="text-sm font-bold text-white">Claims Adjudication Registry ({claims.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Claim Number</th>
                <th className="py-3 px-4">Policy Number</th>
                <th className="py-3 px-4">Claim Amount</th>
                <th className="py-3 px-4">Fraud Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 text-white font-bold font-mono">{c.claimNumber}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">{c.policyNumber}</td>
                  <td className="py-3.5 px-4 text-white font-mono font-bold">
                    ₹{c.claimAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`font-bold ${c.claimFraudScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {c.claimFraudScore}/100
                    </span>{' '}
                    <span className="text-[10px] text-slate-400">({c.fraudRiskLevel})</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      c.status === 'APPROVED' || c.status === 'PAID'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : c.status === 'REJECTED'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 space-x-1.5">
                    {c.status === 'FILED' && (
                      <>
                        <button
                          onClick={() => handleAdjudicateClaim(c.id, 'APPROVED')}
                          className="px-2 py-1 rounded bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 text-[10px] font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAdjudicateClaim(c.id, 'REJECTED')}
                          className="px-2 py-1 rounded bg-rose-900/50 hover:bg-rose-800 text-rose-300 text-[10px] font-bold"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {c.status === 'APPROVED' && (
                      <button
                        onClick={() => handleAdjudicateClaim(c.id, 'PAID')}
                        className="px-2 py-1 rounded bg-blue-900/50 hover:bg-blue-800 text-blue-300 text-[10px] font-bold"
                      >
                        Disburse Payout
                      </button>
                    )}
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
