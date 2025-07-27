import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import Device from '../models/deviceModel.js';
import Configuration from '../models/configurationModel.js';
import AuditLog from '../models/auditLogModel.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'System Administrator',
    email: 'admin@tejasnetworks.com',
    password: 'admin123',
    role: 'Admin',
    department: 'IT Operations'
  },
  {
    name: 'Network Engineer',
    email: 'engineer@tejasnetworks.com',
    password: 'engineer123',
    role: 'Engineer',
    department: 'Network Operations'
  },
  {
    name: 'Operations Manager',
    email: 'manager@tejasnetworks.com',
    password: 'manager123',
    role: 'Engineer',
    department: 'Network Operations'
  },
  {
    name: 'NOC Viewer',
    email: 'viewer@tejasnetworks.com',
    password: 'viewer123',
    role: 'Viewer',
    department: 'Network Operations Center'
  }
];

const sampleDevices = [
  {
    name: 'Core Router Mumbai',
    ipAddress: '192.168.1.1',
    location: 'Mumbai Data Center',
    deviceType: 'Router',
    vendor: 'Tejas Networks',
    model: 'TJ1600-32',
    serialNumber: 'TJ001',
    status: 'Online',
    osVersion: 'TejasOS 15.2',
    firmwareVersion: '2.4.1',
    managementPort: 22,
    tags: ['core', 'production', 'critical'],
    notes: 'Primary core router for Mumbai region'
  },
  {
    name: 'Distribution Switch Delhi',
    ipAddress: '192.168.1.2',
    location: 'Delhi Office',
    deviceType: 'Switch',
    vendor: 'Tejas Networks',
    model: 'TJ48G-PoE',
    serialNumber: 'TJ002',
    status: 'Online',
    osVersion: 'TejasOS 14.8',
    firmwareVersion: '1.9.2',
    managementPort: 22,
    tags: ['distribution', 'office'],
    notes: 'Main distribution switch for Delhi office network'
  },
  {
    name: 'Access Switch Bangalore',
    ipAddress: '192.168.1.3',
    location: 'Bangalore R&D Center',
    deviceType: 'Switch',
    vendor: 'Cisco',
    model: 'Catalyst 2960',
    serialNumber: 'CS001',
    status: 'Maintenance',
    osVersion: 'IOS 15.0',
    firmwareVersion: '15.0.2',
    managementPort: 22,
    tags: ['access', 'rnd'],
    notes: 'Access switch for R&D lab equipment'
  },
  {
    name: 'Firewall Chennai',
    ipAddress: '192.168.1.4',
    location: 'Chennai Branch',
    deviceType: 'Firewall',
    vendor: 'Juniper',
    model: 'SRX300',
    serialNumber: 'JN001',
    status: 'Online',
    osVersion: 'Junos 18.4',
    firmwareVersion: '18.4R2',
    managementPort: 443,
    tags: ['security', 'perimeter'],
    notes: 'Perimeter firewall for Chennai branch office'
  },
  {
    name: 'Gateway Router Hyderabad',
    ipAddress: '192.168.1.5',
    location: 'Hyderabad Office',
    deviceType: 'Gateway',
    vendor: 'Tejas Networks',
    model: 'TJ900-G',
    serialNumber: 'TJ003',
    status: 'Offline',
    osVersion: 'TejasOS 15.1',
    firmwareVersion: '2.3.5',
    managementPort: 22,
    tags: ['gateway', 'branch'],
    notes: 'Internet gateway for Hyderabad office'
  },
  {
    name: 'Load Balancer Pune',
    ipAddress: '192.168.1.6',
    location: 'Pune Data Center',
    deviceType: 'Load Balancer',
    vendor: 'Other',
    model: 'F5 BigIP',
    serialNumber: 'F5001',
    status: 'Online',
    osVersion: 'TMOS 15.1',
    firmwareVersion: '15.1.2',
    managementPort: 443,
    tags: ['load-balancer', 'datacenter'],
    notes: 'Application load balancer for web services'
  }
];

