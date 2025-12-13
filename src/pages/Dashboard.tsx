import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import {
    Menu, Search, Video, Calendar, Users, Link as LinkIcon,
    Copy, Share2, X
} from 'lucide-react';

export default function Dashboard() {
    const [showStartCall, setShowStartCall] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [meetingData, setMeetingData] = useState<{ id: string, password: string } | null>(null);
    const [joinCode, setJoinCode] = useState('');

    const navigate = useNavigate();

    const handleCreateMeeting = async () => {
        // setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const url = `${import.meta.env.VITE_SERVER_URL}/create-meeting`;
            // alert(`Debug: Fetching ${url}`); // Temporary debug

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });

            if (!response.ok) throw new Error('Failed to create meeting');

            const { meetingId, password } = await response.json();

            setMeetingData({ id: meetingId, password });
            setShowStartCall(false);
            setShowInvite(true);

        } catch (error: any) {
            alert(error.message);
        } finally {
            // setLoading(false);
        }
    };

    const handleJoin = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!joinCode) return;
        // Simple validation could go here
        navigate(`/meeting/${joinCode}`);
    };

    const copyToClipboard = async () => {
        if (!meetingData) return;
        const link = `https://polyglotmeet.app/meeting/${meetingData.id}`;
        await Clipboard.write({
            string: `Join my PolyGlotMeet: ${link}\nMeeting ID: ${meetingData.id}\nPassword: ${meetingData.password}`
        });
        alert('Copied to clipboard');
    };

    const shareMeeting = async () => {
        if (!meetingData) return;
        const link = `https://polyglotmeet.app/meeting/${meetingData.id}`;
        await Share.share({
            title: 'Join my meeting',
            text: `Join my meeting on PolyGlotMeet. \nID: ${meetingData.id}\nPassword: ${meetingData.password}`,
            url: link,
            dialogTitle: 'Share Meeting'
        });
    };

    const joinCreatedMeeting = () => {
        if (!meetingData) return;
        navigate(`/meeting/${meetingData.id}?pwd=${meetingData.password}&create=true`);
    };

    return (
        <div className="min-h-screen bg-[#1F1F1F] text-white relative font-sans overflow-hidden">

            {/* P1: DASHBOARD */}

            {/* Top Bar */}
            <div className="p-4 flex items-center justify-between sticky top-0 bg-[#1F1F1F] z-10 transition-all">
                <div className="flex-1 relative">
                    <Menu className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <form onSubmit={handleJoin}>
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Search or enter code"
                            className="w-full bg-[#2C2C2C] text-gray-200 rounded-full py-3 pl-14 pr-12 focus:outline-none focus:bg-[#3C3C3C] transition-colors font-normal text-lg placeholder-gray-400 shadow-md"
                        />
                    </form>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                        A
                    </div>
                </div>
            </div>

            {/* Main Body */}
            <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="w-56 h-56 relative mb-2">
                    {/* Illustration Placeholder */}
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="relative w-full h-full bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                        <Video className="w-24 h-24 text-gray-500" />
                    </div>
                </div>
                <h2 className="text-2xl font-normal text-gray-100">Get a link you can share</h2>
                <p className="text-gray-400 max-w-xs text-sm leading-6">
                    Tap <strong>New</strong> to get a link you can send to people you want to meet with
                </p>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-20">
                <button
                    onClick={() => setShowStartCall(true)}
                    className="bg-[#A8C7FA] text-[#062E6F] rounded-2xl px-5 py-4 flex items-center space-x-3 shadow-xl font-medium text-base hover:bg-[#D3E3FD] transition-transform active:scale-95"
                >
                    <Video className="w-6 h-6" />
                    <span>New</span>
                </button>
            </div>


            {/* P2: START A CALL SHEET */}
            {showStartCall && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={() => setShowStartCall(false)} />

                    {/* Sheet */}
                    <div className="bg-[#2C2C2C] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-4 pb-8 relative z-10 animate-slide-up shadow-2xl">
                        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6 opacity-50" />

                        {/* Search in Sheet */}
                        <div className="relative mb-8">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search users"
                                className="w-full bg-[#1F1F1F] text-white rounded-full py-3 pl-12 pr-4 focus:outline-none text-base border border-transparent focus:border-gray-600"
                            />
                        </div>

                        {/* Options */}
                        <div className="flex justify-between px-4 mb-4">
                            <button onClick={handleCreateMeeting} className="flex flex-col items-center space-y-2 group w-1/3">
                                <div className="w-14 h-14 bg-[#1F1F1F] rounded-full flex items-center justify-center border border-gray-700 group-active:bg-gray-700 transition-colors">
                                    <LinkIcon className="text-white w-6 h-6" />
                                </div>
                                <span className="text-xs text-center text-gray-300">Create link</span>
                            </button>

                            <button className="flex flex-col items-center space-y-2 opacity-50 w-1/3 pointer-events-none">
                                <div className="w-14 h-14 bg-[#1F1F1F] rounded-full flex items-center justify-center border border-gray-700">
                                    <Calendar className="text-white w-6 h-6" />
                                </div>
                                <span className="text-xs text-center text-gray-300">Schedule</span>
                            </button>

                            <button className="flex flex-col items-center space-y-2 opacity-50 w-1/3 pointer-events-none">
                                <div className="w-14 h-14 bg-[#1F1F1F] rounded-full flex items-center justify-center border border-gray-700">
                                    <Users className="text-white w-6 h-6" />
                                </div>
                                <span className="text-xs text-center text-gray-300">Group call</span>
                            </button>
                        </div>

                        {/* <button onClick={() => setShowStartCall(false)} className="w-full py-3 text-center text-gray-400 mt-4">Close</button> */}
                    </div>
                </div>
            )}


            {/* P3: CREATE LINK POPUP */}
            {showInvite && meetingData && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={() => setShowInvite(false)} />

                    {/* Sheet */}
                    <div className="bg-[#2C2C2C] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 relative z-10 animate-slide-up shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-normal text-white max-w-[80%]">Here's your joining info</h3>
                            <button onClick={() => setShowInvite(false)} className="p-1 hover:bg-gray-700 rounded-full"><X className="text-gray-400 w-6 h-6" /></button>
                        </div>

                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                            Send this to people you want to meet with. Make sure you save it so you can use it later, too.
                        </p>

                        <div className="flex items-center bg-[#1F1F1F] p-4 rounded-xl mb-8 justify-between border border-gray-800">
                            <div className="flex flex-col overflow-hidden mr-4">
                                <span className="text-sm text-white truncate font-medium">
                                    polyglotmeet.app/meeting/{meetingData.id}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    Passcode: {meetingData.password}
                                </span>
                            </div>
                            <button onClick={copyToClipboard} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                                <Copy className="w-5 h-5 text-gray-300" />
                            </button>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={shareMeeting}
                                className="flex-1 bg-[#A8C7FA] text-[#062E6F] py-3.5 rounded-full font-medium text-sm flex items-center justify-center space-x-2 hover:bg-[#D3E3FD] transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>Share invite</span>
                            </button>
                            <button
                                onClick={joinCreatedMeeting}
                                className="flex-1 bg-transparent border border-gray-600 text-[#A8C7FA] py-3.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors"
                            >
                                Join meeting
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
