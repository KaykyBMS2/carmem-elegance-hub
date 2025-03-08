
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ShoppingBag, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard, { ProductProps } from '@/components/ProductCard';
import { toast } from '@/hooks/use-toast';

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortOption, setSortOption] = useState('featured');

  // Fetch products data (mock data for now)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // This would typically be an API call
        const mockProducts: ProductProps[] = [
          {
            id: 1,
            name: "Vestido Serena",
            description: "Elegante vestido para ensaio fotográfico, com detalhes em renda e cauda longa.",
            price: 450,
            rentalPrice: 30,
            image: "https://images.unsplash.com/photo-1623930106258-56b562a917d0?q=80&w=2574&auto=format&fit=crop",
            category: "Vestidos",
            isRental: true,
            rentalIncludes: ["Vestido", "Coroa", "Terço", "Urso", "Sutiã"]
          },
          {
            id: 2,
            name: "Vestido Aurora",
            description: "Vestido fluido com mangas transparentes e bordados artesanais.",
            price: 550,
            rentalPrice: 30,
            image: "https://images.unsplash.com/photo-1582616698198-f978da534162?q=80&w=2592&auto=format&fit=crop",
            category: "Vestidos",
            isRental: true,
            rentalIncludes: ["Vestido", "Coroa", "Terço", "Urso", "Sutiã"]
          },
          {
            id: 3,
            name: "Combo Celestial",
            description: "Conjunto de 4 vestidos distintos para uma sessão completa.",
            price: 1200,
            rentalPrice: 100,
            image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=2578&auto=format&fit=crop",
            category: "Combos",
            isRental: true,
            rentalIncludes: ["4 Vestidos", "4 Coroas", "Terço", "Urso", "Sutiã", "Lousa"]
          },
          {
            id: 4,
            name: "Bolsa Maternidade Luxo",
            description: "Bolsa maternidade em couro ecológico com múltiplos compartimentos e acabamento premium.",
            price: 280,
            image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=2576&auto=format&fit=crop",
            category: "Bolsas",
            isRental: false
          },
          {
            id: 5,
            name: "Vestido Angelina",
            description: "Vestido longo com tule e rendas aplicadas, perfeito para ensaios ao ar livre.",
            price: 570,
            rentalPrice: 30,
            image: "https://images.unsplash.com/photo-1531214159280-079b95d26139?q=80&w=2670&auto=format&fit=crop",
            category: "Vestidos",
            isRental: true,
            rentalIncludes: ["Vestido", "Coroa", "Terço", "Urso", "Sutiã"]
          },
          {
            id: 6,
            name: "Kit Decoração Quarto",
            description: "Kit completo para decoração de quarto de bebê, com peças coordenadas e estampas exclusivas.",
            price: 450,
            image: "https://images.unsplash.com/photo-1586105449897-20b5a1b5aa63?q=80&w=2574&auto=format&fit=crop",
            category: "Decoração",
            isRental: false
          },
          {
            id: 7,
            name: "Naninha Ursinho",
            description: "Naninha macia e aconchegante, ideal para acalmar o bebê. Feita com tecidos antialérgicos.",
            price: 75,
            image: "https://images.unsplash.com/photo-1602407294553-6ac9170b3ed0?q=80&w=2502&auto=format&fit=crop",
            category: "Brinquedos",
            isRental: false
          },
          {
            id: 8,
            name: "Manta Personalizada",
            description: "Manta de tricô personalizada com o nome do bebê, perfeita para presente ou uso diário.",
            price: 120,
            image: "https://images.unsplash.com/photo-1555116505-38ab61800975?q=80&w=2670&auto=format&fit=crop",
            category: "Enxoval",
            isRental: false
          }
        ];
        
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível carregar os produtos. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filter products based on search, category, price
  useEffect(() => {
    let result = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by price range
    result = result.filter(
      product => {
        const price = product.isRental ? (product.rentalPrice || 0) : product.price;
        return price >= priceRange[0] && price <= priceRange[1];
      }
    );
    
    // Sort results
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => {
          const priceA = a.isRental ? (a.rentalPrice || 0) : a.price;
          const priceB = b.isRental ? (b.rentalPrice || 0) : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        result.sort((a, b) => {
          const priceA = a.isRental ? (a.rentalPrice || 0) : a.price;
          const priceB = b.isRental ? (b.rentalPrice || 0) : b.price;
          return priceB - priceA;
        });
        break;
      case 'newest':
        // In a real app, you would sort by date
        result.sort((a, b) => b.id - a.id);
        break;
      default: // featured - no specific sorting
        break;
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery, priceRange, sortOption]);

  const categories = ['all', ...new Set(products.map(product => product.category))];

  const handleAddToCart = (id: number) => {
    // This would integrate with a cart system
    toast({
      title: "Produto adicionado",
      description: "O produto foi adicionado ao seu carrinho!",
    });
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange([0, 1000]);
    setSortOption('featured');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero section */}
        <div className="relative bg-gradient-to-r from-brand-purple/10 to-brand-purple/5 py-16">
          <div className="main-container relative z-10">
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
              Loja Carmem Bezerra
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Descubra nossa coleção exclusiva de produtos para maternidade e vestidos para ensaios fotográficos.
            </p>
          </div>
          
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl"></div>
            <div className="absolute top-32 -left-12 w-48 h-48 bg-brand-purple/5 rounded-full blur-3xl"></div>
          </div>
        </div>
        
        <div className="main-container py-12">
          {/* Search and filter bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative glass-card px-4 py-2 rounded-full">
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none bg-transparent pr-8 focus:outline-none text-sm"
                >
                  <option value="featured">Destaques</option>
                  <option value="price-low">Menor Preço</option>
                  <option value="price-high">Maior Preço</option>
                  <option value="newest">Mais Recentes</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 glass-card px-4 py-2 rounded-full hover:bg-white/80 transition-colors duration-300"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm">Filtros</span>
              </button>
              
              {(selectedCategory !== 'all' || searchQuery || priceRange[0] > 0 || priceRange[1] < 1000) && (
                <button 
                  onClick={handleClearFilters}
                  className="text-sm text-brand-purple hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
          
          {/* Expanded filters */}
          {showFilters && (
            <div className="glass-card p-6 rounded-xl mb-8 animate-fade-in">
              <div className="flex flex-wrap gap-8">
                <div className="w-full md:w-auto">
                  <h3 className="text-sm font-medium mb-3">Categorias</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                          selectedCategory === category 
                            ? 'bg-brand-purple text-white' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {category === 'all' ? 'Todos' : category}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="w-full md:w-auto">
                  <h3 className="text-sm font-medium mb-3">Faixa de Preço</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max={priceRange[1]}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-20 px-3 py-1.5 border rounded-md text-sm"
                    />
                    <span>até</span>
                    <input
                      type="number"
                      min={priceRange[0]}
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-20 px-3 py-1.5 border rounded-md text-sm"
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-auto">
                  <h3 className="text-sm font-medium mb-3">Tipo</h3>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        className="rounded text-brand-purple focus:ring-brand-purple/20"
                      />
                      Aluguel
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        className="rounded text-brand-purple focus:ring-brand-purple/20" 
                      />
                      Venda
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Product grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="loader"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar seus filtros ou buscar termos diferentes.
                </p>
                <button 
                  onClick={handleClearFilters}
                  className="button-secondary"
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Shop;
