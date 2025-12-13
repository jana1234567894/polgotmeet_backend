import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createMeetingRoute } from './routes/createMeeting.js';
import { joinMeetingRoute } from './routes/joinMeeting.js';
import { endMeetingRoute } from './routes/endMeeting.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.send(`PolyGlotMeet Server is RUNNING at ${new Date().toISOString()}`);
});
app.post('/create-meeting', createMeetingRoute);
app.post('/join-meeting', joinMeetingRoute);
app.post('/end-meeting', endMeetingRoute);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend Authority Server running on port ${PORT}`);
    console.log(`- LiveKit URL: ${process.env.LIVEKIT_URL}`);
});
