import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Scan,
  Camera,
  MapPin,
  FileText,
  Key,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const KycPage: React.FC = () => {
  const { currentUser, currentProfile } = useAuth();
  const [kycRecords, setKycRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // DigiLocker Sandbox State
  const [consent, setConsent] = useState<any>(null);
  const [issuedDocs, setIssuedDocs] = useState<any[]>([]);
  const [digiLoading, setDigiLoading] = useState(false);

  // KYC Application Form State
  const [fullName, setFullName] = useState('Vikram Sharma');
  const [idType, setIdType] = useState('AADHAAR');
  const [rawIdNumber, setRawIdNumber] = useState('982103492817');
  const [address, setAddress] = useState('Flat 402, Skyline Residency, Bandra West, Mumbai 400050');
  const [triggerBiometricFail, setTriggerBiometricFail] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const fetchKycRecords = async () => {
    try {
      const res = await axios.get('/api/v1/kyc/records');
      if (res.data.success) {
        setKycRecords(res.data.records);
      }
    } catch (err) {
      console.error('Failed to fetch KYC records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycRecords();
  }, []);

  // 1. Initiate DigiLocker Consent Flow
  const handleInitiateDigiLocker = async () => {
    setDigiLoading(true);
    try {
      const res = await axios.post('/api/v1/digilocker/consent/initiate', {
        userId: currentUser?.id || 'usr_retail_01',
        scope: ['AADHAAR', 'PAN', 'DRIVING_LICENSE']
      });
      setConsent(res.data.consent);
    } catch (err: any) {
      alert(`DigiLocker error: ${err.response?.data?.error || err.message}`);
    } finally {
      setDigiLoading(false);
    }
  };

  // 2. Authorize DigiLocker Consent (Citizen authentication)
  const handleAuthorizeDigiLocker = async () => {
    if (!consent) return;
    setDigiLoading(true);
    try {
      const res = await axios.post(`/api/v1/digilocker/consent/${consent.consentId}/authorize`);
      setConsent(res.data.consent);

      // Immediately fetch authentic schemas
      const docsRes = await axios.get(`/api/v1/digilocker/documents/${consent.consentId}?userName=${encodeURIComponent(fullName)}`);
      setIssuedDocs(docsRes.data.documents);

      // Auto-populate form
      const aadhaar = docsRes.data.documents.find((d: any) => d.docType === 'AADHAAR');
      if (aadhaar) {
        setAddress(aadhaar.payload.address);
      }
    } catch (err: any) {
      alert(`Authorization error: ${err.response?.data?.error || err.message}`);
    } finally {
      setDigiLoading(false);
    }
  };

  // 3. Submit KYC Verification Package
  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);
    try {
      const res = await axios.post('/api/v1/kyc/apply', {
        userId: currentUser?.id || 'usr_retail_01',
        fullName,
        idType,
        rawIdNumber,
        address,
        selfieProvided: true,
        triggerFailure: triggerBiometricFail,
        geoCoordinates: {
          lat: 19.0596,
          lng: 72.8295,
          city: 'Mumbai',
          country: 'India'
        }
      });

      setSubmitMessage(`KYC Application successfully processed! Status: ${res.data.kyc.status} (Liveness Score: ${res.data.kyc.livenessScore}%)`);
      fetchKycRecords();
    } catch (err: any) {
      alert(`KYC submission error: ${err.response?.data?.error || err.message}`);
    }
  };

  // Compliance Officer manual status override
  const handleStatusUpdate = async (kycId: string, status: string) => {
    try {
      await axios.patch(`/api/v1/kyc/records/${kycId}/status`, {
        status,
        reviewerNotes: `Manually updated by ${currentProfile?.fullName} (${currentProfile?.role})`
      });
      fetchKycRecords();
    } catch (err: any) {
      alert(`Update error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-mono text-brand-400 font-semibold uppercase tracking-wider">
            <Fingerprint className="w-4 h-4" />
            <span>Digital Identity & Verification Gateway</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            KYC, DigiLocker Sandbox & Biometric Liveness
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero-cost government sandbox issuing authentic e-Aadhaar, PAN, and DL schemas with SHA-256 digital signature hashes.
          </p>
        </div>

        <button
          onClick={fetchKycRecords}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Grid: DigiLocker Zero-Cost Sandbox + KYC Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DigiLocker Sandbox Issuer */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Zero-Cost DigiLocker Sandbox Issuer</h2>
                <p className="text-[11px] text-slate-400">Authentic Govt OAuth2 Consent & Schemas (UIDAI, ITD, MoRTH)</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              ₹0.00 Commercial Fees
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-3">
            <div className="text-xs text-slate-300">
              {consent ? (
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400">Consent ID:</span>
                    <span className="text-brand-300">{consent.consentId}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Status:</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      consent.status === 'CONSENTED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {consent.status}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-xs leading-relaxed">
                  No active consent. Click below to simulate citizen logging into DigiLocker and consenting to e-Aadhaar & PAN extraction.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              {!consent ? (
                <button
                  onClick={handleInitiateDigiLocker}
                  disabled={digiLoading}
                  className="w-full py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Initiate DigiLocker OAuth2 Flow</span>
                </button>
              ) : consent.status === 'PENDING' ? (
                <button
                  onClick={handleAuthorizeDigiLocker}
                  disabled={digiLoading}
                  className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorize Consent (Citizen OTP Verified)</span>
                </button>
              ) : (
                <button
                  onClick={handleInitiateDigiLocker}
                  className="w-full py-2 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate New DigiLocker Consent</span>
                </button>
              )}
            </div>
          </div>

          {/* Issued Authentic Schemas Accordion */}
          {issuedDocs.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">
                Issued Gov Documents ({issuedDocs.length})
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {issuedDocs.map((doc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-accent-cyan" />
                        {doc.docType}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                        {doc.issuer}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono">
                      Masked ID: <strong className="text-white">{doc.payload.maskedDocNumber}</strong>
                    </div>
                    <div className="text-[10px] text-emerald-400/90 font-mono truncate">
                      Sig Hash: {doc.digitalSignature}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KYC Verification Form */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Submit KYC Verification Package</h2>
              <p className="text-[11px] text-slate-400">Biometric facial liveness check & PII Vault ingestion</p>
            </div>
          </div>

          <form onSubmit={handleSubmitKyc} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Document Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="AADHAAR">e-Aadhaar (UIDAI)</option>
                  <option value="PAN">PAN Card (ITD)</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Raw Document Number</label>
                <input
                  type="text"
                  value={rawIdNumber}
                  onChange={(e) => setRawIdNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Residential Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300 font-mono">Geotag: Mumbai, India (19.0596° N, 72.8295° E)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">STAMPED</span>
            </div>

            {/* Test Toggle: Trigger biometric failure */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="failBiometric"
                checked={triggerBiometricFail}
                onChange={(e) => setTriggerBiometricFail(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-0"
              />
              <label htmlFor="failBiometric" className="text-xs text-slate-400 cursor-pointer">
                Simulate biometric mismatch / liveness spoof rejection (Test Edge Case)
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Scan className="w-4 h-4" />
              <span>Submit for Automated KYC Verification</span>
            </button>
          </form>

          {submitMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300">
              {submitMessage}
            </div>
          )}
        </div>
      </div>

      {/* KYC Records & Audit Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">KYC Verification Registry ({kycRecords.length})</h2>
            <p className="text-xs text-slate-400">Immutable record of all processed citizen identity packages</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Masked ID</th>
                <th className="py-3 px-4">Liveness / Match</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {kycRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 text-white font-bold">{r.fullName}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">{r.idType}</td>
                  <td className="py-3.5 px-4 text-brand-300 font-mono">{r.idNumberMasked}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-emerald-400 font-bold">{r.livenessScore}%</span> /{' '}
                    <span className="font-mono text-slate-300">{r.faceMatchScore}%</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      r.status === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : r.status === 'REJECTED'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {r.geoCoordinates?.city}, {r.geoCoordinates?.country}
                  </td>
                  <td className="py-3.5 px-4">
                    {/* Compliance Officer Adjudication */}
                    {r.status !== 'APPROVED' ? (
                      <button
                        onClick={() => handleStatusUpdate(r.id, 'APPROVED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-[10px] font-bold transition-colors"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusUpdate(r.id, 'ENHANCED_DUE_DILIGENCE')}
                        className="px-2.5 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-300 text-[10px] font-bold transition-colors"
                      >
                        Flag EDD
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
