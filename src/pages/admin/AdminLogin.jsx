import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Default admin credentials
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    
    // Simple verification (in a real app, this would query Supabase auth or an admin table)
    if (username.toLowerCase() === 'admin' && password === correctPassword) {
      onLogin(true);
      sessionStorage.setItem('adminUsername', username); // To differentiate users if needed
      navigate('/admin');
    } else {
      setError('Identifiant ou mot de passe incorrect');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="card w-full max-w-md p-8" style={{backgroundColor: '#0d0914', border: '1px solid #333'}}>
        <div className="flex justify-center mb-6 text-purple-500">
          <Lock size={48} />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Connexion Espace Pro</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label className="text-muted block mb-2">Identifiant</label>
            <input 
              type="text" 
              className="form-control w-full bg-black text-white border border-gray-700 p-3 rounded"
              placeholder="Ex: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group mb-6">
            <label className="text-muted block mb-2">Mot de passe</label>
            <input 
              type="password" 
              className="form-control w-full bg-black text-white border border-gray-700 p-3 rounded"
              placeholder="Entrez le mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <button type="submit" className="btn w-full" style={{backgroundColor: '#9d4edd', color: 'white', padding: '12px', fontWeight: 'bold', borderRadius: '8px'}}>
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
