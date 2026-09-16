import crypto from 'crypto';
import { AmlAlert, AmlJurisdiction, AmlRuleCode, SanctionEntity, CurrencyCode } from '../types/index.js';
import { publishToKafka } from './kafkaBroker.js';
import { dispatchWebhookEvent } from './webhookService.js';

const amlAlerts: Map<string, AmlAlert> = new Map();

// Global Watchlist & Sanctions List (UN Security Council, Interpol Red Notices, EU Consolidated List, RBI Debarred)
export const SANCTION_WATCHLIST: SanctionEntity[] = [
  {
    id: 'sanc_un_001',
    name: 'Vladimir Voronov',
    aliases: ['V. Voronov', 'Vlad Voronov'],
    entityType: 'INDIVIDUAL',
    sourceList: 'UN_SECURITY_COUNCIL',
    designationDate: '2022-03-15',
    country: 'RU',
    matchScore: 100,
    isPep: true
  },
  {
    id: 'sanc_un_002',
    name: 'Apex Syndicate Holdings Ltd',
    aliases: ['Apex Global Trade', 'Apex Commodities'],
    entityType: 'ORGANIZATION',
    sourceList: 'EU_CONSOLIDATED',
    designationDate: '2023-01-10',
    country: 'CY',
    matchScore: 100,
    isPep: false
  },
  {
    id: 'sanc_rbi_003',
    name: 'Kailash Offshore Equities',
    aliases: ['KOE Capital', 'Kailash FinServ'],
    entityType: 'ORGANIZATION',
    sourceList: 'RBI_DEBARRED',
    designationDate: '2021-11-04',
    country: 'IN',
    matchScore: 100,
    isPep: false
  }
];

// Seed an initial FIU-IND Rule 114B alert for training showcase
const seedAlert: AmlAlert = {
  id: 'aml_alt_114b_01',
  userId: 'usr_retail_01',
  userName: 'Vikram Sharma',
  transactionId: 'txn_cash_55000_sample',
  jurisdiction: 'FIU-IND',
  ruleCode: 'IND_RULE_114B',
  ruleName: 'FIU-IND Rule 114B ₹50,000 Cash PAN Mandate Violation',
  legalCitation: 'Income-tax Rules, 1962 (Rule 114B) & Prevention of Money-laundering (PMLA) Act 2002',
  severity: 'HIGH',
  amount: 65000,
  currency: 'INR',
  details: 'Cash deposit exceeding ₹50,000 threshold initiated without verified PAN seeding. Transaction auto-held.',
  status: 'OPEN',
  flaggedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
};
amlAlerts.set(seedAlert.id, seedAlert);

/**
 * Generates UNODC goAML compliant XML string for CBUAE / UAE FIU filing
 */
