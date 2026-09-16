/**
 * Enterprise FinTech Monorepo Data Models & Type Definitions
 * Covers: Auth, Personas, KYC, DigiLocker, AML (FIU-IND, CBUAE, AUSTRAC),
 * Fraud Detection, Core Banking Ledger, Insurance, PII Vault, Kafka & Webhooks.
 */

// ==========================================
// 1. PERSONAS & AUTH
// ==========================================
export type PersonaRole =
  | 'compliance_officer'
  | 'risk_analyst'
  | 'underwriter'
  | 'fraud_investigator'
  | 'retail_customer'
  | 'hni_customer'
  | 'pep_sanctioned_user'
  | 'auditor';

export interface PersonaProfile {
  role: PersonaRole;
  username: string;
  email: string;
  fullName: string;
  title: string;
  department: string;
  jurisdictionFocus: string;
  avatarUrl: string;
  clearanceLevel: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'EXECUTIVE';
  description: string;
  defaultPermissions: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: PersonaRole;
  department: string;
  status: 'ACTIVE' | 'FROZEN' | 'SUSPENDED';
  mfaEnabled: boolean;
  mfaSecret?: string;
  panNumberMasked?: string;
  aadhaarNumberMasked?: string;
  passportMasked?: string;
  createdAt: string;
  lastLoginAt?: string;
}

// ==========================================
// 2. KYC & DIGILOCKER
// ==========================================
export type DocumentIdType = 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE';

export type KycStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'VERIFYING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ENHANCED_DUE_DILIGENCE';

export interface KycRecord {
  id: string;
  userId: string;
  fullName: string;
  dob: string;
  gender: 'M' | 'F' | 'OTHER';
  address: string;
  idType: DocumentIdType;
  idNumberMasked: string;
  documentHash: string;
  selfieUrl?: string;
  livenessScore: number; // 0 - 100
  faceMatchScore: number; // 0 - 100
  vkycStatus: 'NOT_STARTED' | 'SCHEDULED' | 'COMPLETED';
  vkycAgentId?: string;
  geoCoordinates?: {
    lat: number;
    lng: number;
    city: string;
    country: string;
  };
  status: KycStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface DigiLockerConsent {
  consentId: string;
  userId: string;
  orgId: string;
  purpose: string;
  scope: ('AADHAAR' | 'PAN' | 'DRIVING_LICENSE')[];
  status: 'PENDING' | 'CONSENTED' | 'REVOKED';
  expiresAt: string;
  consentedAt?: string;
}

export interface DigiLockerIssuedDoc {
  docType: DocumentIdType;
  docId: string;
  uri: string;
  issueDate: string;
  issuer: string;
  digitalSignature: string;
  payload: {
    fullName: string;
    dob: string;
    gender: string;
    address: string;
    maskedDocNumber: string;
    metadata: Record<string, any>;
  };
}

// ==========================================
// 3. AML & SANCTIONS (FIU-IND, CBUAE, AUSTRAC, UN)
// ==========================================
export type AmlJurisdiction = 'FIU-IND' | 'CBUAE' | 'AUSTRAC' | 'GLOBAL_PEP';

export type AmlRuleCode =
  | 'IND_RULE_114B'        // FIU-IND / RBI: Cash transaction > INR 50,000 mandates verified PAN
  | 'IND_RULE_3_CTR'       // FIU-IND / PMLA: Single or aggregate cash > INR 10 Lakhs/month CTR
  | 'IND_RULE_3_CBWTR'     // FIU-IND: Cross-border wire transfer > INR 5 Lakhs
  | 'IND_STRUCTURING'      // FIU-IND: Smurfing / Structuring just below 50,000 threshold (e.g. 49,000 - 49,999)
  | 'UAE_AED_55K_CASH'     // CBUAE / UAE FIU: High Cash Transaction > AED 55,000 (goAML XML generation)
  | 'AUS_AUD_10K_TTR'      // AUSTRAC: Threshold Transaction Report for cash/wire >= AUD 10,000
  | 'GLOBAL_PEP_MATCH';    // FATF / UN / EU: Politically Exposed Persons screening match

export interface AmlAlert {
  id: string;
  userId: string;
  userName: string;
  transactionId?: string;
  jurisdiction: AmlJurisdiction;
  ruleCode: AmlRuleCode;
  ruleName: string;
  legalCitation: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  amount: number;
  currency: string;
  details: string;
  goAmlXmlPayload?: string;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'FILED_WITH_REGULATOR' | 'FALSE_POSITIVE' | 'CLOSED';
  flaggedAt: string;
  reviewedBy?: string;
  resolutionNotes?: string;
}

export interface SanctionEntity {
  id: string;
  name: string;
  aliases: string[];
  entityType: 'INDIVIDUAL' | 'ORGANIZATION';
  sourceList: 'UN_SECURITY_COUNCIL' | 'INTERPOL_RED_NOTICE' | 'EU_CONSOLIDATED' | 'RBI_DEBARRED';
  designationDate: string;
  country: string;
  matchScore: number;
  isPep: boolean;
}

// ==========================================
// 4. REAL-TIME FRAUD DETECTION ENGINE
// ==========================================
export type FraudDecision = 'APPROVE' | 'CHALLENGE_MFA' | 'REJECT' | 'FREEZE_ACCOUNT';

export interface FraudEvaluation {
  evaluationId: string;
  userId: string;
  transactionId?: string;
  totalRiskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  decision: FraudDecision;
  factorBreakdown: {
    ipGeoRisk: number;       // 0 - 25: impossible travel / VPN / proxy
    velocityRisk: number;    // 0 - 25: transactions per minute burst
    deviceFingerprintRisk: number; // 0 - 20: headless / emulator / unknown device
    anomalyRisk: number;     // 0 - 15: deviated from 30-day baseline
    amountRisk: number;      // 0 - 15: extreme single amount
  };
  triggeredRules: string[];
  reasons: string[];
  evaluatedAt: string;
}

// ==========================================
// 5. CORE BANKING, WALLETS & DOUBLE-ENTRY LEDGER
// ==========================================
export type CurrencyCode = 'INR' | 'AED' | 'AUD' | 'USD' | 'EUR';

export interface Wallet {
  id: string;
  userId: string;
  currency: CurrencyCode;
  balance: number;
  availableBalance: number;
  holdBalance: number;
  status: 'ACTIVE' | 'LOCKED' | 'FROZEN';
  updatedAt: string;
}

export interface Transaction {
  id: string;
  idempotencyKey: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  senderWalletId: string;
  recipientWalletId: string;
  amount: number;
  currency: CurrencyCode;
  exchangeRate: number;
  channel: 'CASH' | 'WIRE' | 'UPI' | 'INTERNAL';
  panNumberProvided?: string;
  hasVerifiedPan: boolean;
  status: 'PENDING' | 'SETTLED' | 'REJECTED' | 'HELD_FRAUD' | 'HELD_AML';
  failureReason?: string;
  createdAt: string;
  settledAt?: string;
}

export interface DoubleEntryRecord {
  id: string;
  transactionId: string;
  entryType: 'DEBIT' | 'CREDIT';
  account: string;
  amount: number;
  currency: CurrencyCode;
  timestamp: string;
}

// ==========================================
// 6. INSURANCE ENGINE
// ==========================================
export type InsuranceCategory = 'HEALTH' | 'MOTOR' | 'CYBER' | 'TERM_LIFE';

export interface InsuranceProduct {
  id: string;
  name: string;
  code: string;
  category: InsuranceCategory;
  baseAnnualPremium: number;
  currency: CurrencyCode;
  maxCoverageLimit: number;
  deductible: number;
  description: string;
  underwritingCriteria: {
    minAge: number;
    maxAge: number;
    kycRequired: boolean;
  };
}

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  userId: string;
  productId: string;
  productName: string;
  category: InsuranceCategory;
  coverageAmount: number;
  annualPremium: number;
  currency: CurrencyCode;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CLAIM_PENDING' | 'CANCELLED';
  createdAt: string;
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyNumber: string;
  userId: string;
  claimAmount: number;
  currency: CurrencyCode;
  incidentDate: string;
  description: string;
  claimFraudScore: number; // 0 - 100
  fraudRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'FILED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';
  adjudicationNotes?: string;
  reviewedBy?: string;
  createdAt: string;
  settledAt?: string;
}

