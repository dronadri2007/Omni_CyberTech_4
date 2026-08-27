import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginUser, registerUser, getCurrentUser, loginSchema, registerSchema } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Brute-force protection on credential endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, try again later', code: 'ERR_RATE_LIMIT' },
});

router.post('/login', authLimiter, validate({ body: loginSchema }), loginUser);
router.post('/register', authLimiter, validate({ body: registerSchema }), registerUser);
router.get('/me', requireAuth, getCurrentUser);

export default router;