const sampleConfigurations = [
  {
    name: 'Standard VLAN Configuration',
    description: 'Standard VLAN setup for office networks',
    configType: 'JSON',
    configData: {
      vlans: [
        { id: 10, name: 'Management', subnet: '192.168.10.0/24' },
        { id: 20, name: 'Users', subnet: '192.168.20.0/24' },
        { id: 30, name: 'Servers', subnet: '192.168.30.0/24' }
      ],
      interfaces: {
        'GigabitEthernet0/1': {
          switchport: 'access',
          vlan: 20
        },
        'GigabitEthernet0/2': {
          switchport: 'trunk',
          allowed_vlans: '10,20,30'
        }
      }
    },
    version: '1.0.0',
    tags: ['vlan', 'standard', 'office'],
    isTemplate: true,
    templateVariables: [
      {
        name: 'management_vlan_id',
        type: 'number',
        defaultValue: '10',
        description: 'VLAN ID for management network'
      },
      {
        name: 'user_subnet',
        type: 'string',
        defaultValue: '192.168.20.0/24',
        description: 'Subnet for user network'
      }
    ]
  },
  {
    name: 'Security Baseline Configuration',
    description: 'Basic security hardening configuration',
    configType: 'YAML',
    configData: `
security:
  ssh:
    version: 2
    timeout: 300
    max_sessions: 5
  snmp:
    version: 3
    community: disabled
  password_policy:
    min_length: 8
    complexity: true
    expiry_days: 90
access_control:
  enable_aaa: true
  local_users:
    - username: admin
      role: administrator
      authentication: local
logging:
  level: informational
  server: 192.168.1.100
  facility: local0
`,
    version: '2.1.0',
    tags: ['security', 'hardening', 'baseline'],
    isTemplate: false
  },
  {
    name: 'QoS Configuration Template',
    description: 'Quality of Service configuration for voice and data',
    configType: 'JSON',
    configData: {
      qos: {
        policy_maps: [
          {
            name: 'VOICE_POLICY',
            class: 'VOICE_CLASS',
            priority: 'percent 30'
          },
          {
            name: 'DATA_POLICY',
            class: 'DATA_CLASS',
            bandwidth: 'percent 70'
          }
        ],
        class_maps: [
          {
            name: 'VOICE_CLASS',
            match: 'dscp ef'
          },
          {
            name: 'DATA_CLASS',
            match: 'any'
          }
        ]
      }
    },
    version: '1.5.0',
    tags: ['qos', 'voice', 'data'],
    isTemplate: true,
    templateVariables: [
      {
        name: 'voice_priority_percent',
        type: 'number',
        defaultValue: '30',
        description: 'Percentage of bandwidth for voice traffic'
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Device.deleteMany({}),
      Configuration.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.create(sampleUsers);
    const adminUser = createdUsers.find(user => user.role === 'Admin');
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create devices
    console.log('🖥️  Creating devices...');
    const devicesWithCreatedBy = sampleDevices.map(device => ({
      ...device,
      createdBy: adminUser._id
    }));
    const createdDevices = await Device.create(devicesWithCreatedBy);
    console.log(`✅ Created ${createdDevices.length} devices`);

    // Create configurations
    console.log('⚙️  Creating configurations...');
    const configurationsWithCreatedBy = sampleConfigurations.map((config, index) => {
      const checksum = require('crypto')
        .createHash('md5')
        .update(JSON.stringify(config.configData))
        .digest('hex');
      
      return {
        ...config,
        createdBy: adminUser._id,
        checksum,
        originalFileName: `config-${index + 1}.${config.configType.toLowerCase()}`,
        fileSize: JSON.stringify(config.configData).length
      };
    });
    const createdConfigurations = await Configuration.create(configurationsWithCreatedBy);
    console.log(`✅ Created ${createdConfigurations.length} configurations`);

    // Apply some configurations to devices (simulate deployment history)
    console.log('🚀 Creating deployment history...');
    const firstConfig = createdConfigurations[0];
    const secondConfig = createdConfigurations[1];
    
    // Apply first config to first two devices
    firstConfig.devices = [
      {
        deviceId: createdDevices[0]._id,
        appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        status: 'Success',
        statusMessage: 'Configuration applied successfully'
      },
      {
        deviceId: createdDevices[1]._id,
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'Success',
        statusMessage: 'Configuration applied successfully'
      }
    ];
    await firstConfig.save();

    // Apply second config to third device
    secondConfig.devices = [
      {
        deviceId: createdDevices[2]._id,
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'Failed',
        statusMessage: 'Configuration validation failed'
      }
    ];
    await secondConfig.save();

    // Update devices with current configurations
    await Device.findByIdAndUpdate(createdDevices[0]._id, {
      currentConfig: firstConfig._id,
      configHistory: [firstConfig._id]
    });
    await Device.findByIdAndUpdate(createdDevices[1]._id, {
      currentConfig: firstConfig._id,
      configHistory: [firstConfig._id]
    });

    // Create some audit log entries
    console.log('📋 Creating audit logs...');
    const auditLogs = [
      {
        userId: adminUser._id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: adminUser._id,
        entityName: adminUser.name,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      {
        userId: adminUser._id,
        action: 'CREATE_DEVICE',
        entityType: 'Device',
        entityId: createdDevices[0]._id,
        entityName: createdDevices[0].name,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        duration: 1250,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        userId: adminUser._id,
        action: 'APPLY_CONFIG',
        entityType: 'Configuration',
        entityId: firstConfig._id,
        entityName: firstConfig.name,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        duration: 5670,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      }
    ];
    await AuditLog.create(auditLogs);
    console.log(`✅ Created ${auditLogs.length} audit log entries`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample login credentials:');
    console.log('Admin: admin@tejasnetworks.com / admin123');
    console.log('Engineer: engineer@tejasnetworks.com / engineer123');
    console.log('Manager: manager@tejasnetworks.com / manager123');
    console.log('Viewer: viewer@tejasnetworks.com / viewer123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeding function
seedDatabase();