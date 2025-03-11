
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Flower, User, LogIn, Settings, LogOut, UserCircle, Heart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isAuthenticated, profile, signOut } = useAuth();
  
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'py-2 glass-card border-b border-white/20 shadow-sm' 
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
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
          <div className="hidden md:flex items-center gap-1">
            <div className="glass-effect px-4 py-2 rounded-full flex items-center gap-1 shadow-subtle">
              <Link 
                to="/" 
                className={`px-4 py-1.5 rounded-full transition-all duration-300 font-montserrat text-sm font-bold ${
                  location.pathname === '/' 
                    ? 'bg-brand-purple text-white shadow-sm' 
                    : 'hover:bg-white/50'
                }`}
              >
                Início
              </Link>
              <Link 
                to="/shop" 
                className={`px-4 py-1.5 rounded-full transition-all duration-300 font-montserrat text-sm font-bold ${
                  location.pathname === '/shop' 
                    ? 'bg-brand-purple text-white shadow-sm' 
                    : 'hover:bg-white/50'
                }`}
              >
                Loja
              </Link>
              <Link 
                to="/gallery" 
                className={`px-4 py-1.5 rounded-full transition-all duration-300 font-montserrat text-sm font-bold ${
                  location.pathname === '/gallery' 
                    ? 'bg-brand-purple text-white shadow-sm' 
                    : 'hover:bg-white/50'
                }`}
              >
                Ensaios
              </Link>
              <Link 
                to="/about" 
                className={`px-4 py-1.5 rounded-full transition-all duration-300 font-montserrat text-sm font-bold ${
                  location.pathname === '/about' 
                    ? 'bg-brand-purple text-white shadow-sm' 
                    : 'hover:bg-white/50'
                }`}
              >
                Sobre
              </Link>
              <Link 
                to="/contact" 
                className={`px-4 py-1.5 rounded-full transition-all duration-300 font-montserrat text-sm font-bold ${
                  location.pathname === '/contact' 
                    ? 'bg-brand-purple text-white shadow-sm' 
                    : 'hover:bg-white/50'
                }`}
              >
                Contato
              </Link>
            </div>
            
            {/* User Auth */}
            <div className="ml-4 flex items-center gap-2">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-full border-brand-purple/30 hover:bg-brand-purple/10 hover:text-brand-purple font-bold"
                    asChild
                  >
                    <Link to="/profile/orders">
                      <Heart className="h-4 w-4 mr-1" />
                      Pedidos
                    </Link>
                  </Button>
                  <div className="relative group">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full border-brand-purple hover:bg-brand-purple/10 hover:text-brand-purple flex items-center gap-1 font-bold"
                    >
                      <UserCircle className="h-4 w-4" />
                      <span className="max-w-[80px] truncate">{profile?.name || 'Minha Conta'}</span>
                    </Button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="py-2">
                        <Link 
                          to="/profile" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-brand-purple/10 hover:text-brand-purple font-semibold"
                        >
                          <User className="h-4 w-4 mr-2" />
                          <span>Meu Perfil</span>
                        </Link>
                        <Link 
                          to="/profile/orders" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-brand-purple/10 hover:text-brand-purple font-semibold"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          <span>Meus Pedidos</span>
                        </Link>
                        <Link 
                          to="/profile/notifications" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-brand-purple/10 hover:text-brand-purple font-semibold"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          <span>Notificações</span>
                        </Link>
                        <hr className="my-1" />
                        <button 
                          onClick={() => signOut()}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          <span>Sair</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-full border-brand-purple hover:bg-brand-purple/10 hover:text-brand-purple transition-transform duration-300 hover:scale-105 font-bold"
                  asChild
                >
                  <Link to="/auth/login" className="flex items-center gap-1">
                    <LogIn className="h-4 w-4" />
                    <span>Entrar</span>
                  </Link>
                </Button>
              )}
              
              <Button 
                variant="default" 
                size="sm"
                className="rounded-full bg-brand-purple hover:bg-brand-purple/90 transition-transform duration-300 hover:scale-105 font-bold"
                asChild
              >
                <Link to="/shop" className="flex items-center gap-1">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Explorar</span>
                </Link>
              </Button>
            </div>
          </div>
        )}
        
        {/* Mobile Menu Button */}
        {isMobile && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`z-50 p-3 rounded-full transition-all duration-300 ${
              isOpen 
                ? 'bg-white shadow-md rotate-90' 
                : 'bg-white/80 shadow-subtle'
            }`}
            aria-label="Menu"
          >
            {isOpen ? (
              <X className="h-5 w-5 text-brand-purple" />
            ) : (
              <Menu className="h-5 w-5 text-brand-purple" />
            )}
          </button>
        )}
      </div>
      
      {/* Mobile Menu */}
      {isMobile && (
        <div 
          className={`fixed inset-0 backdrop-blur-md transition-all duration-500 ease-in-out ${
            isOpen 
              ? 'opacity-100 pointer-events-auto' 
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-b from-white/80 to-brand-purple/20 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}></div>
          
          <div className={`flex flex-col items-center justify-center h-full space-y-6 transition-all duration-500 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="relative mb-4">
              <Flower className="absolute -top-8 -left-12 h-6 w-6 text-brand-purple/30 rotate-45" />
              <Flower className="absolute -top-6 -right-10 h-4 w-4 text-brand-purple/20" />
              <div className="text-center">
                <h2 className="font-montserrat font-bold text-2xl">Menu</h2>
                <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-brand-purple to-transparent mx-auto mt-2"></div>
              </div>
            </div>
            
            <Link 
              to="/" 
              className={`mobile-nav-link ${location.pathname === '/' ? 'text-brand-purple' : ''}`}
            >
              Início
            </Link>
            <Link 
              to="/shop" 
              className={`mobile-nav-link ${location.pathname === '/shop' ? 'text-brand-purple' : ''}`}
            >
              Loja
            </Link>
            <Link 
              to="/gallery" 
              className={`mobile-nav-link ${location.pathname === '/gallery' ? 'text-brand-purple' : ''}`}
            >
              Ensaios
            </Link>
            <Link 
              to="/about" 
              className={`mobile-nav-link ${location.pathname === '/about' ? 'text-brand-purple' : ''}`}
            >
              Sobre
            </Link>
            <Link 
              to="/contact" 
              className={`mobile-nav-link ${location.pathname === '/contact' ? 'text-brand-purple' : ''}`}
            >
              Contato
            </Link>
            
            {/* Auth links for mobile */}
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 px-6 py-2 bg-brand-purple/10 rounded-full text-brand-purple font-bold"
                >
                  <UserCircle className="h-5 w-5" />
                  <span>Meu Perfil</span>
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-6 py-2 bg-red-50 rounded-full text-red-600 font-bold"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <Link 
                to="/auth/login" 
                className="flex items-center gap-2 px-6 py-2 bg-brand-purple/10 rounded-full text-brand-purple font-bold"
              >
                <LogIn className="h-5 w-5" />
                <span>Entrar</span>
              </Link>
            )}
            
            <Link 
              to="/shop" 
              className="button-primary mt-4 flex items-center group font-bold"
            >
              <ShoppingBag className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
              <span>Explorar</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
