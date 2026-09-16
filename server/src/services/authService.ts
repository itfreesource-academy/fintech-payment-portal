import jwt from 'jsonwebtoken';
import { PersonaProfile, PersonaRole, User } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'itfreesource-fintech-jwt-secret-key-2026!';

export const PERSONA_PROFILES: Record<PersonaRole, PersonaProfile> = {
  compliance_officer: {
    role: 'compliance_officer',
    username: 'compliance.maya',
    email: 'maya.lin@itfreesource-academy.org',
    fullName: 'Maya Lin',
    title: 'Chief Compliance Officer',
    department: 'Regulatory Compliance & AML (FIU-IND / CBUAE)',
    jurisdictionFocus: 'India (PMLA/FIU-IND) & UAE (CBUAE goAML)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
    clearanceLevel: 'TIER_1',
    description: 'Statutory compliance supervisor. Authorized to review FIU-IND Rule 114B violations, generate goAML XML reports, and audit KYC files.',
    defaultPermissions: ['kyc:read', 'kyc:write', 'aml:read', 'aml:resolve', 'pii:decrypt', 'audit:read']
  },
  risk_analyst: {
    role: 'risk_analyst',
    username: 'risk.david',
    email: 'david.vance@itfreesource-academy.org',
    fullName: 'David Vance',
    title: 'Senior Risk & Anomaly Analyst',
    department: 'Quantitative Risk & Modeling',
    jurisdictionFocus: 'Global & Cross-Border',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    clearanceLevel: 'TIER_2',
    description: 'Monitors multi-vector fraud scores, impossible travel anomalies, velocity spikes, and high-risk payment patterns.',
    defaultPermissions: ['fraud:read', 'fraud:write', 'ledger:read', 'kafka:inspect']
  },
  underwriter: {
    role: 'underwriter',
    username: 'underwriter.sarah',
    email: 'sarah.chen@itfreesource-academy.org',
    fullName: 'Sarah Chen',
    title: 'Principal Insurance Underwriter',
    department: 'Actuarial & Insurance Underwriting',
    jurisdictionFocus: 'Domestic & Commercial Insurance',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80',
    clearanceLevel: 'TIER_2',
    description: 'Underwrites insurance policies, sets actuarial quote parameters, and reviews insurance claims for potential claim fraud.',
    defaultPermissions: ['insurance:read', 'insurance:write', 'insurance:adjudicate']
  },
  fraud_investigator: {
    role: 'fraud_investigator',
    username: 'fraud.alex',
    email: 'alex.morgan@itfreesource-academy.org',
    fullName: 'Alex Morgan',
    title: 'Lead Fraud Investigator',
    department: 'Financial Crime & Fraud Prevention',
    jurisdictionFocus: 'Real-time Payment Interception',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80',
    clearanceLevel: 'TIER_1',
    description: 'Authorized to freeze compromised wallets, analyze headless automation vectors, and blacklist suspicious device fingerprints.',
    defaultPermissions: ['fraud:read', 'fraud:freeze', 'ledger:freeze', 'pii:decrypt']
  },
  retail_customer: {
    role: 'retail_customer',
    username: 'customer.vikram',
    email: 'vikram.sharma@example.com',
    fullName: 'Vikram Sharma',
    title: 'Retail Banking & Insurance Customer',
    department: 'Personal Banking',
    jurisdictionFocus: 'India (INR)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    clearanceLevel: 'TIER_3',
    description: 'Standard verified retail customer. Holds INR & USD wallets, e-Aadhaar & PAN seeded, active Health Insurance policy.',
    defaultPermissions: ['wallet:transact', 'kyc:submit', 'insurance:buy', 'claim:file']
  },
  hni_customer: {
    role: 'hni_customer',
    username: 'hni.julian',
    email: 'julian.sterling@sterling-holdings.ae',
    fullName: 'Julian Sterling',
    title: 'High Net Worth Individual (HNI)',
    department: 'Private Wealth & Corporate Treasury',
    jurisdictionFocus: 'UAE (AED) & Global Cross-Border',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    clearanceLevel: 'EXECUTIVE',
    description: 'High net worth client with high-limit AED & INR wallets. Perfect for testing CBUAE AED 55,000+ goAML reporting thresholds.',
    defaultPermissions: ['wallet:transact', 'wallet:large_transfer', 'insurance:buy']
  },
  pep_sanctioned_user: {
    role: 'pep_sanctioned_user',
    username: 'pep.vladimir',
    email: 'vladimir.voronov@kremlin-export.ru',
    fullName: 'Vladimir Voronov',
    title: 'Designated Person (UN Watchlist / PEP)',
    department: 'Foreign Affairs & Energy Export',
    jurisdictionFocus: 'International Sanctions Watchlist',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    clearanceLevel: 'TIER_3',
    description: 'Simulated Politically Exposed Person (PEP) on the UN Security Council Sanctions list. Demonstrates automated sanctions interception.',
    defaultPermissions: ['wallet:view']
  },
  auditor: {
    role: 'auditor',
    username: 'auditor.victoria',
    email: 'victoria.taylor@audit-board.org',
    fullName: 'Victoria Taylor',
    title: 'Statutory Regulatory Auditor',
    department: 'Independent Supervisory Audit',
    jurisdictionFocus: 'FIU-IND, CBUAE, AUSTRAC & DPDP Compliance',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    clearanceLevel: 'TIER_1',
    description: 'Read-only auditor with comprehensive visibility across PII Vault logs, Kafka event lag, and double-entry accounting reconciliation.',
    defaultPermissions: ['audit:read', 'pii:audit', 'ledger:read', 'kafka:inspect']
  }
};

const usersStore: Map<string, User> = new Map();

// Initialize users for all 8 personas
const roleUserIds: Record<PersonaRole, string> = {
  compliance_officer: 'usr_compliance_01',
  risk_analyst: 'usr_risk_01',
  underwriter: 'usr_underwriter_01',
  fraud_investigator: 'usr_fraud_01',
  retail_customer: 'usr_retail_01',
  hni_customer: 'usr_hni_01',
  pep_sanctioned_user: 'usr_pep_01',
  auditor: 'usr_auditor_01'
};

for (const [role, profile] of Object.entries(PERSONA_PROFILES)) {
  const userId = roleUserIds[role as PersonaRole];
  usersStore.set(userId, {
    id: userId,
    username: profile.username,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
    department: profile.department,
    status: 'ACTIVE',
    mfaEnabled: true,
    mfaSecret: 'JBSWY3DPEHPK3PXP',
    panNumberMasked: role === 'retail_customer' ? 'ABCPS****F' : undefined,
    aadhaarNumberMasked: role === 'retail_customer' ? 'XXXX-XXXX-9821' : undefined,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  });
}

/**
 * Generates signed JWT for a given persona / user
 */
export function generateToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Authenticates user by username or email (with standard sandbox password 'Password123!')
 */
export function authenticate(
  identifier: string,
  password: string = 'Password123!'
): { user: User; token: string; profile: PersonaProfile } {
  const user = Array.from(usersStore.values()).find(
    u => u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase()
  );

  if (!user) {
    throw new Error(`User identifier '${identifier}' not found`);
  }

  // Any password ending with 123! or matching 'Password123!' is valid for sandbox quick login
  if (password !== 'Password123!' && !password.includes('123')) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user);
  const profile = PERSONA_PROFILES[user.role];
  user.lastLoginAt = new Date().toISOString();

  return { user, token, profile };
}

export function getUserById(id: string): User | undefined {
  return usersStore.get(id);
}

export function getAllUsers(): User[] {
  return Array.from(usersStore.values());
}
