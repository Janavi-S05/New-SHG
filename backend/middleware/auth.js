import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import AuditLog from '../models/auditLogModel.js';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user || !req.user.isActive) {
        res.status(401);
        throw new Error('Not authorized, user not found or inactive');
      }
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin access only
export const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied. Admin role required.');
  }
});

// Admin or Engineer access
export const adminOrEngineer = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Engineer')) {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied. Admin or Engineer role required.');
  }
});

// Audit logging middleware
export const auditLog = (action, entityType) => {
  return asyncHandler(async (req, res, next) => {
    const startTime = Date.now();
    
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      const duration = Date.now() - startTime;
      const success = res.statusCode < 400;
      
      // Create audit log entry
      const auditData = {
        userId: req.user._id,
        action,
        entityType,
        entityId: req.params.id || data?._id,
        entityName: data?.name || req.body?.name,
        details: {
          method: req.method,
          url: req.originalUrl,
          body: req.method !== 'GET' ? req.body : undefined,
          params: req.params,
          query: req.query
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        success,
        duration,
        sessionId: req.sessionId
      };
      
      if (!success) {
        auditData.errorMessage = data?.message || 'Unknown error';
      }
      
      // Save audit log asynchronously
      AuditLog.create(auditData).catch(err => {
        console.error('Failed to create audit log:', err);
      });
      
      // Call original json function
      originalJson.call(this, data);
    };
    
    next();
  });
};

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};