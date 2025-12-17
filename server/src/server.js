import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createMeetingRoute } from './routes/createMeeting.js';
import { joinMeetingRoute } from './routes/joinMeeting.js';
import { endMeetingRoute } from './routes/endMeeting.js';

dotenv.config();

const app = express();

// CORS Configuration - Permissive for testing (tighten in production)
app.use(cors({
    origin: '*', // Allow all origins for Capacitor/PWA
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Railway automatically sets PORT
const PORT = process.env.PORT || 3000;

// Environment Validation (Log warnings, don't crash)
const requiredEnvVars = ['LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET', 'LIVEKIT_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('⚠️  Server will start but features may not work correctly.');
}

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health Check Endpoint (Required for Railway)
app.get('/health', (req, res) => {
    res.json({
        ok: true,
        timestamp: new Date().toISOString(),
        service: 'PolyGlotMeet Backend'
    });
});

// Root Endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'PolyGlotMeet Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            createMeeting: 'POST /create-meeting',
            joinMeeting: 'POST /join-meeting',
            endMeeting: 'POST /end-meeting'
        }
    });
});

// API Routes
app.post('/create-meeting', createMeetingRoute);
app.post('/join-meeting', joinMeetingRoute);
app.post('/end-meeting', endMeetingRoute);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start Server - MUST bind to 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Backend Authority Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ LiveKit URL: ${process.env.LIVEKIT_URL || 'NOT SET'}`);
    console.log(`✅ Supabase URL: ${process.env.SUPABASE_URL || 'NOT SET'}`);
});
