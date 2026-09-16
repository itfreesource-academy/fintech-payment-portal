# AGENTS.md: ITFreeSource Academy FinTech Platform Context Guide

This repository contains the **ITFreeSource Academy FinTech Platform**, an enterprise-grade financial microservices monorepo designed as a reference architecture for production banking systems, regulatory compliance engineering, and end-to-end automated QA testing (Playwright & REST Assured).

---

## ⚠️ MANDATORY LEGAL & REGULATORY DIRECTIVE

All AI agents and developers working on this codebase **MUST PRESERVE** the educational and safe-harbor nature of this project:
- **EDUCATIONAL USE ONLY**: This software is provided strictly for academic, educational, and QA test automation purposes.
- **ZERO LIABILITY**: ITFreeSource Academy and contributors assume zero liability for the use or misuse of this codebase. It does not process real legal tender or currency.
- **100% SYNTHETIC DATA**: All personal names, Aadhaar numbers, PANs, account numbers, and fixtures are synthetic mocks.
- **PUBLIC DOMAIN STATUTES**: All compliance thresholds (FIU-IND, RBI, CBUAE, AUSTRAC, UN) are derived exclusively from published official government gazettes and statutory regulations.
- **DO NOT REMOVE**: The binding legal disclaimer in [`LEGAL_DISCLAIMER.md`](./LEGAL_DISCLAIMER.md) must remain linked and intact across all modules.

---

## 🏛️ Architecture & Microservices Monorepo

```
itfreesource-academy-fintech-platform/
├── client/                     # React 18 SPA, Vite, Tailwind CSS, Dark Slate UI
│   ├── src/pages/              # KYC, AML, Fraud, Wallets, Insurance, PII Vault, Chaos Lab
│   └── src/components/         # Reusable widgets, DigiLocker modal, goAML XML export
├── server/                     # Node.js 20+, Express.js 4.21, TypeScript 5.8
│   ├── src/services/
│   │   ├── authService.ts      # OAuth 2.0 simulation, JWT bearer tokens, 8 personas
│   │   ├── kycService.ts       # Identity verification, Aadhaar/PAN/DL validators
│   │   ├── digilockerService.ts# DigiLocker OAuth2 gateway & sandbox document issuer
│   │   ├── amlService.ts       # FIU-IND (₹50k/₹10L), CBUAE (AED 55k), AUSTRAC (AUD 10k)
│   │   ├── fraudService.ts     # Real-time risk scoring, velocity rules, anomaly detection
│   │   ├── ledgerService.ts    # Multi-currency double-entry ledger & idempotency key engine
│   │   ├── insuranceService.ts # Policy underwriting, premium calculation, claims lifecycle
│   │   ├── piiVaultService.ts  # AES-256-GCM hardware enclave, surrogate tokenization
│   │   ├── kafkaBroker.ts      # 6 topics, consumer lag tracking, DLQ replay
│   │   └── webhookService.ts   # Outbound HMAC-SHA256 dispatches & retry resilience
│   └── src/tests/              # 28 Vitest unit & integration tests
├── worker.ts                   # Cloudflare Workers edge handler
├── wrangler.toml               # Edge deployment configuration
├── LEGAL_DISCLAIMER.md         # Full statutory compliance & disclaimer terms
└── package.json                # Root monorepo scripts
```

---

## 📜 Statutory Compliance Specifications (Public Domain)

### 1. 🇮🇳 India — Financial Intelligence Unit (FIU-IND) & RBI (PMLA)
- **Rule 114B Cash Mandate**: Single-day cash transactions $> \text{₹}50,000$ without verified PAN are automatically blocked.
- **Rule 3 Cash Transaction Report (CTR)**: Single or aggregate cash $> \text{₹}10 \text{ Lakhs}$ triggers CTR regulatory filing.
- **Rule 3 Cross-Border Wire (CBWTR)**: Cross-border wires $> \text{₹}5 \text{ Lakhs}$ logged for regulatory dispatch.
- **Sub-Threshold Structuring / Smurfing**: Detection of deposits between $\text{₹}49,000$ and $\text{₹}49,999$ attempting to bypass the $\text{₹}50,000$ PAN rule.

### 2. 🇦🇪 UAE — Central Bank of the UAE (CBUAE) & UAE FIU
- **High Cash Transaction (HCT)**: Cash transactions $\ge \text{AED } 55,000$ trigger statutory alerts and generate download-ready **UNODC goAML XML** payloads.

### 3. 🇦🇺 Australia — AUSTRAC
- **Threshold Transaction Report (TTR)**: Transactions $\ge \text{AUD } 10,000$ flagged for AUSTRAC reporting.

### 4. 🇮🇳 Privacy — Digital Personal Data Protection (DPDP) Act 2023
- AES-256-GCM hardware encryption enclave, dynamic masking (`XXXX-XXXX-1234`, `ABCDE****F`), surrogate tokenization (`tok_pan_...`), and Section 12 Right-to-be-Forgotten cryptographic shredding.

---

## 🚀 How to Run, Test & Build (Cross-Device)

```bash
# 1. Install dependencies
npm install

# 2. Run local development (Client on :5174, Server on :5001)
npm run dev

# 3. Run full test suite (28 Vitest tests)
npm test

# 4. Generate Code Coverage
npm run test:coverage

# 5. Production Build (Compiles to ./dist for Cloudflare)
npm run build
```

---

## 👥 The 8 Core Sandbox Personas
1. `compliance_officer` / `AmlOfficer@2026!` (FIU-IND & goAML report exports)
2. `fraud_analyst` / `FraudAnalyst@2026!` (Risk rules & velocity override)
3. `retail_user_inr` / `IndiaUser@2026!` (₹50,000 PAN threshold & DigiLocker)
4. `retail_user_aed` / `DubaiUser@2026!` (AED 55,000 CBUAE goAML)
5. `kyc_applicant_pending` / `KycPending@2026!` (Document upload wizard)
6. `digilocker_verified_user` / `DigiUser@2026!` (Pre-verified Aadhaar & PAN)
7. `high_net_worth_pep` / `PepUser@2026!` (PEP screening & enhanced due diligence)
8. `insured_policyholder` / `InsuranceUser@2026!` (Claims submission)
