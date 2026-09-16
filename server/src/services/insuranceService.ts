import crypto from 'crypto';
import { InsuranceProduct, InsurancePolicy, InsuranceClaim, InsuranceCategory, CurrencyCode } from '../types/index.js';
import { publishToKafka } from './kafkaBroker.js';
import { dispatchWebhookEvent } from './webhookService.js';

const products: Map<string, InsuranceProduct> = new Map();
const policies: Map<string, InsurancePolicy> = new Map();
const claims: Map<string, InsuranceClaim> = new Map();

// Seed 4 standard insurance products
const seedProducts: InsuranceProduct[] = [
  {
    id: 'prd_health_01',
    name: 'Health Suraksha Comprehensive',
    code: 'HLTH-SURAKSHA-2026',
    category: 'HEALTH',
    baseAnnualPremium: 12500,
    currency: 'INR',
    maxCoverageLimit: 1000000,
    deductible: 5000,
    description: 'Cashless hospitalization, critical illness cover, and pre/post hospitalization expenses across 10,000+ network hospitals.',
    underwritingCriteria: { minAge: 18, maxAge: 65, kycRequired: true }
  },
  {
    id: 'prd_motor_02',
    name: 'Bharat Motor Protec (Comprehensive)',
    code: 'MTR-PROTEC-2026',
    category: 'MOTOR',
    baseAnnualPremium: 6800,
    currency: 'INR',
    maxCoverageLimit: 750000,
    deductible: 1000,
    description: 'Zero depreciation, roadside assistance, engine protect, and third-party legal liability coverage.',
    underwritingCriteria: { minAge: 18, maxAge: 75, kycRequired: true }
  },
  {
    id: 'prd_cyber_03',
    name: 'Cyber Shield Enterprise & Personal',
    code: 'CYBER-SHIELD-2026',
    category: 'CYBER',
    baseAnnualPremium: 4500,
    currency: 'INR',
    maxCoverageLimit: 500000,
    deductible: 0,
    description: 'Identity theft restitution, cyber extortion, unauthorized digital wallet transactions, and phishing defense protection.',
    underwritingCriteria: { minAge: 18, maxAge: 70, kycRequired: true }
  },
  {
    id: 'prd_term_04',
    name: 'Heritage Pure Term Life Plan',
    code: 'TERM-HERITAGE-2026',
    category: 'TERM_LIFE',
    baseAnnualPremium: 18000,
    currency: 'INR',
    maxCoverageLimit: 10000000,
    deductible: 0,
    description: 'Guaranteed pure life insurance cover with accidental death benefit rider and critical illness lump-sum payout.',
    underwritingCriteria: { minAge: 21, maxAge: 60, kycRequired: true }
  }
];

for (const p of seedProducts) {
  products.set(p.id, p);
}

// Seed initial policy for Vikram Sharma
const seedPolicy: InsurancePolicy = {
  id: 'pol_vikram_01',
  policyNumber: 'POL-2026-HLTH-8831',
  userId: 'usr_retail_01',
  productId: 'prd_health_01',
  productName: 'Health Suraksha Comprehensive',
  category: 'HEALTH',
  coverageAmount: 1000000,
  annualPremium: 12500,
  currency: 'INR',
  startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'ACTIVE',
  createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
};
policies.set(seedPolicy.id, seedPolicy);

/**
 * Calculates actuarial premium quote based on coverage, age, and risk multipliers
 */
export function calculateQuote(
  productId: string,
  userAge: number,
  requestedCoverage: number
): { annualPremium: number; currency: CurrencyCode; product: InsuranceProduct } {
  const product = products.get(productId);
  if (!product) throw new Error('Insurance product not found');

  // Age risk multiplier: higher risk for older policyholders
  let ageMultiplier = 1.0;
  if (userAge > 50) ageMultiplier = 1.6;
  else if (userAge > 35) ageMultiplier = 1.25;

  // Coverage scale multiplier
  const coverageRatio = requestedCoverage / product.maxCoverageLimit;
  const rawPremium = product.baseAnnualPremium * coverageRatio * ageMultiplier;
  const annualPremium = Math.round(Math.max(product.baseAnnualPremium * 0.5, rawPremium));

  return {
    annualPremium,
    currency: product.currency,
    product
  };
}

/**
 * Issue a new insurance policy
 */
