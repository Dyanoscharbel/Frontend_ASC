import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'validator';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Si l'authentification est en cours de chargement, on peut afficher un loader
  if (loading) {
    return <div>Chargement...</div>;
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si un rôle spécifique est requis, vérifier que l'utilisateur a ce rôle
  if (requiredRole && user?.role !== requiredRole) {
    // Rediriger vers la page d'accueil si l'utilisateur n'a pas le rôle requis
    return <Navigate to="/" replace />;
  }

  // Si tout est ok, afficher le contenu protégé
  return <>{children}</>;
}; 