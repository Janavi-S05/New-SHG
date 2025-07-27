import express from 'express';
import asyncHandler from 'express-async-handler';
import Device from '../models/deviceModel.js';
import Configuration from '../models/configurationModel.js';
import { adminOrEngineer, auditLog } from '../middleware/auth.js';
import { validateRequest, deviceSchemas, querySchemas } from '../middleware/validation.js';

const router = express.Router();

// @desc    Get all devices with filtering and pagination
// @route   GET /api/devices
// @access  Private
router.get('/', 
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status, deviceType, vendor, location, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = {};
    
    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Apply filters
    if (status) query.status = status;
    if (deviceType) query.deviceType = deviceType;
    if (vendor) query.vendor = vendor;
    if (location) query.location = { $regex: location, $options: 'i' };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const devices = await Device.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('currentConfig', 'name version')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Device.countDocuments(query);

    // Get status summary
    const statusSummary = await Device.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      devices,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalDevices: total,
      statusSummary: statusSummary.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  })
);

// @desc    Get single device
// @route   GET /api/devices/:id
// @access  Private
router.get('/:id',
  auditLog('VIEW_DEVICE', 'Device'),
  asyncHandler(async (req, res) => {
    const device = await Device.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('currentConfig')
      .populate({
        path: 'configHistory',
        options: { sort: { createdAt: -1 }, limit: 10 },
        populate: { path: 'createdBy', select: 'name email' }
      });

    if (!device) {
      res.status(404);
      throw new Error('Device not found');
    }

    res.json(device);
  })
);

// @desc    Create new device
// @route   POST /api/devices
// @access  Private (Admin/Engineer)
router.post('/',
  adminOrEngineer,
  validateRequest(deviceSchemas.create),
  auditLog('CREATE_DEVICE', 'Device'),
  asyncHandler(async (req, res) => {
    // Check if device with same IP already exists
    const existingDevice = await Device.findOne({ ipAddress: req.body.ipAddress });
    if (existingDevice) {
      res.status(400);
      throw new Error('Device with this IP address already exists');
    }

    const device = await Device.create({
      ...req.body,
      createdBy: req.user._id
    });

    const populatedDevice = await Device.findById(device._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedDevice);
  })
);

// @desc    Update device
// @route   PUT /api/devices/:id
// @access  Private (Admin/Engineer)
router.put('/:id',
  adminOrEngineer,
  validateRequest(deviceSchemas.update),
  auditLog('UPDATE_DEVICE', 'Device'),
  asyncHandler(async (req, res) => {
    const device = await Device.findById(req.params.id);

    if (!device) {
      res.status(404);
      throw new Error('Device not found');
    }

    // Check IP uniqueness if IP is being changed
    if (req.body.ipAddress && req.body.ipAddress !== device.ipAddress) {
      const existingDevice = await Device.findOne({ 
        ipAddress: req.body.ipAddress,
        _id: { $ne: req.params.id }
      });
      if (existingDevice) {
        res.status(400);
        throw new Error('Device with this IP address already exists');
      }
    }

    const updatedDevice = await Device.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('updatedBy', 'name email')
     .populate('currentConfig', 'name version');

    res.json(updatedDevice);
  })
);

// @desc    Delete device
// @route   DELETE /api/devices/:id
// @access  Private (Admin/Engineer)
router.delete('/:id',
  adminOrEngineer,
  auditLog('DELETE_DEVICE', 'Device'),
  asyncHandler(async (req, res) => {
    const device = await Device.findById(req.params.id);

    if (!device) {
      res.status(404);
      throw new Error('Device not found');
    }

    // Remove device references from configurations
    await Configuration.updateMany(
      { 'devices.deviceId': req.params.id },
      { $pull: { devices: { deviceId: req.params.id } } }
    );

    await Device.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Device deleted successfully' });
  })
);

// @desc    Get device configuration history
// @route   GET /api/devices/:id/config-history
// @access  Private
router.get('/:id/config-history',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    const device = await Device.findById(req.params.id);
    if (!device) {
      res.status(404);
      throw new Error('Device not found');
    }

    const configurations = await Configuration.find({
      'devices.deviceId': req.params.id
    })
    .populate('createdBy', 'name email')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

    const total = await Configuration.countDocuments({
      'devices.deviceId': req.params.id
    });

    res.json({
      configurations,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalConfigurations: total
    });
  })
);

// @desc    Update device status
// @route   PATCH /api/devices/:id/status
// @access  Private (Admin/Engineer)
router.patch('/:id/status',
  adminOrEngineer,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    if (!['Online', 'Offline', 'Maintenance', 'Error'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }

    const device = await Device.findById(req.params.id);
    if (!device) {
      res.status(404);
      throw new Error('Device not found');
    }

    device.status = status;
    device.lastSeen = status === 'Online' ? new Date() : device.lastSeen;
    device.updatedBy = req.user._id;
    
    await device.save();

    // Emit real-time update
    req.io.emit('device-status-changed', {
      deviceId: device._id,
      status: device.status,
      lastSeen: device.lastSeen
    });

    res.json({ message: 'Device status updated successfully', device });
  })
);

// @desc    Bulk update device status
// @route   PATCH /api/devices/bulk/status
// @access  Private (Admin/Engineer)
router.patch('/bulk/status',
  adminOrEngineer,
  asyncHandler(async (req, res) => {
    const { deviceIds, status } = req.body;
    
    if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
      res.status(400);
      throw new Error('Device IDs array is required');
    }

    if (!['Online', 'Offline', 'Maintenance', 'Error'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }

    const updateData = {
      status,
      updatedBy: req.user._id
    };

    if (status === 'Online') {
      updateData.lastSeen = new Date();
    }

    const result = await Device.updateMany(
      { _id: { $in: deviceIds } },
      updateData
    );

    // Emit real-time updates
    deviceIds.forEach(deviceId => {
      req.io.emit('device-status-changed', {
        deviceId,
        status,
        lastSeen: status === 'Online' ? new Date() : undefined
      });
    });

    res.json({ 
      message: `${result.modifiedCount} devices updated successfully`,
      modifiedCount: result.modifiedCount
    });
  })
);

// @desc    Get device statistics
// @route   GET /api/devices/stats
// @access  Private
router.get('/stats/summary',
  asyncHandler(async (req, res) => {
    const totalDevices = await Device.countDocuments();
    
    const statusStats = await Device.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const typeStats = await Device.aggregate([
      { $group: { _id: '$deviceType', count: { $sum: 1 } } }
    ]);

    const vendorStats = await Device.aggregate([
      { $group: { _id: '$vendor', count: { $sum: 1 } } }
    ]);

    const locationStats = await Device.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalDevices,
      statusStats: statusStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      typeStats: typeStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      vendorStats: vendorStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topLocations: locationStats
    });
  })
);

export default router;