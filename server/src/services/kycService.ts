import crypto from 'crypto';
import { KycRecord, KycStatus, DocumentIdType } from '../types/index.js';
import { publishToKafka } from './kafkaBroker.js';
import { dispatchWebhookEvent } from './webhookService.js';
import { encryptPii } from './piiVaultService.js';

const kycRecords: Map<string, KycRecord> = new Map();

// Seed initial KYC record for Vikram Sharma (Retail Customer)
const seedKyc: KycRecord = {
  id: 'kyc_vikram_01',
  userId: 'usr_retail_01',
  fullName: 'Vikram Sharma',
  dob: '1992-06-18',
  gender: 'M',
  address: 'Flat 402, Skyline Residency, Bandra West, Mumbai, Maharashtra, 400050',
  idType: 'AADHAAR',
  idNumberMasked: 'XXXX-XXXX-9821',
  documentHash: crypto.createHash('sha256').update('AADHAAR_VIKRAM_9821').digest('hex'),
  selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  livenessScore: 98.4,
  faceMatchScore: 96.7,
  vkycStatus: 'COMPLETED',
  vkycAgentId: 'agent_sarah_09',
  geoCoordinates: {
    lat: 19.0596,
    lng: 72.8295,
    city: 'Mumbai',
    country: 'India'
  },
  status: 'APPROVED',
  verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString()
};
kycRecords.set(seedKyc.id, seedKyc);

/**
 * Submit a new KYC verification package
 */
export async function submitKycApplication(data: {
  userId: string;
  fullName: string;
  dob: string;
  gender: 'M' | 'F' | 'OTHER';
  address: string;
  idType: DocumentIdType;
  rawIdNumber: string;
  selfieProvided: boolean;
  geoCoordinates?: { lat: number; lng: number; city: string; country: string };
  triggerFailure?: boolean;
}): Promise<KycRecord> {
  const documentHash = crypto.createHash('sha256').update(data.rawIdNumber).digest('hex');

  // Vault raw sensitive ID immediately into PII Vault
  const piiTypeMap: Record<DocumentIdType, any> = {
    AADHAAR: 'AADHAAR',
    PAN: 'PAN',
    PASSPORT: 'PASSPORT',
    DRIVING_LICENSE: 'DRIVING_LICENSE'
  };
  const vaultRecord = encryptPii(
    data.userId,
    piiTypeMap[data.idType],
    data.rawIdNumber,
    data.userId,
    'retail_customer'
  );

  // Biometric Liveness & Facial Matching
  const livenessScore = data.triggerFailure ? 42.1 : Number((90 + Math.random() * 9).toFixed(1));
  const faceMatchScore = data.triggerFailure ? 38.5 : Number((88 + Math.random() * 11).toFixed(1));

  let status: KycStatus = 'VERIFYING';
  let rejectionReason: string | undefined;

  if (livenessScore < 60 || faceMatchScore < 70) {
    status = 'REJECTED';
    rejectionReason = 'Biometric mismatch: Facial liveness or photo match score fell below compliance threshold';
  } else {
    status = 'APPROVED';
  }

  const kyc: KycRecord = {
    id: `kyc_${crypto.randomUUID()}`,
    userId: data.userId,
    fullName: data.fullName,
    dob: data.dob,
    gender: data.gender,
    address: data.address,
    idType: data.idType,
    idNumberMasked: vaultRecord.maskedValue,
    documentHash,
    selfieUrl: data.selfieProvided ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' : undefined,
    livenessScore,
    faceMatchScore,
    vkycStatus: status === 'APPROVED' ? 'COMPLETED' : 'NOT_STARTED',
    geoCoordinates: data.geoCoordinates || {
      lat: 19.0760,
      lng: 72.8777,
      city: 'Mumbai',
      country: 'India'
    },
    status,
    rejectionReason,
    verifiedAt: status === 'APPROVED' ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString()
  };

  kycRecords.set(kyc.id, kyc);

  // Emit Kafka event
  publishToKafka('kyc.events', kyc.userId, {
    eventId: `evt_kyc_${kyc.id}`,
    kycId: kyc.id,
    userId: kyc.userId,
    status: kyc.status,
    idType: kyc.idType,
    livenessScore: kyc.livenessScore,
    faceMatchScore: kyc.faceMatchScore
  });

  // Dispatch Webhook
  await dispatchWebhookEvent(`kyc.${kyc.status.toLowerCase()}`, {
    kycId: kyc.id,
    userId: kyc.userId,
    fullName: kyc.fullName,
    idType: kyc.idType,
    maskedId: kyc.idNumberMasked,
    status: kyc.status
  });

  return kyc;
}

export function getKycByUserId(userId: string): KycRecord | undefined {
  return Array.from(kycRecords.values()).find(k => k.userId === userId);
}

export function getAllKycRecords(): KycRecord[] {
  return Array.from(kycRecords.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateKycStatus(
  kycId: string,
  status: KycStatus,
  reviewerNotes?: string
): KycRecord {
  const kyc = kycRecords.get(kycId);
  if (!kyc) throw new Error('KYC record not found');

  kyc.status = status;
  if (status === 'APPROVED') {
    kyc.verifiedAt = new Date().toISOString();
  }
  if (reviewerNotes) {
    kyc.rejectionReason = reviewerNotes;
  }

  publishToKafka('kyc.events', kyc.userId, {
    action: 'KYC_MANUAL_REVIEW',
    kycId: kyc.id,
    newStatus: status,
    notes: reviewerNotes
  });

  return kyc;
}
