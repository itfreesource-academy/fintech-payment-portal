import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ITFreeSource Academy Enterprise FinTech Platform API',
      version: '1.0.0',
      description: `
### ITFreeSource Academy Enterprise FinTech, KYC, AML, Fraud & Insurance Platform
Comprehensive multi-service financial microservices ecosystem featuring:
- **8 Dedicated Personas** (Compliance Officer, Risk Analyst, Underwriter, Fraud Investigator, Retail/HNI Customer, PEP, Auditor)
- **KYC & Zero-Cost DigiLocker Sandbox** (Authentic Aadhaar, PAN, DL schemas with digital signature verification)
- **Multi-Jurisdiction AML Screening** (India FIU-IND Rule 114B ₹50k PAN mandate, ₹10L CTR, Structuring smurfing, UAE CBUAE AED 55k with goAML XML generation, AUSTRAC AUD 10k TTR, UN/FATF PEP Watchlists)
- **Real-Time Fraud Engine** (5-vector risk scoring, impossible travel detection, velocity bursts, headless automation detection)
- **Core Banking Ledger** (Financial idempotency \`Idempotency-Key\`, multi-currency wallets, double-entry accounting)
- **Insurance Engine** (Actuarial quote engine, policy underwriting, claims filing & fraud scoring)
- **Sensitive Data & PII Vault** (AES-256-GCM encryption, dynamic masking, tokenization, DPDP Act 2023 Right-to-be-Forgotten erasure)
- **Apache Kafka Broker** (6 streaming topics, partitions, consumer lag, DLQ replay)
- **Enterprise Webhooks** (HMAC-SHA256 signature verification, delivery attempt audit logs)

---
> ⚠️ **LEGAL & REGULATORY DISCLAIMER (EDUCATIONAL USE ONLY)**:
> This API and accompanying source code are provided "AS IS" solely for educational study, academic research, and automated test benchmarking. ITFreeSource Academy is NOT an authorized bank, financial institution, or insurer. Zero real financial transactions or fiat settlement are conducted. All personas, accounts, and government document numbers are 100% synthetic fixtures. All AML thresholds are cited from official public government gazettes (Rule 114B, PMLA 2005, CBUAE Notice 74/2019). The authors disclaim all warranties and assume ZERO LIABILITY for downstream usage. Complete terms: [LEGAL_DISCLAIMER.md](https://github.com/itfreesource-academy/itfreesource-academy-fintech-platform/blob/main/LEGAL_DISCLAIMER.md).
      `,
      contact: {
        name: 'ITFreeSource Academy',
        url: 'https://github.com/itfreesource-academy'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Local FinTech API Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);
