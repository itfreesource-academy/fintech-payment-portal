import crypto from 'crypto';
import { PiiVaultRecord, PiiAuditLog, PiiDataType, PersonaRole } from '../types/index.js';

// 256-bit AES master key for sensitive data encryption
const MASTER_SECRET = process.env.PII_MASTER_KEY || 'itfreesource-fintech-master-secret-vault-key-32b!';
const ENCRYPTION_KEY = crypto.scryptSync(MASTER_SECRET, 'salt_itfreesource_2026', 32);

// In-memory vault records and audit trail
const piiRecords: Map<string, PiiVaultRecord> = new Map();
const auditLogs: PiiAuditLog[] = [];

/**
 * Dynamic PII Masking Utilities according to regulatory standards (e.g. UIDAI Aadhaar Act, RBI KYC Master Direction)
 */
export function maskPii(value: string, type: PiiDataType): string {
  if (!value) return '';
  const clean = value.replace(/\s+/g, '');

  switch (type) {
    case 'AADHAAR':
      // Show only last 4 digits: "XXXX XXXX 1234"
      if (clean.length >= 4) {
        const last4 = clean.slice(-4);
        return `XXXX-XXXX-${last4}`;
      }
      return 'XXXX-XXXX-XXXX';

    case 'PAN':
      // Show first 2 and last 1: "AB*****1F" or standard "ABCDE****F"
      if (clean.length === 10) {
        return `${clean.slice(0, 5)}****${clean.slice(9)}`;
      }
      return `${clean.slice(0, 2)}******${clean.slice(-2)}`;

    case 'PASSPORT':
      // Show first 1 and last 2: "A****56"
      if (clean.length >= 4) {
        return `${clean.charAt(0)}****${clean.slice(-3)}`;
      }
      return 'P******';

    case 'DRIVING_LICENSE':
      if (clean.length >= 6) {
        return `${clean.slice(0, 4)}********${clean.slice(-3)}`;
      }
      return 'DL*********';

    case 'PHONE_NUMBER':
      if (clean.length >= 4) {
        return `+${clean.slice(0, 2)} ***** *${clean.slice(-4)}`;
      }
      return '+91 ***** *****';

    case 'EMAIL': {
      const parts = clean.split('@');
      if (parts.length === 2) {
        const name = parts[0];
        const domain = parts[1];
        const maskedName = name.length > 2 ? `${name.charAt(0)}***${name.charAt(name.length - 1)}` : `${name.charAt(0)}***`;
        return `${maskedName}@${domain}`;
      }
      return '****@domain.com';
    }

    case 'BANK_ACCOUNT':
      if (clean.length >= 4) {
        return `XXXXXXXXXX${clean.slice(-4)}`;
      }
      return 'XXXXXXXXXXXX';

    default:
      return '************';
  }
}

/**
 * Encrypts raw sensitive PII using AES-256-GCM with authenticated tags
 */
export function encryptPii(
  userId: string,
  dataType: PiiDataType,
  plainText: string,
  actorUserId: string,
  actorRole: PersonaRole,
  ipAddress: string = '127.0.0.1'
): PiiVaultRecord {
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  const token = `tok_${dataType.toLowerCase()}_${crypto.randomBytes(8).toString('hex')}`;
  const maskedValue = maskPii(plainText, dataType);
  const retentionUntil = new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString(); // 7-year statutory retention

  const record: PiiVaultRecord = {
    id: `pii_${crypto.randomUUID()}`,
    userId,
    token,
    dataType,
    encryptedValue: encrypted,
    iv: iv.toString('hex'),
    authTag,
    maskedValue,
    retentionUntil,
    isErased: false,
    createdAt: new Date().toISOString()
  };

  piiRecords.set(record.id, record);

  // Log audit event
  logPiiAudit({
    actorUserId,
    actorRole,
    targetUserId: userId,
    action: 'ENCRYPT',
    dataType,
    justification: 'Ingested into Secure PII Vault for compliance and regulatory processing',
    ipAddress
  });

  return record;
}

/**
 * Decrypts PII only for authorized clearance levels with strict audit logging
 */
export function decryptPii(
  recordId: string,
  actorUserId: string,
  actorRole: PersonaRole,
  justification: string,
  ipAddress: string = '127.0.0.1'
): { plainText: string; record: PiiVaultRecord } {
  const record = piiRecords.get(recordId);
  if (!record) {
    throw new Error(`PII record ${recordId} not found`);
  }

  if (record.isErased) {
    throw new Error(`Data is permanently erased under DPDP Act 2023 Right-to-be-Forgotten`);
  }

  // RBAC clearance verification: only compliance, risk, or auditor can decrypt
  const allowedRoles: PersonaRole[] = ['compliance_officer', 'risk_analyst', 'fraud_investigator', 'auditor'];
  if (!allowedRoles.includes(actorRole)) {
    throw new Error(`Access Denied: Role '${actorRole}' has insufficient clearance to decrypt raw PII`);
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    ENCRYPTION_KEY,
    Buffer.from(record.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(record.authTag, 'hex'));

  let decrypted = decipher.update(record.encryptedValue, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  logPiiAudit({
    actorUserId,
    actorRole,
    targetUserId: record.userId,
    action: 'DECRYPT',
    dataType: record.dataType,
    justification,
    ipAddress
  });

  return { plainText: decrypted, record };
}

/**
 * Right-to-be-Forgotten (DPDP Act 2023 / GDPR Art. 17):
 * Cryptographically shreds and erases sensitive records upon verified user request.
 */
export function erasePii(
  recordId: string,
  actorUserId: string,
  actorRole: PersonaRole,
  justification: string,
  ipAddress: string = '127.0.0.1'
): PiiVaultRecord {
  const record = piiRecords.get(recordId);
  if (!record) {
    throw new Error(`PII record ${recordId} not found`);
  }

  record.isErased = true;
  record.erasedAt = new Date().toISOString();
  record.encryptedValue = 'SHREDDED_CRYPTOGRAPHICALLY';
  record.iv = '000000000000000000000000';
  record.authTag = '00000000000000000000000000000000';
  record.maskedValue = 'ERASED_UNDER_DPDP_ACT_2023';

  piiRecords.set(record.id, record);

  logPiiAudit({
    actorUserId,
    actorRole,
    targetUserId: record.userId,
    action: 'ERASE_DPDP',
    dataType: record.dataType,
    justification: `Executed Right-to-be-Forgotten (DPDP Act 2023): ${justification}`,
    ipAddress
  });

  return record;
}

export function logPiiAudit(log: Omit<PiiAuditLog, 'id' | 'timestamp'>): PiiAuditLog {
  const audit: PiiAuditLog = {
    id: `audit_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    ...log
  };
  auditLogs.unshift(audit);
  return audit;
}

export function getAllPiiRecords(userId?: string): PiiVaultRecord[] {
  const records = Array.from(piiRecords.values());
  if (userId) {
    return records.filter(r => r.userId === userId);
  }
  return records;
}

export function getPiiAuditLogs(targetUserId?: string): PiiAuditLog[] {
  if (targetUserId) {
    return auditLogs.filter(l => l.targetUserId === targetUserId);
  }
  return auditLogs;
}
