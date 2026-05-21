import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from './components/Toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRestaurant from './pages/admin/ManageRestaurant';
import SimulationControls from './components/SimulationControls';
import { useReservations } from './hooks/useReservations';
import { useTables } from './hooks/useTables';

function ProtectedAdmin({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#D4AF37' }}>Chargement…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const { reservations, updateReservationStatus } = useReservations('1');
  const { updateTableStatus } = useTables('1');

  const handleCancelReservation = (reservation) => {
    updateReservationStatus(reservation.id, 'cancelled');
    if (reservation.tableId) updateTableStatus(reservation.tableId, true);
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content container mt-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
          <Route path="/admin/restaurant/:id" element={<ProtectedAdmin><ManageRestaurant /></ProtectedAdmin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SimulationControls reservations={reservations} onCancelReservation={handleCancelReservation} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer />
    </AuthProvider>
  );
}
