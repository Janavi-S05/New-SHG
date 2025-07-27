import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import AuditLog from '../models/auditLogModel.js';
import { protect, adminOnly, generateToken, auditLog } from '../middleware/auth.js';
import { validateRequest, userSchemas } from '../middleware/validation.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (but should be admin only in production)
router.post('/register', 
  validateRequest(userSchemas.register),
  asyncHandler(async (req, res) => {
    const { name, email, password, role, department } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Viewer',
      department
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id)
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  })
);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login',
  validateRequest(userSchemas.login),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      // Update last login
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      // Log login audit
      await AuditLog.create({
        userId: user._id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user._id,
        entityName: user.name,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        success: true
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id)
      });
    } else {
      // Log failed login attempt
      if (user) {
        await AuditLog.create({
          userId: user._id,
          action: 'LOGIN',
          entityType: 'User',
          entityId: user._id,
          entityName: user.name,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          success: false,
          errorMessage: 'Invalid credentials'
        });
      }

      res.status(401);
      throw new Error('Invalid credentials');
    }
  })
);

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile',
  protect,
  validateRequest(userSchemas.update),
  auditLog('UPDATE_USER', 'User'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.department = req.body.department || user.department;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
router.get('/users', protect, adminOnly, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, isActive } = req.query;
  
  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const users = await User.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.json({
    users,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    totalUsers: total
  });
}));

// @desc    Create user
// @route   POST /api/auth/users
// @access  Private/Admin
router.post('/users',
  protect,
  adminOnly,
  validateRequest(userSchemas.register),
  auditLog('CREATE_USER', 'User'),
  asyncHandler(async (req, res) => {
    const { name, email, password, role, department } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Viewer',
      department,
      createdBy: req.user._id
    });

    res.status(201).json(user);
  })
);

// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
router.put('/users/:id',
  protect,
  adminOnly,
  validateRequest(userSchemas.update),
  auditLog('UPDATE_USER', 'User'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    res.json(updatedUser);
  })
);

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
router.delete('/users/:id',
  protect,
  adminOnly,
  auditLog('DELETE_USER', 'User'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Don't allow deleting the last admin
    if (user.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin', isActive: true });
      if (adminCount <= 1) {
        res.status(400);
        throw new Error('Cannot delete the last admin user');
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  })
);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout',
  protect,
  asyncHandler(async (req, res) => {
    // Log logout audit
    await AuditLog.create({
      userId: req.user._id,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: req.user._id,
      entityName: req.user.name,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({ message: 'Logged out successfully' });
  })
);

export default router;