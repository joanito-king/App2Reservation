import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReservations } from '../hooks/useReservations';
import { User, Phone, Mail, Clock, LogOut, Calendar, CheckCircle2, XCircle, Hourglass, ChevronRight } from 'lucide-react';
import { toast } from '../components/Toast';
import './Login.css';

const STATUS_CONFIG = {
  pending:   { label: 'En attente', icon: Hourglass,     color: '#D4AF37' },
  accepted:  { label: 'Confirmée',  icon: CheckCircle2,  color: '#10B981' },
  cancelled: { label: 'Annulée',    icon: XCircle,       color: '#EF4444' },
};

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const { getUserReservations } = useReservations();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;
    getUserReservations(user.id)
      .then(data => setHistory(data || []))
      .catch(err => console.error('Error fetching reservations:', err));
  }, [user]);

  const handleLogout = () => {
    try {
      signOut().catch(() => {});
    } catch (e) {}
    localStorage.clear();
    sessionStorage.clear();
    toast.info('Déconnecté avec succès');
    window.location.href = '/';
  };

  if (!user) return null;
  const initials = (profile?.full_name || user.email || '?').slice(0, 2).toUpperCase();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
      <div className="profile-hero">
        <div className="profile-avatar">{initials}</div>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{profile?.full_name || 'Mon Compte'}</h1>
          <p style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Mail size={14} /> {user.email}
          </p>
          {profile?.phone && (
            <p style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Phone size={14} /> {profile.phone}
            </p>
          )}
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <LogOut size={16} /> Déconnexion
        </button>
      </div>

      <div className="card mt-8">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
          <Calendar size={20} style={{ color: '#D4AF37' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Historique des réservations</h2>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6B7280' }}>{history.length} réservation{history.length !== 1 ? 's' : ''}</span>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
            <Calendar size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <p>Aucune réservation pour le moment.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Explorer les restaurants</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map(r => {
              const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              return (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.25rem', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600 }}>{r.restaurantName || `Restaurant #${r.restaurantId}`}</p>
                    <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>Table {r.tableNumber || '—'}</span>
                      <span>{r.guests} pers.</span>
                      {r.time && <span><Clock size={12} style={{ display: 'inline', marginRight: 3 }} />{r.time}</span>}
                      <span>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: cfg.color, fontWeight: 600, fontSize: 13 }}>
                    <Icon size={16} /> {cfg.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .profile-hero {
          display: flex; align-items: center; gap: 1.5rem;
          padding: 2rem 0 1rem;
          flex-wrap: wrap;
        }
        .profile-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37, #8B6914);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; font-weight: 700; color: #0f0f0f;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
