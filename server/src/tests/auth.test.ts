import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { PERSONA_PROFILES } from '../services/authService.js';

describe('Auth & 8 Personas Service', () => {
  it('should list all 8 predefined personas', async () => {
    const res = await request(app).get('/api/v1/auth/personas');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(8);

    const roles = res.body.personas.map((p: any) => p.user.role);
    expect(roles).toContain('compliance_officer');
    expect(roles).toContain('risk_analyst');
    expect(roles).toContain('underwriter');
    expect(roles).toContain('fraud_investigator');
    expect(roles).toContain('retail_customer');
    expect(roles).toContain('hni_customer');
    expect(roles).toContain('pep_sanctioned_user');
    expect(roles).toContain('auditor');
  });

  it('should login successfully as Maya Lin (Compliance Officer)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'compliance.maya', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.fullName).toBe('Maya Lin');
    expect(res.body.profile.jurisdictionFocus).toContain('FIU-IND');
  });

  it('should reject login with invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'compliance.maya', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Invalid credentials');
  });

  it('should verify 6-digit MFA challenge code', async () => {
    const res = await request(app)
      .post('/api/v1/auth/mfa/verify')
      .send({ code: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(true);
  });
});
