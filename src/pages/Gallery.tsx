
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

interface GalleryItem {
  id: number;
  title: string;
  subtitle: string;
  dressName: string;
  dressId: number;
  image: string;
  height: 'tall' | 'medium' | 'short';
  width: 'wide' | 'normal';
}

const Gallery = () => {
  const navigate = useNavigate();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  
  useEffect(() => {
    // Simulate loading gallery items
    const loadItems = async () => {
      // In a real app, this would be an API call
      const mockItems: GalleryItem[] = [
        {
          id: 1,
          title: "Ensaio Maternidade ao Pôr do Sol",
          subtitle: "Diana, 32 semanas",
          dressName: "Vestido Serena",
          dressId: 1,
          image: "https://images.unsplash.com/photo-1611042553365-9b101441c135?q=80&w=2565&auto=format&fit=crop",
          height: 'tall',
          width: 'normal'
        },
        {
          id: 2,
          title: "Sessão Floral",
          subtitle: "Carla, 28 semanas",
          dressName: "Vestido Aurora",
          dressId: 2,
          image: "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?q=80&w=2625&auto=format&fit=crop",
          height: 'medium',
          width: 'wide'
        },
        {
          id: 3,
          title: "Luz Natural",
          subtitle: "Marina, 30 semanas",
          dressName: "Vestido Angelina",
          dressId: 5,
          image: "https://images.unsplash.com/photo-1541104577634-e9a686b32d4f?q=80&w=2574&auto=format&fit=crop",
          height: 'short',
          width: 'normal'
        },
        {
          id: 4,
          title: "Momento Eterno",
          subtitle: "Ana, 36 semanas",
          dressName: "Vestido Aurora",
          dressId: 2,
          image: "https://images.unsplash.com/photo-1554342321-0a9c6f51027e?q=80&w=2574&auto=format&fit=crop",
          height: 'medium',
          width: 'normal'
        },
        {
          id: 5,
          title: "Ensaio em Família",
          subtitle: "Joana e Pedro, 34 semanas",
          dressName: "Vestido Serena",
          dressId: 1,
          image: "https://images.unsplash.com/photo-1581952976147-5a2d15560349?q=80&w=2671&auto=format&fit=crop",
          height: 'tall',
          width: 'wide'
        },
        {
          id: 6,
          title: "Jardim Secreto",
          subtitle: "Bianca, 29 semanas",
          dressName: "Vestido Angelina",
          dressId: 5,
          image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2650&auto=format&fit=crop",
          height: 'short',
          width: 'normal'
        },
        {
          id: 7,
          title: "Ensaio Minimalista",
          subtitle: "Luiza, 31 semanas",
          dressName: "Vestido Serena",
          dressId: 1,
          image: "https://images.unsplash.com/photo-1621346653402-9ff587e53fb6?q=80&w=2667&auto=format&fit=crop",
          height: 'medium',
          width: 'normal'
        },
        {
          id: 8,
          title: "Conexão",
          subtitle: "Renata, 33 semanas",
          dressName: "Vestido Aurora",
          dressId: 2,
          image: "https://images.unsplash.com/photo-1623930274740-b0deb63c9b44?q=80&w=2574&auto=format&fit=crop",
          height: 'tall',
          width: 'normal'
        },
        {
          id: 9,
          title: "Maternidade Dourada",
          subtitle: "Cláudia, 35 semanas",
          dressName: "Vestido Angelina",
          dressId: 5,
          image: "https://images.unsplash.com/photo-1599047472695-2216113c3b7c?q=80&w=2669&auto=format&fit=crop",
          height: 'short',
          width: 'wide'
        }
      ];
      
      setGalleryItems(mockItems);
      setLoading(false);
    };
    
    loadItems();
  }, []);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setSelectedItem(null);
      }
    };
    
    if (selectedItem) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedItem]);
  
  // Disable body scroll when modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedItem]);
  
  const toggleFavorite = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(itemId => itemId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };
  
  const navigateToDress = (dressId: number) => {
    navigate(`/product/${dressId}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero section */}
        <div className="relative bg-gradient-to-r from-brand-purple/10 to-brand-purple/5 py-16">
          <div className="main-container relative z-10">
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
              Galeria de Ensaios
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Inspire-se com nossos ensaios fotográficos de gestantes usando os vestidos exclusivos da Carmem Bezerra.
            </p>
          </div>
          
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl"></div>
            <div className="absolute top-32 -left-12 w-48 h-48 bg-brand-purple/5 rounded-full blur-3xl"></div>
          </div>
        </div>
        
        <div className="main-container py-12">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {galleryItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "break-inside-avoid mb-4 rounded-xl overflow-hidden relative group cursor-pointer",
                    "transition-all duration-300 hover:shadow-xl",
                    {
                      'h-[450px] sm:h-[500px]': item.height === 'tall',
                      'h-[350px] sm:h-[400px]': item.height === 'medium',
                      'h-[250px] sm:h-[300px]': item.height === 'short',
                      'sm:col-span-2': item.width === 'wide'
                    }
                  )}
                >
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
                    <h3 className="text-white font-montserrat font-semibold text-xl">{item.title}</h3>
                    <p className="text-white/80 text-sm mb-1">{item.subtitle}</p>
                    <p className="text-brand-purple/90 text-sm font-medium">{item.dressName}</p>
                  </div>
                  
                  <button 
                    onClick={(e) => toggleFavorite(item.id, e)} 
                    className={`absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
                      favorites.includes(item.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Heart 
                      className={`h-4 w-4 ${favorites.includes(item.id) ? 'fill-brand-purple text-brand-purple' : ''}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Modal for detailed view */}
          {selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
              <div 
                ref={modalRef}
                className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden animate-zoom-in shadow-2xl"
              >
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative h-[300px] md:h-[500px]">
                    <img 
                      src={selectedItem.image} 
                      alt={selectedItem.title} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-8 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-montserrat font-semibold">{selectedItem.title}</h2>
                        <p className="text-muted-foreground">{selectedItem.subtitle}</p>
                      </div>
                      
                      <button 
                        onClick={() => toggleFavorite(selectedItem.id)} 
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                      >
                        <Heart 
                          className={`h-5 w-5 ${favorites.includes(selectedItem.id) ? 'fill-brand-purple text-brand-purple' : ''}`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="mb-8">
                        <h3 className="text-lg font-medium mb-2">Sobre este ensaio</h3>
                        <p className="text-muted-foreground mb-4">
                          Um belíssimo ensaio fotográfico capturando a essência da maternidade, realçando a beleza e a delicadeza deste momento único na vida de uma mulher.
                        </p>
                      </div>
                      
                      <div className="glass-card p-4 rounded-xl mb-6">
                        <h3 className="font-medium mb-2">Vestido utilizado</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-montserrat text-lg">{selectedItem.dressName}</p>
                            <p className="text-sm text-brand-purple">Disponível para aluguel</p>
                          </div>
                          <button 
                            onClick={() => navigateToDress(selectedItem.dressId)}
                            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-purple transition-colors duration-300 hover:bg-brand-purple hover:text-white"
                          >
                            <ShoppingBag className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-6">
                        Todos os nossos vestidos são cuidadosamente selecionados para garantir o máximo conforto e elegância durante seus ensaios fotográficos.
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => navigateToDress(selectedItem.dressId)}
                      className="button-primary w-full"
                    >
                      Alugar este vestido
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Gallery;
