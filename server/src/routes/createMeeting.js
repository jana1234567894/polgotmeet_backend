import { supabase } from '../services/supabase.js';
import { createLiveKitToken } from '../services/livekit.js';
import crypto from 'crypto';

export const createMeetingRoute = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: "userId required" });

        // 1. Generate IDs
        const part1 = Math.random().toString(36).substring(2, 5);
        const part2 = Math.random().toString(36).substring(2, 6);
        const part3 = Math.random().toString(36).substring(2, 5);
        const meetingId = `${part1}-${part2}-${part3}`; // e.g. abc-xyz-123
        const password = Math.random().toString(36).substring(2, 8); // 6 char password

        // Canonical Room Name (This is the Single Source of Truth)
        const roomName = `room_${meetingId}_${crypto.randomBytes(4).toString('hex')}`;

        // 2. Store in DB
        const { error } = await supabase
            .from('meetings')
            .insert({
                meeting_id: meetingId,
                password: password, // In production, hash this!
                livekit_room: roomName,
                host_id: userId,
                is_active: true
            });

        if (error) throw error;

        // 3. Generate Host Token for THIS specific room
        const token = await createLiveKitToken(roomName, userId, true);

        res.json({
            meetingId,
            password,
            roomName,
            token
        });

    } catch (err) {
        console.error("Create Create Error:", err);
        res.status(500).json({ error: err.message });
    }
};
