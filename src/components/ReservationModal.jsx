import { useState, useEffect } from 'react';
import { X, CheckCircle2, User, Phone, Clock, Users } from 'lucide-react';
import './ReservationModal.css';

export default function ReservationModal({ isOpen, onClose, selectedTable, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    time: '',
    guests: 2
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset form when a new table is selected
  useEffect(() => {
    if (isOpen && selectedTable) {
      setFormData({
        name: '',
        phone: '',
        time: '',
        guests: selectedTable.capacity || 2
      });
      setIsSubmitted(false);
    }
  }, [isOpen, selectedTable]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content card">
        <button className="modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        {isSubmitted ? (
          <div className="modal-success flex flex-col items-center justify-center">
            <CheckCircle2 size={64} className="text-green mb-4" style={{ color: '#10B981' }} />
            <h3 className="text-center text-xl font-bold mb-2">Demande envoyée !</h3>
            <p className="text-center text-muted">L'administrateur va valider votre réservation en temps réel.</p>
          </div>
        ) : (
          <>
            <div className="modal-header mb-6">
              <h3 className="text-xl font-bold">
                Réserver — Table {selectedTable?.number}
              </h3>
              {selectedTable?.isVip && (
                <span className="vip-badge">VIP</span>
              )}
              <p className="text-muted mt-1 text-sm">Capacité : {selectedTable?.capacity} personnes</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-field">
                <label className="field-label">
                  <User size={14} /> Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Jean Dupont"
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Phone size={14} /> Numéro de téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-field" style={{ flex: 1 }}>
                  <label className="field-label">
                    <Clock size={14} /> Heure d'arrivée
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field" style={{ flex: 1 }}>
                  <label className="field-label">
                    <Users size={14} /> Nb de personnes
                  </label>
                  <input
                    type="number"
                    name="guests"
                    min="1"
                    max={selectedTable?.capacity || 10}
                    value={formData.guests}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary mt-2 w-full" style={{ width: '100%' }}>
                Confirmer la demande
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
