import { Router, Request, Response } from 'express';
import { getAllUsers } from '../services/authService.js';
import { getAllWallets, getAllTransactions } from '../services/ledgerService.js';
import { getAllKycRecords } from '../services/kycService.js';
import { getAllAmlAlerts } from '../services/amlService.js';
import { getAllFraudEvaluations } from '../services/fraudService.js';
import { getAllPolicies, getAllClaims } from '../services/insuranceService.js';
import { getAllPiiRecords, getPiiAuditLogs } from '../services/piiVaultService.js';
import { getTopicMetrics } from '../services/kafkaBroker.js';
import { getAllWebhooks, getWebhookDeliveryLogs } from '../services/webhookService.js';

const router = Router();

/**
 * @openapi
 * /api/v1/system/health:
 *   get:
 *     summary: System health and microservices status
 *     tags: [System & Health]
 */
router.get('/health', (_req: Request, res: Response) => {
  return res.json({
    status: 'HEALTHY',
    platform: 'ITFreeSource Academy Enterprise FinTech Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    microservices: {
      authService: 'OPERATIONAL',
      kycService: 'OPERATIONAL',
      digiLockerSandbox: 'OPERATIONAL',
      amlScreeningService: 'OPERATIONAL (FIU-IND, CBUAE, AUSTRAC, FATF/UN)',
      fraudRiskEngine: 'OPERATIONAL',
      coreBankingLedger: 'OPERATIONAL',
      insuranceEngine: 'OPERATIONAL',
      piiVault: 'OPERATIONAL (AES-256-GCM / DPDP Act 2023)',
      kafkaBroker: 'OPERATIONAL (6 Topics)',
      webhookDispatcher: 'OPERATIONAL'
    }
  });
});

/**
 * @openapi
 * /api/v1/system/stats:
 *   get:
 *     summary: Global statistical metrics across all 8 microservices
 *     tags: [System & Health]
 */
router.get('/stats', (_req: Request, res: Response) => {
  return res.json({
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

/**
 * @openapi
 * /api/v1/system/disclaimer:
 *   get:
 *     summary: Official statutory citations and zero-liability educational disclaimer
 *     tags: [System & Health]
 */
router.get('/disclaimer', (_req: Request, res: Response) => {
  return res.json({
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

export default router;

