import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import YAML from 'yaml';
import Configuration from '../models/configurationModel.js';
import Device from '../models/deviceModel.js';
import { adminOrEngineer, auditLog } from '../middleware/auth.js';
import { validateRequest, configSchemas } from '../middleware/validation.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.json', '.yaml', '.yml', '.xml', '.txt', '.conf'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: JSON, YAML, XML, TXT, CONF'), false);
    }
  }
});

// Helper function to determine config type from file extension
const getConfigType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.json':
      return 'JSON';
    case '.yaml':
    case '.yml':
      return 'YAML';
    case '.xml':
      return 'XML';
    default:
      return 'Text';
  }
};

// Helper function to parse config file content
const parseConfigContent = (buffer, type) => {
  const content = buffer.toString('utf8');
  
  try {
    switch (type) {
      case 'JSON':
        return JSON.parse(content);
      case 'YAML':
        return YAML.parse(content);
      case 'XML':
        // For XML, we'll store as string and let frontend handle parsing
        return content;
      default:
        return content;
    }
  } catch (error) {
    throw new Error(`Failed to parse ${type} content: ${error.message}`);
  }
};

// Helper function to generate checksum
const generateChecksum = (data) => {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
};

// @desc    Get all configurations with filtering and pagination
// @route   GET /api/configurations
// @access  Private
router.get('/',
  asyncHandler(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      configType, 
      isTemplate, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    const query = {};
    
    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { version: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Apply filters
    if (configType) query.configType = configType;
    if (isTemplate !== undefined) query.isTemplate = isTemplate === 'true';
    query.isActive = true;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const configurations = await Configuration.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('devices.deviceId', 'name ipAddress')
      .select('-configData') // Exclude large config data from list view
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Configuration.countDocuments(query);

    res.json({
      configurations,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalConfigurations: total
    });
  })
);

// @desc    Get single configuration
// @route   GET /api/configurations/:id
// @access  Private
router.get('/:id',
  auditLog('VIEW_CONFIG', 'Configuration'),
  asyncHandler(async (req, res) => {
    const configuration = await Configuration.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('devices.deviceId', 'name ipAddress location status');

    if (!configuration) {
      res.status(404);
      throw new Error('Configuration not found');
    }

    res.json(configuration);
  })
);

// @desc    Upload and create new configuration
// @route   POST /api/configurations/upload
// @access  Private (Admin/Engineer)
router.post('/upload',
  adminOrEngineer,
  upload.single('configFile'),
  auditLog('UPLOAD_CONFIG', 'Configuration'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    const { name, description, version, tags, isTemplate, templateVariables } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Configuration name is required');
    }

    const configType = getConfigType(req.file.originalname);
    
    try {
      const configData = parseConfigContent(req.file.buffer, configType);
      const checksum = generateChecksum(configData);

      // Check for duplicate checksum
      const existingConfig = await Configuration.findOne({ checksum });
      if (existingConfig) {
        res.status(400);
        throw new Error('Configuration with identical content already exists');
      }

      const configuration = await Configuration.create({
        name,
        description,
        configType,
        configData,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        checksum,
        version: version || '1.0.0',
        tags: tags ? JSON.parse(tags) : [],
        isTemplate: isTemplate === 'true',
        templateVariables: templateVariables ? JSON.parse(templateVariables) : [],
        createdBy: req.user._id
      });

      const populatedConfig = await Configuration.findById(configuration._id)
        .populate('createdBy', 'name email')
        .select('-configData');

      res.status(201).json(populatedConfig);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  })
);

// @desc    Create configuration manually
// @route   POST /api/configurations
// @access  Private (Admin/Engineer)
router.post('/',
  adminOrEngineer,
  validateRequest(configSchemas.create),
  auditLog('UPLOAD_CONFIG', 'Configuration'),
  asyncHandler(async (req, res) => {
    const { 
      name, 
      description, 
      configType, 
      configData, 
      version, 
      tags, 
      isTemplate, 
      templateVariables 
    } = req.body;

    const checksum = generateChecksum(configData);

    // Check for duplicate checksum
    const existingConfig = await Configuration.findOne({ checksum });
    if (existingConfig) {
      res.status(400);
      throw new Error('Configuration with identical content already exists');
    }

    const configuration = await Configuration.create({
      name,
      description,
      configType,
      configData,
      checksum,
      version: version || '1.0.0',
      tags: tags || [],
      isTemplate: isTemplate || false,
      templateVariables: templateVariables || [],
      createdBy: req.user._id
    });

    const populatedConfig = await Configuration.findById(configuration._id)
      .populate('createdBy', 'name email')
      .select('-configData');

    res.status(201).json(populatedConfig);
  })
);

