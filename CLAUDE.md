# CLAUDE.md: FinTech Payment Portal Context Guide

This repository contains the **FinTech Payment & Ledger Portal**, an edge-ready financial application designed for high-availability deployment on **Cloudflare Pages** and serving as the primary system under test (SUT) for our end-to-end automation test harnesses.

---

## 🏛️ Architecture & Capabilities

- **Stack**: Pure Vanilla HTML5, modern CSS3, and ES6+ JavaScript (`index.html`, `style.css`, `app.js`).
- **Zero-Database Dependency**: All balances, transaction ledgers, and Kafka event logs persist client-side via `localStorage`.
- **OAuth 2.0 Simulation**: Client credentials and Bearer JWT token generation with session expiration handling.
- **Financial Idempotency**:
  - Automatically attaches a UUID `Idempotency-Key` to every transaction.
  - Dedicated *"Test Duplicate (Idempotency)"* button verifies that replays return `200 OK` with cached records without double-debiting balances.
- **Asynchronous Kafka Event Inspector**:
  - Live virtual event stream emitting to topic `fintech-payment-events` (`PAYMENT_SETTLED`, `IDEMPOTENT_RETRY_DETECTED`, `RECONCILIATION_COMPLETED`).
- **Batch Account Reconciliation**:
  - Simulates end-of-day bank pooling account audit sweeps.

---

## 🚀 How to Run Locally

Because the application has zero server dependencies:
- **VS Code Live Server**: Right-click `index.html` &rarr; *"Open with Live Server"*.
- **Python HTTP Server**:
  ```bash
  python -m http.server 8080
  # Open http://localhost:8080
  ```
- **Node `npx serve`**:
  ```bash
  npx serve .
  ```

---

## 🧪 Companion Automation Harnesses

This application is automated and regression-tested by:
1. **[fintech-playwright-ts-harness](https://github.com/itfreesource-academy/fintech-playwright-ts-harness)**:
   - Playwright + TypeScript Page Object Model (POM) validating OAuth 2.0, idempotency replays, and Kafka stream arrivals.
2. **[fintech-test-platform-harness](https://github.com/itfreesource-academy/fintech-test-platform-harness)**:
   - Java 17 + REST Assured + Apache Kafka assertions with Awaitility and WireMock virtualization.
3. **[fintech-jenkins-shared-library](https://github.com/itfreesource-academy/fintech-jenkins-shared-library)**:
   - Standardized Jenkinsfile pipeline driving containerized execution.

---

## ☁️ Deployment (Cloudflare Pages)

1. Connected to GitHub repo `https://github.com/itfreesource-academy/fintech-payment-portal.git`.
2. **Build command**: *(none)*
3. **Build output directory**: `/`
