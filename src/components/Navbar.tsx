
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import CartDrawer from "./CartDrawer";
import { useShop } from "@/contexts/ShopContext";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { cartCount, favorites } = useShop();
  const { isAuthenticated } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md py-3"
          : "bg-white/80 backdrop-blur-md py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/lovable-uploads/0d678570-3b5f-4d61-83d2-3cc41bd837f5.png"
              alt="Carmem Bezerra"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink to="/" active={location.pathname === "/"}>
              Início
            </NavLink>
            <NavLink to="/shop" active={location.pathname === "/shop"}>
              Loja
            </NavLink>
            <NavLink to="/gallery" active={location.pathname === "/gallery"}>
              Galeria
            </NavLink>
            <NavLink to="/about" active={location.pathname === "/about"}>
              Sobre
            </NavLink>
            <NavLink to="/contact" active={location.pathname === "/contact"}>
              Contato
            </NavLink>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Favorites */}
            <Link to="/favorites">
              <Button variant="outline" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-purple text-[10px] font-bold text-white">
                    {favorites.length}
                  </span>
                )}
              </Button>
            </Link>
            
            {/* Cart */}
            <CartDrawer />

            {/* User Profile */}
            <Link to={isAuthenticated ? "/profile" : "/auth/login"}>
              <Button variant="outline" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Cart Button (always visible) */}
            <CartDrawer />
            
            {/* Menu Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute w-full bg-white transition-all duration-300 shadow-md ${
          isMenuOpen ? "max-h-96 py-4" : "max-h-0 py-0 overflow-hidden"
        }`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex flex-col space-y-3 pb-4">
            <MobileNavLink
              to="/"
              active={location.pathname === "/"}
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </MobileNavLink>
            <MobileNavLink
              to="/shop"
              active={location.pathname === "/shop"}
              onClick={() => setIsMenuOpen(false)}
            >
              Loja
            </MobileNavLink>
            <MobileNavLink
              to="/gallery"
              active={location.pathname === "/gallery"}
              onClick={() => setIsMenuOpen(false)}
            >
              Galeria
            </MobileNavLink>
            <MobileNavLink
              to="/about"
              active={location.pathname === "/about"}
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre
            </MobileNavLink>
            <MobileNavLink
              to="/contact"
              active={location.pathname === "/contact"}
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </MobileNavLink>
            <div className="pt-2 flex space-x-2">
              <Link 
                to="/favorites" 
                className="flex-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button variant="outline" className="w-full justify-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Favoritos
                  {favorites.length > 0 && (
                    <span className="ml-2 bg-brand-purple text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </Button>
              </Link>
              <Link 
                to={isAuthenticated ? "/profile" : "/auth/login"}
                className="flex-1" 
                onClick={() => setIsMenuOpen(false)}
              >
                <Button variant="outline" className="w-full justify-center">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink = ({ to, active, children }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        active
          ? "text-brand-purple bg-brand-purple/5"
          : "text-gray-700 hover:text-brand-purple hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  );
};

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

const MobileNavLink = ({ to, active, onClick, children }: MobileNavLinkProps) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`px-4 py-2.5 text-base font-medium rounded-md transition-colors ${
        active
          ? "text-brand-purple bg-brand-purple/5"
          : "text-gray-700 hover:text-brand-purple hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;
