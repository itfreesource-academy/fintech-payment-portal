# FinTech Payment & Ledger Portal

A lightweight, high-performance financial payment application designed for instant deployment on **Cloudflare Pages**. 

Features an **OAuth 2.0 authentication flow**, **idempotent payment submission**, a persistent **transaction ledger**, a real-time **Kafka event stream inspector**, and an **account reconciliation engine**—requiring **zero external database dependencies** by utilizing browser `localStorage` and client-side state.

---

## 🌟 Key Capabilities

1. **OAuth 2.0 Authentication Flow:**
   * Simulates OAuth 2.0 client credentials / Bearer JWT token generation, storing tokens securely in client session storage.
2. **Strict Financial Idempotency Testing:**
   * Every payment generates a unique `Idempotency-Key` header.
   * Includes a built-in **"Test Duplicate (Idempotency)"** button to immediately demonstrate how the system returns `200 OK` with original cached records without double-debiting balances!
3. **Real-time Kafka Event Stream Inspector:**
   * Emits live simulated Kafka events (`PAYMENT_SETTLED`, `IDEMPOTENT_RETRY_DETECTED`, `RECONCILIATION_COMPLETED`) to topic `fintech-payment-events` with partition offsets and JSON payloads.
4. **Zero-Database Persistence:**
   * All state (balances, transaction histories, Kafka logs) is preserved across page refreshes via browser `localStorage`.
5. **Batch Account Reconciliation:**
   * Simulates end-of-day banking pooling account reconciliation (inspired by the State Bank of India batch automation engine that slashed audit times from 10 days to 2 days).

---

## 🚀 One-Click Deployment to Cloudflare Pages

This application consists of pure, production-ready static assets (`index.html`, `style.css`, `app.js`):

1. Push this repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/vishalprajapati2k25/fintech-payment-portal.git
   git push -u origin main
   ```
2. In your **Cloudflare Dashboard**:
   * Go to **Workers & Pages** &rarr; **Create application** &rarr; **Pages** &rarr; **Connect to Git**.
   * Select `fintech-payment-portal`.
   * Set **Build command**: *(leave empty)*
   * Set **Build output directory**: `/`
   * Click **Save and Deploy**.
3. Your live portal will be instantly active globally on Cloudflare’s edge network (e.g. `https://fintech-payment-portal.pages.dev` or custom domain `payments.defendloop.io`).

---

## 🧪 Automated Test Coverage

This application is automated and regression-tested by our companion test platform:  
👉 **[fintech-test-platform-harness](https://github.com/vishalprajapati2k25/fintech-test-platform-harness)**
* Automated with **Playwright Java** (Page Object Model E2E tests)
* Automated with **REST Assured** (HTTP wire and schema tests)
* Continuous integration via **GitHub Actions**
