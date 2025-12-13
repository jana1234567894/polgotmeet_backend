import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    LiveKitRoom,
    VideoTrack,
    useTracks,
    useLocalParticipant,
    useParticipants,
    RoomAudioRenderer
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff, MoreVertical,
    Smile, Volume2, ArrowLeft, Users as UsersIcon
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function MeetingPage() {
    const { meetingId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [token, setToken] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const join = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                const pwd = searchParams.get('pwd');

                // Join via Backend
                const res = await fetch(`${SERVER_URL}/join-meeting`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        meetingId,
                        password: pwd,
                        userId: user?.id || 'guest-' + Math.random()
                    })
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Failed to join');
                }

                const data = await res.json();
                setToken(data.token);

            } catch (e: any) {
                setError(e.message);
                console.error(e);
            }
        };

        join();
    }, [meetingId, searchParams]);

    if (error) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Unavailable</h2>
                    <p className="text-gray-400">{error}</p>
                    <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-blue-600 rounded">Go Home</button>
                </div>
            </div>
        );
    }

    if (!token) {
        return <div className="h-screen bg-gray-900 flex items-center justify-center text-white">Joining room...</div>;
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={import.meta.env.VITE_LIVEKIT_URL} // Client connects to LiveKit Cloud directly
            data-lk-theme="default"
            style={{ height: '100vh' }}
            onDisconnected={() => navigate('/')}
        >
            <MeetingUI meetingId={meetingId} />
            <RoomAudioRenderer />
        </LiveKitRoom>
    );
}

function MeetingUI({ meetingId }: { meetingId?: string }) {
    const navigate = useNavigate();
    const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
    const { localParticipant } = useLocalParticipant();
    const participants = useParticipants();

    // Local Controls State
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [floatingEmojis, setFloatingEmojis] = useState<{ id: number, char: string, left: number }[]>([]);

    // Toggle helpers
    const toggleMute = () => {
        const enabled = localParticipant.isMicrophoneEnabled;
        localParticipant.setMicrophoneEnabled(!enabled);
        setIsMuted(enabled); // State lags slightly behind actual track, simplified for UI
    };

    const toggleVideo = () => {
        const enabled = localParticipant.isCameraEnabled;
        localParticipant.setCameraEnabled(!enabled);
        setIsVideoOff(enabled);
    };

    const sendEmoji = (emoji: string) => {
        // In real LiveKit, use Room Data Messages for this
        showFloatingEmoji(emoji);
        setShowEmojiPicker(false);
        // reliable: true is the correct option
        // The signature might be (data, options) or just (data, reliable)
        // Checking docs/types: publishData(data: Uint8Array, options?: DataPublishOptions)
        localParticipant.publishData(
            new TextEncoder().encode(JSON.stringify({ emoji })),
            { reliable: true }
        );
    };

    const showFloatingEmoji = (emoji: string) => {
        const id = Date.now();
        const left = Math.random() * 80 + 10;
        setFloatingEmojis(prev => [...prev, { id, char: emoji, left }]);
        setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 3000);
    };

    const handleEndCall = () => {
        // use .disconnect() directly on the room object if available, but useTracks hook might make it tricky.
        // Better: use the imperative room object from useLiveKitContext or via localParticipant if typed correctly.
        // localParticipant.room is deprecated/protected in some versions.
        // It's safer to just navigate away, and let the LiveKitRoom component handle cleanup via onDisconnected
        navigate('/');
    };

    const hasParticipants = participants.length > 1; // Me + others

    return (
        <div className="h-full bg-[#1F1F1F] text-white overflow-hidden relative font-sans" onClick={() => {
            setShowControls(true);
            setShowEmojiPicker(false);
        }}>

            {/* HEADER */}
            <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center space-x-2">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-800"><ArrowLeft size={20} /></button>
                    <span className="font-medium text-lg tracking-wide">{meetingId}</span>
                    <span className="bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-300">REC</span>
                </div>
                <div className="flex space-x-4">
                    <button className="p-2 rounded-full hover:bg-gray-800"><Volume2 size={24} /></button>
                </div>
            </div>

            {/* VIDEO GRID */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pt-16 pb-24">
                {!hasParticipants ? (
                    <div className="text-center space-y-4">
                        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                            <UsersIcon size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl">You're the only one here</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto">
                            Share the meeting link to invite others
                        </p>
                    </div>
                ) : (
                    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tracks.filter(t => t.participant.identity !== localParticipant.identity).map((track) => (
                            <div key={track.participant.identity} className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                                <VideoTrack trackRef={track} className="w-full h-full object-cover" />
                                <div className="absolute bottom-3 left-3 text-white text-sm font-medium drop-shadow-md">
                                    {track.participant.name || track.participant.identity}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SELF VIEW (Floating) */}
            <div className="absolute bottom-24 right-4 w-28 h-40 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700 z-10 transition-all">
                {/* We need to render the local track specifically */}
                {tracks.find(t => t.participant.identity === localParticipant.identity) ? (
                    <VideoTrack
                        trackRef={tracks.find(t => t.participant.identity === localParticipant.identity)!}
                        className="w-full h-full object-cover mirror transform scale-x-[-1]"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">Camera Off</div>
                )}
                <div className="absolute bottom-2 left-2 text-xs font-semibold bg-black/40 px-1 rounded">You</div>
            </div>

            {/* FLOATING EMOJIS */}
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {floatingEmojis.map(e => (
                    <div
                        key={e.id}
                        className="absolute bottom-20 text-4xl animate-float-up"
                        style={{ left: `${e.left}%` }}
                    >
                        {e.char}
                    </div>
                ))}
            </div>

            {/* BOTTOM CONTROLS */}
            <div className={`absolute bottom-0 left-0 right-0 bg-[#1F1F1F] p-4 flex justify-around items-center z-40 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>

                <button onClick={handleEndCall} className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg">
                    <PhoneOff size={24} fill="currentColor" />
                </button>

                <button onClick={toggleVideo} className={`w-12 h-12 rounded-full ${isVideoOff ? 'bg-white text-black' : 'bg-gray-700/50 text-white'} flex items-center justify-center transition-colors`}>
                    {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                </button>

                <button onClick={toggleMute} className={`w-12 h-12 rounded-full ${isMuted ? 'bg-white text-black' : 'bg-gray-700/50 text-white'} flex items-center justify-center transition-colors`}>
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                <button
                    className="w-12 h-12 rounded-full bg-gray-700/50 text-white flex items-center justify-center relative"
                    onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }}
                >
                    <Smile size={20} />

                    {showEmojiPicker && (
                        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-[#2C2C2C] p-3 rounded-full flex space-x-2 shadow-xl border border-gray-700 w-max" onClick={e => e.stopPropagation()}>
                            {['👍', '👏', '😂', '❤️', '😮', '😢', '🙏'].map(emoji => (
                                <button key={emoji} onClick={() => sendEmoji(emoji)} className="text-2xl hover:scale-125 transition-transform p-1">
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </button>

                <button className="w-12 h-12 rounded-full bg-gray-700/50 text-white flex items-center justify-center">
                    <MoreVertical size={20} />
                </button>
            </div>

            <style>{`
        @keyframes float-up {
            0% { transform: translateY(0) scale(0.5); opacity: 0; }
            10% { opacity: 1; transform: translateY(-20px) scale(1.2); }
            100% { transform: translateY(-300px) scale(1); opacity: 0; }
        }
        .animate-float-up {
            animation: float-up 2s ease-out forwards;
        }
      `}</style>
        </div>
    );
}
