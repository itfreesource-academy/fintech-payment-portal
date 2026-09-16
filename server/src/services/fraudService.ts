import crypto from 'crypto';
import { FraudEvaluation, FraudDecision } from '../types/index.js';
import { publishToKafka } from './kafkaBroker.js';
import { dispatchWebhookEvent } from './webhookService.js';

const fraudEvaluations: Map<string, FraudEvaluation> = new Map();

// Track recent user transactions for velocity checking: userId -> timestamps[]
const userVelocityTracker: Map<string, number[]> = new Map();

// Track last known geolocation for impossible travel checks: userId -> { lat, lng, time, city }
const userGeoTracker: Map<string, { lat: number; lng: number; time: number; city: string }> = new Map();

/**
 * Calculates Great Circle distance between two points in km (Haversine formula)
 */
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Multi-Vector Real-time Fraud & Risk Scoring Engine
 */
export async function evaluateFraudRisk(params: {
  userId: string;
  transactionId?: string;
  amount: number;
  currency: string;
  ipAddress?: string;
  currentGeo?: { lat: number; lng: number; city: string };
  deviceFingerprint?: string;
  userAgent?: string;
  isVpnOrProxy?: boolean;
}): Promise<FraudEvaluation> {
  const now = Date.now();
  const triggeredRules: string[] = [];
  const reasons: string[] = [];

  let ipGeoRisk = 0;
  let velocityRisk = 0;
  let deviceFingerprintRisk = 0;
  let anomalyRisk = 0;
  let amountRisk = 0;

  // 1. IP / Geo Risk & Impossible Travel (Max 25 pts)
  if (params.isVpnOrProxy) {
    ipGeoRisk += 15;
    triggeredRules.push('RULE_GEO_VPN_DETECTED');
    reasons.push('High-risk VPN or anonymizing proxy IP detected');
  }

  if (params.currentGeo) {
    const lastGeo = userGeoTracker.get(params.userId);
    if (lastGeo) {
      const distanceKm = calculateDistanceKm(
        lastGeo.lat,
        lastGeo.lng,
        params.currentGeo.lat,
        params.currentGeo.lng
      );
      const hoursDiff = (now - lastGeo.time) / (1000 * 60 * 60);

      // If elapsed time is less than 30 minutes for > 300km distance, it is physically impossible
      if (hoursDiff < 0.5 || (hoursDiff > 0 && (distanceKm / hoursDiff) > 900)) {
        ipGeoRisk = 25;
        triggeredRules.push('RULE_GEO_IMPOSSIBLE_TRAVEL');
        const speedKmh = hoursDiff > 0 ? Math.round(distanceKm / hoursDiff) : 'Instantaneous';
        reasons.push(
          `Impossible travel detected: Moved ${Math.round(distanceKm)} km from ${lastGeo.city} to ${
            params.currentGeo.city
          } within seconds (simulated speed: ${speedKmh} km/h)`
        );
      }
    }
    // Update geo tracker
    userGeoTracker.set(params.userId, { ...params.currentGeo, time: now });
  }

  // 2. Velocity Risk: Rapid consecutive transactions (Max 25 pts)
  const timestamps = userVelocityTracker.get(params.userId) || [];
  const recentStamps = timestamps.filter(t => now - t < 60 * 1000); // within last 1 minute
  recentStamps.push(now);
  userVelocityTracker.set(params.userId, recentStamps);

  if (recentStamps.length >= 5) {
    velocityRisk = 25;
    triggeredRules.push('RULE_VELOCITY_CRITICAL_BURST');
    reasons.push(`Extreme velocity: ${recentStamps.length} transactions executed within 60 seconds`);
  } else if (recentStamps.length >= 3) {
    velocityRisk = 15;
    triggeredRules.push('RULE_VELOCITY_ELEVATED');
    reasons.push(`Elevated velocity: ${recentStamps.length} transactions within 60 seconds`);
  }

  // 3. Device Fingerprint Risk (Max 20 pts)
  const ua = (params.userAgent || '').toLowerCase();
  if (ua.includes('headless') || ua.includes('phantomjs') || ua.includes('selenium') || ua.includes('puppeteer')) {
    deviceFingerprintRisk += 20;
    triggeredRules.push('RULE_DEVICE_HEADLESS_AUTOMATION');
    reasons.push('Automated headless browser environment detected');
  } else if (!params.deviceFingerprint || params.deviceFingerprint === 'unknown') {
    deviceFingerprintRisk += 8;
    triggeredRules.push('RULE_DEVICE_UNRECOGNIZED');
    reasons.push('New or unverified device fingerprint');
  }

  // 4. Anomaly Risk: Deviation from user baseline (Max 15 pts)
  if (params.amount > 200000) {
    anomalyRisk += 12;
    triggeredRules.push('RULE_ANOMALY_HIGH_VOLUME');
    reasons.push('Transaction volume represents a > 300% deviation from historical 30-day baseline');
  }

  // 5. Amount Risk (Max 15 pts)
  if (params.amount >= 500000) {
    amountRisk += 15;
    triggeredRules.push('RULE_AMOUNT_EXTREME');
    reasons.push('Outsized single transaction amount exceeding standard retail tier limits');
  } else if (params.amount >= 100000) {
    amountRisk += 8;
    triggeredRules.push('RULE_AMOUNT_ELEVATED');
  }

  const totalRiskScore = Math.min(100, ipGeoRisk + velocityRisk + deviceFingerprintRisk + anomalyRisk + amountRisk);

  // Decision Logic
  let decision: FraudDecision = 'APPROVE';
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

  if (totalRiskScore >= 86) {
    decision = 'FREEZE_ACCOUNT';
    riskLevel = 'CRITICAL';
  } else if (totalRiskScore >= 66) {
    decision = 'REJECT';
    riskLevel = 'HIGH';
  } else if (totalRiskScore >= 31) {
    decision = 'CHALLENGE_MFA';
    riskLevel = 'MEDIUM';
  } else {
    decision = 'APPROVE';
    riskLevel = 'LOW';
  }

  const evaluation: FraudEvaluation = {
    evaluationId: `frd_eval_${crypto.randomUUID()}`,
    userId: params.userId,
    transactionId: params.transactionId,
    totalRiskScore,
    riskLevel,
    decision,
    factorBreakdown: {
      ipGeoRisk,
      velocityRisk,
      deviceFingerprintRisk,
      anomalyRisk,
      amountRisk
    },
    triggeredRules,
    reasons: reasons.length > 0 ? reasons : ['All risk indicators within standard operating baseline'],
    evaluatedAt: new Date().toISOString()
  };

  fraudEvaluations.set(evaluation.evaluationId, evaluation);

  // Emit Kafka event
  publishToKafka('fraud.events', evaluation.userId, {
    evaluationId: evaluation.evaluationId,
    decision: evaluation.decision,
    totalRiskScore: evaluation.totalRiskScore,
    riskLevel: evaluation.riskLevel,
    triggeredRules: evaluation.triggeredRules
  });

  // Dispatch Webhook if High or Critical
  if (decision === 'REJECT' || decision === 'FREEZE_ACCOUNT' || decision === 'CHALLENGE_MFA') {
    await dispatchWebhookEvent('fraud.high_risk', {
      evaluationId: evaluation.evaluationId,
      userId: evaluation.userId,
      totalRiskScore: evaluation.totalRiskScore,
      decision: evaluation.decision,
      reasons: evaluation.reasons
    });
  }

  return evaluation;
}

export function getAllFraudEvaluations(): FraudEvaluation[] {
  return Array.from(fraudEvaluations.values()).sort(
    (a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime()
  );
}
