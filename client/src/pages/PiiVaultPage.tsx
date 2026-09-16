import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Lock,
  Unlock,
  Trash2,
  Eye,
  Key,
  History,
  ShieldCheck,
  RefreshCw,
  FileKey
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PiiVaultPage: React.FC = () => {
  const { currentUser, currentProfile } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Ingestion Form State
  const [dataType, setDataType] = useState<string>('PAN');
  const [plainText, setPlainText] = useState<string>('ABCPS8921F');
  const [maskedPreview, setMaskedPreview] = useState<string>('');

  // Decryption Modal / State
  const [decryptedValue, setDecryptedValue] = useState<{ id: string; val: string } | null>(null);

  const fetchPiiData = async () => {
    try {
      const [recRes, audRes] = await Promise.all([
        axios.get('/api/v1/pii/records'),
        axios.get('/api/v1/pii/audit-logs')
      ]);
      setRecords(recRes.data.records);
      setAuditLogs(audRes.data.logs);
    } catch (err) {
      console.error('Failed to load PII data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPiiData();
  }, []);

  // Update dynamic mask preview live as user types
  useEffect(() => {
    const updatePreview = async () => {
      try {
        const res = await axios.post('/api/v1/pii/mask-preview', {
          value: plainText,
          dataType
        });
        setMaskedPreview(res.data.masked);
      } catch (err) {
        console.error('Mask preview error:', err);
      }
    };
    if (plainText) {
      updatePreview();
    } else {
      setMaskedPreview('');
    }
  }, [plainText, dataType]);

  const handleIngestPii = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/pii/encrypt', {
        userId: currentUser?.id || 'usr_retail_01',
        dataType,
        plainText,
        actorUserId: currentUser?.id || 'usr_retail_01',
        actorRole: currentUser?.role || 'retail_customer'
      });
      alert(`Sensitive ${dataType} encrypted with AES-256-GCM and surrogate token issued!`);
      setPlainText('');
      fetchPiiData();
    } catch (err: any) {
      alert(`Ingestion error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDecrypt = async (recordId: string) => {
    try {
      const res = await axios.post('/api/v1/pii/decrypt', {
        recordId,
        actorUserId: currentUser?.id || 'usr_compliance_01',
        actorRole: currentUser?.role || 'compliance_officer',
        justification: `Decryption requested by ${currentProfile?.fullName} under statutory audit`
      });
      setDecryptedValue({ id: recordId, val: res.data.plainText });
      fetchPiiData();
    } catch (err: any) {
      alert(`Access Denied: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleEraseDpdp = async (recordId: string) => {
    if (!confirm('Execute Right-to-be-Forgotten under DPDP Act 2023? This will cryptographically shred the record.')) {
      return;
    }

    try {
      await axios.post('/api/v1/pii/erase', {
        recordId,
        actorUserId: currentUser?.id || 'usr_compliance_01',
        actorRole: currentUser?.role || 'compliance_officer',
        justification: 'Data Principal requested permanent erasure under DPDP Act 2023'
      });
      alert('Record cryptographically shredded! Key and ciphertext destroyed.');
      fetchPiiData();
    } catch (err: any) {
      alert(`Erasure error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-mono text-indigo-400 font-semibold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Sensitive Data Vault & Tokenization</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            PII Enclave & DPDP Act 2023 Compliance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            AES-256-GCM encryption, dynamic masking, surrogate tokenization, and Right-to-be-Forgotten data shredding.
          </p>
        </div>

        <button
          onClick={fetchPiiData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Ingestion & Dynamic Masking Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ingestion Form */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-brand-400" />
            <span>Ingest Sensitive PII into Hardware-Backed Vault</span>
          </h2>

          <form onSubmit={handleIngestPii} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">PII Data Type</label>
                <select
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                >
                  <option value="PAN">Income Tax PAN</option>
                  <option value="AADHAAR">e-Aadhaar UIDAI</option>
                  <option value="PASSPORT">Passport Number</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="PHONE_NUMBER">Phone Number</option>
                  <option value="EMAIL">Email Address</option>
                  <option value="BANK_ACCOUNT">Bank Account No.</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Raw Sensitive Value</label>
                <input
                  type="text"
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  placeholder="e.g. ABCPS8921F"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            {/* Live Mask Preview Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 font-mono">Dynamic Mask Preview:</div>
              <div className="text-sm font-mono font-bold text-emerald-400">
                {maskedPreview || 'Type value above to see mask preview...'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Only masked value is visible in standard UI & API logs. Raw ciphertext is isolated in vault.
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Encrypt with AES-256-GCM & Issue Token</span>
            </button>
          </form>
        </div>

        {/* RBAC Decryption & Privacy Notice */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Role-Based Decryption Clearance & Privacy Laws</span>
            </h2>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Current Actor Clearance:</span>
                  <span className="font-mono text-brand-300 font-bold">{currentProfile?.role}</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Decryption clearance is restricted to: <strong className="text-white">compliance_officer</strong>, <strong className="text-white">risk_analyst</strong>, <strong className="text-white">fraud_investigator</strong>, and <strong className="text-white">auditor</strong>.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1">
                <div className="font-bold text-white">Digital Personal Data Protection (DPDP) Act 2023</div>
                <div className="text-slate-400 text-[11px]">
                  Section 12 ensures citizen's Right-to-be-Forgotten. Clicking "Erase" cryptographically overwrites ciphertext with zeroes and renders the record unrecoverable.
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            All cryptographic operations logged to immutable audit ledger below.
          </div>
        </div>
      </div>

      {/* PII Records Registry */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
        <h2 className="text-sm font-bold text-white">Encrypted PII Vault Registry ({records.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Surrogate Token</th>
                <th className="py-3 px-4">Data Type</th>
                <th className="py-3 px-4">Masked Representation</th>
                <th className="py-3 px-4">Ciphertext (AES-GCM)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-300">{r.token}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{r.dataType}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                    {decryptedValue?.id === r.id ? (
                      <span className="text-white bg-indigo-950 px-2 py-0.5 rounded border border-indigo-700">
                        {decryptedValue?.val}
                      </span>
                    ) : (
                      r.maskedValue
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 truncate max-w-[150px]">
                    {r.encryptedValue}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      r.isErased ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {r.isErased ? 'SHREDDED (DPDP)' : 'ACTIVE ENCLAVE'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 space-x-1.5 whitespace-nowrap">
                    {!r.isErased && (
                      <>
                        <button
                          onClick={() => handleDecrypt(r.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold"
                          title="Decrypt with clearance verification"
                        >
                          Decrypt
                        </button>
                        <button
                          onClick={() => handleEraseDpdp(r.id)}
                          className="px-2 py-1 rounded bg-rose-900/40 hover:bg-rose-800 text-rose-300 text-[10px] font-bold"
                          title="Erase under DPDP Right-to-be-Forgotten"
                        >
                          Erase (DPDP)
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

      {/* Immutable Access Audit Logs Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <span>Immutable Decryption & Encryption Audit Trail ({auditLogs.length})</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor Role</th>
                <th className="py-3 px-4">Data Type</th>
                <th className="py-3 px-4">Justification</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium font-mono text-[11px]">
              {auditLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      l.action === 'DECRYPT'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : l.action === 'ERASE_DPDP'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-bold">{l.actorRole}</td>
                  <td className="py-3 px-4 text-brand-300">{l.dataType}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{l.justification}</td>
                  <td className="py-3 px-4 text-slate-400">{l.ipAddress}</td>
                  <td className="py-3 px-4 text-slate-500">{new Date(l.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
