import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRestaurants } from '../../hooks/useRestaurants';
import { useAuth } from '../../context/AuthContext';
import { Settings, Plus, LayoutGrid, Clock, LogOut } from 'lucide-react';
import { toast } from '../../components/Toast';

export default function AdminDashboard() {
  const { signOut, profile, user } = useAuth();
  const { restaurants, loading, addRestaurant } = useRestaurants();
  const [isAdding, setIsAdding] = useState(false);
  const [newRestoName, setNewRestoName] = useState('');

  const handleLogout = async () => {
    await signOut();
    toast.info('Déconnecté de l\'Espace Pro');
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    if (!newRestoName.trim()) return;
    console.log(`Tentative d'ajout du restaurant: ${newRestoName}`);
    try {
      const activeUserId = user?.id || profile?.id || null;
      console.log(`ID Utilisateur utilisé pour insertion: ${activeUserId || 'Aucun (null)'}`);
      const res = await addRestaurant({ 
        name: newRestoName.trim(),
        created_by: activeUserId
      });
      console.log(`Restaurant inséré avec succès: ${JSON.stringify(res)}`);
      setNewRestoName('');
      setIsAdding(false);
      toast.success('Restaurant ajouté avec succès');
    } catch (err) {
      console.error(err);
      console.log(`ERREUR AJOUT: ${err.message || JSON.stringify(err)}`);
      alert('Erreur lors de l\'ajout: ' + (err.message || JSON.stringify(err)));
      toast.error('Erreur lors de l\'ajout du restaurant');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Espace Pro</h2>
          <p className="text-muted mt-1">Bonjour, {profile?.full_name || 'Admin'} • Tableau de bord</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2" style={{ fontSize: '0.9rem' }}>
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </div>


      <div className="card mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl flex items-center gap-2"><LayoutGrid size={20} className="text-gold" /> Mes Restaurants</h3>
          <button onClick={() => setIsAdding(!isAdding)} className="btn btn-primary flex items-center gap-2 text-sm px-4 py-2">
            <Plus size={16} /> Ajouter un restaurant
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddRestaurant} className="flex gap-4 mb-6 p-4 rounded-xl border border-gray-800 bg-gray-900/50">
            <input 
              type="text" 
              placeholder="Nom du nouveau restaurant..." 
              value={newRestoName}
              onChange={e => setNewRestoName(e.target.value)}
              className="flex-1"
              autoFocus
              required
            />
            <button type="submit" className="btn btn-primary">Créer</button>
            <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary">Annuler</button>
          </form>
        )}

        {loading ? (
          <p className="text-muted py-4">Chargement de vos restaurants...</p>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted mb-4">Vous n'avez pas encore de restaurant enregistré.</p>
            <button onClick={() => setIsAdding(true)} className="btn btn-primary">Créer mon premier restaurant</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(resto => (
              <div key={resto.id} className="border p-5 rounded-xl border-gray-800 bg-gray-900/30 hover:border-gold/50 transition-colors flex flex-col">
                <h4 className="font-bold text-lg mb-1">{resto.name}</h4>
                <p className="text-muted text-sm mb-4 flex-1">{resto.cuisine || 'Cuisine non définie'}</p>
                <Link to={`/admin/restaurant/${resto.id}`} className="btn btn-secondary w-full flex items-center justify-center gap-2 text-sm mt-auto border-gray-700 hover:bg-gray-800 hover:text-gold">
                  <Settings size={16} /> Gérer (Menu & Plan)
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card border-gold/20 bg-gold/5">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gold">
          <Clock size={20} /> Simulation (Arrière-plan)
        </h3>
        <p className="text-sm text-gray-300 mb-3">
          La simulation d'annulation automatique après 20 minutes (sans arrivée du client) tourne en arrière-plan via le panneau flottant en bas à gauche de l'écran.
        </p>
      </div>
    </div>
  );
}
