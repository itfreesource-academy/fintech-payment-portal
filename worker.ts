import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  authenticate,
  getAllUsers,
  getUserById,
  PERSONA_PROFILES
} from './server/src/services/authService.js';
import {
  submitKycApplication,
  getAllKycRecords,
  getKycByUserId,
  updateKycStatus
} from './server/src/services/kycService.js';
import {
  initiateDigiLockerConsent,
  authorizeConsent,
  fetchIssuedDocuments
} from './server/src/services/digilockerService.js';
import {
  getAllAmlAlerts,
  resolveAmlAlert,
  screenTransactionForAml,
  screenNameForSanctions
} from './server/src/services/amlService.js';
import {
  evaluateFraudRisk,
  getAllFraudEvaluations
} from './server/src/services/fraudService.js';
import {
  executeTransfer,
  getWalletsByUserId,
  getAllWallets,
  getAllTransactions,
  getDoubleEntryLedger
} from './server/src/services/ledgerService.js';
import {
  getAllProducts,
  calculateQuote,
  issuePolicy,
  getPoliciesByUserId,
  getAllPolicies,
  fileInsuranceClaim,
  getAllClaims,
  adjudicateClaim
} from './server/src/services/insuranceService.js';
import {
  encryptPii,
  decryptPii,
  erasePii,
  getAllPiiRecords,
  getPiiAuditLogs,
  maskPii
} from './server/src/services/piiVaultService.js';
import {
  getAllKafkaMessages,
  getKafkaMessages,
  getTopicMetrics,
  publishToKafka,
  replayDlq
} from './server/src/services/kafkaBroker.js';
import {
  registerWebhook,
  getAllWebhooks,
  getWebhookDeliveryLogs,
  retryWebhookDelivery,
  dispatchWebhookEvent
} from './server/src/services/webhookService.js';
import { swaggerSpec } from './server/src/config/swagger.js';
import { PersonaRole, DocumentIdType, KycStatus, AmlJurisdiction, CurrencyCode, PiiDataType, KafkaTopic } from './server/src/types/index.js';

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

type Bindings = {
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

// 1. Global CORS Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'x-mock-delay']
}));

// ==========================================
// Swagger & OpenAPI Specification
// ==========================================
const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ITFreeSource Academy | Enterprise FinTech OpenAPI 3.0 Documentation</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css" />
  <style>
    .swagger-ui .topbar { background-color: #0b0f17; }
    body { margin: 0; padding: 0; background: #0b0f17; color: #fff; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js" crossorigin="anonymous"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: '/api/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout",
        persistAuthorization: true
      });
    };
  </script>
