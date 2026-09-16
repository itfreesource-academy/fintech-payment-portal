import crypto from 'crypto';
import { DigiLockerConsent, DigiLockerIssuedDoc, DocumentIdType } from '../types/index.js';

const consents: Map<string, DigiLockerConsent> = new Map();

/**
 * Initiates an OAuth2 Consent Request with DigiLocker Gateway
 */
export function initiateDigiLockerConsent(
  userId: string,
  scope: ('AADHAAR' | 'PAN' | 'DRIVING_LICENSE')[] = ['AADHAAR', 'PAN']
): DigiLockerConsent {
  const consent: DigiLockerConsent = {
    consentId: `dgl_cst_${crypto.randomUUID()}`,
    userId,
    orgId: 'ORG_ITFREESOURCE_ACADEMY_FINTECH',
    purpose: 'Digital Identity & Address Verification under PMLA KYC Master Direction',
    scope,
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15-minute consent validity
  };

  consents.set(consent.consentId, consent);
  return consent;
}

/**
 * Authorizes the DigiLocker Consent (simulates user authenticating with DigiLocker credentials)
 */
export function authorizeConsent(consentId: string): DigiLockerConsent {
  const consent = consents.get(consentId);
  if (!consent) {
    throw new Error('DigiLocker Consent ID not found');
  }

  consent.status = 'CONSENTED';
  consent.consentedAt = new Date().toISOString();
  return consent;
}

/**
 * Issues Authentic Government Schema Documents from DigiLocker Sandbox
 */
export function fetchIssuedDocuments(consentId: string, userName: string = 'Vikram Sharma'): DigiLockerIssuedDoc[] {
  const consent = consents.get(consentId);
  if (!consent) {
    throw new Error('Consent record not found');
  }
  if (consent.status !== 'CONSENTED') {
    throw new Error('DigiLocker Consent has not been authorized by user');
  }

  const docs: DigiLockerIssuedDoc[] = [];

  if (consent.scope.includes('AADHAAR')) {
    docs.push({
      docType: 'AADHAAR',
      docId: 'uidai_eaadhaar_9821',
      uri: 'in.gov.uidai-eaadhaar-982103492817',
      issueDate: '2023-01-15T10:30:00Z',
      issuer: 'Unique Identification Authority of India (UIDAI)',
      digitalSignature: crypto.createHash('sha256').update(`UIDAI_${userName}_9821`).digest('hex'),
      payload: {
        fullName: userName,
        dob: '1992-06-18',
        gender: 'M',
        address: 'Flat 402, Skyline Residency, Bandra West, Mumbai, Maharashtra, 400050',
        maskedDocNumber: 'XXXX-XXXX-9821',
        metadata: {
          careOf: 'C/O Rajesh Sharma',
          generationDate: new Date().toISOString(),
          pincode: '400050',
          state: 'Maharashtra',
          district: 'Mumbai Suburban'
        }
      }
    });
  }

  if (consent.scope.includes('PAN')) {
    docs.push({
      docType: 'PAN',
      docId: 'itd_pan_8921f',
      uri: 'in.gov.incometax-pan-ABCPS8921F',
      issueDate: '2021-08-20T14:15:00Z',
      issuer: 'Income Tax Department, Government of India (ITD)',
      digitalSignature: crypto.createHash('sha256').update(`ITD_${userName}_ABCPS8921F`).digest('hex'),
      payload: {
        fullName: userName,
        dob: '1992-06-18',
        gender: 'M',
        address: 'Bandra West, Mumbai, Maharashtra 400050',
        maskedDocNumber: 'ABCPS****F',
        metadata: {
          panType: 'INDIVIDUAL',
          fatherName: 'Rajesh Sharma',
          panVerificationStatus: 'VERIFIED_ACTIVE',
          aadhaarSeedingStatus: 'LINKED'
        }
      }
    });
  }

  if (consent.scope.includes('DRIVING_LICENSE')) {
    docs.push({
      docType: 'DRIVING_LICENSE',
      docId: 'morth_dl_MH0220150041289',
      uri: 'in.gov.morth-dl-MH0220150041289',
      issueDate: '2015-04-10T11:00:00Z',
      issuer: 'Ministry of Road Transport and Highways (MoRTH)',
      digitalSignature: crypto.createHash('sha256').update(`MORTH_${userName}_DL`).digest('hex'),
      payload: {
        fullName: userName,
        dob: '1992-06-18',
        gender: 'M',
        address: 'Mumbai, Maharashtra 400050',
        maskedDocNumber: 'MH02********289',
        metadata: {
          vehicleClasses: ['MCWG', 'LMV'],
          validUntil: '2035-04-09',
          rtoCode: 'MH-02 (Mumbai West)'
        }
      }
    });
  }

  return docs;
}
