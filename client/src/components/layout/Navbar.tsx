import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  ChevronDown,
  UserCheck,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { useAuth, PersonaRole } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { currentUser, currentProfile, allPersonas, switchPersona } = useAuth();
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Layers },
    { name: 'KYC & DigiLocker', path: '/kyc', icon: Fingerprint },
    { name: 'AML Screening', path: '/aml', icon: ShieldAlert, badge: 'FIU-IND' },
    { name: 'Fraud Engine', path: '/fraud', icon: Activity },
    { name: 'Wallets & Ledger', path: '/banking', icon: CreditCard },
    { name: 'Insurance', path: '/insurance', icon: Umbrella },
    { name: 'PII Vault', path: '/pii', icon: Lock, badge: 'DPDP' },
    { name: 'Kafka & Webhooks', path: '/playground', icon: Terminal },
    { name: 'API Docs', path: '/docs', icon: FileCode2 },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent-cyan" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    ITFreeSource<span className="text-brand-500">.Academy</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono font-semibold">
                    FINTECH
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium -mt-0.5">
                  Enterprise Financial Platform
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/40 font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Area: System Status Beacon + Persona Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            {/* System Live Beacon */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE EDGE</span>
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all text-left"
              >
                <img
                  src={currentProfile?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                  alt={currentProfile?.fullName}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-brand-500/40"
                />
                <div className="hidden md:block">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {currentProfile?.fullName || 'Select Persona'}
                    <span className="text-[9px] px-1 py-0.2 rounded bg-brand-500/20 text-brand-300 font-mono">
                      {currentProfile?.clearanceLevel}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                    {currentProfile?.title}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Persona Dropdown Menu */}
              {isPersonaMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1.5">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Switch Role / Persona (8 Personas)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Instantly test compliance, risk, fraud, or customer perspectives
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-1">
                    {allPersonas.map(({ user, profile }) => {
                      const isCurrent = currentUser?.role === user.role;
                      return (
                        <button
                          key={user.role}
                          onClick={() => {
                            switchPersona(user.role as PersonaRole);
                            setIsPersonaMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                            isCurrent
                              ? 'bg-brand-600/20 border border-brand-500/30'
                              : 'hover:bg-slate-800/60 border border-transparent'
                          }`}
                        >
                          <img
                            src={profile.avatarUrl}
                            alt={profile.fullName}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white truncate">
                                {profile.fullName}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] text-brand-400 font-mono font-bold">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {profile.title}
                            </div>
                            <div className="text-[9px] text-indigo-400/90 font-mono truncate">
                              {profile.jurisdictionFocus}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="xl:hidden py-3 border-t border-slate-800 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-900"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-brand-400" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700 font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