export async function issuePolicy(params: {
  userId: string;
  productId: string;
  coverageAmount: number;
  userAge: number;
}): Promise<InsurancePolicy> {
  const quote = calculateQuote(params.productId, params.userAge, params.coverageAmount);
  const polId = `pol_${crypto.randomUUID()}`;
  const policyNumber = `POL-2026-${quote.product.category.slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const now = new Date();
  const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const policy: InsurancePolicy = {
    id: polId,
    policyNumber,
    userId: params.userId,
    productId: params.productId,
    productName: quote.product.name,
    category: quote.product.category,
    coverageAmount: params.coverageAmount,
    annualPremium: quote.annualPremium,
    currency: quote.currency,
    startDate: now.toISOString(),
    endDate: nextYear.toISOString(),
    status: 'ACTIVE',
    createdAt: now.toISOString()
  };

  policies.set(policy.id, policy);

  publishToKafka('insurance.claims', policy.userId, {
    action: 'POLICY_ISSUED',
    policyNumber: policy.policyNumber,
    productName: policy.productName,
    coverageAmount: policy.coverageAmount,
    annualPremium: policy.annualPremium
  });

  return policy;
}

/**
 * File an insurance claim with real-time claims fraud scoring
 */
export async function fileInsuranceClaim(params: {
  policyId: string;
  userId: string;
  claimAmount: number;
  incidentDate: string;
  description: string;
}): Promise<InsuranceClaim> {
  const policy = policies.get(params.policyId);
  if (!policy) throw new Error('Policy not found');
  if (policy.status !== 'ACTIVE') throw new Error(`Policy is currently ${policy.status}`);
  if (params.claimAmount > policy.coverageAmount) {
    throw new Error(`Claim amount exceeds maximum policy coverage limit of ₹${policy.coverageAmount.toLocaleString()}`);
  }

  // Real-time Claims Fraud Scoring (0 - 100)
  let claimFraudScore = 15; // baseline

  // 1. Ratio of claim to coverage limit
  const claimRatio = params.claimAmount / policy.coverageAmount;
  if (claimRatio > 0.8) claimFraudScore += 30; // Maxing out policy limit immediately
  else if (claimRatio > 0.5) claimFraudScore += 15;

  // 2. Early inception claim (claimed within 30 days of policy creation)
  const policyAgeDays = (Date.now() - new Date(policy.startDate).getTime()) / (1000 * 60 * 60 * 24);
  if (policyAgeDays < 30) {
    claimFraudScore += 35; // Red flag for pre-existing condition or intentional staged loss
  }

  // 3. User's prior claim velocity
  const priorClaims = Array.from(claims.values()).filter(c => c.userId === params.userId);
  if (priorClaims.length >= 2) {
    claimFraudScore += 20;
  }

  claimFraudScore = Math.min(100, claimFraudScore);

  let fraudRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (claimFraudScore >= 70) fraudRiskLevel = 'HIGH';
  else if (claimFraudScore >= 40) fraudRiskLevel = 'MEDIUM';

  const claim: InsuranceClaim = {
    id: `clm_${crypto.randomUUID()}`,
    claimNumber: `CLM-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    policyId: policy.id,
    policyNumber: policy.policyNumber,
    userId: params.userId,
    claimAmount: params.claimAmount,
    currency: policy.currency,
    incidentDate: params.incidentDate,
    description: params.description,
    claimFraudScore,
    fraudRiskLevel,
    status: 'FILED',
    createdAt: new Date().toISOString()
  };

  claims.set(claim.id, claim);

  publishToKafka('insurance.claims', claim.userId, {
    action: 'CLAIM_FILED',
    claimNumber: claim.claimNumber,
    policyNumber: claim.policyNumber,
    claimAmount: claim.claimAmount,
    claimFraudScore: claim.claimFraudScore,
    fraudRiskLevel: claim.fraudRiskLevel
  });

  await dispatchWebhookEvent('insurance.claim_filed', {
    claimNumber: claim.claimNumber,
    policyNumber: claim.policyNumber,
    claimAmount: claim.claimAmount,
    currency: claim.currency,
    fraudRiskLevel: claim.fraudRiskLevel
  });

  return claim;
}

export function getAllProducts(): InsuranceProduct[] {
  return Array.from(products.values());
}

export function getPoliciesByUserId(userId: string): InsurancePolicy[] {
  return Array.from(policies.values()).filter(p => p.userId === userId);
}

export function getAllPolicies(): InsurancePolicy[] {
  return Array.from(policies.values());
}

export function getAllClaims(): InsuranceClaim[] {
  return Array.from(claims.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function adjudicateClaim(
  claimId: string,
  status: 'APPROVED' | 'REJECTED' | 'PAID',
  adjudicationNotes: string,
  reviewer: string
): InsuranceClaim {
  const claim = claims.get(claimId);
  if (!claim) throw new Error('Claim not found');

  claim.status = status;
  claim.adjudicationNotes = adjudicationNotes;
  claim.reviewedBy = reviewer;
  if (status === 'PAID') {
    claim.settledAt = new Date().toISOString();
  }

  publishToKafka('insurance.claims', claim.userId, {
    action: 'CLAIM_ADJUDICATED',
    claimNumber: claim.claimNumber,
    newStatus: status,
    reviewer,
    notes: adjudicationNotes
  });

  return claim;
}
