import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import userRoutes from './routes/userRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import configRoutes from './routes/configRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Import middleware
import { protect } from './middleware/auth.js';
import errorHandler from './middleware/errorHandler.js';

// Initialize environment variables
dotenv.config();

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
});

// Initialize Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? process.env.FRONTEND_URL 
            : "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(compression());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : "http://localhost:3000",
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Make io available to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/devices', protect, deviceRoutes);
app.use('/api/configurations', protect, configRoutes);
app.use('/api/audit', protect, auditRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const staticPath = path.join(__dirname, '../frontend/build');
    app.use(express.static(staticPath));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(staticPath, 'index.html'));
    });
}

// Error handling middleware
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);
    
    // Join room for configuration updates
    socket.on('join-config-room', (configId) => {
        socket.join(`config-${configId}`);
        console.log(`User ${socket.id} joined config room: config-${configId}`);
    });
    
    // Leave room
    socket.on('leave-config-room', (configId) => {
        socket.leave(`config-${configId}`);
        console.log(`User ${socket.id} left config room: config-${configId}`);
    });
    
    // Handle device status updates
    socket.on('device-status-update', (data) => {
        socket.broadcast.emit('device-status-changed', data);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { io };
