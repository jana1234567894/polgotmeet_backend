import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, ArrowRight, ShieldAlert, Globe, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/translationService';

export default function PreJoin() {
    const { meetingId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [permissionsGranted, setPermissionsGranted] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        checkPermissions();
        return () => {
            stopStream();
        };
    }, []);

    const stopStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const checkPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setPermissionsGranted(true);
            setStream(stream);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Permission denied or error:", err);
            setPermissionsGranted(false);
        }
    };

    const requestPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setPermissionsGranted(true);
            setStream(stream);
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            alert("Permissions are required to join the meeting. Please enable Camera and Microphone in your settings.");
        }
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks().forEach(t => t.enabled = !isMuted);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks().forEach(t => t.enabled = !isVideoOff);
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleJoinClick = () => {
        // Show language selection first
        setShowLanguageModal(true);
    };

    const handleLanguageSelect = (langCode: string) => {
        setSelectedLanguage(langCode);
        proceedToMeeting(langCode);
    };

    const proceedToMeeting = (langCode: string) => {
        stopStream();

        const pwd = searchParams.get('pwd');
        const create = searchParams.get('create');
        let url = `/room/${meetingId}?`;
        if (pwd) url += `pwd=${pwd}&`;
        if (create) url += `create=${create}&`;
        url += `lang=${langCode}`;

        navigate(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-gray-800 text-center">
                    <h2 className="text-xl font-semibold text-white">Ready to join?</h2>
                    <p className="text-gray-400 text-sm mt-1">{meetingId}</p>
                </div>

                {/* Video Preview Area */}
                <div className="aspect-[4/3] bg-black relative flex items-center justify-center overflow-hidden">
                    {permissionsGranted ? (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className={`w-full h-full object-cover transform scale-x-[-1] ${isVideoOff ? 'hidden' : ''}`}
                            />
                            {isVideoOff && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <span className="text-white text-xl font-bold">You</span>
                                    </div>
                                </div>
                            )}

                            {/* Controls Overlay */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                                <button
                                    onClick={toggleMute}
                                    className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700/80 hover:bg-gray-600'} text-white transition-all shadow-lg`}
                                >
                                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                                <button
                                    onClick={toggleVideo}
                                    className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700/80 hover:bg-gray-600'} text-white transition-all shadow-lg`}
                                >
                                    {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-6 space-y-4">
                            <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto" />
                            <p className="text-gray-300">Camera and Mic permissions are needed</p>
                            <button
                                onClick={requestPermissions}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-all active:scale-95"
                            >
                                Allow Permissions
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 flex flex-col gap-4">
                    {permissionsGranted ? (
                        <button
                            onClick={handleJoinClick}
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-bold text-lg flex items-center justify-center space-x-2 shadow-lg shadow-green-600/30 transition-all transform active:scale-95"
                        >
                            <span>Join Meeting</span>
                            <ArrowRight size={20} />
                        </button>
                    ) : (
                        <div className="text-center text-sm text-gray-500">
                            Please allow access to continue
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* Language Selection Modal */}
            {showLanguageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 w-full max-w-md mx-4 rounded-2xl shadow-2xl border border-gray-700/50 animate-slide-up">
                        <div className="p-6 border-b border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Select Your Language</h3>
                                        <p className="text-xs text-gray-400">For real-time translation</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowLanguageModal(false)}
                                    className="p-2 hover:bg-gray-700 rounded-lg transition-all"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-1 gap-3">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageSelect(lang.code)}
                                        className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${selectedLanguage === lang.code
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                                                : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-200 border border-gray-700/50'
                                            }`}
                                    >
                                        <span className="text-3xl">{lang.flag}</span>
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold">{lang.name}</p>
                                            <p className="text-xs opacity-75">
                                                {selectedLanguage === lang.code ? 'Selected' : 'Tap to select'}
                                            </p>
                                        </div>
                                        {selectedLanguage === lang.code && (
                                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                                <div className="w-3 h-3 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-700/50">
                            <p className="text-xs text-gray-400 text-center mb-4">
                                💡 Others will hear you translated in their preferred language
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
