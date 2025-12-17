import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import {
    Menu, Search, Video, Calendar, Users, Link as LinkIcon,
    Copy, Share2, X, Clock, TrendingUp, History, LogOut
} from 'lucide-react';

interface Meeting {
    id: string;
    meeting_id: string;
    password: string;
    livekit_room: string;
    host_id: string;
    is_active: boolean;
    created_at: string;
    expires_at: string;
    ended_at: string | null;
}

interface UserProfile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    created_at: string;
}

interface MeetingStats {
    totalMeetings: number;
    activeMeetings: number;
    completedMeetings: number;
}

export default function Dashboard() {
    const [showStartCall, setShowStartCall] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [meetingData, setMeetingData] = useState<{ id: string, password: string } | null>(null);
    const [joinCode, setJoinCode] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<MeetingStats>({ totalMeetings: 0, activeMeetings: 0, completedMeetings: 0 });
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // Load user data on mount
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Load user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setUserProfile(profile);
            }

            // Load recent meetings (both active and completed)
            const { data: meetings } = await supabase
                .from('meetings')
                .select('*')
                .eq('host_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (meetings) {
                setRecentMeetings(meetings);

                // Calculate stats
                const total = meetings.length;
                const active = meetings.filter(m => m.is_active).length;
                const completed = meetings.filter(m => !m.is_active).length;

                setStats({
                    totalMeetings: total,
                    activeMeetings: active,
                    completedMeetings: completed
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMeeting = async () => {
        console.log('🚀 ===== CREATE MEETING STARTED =====');

        try {
            console.log('🔐 Getting authenticated user...');
            const { data: { user } } = await supabase.auth.getUser();
            console.log('👤 User:', user ? `ID: ${user.id}` : 'NOT AUTHENTICATED');

            if (!user) throw new Error('Not authenticated');

            const url = `${import.meta.env.VITE_SERVER_URL}/create-meeting`;
            console.log('📍 API URL:', url);
            console.log('📍 Server URL from env:', import.meta.env.VITE_SERVER_URL);

            const requestBody = { userId: user.id };
            console.log('📤 Request body:', requestBody);

            console.log('🌐 Sending fetch request...');
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok?:', response.ok);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Backend error response:', errorText);
                throw new Error(`Server error ${response.status}: ${errorText}`);
            }

            console.log('📥 Parsing JSON response...');
            const data = await response.json();
            console.log('✅ Received data:', data);

            const { meetingId, password } = data;
            console.log('🎫 Meeting ID:', meetingId);
            console.log('🔐 Password:', password);
            console.log('🔑 Token:', data.token ? `Received (${data.token.substring(0, 20)}...)` : 'MISSING!');

            setMeetingData({ id: meetingId, password });
            setShowStartCall(false);
            setShowInvite(true);

            // Reload meetings after creating
            await loadUserData();

            console.log('✅ ===== CREATE MEETING SUCCESS =====');

        } catch (error: any) {
            console.error('💥 ===== CREATE MEETING FAILED =====');
            console.error('❌ Error type:', error.constructor.name);
            console.error('❌ Error message:', error.message);
            console.error('❌ Full error:', error);
            alert(`Failed to create meeting: ${error.message}`);
        }
    };

    const handleJoin = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!joinCode) {
            alert('Please enter a meeting code');
            return;
        }
        if (!joinPassword) {
            alert('Please enter the meeting password');
            return;
        }
        navigate(`/meeting/${joinCode}?pwd=${joinPassword}`);
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

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1F1F1F] to-gray-900 text-white flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400">Loading your workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1F1F1F] to-gray-900 text-white relative font-sans overflow-x-hidden">

            {/* Top Bar with Profile */}
            <div className="p-4 flex items-center justify-between sticky top-0 bg-gradient-to-b from-[#1F1F1F] to-transparent backdrop-blur-lg z-10 border-b border-gray-800/50">
                <div className="flex items-center space-x-3">
                    <button onClick={() => setShowProfile(true)} className="flex items-center space-x-3 hover:bg-gray-800/50 rounded-xl p-2 transition-all">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                            {userProfile?.full_name?.[0] || 'U'}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="font-medium text-sm">{userProfile?.full_name || 'User'}</p>
                            <p className="text-xs text-gray-400">Dashboard</p>
                        </div>
                    </button>
                </div>
                <button onClick={handleSignOut} className="p-2 hover:bg-red-500/10 rounded-lg transition-all group">
                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="p-4 grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-4 hover:scale-105 transition-transform">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-xl mb-2">
                        <Video className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalMeetings}</p>
                    <p className="text-xs text-gray-400 mt-1">Total Meetings</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm border border-green-500/20 rounded-2xl p-4 hover:scale-105 transition-transform">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-xl mb-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.activeMeetings}</p>
                    <p className="text-xs text-gray-400 mt-1">Active Now</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 hover:scale-105 transition-transform">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-xl mb-2">
                        <History className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.completedMeetings}</p>
                    <p className="text-xs text-gray-400 mt-1">Completed</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setShowStartCall(true)}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 hover:scale-105 transition-all shadow-xl shadow-blue-500/25 active:scale-95"
                    >
                        <Video className="w-6 h-6 mb-2" />
                        <p className="font-medium text-sm">New Meeting</p>
                        <p className="text-xs text-blue-100 mt-1">Start instantly</p>
                    </button>

                    <button
                        className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-4 hover:scale-105 transition-all border border-gray-600/50 active:scale-95 opacity-50 pointer-events-none"
                    >
                        <Calendar className="w-6 h-6 mb-2" />
                        <p className="font-medium text-sm">Schedule</p>
                        <p className="text-xs text-gray-400 mt-1">Coming soon</p>
                    </button>
                </div>
            </div>

            {/* Join Meeting Section */}
            <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Join a Meeting</h3>
                <form onSubmit={handleJoin} className="space-y-3">
                    <div className="relative">
                        <Menu className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Enter meeting code"
                            className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-all backdrop-blur-sm"
                        />
                    </div>
                    <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={joinPassword}
                            onChange={(e) => setJoinPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-all backdrop-blur-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3.5 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 active:scale-95"
                    >
                        Join Meeting
                    </button>
                </form>
            </div>

            {/* Recent Meetings */}
            <div className="p-4 pb-24">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Meetings</h3>
                    {recentMeetings.length > 0 && (
                        <button className="text-xs text-blue-400 hover:text-blue-300">View All</button>
                    )}
                </div>

                {recentMeetings.length === 0 ? (
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-8 text-center backdrop-blur-sm">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <History className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-400 text-sm">No meetings yet</p>
                        <p className="text-gray-500 text-xs mt-1">Create your first meeting to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentMeetings.slice(0, 5).map((meeting) => (
                            <div
                                key={meeting.id}
                                className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800/50 transition-all backdrop-blur-sm group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${meeting.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                        <p className="font-medium text-sm">{meeting.meeting_id}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${meeting.is_active
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-gray-700/50 text-gray-400 border border-gray-600/30'
                                        }`}>
                                        {meeting.is_active ? 'Active' : 'Ended'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatDate(meeting.created_at)}</span>
                                    </div>
                                    {meeting.is_active && (
                                        <button
                                            onClick={() => navigate(`/meeting/${meeting.meeting_id}?pwd=${meeting.password}`)}
                                            className="text-blue-400 hover:text-blue-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Rejoin →
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* P2: START A CALL SHEET */}
            {showStartCall && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setShowStartCall(false)} />

                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 pb-8 relative z-10 animate-slide-up shadow-2xl border border-gray-700/50">
                        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6 opacity-50" />

                        <h3 className="text-xl font-semibold mb-6 text-center">Start a New Meeting</h3>

                        <div className="relative mb-8">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search users to invite"
                                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="flex justify-between px-4 mb-4">
                            <button onClick={handleCreateMeeting} className="flex flex-col items-center space-y-2 group w-1/3">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
                                    <LinkIcon className="text-white w-7 h-7" />
                                </div>
                                <span className="text-xs text-center text-gray-300 font-medium">Create Link</span>
                            </button>

                            <button className="flex flex-col items-center space-y-2 opacity-50 w-1/3 pointer-events-none">
                                <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center border border-gray-600">
                                    <Calendar className="text-gray-400 w-7 h-7" />
                                </div>
                                <span className="text-xs text-center text-gray-400 font-medium">Schedule</span>
                            </button>

                            <button className="flex flex-col items-center space-y-2 opacity-50 w-1/3 pointer-events-none">
                                <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center border border-gray-600">
                                    <Users className="text-gray-400 w-7 h-7" />
                                </div>
                                <span className="text-xs text-center text-gray-400 font-medium">Group Call</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* P3: CREATE LINK POPUP */}
            {showInvite && meetingData && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setShowInvite(false)} />

                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 relative z-10 animate-slide-up shadow-2xl border border-gray-700/50">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-semibold text-white">Meeting Created! 🎉</h3>
                            <button onClick={() => setShowInvite(false)} className="p-2 hover:bg-gray-700 rounded-full transition-all">
                                <X className="text-gray-400 w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                            Share this link with people you want to meet with. Save it for later use!
                        </p>

                        <div className="bg-gray-700/30 border border-gray-600/50 p-4 rounded-xl mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-gray-400 font-medium">Meeting Link</span>
                                <button onClick={copyToClipboard} className="p-2 hover:bg-gray-600 rounded-lg transition-all">
                                    <Copy className="w-4 h-4 text-blue-400" />
                                </button>
                            </div>
                            <p className="text-sm text-white font-mono break-all mb-3">
                                polyglotmeet.app/meeting/{meetingData.id}
                            </p>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-600/50">
                                <span className="text-xs text-gray-400">Password:</span>
                                <span className="text-sm text-white font-mono font-bold">{meetingData.password}</span>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={shareMeeting}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-medium flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>Share</span>
                            </button>
                            <button
                                onClick={joinCreatedMeeting}
                                className="flex-1 bg-gray-700 border border-gray-600 text-white py-3.5 rounded-xl font-medium hover:bg-gray-600 transition-all active:scale-95"
                            >
                                Join Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {showProfile && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setShowProfile(false)} />

                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 relative z-10 animate-slide-up shadow-2xl border border-gray-700/50">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-semibold text-white">Profile</h3>
                            <button onClick={() => setShowProfile(false)} className="p-2 hover:bg-gray-700 rounded-full transition-all">
                                <X className="text-gray-400 w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl mb-4">
                                {userProfile?.full_name?.[0] || 'U'}
                            </div>
                            <h4 className="text-xl font-semibold text-white">{userProfile?.full_name || 'User'}</h4>
                            <p className="text-sm text-gray-400 mt-1">Member since {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Unknown'}</p>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4">
                                <p className="text-xs text-gray-400 mb-1">Total Meetings</p>
                                <p className="text-2xl font-bold text-white">{stats.totalMeetings}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 mb-1">Active</p>
                                    <p className="text-xl font-bold text-green-400">{stats.activeMeetings}</p>
                                </div>
                                <div className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 mb-1">Completed</p>
                                    <p className="text-xl font-bold text-blue-400">{stats.completedMeetings}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="w-full mt-6 bg-red-500/10 border border-red-500/30 text-red-400 py-3.5 rounded-xl font-medium hover:bg-red-500/20 transition-all active:scale-95"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
