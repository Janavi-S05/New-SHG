import express from 'express';
import asyncHandler from 'express-async-handler';
import AuditLog from '../models/auditLogModel.js';
import { adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get audit logs with filtering and pagination
// @route   GET /api/audit/logs
// @access  Private/Admin
router.get('/logs', adminOnly, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    userId,
    action,
    entityType,
    success,
    startDate,
    endDate,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  // Build filter query
  if (userId) query.userId = userId;
  if (action) query.action = action;
  if (entityType) query.entityType = entityType;
  if (success !== undefined) query.success = success === 'true';

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Search in entity names and details
  if (search) {
    query.$or = [
      { entityName: { $regex: search, $options: 'i' } },
      { 'details.url': { $regex: search, $options: 'i' } },
      { errorMessage: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const logs = await AuditLog.find(query)
    .populate('userId', 'name email')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(sort);

  const total = await AuditLog.countDocuments(query);

  // Get summary statistics
  const stats = await AuditLog.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalLogs: { $sum: 1 },
        successfulActions: { $sum: { $cond: ['$success', 1, 0] } },
        failedActions: { $sum: { $cond: ['$success', 0, 1] } },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);

  res.json({
    logs,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    totalLogs: total,
    stats: stats[0] || {
      totalLogs: 0,
      successfulActions: 0,
      failedActions: 0,
      avgDuration: 0
    }
  });
}));

// @desc    Get audit log statistics
// @route   GET /api/audit/stats
// @access  Private/Admin
router.get('/stats', adminOnly, asyncHandler(async (req, res) => {
  const { period = '7d' } = req.query;

  // Calculate date range based on period
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '24h':
      startDate.setHours(now.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  const query = { createdAt: { $gte: startDate } };

  // Overall statistics
  const overallStats = await AuditLog.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalActions: { $sum: 1 },
        successfulActions: { $sum: { $cond: ['$success', 1, 0] } },
        failedActions: { $sum: { $cond: ['$success', 0, 1] } },
        uniqueUsers: { $addToSet: '$userId' },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);

  // Actions by type
  const actionStats = await AuditLog.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        successCount: { $sum: { $cond: ['$success', 1, 0] } },
        failureCount: { $sum: { $cond: ['$success', 0, 1] } }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Activity by entity type
  const entityStats = await AuditLog.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$entityType',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Top active users
  const userStats = await AuditLog.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$userId',
        actionCount: { $sum: 1 },
        lastAction: { $max: '$createdAt' }
      }
    },
    { $sort: { actionCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $project: {
        actionCount: 1,
        lastAction: 1,
        user: { $arrayElemAt: ['$user', 0] }
      }
    }
  ]);

  // Activity timeline (hourly for 24h, daily for longer periods)
  const timeGrouping = period === '24h' 
    ? {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
        hour: { $hour: '$createdAt' }
      }
    : {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };

  const timeline = await AuditLog.aggregate([
    { $match: query },
    {
      $group: {
        _id: timeGrouping,
        count: { $sum: 1 },
        successCount: { $sum: { $cond: ['$success', 1, 0] } },
        failureCount: { $sum: { $cond: ['$success', 0, 1] } }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
  ]);

  // Failed actions details
  const failedActions = await AuditLog.find({
    ...query,
    success: false
  })
  .populate('userId', 'name email')
  .select('action entityType entityName errorMessage createdAt userId')
  .sort({ createdAt: -1 })
  .limit(10);

  res.json({
    period,
    overview: overallStats[0] || {
      totalActions: 0,
      successfulActions: 0,
      failedActions: 0,
      uniqueUsers: [],
      avgDuration: 0
    },
    actionStats,
    entityStats,
    userStats,
    timeline,
    recentFailures: failedActions
  });
}));

// @desc    Get user activity
// @route   GET /api/audit/users/:userId/activity
// @access  Private/Admin
router.get('/users/:userId/activity', adminOnly, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, startDate, endDate } = req.query;

  const query = { userId };

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const logs = await AuditLog.find(query)
    .populate('userId', 'name email')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await AuditLog.countDocuments(query);

  // User activity summary
  const summary = await AuditLog.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalActions: { $sum: 1 },
        successfulActions: { $sum: { $cond: ['$success', 1, 0] } },
        failedActions: { $sum: { $cond: ['$success', 0, 1] } },
        firstAction: { $min: '$createdAt' },
        lastAction: { $max: '$createdAt' },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);

  // Action breakdown
  const actionBreakdown = await AuditLog.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    logs,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    totalLogs: total,
    summary: summary[0] || {},
    actionBreakdown
  });
}));

