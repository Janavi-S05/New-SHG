import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'CREATE_DEVICE',
      'UPDATE_DEVICE',
      'DELETE_DEVICE',
      'UPLOAD_CONFIG',
      'APPLY_CONFIG',
      'ROLLBACK_CONFIG',
      'DELETE_CONFIG',
      'CREATE_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'VIEW_DEVICE',
      'VIEW_CONFIG',
      'DOWNLOAD_LOGS',
      'SYSTEM_BACKUP',
      'SYSTEM_RESTORE'
    ]
  },
  entityType: {
    type: String,
    enum: ['Device', 'Configuration', 'User', 'System'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  entityName: {
    type: String,
    trim: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  },
  duration: {
    type: Number // in milliseconds
  },
  deviceInfo: {
    browser: String,
    os: String,
    platform: String
  },
  sessionId: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for performance
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ success: 1 });
auditLogSchema.index({ createdAt: 1 });

// TTL index to automatically delete old logs after 1 year
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;