// @desc    Apply configuration to devices
// @route   POST /api/configurations/:id/apply
// @access  Private (Admin/Engineer)
router.post('/:id/apply',
  adminOrEngineer,
  validateRequest(configSchemas.apply),
  auditLog('APPLY_CONFIG', 'Configuration'),
  asyncHandler(async (req, res) => {
    const { deviceIds, templateValues } = req.body;

    const configuration = await Configuration.findById(req.params.id);
    if (!configuration) {
      res.status(404);
      throw new Error('Configuration not found');
    }

    // Verify all devices exist
    const devices = await Device.find({ _id: { $in: deviceIds } });
    if (devices.length !== deviceIds.length) {
      res.status(400);
      throw new Error('One or more devices not found');
    }

    // Initialize device status tracking
    const deviceStatuses = deviceIds.map(deviceId => ({
      deviceId,
      appliedAt: new Date(),
      status: 'Pending',
      statusMessage: 'Queued for configuration application'
    }));

    // Add devices to configuration
    configuration.devices.push(...deviceStatuses);
    await configuration.save();

    // Start configuration application process (simulated)
    processConfigApplication(req.params.id, deviceIds, req.io, req.user._id);

    res.json({
      message: 'Configuration application started',
      configurationId: req.params.id,
      deviceCount: deviceIds.length,
      devices: deviceStatuses
    });
  })
);

// Simulated configuration application process
const processConfigApplication = async (configId, deviceIds, io, userId) => {
  const configuration = await Configuration.findById(configId);
  
  for (const deviceId of deviceIds) {
    try {
      // Find the device status entry
      const deviceStatus = configuration.devices.find(
        d => d.deviceId.toString() === deviceId.toString()
      );

      if (!deviceStatus) continue;

      // Simulate configuration application delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      // Update status to "In Progress"
      deviceStatus.status = 'In Progress';
      deviceStatus.statusMessage = 'Applying configuration...';
      await configuration.save();

      // Emit real-time update
      io.to(`config-${configId}`).emit('config-progress', {
        configurationId: configId,
        deviceId,
        status: 'In Progress',
        message: 'Applying configuration...'
      });

      // Simulate application process
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));

      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;

      if (success) {
        deviceStatus.status = 'Success';
        deviceStatus.statusMessage = 'Configuration applied successfully';
        
        // Update device's current config
        await Device.findByIdAndUpdate(deviceId, {
          currentConfig: configId,
          $push: { configHistory: configId }
        });
      } else {
        deviceStatus.status = 'Failed';
        deviceStatus.statusMessage = 'Failed to apply configuration: Connection timeout';
      }

      await configuration.save();

      // Emit final status
      io.to(`config-${configId}`).emit('config-progress', {
        configurationId: configId,
        deviceId,
        status: deviceStatus.status,
        message: deviceStatus.statusMessage
      });

    } catch (error) {
      console.error(`Error applying config to device ${deviceId}:`, error);
      
      const deviceStatus = configuration.devices.find(
        d => d.deviceId.toString() === deviceId.toString()
      );
      
      if (deviceStatus) {
        deviceStatus.status = 'Failed';
        deviceStatus.statusMessage = `Error: ${error.message}`;
        await configuration.save();

        io.to(`config-${configId}`).emit('config-progress', {
          configurationId: configId,
          deviceId,
          status: 'Failed',
          message: deviceStatus.statusMessage
        });
      }
    }
  }

  // Emit completion
  io.to(`config-${configId}`).emit('config-complete', {
    configurationId: configId,
    message: 'Configuration application completed'
  });
};

// @desc    Get configuration application status
// @route   GET /api/configurations/:id/status
// @access  Private
router.get('/:id/status',
  asyncHandler(async (req, res) => {
    const configuration = await Configuration.findById(req.params.id)
      .populate('devices.deviceId', 'name ipAddress')
      .select('name devices');

    if (!configuration) {
      res.status(404);
      throw new Error('Configuration not found');
    }

    res.json({
      configurationId: req.params.id,
      configurationName: configuration.name,
      devices: configuration.devices
    });
  })
);

