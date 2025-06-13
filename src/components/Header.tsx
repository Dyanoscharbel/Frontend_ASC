
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Trophy, User } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 border-b sticky top-0 z-50">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <Trophy className="h-8 w-8 text-asc-purple" />
          <span className="text-2xl font-bold gradient-text">ASC</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-asc-purple dark:hover:text-asc-purple font-medium">
            Accueil
          </Link>
          <Link to="/tournaments-info" className="text-gray-700 dark:text-gray-300 hover:text-asc-purple dark:hover:text-asc-purple font-medium">
            Tournois
          </Link>
          <Link to="/sponsorship-info" className="text-gray-700 dark:text-gray-300 hover:text-asc-purple dark:hover:text-asc-purple font-medium">
            Parrainage
          </Link>
          <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-asc-purple dark:hover:text-asc-purple font-medium">
            À propos
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/login">
            <Button variant="outline" className="border-asc-purple text-asc-purple hover:bg-asc-purple/10">
              Se connecter
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-asc-purple hover:bg-asc-dark-purple">S'inscrire</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t py-4 animate-fade-in">
          <nav className="container flex flex-col space-y-4">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-asc-purple dark:hover:text-asc-purple font-medium py-2" onClick={() => setIsMenuOpen(false)}>
              Accueil
            </Link>
            <Link to="/tournaments-info" className="text-gray-700 dark:text-gray-300 hover:text-asc-purple dark:hover:text-asc-purple font-medium py-2" onClick={() => setIsMenuOpen(false)}>
              Tournois
            </Link>
            <Link to="/sponsorship-info" className="text-gray-700 dark:text-gray-300 hover:text-asc-purple dark:hover:text-asc-purple font-medium py-2" onClick={() => setIsMenuOpen(false)}>
              Parrainage
            </Link>
            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-asc-purple dark:hover:text-asc-purple font-medium py-2" onClick={() => setIsMenuOpen(false)}>
              À propos
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="border-asc-purple text-asc-purple hover:bg-asc-purple/10 w-full">
                  Se connecter
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="bg-asc-purple hover:bg-asc-dark-purple w-full">S'inscrire</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
