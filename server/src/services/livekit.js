import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';
dotenv.config();

const createLiveKitToken = async (roomName, userId, isHost) => {
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
        throw new Error("LiveKit credentials missing");
    }

    const at = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        {
            identity: userId,
            name: userId,
            // 2 hour expiry for security
            ttl: 7200,
        }
    );

    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        roomAdmin: isHost, // Host can kick users, etc.
    });

    return await at.toJwt();
};

export { createLiveKitToken };
