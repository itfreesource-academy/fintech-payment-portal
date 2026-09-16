import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Terminal,
  Radio,
  Send,
  Repeat,
  RefreshCw,
  ShieldCheck,
  Zap,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

export const PlaygroundPage: React.FC = () => {
  const [kafkaMetrics, setKafkaMetrics] = useState<any[]>([]);
  const [kafkaMessages, setKafkaMessages] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Custom Kafka Publisher
  const [publishTopic, setPublishTopic] = useState('fraud.events');
  const [publishKey, setPublishKey] = useState('key_user_test');
  const [publishPayload, setPublishPayload] = useState('{\n  "event": "CHAOS_ANOMALY_INJECTED",\n  "riskScore": 88\n}');

  // Custom Webhook Register
  const [targetUrl, setTargetUrl] = useState('https://webhook.site/itfreesource-fintech-sandbox');

  const fetchStreamData = async () => {
    try {
      const topicParam = selectedTopic === 'ALL' ? '' : `?topic=${selectedTopic}`;
      const [mRes, msgRes, whRes, logRes] = await Promise.all([
        axios.get('/api/v1/kafka/metrics'),
        axios.get(`/api/v1/kafka/messages${topicParam}`),
        axios.get('/api/v1/webhooks/subscriptions'),
        axios.get('/api/v1/webhooks/logs')
      ]);
      setKafkaMetrics(mRes.data.metrics);
      setKafkaMessages(msgRes.data.messages);
      setWebhooks(whRes.data.subscriptions);
      setDeliveryLogs(logRes.data.logs);
    } catch (err) {
      console.error('Failed to load stream data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreamData();
    const interval = setInterval(fetchStreamData, 3000); // 3-second live polling
    return () => clearInterval(interval);
  }, [selectedTopic]);

  const handlePublishKafka = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(publishPayload);
      await axios.post('/api/v1/kafka/publish', {
        topic: publishTopic,
        key: publishKey,
        value: parsed
      });
      fetchStreamData();
    } catch (err: any) {
      alert(`Publish error: ${err.message}`);
    }
  };

  const handleReplayDlq = async (topic: string) => {
    try {
      const res = await axios.post('/api/v1/kafka/dlq/replay', { topic });
      alert(res.data.message);
      fetchStreamData();
    } catch (err: any) {
      alert(`DLQ Replay error: ${err.message}`);
    }
  };

  const handleTriggerWebhookTest = async () => {
    try {
      await axios.post('/api/v1/webhooks/test-trigger', {
        event: 'fintech.test.event',
        payload: {
          timestamp: new Date().toISOString(),
          testId: `tst_${Date.now()}`,
          message: 'Automated E2E HMAC Webhook Delivery Test'
        }
      });
      fetchStreamData();
    } catch (err: any) {
      alert(`Webhook test error: ${err.message}`);
    }
  };

  const handleRetryWebhook = async (id: string) => {
    try {
      await axios.post(`/api/v1/webhooks/retry/${id}`);
      fetchStreamData();
    } catch (err: any) {
      alert(`Retry error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-mono text-fuchsia-400 font-semibold uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>Event-Driven Architecture & Webhook Bus</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Apache Kafka Streams & HMAC-SHA256 Webhook Lab
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect real-time event topics, partition offsets, consumer lag, and HMAC cryptographic webhook delivery logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Streaming 3s Sync</span>
          </span>
          <button
            onClick={fetchStreamData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Kafka Topics Metric Badges */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Kafka Broker Topics & Partition Status (6 Topics)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kafkaMetrics.map((m) => (
            <div
              key={m.topic}
              onClick={() => setSelectedTopic(m.topic)}
              className={`glass-panel p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedTopic === m.topic ? 'border-brand-500 bg-slate-900 ring-1 ring-brand-500/40' : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono font-bold text-white truncate">{m.topic}</div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-lg font-black text-brand-300">{m.totalMessages}</span>
                <span className="text-[10px] text-slate-400 font-mono">msgs</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-850 mt-1">
                <span>Lag: {m.consumerLag}</span>
                {m.deadLetterCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReplayDlq(m.topic);
                    }}
                    className="text-rose-400 font-bold hover:underline"
                  >
                    DLQ ({m.deadLetterCount})
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kafka Message Stream & Event Publisher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Real-Time Message Stream Inspector */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-bold text-white">Live Event Stream Inspector</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTopic('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  selectedTopic === 'ALL' ? 'bg-brand-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                All Topics
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {kafkaMessages.length > 0 ? (
              kafkaMessages.map((msg, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-850 text-xs space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-brand-950 text-brand-300 font-bold border border-brand-800/60">
                        {msg.topic}
                      </span>
                      <span className="text-slate-400">P:{msg.partition} | O:{msg.offset}</span>
                    </div>
                    <span className="text-slate-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="font-mono text-[11px] bg-slate-900/60 p-2.5 rounded-xl text-emerald-400 overflow-x-auto">
                    {JSON.stringify(msg.value, null, 2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">
                No events streamed yet in this topic.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Custom Event Publisher */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-fuchsia-400" />
            <span>Publish Test Event to Kafka</span>
          </h2>

          <form onSubmit={handlePublishKafka} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Topic</label>
              <select
                value={publishTopic}
                onChange={(e) => setPublishTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
              >
                <option value="kyc.events">kyc.events</option>
                <option value="aml.alerts">aml.alerts</option>
                <option value="fraud.events">fraud.events</option>
                <option value="ledger.settlements">ledger.settlements</option>
                <option value="insurance.claims">insurance.claims</option>
                <option value="pii.audits">pii.audits</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Partition Key</label>
              <input
                type="text"
                value={publishKey}
                onChange={(e) => setPublishKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">JSON Payload</label>
              <textarea
                value={publishPayload}
                onChange={(e) => setPublishPayload(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-mono focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-fuchsia-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Emit Message to Kafka Broker</span>
            </button>
          </form>
        </div>
      </div>

      {/* Enterprise Webhooks Dispatcher & HMAC Logs */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Enterprise Webhooks Outbound Delivery Logs ({deliveryLogs.length})</span>
            </h2>
            <p className="text-xs text-slate-400">All outbound payloads signed with <code className="text-emerald-300 font-mono">X-Fintech-Signature: sha256=...</code></p>
          </div>

          <button
            onClick={handleTriggerWebhookTest}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Test Webhook Event</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Target URL</th>
                <th className="py-3 px-4">HMAC-SHA256 Signature</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium font-mono text-[11px]">
              {deliveryLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 text-brand-300 font-bold">{l.event}</td>
                  <td className="py-3 px-4 text-slate-300 truncate max-w-[180px]">{l.targetUrl}</td>
                  <td className="py-3 px-4 text-slate-400 truncate max-w-[200px]" title={l.signature}>
                    {l.signature.slice(0, 24)}...
                  </td>
                  <td className="py-3 px-4 text-slate-400">{l.durationMs} ms</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {l.status} (200 OK)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleRetryWebhook(l.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                    >
                      Replay
                    </button>
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
