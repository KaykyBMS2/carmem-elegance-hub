
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3 glass-card border-b border-white/20' : 'py-5 bg-transparent'
      }`}
    >
      <div className="main-container flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center transition-transform duration-300 hover:scale-105"
        >
          <div className="relative w-10 h-10 mr-3">
            <div className="absolute w-full h-full rounded-full bg-brand-purple/20 animate-float"></div>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path 
                d="M50 7C25.1 7 5 27.1 5 52s20.1 45 45 45s45-20.1 45-45S74.9 7 50 7zm0 80c-19.3 0-35-15.7-35-35s15.7-35 35-35s35 15.7 35 35s-15.7 35-35 35z" 
                fill="#b982ff"
              />
              <path 
                d="M50 22c-16.5 0-30 13.5-30 30s13.5 30 30 30s30-13.5 30-30s-13.5-30-30-30zm0 50c-11 0-20-9-20-20s9-20 20-20s20 9 20 20s-9 20-20 20z" 
                fill="#b982ff" 
                opacity="0.6"
              />
              <circle cx="50" cy="52" r="10" fill="#b982ff" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-montserrat font-bold tracking-tight">Carmem Bezerra</h1>
            <p className="text-xs text-muted-foreground -mt-1">Elegância Materna</p>
          </div>
        </Link>
        
        {/* Desktop Menu */}
        {!isMobile && (
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'text-brand-purple after:w-full' : ''}`}>
              Início
            </Link>
            <Link to="/shop" className={`nav-link ${location.pathname === '/shop' ? 'text-brand-purple after:w-full' : ''}`}>
              Loja
            </Link>
            <Link to="/gallery" className={`nav-link ${location.pathname === '/gallery' ? 'text-brand-purple after:w-full' : ''}`}>
              Ensaios
            </Link>
            <Link to="/shop" className="ml-4 button-primary flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>Explorar</span>
            </Link>
          </div>
        )}
        
        {/* Mobile Menu Button */}
        {isMobile && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="z-50 p-2 rounded-full bg-white/80 shadow-subtle"
            aria-label="Menu"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-brand-purple" />
            ) : (
              <Menu className="h-6 w-6 text-brand-purple" />
            )}
          </button>
        )}
      </div>
      
      {/* Mobile Menu */}
      {isMobile && (
        <div 
          className={`fixed inset-0 bg-brand-light z-40 transition-transform duration-300 ease-in-out glass-effect ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <Link 
              to="/" 
              className={`text-2xl font-montserrat font-medium ${location.pathname === '/' ? 'text-brand-purple' : ''}`}
            >
              Início
            </Link>
            <Link 
              to="/shop" 
              className={`text-2xl font-montserrat font-medium ${location.pathname === '/shop' ? 'text-brand-purple' : ''}`}
            >
              Loja
            </Link>
            <Link 
              to="/gallery" 
              className={`text-2xl font-montserrat font-medium ${location.pathname === '/gallery' ? 'text-brand-purple' : ''}`}
            >
              Ensaios
            </Link>
            <Link to="/shop" className="button-primary mt-8 flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>Explorar</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
