import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, Scale, Megaphone, LogOut, Menu, X, Bell, Settings, User } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmDialog } from '../ui/confirm-dialog';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Détecter si l'écran est mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Vérifier au chargement
    checkIfMobile();
    
    // Vérifier au redimensionnement
    window.addEventListener('resize', checkIfMobile);
    
    // Nettoyer l'event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/admin/dashboard" },
    { title: "Utilisateurs", icon: <Users className="h-5 w-5" />, href: "/admin/users" },
    { title: "Tournois", icon: <Trophy className="h-5 w-5" />, href: "/admin/tournaments" },
    { title: "Litiges", icon: <Scale className="h-5 w-5" />, href: "/admin/disputes" },
    { title: "Communications", icon: <Megaphone className="h-5 w-5" />, href: "/admin/communications" }
  ];

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
      {/* Bouton de menu hamburger (visible uniquement sur mobile) */}
      <button 
        onClick={toggleSidebar} 
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${sidebarOpen ? 'left-[265px]' : 'left-4'}`}
      >
        {sidebarOpen ? 
          <X size={20} className="text-indigo-600" /> : 
          <Menu size={20} className="text-indigo-600" />
        }
      </button>

      {/* Overlay pour fermer la sidebar au clic (sur mobile) */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed h-screen bg-gradient-to-b from-indigo-100 to-indigo-200 shadow-lg transition-all duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMobile ? 'w-[250px]' : 'w-64'} rounded-r-xl overflow-hidden border-r border-indigo-200`}
      >
        {/* Éléments décoratifs plus subtils */}
        <div className="absolute top-40 left-0 w-24 h-24 bg-indigo-300 opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-0 w-24 h-24 bg-indigo-300 opacity-10 rounded-full blur-xl"></div>
        
        <div className="flex w-full flex-col overflow-y-auto h-full">
          <div className="flex h-16 items-center border-b border-indigo-200 px-5">
            <h2 className="text-lg font-semibold text-indigo-800">Admin Panel</h2>
          </div>
          
          {/* Profil utilisateur simplifié */}
          <div className="px-4 py-3">
            <div className="bg-white/60 rounded-lg p-2 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <div className="text-indigo-900 font-medium text-sm">{user?.username || 'Admin'}</div>
                  <div className="text-indigo-600 text-xs">Admin</div>
                </div>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1 px-3 py-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-white text-indigo-700 shadow-sm font-medium"
                      : "text-indigo-700 hover:bg-white/50"
                  }`}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-md ${isActive ? 'bg-indigo-100' : 'bg-transparent'}`}>
                    {item.icon}
                  </div>
                  <span className="ml-3">{item.title}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Bouton de déconnexion simplifié */}
          <div className="px-3 py-4 border-t border-indigo-200 mt-auto">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm transition-all duration-200
                text-red-500 hover:bg-red-50"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-md">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="ml-3">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div 
        className={`flex-1 transition-all duration-300 p-4 md:p-6 ${
          sidebarOpen ? 'md:ml-64' : 'ml-0'
        } bg-gray-50 overflow-y-auto`}
      >
        <Outlet />
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Confirmer la déconnexion"
        description="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmText="Déconnexion"
      />
    </div>
  );
};

export default AdminLayout;