// @desc    Export audit logs
// @route   GET /api/audit/export
// @access  Private/Admin
router.get('/export', adminOnly, asyncHandler(async (req, res) => {
  const {
    format = 'json',
    userId,
    action,
    entityType,
    success,
    startDate,
    endDate,
    limit = 1000
  } = req.query;

  const query = {};

  // Build filter query
  if (userId) query.userId = userId;
  if (action) query.action = action;
  if (entityType) query.entityType = entityType;
  if (success !== undefined) query.success = success === 'true';

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const logs = await AuditLog.find(query)
    .populate('userId', 'name email')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  if (format === 'csv') {
    // Convert to CSV format
    const csvHeaders = [
      'Timestamp',
      'User',
      'Action',
      'Entity Type',
      'Entity Name',
      'Success',
      'Duration (ms)',
      'IP Address',
      'Error Message'
    ];

    const csvRows = logs.map(log => [
      log.createdAt.toISOString(),
      log.userId ? `${log.userId.name} (${log.userId.email})` : 'Unknown',
      log.action,
      log.entityType,
      log.entityName || '',
      log.success ? 'Yes' : 'No',
      log.duration || '',
      log.ipAddress,
      log.errorMessage || ''
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } else {
    // JSON format
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.json`);
    res.json({
      exportedAt: new Date().toISOString(),
      totalRecords: logs.length,
      filters: { userId, action, entityType, success, startDate, endDate },
      logs
    });
  }
}));

// @desc    Get system health metrics
// @route   GET /api/audit/health
// @access  Private/Admin
router.get('/health', adminOnly, asyncHandler(async (req, res) => {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

  // Recent activity metrics
  const [last24hStats, lastHourStats] = await Promise.all([
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: last24h } } },
      {
        $group: {
          _id: null,
          totalActions: { $sum: 1 },
          failures: { $sum: { $cond: ['$success', 0, 1] } },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]),
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: lastHour } } },
      {
        $group: {
          _id: null,
          totalActions: { $sum: 1 },
          failures: { $sum: { $cond: ['$success', 0, 1] } }
        }
      }
    ])
  ]);

  // Critical failures in last hour
  const criticalFailures = await AuditLog.find({
    createdAt: { $gte: lastHour },
    success: false,
    action: { $in: ['APPLY_CONFIG', 'ROLLBACK_CONFIG', 'DELETE_DEVICE'] }
  }).populate('userId', 'name email');

  // System performance indicators
  const performanceMetrics = {
    errorRate24h: last24hStats[0] ? 
      (last24hStats[0].failures / last24hStats[0].totalActions * 100).toFixed(2) : 0,
    errorRateLastHour: lastHourStats[0] ? 
      (lastHourStats[0].failures / lastHourStats[0].totalActions * 100).toFixed(2) : 0,
    avgResponseTime: last24hStats[0] ? last24hStats[0].avgDuration : 0,
    actionsLast24h: last24hStats[0] ? last24hStats[0].totalActions : 0,
    actionsLastHour: lastHourStats[0] ? lastHourStats[0].totalActions : 0
  };

  res.json({
    timestamp: now.toISOString(),
    performance: performanceMetrics,
    criticalFailures,
    healthStatus: criticalFailures.length === 0 && 
                 parseFloat(performanceMetrics.errorRateLastHour) < 5 ? 'healthy' : 'warning'
  });
}));

// @desc    Delete old audit logs
// @route   DELETE /api/audit/cleanup
// @access  Private/Admin
router.delete('/cleanup', adminOnly, asyncHandler(async (req, res) => {
  const { olderThan = 365 } = req.query; // days

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThan));

  const result = await AuditLog.deleteMany({
    createdAt: { $lt: cutoffDate }
  });

  res.json({
    message: `Cleaned up ${result.deletedCount} audit log entries older than ${olderThan} days`,
    deletedCount: result.deletedCount,
    cutoffDate: cutoffDate.toISOString()
  });
}));

export default router;