import { Request, Response } from 'express';

export const loginUser = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Demo authentication fallback
  const user = {
    id: 'usr-demo-001',
    name: email.split('@')[0].replace('.', ' ').toUpperCase(),
    email,
    role: email.includes('fact') ? 'fact_checker' : 'analyst',
    token: 'veriframe_demo_jwt_token_2026_xyz'
  };

  return res.status(200).json({
    message: 'Login successful',
    user
  });
};

export const registerUser = (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const user = {
    id: `usr-${Date.now().toString(36)}`,
    name,
    email,
    role: 'analyst',
    token: 'veriframe_demo_jwt_token_2026_xyz'
  };

  return res.status(201).json({
    message: 'Registration successful',
    user
  });
};

export const getCurrentUser = (req: Request, res: Response) => {
  return res.status(200).json({
    user: {
      id: 'usr-demo-001',
      name: 'Dr. Sarah Vance',
      email: 'sarah.vance@factcheck.org',
      role: 'fact_checker'
    }
  });
};
