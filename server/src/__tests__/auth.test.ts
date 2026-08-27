import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../index';

describe('auth', () => {
  it('rejects a bad password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sarah.vance@factcheck.org', password: 'nope' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('ERR_UNAUTHORIZED');
  });

  it('logs in the seeded demo user and returns a JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sarah.vance@factcheck.org', password: 'veriframe-demo' });
    expect(res.status).toBe(200);
    expect(res.body.token).toMatch(/^eyJ/);
    expect(res.body.user.email).toBe('sarah.vance@factcheck.org');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('validates the login body', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('registers a new account and the token works on /me', async () => {
    const email = `tester_${Date.now()}@veriframe.io`;
    const reg = await request(app).post('/api/auth/register').send({ name: 'Test User', email, password: 'sup3rsecret!' });
    expect(reg.status).toBe(201);

    const me = await request(app).get('/api/auth/me').set('authorization', `Bearer ${reg.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email);
  });

  it('rejects /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
