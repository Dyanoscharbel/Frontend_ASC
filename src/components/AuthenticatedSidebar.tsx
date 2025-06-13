import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Trophy, User, BarChart2, AlertTriangle, Gift, Users, LineChart, Shield, Menu, LogOut, X } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ConfirmDialog } from "./ui/confirm-dialog";

export function AuthenticatedSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Vérifier au chargement
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { title: "Tableau de bord", icon: <BarChart2 className="h-5 w-5" />, href: "/dashboard" },
    { title: "Mon Profil", icon: <User className="h-5 w-5" />, href: "/profile" },
    { title: "Mes Tournois", icon: <Trophy className="h-5 w-5" />, href: "/tournaments" },
    { title: "Statistiques", icon: <LineChart className="h-5 w-5" />, href: "/statistics" },
    { title: "Récompenses", icon: <Gift className="h-5 w-5" />, href: "/rewards" },
    { title: "Litiges", icon: <AlertTriangle className="h-5 w-5" />, href: "/disputes" },
    { title: "Parrainage", icon: <Users className="h-5 w-5" />, href: "/sponsorship" },
    { title: "Espace Validateur", icon: <Shield className="h-5 w-5" />, href: "/validator-dashboard" }
  ];

  return (
    <>
      {/* Bouton hamburger visible uniquement sur mobile avec animation */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${isOpen ? 'left-[250px]' : 'left-4'}`}
      >
        {isOpen ? 
          <X size={20} className="text-asc-purple" /> : 
          <Menu size={20} className="text-asc-purple" />
        }
      </button>

      {/* Overlay semi-transparent sur mobile quand la sidebar est ouverte */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        fixed h-screen bg-gradient-to-b from-indigo-100 to-indigo-200 shadow-lg transition-all duration-300 ease-in-out z-40 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        ${isMobile ? 'w-[250px]' : 'w-64'} 
        rounded-r-xl overflow-hidden border-r border-indigo-200
      `}>
        {/* Éléments décoratifs de flou */}
        <div className="absolute top-40 left-0 w-24 h-24 bg-indigo-300 opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-0 w-24 h-24 bg-indigo-300 opacity-10 rounded-full blur-xl"></div>
        
        <div className="flex w-full flex-col overflow-y-auto h-full">
          <div className="flex h-16 items-center border-b border-indigo-200 px-5">
            <Trophy className="h-8 w-8 text-indigo-600 mr-3" />
            <h2 className="text-lg font-semibold text-indigo-800">AfriK Soccer Cup</h2>
          </div>
          
          {/* Profil utilisateur simplifié */}
          <div className="px-4 py-3">
            <div className="bg-white/60 rounded-lg p-2 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={`Avatar de ${user.username}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Erreur de chargement de l'avatar dans la sidebar:", e);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerHTML = `<div class="flex items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`;
                      }}
                    />
                  ) : (
                  <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-indigo-900 font-medium text-sm">{user?.username || 'Joueur'}</div>
                  <div className="text-indigo-600 text-xs">{user?.sponsorship?.level || 'Paysan ASC'}</div>
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
                  onClick={() => isMobile && setIsOpen(false)}
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

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Confirmer la déconnexion"
        description="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmText="Déconnexion"
      />
    </>
  );
}
