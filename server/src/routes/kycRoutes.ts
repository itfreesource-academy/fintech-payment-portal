import { Router, Request, Response } from 'express';
import { submitKycApplication, getAllKycRecords, getKycByUserId, updateKycStatus } from '../services/kycService.js';
import { DocumentIdType, KycStatus } from '../types/index.js';

const router = Router();

/**
 * @openapi
 * /api/v1/kyc/apply:
 *   post:
 *     summary: Submit a new KYC verification request
 *     tags: [KYC & Identity]
 */
router.post('/apply', async (req: Request, res: Response) => {
  try {
    const {
      userId = 'usr_retail_01',
      fullName,
      dob = '1995-04-12',
      gender = 'M',
      address = 'Flat 101, Bandra, Mumbai',
      idType = 'AADHAAR',
      rawIdNumber,
      selfieProvided = true,
      geoCoordinates,
      triggerFailure = false
    } = req.body;

    if (!fullName || !rawIdNumber) {
      return res.status(400).json({ error: 'fullName and rawIdNumber are required' });
    }

    const kyc = await submitKycApplication({
      userId,
      fullName,
      dob,
      gender,
      address,
      idType: idType as DocumentIdType,
      rawIdNumber,
      selfieProvided,
      geoCoordinates,
      triggerFailure
    });

    return res.status(201).json({ success: true, kyc });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/kyc/records:
 *   get:
 *     summary: List all KYC application records
 *     tags: [KYC & Identity]
 */
router.get('/records', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (userId) {
    const record = getKycByUserId(userId);
    return res.json({ success: true, count: record ? 1 : 0, records: record ? [record] : [] });
  }
  const records = getAllKycRecords();
  return res.json({ success: true, count: records.length, records });
});

/**
 * @openapi
 * /api/v1/kyc/records/{id}/status:
 *   patch:
 *     summary: Update KYC review status (Approve, Reject, EDD)
 *     tags: [KYC & Identity]
 */
router.patch('/records/:id/status', (req: Request, res: Response) => {
  try {
    const { status, reviewerNotes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const updated = updateKycStatus(String(req.params.id), status as KycStatus, reviewerNotes);
    return res.json({ success: true, kyc: updated });
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/kyc/liveness-test:
 *   post:
 *     summary: Test biometric liveness and face match confidence
 *     tags: [KYC & Identity]
 */
router.post('/liveness-test', (req: Request, res: Response) => {
  const { triggerFail = false } = req.body;
  const livenessScore = triggerFail ? 35.4 : Number((92 + Math.random() * 7).toFixed(1));
  const faceMatchScore = triggerFail ? 41.2 : Number((90 + Math.random() * 9).toFixed(1));
  const passed = livenessScore >= 70 && faceMatchScore >= 75;

  return res.json({
    success: true,
    passed,
    livenessScore,
    faceMatchScore,
    verdict: passed ? 'LIVENESS_VERIFIED' : 'SPOOF_OR_MISMATCH_DETECTED'
  });
});

export default router;