// ==========================================
// 7. PII & SENSITIVE DATA VAULT
// ==========================================
export type PiiDataType =
  | 'AADHAAR'
  | 'PAN'
  | 'PASSPORT'
  | 'DRIVING_LICENSE'
  | 'PHONE_NUMBER'
  | 'EMAIL'
  | 'BANK_ACCOUNT';

export interface PiiVaultRecord {
  id: string;
  userId: string;
  token: string; // Tokenized surrogate e.g. "tok_pan_8f19..."
  dataType: PiiDataType;
  encryptedValue: string; // AES-256-GCM ciphertext
  iv: string;             // Initialization Vector (hex)
  authTag: string;        // GCM authentication tag (hex)
  maskedValue: string;    // e.g. "XXXXXXXX1234" or "ABCDE****F"
  retentionUntil: string;
  isErased: boolean;      // Right-to-be-Forgotten (DPDP Act 2023)
  erasedAt?: string;
  createdAt: string;
}

export interface PiiAuditLog {
  id: string;
  actorUserId: string;
  actorRole: PersonaRole;
  targetUserId: string;
  action: 'ENCRYPT' | 'DECRYPT' | 'MASK' | 'TOKENIZE' | 'ERASE_DPDP';
  dataType: PiiDataType;
  justification: string;
  ipAddress: string;
  timestamp: string;
}

// ==========================================
// 8. APACHE KAFKA BROKER (EMULATED)
// ==========================================
export type KafkaTopic =
  | 'kyc.events'
  | 'aml.alerts'
  | 'fraud.events'
  | 'ledger.settlements'
  | 'insurance.claims'
  | 'pii.audits';

export interface KafkaMessage {
  topic: KafkaTopic;
  partition: number;
  offset: number;
  key: string;
  value: Record<string, any>;
  headers: Record<string, string>;
  timestamp: number;
}

export interface KafkaTopicMetrics {
  topic: KafkaTopic;
  partitionCount: number;
  totalMessages: number;
  consumerLag: number;
  deadLetterCount: number;
}

// ==========================================
// 9. ENTERPRISE WEBHOOKS
// ==========================================
export interface WebhookSubscription {
  id: string;
  userId: string;
  targetUrl: string;
  secret: string; // HMAC-SHA256 signing secret
  subscribedEvents: string[];
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  subscriptionId: string;
  targetUrl: string;
  event: string;
  signature: string; // sha256=...
  payload: Record<string, any>;
  attemptNumber: number;
  httpStatusCode?: number;
  responseBody?: string;
  durationMs: number;
  status: 'DELIVERED' | 'FAILED' | 'RETRY_SCHEDULED';
  timestamp: string;
}
