import { useState } from 'react';
import { AlertCircle, X, Timer } from 'lucide-react';
import './SimulationControls.css';

// SimulationControls receives reservations/updateStatus as props
// to avoid extra hook subscriptions that confuse React HMR
export default function SimulationControls({ reservations = [], onCancelReservation }) {
  const [notification, setNotification] = useState(null);

  const activeReservation = reservations.find(r => r.status === 'accepted');

  const handleSimulateDelay = () => {
    if (!activeReservation) {
      alert("Aucune réservation acceptée pour simuler. Acceptez d'abord une réservation dans l'Espace Pro.");
      return;
    }

    const tableNum = activeReservation.tableNumber || activeReservation.table_id || '?';
    setNotification({
      id: activeReservation.id,
      message: `Retard détecté pour votre réservation (Table ${tableNum}). Annulation automatique dans 10s.`,
      timeout: setTimeout(() => {
        if (onCancelReservation) onCancelReservation(activeReservation);
        setNotification(null);
      }, 10000)
    });
  };

  const handleKeep = () => {
    if (notification) {
      clearTimeout(notification.timeout);
      setNotification(null);
      alert("Réservation maintenue ! Nous vous attendons.");
    }
  };

  const handleCancel = () => {
    if (notification && activeReservation) {
      clearTimeout(notification.timeout);
      if (onCancelReservation) onCancelReservation(activeReservation);
      setNotification(null);
    }
  };

  return (
    <>
      <div className="simulation-controls">
        <button onClick={handleSimulateDelay} className="btn-sim">
          <Timer size={14} />
          Simuler retard (+20min)
        </button>
      </div>

      {notification && (
        <div className="custom-notification">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative' }}>
            <AlertCircle style={{ color: 'var(--accent-gold)', flexShrink: 0 }} size={22} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>Attention — Retard détecté</h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                {notification.message}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleCancel} className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                  Annuler
                </button>
                <button onClick={handleKeep} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                  Je suis en route
                </button>
              </div>
            </div>
            <button
              onClick={() => { clearTimeout(notification.timeout); setNotification(null); }}
              style={{ position: 'absolute', top: 0, right: 0, color: 'var(--text-muted)', padding: '4px' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
