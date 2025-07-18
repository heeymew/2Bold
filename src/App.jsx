import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProviderWrapper, useAuth } from './contexts/AuthContext';

/* Pages */
import Home from './pages/Home';
import BemEspecialLogin from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SingleProduct from './pages/SingleProduct';
import ProductListPage from './pages/ProductListPage';
import MyPointsPage from './pages/MyPointsPage';
import VouchersPage from './pages/VouchersPage';

import './styles/global.scss';
import './styles/main.scss';
import './App.css';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const PrivateRoute = ({ element }) => {
  const { user, loading, isFullyAuthenticated } = useAuth();
    
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Carregando...</span>
      </div>
    );
  }
  
  // Verificação de autenticação completa - usuário deve estar totalmente autenticado
  const isAuthenticated = user && user.idparticipante && isFullyAuthenticated;
  
  // Se o usuário está autenticado
  if (isAuthenticated) {
    return element;
  }
  
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { user, logout, isFullyAuthenticated } = useAuth();
  const isAuthenticated = user && user.idparticipante && isFullyAuthenticated;

  const handleLogout = () => {
    logout();
  };

  return (
    <main className="main-content" id="main-content" role="main" tabIndex="-1">
      
      <Routes>
        <Route 
          path="/" 
          element={<PrivateRoute element={<Home onLogout={handleLogout} />} />} 
        />
        <Route 
          path="/login" 
          element={
            isAuthenticated 
              ? <Navigate to="/" replace /> 
              : <BemEspecialLogin />
          } 
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route 
          path="/meus-pontos" 
          element={<PrivateRoute element={<MyPointsPage />} />} 
        />
        <Route 
          path="/vouchers" 
          element={<PrivateRoute element={<VouchersPage />} />} 
        />
        <Route 
          path="/produto/:nome" 
          element={<PrivateRoute element={<SingleProduct />} />} 
        />
        <Route 
          path="/resgatar" 
          element={<PrivateRoute element={<ProductListPage />} />} 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </main>
  );
};

const App = () => {
  return (
    <AuthProviderWrapper>
      <Router>
        {/* Skip link para acessibilidade */}
        <a 
          href="#main-content" 
          id="skip-link"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:border-2 focus:border-black focus:rounded"
        >
          Pular para o conteúdo principal
        </a>
        <AppRoutes />
      </Router>
    </AuthProviderWrapper>
  );
};

export default App;
