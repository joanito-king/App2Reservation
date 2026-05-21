import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';
import './Login.css';

const phoneRegex = /^(\+?[\d\s\-()]{8,15})$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '', adminSecret: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Nom requis';
    if (!emailRegex.test(form.email)) e.email = 'Email invalide';
    if (form.phone && !phoneRegex.test(form.phone)) e.phone = 'Numéro invalide';
    if (form.password.length < 6) e.password = 'Minimum 6 caractères';
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp({ fullName: form.fullName, email: form.email, phone: form.phone || null, password: form.password, adminSecret: form.adminSecret });
      toast.success('Compte créé ! Vérifiez votre email pour confirmer.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card relative" style={{ maxWidth: 480 }}>
        <Link to="/" className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors" title="Retour à l'accueil">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </Link>
        <div className="auth-logo">
          <Flame size={32} />
          <span>VÉLA</span>
        </div>
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">Rejoignez VÉLA et réservez partout</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label><User size={14} /> Prénom et Nom</label>
            <input type="text" placeholder="Jean Dupont" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          <div className="auth-field">
            <label><Mail size={14} /> Adresse email *</label>
            <input type="email" placeholder="votre@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label><Phone size={14} /> Téléphone (optionnel)</label>
            <input type="tel" placeholder="+33 6 12 34 56 78" value={form.phone} onChange={e => set('phone', e.target.value)} />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="auth-field">
            <label><Lock size={14} /> Mot de passe</label>
            <div className="password-wrapper">
              <input type={showPwd ? 'text' : 'password'} placeholder="Min. 6 caractères" value={form.password} onChange={e => set('password', e.target.value)} required />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="auth-field">
            <label><Lock size={14} /> Confirmer le mot de passe</label>
            <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.confirm} onChange={e => set('confirm', e.target.value)} required />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>

          <div className="auth-divider">accès professionnel</div>

          <div className="auth-field">
            <label><ShieldCheck size={14} /> Code Admin (si applicable)</label>
            <div className="password-wrapper">
              <input type={showSecret ? 'text' : 'password'} placeholder="Laisser vide pour compte client" value={form.adminSecret} onChange={e => set('adminSecret', e.target.value)} />
              <button type="button" className="pwd-toggle" onClick={() => setShowSecret(v => !v)}>
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>

      <style>{`.field-error { color: #EF4444; font-size: 0.78rem; margin-top: 3px; display: block; }`}</style>
    </div>
  );
}
