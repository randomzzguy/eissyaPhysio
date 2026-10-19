import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, HeartPulse, LockKeyhole, ShieldCheck } from 'lucide-react';
import { isDemoMode, isSupabaseConfigured, supabase } from '../supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    if (isDemoMode) {
      window.location.assign('/dashboard');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('The portal is not connected yet. Add the Supabase environment variables before signing in.');
      setSubmitting(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'That email or password is not correct.' : authError.message);
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-story" aria-label="Eissya Physio practice portal">
        <a className="brand brand-light" href="https://eissya.site" aria-label="Eissya Physio home">
          Eissya<span>•</span>Physio
        </a>
        <div className="story-content">
          <div className="story-icon"><HeartPulse aria-hidden="true" /></div>
          <p className="eyebrow">Practice workspace</p>
          <h1>Care, organised<br />around every client.</h1>
          <p>Keep appointments, packages, payments and client progress in one calm, private place.</p>
        </div>
        <div className="privacy-note">
          <ShieldCheck aria-hidden="true" />
          <span>Secure access for Eissya Physio only</span>
        </div>
        <div className="story-orb story-orb-one" />
        <div className="story-orb story-orb-two" />
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-brand">Eissya<span>•</span>Physio</div>
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to your portal</h2>
          <p className="login-intro">Enter your admin details to continue.</p>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required={!isDemoMode}
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            <button className="primary-button login-button" type="submit" disabled={submitting}>
              <LockKeyhole aria-hidden="true" />
              {submitting ? 'Signing in…' : 'Sign in securely'}
              {!submitting && <ArrowRight className="button-arrow" aria-hidden="true" />}
            </button>
          </form>

          {isDemoMode && <p className="demo-hint">Preview mode is on — enter any email to explore the dashboard.</p>}
          <p className="login-help">Having trouble signing in? Contact your site administrator.</p>
        </div>
      </section>
    </main>
  );
};

export default Login;
