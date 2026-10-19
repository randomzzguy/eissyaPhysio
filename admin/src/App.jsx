import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { supabase, isDemoMode, isSupabaseConfigured } from './supabaseClient';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './App.css';

function App() {
  const [session, setSession] = useState(isDemoMode ? { user: { email: 'eissya@demo.local' } } : null);
  const [loading, setLoading] = useState(!isDemoMode && isSupabaseConfigured);

  useEffect(() => {
    if (isDemoMode || !supabase) return undefined;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="app-loading" role="status">
        <span className="loading-mark">E<span>•</span></span>
        <span>Opening your workspace…</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to={session ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}

export default App;