</body>
</html>`;

app.get('/api/docs', (c) => c.html(swaggerHtml));
app.get('/api/docs/', (c) => c.html(swaggerHtml));
app.get('/api/swagger.json', (c) => c.json(swaggerSpec));

// ==========================================
// 1. Auth & Personas Routes
// ==========================================
app.post('/api/v1/auth/login', async (c) => {
  try {
    const { identifier, password } = await c.req.json();
    const result = authenticate(identifier, password);
    return c.json({ success: true, ...result });
  } catch (err: any) {
    return c.json({ error: err.message }, 401);
  }
});

app.get('/api/v1/auth/personas', (c) => {
  const users = getAllUsers();
  const list = users.map(u => ({
    user: u,
    profile: PERSONA_PROFILES[u.role]
  }));
  return c.json({ success: true, count: list.length, personas: list });
});

app.get('/api/v1/auth/me', (c) => {
  const userId = c.req.query('userId') || 'usr_retail_01';
  const user = getUserById(userId);
  if (!user) return c.json({ error: 'User not found' }, 404);
  return c.json({ success: true, user, profile: PERSONA_PROFILES[user.role] });
});

app.post('/api/v1/auth/mfa/verify', async (c) => {
  const { code } = await c.req.json().catch(() => ({}));
  if (code && code.length === 6) {
    return c.json({ success: true, verified: true, message: 'MFA challenge verified successfully' });
  }
  return c.json({ success: false, error: 'Invalid MFA verification code' }, 400);
});

// ==========================================
// 2. KYC & DigiLocker Routes
// ==========================================
app.post('/api/v1/kyc/apply', async (c) => {
  try {
    const body = await c.req.json();
    const kyc = await submitKycApplication(body);
    return c.json({ success: true, kyc }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get('/api/v1/kyc/records', (c) => {
  const userId = c.req.query('userId');
  if (userId) {
    const record = getKycByUserId(userId);
    return c.json({ success: true, count: record ? 1 : 0, records: record ? [record] : [] });
  }
  const records = getAllKycRecords();
  return c.json({ success: true, count: records.length, records });
});

app.patch('/api/v1/kyc/records/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const { status, reviewerNotes } = await c.req.json();
    const updated = updateKycStatus(id, status as KycStatus, reviewerNotes);
    return c.json({ success: true, kyc: updated });
  } catch (err: any) {
    return c.json({ error: err.message }, 404);
  }
});

app.post('/api/v1/digilocker/consent/initiate', async (c) => {
  try {
    const { userId = 'usr_retail_01', scope } = await c.req.json().catch(() => ({}));
    const consent = initiateDigiLockerConsent(userId, scope);
    return c.json({ success: true, consent }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/v1/digilocker/consent/:id/authorize', (c) => {
  try {
    const authorized = authorizeConsent(c.req.param('id'));
    return c.json({ success: true, consent: authorized });
  } catch (err: any) {
    return c.json({ error: err.message }, 404);
  }
});

app.get('/api/v1/digilocker/documents/:consentId', (c) => {
  try {
    const userName = c.req.query('userName') || 'Vikram Sharma';
    const docs = fetchIssuedDocuments(c.req.param('consentId'), userName);
    return c.json({ success: true, count: docs.length, documents: docs });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// ==========================================
// 3. AML & Sanctions Routes (Multi-Jurisdiction)
// ==========================================
app.get('/api/v1/aml/alerts', (c) => {
  const jurisdiction = c.req.query('jurisdiction') as AmlJurisdiction | undefined;
  const alerts = getAllAmlAlerts(jurisdiction);
  return c.json({ success: true, count: alerts.length, alerts });
});

app.patch('/api/v1/aml/alerts/:id/resolve', async (c) => {
  try {
    const id = c.req.param('id');
    const { status, reviewer = 'Maya Lin', notes } = await c.req.json();
    const resolved = resolveAmlAlert(id, status, reviewer, notes);
    return c.json({ success: true, alert: resolved });
  } catch (err: any) {
    return c.json({ error: err.message }, 404);
  }
});

app.post('/api/v1/aml/screen/transaction', async (c) => {
  try {
    const body = await c.req.json();
    const result = await screenTransactionForAml(body);
    return c.json({ success: true, ...result, alertCount: result.alerts.length });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/v1/aml/screen/sanctions', async (c) => {
  const { name } = await c.req.json();
  const result = screenNameForSanctions(name);
  return c.json({ success: true, ...result });
});

app.get('/api/v1/aml/goaml-xml/:id', (c) => {
  const alerts = getAllAmlAlerts();
  const alert = alerts.find(a => a.id === c.req.param('id'));
  if (!alert || !alert.goAmlXmlPayload) {
    return c.json({ error: 'goAML XML not found for this alert' }, 404);
  }
  c.header('Content-Type', 'application/xml');
  return c.body(alert.goAmlXmlPayload);
});

// ==========================================
// 4. Real-Time Fraud Engine Routes
// ==========================================
app.post('/api/v1/fraud/evaluate', async (c) => {
  try {
    const body = await c.req.json();
    const evaluation = await evaluateFraudRisk(body);
    return c.json({ success: true, evaluation });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get('/api/v1/fraud/evaluations', (c) => {
  const list = getAllFraudEvaluations();
  return c.json({ success: true, count: list.length, evaluations: list });
});

app.post('/api/v1/fraud/test-impossible-travel', async (c) => {
  const userId = `usr_test_travel_${Date.now()}`;
  await evaluateFraudRisk({
    userId,
    amount: 5000,
    currency: 'INR',
    currentGeo: { lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
    ipAddress: '103.21.124.8'
  });
  const result = await evaluateFraudRisk({
    userId,
    amount: 5000,
    currency: 'INR',
    currentGeo: { lat: 51.5074, lng: -0.1278, city: 'London' },
    ipAddress: '82.165.197.1'
  });
  return c.json({ success: true, evaluation: result });
});

// ==========================================
// 5. Core Banking & Idempotent Ledger Routes
// ==========================================
app.post('/api/v1/ledger/transfer', async (c) => {
  try {
    const idempotencyKey = c.req.header('Idempotency-Key') || `auto_${Date.now()}`;
    const body = await c.req.json();
    const result = await executeTransfer({ idempotencyKey, ...body });
    return c.json({ success: true, idempotencyKey, ...result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.get('/api/v1/ledger/wallets', (c) => {
  const userId = c.req.query('userId');
  const userWallets = userId ? getWalletsByUserId(userId) : getAllWallets();
  return c.json({ success: true, count: userWallets.length, wallets: userWallets });
});

app.get('/api/v1/ledger/transactions', (c) => {
  const list = getAllTransactions();
  return c.json({ success: true, count: list.length, transactions: list });
});

app.get('/api/v1/ledger/double-entry', (c) => {
  const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 50;
  const entries = getDoubleEntryLedger(limit);
  return c.json({ success: true, count: entries.length, entries });
});

// ==========================================
// 6. Insurance Engine Routes
// ==========================================
app.get('/api/v1/insurance/products', (c) => {
  const list = getAllProducts();
  return c.json({ success: true, count: list.length, products: list });
});

app.post('/api/v1/insurance/quote', async (c) => {
  try {
    const { productId, userAge = 32, requestedCoverage = 500000 } = await c.req.json();
    const quote = calculateQuote(productId, Number(userAge), Number(requestedCoverage));
    return c.json({ success: true, quote });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

app.post('/api/v1/insurance/policies', async (c) => {
  try {
    const body = await c.req.json();
    const policy = await issuePolicy(body);
    return c.json({ success: true, policy }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

app.get('/api/v1/insurance/policies', (c) => {
  const userId = c.req.query('userId') || 'usr_retail_01';
  const list = getPoliciesByUserId(userId);
  return c.json({ success: true, count: list.length, policies: list });
});

app.post('/api/v1/insurance/claims', async (c) => {
  try {
    const body = await c.req.json();
    const claim = await fileInsuranceClaim(body);
    return c.json({ success: true, claim }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

app.get('/api/v1/insurance/claims', (c) => {
  const list = getAllClaims();
  return c.json({ success: true, count: list.length, claims: list });
});

app.patch('/api/v1/insurance/claims/:id/adjudicate', async (c) => {
  try {
    const id = c.req.param('id');
    const { status, notes, reviewer = 'Sarah Chen' } = await c.req.json();
    const claim = adjudicateClaim(id, status, notes, reviewer);
    return c.json({ success: true, claim });
  } catch (err: any) {
    return c.json({ error: err.message }, 404);
  }
});

// ==========================================
// 7. PII Vault & DPDP Act 2023 Routes
// ==========================================
app.get('/api/v1/pii/records', (c) => {
  const userId = c.req.query('userId');
  const records = getAllPiiRecords(userId);
  return c.json({ success: true, count: records.length, records });
});

app.post('/api/v1/pii/encrypt', async (c) => {
  try {
    const { userId = 'usr_retail_01', dataType, plainText, actorUserId = 'usr_retail_01', actorRole = 'retail_customer' } = await c.req.json();
    const record = encryptPii(userId, dataType as PiiDataType, plainText, actorUserId, actorRole as PersonaRole);
    return c.json({ success: true, record }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/v1/pii/decrypt', async (c) => {
  try {
    const { recordId, actorUserId = 'usr_compliance_01', actorRole = 'compliance_officer', justification } = await c.req.json();
    const result = decryptPii(recordId, actorUserId, actorRole as PersonaRole, justification);
    return c.json({ success: true, ...result });
  } catch (err: any) {
    return c.json({ error: err.message }, 403);
  }
});

app.post('/api/v1/pii/erase', async (c) => {
  try {
    const { recordId, actorUserId = 'usr_compliance_01', actorRole = 'compliance_officer', justification } = await c.req.json();
    const record = erasePii(recordId, actorUserId, actorRole as PersonaRole, justification);
    return c.json({ success: true, message: 'Record erased under DPDP Act 2023', record });
  } catch (err: any) {
    return c.json({ error: err.message }, 404);
  }
});

app.get('/api/v1/pii/audit-logs', (c) => {
  const targetUserId = c.req.query('targetUserId');
  const logs = getPiiAuditLogs(targetUserId);
  return c.json({ success: true, count: logs.length, logs });
});

app.post('/api/v1/pii/mask-preview', async (c) => {
  const { value, dataType = 'PAN' } = await c.req.json().catch(() => ({}));
  const masked = maskPii(value || '', dataType as PiiDataType);
  return c.json({ originalLength: (value || '').length, masked });
});

// ==========================================
// 8. Kafka Streams & Webhook Bus Routes
// ==========================================
app.get('/api/v1/kafka/metrics', (c) => {
  const metrics = getTopicMetrics();
  return c.json({ success: true, metrics });
});

app.get('/api/v1/kafka/messages', (c) => {
  const topic = c.req.query('topic') as KafkaTopic | undefined;
  const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 50;
  const messages = topic ? getKafkaMessages(topic, limit) : getAllKafkaMessages(limit);
  return c.json({ success: true, count: messages.length, messages });
});

app.post('/api/v1/kafka/publish', async (c) => {
  try {
    const { topic, key, value, headers } = await c.req.json();
    const message = publishToKafka(topic, key, value, headers);
    return c.json({ success: true, message }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

app.post('/api/v1/kafka/dlq/replay', async (c) => {
  try {
    const { topic } = await c.req.json();
    const result = replayDlq(topic as KafkaTopic);
    return c.json({ success: true, message: `Replayed ${result.replayedCount} DLQ events`, ...result });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

app.get('/api/v1/webhooks/subscriptions', (c) => {
  const subs = getAllWebhooks();
  return c.json({ success: true, count: subs.length, subscriptions: subs });
});

app.post('/api/v1/webhooks/subscriptions', async (c) => {
  try {
    const { userId = 'usr_compliance_01', targetUrl, subscribedEvents, secret } = await c.req.json();
    const sub = registerWebhook(userId, targetUrl, subscribedEvents, secret);
    return c.json({ success: true, subscription: sub }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get('/api/v1/webhooks/logs', (c) => {
  const logs = getWebhookDeliveryLogs();
  return c.json({ success: true, count: logs.length, logs });
});

app.post('/api/v1/webhooks/retry/:id', (c) => {
  const delivery = retryWebhookDelivery(c.req.param('id'));
  if (!delivery) return c.json({ error: 'Log not found' }, 404);
  return c.json({ success: true, delivery });
});

app.post('/api/v1/webhooks/test-trigger', async (c) => {
  const { event = 'test.ping', payload = {} } = await c.req.json().catch(() => ({}));
  const logs = await dispatchWebhookEvent(event, payload);
  return c.json({ success: true, dispatchedTo: logs.length, logs });
});

// ==========================================
// 9. System Health & Stats Routes
// ==========================================
app.get('/api/v1/system/health', (c) => {
  return c.json({
    status: 'HEALTHY',
    platform: 'ITFreeSource Academy Enterprise FinTech Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    edgeTarget: 'Cloudflare Workers & Pages'
  });
});

app.get('/api/v1/system/stats', (c) => {
  return c.json({
    success: true,
    stats: {
      totalUsers: getAllUsers().length,
      totalWallets: getAllWallets().length,
      totalTransactions: getAllTransactions().length,
      totalKycRecords: getAllKycRecords().length,
      totalAmlAlerts: getAllAmlAlerts().length,
      totalFraudEvaluations: getAllFraudEvaluations().length,
      totalPolicies: getAllPolicies().length,
      totalClaims: getAllClaims().length,
      totalPiiRecords: getAllPiiRecords().length,
      totalPiiAuditLogs: getPiiAuditLogs().length,
      kafkaTopics: getTopicMetrics().length,
      activeWebhooks: getAllWebhooks().length,
      webhookDeliveries: getWebhookDeliveryLogs().length
    }
  });
});

app.get('/api/v1/system/disclaimer', (c) => {
  return c.json({
    success: true,
    purpose: 'EDUCATIONAL, ACADEMIC RESEARCH AND TEST AUTOMATION HARNESS BENCHMARKING ONLY',
    liability: 'ZERO LIABILITY - PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND',
    isFinancialInstitution: false,
    fiatSettlement: false,
    syntheticDataOnly: true,
    statutoryCitations: {
      india_fiu_rule_114b: {
        jurisdiction: 'India (FIU-IND / Income Tax Department)',
        statute: 'Income-tax Rules, 1962 (Rule 114B)',
        gazetteCitation: 'Gazette Notification S.O. 3548(E) dated 30 Dec 2015',
        threshold: 'Physical cash transactions > INR 50,000 mandate verified PAN',
        publicUrl: 'https://incometaxindia.gov.in'
      },
      india_fiu_rule_3_ctr: {
        jurisdiction: 'India (FIU-IND / PMLA)',
        statute: 'PMLA (Maintenance of Records) Rules 2005 - Rule 3(1)(A) CTR & Rule 3(1)(BA) CBWTR',
        gazetteCitation: 'Gazette of India, Extraordinary, Part II, Section 3, Sub-section (i) dated 1 July 2005',
        threshold: 'Cash Transaction Report (CTR) >= INR 10 Lakhs; Cross-Border Wire (CBWTR) >= INR 5 Lakhs',
        publicUrl: 'https://fiuindia.gov.in'
      },
      india_dpdp_act: {
        jurisdiction: 'India (Ministry of Electronics and Information Technology)',
        statute: 'Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)',
        gazetteCitation: 'Gazette of India dated August 11, 2023',
        mandate: 'Section 12 Right-to-be-Forgotten data shredding and consent erasure',
        publicUrl: 'https://www.meity.gov.in'
      },
      uae_cbuae_goaml: {
        jurisdiction: 'United Arab Emirates (CBUAE & UAE FIU)',
        statute: 'Federal Decree-Law No. (20) of 2018 & CBUAE Notice No. 74/2019',
        threshold: 'Physical cash transactions >= AED 55,000 mandate UNODC goAML XML reporting',
        publicUrl: 'https://www.centralbank.ae'
      },
      australia_austrac: {
        jurisdiction: 'Australia (AUSTRAC)',
        statute: 'Anti-Money Laundering and Counter-Terrorism Financing Act 2006 (AML/CTF Act) Sec 43',
        threshold: 'Threshold Transaction Report (TTR) for physical/wire transactions >= AUD 10,000',
        publicUrl: 'https://www.austrac.gov.au'
      },
      global_un_sanctions: {
        jurisdiction: 'International (United Nations & FATF)',
        statute: 'UN Security Council Resolution 1267/1989/2253 Consolidated List & FATF Recommendation 10 & 12',
        mandate: 'Immediate targeted financial sanctions freezing against designated entities',
        publicUrl: 'https://www.un.org/securitycouncil/content/un-sc-consolidated-list'
      }
    }
  });
});


// ==========================================
// Static Assets Fallback for SPA (Cloudflare Pages)
// ==========================================
app.get('*', async (c) => {
  if (c.env?.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('ITFreeSource Academy Enterprise FinTech Platform API Server (Local Node / Edge)');
});

export default app;