export function generateGoAmlXml(alert: {
  reportId: string;
  reportingEntity: string;
  transactionId: string;
  amount: number;
  currency: string;
  customerName: string;
  reason: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<report xmlns="http://www.unodc.org/goAML" report_code="CTR" reporting_entity="${alert.reportingEntity}">
  <rentity_id>CBUAE_RE_89201</rentity_id>
  <submission_code>EOD_AUTOMATED</submission_code>
  <report_indicators>
    <indicator>HIGH_CASH_TRANSACTION_AED_55K</indicator>
  </report_indicators>
  <transaction id="${alert.transactionId}">
    <transaction_number>${alert.transactionId}</transaction_number>
    <transaction_location>Dubai International Financial Centre (DIFC)</transaction_location>
    <date_transaction>${new Date().toISOString()}</date_transaction>
    <amount_local>${alert.amount.toFixed(2)}</amount_local>
    <currency_code>${alert.currency}</currency_code>
    <description>${alert.reason}</description>
    <t_from>
      <from_funds_code>CASH</from_funds_code>
      <from_person>
        <first_name>${alert.customerName.split(' ')[0] || 'Unknown'}</first_name>
        <last_name>${alert.customerName.split(' ').slice(1).join(' ') || 'Customer'}</last_name>
        <residence>AE</residence>
      </from_person>
    </t_from>
    <t_to>
      <to_funds_code>ACCOUNT</to_funds_code>
      <to_account>AE030330000000123456789</to_account>
    </t_to>
  </transaction>
</report>`;
}

/**
 * Screens a proposed transaction against Non-US Statutory AML Rules:
 * - India: Rule 114B (₹50k PAN), Rule 3 CTR (₹10L), CBWTR (₹5L), Structuring (₹49k - ₹49.9k)
 * - UAE: High Cash AED 55,000 threshold with goAML XML schema
 * - Australia: AUSTRAC AUD 10,000 TTR
 * - Global: PEP & Sanction Watchlist Screening
 */
export async function screenTransactionForAml(params: {
  userId: string;
  userName: string;
  transactionId: string;
  amount: number;
  currency: CurrencyCode;
  channel: 'CASH' | 'WIRE' | 'UPI' | 'INTERNAL';
  hasVerifiedPan: boolean;
  panNumber?: string;
  isCrossBorder?: boolean;
}): Promise<{ passed: boolean; blocked: boolean; alerts: AmlAlert[] }> {
  const triggeredAlerts: AmlAlert[] = [];
  let shouldBlock = false;

  // 1. 🇮🇳 INDIA FIU-IND: Rule 114B ₹50,000 Cash PAN Mandate
  if (params.currency === 'INR' && params.channel === 'CASH' && params.amount > 50000) {
    if (!params.hasVerifiedPan && !params.panNumber) {
      shouldBlock = true;
      const alert: AmlAlert = {
        id: `aml_${crypto.randomUUID()}`,
        userId: params.userId,
        userName: params.userName,
        transactionId: params.transactionId,
        jurisdiction: 'FIU-IND',
        ruleCode: 'IND_RULE_114B',
        ruleName: 'FIU-IND Rule 114B ₹50,000 Cash PAN Mandate Violation',
        legalCitation: 'Income-tax Rules, 1962 (Rule 114B) & RBI Master Direction - KYC',
        severity: 'HIGH',
        amount: params.amount,
        currency: params.currency,
        details: `Cash transaction of ₹${params.amount.toLocaleString()} exceeds statutory threshold of ₹50,000 without verified PAN. Mandatory block enforced.`,
        status: 'OPEN',
        flaggedAt: new Date().toISOString()
      };
      triggeredAlerts.push(alert);
    }
  }

  // 2. 🇮🇳 INDIA FIU-IND: Structuring / Smurfing Alert (Deposits intentionally between ₹49,000 and ₹49,999)
  if (params.currency === 'INR' && params.channel === 'CASH' && params.amount >= 49000 && params.amount <= 49999) {
    const alert: AmlAlert = {
      id: `aml_${crypto.randomUUID()}`,
      userId: params.userId,
      userName: params.userName,
      transactionId: params.transactionId,
      jurisdiction: 'FIU-IND',
      ruleCode: 'IND_STRUCTURING',
      ruleName: 'FIU-IND Sub-Threshold Structuring / Smurfing Alert',
      legalCitation: 'PMLA 2002 Sec. 12 & FIU-IND Red Flag Indicator RFI-04',
      severity: 'CRITICAL',
      amount: params.amount,
      currency: params.currency,
      details: `Suspicious structuring detected: Amount ₹${params.amount.toLocaleString()} placed just below the ₹50,000 Rule 114B PAN reporting threshold.`,
      status: 'OPEN',
      flaggedAt: new Date().toISOString()
    };
    triggeredAlerts.push(alert);
  }

  // 3. 🇮🇳 INDIA FIU-IND: Rule 3 Cash Transaction Report (CTR) > ₹10 Lakhs
  if (params.currency === 'INR' && params.amount >= 1000000) {
    const alert: AmlAlert = {
      id: `aml_${crypto.randomUUID()}`,
      userId: params.userId,
      userName: params.userName,
      transactionId: params.transactionId,
      jurisdiction: 'FIU-IND',
      ruleCode: 'IND_RULE_3_CTR',
      ruleName: 'FIU-IND Rule 3 Cash Transaction Report (CTR) Threshold',
      legalCitation: 'PMLA (Maintenance of Records) Rules 2005 - Rule 3(1)(A)',
      severity: 'HIGH',
      amount: params.amount,
      currency: params.currency,
      details: `Single cash transaction of ₹${params.amount.toLocaleString()} meets or exceeds the statutory ₹10,000,000 CTR filing mandate.`,
      status: 'OPEN',
      flaggedAt: new Date().toISOString()
    };
    triggeredAlerts.push(alert);
  }

  // 4. 🇮🇳 INDIA FIU-IND: Cross-Border Wire Transfer Report (CBWTR) > ₹5 Lakhs
  if (params.currency === 'INR' && params.isCrossBorder && params.amount >= 500000) {
    const alert: AmlAlert = {
      id: `aml_${crypto.randomUUID()}`,
      userId: params.userId,
      userName: params.userName,
      transactionId: params.transactionId,
      jurisdiction: 'FIU-IND',
      ruleCode: 'IND_RULE_3_CBWTR',
      ruleName: 'FIU-IND Rule 3 Cross-Border Wire Transfer Report (CBWTR)',
      legalCitation: 'PMLA Rules 2005 - Rule 3(1)(BA) Cross-Border Wire Reporting',
      severity: 'MEDIUM',
      amount: params.amount,
      currency: params.currency,
      details: `Cross-border wire of ₹${params.amount.toLocaleString()} exceeds statutory threshold of ₹500,000.`,
      status: 'OPEN',
      flaggedAt: new Date().toISOString()
    };
    triggeredAlerts.push(alert);
  }

  // 5. 🇦🇪 UAE CBUAE: High Cash Transaction > AED 55,000 with goAML XML Export
  if (params.currency === 'AED' && params.amount >= 55000) {
    const alertId = `aml_${crypto.randomUUID()}`;
    const xmlPayload = generateGoAmlXml({
      reportId: alertId,
      reportingEntity: 'ITFREESOURCE_ACADEMY_BANK_UAE',
      transactionId: params.transactionId,
      amount: params.amount,
      currency: 'AED',
      customerName: params.userName,
      reason: 'CBUAE Statutory Threshold: Cash transaction >= AED 55,000'
    });

    const alert: AmlAlert = {
      id: alertId,
      userId: params.userId,
      userName: params.userName,
      transactionId: params.transactionId,
      jurisdiction: 'CBUAE',
      ruleCode: 'UAE_AED_55K_CASH',
      ruleName: 'CBUAE High Cash Transaction Mandate (AED 55,000+)',
      legalCitation: 'CBUAE Notice No. 74/2019 & Federal Decree-Law No. (20) of 2018 (Anti-Money Laundering)',
      severity: 'HIGH',
      amount: params.amount,
      currency: 'AED',
      details: `Cash transaction of AED ${params.amount.toLocaleString()} exceeds statutory threshold of AED 55,000. UNODC goAML XML payload generated.`,
      goAmlXmlPayload: xmlPayload,
      status: 'OPEN',
      flaggedAt: new Date().toISOString()
    };
    triggeredAlerts.push(alert);
  }

  // 6. 🇦🇺 AUSTRALIA AUSTRAC: Threshold Transaction Report (TTR) >= AUD 10,000
  if (params.currency === 'AUD' && params.amount >= 10000) {
    const alert: AmlAlert = {
      id: `aml_${crypto.randomUUID()}`,
      userId: params.userId,
      userName: params.userName,
      transactionId: params.transactionId,
      jurisdiction: 'AUSTRAC',
      ruleCode: 'AUS_AUD_10K_TTR',
      ruleName: 'AUSTRAC Threshold Transaction Report (TTR AUD 10,000+)',
      legalCitation: 'Anti-Money Laundering and Counter-Terrorism Financing Act 2006 (AML/CTF Act) Section 43',
      severity: 'MEDIUM',
      amount: params.amount,
      currency: 'AUD',
      details: `Threshold transaction of AUD ${params.amount.toLocaleString()} meets or exceeds statutory AUD 10,000 threshold for AUSTRAC reporting.`,
      status: 'OPEN',
      flaggedAt: new Date().toISOString()
    };
    triggeredAlerts.push(alert);
  }

  // Store alerts, publish to Kafka, and dispatch webhooks
  for (const a of triggeredAlerts) {
    amlAlerts.set(a.id, a);

    publishToKafka('aml.alerts', a.userId, {
      alertId: a.id,
      jurisdiction: a.jurisdiction,
      ruleCode: a.ruleCode,
      amount: a.amount,
      currency: a.currency,
      severity: a.severity
    });

    await dispatchWebhookEvent('aml.alert_generated', {
      alertId: a.id,
      ruleCode: a.ruleCode,
      jurisdiction: a.jurisdiction,
      amount: a.amount,
      currency: a.currency,
      severity: a.severity,
      userName: a.userName
    });
  }

  return {
    passed: triggeredAlerts.length === 0,
    blocked: shouldBlock,
    alerts: triggeredAlerts
  };
}

/**
 * Screens a name against UN, Interpol, EU, and RBI Watchlists
 */
export function screenNameForSanctions(nameToScreen: string): {
  isMatch: boolean;
  matchedEntity?: SanctionEntity;
  confidenceScore: number;
} {
  const query = nameToScreen.toLowerCase().trim();

  for (const entity of SANCTION_WATCHLIST) {
    if (entity.name.toLowerCase() === query) {
      return { isMatch: true, matchedEntity: entity, confidenceScore: 100 };
    }

    for (const alias of entity.aliases) {
      if (alias.toLowerCase() === query) {
        return { isMatch: true, matchedEntity: entity, confidenceScore: 95 };
      }
    }

    // Substring fuzzy match
    if (query.includes(entity.name.toLowerCase()) || entity.name.toLowerCase().includes(query)) {
      return { isMatch: true, matchedEntity: entity, confidenceScore: 85 };
    }
  }

  return { isMatch: false, confidenceScore: 0 };
}

export function getAllAmlAlerts(jurisdiction?: AmlJurisdiction): AmlAlert[] {
  const alerts = Array.from(amlAlerts.values());
  if (jurisdiction) {
    return alerts.filter(a => a.jurisdiction === jurisdiction);
  }
  return alerts.sort((a, b) => new Date(b.flaggedAt).getTime() - new Date(a.flaggedAt).getTime());
}

export function resolveAmlAlert(
  alertId: string,
  newStatus: 'UNDER_INVESTIGATION' | 'FILED_WITH_REGULATOR' | 'FALSE_POSITIVE' | 'CLOSED',
  reviewer: string,
  notes: string
): AmlAlert {
  const alert = amlAlerts.get(alertId);
  if (!alert) throw new Error('AML Alert not found');

  alert.status = newStatus;
  alert.reviewedBy = reviewer;
  alert.resolutionNotes = notes;

  publishToKafka('aml.alerts', alert.userId, {
    action: 'AML_ALERT_RESOLVED',
    alertId: alert.id,
    newStatus,
    reviewer,
    notes
  });

  return alert;
}
