import { Router, Request, Response } from 'express';
import { initiateDigiLockerConsent, authorizeConsent, fetchIssuedDocuments } from '../services/digilockerService.js';

const router = Router();

/**
 * @openapi
 * /api/v1/digilocker/consent/initiate:
 *   post:
 *     summary: Initiate OAuth2 DigiLocker consent request
 *     tags: [DigiLocker Sandbox]
 */
router.post('/consent/initiate', (req: Request, res: Response) => {
  try {
    const { userId = 'usr_retail_01', scope = ['AADHAAR', 'PAN', 'DRIVING_LICENSE'] } = req.body;
    const consent = initiateDigiLockerConsent(userId, scope);
    return res.status(201).json({
      success: true,
      message: 'DigiLocker OAuth2 consent generated. Awaiting user authorization.',
      consent
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/digilocker/consent/{id}/authorize:
 *   post:
 *     summary: Authorize DigiLocker consent (Simulate Citizen Login/OTP)
 *     tags: [DigiLocker Sandbox]
 */
router.post('/consent/:id/authorize', (req: Request, res: Response) => {
  try {
    const authorized = authorizeConsent(String(req.params.id));
    return res.json({
      success: true,
      message: 'DigiLocker consent successfully authorized',
      consent: authorized
    });
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/digilocker/documents/{consentId}:
 *   get:
 *     summary: Fetch authentic issued Government documents from DigiLocker Sandbox
 *     tags: [DigiLocker Sandbox]
 */
router.get('/documents/:consentId', (req: Request, res: Response) => {
  try {
    const userName = (req.query.userName as string) || 'Vikram Sharma';
    const documents = fetchIssuedDocuments(String(req.params.consentId), userName);
    return res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
