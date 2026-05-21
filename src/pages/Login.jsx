import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, Eye, EyeOff, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';
import './Login.css';

export default function Login() {
  const { signIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPhone = !identifier.includes('@') && /^[+\d\s\-()]{7,}$/.test(identifier.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await signIn(identifier, password);
      toast.success('Connexion réussie !');
      
      // Force fetch profile to know if admin
      const { supabase } = await import('../lib/supabaseClient');
      const { data: profileData } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
      
      if (profileData?.role === 'admin') {
        window.location.href = '/admin'; // Force full reload to /admin
      } else {
        window.location.href = '/'; // Force full reload to home
      }
    } catch (err) {
      toast.error(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card relative">
        <Link to="/" className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors" title="Retour à l'accueil">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </Link>
        <div className="auth-logo">
          <Flame size={32} />
          <span>VÉLA</span>
        </div>
        <h1 className="auth-title">Bon retour</h1>
        <p className="auth-subtitle">Connectez-vous à votre compte</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>
              {isPhone ? <Phone size={14} /> : <Mail size={14} />}
              Email ou numéro de téléphone
            </label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="exemple@mail.com ou +33 6 12 34 56 78"
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label><Lock size={14} /> Mot de passe</label>
            <div className="password-wrapper">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Se connecter'}
          </button>
        </form>

        <p className="auth-footer">
          Pas encore de compte ?{' '}
          <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
