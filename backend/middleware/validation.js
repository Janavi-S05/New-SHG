import Joi from 'joi';

// Validate request body middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Admin', 'Engineer', 'Viewer').default('Viewer'),
    department: Joi.string().max(100)
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    role: Joi.string().valid('Admin', 'Engineer', 'Viewer'),
    department: Joi.string().max(100),
    isActive: Joi.boolean()
  })
};

// Device validation schemas
export const deviceSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    ipAddress: Joi.string().ip({ version: ['ipv4'] }).required(),
    location: Joi.string().min(2).max(200).required(),
    deviceType: Joi.string().valid('Router', 'Switch', 'Firewall', 'Access Point', 'Gateway', 'Load Balancer').required(),
    vendor: Joi.string().valid('Tejas Networks', 'Cisco', 'Juniper', 'Huawei', 'Nokia', 'Ericsson', 'Other').required(),
    model: Joi.string().max(100),
    serialNumber: Joi.string().max(100),
    status: Joi.string().valid('Online', 'Offline', 'Maintenance', 'Error').default('Offline'),
    osVersion: Joi.string().max(50),
    firmwareVersion: Joi.string().max(50),
    managementPort: Joi.number().integer().min(1).max(65535).default(22),
    tags: Joi.array().items(Joi.string().max(50)),
    notes: Joi.string().max(1000)
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(100),
    ipAddress: Joi.string().ip({ version: ['ipv4'] }),
    location: Joi.string().min(2).max(200),
    deviceType: Joi.string().valid('Router', 'Switch', 'Firewall', 'Access Point', 'Gateway', 'Load Balancer'),
    vendor: Joi.string().valid('Tejas Networks', 'Cisco', 'Juniper', 'Huawei', 'Nokia', 'Ericsson', 'Other'),
    model: Joi.string().max(100),
    serialNumber: Joi.string().max(100),
    status: Joi.string().valid('Online', 'Offline', 'Maintenance', 'Error'),
    osVersion: Joi.string().max(50),
    firmwareVersion: Joi.string().max(50),
    managementPort: Joi.number().integer().min(1).max(65535),
    tags: Joi.array().items(Joi.string().max(50)),
    notes: Joi.string().max(1000)
  })
};

// Configuration validation schemas
export const configSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500),
    configType: Joi.string().valid('JSON', 'YAML', 'XML', 'Text').required(),
    version: Joi.string().max(20),
    tags: Joi.array().items(Joi.string().max(50)),
    isTemplate: Joi.boolean().default(false),
    templateVariables: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      type: Joi.string().required(),
      defaultValue: Joi.string(),
      description: Joi.string()
    })),
    validationRules: Joi.array().items(Joi.object({
      field: Joi.string().required(),
      rule: Joi.string().required(),
      message: Joi.string().required()
    }))
  }),
  
  apply: Joi.object({
    configId: Joi.string().hex().length(24).required(),
    deviceIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    templateValues: Joi.object()
  })
};

// Query validation for pagination and filtering
export const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),
  
  deviceFilter: Joi.object({
    search: Joi.string().max(100),
    status: Joi.string().valid('Online', 'Offline', 'Maintenance', 'Error'),
    deviceType: Joi.string().valid('Router', 'Switch', 'Firewall', 'Access Point', 'Gateway', 'Load Balancer'),
    vendor: Joi.string().valid('Tejas Networks', 'Cisco', 'Juniper', 'Huawei', 'Nokia', 'Ericsson', 'Other'),
    location: Joi.string().max(200)
  }),
  
  auditLogFilter: Joi.object({
    userId: Joi.string().hex().length(24),
    action: Joi.string(),
    entityType: Joi.string().valid('Device', 'Configuration', 'User', 'System'),
    success: Joi.boolean(),
    startDate: Joi.date(),
    endDate: Joi.date()
  })
};