import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CreditCard,
  Send,
  RefreshCw,
  Repeat,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle2,
  Lock,
  Wallet as WalletIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BankingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer Form State
  const [senderWalletId, setSenderWalletId] = useState('wlt_vikram_inr');
  const [recipientWalletId, setRecipientWalletId] = useState('wlt_julian_inr');
  const [amount, setAmount] = useState<number>(5000);
  const [channel, setChannel] = useState<'UPI' | 'WIRE' | 'CASH'>('UPI');
  const [hasVerifiedPan, setHasVerifiedPan] = useState<boolean>(true);
  const [activeIdempotencyKey, setActiveIdempotencyKey] = useState<string>(`idem_key_${Date.now()}`);
  const [lastTxnResult, setLastTxnResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBankingData = async () => {
    try {
      const [wRes, tRes, lRes] = await Promise.all([
        axios.get('/api/v1/ledger/wallets'),
        axios.get('/api/v1/ledger/transactions'),
        axios.get('/api/v1/ledger/double-entry?limit=20')
      ]);
      setWallets(wRes.data.wallets);
      setTransactions(tRes.data.transactions);
      setLedgerEntries(lRes.data.entries);
    } catch (err) {
      console.error('Failed to load banking data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankingData();
  }, []);

  const handleExecuteTransfer = async (useExistingKey: boolean = false) => {
    setIsSubmitting(true);
    setLastTxnResult(null);

    const keyToUse = useExistingKey ? activeIdempotencyKey : `idem_key_${Date.now()}`;
    if (!useExistingKey) {
      setActiveIdempotencyKey(keyToUse);
    }

    try {
      const senderW = wallets.find(w => w.id === senderWalletId);
      const res = await axios.post(
        '/api/v1/ledger/transfer',
        {
          senderId: senderW?.userId || 'usr_retail_01',
          senderName: senderW?.userId === 'usr_retail_01' ? 'Vikram Sharma' : 'Julian Sterling',
          recipientId: recipientWalletId.includes('julian') ? 'usr_hni_01' : 'usr_retail_01',
          recipientName: recipientWalletId.includes('julian') ? 'Julian Sterling' : 'Vikram Sharma',
          senderWalletId,
          recipientWalletId,
          amount,
          currency: senderW?.currency || 'INR',
          channel,
          hasVerifiedPan
        },
        {
          headers: {
            'Idempotency-Key': keyToUse
          }
        }
      );

      setLastTxnResult(res.data);
      fetchBankingData();
    } catch (err: any) {
      alert(`Transfer Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-mono text-emerald-400 font-semibold uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>Core Banking & Idempotent Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Multi-Currency Wallets & Financial Idempotency
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero double-debits guaranteed by <code className="text-brand-300 font-mono">Idempotency-Key</code> caching and balanced double-entry accounting.
          </p>
        </div>

        <button
          onClick={fetchBankingData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Multi-Currency Wallets Grid */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <WalletIcon className="w-4 h-4 text-brand-400" />
          <span>Active Multi-Currency Wallets</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wallets.map((w) => (
            <div key={w.id} className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {w.currency} WALLET
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  {w.status}
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {w.currency === 'INR' ? '₹' : w.currency === 'AED' ? 'د.إ ' : '$'}
                {w.balance.toLocaleString()}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                <span>User: {w.userId.slice(4)}</span>
                <span className="text-slate-500 truncate max-w-[110px]">{w.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Console & Idempotency Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transfer Form */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-brand-400" />
              <span>Initiate Idempotent Payment</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
              Idempotency Engine Active
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">From (Debit Wallet)</label>
                <select
                  value={senderWalletId}
                  onChange={(e) => setSenderWalletId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.userId} ({w.currency} {w.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">To (Credit Wallet)</label>
                <select
                  value={recipientWalletId}
                  onChange={(e) => setRecipientWalletId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.userId} ({w.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                >
                  <option value="UPI">UPI Instant</option>
                  <option value="WIRE">WIRE / RTGS</option>
                  <option value="CASH">CASH Deposit</option>
                </select>
              </div>
            </div>

            {/* Current Idempotency-Key Display */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Header: Idempotency-Key</span>
                <span className="text-brand-300 font-mono text-[11px] truncate max-w-[200px]">
                  {activeIdempotencyKey}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleExecuteTransfer(false)}
                disabled={isSubmitting}
                className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Execute Transfer (New Key)</span>
              </button>

              <button
                onClick={() => handleExecuteTransfer(true)}
                disabled={isSubmitting}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-brand-500/40 text-brand-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
                title="Re-send with identical Idempotency-Key to test zero double-debit"
              >
                <Repeat className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Test Duplicate Replay</span>
              </button>
            </div>
          </div>
        </div>

        {/* Idempotency Execution Result Feedback */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white mb-3">
              Payment Settlement & Replay Inspector
            </h2>

            {lastTxnResult ? (
              <div className={`p-4 rounded-2xl border text-xs space-y-3 ${
                lastTxnResult.isIdempotentReplay
                  ? 'bg-blue-950/40 border-blue-800 text-blue-300'
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {lastTxnResult.isIdempotentReplay
                      ? 'IDEMPOTENT REPLAY DETECTED (CACHED 200 OK)'
                      : 'TRANSFER SETTLED SUCCESSFULLY'}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-950 text-white">
                    {lastTxnResult.transaction.status}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-[11px] text-slate-300 bg-slate-950/80 p-3 rounded-xl">
                  <div>Txn ID: <strong className="text-white">{lastTxnResult.transaction.id}</strong></div>
                  <div>Idempotency Key: {lastTxnResult.idempotencyKey}</div>
                  <div>Amount: {lastTxnResult.transaction.currency} {lastTxnResult.transaction.amount.toLocaleString()}</div>
                  <div>From: {lastTxnResult.transaction.senderName} ({lastTxnResult.transaction.senderWalletId})</div>
                  <div>To: {lastTxnResult.transaction.recipientName} ({lastTxnResult.transaction.recipientWalletId})</div>
                  <div>Replay Status: <strong className={lastTxnResult.isIdempotentReplay ? 'text-accent-cyan' : 'text-emerald-400'}>
                    {lastTxnResult.isIdempotentReplay ? 'Replay Verified - Zero Double Debit Enforced' : 'First-time Settlement'}
                  </strong></div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">
                Submit a transfer above to test financial idempotency and view live double-entry journal postings.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Double-Entry Ledger Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
        <h2 className="text-sm font-bold text-white">Immutable Double-Entry Ledger Registry</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Entry ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Account / Wallet</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium font-mono text-[11px]">
              {ledgerEntries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400">{e.id.slice(0, 16)}...</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      e.entryType === 'DEBIT' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {e.entryType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-bold">{e.account}</td>
                  <td className="py-3 px-4 text-white">
                    {e.entryType === 'DEBIT' ? '-' : '+'}
                    {e.currency} {e.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-brand-300">{e.transactionId.slice(0, 16)}...</td>
                  <td className="py-3 px-4 text-slate-500">{new Date(e.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
