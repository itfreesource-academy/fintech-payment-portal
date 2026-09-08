/**
 * DefendLoop FinTech Portal — Client-Side Core & Simulation Engine
 * Handles OAuth 2.0 Auth, Idempotent Payment Processing, LocalStorage Ledger,
 * and Simulated Kafka Event Streaming.
 */

(function () {
  'use strict';

  // State keys in LocalStorage
  const STORAGE_LEDGER = 'fintech_ledger';
  const STORAGE_KAFKA = 'fintech_kafka_stream';
  const STORAGE_BALANCE = 'fintech_balance';
  const STORAGE_AUTH = 'oauth_access_token';

  let currentBalance = parseFloat(localStorage.getItem(STORAGE_BALANCE) || '25480.00');

  // DOM Elements
  const authModal = document.getElementById('auth-modal');
  const authForm = document.getElementById('auth-form');
  const btnLogout = document.getElementById('btn-logout');
  const authStatusText = document.getElementById('auth-status-text');

  const transferForm = document.getElementById('transfer-form');
  const inputRecipient = document.getElementById('recipient-account');
  const inputAmount = document.getElementById('transfer-amount');
  const inputCurrency = document.getElementById('transfer-currency');
  const inputIdempKey = document.getElementById('idempotency-key');
  const inputNotes = document.getElementById('transfer-notes');
  const btnRegenKey = document.getElementById('btn-regen-key');
  const btnSimulateDuplicate = document.getElementById('btn-simulate-duplicate');

  const terminalOutput = document.getElementById('terminal-output');
  const terminalLatency = document.getElementById('terminal-latency');
  const responseStatusBadge = document.getElementById('response-status-badge');

  const ledgerTbody = document.getElementById('ledger-tbody');
  const btnClearLedger = document.getElementById('btn-clear-ledger');
  const btnExportLedger = document.getElementById('btn-export-ledger');

  const kafkaContainer = document.getElementById('kafka-stream-container');
  const btnClearKafka = document.getElementById('btn-clear-kafka');

  const valBalance = document.getElementById('val-balance');
  const valTxCount = document.getElementById('val-tx-count');
  const valEventCount = document.getElementById('val-event-count');

  const btnReconcile = document.getElementById('btn-run-reconciliation');
  const reconcileOutput = document.getElementById('reconcile-output');

  // Generate UUID v4
  function generateUUID() {
    return 'idemp-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Check Auth on Init
  function checkAuth() {
    const token = localStorage.getItem(STORAGE_AUTH);
    if (!token) {
      authModal.classList.add('show');
    } else {
      authModal.classList.remove('show');
      authStatusText.textContent = 'OAuth 2.0: Active (Bearer)';
    }
  }

  // Setup OAuth login
  authForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                    btoa(JSON.stringify({
                      sub: 'vishal.sdet@defendloop.io',
                      role: 'Senior_SDET',
                      scope: 'payments.write accounts.read',
                      exp: Math.floor(Date.now() / 1000) + 3600
                    })) + '.mockSignatureFintechSDET2026';
    
    localStorage.setItem(STORAGE_AUTH, mockJWT);
    authModal.classList.remove('show');
    authStatusText.textContent = 'OAuth 2.0: Active (Bearer)';
    appendKafkaEvent('AUTH_TOKEN_ISSUED', { client: 'vishal.sdet@defendloop.io', scope: 'payments.write' });
  });

  btnLogout.addEventListener('click', function () {
    localStorage.removeItem(STORAGE_AUTH);
    checkAuth();
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const target = document.getElementById(this.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Regenerate Idempotency Key
  function refreshIdempKey() {
    inputIdempKey.value = generateUUID();
  }
  btnRegenKey.addEventListener('click', refreshIdempKey);

  // Load / Save Ledger from LocalStorage
  function getLedger() {
    return JSON.parse(localStorage.getItem(STORAGE_LEDGER) || '[]');
  }
  function saveLedger(data) {
    localStorage.setItem(STORAGE_LEDGER, JSON.stringify(data));
    renderLedger();
  }

  // Load / Save Kafka Events
  function getKafkaEvents() {
    return JSON.parse(localStorage.getItem(STORAGE_KAFKA) || '[]');
  }
  function appendKafkaEvent(eventType, payload) {
    const events = getKafkaEvents();
    const event = {
      offset: events.length + 1048,
      timestamp: new Date().toISOString(),
      topic: 'fintech-payment-events',
      eventType: eventType,
      payload: payload
    };
    events.unshift(event); // newest on top
    localStorage.setItem(STORAGE_KAFKA, JSON.stringify(events.slice(0, 50)));
    renderKafka();
  }

  // Render UI Components
  function renderStats() {
    valBalance.textContent = '$' + currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const ledger = getLedger();
    valTxCount.textContent = ledger.length;
    valEventCount.textContent = getKafkaEvents().length + ' Events';
  }

  function renderLedger() {
    const ledger = getLedger();
    ledgerTbody.innerHTML = '';
    if (ledger.length === 0) {
      ledgerTbody.innerHTML = '<tr><td colspan="7" class="text-muted" style="text-align:center;padding:24px;">No transactions recorded. Submit a payment to generate live ledger rows.</td></tr>';
      return;
    }

    ledger.forEach(tx => {
      const tr = document.createElement('tr');
      const isDuplicate = tx.isDuplicate;
      tr.innerHTML = `
        <td class="font-mono" style="color:#60a5fa">${tx.transactionId}</td>
        <td class="font-mono text-muted" style="font-size:10px">${tx.idempotencyKey.substring(0, 18)}...</td>
        <td>${tx.recipient}</td>
        <td style="font-weight:600;color:#f9fafb">$${parseFloat(tx.amount).toFixed(2)} ${tx.currency}</td>
        <td><span class="badge-status ${isDuplicate ? 'badge-duplicate' : 'badge-settled'}">${isDuplicate ? 'IDEMPOTENT_RETRY' : tx.status}</span></td>
        <td class="font-mono text-muted" style="font-size:11px">${tx.kafkaEventType || 'PAYMENT_SETTLED'}</td>
        <td class="text-muted">${new Date(tx.timestamp).toLocaleTimeString()}</td>
      `;
      ledgerTbody.appendChild(tr);
    });
    renderStats();
  }

  function renderKafka() {
    const events = getKafkaEvents();
    kafkaContainer.innerHTML = '';
    if (events.length === 0) {
      kafkaContainer.innerHTML = '<div class="text-muted" style="text-align:center;padding:24px;">Kafka topic partition is empty. Transfers will stream JSON events here in real time.</div>';
      return;
    }

    events.forEach(e => {
      const div = document.createElement('div');
      div.className = 'kafka-message-box';
      div.innerHTML = `
        <div class="kafka-msg-header">
          <span><i class="fas fa-stream"></i> Event: ${e.eventType} &bull; Offset: #${e.offset}</span>
          <span style="color:#9ca3af">${new Date(e.timestamp).toLocaleTimeString()}</span>
        </div>
        <pre class="kafka-msg-body">${JSON.stringify(e.payload, null, 2)}</pre>
      `;
      kafkaContainer.appendChild(div);
    });
    renderStats();
  }

  // Execute Payment (Idempotent Processor)
  function processPayment(isSimulatedDuplicate = false) {
    const recipient = inputRecipient.value.trim();
    const amount = parseFloat(inputAmount.value);
    const currency = inputCurrency.value;
    const idempKey = inputIdempKey.value.trim();
    const notes = inputNotes.value.trim();

    const startTime = performance.now();

    if (!recipient || isNaN(amount) || amount <= 0) {
      alert('Please provide a valid recipient account and amount.');
      return;
    }

    const ledger = getLedger();
    const existingTx = ledger.find(t => t.idempotencyKey === idempKey);

    // IDEMPOTENCY CHECK
    if (existingTx) {
      const elapsed = Math.round(performance.now() - startTime + Math.random() * 25 + 10);
      terminalLatency.textContent = `${elapsed}ms`;
      responseStatusBadge.className = 'badge-pill badge-green';
      responseStatusBadge.textContent = '200 OK (IDEMPOTENT CACHE HIT)';

      const resPayload = {
        status: 200,
        message: 'Idempotency key matched existing transaction. Returning cached record without duplicate debit.',
        idempotencyKey: idempKey,
        data: existingTx
      };

      terminalOutput.textContent = JSON.stringify(resPayload, null, 2);

      // Record idempotent retry in Kafka for auditing
      appendKafkaEvent('IDEMPOTENT_RETRY_DETECTED', {
        idempotencyKey: idempKey,
        originalTransactionId: existingTx.transactionId,
        action: 'DUPLICATE_DROP_SUCCESS'
      });
      return;
    }

    // Process fresh payment
    const newTxId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
    currentBalance -= amount;
    localStorage.setItem(STORAGE_BALANCE, currentBalance.toString());

    const newTx = {
      transactionId: newTxId,
      idempotencyKey: idempKey,
      recipient: recipient,
      amount: amount,
      currency: currency,
      status: 'SETTLED',
      notes: notes,
      timestamp: new Date().toISOString(),
      kafkaEventType: 'PAYMENT_SETTLED',
      isDuplicate: false
    };

    ledger.unshift(newTx);
    saveLedger(ledger);

    // Emit Kafka Event
    appendKafkaEvent('PAYMENT_SETTLED', {
      transactionId: newTxId,
      idempotencyKey: idempKey,
      amount: amount,
      currency: currency,
      sourceAccount: 'ACC-PRIMARY-TREASURY',
      destinationAccount: recipient
    });

    const elapsed = Math.round(performance.now() - startTime + Math.random() * 40 + 35);
    terminalLatency.textContent = `${elapsed}ms`;
    responseStatusBadge.className = 'badge-pill badge-blue';
    responseStatusBadge.textContent = '201 CREATED (TRANSACTION SETTLED)';

    const resPayload = {
      status: 201,
      transactionId: newTxId,
      idempotencyKey: idempKey,
      settlementStatus: 'SETTLED',
      amount: amount,
      currency: currency,
      auditTimestamp: newTx.timestamp
    };

    terminalOutput.textContent = JSON.stringify(resPayload, null, 2);

    if (!isSimulatedDuplicate) {
      refreshIdempKey();
    }
  }

  // Event Listeners
  transferForm.addEventListener('submit', function (e) {
    e.preventDefault();
    processPayment(false);
  });

  btnSimulateDuplicate.addEventListener('click', function () {
    const ledger = getLedger();
    if (ledger.length === 0) {
      alert('Please submit at least one initial payment before testing duplicate idempotency!');
      return;
    }
    // Re-use the most recent transaction's idempotency key to prove duplicate prevention
    const lastTx = ledger[0];
    inputIdempKey.value = lastTx.idempotencyKey;
    inputRecipient.value = lastTx.recipient;
    inputAmount.value = lastTx.amount;
    processPayment(true);
  });

  btnClearLedger.addEventListener('click', function () {
    if (confirm('Clear transaction ledger?')) {
      localStorage.removeItem(STORAGE_LEDGER);
      renderLedger();
    }
  });

  btnClearKafka.addEventListener('click', function () {
    localStorage.removeItem(STORAGE_KAFKA);
    renderKafka();
  });

  btnExportLedger.addEventListener('click', function () {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getLedger(), null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "fintech-ledger-export.json");
    dlAnchor.click();
  });

  // Batch Reconciliation simulation
  btnReconcile.addEventListener('click', function () {
    const ledger = getLedger();
    const totalSettled = ledger.reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
    reconcileOutput.innerHTML = `
      <strong>[RECONCILIATION RUN COMPLETED]</strong><br/>
      &bull; Batch ID: BATCH-${Date.now()}<br/>
      &bull; Total Ledger Transactions Checked: ${ledger.length}<br/>
      &bull; Total Settled Volume: $${totalSettled.toFixed(2)} USD<br/>
      &bull; Account Pooling Sweep Status: <span style="color:#10b981;font-weight:700">BALANCED (0 Discrepancies)</span><br/>
      &bull; Real-time Kafka Audit Digest: Emitted to topic <code>fintech-reconciliation-reports</code>
    `;
    appendKafkaEvent('RECONCILIATION_COMPLETED', {
      batchId: 'BATCH-' + Date.now(),
      reconciledRecords: ledger.length,
      volume: totalSettled,
      status: 'BALANCED'
    });
  });

  // Initial Seed Data (if first visit)
  function seedInitialData() {
    if (!localStorage.getItem(STORAGE_LEDGER)) {
      const initialLedger = [
        {
          transactionId: 'TXN-902148',
          idempotencyKey: 'idemp-8192-init-01',
          recipient: 'ACC-MONIEPOINT-PARTNER',
          amount: '1250.00',
          currency: 'USD',
          status: 'SETTLED',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          kafkaEventType: 'PAYMENT_SETTLED',
          isDuplicate: false
        },
        {
          transactionId: 'TXN-804192',
          idempotencyKey: 'idemp-7741-init-02',
          recipient: 'ACC-TREASURY-POOL',
          amount: '890.50',
          currency: 'USD',
          status: 'SETTLED',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          kafkaEventType: 'PAYMENT_SETTLED',
          isDuplicate: false
        }
      ];
      localStorage.setItem(STORAGE_LEDGER, JSON.stringify(initialLedger));
    }
  }

  // Initialize
  seedInitialData();
  refreshIdempKey();
  checkAuth();
  renderLedger();
  renderKafka();
  renderStats();

})();
