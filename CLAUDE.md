# CLAUDE.md: ITFreeSource Academy FinTech Platform

Quick reference for Claude Code and CLI agents working on `itfreesource-academy-fintech-platform`.

---

## ⚡ Essential Commands
```bash
# Development
npm run dev              # Frontend on :5174, Backend on :5001

# Testing
npm test                 # Run 28 Vitest financial microservices tests
npm run test:coverage    # Generate code coverage report

# Building
npm run build            # Compile server and client to ./dist
```

---

## 🏛️ Microservices & Endpoints
- Swagger API Docs: `http://localhost:5001/api/docs`
- KYC & DigiLocker: `POST /api/v1/kyc/verify`, `POST /api/v1/digilocker/fetch`
- AML Screening: `POST /api/v1/aml/screen` (FIU-IND ₹50k, CBUAE AED 55k, goAML XML export)
- Fraud Engine: `POST /api/v1/fraud/score`
- Double-Entry Ledger: `POST /api/v1/ledger/transfer` (Idempotency Key required)
- Insurance: `POST /api/v1/insurance/claims`
- PII Vault: `POST /api/v1/pii/tokenize`, `POST /api/v1/pii/detokenize`

---

## ⚠️ Educational Disclaimer
Code is strictly for educational, QA automation, and pedagogical purposes. See `LEGAL_DISCLAIMER.md`. All data is synthetic.
