import { Link } from 'react-router-dom';
import { Search, UserCircle, LogOut, Flame, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, profile, isAuthenticated, isAdmin } = useAuth();

  return (
    <nav className="navbar">
      <div className="container flex justify-between items-center navbar-inner">
        <Link to="/" className="navbar-logo flex items-center gap-2">
          <Flame size={24} style={{ color: '#D4AF37' }} />
          <span className="logo-text font-bold tracking-widest text-white" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.2em' }}>VÉLA</span>
        </Link>
        
        <div className="navbar-search">
          <div className="search-input-wrapper flex items-center">
            <Search className="search-icon text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un restaurant..." 
              className="search-input"
            />
          </div>
        </div>
        
        <div className="navbar-actions flex items-center gap-4">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {isAdmin && (
                <Link to="/admin" className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(212,175,55,0.1)', color: '#D4AF37', borderRadius: 8, fontSize: '0.9rem', display: 'flex', gap: 6 }}>
                  <ShieldCheck size={16} /> Espace Pro
                </Link>
              )}
              <Link to="/profile" className="nav-link flex items-center gap-2" style={{ color: '#F3F4F6', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: 20 }}>
                <UserCircle size={20} />
                <span style={{ fontWeight: 500 }}>{profile?.full_name || user?.email?.split('@')[0] || 'Mon Compte'}</span>
              </Link>
              <button 
                onClick={() => { 
                  try {
                    import('../lib/supabaseClient').then(m => {
                      m.supabase.auth.signOut().catch(() => {});
                    });
                  } catch (e) {}
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/'; 
                }} 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem', borderRadius: 8, borderColor: 'rgba(239, 68, 68, 0.3)', color: '#EF4444' }}
                title="Déconnexion rapide"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary flex items-center gap-2" style={{ padding: '0.5rem 1.25rem', borderRadius: 20 }}>
              <UserCircle size={18} />
              <span>Se connecter</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
