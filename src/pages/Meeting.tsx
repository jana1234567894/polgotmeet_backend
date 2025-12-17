import { useEffect, useState, useRef } from 'react';
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
    Smile, Volume2, ArrowLeft, Users as UsersIcon,
    Subtitles, X, Copy, Globe, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import {
    TranslationService,
    SpeechRecognitionService,
    TextToSpeechService,
    SUPPORTED_LANGUAGES
} from '../utils/translationService';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

interface Caption {
    id: string;
    participantName: string;
    originalText: string;
    translatedText: string;
    timestamp: number;
    language: string;
}

export default function MeetingPage() {
    const { meetingId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [userLanguage, setUserLanguage] = useState('en');

    useEffect(() => {
        // Get language from URL
        const lang = searchParams.get('lang') || 'en';
        setUserLanguage(lang);

        const join = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                const pwd = searchParams.get('pwd');

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
            serverUrl={import.meta.env.VITE_LIVEKIT_URL}
            data-lk-theme="default"
            style={{ height: '100vh' }}
            onDisconnected={() => navigate('/')}
        >
            <MeetingUI meetingId={meetingId} userLanguage={userLanguage} />
            <RoomAudioRenderer />
        </LiveKitRoom>
    );
}

function MeetingUI({ meetingId, userLanguage }: { meetingId?: string, userLanguage: string }) {
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

    // Translation State
    const [captionsEnabled, setCaptionsEnabled] = useState(true);
    const [showTranscript, setShowTranscript] = useState(false);
    const [captions, setCaptions] = useState<Caption[]>([]);
    const [currentCaption, setCurrentCaption] = useState<Caption | null>(null);
    const [interimText, setInterimText] = useState('');

    // Services
    const translationService = useRef<TranslationService | null>(null);
    const speechRecognition = useRef<SpeechRecognitionService | null>(null);
    const ttsService = useRef<TextToSpeechService | null>(null);

    const captionIdCounter = useRef(0);

    useEffect(() => {
        // Initialize translation services
        translationService.current = new TranslationService(userLanguage);
        speechRecognition.current = new SpeechRecognitionService(userLanguage);
        ttsService.current = new TextToSpeechService(userLanguage);

        return () => {
            if (speechRecognition.current) {
                speechRecognition.current.stop();
            }
            if (ttsService.current) {
                ttsService.current.stop();
            }
        };
    }, [userLanguage]);

    // Listen for data messages from other participants
    useEffect(() => {
        const handleDataReceived = async (payload: Uint8Array, participant: any) => {
            try {
                const decoder = new TextDecoder();
                const message = JSON.parse(decoder.decode(payload));

                if (message.type === 'caption' && captionsEnabled) {
                    // Received caption from another participant
                    await handleRemoteCaption(message, participant);
                } else if (message.emoji) {
                    // Handle emoji from earlier implementation
                    showFloatingEmoji(message.emoji);
                }
            } catch (error) {
                console.error('Error processing data message:', error);
            }
        };

        // Subscribe to all participants' data
        participants.forEach((participant) => {
            if (participant.identity !== localParticipant.identity) {
                participant.on('dataReceived', handleDataReceived);
            }
        });

        return () => {
            participants.forEach((participant) => {
                participant.off('dataReceived', handleDataReceived);
            });
        };
    }, [participants, localParticipant, captionsEnabled]);

    useEffect(() => {
        if (captionsEnabled && speechRecognition.current) {
            startSpeechRecognition();
        } else if (speechRecognition.current) {
            speechRecognition.current.stop();
        }

        return () => {
            if (speechRecognition.current) {
                speechRecognition.current.stop();
            }
        };
    }, [captionsEnabled]);

    const handleRemoteCaption = async (message: any, participant: any) => {
        if (!translationService.current) return;

        try {
            // Translate the remote participant's text to our language
            const translatedText = await translationService.current.translateText(message.originalText);

            const caption: Caption = {
                id: `remote-caption-${captionIdCounter.current++}`,
                participantName: participant.name || participant.identity,
                originalText: message.originalText,
                translatedText: translatedText,
                timestamp: Date.now(),
                language: userLanguage
            };

            // Add to captions list
            setCaptions(prev => [...prev, caption]);

            // Show as current caption
            setCurrentCaption(caption);

            // Auto-hide after 5 seconds
            setTimeout(() => {
                setCurrentCaption(prev => prev?.id === caption.id ? null : prev);
            }, 5000);

        } catch (error) {
            console.error('Error translating remote caption:', error);
        }
    };

    const startSpeechRecognition = () => {
        if (!speechRecognition.current) return;

        speechRecognition.current.start(async (text, isFinal) => {
            if (!isFinal) {
                // Show interim text
                setInterimText(text);
            } else {
                // Final text - translate it
                setInterimText('');
                await handleSpeechRecognized(text);
            }
        });
    };

    const handleSpeechRecognized = async (originalText: string) => {
        if (!originalText.trim() || !translationService.current) return;

        try {
            // Translate the text
            const translatedText = await translationService.current.translateText(originalText);

            // Create caption
            const caption: Caption = {
                id: `caption-${captionIdCounter.current++}`,
                participantName: 'You',
                originalText,
                translatedText,
                timestamp: Date.now(),
                language: userLanguage
            };

            // Add to captions list
            setCaptions(prev => [...prev, caption]);

            // Show as current caption
            setCurrentCaption(caption);

            // Auto-hide after 5 seconds
            setTimeout(() => {
                setCurrentCaption(prev => prev?.id === caption.id ? null : prev);
            }, 5000);

            // Broadcast via LiveKit data channel so others can see/translate
            broadcastCaption(caption);

        } catch (error) {
            console.error('Speech recognition error:', error);
        }
    };

    const broadcastCaption = (caption: Caption) => {
        try {
            localParticipant.publishData(
                new TextEncoder().encode(JSON.stringify({
                    type: 'caption',
                    originalText: caption.originalText,
                    participantName: caption.participantName,
                    timestamp: caption.timestamp
                })),
                { reliable: true }
            );
        } catch (error) {
            console.error('Error broadcasting caption:', error);
        }
    };

    const toggleMute = () => {
        const enabled = localParticipant.isMicrophoneEnabled;
        localParticipant.setMicrophoneEnabled(!enabled);
        setIsMuted(enabled);
    };

    const toggleVideo = () => {
        const enabled = localParticipant.isCameraEnabled;
        localParticipant.setCameraEnabled(!enabled);
        setIsVideoOff(enabled);
    };

    const toggleCaptions = () => {
        setCaptionsEnabled(!captionsEnabled);
    };

    const sendEmoji = (emoji: string) => {
        showFloatingEmoji(emoji);
        setShowEmojiPicker(false);
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

    const handleEndCall = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && meetingId) {
                await fetch(`${SERVER_URL}/end-meeting`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        meetingId,
                        userId: user.id
                    })
                });
            }
        } catch (e) {
            console.error('End meeting error:', e);
        } finally {
            navigate('/');
        }
    };

    const copyTranscript = () => {
        const text = captions.map(c =>
            `[${new Date(c.timestamp).toLocaleTimeString()}] ${c.participantName}:\n` +
            `Original: ${c.originalText}\n` +
            `Translated: ${c.translatedText}\n`
        ).join('\n');

        navigator.clipboard.writeText(text);
        alert('Transcript copied to clipboard!');
    };

    const hasParticipants = participants.length > 1;
    const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === userLanguage);

    return (
        <div className="h-full bg-gradient-to-br from-gray-900 via-[#1F1F1F] to-black text-white overflow-hidden relative font-sans" onClick={() => {
            setShowControls(true);
            setShowEmojiPicker(false);
        }}>

            {/* HEADER */}
            <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 transition-opacity duration-300 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center space-x-2">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-800 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <span className="font-medium text-lg tracking-wide">{meetingId}</span>
                    <span className="bg-red-600 px-2 py-0.5 rounded text-xs text-white animate-pulse">LIVE</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-gray-800/50 rounded-full px-3 py-1 backdrop-blur-sm">
                        <Globe size={14} className="text-blue-400" />
                        <span className="text-sm">{selectedLang?.flag} {selectedLang?.name}</span>
                    </div>
                    <button className="p-2 rounded-full hover:bg-gray-800 transition-all">
                        <Volume2 size={20} />
                    </button>
                </div>
            </div>

            {/* VIDEO GRID */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pt-16 pb-32">
                {!hasParticipants ? (
                    <div className="text-center space-y-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                            <UsersIcon size={40} className="text-white" />
                        </div>
                        <h3 className="text-xl font-semibold">You're the only one here</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto">
                            Share the meeting link to invite others
                        </p>
                        {captionsEnabled && (
                            <div className="mt-4 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl inline-block">
                                <p className="text-xs text-green-400 flex items-center space-x-2">
                                    <Subtitles size={14} />
                                    <span>Live translation enabled</span>
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tracks.filter(t => t.participant.identity !== localParticipant.identity).map((track) => (
                            <div key={track.participant.identity} className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl">
                                <VideoTrack trackRef={track} className="w-full h-full object-cover" />
                                <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                                    <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                                        <span className="text-white text-sm font-medium">
                                            {track.participant.name || track.participant.identity}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SELF VIEW (Floating) */}
            <div className="absolute bottom-28 right-4 w-32 h-44 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700/50 z-10 transition-all hover:scale-105">
                {tracks.find(t => t.participant.identity === localParticipant.identity) ? (
                    <VideoTrack
                        trackRef={tracks.find(t => t.participant.identity === localParticipant.identity)!}
                        className="w-full h-full object-cover mirror transform scale-x-[-1]"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-500 to-pink-500">
                        <span className="text-white text-xl font-bold">You</span>
                    </div>
                )}
                <div className="absolute bottom-2 left-2 text-xs font-semibold bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">You</div>
            </div>

            {/* LIVE CAPTIONS - Enhanced UI */}
            {captionsEnabled && (currentCaption || interimText) && (
                <div className="absolute bottom-32 left-4 right-4 md:left-8 md:right-8 z-30 animate-slide-up">
                    <div className="relative bg-gradient-to-br from-gray-900/98 via-gray-800/95 to-gray-900/98 backdrop-blur-xl border border-gray-600/40 rounded-3xl p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>

                        <div className="relative z-10">
                            {interimText && (
                                <div className="mb-3 opacity-80">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                        <p className="text-xs text-blue-300 font-medium">Listening...</p>
                                    </div>
                                    <p className="text-sm text-gray-200 italic pl-1">{interimText}</p>
                                </div>
                            )}
                            {currentCaption && (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <span className="text-sm font-bold text-white">{currentCaption.participantName[0].toUpperCase()}</span>
                                                </div>
                                                {/* Speaking indicator */}
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-base text-white">{currentCaption.participantName}</span>
                                                <p className="text-xs text-gray-400">Speaking now</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                                            {new Date(currentCaption.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {/* Original Text */}
                                        <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-4 border border-gray-600/30">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                                <p className="text-xs text-gray-300 font-medium uppercase tracking-wide">Original</p>
                                            </div>
                                            <p className="text-white font-medium text-base leading-relaxed">{currentCaption.originalText}</p>
                                        </div>

                                        {/* Translated Text */}
                                        <div className="relative bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 border-2 border-blue-400/40 rounded-xl p-4 overflow-hidden">
                                            {/* Animated gradient background */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-gradient"></div>

                                            <div className="relative z-10">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Globe size={14} className="text-blue-300 animate-spin-slow" />
                                                    <p className="text-xs text-blue-200 font-medium uppercase tracking-wide flex items-center space-x-1">
                                                        <span>Translated to</span>
                                                        <span className="text-blue-100 font-semibold">{selectedLang?.name}</span>
                                                        <span className="text-lg">{selectedLang?.flag}</span>
                                                    </p>
                                                </div>
                                                <p className="text-white font-semibold text-base leading-relaxed">{currentCaption.translatedText}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TRANSCRIPT PANEL */}
            {showTranscript && (
                <div className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-gray-900/98 backdrop-blur-lg border-l border-gray-700/50 z-40 animate-slide-in-right">
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Subtitles size={20} className="text-blue-400" />
                                <h3 className="font-semibold text-lg">Transcript</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={copyTranscript} className="p-2 hover:bg-gray-800 rounded-lg transition-all">
                                    <Copy size={18} />
                                </button>
                                <button onClick={() => setShowTranscript(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {captions.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8">
                                    <Subtitles size={40} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No captions yet</p>
                                    <p className="text-xs mt-1">Start speaking to see live translations</p>
                                </div>
                            ) : (
                                captions.map((caption) => (
                                    <div key={caption.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-sm">{caption.participantName}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(caption.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs text-gray-400">Original:</p>
                                                <p className="text-sm text-gray-200">{caption.originalText}</p>
                                            </div>
                                            <div className="border-t border-gray-700/50 pt-2">
                                                <p className="text-xs text-blue-400">Translated:</p>
                                                <p className="text-sm text-white">{caption.translatedText}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

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
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent backdrop-blur-lg p-4 flex justify-around items-center z-40 transition-transform duration-300 border-t border-gray-800/50 ${showControls ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>

                <button onClick={handleEndCall} className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 transition-all active:scale-95">
                    <PhoneOff size={24} fill="currentColor" />
                </button>

                <button onClick={toggleVideo} className={`w-14 h-14 rounded-full ${isVideoOff ? 'bg-white text-black' : 'bg-gray-700/80 hover:bg-gray-600 text-white'} flex items-center justify-center transition-all active:scale-95 shadow-lg`}>
                    {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                </button>

                <button onClick={toggleMute} className={`w-14 h-14 rounded-full ${isMuted ? 'bg-white text-black' : 'bg-gray-700/80 hover:bg-gray-600 text-white'} flex items-center justify-center transition-all active:scale-95 shadow-lg`}>
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                <button
                    onClick={toggleCaptions}
                    className={`w-14 h-14 rounded-full ${captionsEnabled ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' : 'bg-gray-700/80 hover:bg-gray-600 text-white'} flex items-center justify-center transition-all active:scale-95 shadow-lg relative group`}
                >
                    <Subtitles size={22} />
                    {captionsEnabled && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                    )}
                </button>

                <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="w-14 h-14 rounded-full bg-gray-700/80 hover:bg-gray-600 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg"
                >
                    {showTranscript ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
                </button>

                <button
                    className="w-14 h-14 rounded-full bg-gray-700/80 hover:bg-gray-600 text-white flex items-center justify-center relative transition-all active:scale-95 shadow-lg"
                    onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }}
                >
                    <Smile size={22} />

                    {showEmojiPicker && (
                        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-800/98 backdrop-blur-lg p-3 rounded-2xl flex space-x-2 shadow-2xl border border-gray-700/50" onClick={e => e.stopPropagation()}>
                            {['👍', '👏', '😂', '❤️', '😮', '😢', '🙏'].map(emoji => (
                                <button key={emoji} onClick={() => sendEmoji(emoji)} className="text-2xl hover:scale-125 transition-transform p-1">
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </button>

                <button className="w-14 h-14 rounded-full bg-gray-700/80 hover:bg-gray-600 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg">
                    <MoreVertical size={22} />
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
        @keyframes slide-in-right {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        .animate-slide-in-right {
            animation: slide-in-right 0.3s ease-out;
        }
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
        }
        @keyframes gradient {
            0% { opacity: 0.3; }
            50% { opacity: 0.6; }
            100% { opacity: 0.3; }
        }
        .animate-gradient {
            animation: gradient 2s ease-in-out infinite;
        }
        @keyframes slide-up {
            from { 
                transform: translateY(20px); 
                opacity: 0; 
            }
            to { 
                transform: translateY(0); 
                opacity: 1; 
            }
        }
        .animate-slide-up {
            animation: slide-up 0.4s ease-out;
        }
      `}</style>
        </div>
    );
}
