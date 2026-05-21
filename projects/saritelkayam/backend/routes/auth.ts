import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/auth/login — Admin login
router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (password === adminPassword) {
    res.json({
      token: 'admin-authenticated',
      user: { role: 'admin' },
    });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

export default router;
