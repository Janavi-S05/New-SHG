import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  ipAddress: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v);
      },
      message: 'Invalid IP address format'
    }
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  deviceType: {
    type: String,
    required: true,
    enum: ['Router', 'Switch', 'Firewall', 'Access Point', 'Gateway', 'Load Balancer']
  },
  vendor: {
    type: String,
    required: true,
    enum: ['Tejas Networks', 'Cisco', 'Juniper', 'Huawei', 'Nokia', 'Ericsson', 'Other']
  },
  model: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Online', 'Offline', 'Maintenance', 'Error'],
    default: 'Offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  osVersion: {
    type: String,
    trim: true
  },
  firmwareVersion: {
    type: String,
    trim: true
  },
  managementPort: {
    type: Number,
    default: 22
  },
  configHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Configuration'
  }],
  currentConfig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Configuration'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for search optimization
deviceSchema.index({ name: 'text', location: 'text', ipAddress: 'text' });
deviceSchema.index({ status: 1 });
deviceSchema.index({ deviceType: 1 });
deviceSchema.index({ vendor: 1 });

const Device = mongoose.model('Device', deviceSchema);

export default Device;