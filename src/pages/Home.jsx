import { Link } from 'react-router-dom';
import { Star, MapPin, Search } from 'lucide-react';
import { useRestaurants } from '../hooks/useRestaurants';
import './Home.css';

export default function Home() {
  const { restaurants, loading } = useRestaurants();

  return (
    <div className="home-page">
      <section className="hero-section flex flex-col items-center justify-center text-center animate-fade-in">
        <h1 className="hero-title">Réservez la table parfaite.</h1>
        <p className="hero-subtitle text-muted">Découvrez les meilleurs restaurants et assurez votre place en quelques clics.</p>
        <div className="hero-search mt-8 w-full max-w-2xl flex gap-2">
            <input 
              type="text" 
              placeholder="Rechercher par nom, cuisine ou lieu..." 
              className="flex-1 p-4 rounded-lg bg-black text-white border border-gray-700"
              style={{ fontSize: '1.1rem' }}
            />
            <button className="btn btn-primary px-8" style={{ fontSize: '1.1rem' }}>
              <Search size={20} />
            </button>
        </div>
      </section>

      <section className="featured-section mt-12 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="section-title text-2xl font-bold">Restaurants à la une</h2>
        </div>
        
        {loading ? (
          <div className="text-center text-muted py-12">Chargement des restaurants...</div>
        ) : restaurants.length === 0 ? (
          <div className="text-center text-muted py-12">Aucun restaurant trouvé.</div>
        ) : (
          <div className="restaurant-grid">
            {restaurants.map(restaurant => (
              <Link to={`/restaurant/${restaurant.id}`} key={restaurant.id} className="restaurant-card card p-0 overflow-hidden">
                <div className="card-image-wrapper relative" style={{ height: 200 }}>
                  <img 
                    src={restaurant.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800&h=500"} 
                    alt={restaurant.name} 
                    className="card-image w-full h-full object-cover" 
                  />
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Star size={14} className="text-gold" fill="var(--accent-gold)" />
                    <span>{restaurant.rating || "N/A"}</span>
                  </div>
                </div>
                <div className="card-content p-5">
                  <h3 className="card-title text-xl font-bold mb-1">{restaurant.name}</h3>
                  <p className="card-cuisine text-gold text-sm font-medium">{restaurant.cuisine || "Cuisine variée"}</p>
                  <div className="card-meta flex items-center gap-4 mt-4 text-muted text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{restaurant.location || "Non renseigné"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
