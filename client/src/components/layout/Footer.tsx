import React from 'react';
import { ShieldCheck, Scale, Globe2, BookOpen, GitFork } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-3">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>ITFreeSource Academy</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Enterprise FinTech, KYC, AML, Fraud Detection, Insurance, and Sensitive PII Vault Monorepo designed for real-world automated testing, compliance engineering, and performance auditing.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-3">
              <Scale className="w-4 h-4 text-accent-cyan" />
              <span>Statutory Compliance Scope</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li className="flex items-center gap-1.5">
                <span>🇮🇳</span> <span>India: FIU-IND / RBI Rule 114B (₹50k PAN)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>🇮🇳</span> <span>PMLA Rule 3 CTR (₹10L) & CBWTR (₹5L)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>🇦🇪</span> <span>UAE: CBUAE goAML (AED 55k+ High Cash)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>🇦🇺</span> <span>Australia: AUSTRAC TTR (AUD 10k+)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>🌐</span> <span>FATF / UN Security Council Sanctions</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-3">
              <Globe2 className="w-4 h-4 text-accent-emerald" />
              <span>Privacy & Architecture</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>Digital Personal Data Protection (DPDP) Act 2023</li>
              <li>AES-256-GCM Sensitive Data Vault & Dynamic Masking</li>
              <li>Zero-Cost In-App DigiLocker Sandbox Issuer</li>
              <li>Apache Kafka Event Streaming Bus (6 Topics)</li>
              <li>Enterprise Webhooks with HMAC-SHA256 Signatures</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-3">
              <BookOpen className="w-4 h-4 text-brand-400" />
              <span>Companion Repositories</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>
                <a
                  href="https://github.com/itfreesource-academy/fintech-playwright-ts-harness"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-400 transition-colors flex items-center gap-1"
                >
                  <GitFork className="w-3 h-3" />
                  <span>fintech-playwright-ts-harness</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/itfreesource-academy/itfreesource-academy-book-store"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-400 transition-colors flex items-center gap-1"
                >
                  <GitFork className="w-3 h-3" />
                  <span>itfreesource-academy-book-store</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/itfreesource-academy/fintech-jenkins-shared-library"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-400 transition-colors flex items-center gap-1"
                >
                  <GitFork className="w-3 h-3" />
                  <span>fintech-jenkins-shared-library</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © 2026 ITFreeSource Academy. Licensed under MIT. All statutory citations sourced from official government gazettes.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-mono">0% NDA Conflict - Strictly Non-US Regulatory Public Law</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
