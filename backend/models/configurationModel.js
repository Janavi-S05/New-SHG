import mongoose from 'mongoose';

const configurationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  configType: {
    type: String,
    enum: ['JSON', 'YAML', 'XML', 'Text'],
    required: true
  },
  configData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  originalFileName: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number
  },
  checksum: {
    type: String
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  devices: [{
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true
    },
    appliedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Success', 'Failed', 'Rolled Back'],
      default: 'Pending'
    },
    statusMessage: {
      type: String
    },
    rollbackConfig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Configuration'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateVariables: [{
    name: String,
    type: String,
    defaultValue: String,
    description: String
  }],
  validationRules: [{
    field: String,
    rule: String,
    message: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search optimization
configurationSchema.index({ name: 'text', description: 'text' });
configurationSchema.index({ configType: 1 });
configurationSchema.index({ 'devices.status': 1 });
configurationSchema.index({ createdBy: 1 });

const Configuration = mongoose.model('Configuration', configurationSchema);

export default Configuration;