// @desc    Rollback configuration
// @route   POST /api/configurations/:id/rollback/:deviceId
// @access  Private (Admin/Engineer)
router.post('/:id/rollback/:deviceId',
  adminOrEngineer,
  auditLog('ROLLBACK_CONFIG', 'Configuration'),
  asyncHandler(async (req, res) => {
    const { id: configId, deviceId } = req.params;

    const device = await Device.findById(deviceId).populate('configHistory');
    if (!device) {
      res.status(404);
      throw new Error('Device not found');
    }

    // Find previous configuration in history
    const configHistory = device.configHistory.map(config => config._id.toString());
    const currentConfigIndex = configHistory.indexOf(configId);
    
    if (currentConfigIndex === -1) {
      res.status(400);
      throw new Error('Configuration not found in device history');
    }

    if (currentConfigIndex === configHistory.length - 1) {
      res.status(400);
      throw new Error('No previous configuration to rollback to');
    }

    const previousConfigId = configHistory[currentConfigIndex + 1];
    const previousConfig = await Configuration.findById(previousConfigId);

    if (!previousConfig) {
      res.status(404);
      throw new Error('Previous configuration not found');
    }

    // Update device current config
    device.currentConfig = previousConfigId;
    await device.save();

    // Update configuration status
    const currentConfig = await Configuration.findById(configId);
    const deviceStatus = currentConfig.devices.find(
      d => d.deviceId.toString() === deviceId
    );

    if (deviceStatus) {
      deviceStatus.status = 'Rolled Back';
      deviceStatus.statusMessage = `Rolled back to ${previousConfig.name} (${previousConfig.version})`;
      deviceStatus.rollbackConfig = previousConfigId;
      await currentConfig.save();
    }

    res.json({
      message: 'Configuration rolled back successfully',
      rolledBackTo: {
        id: previousConfigId,
        name: previousConfig.name,
        version: previousConfig.version
      }
    });
  })
);

// @desc    Update configuration
// @route   PUT /api/configurations/:id
// @access  Private (Admin/Engineer)
router.put('/:id',
  adminOrEngineer,
  auditLog('UPDATE_CONFIG', 'Configuration'),
  asyncHandler(async (req, res) => {
    const configuration = await Configuration.findById(req.params.id);

    if (!configuration) {
      res.status(404);
      throw new Error('Configuration not found');
    }

    const updatedConfig = await Configuration.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('updatedBy', 'name email')
     .select('-configData');

    res.json(updatedConfig);
  })
);

// @desc    Delete configuration
// @route   DELETE /api/configurations/:id
// @access  Private (Admin/Engineer)
router.delete('/:id',
  adminOrEngineer,
  auditLog('DELETE_CONFIG', 'Configuration'),
  asyncHandler(async (req, res) => {
    const configuration = await Configuration.findById(req.params.id);

    if (!configuration) {
      res.status(404);
      throw new Error('Configuration not found');
    }

    // Check if configuration is currently applied to any devices
    const devicesWithConfig = await Device.find({ currentConfig: req.params.id });
    if (devicesWithConfig.length > 0) {
      res.status(400);
      throw new Error('Cannot delete configuration that is currently applied to devices');
    }

    // Soft delete
    configuration.isActive = false;
    await configuration.save();

    res.json({ message: 'Configuration deleted successfully' });
  })
);

// @desc    Compare configurations
// @route   GET /api/configurations/:id1/compare/:id2
// @access  Private
router.get('/:id1/compare/:id2',
  asyncHandler(async (req, res) => {
    const [config1, config2] = await Promise.all([
      Configuration.findById(req.params.id1),
      Configuration.findById(req.params.id2)
    ]);

    if (!config1 || !config2) {
      res.status(404);
      throw new Error('One or both configurations not found');
    }

    res.json({
      config1: {
        id: config1._id,
        name: config1.name,
        version: config1.version,
        configData: config1.configData,
        createdAt: config1.createdAt
      },
      config2: {
        id: config2._id,
        name: config2.name,
        version: config2.version,
        configData: config2.configData,
        createdAt: config2.createdAt
      }
    });
  })
);

export default router;