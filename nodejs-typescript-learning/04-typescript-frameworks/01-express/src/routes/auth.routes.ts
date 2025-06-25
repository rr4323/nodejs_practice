import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateDetails, updatePassword } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  register
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  login
);

// Protected routes
router.get('/me', protect, getMe);
router.put(
  '/update-details',
  protect,
  [
    body('name', 'Name is required').optional().not().isEmpty(),
    body('email', 'Please include a valid email').optional().isEmail(),
  ],
  updateDetails
);

router.put(
  '/update-password',
  protect,
  [
    body('currentPassword', 'Current password is required').exists(),
    body('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  updatePassword
);

export default router;
