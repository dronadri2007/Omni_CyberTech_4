import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import type { User } from '../types';

export interface AuthUser extends User {
  passwordHash: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

const BCRYPT_ROUNDS = 10;

/**
 * Demo credential set. Passwords are hashed at boot, never stored in plaintext.
 * Documented in the README so judges can sign in; override by seeding the DB.
 */
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'veriframe-demo';

const users = new Map<string, AuthUser>();

function seed() {
  const hash = bcrypt.hashSync(DEMO_PASSWORD, BCRYPT_ROUNDS);
  const demo: Array<Omit<AuthUser, 'passwordHash'>> = [
    { id: 'usr-demo-001', name: 'Dr. Sarah Vance', email: 'sarah.vance@factcheck.org', role: 'fact_checker', createdAt: '2026-01-15T09:00:00Z' },
    { id: 'usr-demo-002', name: 'Alex Mercer', email: 'alex.mercer@cybersec.io', role: 'analyst', createdAt: '2026-02-01T10:30:00Z' },
  ];
  for (const u of demo) users.set(u.email.toLowerCase(), { ...u, passwordHash: hash });
}
seed();

function strip(u: AuthUser): User {
  const { passwordHash, ...rest } = u;
  void passwordHash;
  return rest;
}

function signToken(user: User): string {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role, name: user.name }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export interface JwtClaims {
  sub: string;
  email: string;
  role: User['role'];
  name: string;
}

export const authService = {
  async register(input: { name: string; email: string; password: string }): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    if (users.has(email)) throw AppError.badRequest('An account with that email already exists');
    if (input.password.length < 8) throw AppError.badRequest('Password must be at least 8 characters');

    const user: AuthUser = {
      id: `usr-${randomUUID().slice(0, 12)}`,
      name: input.name.trim(),
      email,
      role: 'analyst',
      createdAt: new Date().toISOString(),
      passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
    };
    users.set(email, user);
    const publicUser = strip(user);
    return { user: publicUser, token: signToken(publicUser) };
  },

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const user = users.get(email);
    // Always run a compare to keep timing roughly constant for unknown emails.
    const hash = user?.passwordHash ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin';
    const ok = await bcrypt.compare(input.password, hash);
    if (!user || !ok) throw AppError.unauthorized('Invalid email or password');
    const publicUser = strip(user);
    return { user: publicUser, token: signToken(publicUser) };
  },

  verify(token: string): JwtClaims {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JwtClaims;
    } catch {
      throw AppError.unauthorized('Invalid or expired token');
    }
  },

  getById(id: string): User | undefined {
    for (const u of users.values()) if (u.id === id) return strip(u);
    return undefined;
  },
};
