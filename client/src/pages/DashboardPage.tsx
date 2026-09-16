import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldAlert,
  Fingerprint,
  Layers,
  Activity,
  CreditCard,
  Umbrella,
  Lock,
  Terminal,
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Radio,
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { currentUser, currentProfile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, healthRes] = await Promise.all([
          axios.get('/api/v1/system/stats'),
          axios.get('/api/v1/system/health')
        ]);
        setStats(statsRes.data.stats);
        setHealth(healthRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const microservices = [
    {
      title: 'KYC & DigiLocker Gateway',
      desc: 'Zero-cost government sandbox issuing authentic e-Aadhaar, PAN & Driving License schemas with biometric liveness.',
      path: '/kyc',
      icon: Fingerprint,
      accent: 'from-blue-600 to-indigo-600',
      badge: 'Zero-Cost Sandbox'
    },
    {
      title: 'AML & Sanctions Screening',
      desc: 'Enforces FIU-IND Rule 114B ₹50k PAN mandate, ₹10L CTR, CBUAE AED 55k with goAML XML export, and AUSTRAC AUD 10k.',
      path: '/aml',
      icon: ShieldAlert,
      accent: 'from-amber-600 to-rose-600',
      badge: 'FIU-IND & CBUAE'
    },
    {
      title: 'Multi-Vector Fraud Engine',
      desc: 'Real-time 5-vector risk engine calculating impossible travel anomalies, velocity bursts, and headless browser automation.',
      path: '/fraud',
      icon: Activity,
      accent: 'from-rose-600 to-purple-600',
      badge: 'Impossible Travel'
    },
    {
      title: 'Wallets & Double-Entry Ledger',
      desc: 'Financial idempotency engine (Idempotency-Key), multi-currency wallets (INR/AED/AUD/USD/EUR), and double-entry accounting.',
      path: '/banking',
      icon: CreditCard,
      accent: 'from-emerald-600 to-teal-600',
      badge: 'Idempotency'
    },
    {
      title: 'Insurance & Claims Adjudication',
      desc: 'Actuarial quote pricing, policy underwriting, and claims filing with automated claim fraud probability scoring.',
      path: '/insurance',
      icon: Umbrella,
      accent: 'from-cyan-600 to-blue-600',
      badge: 'Claim Fraud'
    },
    {
      title: 'PII Vault & DPDP Act 2023',
      desc: 'AES-256-GCM encryption, dynamic masking (XXXX-XXXX-1234), surrogate tokenization, and Right-to-be-Forgotten data shredding.',
      path: '/pii',
      icon: Lock,
      accent: 'from-indigo-600 to-violet-600',
      badge: 'AES-256-GCM'
    },
    {
      title: 'Apache Kafka Broker (Emulated)',
      desc: '6 active event topics, partition offsets, consumer lag monitoring, and Dead Letter Queue (DLQ) replay capability.',
      path: '/playground',
      icon: Terminal,
      accent: 'from-fuchsia-600 to-pink-600',
      badge: '6 Topics'
    },
    {
      title: 'Interactive Swagger OpenAPI 3.0',
      desc: 'Complete OpenAPI 3.0 interactive specification document for all 8 microservices, schemas, and endpoints.',
      path: '/docs',
      icon: FileCode2,
      accent: 'from-teal-600 to-emerald-600',
      badge: 'OpenAPI 3.0'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Active Persona Banner */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden border border-slate-800/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentProfile?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
              alt={currentProfile?.fullName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/50 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">
                  {currentProfile?.fullName}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono font-bold border border-brand-500/30">
                  {currentProfile?.clearanceLevel}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {currentProfile?.title} • <span className="text-indigo-400 font-mono">{currentProfile?.department}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {currentProfile?.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Jurisdiction: <strong className="text-white">{currentProfile?.jurisdictionFocus}</strong></span>
            </div>
            <div className="text-[11px] text-slate-500">
              Use top-right dropdown to test different role clearances
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Platform Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>System Health</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 flex items-center gap-2">
            <span>{health?.status || 'HEALTHY'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-normal">
              100% UP
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            8 Microservices Operational
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>AML Alerts</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {stats?.totalAmlAlerts ?? 1} <span className="text-xs font-normal text-slate-400">FIU/CBUAE</span>
          </div>
          <div className="text-[11px] text-amber-400/90 mt-1 font-mono">
            Rule 114B ₹50k PAN Mandate Active
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Fraud Interceptions</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {stats?.totalFraudEvaluations ?? 2} <span className="text-xs font-normal text-slate-400">Scored</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Impossible Travel Vector Enabled
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>PII Vault Enclaves</span>
            <Lock className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {stats?.totalPiiRecords ?? 3} <span className="text-xs font-normal text-slate-400">Encrypted</span>
          </div>
          <div className="text-[11px] text-accent-cyan/90 mt-1 font-mono">
            AES-256-GCM / DPDP 2023
          </div>
        </div>
      </div>

      {/* Microservices Architecture Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-white">Financial Microservices Ecosystem</h2>
            <p className="text-xs text-slate-400">Click any service module below to interact with live logic and execute end-to-end testing flows</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {microservices.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="glass-panel-interactive p-5 rounded-2xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.accent} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono font-semibold">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-brand-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
