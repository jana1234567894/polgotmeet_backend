import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, ArrowRight, ShieldAlert } from 'lucide-react';

export default function PreJoin() {
    const { meetingId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [permissionsGranted, setPermissionsGranted] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    // const [loading, setLoading] = useState(true);

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
            // Trying to get stream is the best way to check/request permissions on Web/PWA
            // because Capacitor Camera plugin checks camera but not mic specifically in same flow easily for WebRTC.
            // However, for Android App feeling, we can try to request them.

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            // If successful, we have permissions
            setPermissionsGranted(true);
            setStream(stream);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            // setLoading(false);
        } catch (err) {
            console.error("Permission denied or error:", err);
            setPermissionsGranted(false);
            // setLoading(false);
        }
    };

    const requestPermissions = async () => {
        // setLoading(true);
        try {
            // Explicitly calling getUserMedia again triggers the prompt
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setPermissionsGranted(true);
            setStream(stream);
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            alert("Permissions are required to join the meeting. Please enable Camera and Microphone in your settings.");
        } finally {
            // setLoading(false);
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

    const handleJoin = () => {
        // Stop this preview stream before joining so the actual meeting page can get a fresh one or pass it?
        // Usually better to stop and let the next page get it, OR pass it via context. 
        // Simplified: Stop it, let Meeting page request it again (it will be instant since permission is granted).
        stopStream();

        // Forward query params like pwd if any
        const pwd = searchParams.get('pwd');
        const create = searchParams.get('create');
        let url = `/room/${meetingId}?`;
        if (pwd) url += `pwd=${pwd}&`;
        if (create) url += `create=${create}`;

        navigate(url);
    };

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">

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
                                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                                        <span className="text-white text-xl">You</span>
                                    </div>
                                </div>
                            )}

                            {/* Controls Overlay */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                                <button
                                    onClick={toggleMute}
                                    className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700/80 hover:bg-gray-600'} text-white transition-all`}
                                >
                                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                                <button
                                    onClick={toggleVideo}
                                    className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700/80 hover:bg-gray-600'} text-white transition-all`}
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
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium"
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
                            onClick={handleJoin}
                            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg flex items-center justify-center space-x-2 shadow-lg shadow-green-600/20 transition-all transform active:scale-95"
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
                        className="text-gray-400 hover:text-white text-sm font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
