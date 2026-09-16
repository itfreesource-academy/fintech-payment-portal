import { Router, Request, Response } from 'express';
import {
  getAllProducts,
  calculateQuote,
  issuePolicy,
  getPoliciesByUserId,
  fileInsuranceClaim,
  getAllClaims,
  adjudicateClaim
} from '../services/insuranceService.js';

const router = Router();

/**
 * @openapi
 * /api/v1/insurance/products:
 *   get:
 *     summary: Retrieve available insurance products (Health, Motor, Cyber, Term Life)
 *     tags: [Insurance Engine]
 */
router.get('/products', (_req: Request, res: Response) => {
  const list = getAllProducts();
  return res.json({ success: true, count: list.length, products: list });
});

/**
 * @openapi
 * /api/v1/insurance/quote:
 *   post:
 *     summary: Calculate actuarial insurance premium quote
 *     tags: [Insurance Engine]
 */
router.post('/quote', (req: Request, res: Response) => {
  try {
    const { productId, userAge = 32, requestedCoverage = 500000 } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const quote = calculateQuote(productId, Number(userAge), Number(requestedCoverage));
    return res.json({ success: true, quote });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/insurance/policies:
 *   post:
 *     summary: Underwrite and issue a new insurance policy
 *     tags: [Insurance Engine]
 */
router.post('/policies', async (req: Request, res: Response) => {
  try {
    const { userId = 'usr_retail_01', productId, coverageAmount = 500000, userAge = 32 } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const policy = await issuePolicy({
      userId,
      productId,
      coverageAmount: Number(coverageAmount),
      userAge: Number(userAge)
    });

    return res.status(201).json({ success: true, policy });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/insurance/policies:
 *   get:
 *     summary: List insurance policies
 *     tags: [Insurance Engine]
 */
router.get('/policies', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr_retail_01';
  const list = getPoliciesByUserId(userId);
  return res.json({ success: true, count: list.length, policies: list });
});

/**
 * @openapi
 * /api/v1/insurance/claims:
 *   post:
 *     summary: File a new insurance claim with automated claims fraud scoring
 *     tags: [Insurance Engine]
 */
router.post('/claims', async (req: Request, res: Response) => {
  try {
    const {
      policyId,
      userId = 'usr_retail_01',
      claimAmount,
      incidentDate = new Date().toISOString().split('T')[0],
      description
    } = req.body;

    if (!policyId || !claimAmount || !description) {
      return res.status(400).json({ error: 'policyId, claimAmount, and description are required' });
    }

    const claim = await fileInsuranceClaim({
      policyId,
      userId,
      claimAmount: Number(claimAmount),
      incidentDate,
      description
    });

    return res.status(201).json({ success: true, claim });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/insurance/claims:
 *   get:
 *     summary: List all filed insurance claims
 *     tags: [Insurance Engine]
 */
router.get('/claims', (_req: Request, res: Response) => {
  const list = getAllClaims();
  return res.json({ success: true, count: list.length, claims: list });
});

/**
 * @openapi
 * /api/v1/insurance/claims/{id}/adjudicate:
 *   patch:
 *     summary: Adjudicate insurance claim (Approved, Rejected, Paid)
 *     tags: [Insurance Engine]
 */
router.patch('/claims/:id/adjudicate', (req: Request, res: Response) => {
  try {
    const { status, notes = 'Adjudicated by underwriting officer', reviewer = 'Sarah Chen' } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const updated = adjudicateClaim(String(req.params.id), status, notes, reviewer);
    return res.json({ success: true, claim: updated });
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});

export default router;
