import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Phone, Globe, Info, Menu as MenuIcon, LayoutGrid, X } from 'lucide-react';
import TableMap from '../components/TableMap';
import ReservationModal from '../components/ReservationModal';
import { useTables } from '../hooks/useTables';
import { useReservations } from '../hooks/useReservations';
import { useRestaurant } from '../hooks/useRestaurants';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';

export default function RestaurantDetails() {
  const { id } = useParams();
  const { restaurant, loading: loadingRestaurant } = useRestaurant(id);
  const { tables, updateTableStatus } = useTables(id);
  const { addReservation } = useReservations(id);
  const { user } = useAuth();
  
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuPreviewOpen, setIsMenuPreviewOpen] = useState(false);
  const [isMenuZoomed, setIsMenuZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'plan', 'about'

  const handleSelectTable = (tableId) => {
    setSelectedTableId(tableId);
    setIsModalOpen(true);
  };

  const closeMenuPreview = () => {
    setIsMenuPreviewOpen(false);
    setIsMenuZoomed(false);
  };

  const toggleMenuZoom = () => {
    setIsMenuZoomed((prev) => !prev);
  };

  const handleConfirmReservation = async (formData) => {
    const selectedTable = tables?.find(t => t.id === selectedTableId);
    if (!selectedTable) return;
    
    try {
      await addReservation({
        restaurantId: id,
        restaurantName: restaurant?.name,
        tableId: selectedTable.id,
        tableNumber: selectedTable.number,
        userId: user?.id,
        ...formData
      });

      updateTableStatus(selectedTable.id, false);
      setSelectedTableId(null);
    } catch (err) {
      toast.error("Erreur lors de la réservation");
    }
  };

  const selectedTable = tables?.find(t => t.id === selectedTableId);

  if (loadingRestaurant) return <div className="text-center py-12 text-gold">Chargement du restaurant...</div>;
  if (!restaurant) return <div className="text-center py-12 text-muted">Restaurant introuvable.</div>;

  return (
    <div className="restaurant-details pb-12">
      <div className="mb-4">
        <button 
          onClick={() => window.history.back()} 
          className="btn btn-secondary flex items-center gap-2 px-4 py-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Retour
        </button>
      </div>

      {/* Hero Section */}
      <div className="restaurant-hero">
        <img 
          src={restaurant.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200"} 
          alt={restaurant.name} 
          className="restaurant-hero-img"
        />
        <div className="restaurant-hero-content">
          <h1 className="restaurant-hero-title">{restaurant.name}</h1>
          <p className="restaurant-hero-cuisine">{restaurant.cuisine}</p>
          <div className="restaurant-hero-meta">
            {restaurant.location && <span className="flex items-center gap-2"><MapPin size={16}/> {restaurant.location}</span>}
            {restaurant.opening_hours && <span className="flex items-center gap-2"><Clock size={16}/> {restaurant.opening_hours}</span>}
            {restaurant.rating && <span className="flex items-center gap-2 font-semibold text-white bg-gold/25 px-3 py-1 rounded-full backdrop-blur-sm">⭐ {restaurant.rating}</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container hide-scrollbar">
        <button 
          className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          <MenuIcon size={18} /> Menu
        </button>
        <button 
          className={`tab-button ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('plan')}
        >
          <LayoutGrid size={18} /> Plan de salle & Réservation
        </button>
        <button 
          className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          <Info size={18} /> À propos
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content space-y-10 animate-fade-in">
        {activeTab === 'menu' && (
          <div className="menu-section animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Notre Carte</h2>
            {restaurant.menu_image_url ? (
              <div className="menu-image-container">
                <button
                  type="button"
                  className="menu-image-zoom-button"
                  onClick={() => setIsMenuPreviewOpen(true)}
                >
                  Agrandir
                </button>
                <img
                  src={restaurant.menu_image_url}
                  alt={`Carte de ${restaurant.name}`}
                  className="menu-image"
                  onClick={() => setIsMenuPreviewOpen(true)}
                  style={{ cursor: 'zoom-in' }}
                />
              </div>
            ) : (
              <div className="py-16 rounded-3xl border border-dashed border-gray-700 bg-black/20 text-center">
                <p className="text-muted">Le menu n'est pas encore disponible. Importez une image de carte depuis l'administration.</p>
              </div>
            )}
            <div className="mt-8 text-center">
              <button className="btn btn-primary px-8 py-3" onClick={() => setActiveTab('plan')}>
                Voir le plan de salle
              </button>
            </div>

            {isMenuPreviewOpen && restaurant.menu_image_url && (
              <div className="image-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeMenuPreview()}>
                <div className="image-modal-content">
                  <button className="modal-close" onClick={closeMenuPreview}>
                    <X size={22} />
                  </button>
                  <img
                    src={restaurant.menu_image_url}
                    alt={`Carte agrandie de ${restaurant.name}`}
                    className={`menu-image-expanded${isMenuZoomed ? ' zoomed' : ''}`}
                    onClick={toggleMenuZoom}
                    style={{ cursor: isMenuZoomed ? 'zoom-out' : 'zoom-in' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="plan-section animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Sélectionnez une table</h2>
              <span className="text-sm text-muted">Cliquez sur une table libre pour réserver</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 2rem' }}>
              <TableMap 
                mode="client" 
                tables={tables} 
                onSelectTable={handleSelectTable}
                selectedTableId={selectedTableId}
              />
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="about-section animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">À propos de {restaurant.name}</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                {restaurant.description || "Aucune description fournie pour le moment."}
              </p>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 h-fit">
              <h3 className="font-bold text-lg mb-4 text-gold">Informations pratiques</h3>
              <ul className="space-y-4 text-sm">
                {restaurant.location && (
                  <li className="flex items-start gap-3">
                    <MapPin className="text-gray-500 mt-0.5 shrink-0" size={18} />
                    <span>{restaurant.location}</span>
                  </li>
                )}
                {restaurant.opening_hours && (
                  <li className="flex items-start gap-3">
                    <Clock className="text-gray-500 mt-0.5 shrink-0" size={18} />
                    <span className="whitespace-pre-line">{restaurant.opening_hours}</span>
                  </li>
                )}
                {restaurant.phone && (
                  <li className="flex items-start gap-3">
                    <Phone className="text-gray-500 mt-0.5 shrink-0" size={18} />
                    <a href={`tel:${restaurant.phone}`} className="hover:text-gold transition-colors">{restaurant.phone}</a>
                  </li>
                )}
                {restaurant.website_url && (
                  <li className="flex items-start gap-3">
                    <Globe className="text-gray-500 mt-0.5 shrink-0" size={18} />
                    <a href={restaurant.website_url} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                      Visiter le site web
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      <ReservationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTable={selectedTable}
        onSubmit={handleConfirmReservation}
      />
    </div>
  );
}
