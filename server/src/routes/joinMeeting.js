import { supabase } from '../services/supabase.js';
import { createLiveKitToken } from '../services/livekit.js';

export const joinMeetingRoute = async (req, res) => {
    try {
        const { meetingId, password, userId } = req.body;
        if (!meetingId || !userId) return res.status(400).json({ error: "Missing fields" });

        // 1. Fetch Meeting from Authority (Supabase)
        const { data: meeting, error } = await supabase
            .from('meetings')
            .select('*')
            .eq('meeting_id', meetingId)
            .eq('is_active', true)
            .single();

        if (error || !meeting) {
            return res.status(404).json({ error: "Meeting not found or inactive" });
        }

        // 2. Validate Password (Unless Host)
        // Note: For real prod, verify hash here.
        if (meeting.password !== password && meeting.host_id !== userId) {
            return res.status(403).json({ error: "Invalid password" });
        }

        // 3. Generate Token for the AUTHORITATIVE Room Name
        // This guarantees all users join the same session.
        const isHost = meeting.host_id === userId;
        const token = await createLiveKitToken(meeting.livekit_room, userId, isHost);

        res.json({
            token,
            isHost
        });

    } catch (err) {
        console.error("Join Error:", err);
        res.status(500).json({ error: err.message });
    }
};
