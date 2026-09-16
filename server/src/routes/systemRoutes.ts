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

export default router;
