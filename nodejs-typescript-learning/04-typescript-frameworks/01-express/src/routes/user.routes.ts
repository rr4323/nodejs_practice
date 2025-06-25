import { Router } from 'express';
import { body, param } from 'express-validator';
import { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/user.controller';
import { protect, authorize, checkUserOwnership } from '../middlewares/auth.middleware';

const router = Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// User routes
router
  .route('/')
  .get(getUsers)
  .post(
    [
      body('name', 'Name is required').not().isEmpty(),
      body('email', 'Please include a valid email').isEmail(),
      body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
      body('role', 'Please include a valid role').optional().isIn(['user', 'publisher', 'admin']),
    ],
    createUser
  );

router
  .route('/:id')
  .get(
    [param('id', 'Please include a valid user ID').isUUID()],
    getUser
  )
  .put(
    [
      param('id', 'Please include a valid user ID').isUUID(),
      body('name', 'Name is required').optional().not().isEmpty(),
      body('email', 'Please include a valid email').optional().isEmail(),
      body('role', 'Please include a valid role').optional().isIn(['user', 'publisher', 'admin']),
    ],
    updateUser
  )
  .delete(
    [param('id', 'Please include a valid user ID').isUUID()],
    deleteUser
  );

// User profile routes
router.get(
  '/profile/:id',
  [param('id', 'Please include a valid user ID').isUUID()],
  checkUserOwnership(),
  getUser
);

export default router;
