# ITFreeSource Academy | Enterprise FinTech Platform

[![Build & Test Status](https://img.shields.io/badge/Vitest-28%2F28%20Passed-brightgreen)](https://github.com/itfreesource-academy/itfreesource-academy-fintech-platform)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Regulatory Compliance](https://img.shields.io/badge/AML-FIU--IND%20%7C%20CBUAE%20%7C%20AUSTRAC-indigo)](https://github.com/itfreesource-academy/itfreesource-academy-fintech-platform)
[![Privacy Compliance](https://img.shields.io/badge/Privacy-DPDP%20Act%202023%20%7C%20AES--256--GCM-teal)](https://github.com/itfreesource-academy/itfreesource-academy-fintech-platform)
[![OpenAPI Specification](https://img.shields.io/badge/OpenAPI-3.0%20Swagger-emerald)](http://localhost:5001/api/docs)

An enterprise-grade, multi-service financial monorepo engineered by **ITFreeSource Academy**. Designed as a reference architecture for production financial systems, real-world automated QA testing (Playwright & REST Assured), and regulatory compliance engineering.

> [!CAUTION]
> ### ⚠️ LEGAL & REGULATORY DISCLAIMER: FOR EDUCATIONAL & ACADEMIC PURPOSES ONLY
> **This software is provided "AS IS" for pedagogical, educational, and automated QA testing reference only.**
> - **NOT A FINANCIAL INSTITUTION**: ITFreeSource Academy and contributors are NOT authorized banks, financial institutions, payment gateways, insurers, or regulatory advisors.
> - **NO REAL TRANSACTIONS / ZERO LIABILITY**: Does NOT process real fiat currency, legal tender, or real insurance policies. The authors assume **ZERO LIABILITY** for any direct, indirect, incidental, or consequential damages resulting from the use or misuse of this codebase.
> - **100% SYNTHETIC DATA**: All names, Aadhaar numbers, PANs, DLs, and accounts are synthetic mock fixtures with zero real-world individuals.
> - **PUBLIC DOMAIN STATUTES**: All compliance thresholds (FIU-IND, CBUAE, AUSTRAC, UN) are derived exclusively from published official government gazettes and statutory regulations.
>
> 📖 **Read the complete binding terms**: [**LEGAL_DISCLAIMER.md**](./LEGAL_DISCLAIMER.md)

---

## 🌟 Architecture & Key Microservices

```mermaid
flowchart TD
    subgraph ClientApp ["Client Layer: Dark Slate SPA (React 18 + Vite)"]
        UI_KYC["KYC & DigiLocker Wizard (Aadhaar/PAN/DL)"]
        UI_AML["AML Screening: FIU-IND (₹50k/₹10L) & CBUAE (AED 55k)"]
        UI_FRAUD["Fraud & Velocity Testing Engine"]
        UI_BANK["Wallets & Idempotent Multi-Currency Ledger"]
        UI_INS["Insurance & Claims Engine"]
        UI_PII["PII Vault & Sensitive Data Masking Console"]
        UI_CHAOS["Microservices Chaos Lab & Kafka Streams (/playground)"]
    end

    subgraph Microservices ["Enterprise FinTech Monorepo (server/src)"]
        SVC_AUTH["1. Auth & Identity Service (JWT, MFA, 8 Personas)"]
        SVC_KYC["2. KYC & Identity Verification Service"]
        SVC_DIGI["3. DigiLocker OAuth2 Gateway & Sandbox Issuer"]
        SVC_AML["4. AML & Sanctions Service (FIU-IND, CBUAE goAML, AUSTRAC)"]
        SVC_FRAUD["5. Fraud Detection & Real-time Risk Scoring Engine"]
        SVC_LEDGER["6. Core Banking, Wallets & Double-Entry Ledger"]
        SVC_INS["7. Insurance Underwriting & Claims Engine"]
        SVC_PII["8. Sensitive Data Vault (AES-256-GCM, Tokenizer)"]
    end

    subgraph AsyncBus ["Event-Driven & Outbound Notification"]
        KAFKA["Apache Kafka Broker (6 Topics, Consumer Lag, DLQ Replay)"]
        WEBHOOKS["Enterprise Webhooks (HMAC-SHA256, Delivery Logs, Retries)"]
    end

    UI_KYC --> SVC_KYC
    UI_KYC --> SVC_DIGI
    UI_AML --> SVC_AML
    UI_FRAUD --> SVC_FRAUD
    UI_BANK --> SVC_LEDGER
    UI_INS --> SVC_INS
    UI_PII --> SVC_PII

    SVC_KYC -->|Emit kyc.verified| KAFKA
    SVC_AML -->|Emit aml.alert| KAFKA
    SVC_FRAUD -->|Emit fraud.scored| KAFKA
    SVC_LEDGER -->|Emit transfer.settled| KAFKA
    SVC_INS -->|Emit claim.filed| KAFKA

    SVC_KYC -->|Trigger Webhook| WEBHOOKS
    SVC_AML -->|Trigger Webhook| WEBHOOKS
    SVC_FRAUD -->|Trigger Webhook| WEBHOOKS
    SVC_INS -->|Trigger Webhook| WEBHOOKS
```

---

## 🏛️ Statutory Compliance & International Jurisdictions

All AML rules, thresholds, and reporting formats are derived directly from published public government statutes:

1. **🇮🇳 India — Financial Intelligence Unit (FIU-IND) & RBI (PMLA)**:
   - **Rule 114B Cash Mandate**: Single-day cash transactions $> \text{₹}50,000$ without verified PAN are automatically blocked.
   - **Rule 3 Cash Transaction Report (CTR)**: Single or aggregate cash $> \text{₹}10 \text{ Lakhs}$ triggers CTR filing.
   - **Rule 3 Cross-Border Wire (CBWTR)**: Cross-border wires $> \text{₹}5 \text{ Lakhs}$ logged for regulatory dispatch.
   - **Sub-Threshold Structuring / Smurfing**: Detection of deposits between $\text{₹}49,000$ and $\text{₹}49,999$ attempting to bypass the $\text{₹}50,000$ PAN rule.

2. **🇦🇪 UAE — Central Bank of the UAE (CBUAE) & UAE FIU**:
   - **High Cash Transaction (HCT)**: Cash transactions $\ge \text{AED } 55,000$ trigger statutory alerts and generate download-ready **UNODC goAML XML** payloads.

3. **🇦🇺 Australia — AUSTRAC**:
   - **Threshold Transaction Report (TTR)**: Transactions $\ge \text{AUD } 10,000$ flagged for AUSTRAC reporting.

4. **🌐 Global — FATF, UN Security Council & Interpol**:
   - Automated screening for Politically Exposed Persons (PEP) and international sanctions.

5. **🇮🇳 Privacy — Digital Personal Data Protection (DPDP) Act 2023**:
   - AES-256-GCM hardware encryption enclave, dynamic masking (`XXXX-XXXX-1234`, `ABCDE****F`), surrogate tokenization (`tok_pan_...`), and Section 12 Right-to-be-Forgotten cryptographic shredding.

---

## 👥 The 8 Core Sandbox Personas

| Role | Name | Clearance | Focus Area |
| :--- | :--- | :--- | :--- |
| `compliance_officer` | **Maya Lin** | Tier 1 | FIU-IND Rule 114B review, CBUAE goAML XML export, KYC approval |
| `risk_analyst` | **David Vance** | Tier 2 | Multi-vector fraud scoring, impossible travel analysis, velocity monitoring |
| `underwriter` | **Sarah Chen** | Tier 2 | Insurance policy underwriting, actuarial pricing, claims fraud scoring |
| `fraud_investigator`| **Alex Morgan** | Tier 1 | Account freezing, headless automation blocking, device fingerprinting |
| `retail_customer` | **Vikram Sharma** | Tier 3 | Personal banking (INR/USD), verified Aadhaar/PAN, health insurance policy |
| `hni_customer` | **Julian Sterling** | Executive | Private wealth (AED/INR), large cross-border transactions |
| `pep_sanctioned_user`| **Vladimir Voronov**| Tier 3 | Simulated Politically Exposed Person (UN Security Council Watchlist) |
| `auditor` | **Victoria Taylor** | Tier 1 | Read-only regulatory audit, PII access logs, double-entry reconciliation |

---

## ⚡ Quick Start & Development

### 1. Prerequisites
- Node.js $\ge 18.0.0$
- npm $\ge 9.0.0$

### 2. Install & Run Locally
```bash
# Clone the repository
git clone https://github.com/itfreesource-academy/itfreesource-academy-fintech-platform.git
cd itfreesource-academy-fintech-platform

# Install monorepo dependencies
npm run install:all

# Run both Server (port 5001) and Client (port 3001) concurrently
npm run dev
```

### 3. Run Automated Vitest Test Suites
```bash
# Run all 8 test suites (28 tests across KYC, AML, Fraud, Ledger, PII, Kafka, Webhooks)
npm test
```

### 4. Interactive OpenAPI 3.0 Documentation
Once the server is running, open:
- Swagger UI: `http://localhost:5001/api/docs`
- OpenAPI JSON: `http://localhost:5001/api/swagger.json`
- Healthcheck: `http://localhost:5001/api/v1/system/health`

---

## 🚀 Deployment Targets

### Cloudflare Pages & Workers
This monorepo compiles into a single edge artifact:
- Build command: `npm run build`
- Output directory: `dist/`
- Edge Worker: `worker.ts` with `wrangler.toml`

---

## 🔗 Companion Test Harnesses

- **Playwright Test Harness**: [fintech-playwright-ts-harness](https://github.com/itfreesource-academy/fintech-playwright-ts-harness)
- **CI/CD Shared Library**: [fintech-jenkins-shared-library](https://github.com/itfreesource-academy/fintech-jenkins-shared-library)
- **Book Store Reference**: [itfreesource-academy-book-store](https://github.com/itfreesource-academy/itfreesource-academy-book-store)
