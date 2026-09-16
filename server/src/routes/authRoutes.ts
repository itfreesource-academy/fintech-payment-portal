import { Router, Request, Response } from 'express';
import { authenticate, getAllUsers, getUserById, PERSONA_PROFILES } from '../services/authService.js';
import { PersonaRole } from '../types/index.js';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user persona with JWT token
 *     tags: [Auth & Personas]
 */
router.post('/login', (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'identifier (username or email) is required' });
    }

    const result = authenticate(identifier, password || 'Password123!');
    return res.json({
      success: true,
      user: result.user,
      token: result.token,
      profile: result.profile
    });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/auth/personas:
 *   get:
 *     summary: Retrieve all 8 pre-configured sandbox personas
 *     tags: [Auth & Personas]
 */
router.get('/personas', (_req: Request, res: Response) => {
  const users = getAllUsers();
  const list = users.map(u => ({
    user: u,
    profile: PERSONA_PROFILES[u.role as PersonaRole]
  }));
  return res.json({ success: true, count: list.length, personas: list });
});

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user details
 *     tags: [Auth & Personas]
 */
router.get('/me', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr_retail_01';
  const user = getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({
    success: true,
    user,
    profile: PERSONA_PROFILES[user.role]
  });
});

/**
 * @openapi
 * /api/v1/auth/mfa/verify:
 *   post:
 *     summary: Verify Multi-Factor Authentication TOTP or SMS code
 *     tags: [Auth & Personas]
 */
router.post('/mfa/verify', (req: Request, res: Response) => {
  const { code } = req.body;
  // In sandbox, standard code '123456' or any 6-digit code is accepted
  if (code && code.length === 6) {
    return res.json({ success: true, verified: true, message: 'MFA challenge verified successfully' });
  }
  return res.status(400).json({ success: false, error: 'Invalid MFA verification code' });
});

export default router;
