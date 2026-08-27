import { Router } from 'express';
import { loginUser, registerUser, getCurrentUser } from '../controllers/authController';

const router = Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', getCurrentUser);

export default router;
