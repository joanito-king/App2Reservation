import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TableMap from '../../components/TableMap';
import { useTables } from '../../hooks/useTables';
import { useRestaurant } from '../../hooks/useRestaurants';
import { useReservations } from '../../hooks/useReservations';
import { Save, RefreshCw, Upload, ArrowLeft, Trash2, Check, X } from 'lucide-react';
import { toast } from '../../components/Toast';
import { supabase } from '../../lib/supabaseClient';

export default function ManageRestaurant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('infos'); // infos, menu, plan, reservations
  
  // Hooks
  const { restaurant, loading: loadingResto, setRestaurant } = useRestaurant(id);
  const { tables, updateTables, updateTableStatus, saveTablesToDb, resetToDefaultLayout } = useTables(id);
  const { reservations, updateReservationStatus } = useReservations(id);

  // States for Plan de Salle
  const [selectedTableId, setSelectedTableId] = useState(null);
  const selectedTable = tables.find(t => t.id === selectedTableId);
  
  // States for Menu Image import
  const [menuCardPhoto, setMenuCardPhoto] = useState(null);
  const [menuCardPreview, setMenuCardPreview] = useState(null);
  const menuCardInputRef = useRef(null);
  const importPlanInputRef = useRef(null);

  // States for Infos
  const [infoForm, setInfoForm] = useState({});
  const [isSavingInfos, setIsSavingInfos] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');
  const coverInputRef = useRef(null);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCoverPreview(URL.createObjectURL(file));
    setIsUploadingCover(true);
    try {
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/\s+/g, '_')}`;
      const { error } = await supabase.storage.from('restaurant-images').upload(filename, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('restaurant-images').getPublicUrl(filename);
      if (!data?.publicUrl) throw new Error('URL publique introuvable');
      setInfoForm(prev => ({ ...prev, image_url: data.publicUrl }));
      setCoverPreview('');
      toast.success('Fichier importé ! Cliquez sur Enregistrer pour valider.');
    } catch (err) {
      console.error('handleCoverUpload error:', err);
      const message = err?.message || err?.error || err?.hint || JSON.stringify(err);
      toast.error("Erreur d'importation : " + (message || 'Échec de l’upload.')); 
    } finally {
      setIsUploadingCover(false);
    }
  };

  useEffect(() => {
    if (restaurant) setInfoForm(restaurant);
  }, [restaurant]);

  // --- Handlers: Infos ---
  const handleSaveInfos = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsSavingInfos(true);
    try {
      const { id: _, created_at, created_by, ...updates } = infoForm;
      const { error } = await supabase.from('restaurants').update(updates).eq('id', id);
      if (error) throw error;
      setRestaurant({ ...restaurant, ...updates });
      toast.success('Informations mises à jour !');
    } catch (err) {
      console.error('handleSaveInfos error:', err);
      const message = err?.message || err?.error || err?.hint || JSON.stringify(err);
      toast.error('Erreur lors de la mise à jour: ' + message);
    } finally {
      setIsSavingInfos(false);
    }
  };

  // --- Handlers: Plan de Salle ---
  const handleSavePlan = async () => {
    try {
      await saveTablesToDb(tables);
      toast.success('Plan de salle enregistré en base !');
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement : ' + err.message);
    }
  };

  const handleToggleStatus = () => {
    if (selectedTableId) {
      const table = tables.find(t => t.id === selectedTableId);
      updateTableStatus(selectedTableId, !table.isAvailable);
      toast.success(`Table ${table.number} marquée comme ${!table.isAvailable ? 'Disponible' : 'Occupée'}`);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedTableId) {
      updateTables(tables.filter(t => t.id !== selectedTableId));
      setSelectedTableId(null);
      toast.success('Table supprimée');
    }
  };

  // --- Handlers: Menu ---
  const handleMenuCardSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMenuCardPhoto(file);
    setMenuCardPreview(URL.createObjectURL(file));

    try {
      const filename = `menu-${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/\s+/g, '_')}`;
      const { error } = await supabase.storage.from('restaurant-images').upload(filename, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('restaurant-images').getPublicUrl(filename);
      if (!data?.publicUrl) throw new Error('URL publique introuvable');
      setInfoForm(prev => ({ ...prev, menu_image_url: data.publicUrl }));
      toast.success('Fichier importé ! Cliquez sur Enregistrer pour valider.');
    } catch (err) {
      console.error('handleMenuCardSelect error:', err);
      const message = err?.message || err?.error || err?.hint || JSON.stringify(err);
      toast.error('Impossible d’importer le fichier du menu : ' + message);
    }
  };

  const handleImportPlan = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error('Fichier JSON invalide. Attendu un tableau de tables.');
        const normalized = parsed.map((t, i) => ({
          id: t.id?.toString() || `import-${Date.now()}-${i}`,
          number: t.number || i + 1,
          label: t.label ?? t.text ?? t.name ?? t.id?.toString?.() ?? (t.number ?? i + 1).toString(),
          x: Number(t.x) || 0,
          y: Number(t.y) || 0,
          width: t.width ? Number(t.width) : 5,
          height: t.height ? Number(t.height) : 3,
          capacity: Number(t.capacity) || 2,
          isAvailable: t.isAvailable !== undefined ? Boolean(t.isAvailable) : true,
          shape: t.shape || 'shape-sq',
          isVip: Boolean(t.isVip),
          rotation: Number(t.rotation) || 0
        }));
        updateTables(normalized);
        toast.success('Plan importé avec succès. Les interactions restent actives.');
      } catch (err) {
        toast.error('Impossible d’importer le plan : ' + err.message);
      }
    };
    reader.onerror = () => toast.error('Erreur de lecture du fichier.');
    reader.readAsText(file);
  };


  // --- Handlers: Reservations ---
  const pendingCount = reservations.filter(r => r.status === 'pending').length;

  if (loadingResto) return <div className="text-center py-12">Chargement...</div>;
  if (!restaurant) return <div className="text-center py-12">Restaurant introuvable</div>;

  return (
    <div className="manage-restaurant pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin')} className="btn btn-secondary flex items-center justify-center" style={{ borderRadius: '50%', minWidth: '40px', width: '40px', height: '40px', padding: 0 }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            {restaurant.name}
            {pendingCount > 0 && (
              <span className="bg-red-500/20 text-red-500 text-sm px-3 py-1 rounded-full border border-red-500/30">
                {pendingCount} résa. en attente
              </span>
            )}
          </h2>
          <p className="text-muted">Gestion complète du restaurant</p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="tabs-container hide-scrollbar">
        <button className={`tab-button ${activeTab === 'infos' ? 'active' : ''}`} onClick={() => setActiveTab('infos')}>Informations</button>
        <button className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>Carte & Menu</button>
        <button className={`tab-button ${activeTab === 'plan' ? 'active' : ''}`} onClick={() => setActiveTab('plan')}>Plan de Salle</button>
        <button className={`tab-button ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')}>Réservations {pendingCount > 0 && `(${pendingCount})`}</button>
      </div>

      {/* TAB: INFOS */}
      {activeTab === 'infos' && (
        <div className="max-w-2xl mx-auto card p-8 border-gray-800 bg-gray-900/40">
          <h3 className="text-xl font-bold mb-6">Informations Publiques</h3>
          <form onSubmit={handleSaveInfos} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nom du restaurant</label>
                <input type="text" value={infoForm.name || ''} onChange={e => setInfoForm({...infoForm, name: e.target.value})} required className="bg-black/50 border-gray-800 focus:border-gold w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type de cuisine</label>
                <input type="text" value={infoForm.cuisine || ''} onChange={e => setInfoForm({...infoForm, cuisine: e.target.value})} className="bg-black/50 border-gray-800 focus:border-gold w-full" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea value={infoForm.description || ''} onChange={e => setInfoForm({...infoForm, description: e.target.value})} rows={4} className="bg-black/50 border-gray-800 focus:border-gold w-full resize-none" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Adresse</label>
                <input type="text" value={infoForm.location || ''} onChange={e => setInfoForm({...infoForm, location: e.target.value})} className="bg-black/50 border-gray-800 focus:border-gold w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
                <input type="tel" value={infoForm.phone || ''} onChange={e => setInfoForm({...infoForm, phone: e.target.value})} className="bg-black/50 border-gray-800 focus:border-gold w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Horaires</label>
                <input type="text" value={infoForm.opening_hours || ''} onChange={e => setInfoForm({...infoForm, opening_hours: e.target.value})} placeholder="ex: 12h-14h30 | 19h-23h" className="bg-black/50 border-gray-800 focus:border-gold w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Site Web (URL)</label>
                <input type="url" value={infoForm.website_url || ''} onChange={e => setInfoForm({...infoForm, website_url: e.target.value})} className="bg-black/50 border-gray-800 focus:border-gold w-full" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Image de couverture</label>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <input type="text" placeholder="URL de l'image ou importez-en une" value={infoForm.image_url || ''} onChange={e => setInfoForm({...infoForm, image_url: e.target.value})} className="bg-black/50 border-gray-800 focus:border-gold flex-1" />
                <div className="flex gap-3 flex-wrap">
                  <button 
                    type="button" 
                    onClick={() => coverInputRef.current?.click()} 
                    disabled={isUploadingCover}
                    className="btn btn-secondary border-gray-700 flex items-center gap-2 whitespace-nowrap"
                    style={{ height: '42px', fontSize: '0.85rem' }}
                  >
                    <Upload size={16} />
                    {isUploadingCover ? 'Envoi...' : 'Uploader'}
                  </button>
                  <input type="file" accept="*/*" ref={coverInputRef} onChange={handleCoverUpload} className="hidden" />
                </div>
              </div>
              {(coverPreview || infoForm.image_url) && (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-800 relative group max-h-[260px]">
                  <img src={coverPreview || infoForm.image_url} alt="Preview" className="w-full h-full object-cover max-h-[260px]" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => coverInputRef.current?.click()}>
                    <span className="text-white text-sm font-medium flex items-center gap-2 bg-black/60 px-4 py-2 rounded-lg border border-white/20">
                      <Upload size={16} /> Changer l'image
                    </span>
                  </div>
                </div>
              )}
              {coverPreview && (
                <p className="text-xs text-gray-400 mt-2">Aperçu local seulement. L'image sera enregistrée après upload réussi et sauvegarde.</p>
              )}
            </div>

            <button type="submit" disabled={isSavingInfos} className="btn btn-primary mt-4 w-full justify-center">
              {isSavingInfos ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>
      )}

      {/* TAB: MENU */}
      {activeTab === 'menu' && (
        <div className="animate-fade-in">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold">Gestion de la Carte</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-2xl">
                Importez l'image de votre carte / menu. L'image sera affichée directement dans la page restaurant.
              </p>
            </div>
          </div>

          <div className="card p-5 border-gray-800 bg-gray-900/50 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-stretch">
              <div
                className="min-h-[220px] rounded-3xl border border-dashed border-gray-700 bg-black/20 flex items-center justify-center text-center p-4 cursor-pointer hover:border-gold/70 transition-colors overflow-hidden"
                onClick={() => menuCardInputRef.current?.click()}
              >
                {menuCardPreview || infoForm.menu_image_url ? (
                  <img
                    src={menuCardPreview || infoForm.menu_image_url}
                    alt="Aperçu du menu"
                    className="w-full h-full object-cover rounded-3xl max-h-[320px]"
                  />
                ) : (
                  <div className="text-gray-300">
                    <p className="font-semibold text-white mb-2">Importer l'image de votre carte</p>
                    <p className="text-sm">JPG, PNG ou WEBP (affichage rapide)</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between gap-4 flex-1">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Menu en image</p>
                  <button
                    type="button"
                    onClick={() => menuCardInputRef.current?.click()}
                    className="btn btn-secondary border-gray-700 px-4 py-3 text-sm"
                  >
                    <Upload size={16} /> Sélectionner une image
                  </button>
                  <input
                    type="file"
                    accept="*/*"
                    ref={menuCardInputRef}
                    onChange={handleMenuCardSelect}
                    className="hidden"
                  />
                </div>
                {(menuCardPreview || infoForm.menu_image_url) && (
                  <div className="rounded-2xl bg-white/5 border border-gray-800 p-4 text-sm text-gray-300">
                    Image prête. Cliquez sur Enregistrer pour la garder sur le restaurant.
                  </div>
                )}
                <button
                  onClick={handleSaveInfos}
                  type="button"
                  className="btn btn-primary w-full py-3"
                >
                  Enregistrer la carte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PLAN DE SALLE */}
      {activeTab === 'plan' && (
        <div className="animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
            <div>
              <h3 className="text-xl font-bold">Éditeur de Plan de Salle</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-2xl">Importer un plan JSON permet de retrouver les mêmes tables, et toutes les actions restent fonctionnelles.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-secondary flex items-center gap-2 text-sm px-4" onClick={() => importPlanInputRef.current?.click()}>
                <Upload size={16} /> Importer un plan
              </button>
              <button className="btn btn-secondary flex items-center gap-2 text-sm px-4" onClick={async () => {
                if (window.confirm("Réinitialiser avec le plan premium par défaut ?")) {
                  await resetToDefaultLayout();
                  toast.success("Plan réinitialisé");
                }
              }}>
                <RefreshCw size={16} /> Réinitialiser
              </button>
              <button className="btn btn-primary flex items-center gap-2 text-sm px-4" onClick={handleSavePlan}>
                <Save size={16} /> Enregistrer le plan
              </button>
            </div>
          </div>
          <input type="file" accept="application/json" ref={importPlanInputRef} onChange={handleImportPlan} className="hidden" />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="card p-0 overflow-hidden border-gray-800" style={{backgroundColor: '#0a0a0a'}}>
                <TableMap mode="admin" tables={tables} onUpdateTables={updateTables} onSelectTable={setSelectedTableId} selectedTableId={selectedTableId} />
              </div>
            </div>

            <div>
              <div className="card border-gray-800 bg-gray-900/40">
                <h3 className="font-bold text-lg mb-4 text-gold border-b border-gray-800 pb-2">Propriétés de la Table</h3>
                {selectedTableId ? (
                  <div className="flex flex-col gap-4">
                    <p className="flex justify-between items-center">
                      <span className="text-gray-400">Table N°</span>
                      <strong className="text-xl">{tables.find(t => t.id === selectedTableId)?.number}</strong>
                    </p>
                    
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Texte affiché sur la table</label>
                      <input
                        type="text"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg p-2.5 text-white"
                        value={selectedTable?.label ?? String(selectedTable?.number ?? '')}
                        onChange={(e) => {
                          updateTables(tables.map(t => t.id === selectedTableId ? { ...t, label: e.target.value } : t));
                        }}
                        placeholder="Ex: Table 7, A7, VIP"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Forme de la table</label>
                      <select 
                          className="w-full bg-black/50 border border-gray-700 rounded-lg p-2.5 text-white focus:border-gold outline-none"
                          value={selectedTable?.shape || 'shape-sq'}
                          onChange={(e) => {
                            updateTables(tables.map(t => t.id === selectedTableId ? { ...t, shape: e.target.value } : t));
                          }}
                        >
                        <option value="shape-sq">Carré (2-4 pers)</option>
                        <option value="shape-round">Ronde (2-4 pers)</option>
                        <option value="shape-h">Rectangle Horizontal</option>
                        <option value="shape-v">Rectangle Vertical</option>
                        <option value="shape-wide-h">Grand Rectangle (Horizontal)</option>
                        <option value="shape-wide-v">Grand Rectangle (Vertical)</option>
                        <option value="shape-oval">Ovale</option>
                        <option value="shape-l">En forme de L</option>
                        <option value="shape-u">En forme de U</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Largeur (%)</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="3"
                            max="40"
                            value={selectedTable?.width || 8}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              updateTables(tables.map(t => t.id === selectedTableId ? { ...t, width: value } : t));
                            }}
                          />
                          <span className="text-sm text-white/80 w-12 text-right">{selectedTable?.width || 8}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Hauteur (%)</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="3"
                            max="40"
                            value={selectedTable?.height || 8}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              updateTables(tables.map(t => t.id === selectedTableId ? { ...t, height: value } : t));
                            }}
                          />
                          <span className="text-sm text-white/80 w-12 text-right">{selectedTable?.height || 8}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Capacité (personnes)</label>
                      <input 
                        type="number" min="1" max="20"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg p-2.5 text-white"
                        value={selectedTable?.capacity || 2}
                        onChange={(e) => {
                          updateTables(tables.map(t => t.id === selectedTableId ? { ...t, capacity: parseInt(e.target.value) || 1 } : t));
                        }}
                      />
                    </div>

                    <p className="text-xs text-gray-500">Sélectionnez une table, puis changez sa forme, largeur et hauteur pour personnaliser le plan.</p>

                    <button 
                      className={`btn w-full mt-2 justify-center py-2.5 ${tables.find(t => t.id === selectedTableId)?.isVip ? 'bg-gold/20 text-gold border border-gold/40' : 'btn-secondary border-gray-700'}`}
                      onClick={() => updateTables(tables.map(t => t.id === selectedTableId ? { ...t, isVip: !t.isVip } : t))}
                    >
                      {tables.find(t => t.id === selectedTableId)?.isVip ? '★ Zone VIP Activée' : 'Définir comme VIP'}
                    </button>

                    <button className="btn btn-secondary w-full border-gray-700 justify-center py-2.5" onClick={() => updateTables(tables.map(t => t.id === selectedTableId ? { ...t, rotation: ((t.rotation || 0) + 90) % 360 } : t))}>
                      Tourner 90° {selectedTable?.rotation ? `${selectedTable.rotation}°` : ''}
                    </button>

                    <button className="btn btn-secondary w-full border-gray-700 justify-center py-2.5" onClick={handleToggleStatus}>
                      Marquer {tables.find(t => t.id === selectedTableId)?.isAvailable ? 'Occupée (Rouge)' : 'Libre (Vert)'}
                    </button>
                    
                    <button className="btn btn-secondary w-full mt-2 border-red-900/50 text-red-500 hover:bg-red-500/10 justify-center py-2.5" onClick={handleDeleteSelected}>
                      <Trash2 size={16} /> Supprimer la table
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Cliquez sur une table pour modifier ses propriétés (forme, capacité, statut VIP).</p>
                    <p className="mt-4 text-xs">Cliquez sur le fond pour ajouter une nouvelle table.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: RESERVATIONS */}
      {activeTab === 'reservations' && (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Gestion des Réservations</h3>
          </div>

          {reservations.length === 0 ? (
            <div className="card text-center py-12 text-gray-500 border-dashed border-2 border-gray-800">
              Aucune réservation pour ce restaurant.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reservations.map(res => (
                <div key={res.id} className={`card p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 ${
                  res.status === 'pending' ? 'border-l-gold bg-gold/5' : 
                  res.status === 'accepted' ? 'border-l-green-500 bg-gray-900/30' : 
                  'border-l-red-500 bg-gray-900/10 opacity-70'
                } border-y-gray-800 border-r-gray-800`}>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-lg">{res.customerName || 'Client Inconnu'}</h4>
                      {res.status === 'pending' && <span className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider">En attente</span>}
                      {res.status === 'accepted' && <span className="bg-green-500/20 text-green-500 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider">Confirmée</span>}
                      {res.status === 'cancelled' && <span className="bg-red-500/20 text-red-500 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider">Annulée</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-2">
                      <span className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded text-white">Table {res.tableNumber || '—'}</span>
                      <span>{res.guests} personnes</span>
                      {res.time && <span>Heure : <strong className="text-white">{res.time}</strong></span>}
                      {res.phone && <span>Tél : {res.phone}</span>}
                    </div>
                  </div>

                  {res.status === 'pending' && (
                    <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                      <button 
                        onClick={() => {
                          updateReservationStatus(res.id, 'accepted');
                          toast.success('Réservation confirmée');
                        }}
                        className="btn flex-1 md:flex-none justify-center bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/30"
                      >
                        <Check size={18} /> Accepter
                      </button>
                      <button 
                        onClick={() => {
                          updateReservationStatus(res.id, 'cancelled');
                          if (res.tableId) updateTableStatus(res.tableId, true);
                          toast.error('Réservation refusée/annulée');
                        }}
                        className="btn flex-1 md:flex-none justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30"
                      >
                        <X size={18} /> Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
