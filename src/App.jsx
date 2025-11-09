import { useState, useEffect } from 'react';
import Toast from './components/Toast';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import StockMovement from './components/StockMovement';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import { isAuthenticated, getCurrentUser } from './utils/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const init = async () => {
      const auth = isAuthenticated();
      setIsLoggedIn(auth);
      if (auth) {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        } else {
          // Token invalide: forcer la déconnexion propre et retour à la connexion
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
          setIsLoggedIn(false);
          setAuthMode('login');
          setCurrentPage('dashboard');
          if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new CustomEvent('toast:show', { detail: { type: 'error', message: 'Session expirée ou invalide, veuillez vous reconnecter.', duration: 4500 } }));
          }
        }
      }
    };
    init();
    // Écoute l’invalidation d’auth pour retourner à la connexion
    const onAuthInvalid = () => {
      setCurrentUser(null);
      setIsLoggedIn(false);
      setAuthMode('login');
      setCurrentPage('dashboard');
    };
    window.addEventListener('auth:invalid', onAuthInvalid);
    const onToastShow = (e) => {
      const { message, type = 'error', duration = 4000 } = e.detail || {};
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };
    window.addEventListener('toast:show', onToastShow);
    return () => {
      window.removeEventListener('auth:invalid', onAuthInvalid);
      window.removeEventListener('toast:show', onToastShow);
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggedIn(true);
    const user = await getCurrentUser();
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManagement />;
      case 'stock':
        return <StockMovement />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return authMode === 'login' ? (
      <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <Register onRegister={handleLogin} onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toast toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onLogout={handleLogout} 
        isAdmin={currentUser?.role === 'admin'}
      />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
