import { Router, Request, Response } from 'express';
import {
  encryptPii,
  decryptPii,
  erasePii,
  getAllPiiRecords,
  getPiiAuditLogs,
  maskPii
} from '../services/piiVaultService.js';
import { PersonaRole, PiiDataType } from '../types/index.js';

const router = Router();

/**
 * @openapi
 * /api/v1/pii/records:
 *   get:
 *     summary: Retrieve masked PII vault records
 *     tags: [PII Vault & Compliance]
 */
router.get('/records', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const records = getAllPiiRecords(userId);
  return res.json({ success: true, count: records.length, records });
});

/**
 * @openapi
 * /api/v1/pii/encrypt:
 *   post:
 *     summary: Ingest and AES-256-GCM encrypt sensitive PII with surrogate token
 *     tags: [PII Vault & Compliance]
 */
router.post('/encrypt', (req: Request, res: Response) => {
  try {
    const {
      userId = 'usr_retail_01',
      dataType,
      plainText,
      actorUserId = 'usr_retail_01',
      actorRole = 'retail_customer'
    } = req.body;

    if (!dataType || !plainText) {
      return res.status(400).json({ error: 'dataType and plainText are required' });
    }

    const record = encryptPii(
      userId,
      dataType as PiiDataType,
      plainText,
      actorUserId,
      actorRole as PersonaRole,
      req.ip || '127.0.0.1'
    );

    return res.status(201).json({ success: true, record });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/pii/decrypt:
 *   post:
 *     summary: Decrypt PII record with RBAC clearance validation and audit logging
 *     tags: [PII Vault & Compliance]
 */
router.post('/decrypt', (req: Request, res: Response) => {
  try {
    const {
      recordId,
      actorUserId = 'usr_compliance_01',
      actorRole = 'compliance_officer',
      justification = 'Statutory regulatory KYC verification under PMLA'
    } = req.body;

    if (!recordId) {
      return res.status(400).json({ error: 'recordId is required' });
    }

    const result = decryptPii(
      recordId,
      actorUserId,
      actorRole as PersonaRole,
      justification,
      req.ip || '127.0.0.1'
    );

    return res.json({
      success: true,
      plainText: result.plainText,
      record: result.record
    });
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/pii/erase:
 *   post:
 *     summary: Execute Right-to-be-Forgotten data shredding under DPDP Act 2023
 *     tags: [PII Vault & Compliance]
 */
router.post('/erase', (req: Request, res: Response) => {
  try {
    const {
      recordId,
      actorUserId = 'usr_compliance_01',
      actorRole = 'compliance_officer',
      justification = 'Data principal requested Right-to-be-Forgotten erasure'
    } = req.body;

    if (!recordId) {
      return res.status(400).json({ error: 'recordId is required' });
    }

    const erased = erasePii(
      recordId,
      actorUserId,
      actorRole as PersonaRole,
      justification,
      req.ip || '127.0.0.1'
    );

    return res.json({ success: true, message: 'Record cryptographically erased under DPDP Act 2023', record: erased });
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/pii/audit-logs:
 *   get:
 *     summary: Retrieve immutable PII access and decryption audit trail
 *     tags: [PII Vault & Compliance]
 */
router.get('/audit-logs', (req: Request, res: Response) => {
  const targetUserId = req.query.targetUserId as string;
  const logs = getPiiAuditLogs(targetUserId);
  return res.json({ success: true, count: logs.length, logs });
});

/**
 * @openapi
 * /api/v1/pii/mask-preview:
 *   post:
 *     summary: Preview dynamic masking on a string without storing
 *     tags: [PII Vault & Compliance]
 */
router.post('/mask-preview', (req: Request, res: Response) => {
  const { value, dataType = 'PAN' } = req.body;
  const masked = maskPii(value || '', dataType as PiiDataType);
  return res.json({ originalLength: (value || '').length, masked });
});

export default router;
