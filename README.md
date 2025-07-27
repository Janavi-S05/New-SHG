# 🌐 Tejas Network Configuration Management Tool

A comprehensive full-stack MERN application for managing network device configurations at telecom companies. Built specifically for Tejas Networks with enterprise-grade features including real-time monitoring, role-based access control, and audit logging.

![Tejas Networks](https://img.shields.io/badge/Tejas-Networks-blue)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** - Secure token-based login/logout
- **Role-based Access Control** - Admin, Engineer, and Viewer roles
- **Protected Routes** - Frontend route protection based on user permissions
- **Session Management** - Automatic token refresh and logout

### 📱 Device Management
- **Complete CRUD Operations** - Create, read, update, delete network devices
- **Advanced Search & Filtering** - Filter by IP, location, status, vendor, device type
- **Device Categories** - Support for routers, switches, firewalls, gateways, load balancers
- **Multi-vendor Support** - Tejas Networks, Cisco, Juniper, Huawei, Nokia, Ericsson
- **Status Monitoring** - Real-time device status tracking (Online, Offline, Maintenance, Error)

### ⚙️ Configuration Management
- **File Upload Support** - JSON, YAML, XML, and text configuration files
- **Configuration Validation** - Automatic syntax and content validation
- **Template System** - Create reusable configuration templates with variables
- **Version Control** - Track configuration changes and maintain history
- **Bulk Operations** - Apply configurations to multiple devices simultaneously

### 🔄 Real-time Operations
- **Socket.IO Integration** - Real-time configuration deployment status
- **Live Progress Tracking** - Monitor configuration application progress
- **Instant Notifications** - Real-time success/failure notifications
- **Status Updates** - Live device status changes

### 📊 Rollback & Version History
- **Complete History** - Track all configuration changes per device
- **Side-by-side Comparison** - Visual diff viewer for configuration comparison
- **One-click Rollback** - Instantly revert to previous configurations
- **Rollback Audit** - Track all rollback operations

### 📈 Analytics & Dashboards
- **Comprehensive Dashboard** - System overview with key metrics
- **Device Analytics** - Vendor distribution, location analytics, health scores
- **Deployment Analytics** - Success rates, timeline tracking, performance metrics
- **Real-time Monitoring** - Live system status and health indicators
- **Chart Visualizations** - Interactive charts using Recharts

### 🔍 Audit & Compliance
- **Complete Audit Logging** - Track all user actions and system events
- **Downloadable Reports** - Export audit logs in CSV and JSON formats
- **User Activity Tracking** - Monitor individual user actions and login history
- **System Health Monitoring** - Performance metrics and error tracking
- **Compliance Reports** - Generate compliance reports for auditing

### 👥 User Management (Admin Only)
- **User CRUD Operations** - Create, update, delete users
- **Role Management** - Assign and modify user roles
- **Activity Monitoring** - Track user login and activity patterns
- **Access Control** - Fine-grained permission management

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Joi** - Data validation
- **Multer** - File upload handling
- **bcrypt** - Password hashing
- **YAML** - YAML file parsing

### Frontend
- **React 18** - UI library with functional components and hooks
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time client communication
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling and validation
- **Recharts** - Chart and visualization library
- **Monaco Editor** - Code editor for configurations
- **React Select** - Enhanced select components
- **React Dropzone** - File upload interface
- **React Diff Viewer** - Side-by-side diff comparison
- **React Toastify** - Toast notifications
- **Lucide React** - Modern icon library

### Database
- **MongoDB** - Document-based NoSQL database
- **Mongoose** - MongoDB object modeling for Node.js

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving
- **Environment Configuration** - Comprehensive environment variable setup

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │   Express API   │    │    MongoDB      │
│                 │    │                 │    │                 │
│ • React Router  │◄──►│ • RESTful APIs  │◄──►│ • Collections:  │
│ • Tailwind CSS  │    │ • Socket.IO     │    │   - Users       │
│ • Socket.IO     │    │ • JWT Auth      │    │   - Devices     │
│ • Axios         │    │ • File Upload   │    │   - Configs     │
│ • Charts        │    │ • Validation    │    │   - Audit Logs  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- Docker & Docker Compose (optional)
- Git

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tejas-network-config-tool
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Option 2: Manual Setup

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd tejas-network-config-tool
   ```

2. **Backend setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   npm run dev
   ```

3. **Frontend setup** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Database seeding** (optional)
   ```bash
   cd backend
   node scripts/seedDatabase.js
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tejas-network-config
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
```

#### Frontend
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 👤 Default Users

After running the seed script, you can login with these default accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@tejasnetworks.com | admin123 | Full access |
| Engineer | engineer@tejasnetworks.com | engineer123 | Device & config management |
| Manager | manager@tejasnetworks.com | manager123 | Device & config management |
| Viewer | viewer@tejasnetworks.com | viewer123 | Read-only access |

## 📁 Project Structure

```
├── backend/
│   ├── middleware/          # Auth, validation, error handling
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── scripts/             # Database utilities
│   ├── .env                 # Environment variables
│   ├── server.js            # Main server file
│   └── Dockerfile           # Backend container config
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Main application pages
│   │   ├── services/        # API service functions
│   │   ├── utils/           # Utility functions
│   │   └── App.js           # Main App component
│   ├── Dockerfile           # Frontend container config
│   └── nginx.conf           # Nginx configuration
├── docker-compose.yml       # Multi-container setup
└── README.md                # This file
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Devices
- `GET /api/devices` - List devices with filtering
- `POST /api/devices` - Create new device
- `GET /api/devices/:id` - Get device details
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `PATCH /api/devices/:id/status` - Update device status

### Configurations
- `GET /api/configurations` - List configurations
- `POST /api/configurations/upload` - Upload configuration file
- `POST /api/configurations/:id/apply` - Apply configuration
- `GET /api/configurations/:id/status` - Get application status
- `POST /api/configurations/:id/rollback/:deviceId` - Rollback configuration

### Audit & Analytics
- `GET /api/audit/logs` - Get audit logs
- `GET /api/audit/export` - Export audit logs
- `GET /api/dashboard/overview` - Dashboard overview
- `GET /api/dashboard/devices/analytics` - Device analytics

## 🎯 Key Features Demo

### Real-time Configuration Deployment
```javascript
// Frontend receives real-time updates via Socket.IO
socket.on('config-progress', (data) => {
  console.log(`Device ${data.deviceId}: ${data.status}`);
});
```

### Role-based Route Protection
```javascript
<Route path="admin/users" element={
  <ProtectedRoute requiredRole="Admin">
    <UserManagement />
  </ProtectedRoute>
} />
```

### Advanced Device Filtering
```javascript
// Filter devices by multiple criteria
const filteredDevices = devices.filter(device => {
  return device.status === 'Online' && 
         device.vendor === 'Tejas Networks' &&
         device.location.includes('Mumbai');
});
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt password encryption
- **Role-based Access** - Granular permission system
- **Input Validation** - Joi schema validation
- **CORS Protection** - Cross-origin request security
- **File Upload Security** - Type and size validation
- **Audit Logging** - Complete action tracking
- **Environment Variables** - Secure configuration management

## 📊 Monitoring & Analytics

- **Real-time Dashboard** - Live system metrics
- **Device Health Scores** - Automated health calculations
- **Deployment Success Rates** - Configuration deployment analytics
- **User Activity Tracking** - Comprehensive user monitoring
- **Performance Metrics** - Response time and error rate tracking
- **Export Capabilities** - CSV and JSON report generation

## 🧪 Sample Configuration Files

### VLAN Configuration (JSON)
```json
{
  "vlans": [
    {"id": 10, "name": "Management", "subnet": "192.168.10.0/24"},
    {"id": 20, "name": "Users", "subnet": "192.168.20.0/24"}
  ],
  "interfaces": {
    "GigabitEthernet0/1": {"switchport": "access", "vlan": 20}
  }
}
```

### Security Configuration (YAML)
```yaml
security:
  ssh:
    version: 2
    timeout: 300
  password_policy:
    min_length: 8
    complexity: true
access_control:
  enable_aaa: true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tejas Networks** - For the opportunity to create this enterprise solution
- **MERN Stack Community** - For the excellent documentation and resources
- **Open Source Contributors** - For the amazing libraries and tools used

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

---

**Built with ❤️ for Tejas Networks by the Development Team**