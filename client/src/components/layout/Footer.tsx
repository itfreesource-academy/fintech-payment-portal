import React, { useState } from 'react';
import { ShieldCheck, Scale, Globe2, BookOpen, GitFork, AlertTriangle, FileText, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);

  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Prominent Educational Warning Banner */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white">EDUCATIONAL & ACADEMIC RESEARCH PURPOSES ONLY:</span>{' '}
              <span className="text-slate-300">
                This project is an open-source test automation reference architecture. It is NOT an authorized bank, payment aggregator, or insurer. Zero real financial transactions or fiat settlement. All data and personas are 100% synthetic.
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsDisclaimerModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Legal Disclaimer & Citations</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
            <span className="text-emerald-400 font-mono">Open-Source Reference Architecture & QA Test Sandbox</span>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer Modal */}
      {isDisclaimerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Statutory References & Zero-Liability Legal Terms</h3>
              </div>
              <button
                onClick={() => setIsDisclaimerModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed pr-2">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-1.5">
                <div className="font-bold text-white text-xs uppercase text-amber-400 font-mono">
                  1. Non-Commercial Academic & Testing Sandbox
                </div>
                <p>
                  This project is created strictly for software test automation benchmarking and architecture education. It does not provide financial, legal, tax, or investment advice. It is not affiliated with, approved by, or endorsed by any government authority or financial regulator.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-1.5">
                <div className="font-bold text-white text-xs uppercase text-cyan-400 font-mono">
                  2. Official Public Government Statutory Citations
                </div>
                <ul className="space-y-1 text-[11px] font-mono">
                  <li>• <strong>India Income-tax Rules (Rule 114B)</strong>: Gazette Notification S.O. 3548(E) dated 30 Dec 2015 (Mandatory PAN for cash &gt; ₹50,000).</li>
                  <li>• <strong>India PMLA (Maintenance of Records) Rules 2005</strong>: Rule 3(1)(A) CTR threshold (₹10 Lakhs) & Rule 3(1)(BA) CBWTR threshold (₹5 Lakhs).</li>
                  <li>• <strong>India Digital Personal Data Protection (DPDP) Act 2023</strong>: Section 12 Right-to-be-Forgotten cryptographic shredding.</li>
                  <li>• <strong>UAE CBUAE Notice No. 74/2019</strong>: High Cash Transaction (HCT) reporting for cash &ge; AED 55,000 via UNODC goAML XML.</li>
                  <li>• <strong>Australia AML/CTF Act 2006</strong>: Section 43 Threshold Transaction Report (TTR) for transactions &ge; AUD 10,000.</li>
                  <li>• <strong>UN Security Council Sanctions</strong>: Resolution 1267/1989/2253 Consolidated List.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-1.5">
                <div className="font-bold text-white text-xs uppercase text-emerald-400 font-mono">
                  3. Disclaimer of Warranties & Limitation of Liability
                </div>
                <p className="font-mono text-[11px] text-slate-400 uppercase">
                  THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. UNDER NO CIRCUMSTANCES SHALL THE AUTHORS OR ITFREESOURCE ACADEMY BE LIABLE FOR ANY FINANCIAL LOSSES, REGULATORY ACTIONS, SYSTEM FAILURES, DATA EXPOSURE, OR ANY OTHER DIRECT OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE, REUSE, OR MODIFICATION OF THIS EDUCATIONAL MATERIAL.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">ITFreeSource Academy • Open Source Academic License</span>
              <button
                onClick={() => setIsDisclaimerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
              >
                I Understand & Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
