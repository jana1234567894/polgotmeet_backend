import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Meeting from './pages/Meeting';
import PreJoin from './pages/PreJoin';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Routes>
                <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
                <Route path="/" element={session ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/meeting/:meetingId" element={session ? <PreJoin /> : <Navigate to="/login" />} />
                <Route path="/room/:meetingId" element={session ? <Meeting /> : <Navigate to="/login" />} />
            </Routes>
        </div>
    );
}

export default App;
