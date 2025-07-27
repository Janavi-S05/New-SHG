import express from 'express';
import asyncHandler from 'express-async-handler';
import Device from '../models/deviceModel.js';
import Configuration from '../models/configurationModel.js';
import AuditLog from '../models/auditLogModel.js';
import User from '../models/userModel.js';

const router = express.Router();

// @desc    Get dashboard overview statistics
// @route   GET /api/dashboard/overview
// @access  Private
router.get('/overview', asyncHandler(async (req, res) => {
  const { period = '7d' } = req.query;

  // Calculate date range
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
    default:
      startDate.setDate(now.getDate() - 7);
  }

  // Get basic counts
  const [
    totalDevices,
    totalConfigurations,
    totalUsers,
    deviceStatusCounts,
    recentConfigurations,
    recentActivity
  ] = await Promise.all([
    Device.countDocuments(),
    Configuration.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true }),
    Device.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Configuration.find({ isActive: true })
      .populate('createdBy', 'name')
      .select('name version createdAt createdBy')
      .sort({ createdAt: -1 })
      .limit(5),
    AuditLog.find({ 
      createdAt: { $gte: startDate },
      action: { $in: ['APPLY_CONFIG', 'CREATE_DEVICE', 'UPDATE_DEVICE'] }
    })
      .populate('userId', 'name')
      .select('action entityType entityName createdAt userId success')
      .sort({ createdAt: -1 })
      .limit(10)
  ]);

  // Configuration deployment statistics
  const deploymentStats = await Configuration.aggregate([
    {
      $match: {
        'devices.appliedAt': { $gte: startDate }
      }
    },
    {
      $unwind: '$devices'
    },
    {
      $match: {
        'devices.appliedAt': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$devices.status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Active users in period
  const activeUsers = await AuditLog.distinct('userId', {
    createdAt: { $gte: startDate }
  });

  // System health indicators
  const healthIndicators = {
    deviceHealthScore: totalDevices > 0 ? 
      ((deviceStatusCounts.find(s => s._id === 'Online')?.count || 0) / totalDevices * 100).toFixed(1) : 0,
    deploymentSuccessRate: deploymentStats.length > 0 ?
      ((deploymentStats.find(s => s._id === 'Success')?.count || 0) / 
       deploymentStats.reduce((sum, s) => sum + s.count, 0) * 100).toFixed(1) : 0,
    activeUserCount: activeUsers.length
  };

  res.json({
    period,
    overview: {
      totalDevices,
      totalConfigurations,
      totalUsers,
      activeUsers: activeUsers.length
    },
    deviceStatus: deviceStatusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    deploymentStats: deploymentStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    healthIndicators,
    recentConfigurations,
    recentActivity
  });
}));

// @desc    Get device analytics
// @route   GET /api/dashboard/devices/analytics
// @access  Private
router.get('/devices/analytics', asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  // Device distribution by vendor
  const vendorDistribution = await Device.aggregate([
    { $group: { _id: '$vendor', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Device distribution by type
  const typeDistribution = await Device.aggregate([
    { $group: { _id: '$deviceType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Device distribution by location
  const locationDistribution = await Device.aggregate([
    { $group: { _id: '$location', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Device status trends over time
  const now = new Date();
  const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  const statusTrends = await AuditLog.aggregate([
    {
      $match: {
        action: 'UPDATE_DEVICE',
        createdAt: { $gte: startDate },
        'details.body.status': { $exists: true }
      }
    },
    {
      $group: {
        _id: {
          date: { 
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: '$createdAt' 
            }
          },
          status: '$details.body.status'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);

  // Device health score by location
  const healthByLocation = await Device.aggregate([
    {
      $group: {
        _id: '$location',
        totalDevices: { $sum: 1 },
        onlineDevices: {
          $sum: { $cond: [{ $eq: ['$status', 'Online'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        location: '$_id',
        totalDevices: 1,
        onlineDevices: 1,
        healthScore: {
          $multiply: [
            { $divide: ['$onlineDevices', '$totalDevices'] },
            100
          ]
        }
      }
    },
    { $sort: { healthScore: -1 } }
  ]);

  res.json({
    period,
    vendorDistribution,
    typeDistribution,
    locationDistribution,
    statusTrends,
    healthByLocation
  });
}));

// @desc    Get configuration deployment analytics
// @route   GET /api/dashboard/deployments/analytics
// @access  Private
router.get('/deployments/analytics', asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  const now = new Date();
  const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  // Deployment timeline
  const deploymentTimeline = await Configuration.aggregate([
    {
      $match: {
        'devices.appliedAt': { $gte: startDate }
      }
    },
    {
      $unwind: '$devices'
    },
    {
      $match: {
        'devices.appliedAt': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { 
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: '$devices.appliedAt' 
            }
          },
          status: '$devices.status'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);

  // Success rate by configuration type
  const successRateByType = await Configuration.aggregate([
    {
      $match: {
        'devices.appliedAt': { $gte: startDate }
      }
    },
    {
      $unwind: '$devices'
    },
    {
      $match: {
        'devices.appliedAt': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$configType',
        totalDeployments: { $sum: 1 },
        successfulDeployments: {
          $sum: { $cond: [{ $eq: ['$devices.status', 'Success'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        configType: '$_id',
        totalDeployments: 1,
        successfulDeployments: 1,
        successRate: {
          $multiply: [
            { $divide: ['$successfulDeployments', '$totalDeployments'] },
            100
          ]
        }
      }
    }
  ]);

  // Most active users (by deployments)
  const topDeployers = await Configuration.aggregate([
    {
      $match: {
        'devices.appliedAt': { $gte: startDate }
      }
    },
    {
      $unwind: '$devices'
    },
    {
      $match: {
        'devices.appliedAt': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$createdBy',
        deploymentCount: { $sum: 1 },
        successfulDeployments: {
          $sum: { $cond: [{ $eq: ['$devices.status', 'Success'] }, 1, 0] }
        }
      }
    },
    { $sort: { deploymentCount: -1 } },
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
        deploymentCount: 1,
        successfulDeployments: 1,
        user: { $arrayElemAt: ['$user', 0] },
        successRate: {
          $multiply: [
            { $divide: ['$successfulDeployments', '$deploymentCount'] },
            100
          ]
        }
      }
    }
  ]);

  // Deployment duration statistics
  const durationStats = await Configuration.aggregate([
    {
      $match: {
        'devices.appliedAt': { $gte: startDate },
        'devices.status': { $in: ['Success', 'Failed'] }
      }
    },
    {
      $unwind: '$devices'
    },
    {
      $match: {
        'devices.appliedAt': { $gte: startDate },
        'devices.status': { $in: ['Success', 'Failed'] }
      }
    },
    {
      $group: {
        _id: null,
        avgDuration: { $avg: '$duration' },
        minDuration: { $min: '$duration' },
        maxDuration: { $max: '$duration' },
        totalDeployments: { $sum: 1 }
      }
    }
  ]);

  res.json({
    period,
    deploymentTimeline,
    successRateByType,
    topDeployers,
    durationStats: durationStats[0] || {
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      totalDeployments: 0
    }
  });
}));

// @desc    Get real-time system status
// @route   GET /api/dashboard/status/realtime
// @access  Private
router.get('/status/realtime', asyncHandler(async (req, res) => {
  const now = new Date();
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
  const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);

  // Current system statistics
  const [
    currentDeviceStatus,
    activeDeployments,
    recentErrors,
    systemLoad
  ] = await Promise.all([
    Device.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Configuration.aggregate([
      {
        $match: {
          'devices.status': 'In Progress'
        }
      },
      {
        $unwind: '$devices'
      },
      {
        $match: {
          'devices.status': 'In Progress'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]),
    AuditLog.find({
      createdAt: { $gte: lastHour },
      success: false
    })
      .populate('userId', 'name')
      .select('action entityType errorMessage createdAt userId')
      .sort({ createdAt: -1 })
      .limit(5),
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: last5Minutes } } },
      {
        $group: {
          _id: null,
          requestCount: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      }
    ])
  ]);

  // Network health indicators
  const networkHealth = {
    devicesOnline: currentDeviceStatus.find(s => s._id === 'Online')?.count || 0,
    devicesTotal: currentDeviceStatus.reduce((sum, s) => sum + s.count, 0),
    activeDeployments: activeDeployments[0]?.count || 0,
    recentErrorCount: recentErrors.length,
    systemLoad: systemLoad[0] || { requestCount: 0, avgDuration: 0 }
  };

  // Calculate health score
  const healthScore = networkHealth.devicesTotal > 0 ? 
    (networkHealth.devicesOnline / networkHealth.devicesTotal * 100).toFixed(1) : 100;

  res.json({
    timestamp: now.toISOString(),
    networkHealth,
    healthScore: parseFloat(healthScore),
    status: healthScore > 90 ? 'excellent' : 
            healthScore > 75 ? 'good' : 
            healthScore > 50 ? 'warning' : 'critical',
    currentDeviceStatus: currentDeviceStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    recentErrors
  });
}));

// @desc    Get user activity analytics
// @route   GET /api/dashboard/users/analytics
// @access  Private (Admin only for detailed user analytics)
router.get('/users/analytics', asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  const now = new Date();
  const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  // User activity over time
  const userActivity = await AuditLog.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          date: { 
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: '$createdAt' 
            }
          }
        },
        uniqueUsers: { $addToSet: '$userId' },
        totalActions: { $sum: 1 }
      }
    },
    {
      $project: {
        date: '$_id.date',
        uniqueUsers: { $size: '$uniqueUsers' },
        totalActions: 1
      }
    },
    { $sort: { date: 1 } }
  ]);

  // Most active users
  const topUsers = await AuditLog.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$userId',
        actionCount: { $sum: 1 },
        lastActivity: { $max: '$createdAt' },
        actions: { $addToSet: '$action' }
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
        lastActivity: 1,
        actionsTypes: { $size: '$actions' },
        user: { $arrayElemAt: ['$user', 0] }
      }
    }
  ]);

  // User role distribution
  const roleDistribution = await User.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  res.json({
    period,
    userActivity,
    topUsers,
    roleDistribution: roleDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  });
}));

// @desc    Get performance metrics
// @route   GET /api/dashboard/performance
// @access  Private
router.get('/performance', asyncHandler(async (req, res) => {
  const { period = '24h' } = req.query;

  const now = new Date();
  let startDate = new Date();
  let groupByFormat = '%Y-%m-%d %H:00:00';

  switch (period) {
    case '1h':
      startDate.setHours(now.getHours() - 1);
      groupByFormat = '%Y-%m-%d %H:%M:00';
      break;
    case '24h':
      startDate.setHours(now.getHours() - 24);
      groupByFormat = '%Y-%m-%d %H:00:00';
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      groupByFormat = '%Y-%m-%d';
      break;
    default:
      startDate.setHours(now.getHours() - 24);
  }

  // Response time trends
  const responseTimeTrends = await AuditLog.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate },
        duration: { $exists: true, $ne: null }
      } 
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupByFormat,
            date: '$createdAt'
          }
        },
        avgResponseTime: { $avg: '$duration' },
        minResponseTime: { $min: '$duration' },
        maxResponseTime: { $max: '$duration' },
        requestCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Error rate trends
  const errorRateTrends = await AuditLog.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupByFormat,
            date: '$createdAt'
          }
        },
        totalRequests: { $sum: 1 },
        errorCount: { 
          $sum: { $cond: ['$success', 0, 1] } 
        }
      }
    },
    {
      $project: {
        totalRequests: 1,
        errorCount: 1,
        errorRate: {
          $multiply: [
            { $divide: ['$errorCount', '$totalRequests'] },
            100
          ]
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Current performance summary
  const performanceSummary = await AuditLog.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        totalErrors: { 
          $sum: { $cond: ['$success', 0, 1] } 
        },
        avgResponseTime: { $avg: '$duration' },
        p95ResponseTime: { 
          $percentile: { 
            input: '$duration', 
            p: [0.95], 
            method: 'approximate' 
          } 
        }
      }
    }
  ]);

  res.json({
    period,
    responseTimeTrends,
    errorRateTrends,
    summary: performanceSummary[0] || {
      totalRequests: 0,
      totalErrors: 0,
      avgResponseTime: 0,
      p95ResponseTime: [0]
    }
  });
}));

export default router;