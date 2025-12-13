import { supabase } from '../services/supabase.js';
import { RoomServiceClient } from 'livekit-server-sdk';
import dotenv from 'dotenv';
dotenv.config();

const roomService = new RoomServiceClient(
    process.env.LIVEKIT_URL,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
);

export const endMeetingRoute = async (req, res) => {
    try {
        const { meetingId, userId } = req.body;

        // 1. Verify Host Authority
        const { data: meeting } = await supabase
            .from('meetings')
            .select('*')
            .eq('meeting_id', meetingId)
            .single();

        if (!meeting || meeting.host_id !== userId) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // 2. Kill LiveKit Room (Kick everyone)
        try {
            await roomService.deleteRoom(meeting.livekit_room);
        } catch (e) {
            console.warn("Room already closed or not found in LiveKit");
        }

        // 3. Delete from Authority (Supabase)
        await supabase
            .from('meetings')
            .delete()
            .eq('meeting_id', meetingId);

        res.json({ success: true });

    } catch (err) {
        console.error("End Meeting Error:", err);
        res.status(500).json({ error: err.message });
    }
};
