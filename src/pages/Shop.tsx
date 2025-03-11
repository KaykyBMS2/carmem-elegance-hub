import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ShoppingBag, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard, { ProductCardProps } from '@/components/ProductCard';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Shop = () => {
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState<ProductCardProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortOption, setSortOption] = useState('featured');
  const [categories, setCategories] = useState<string[]>(['all']);

  // Fetch products from Supabase
  const { data: products, isLoading: loading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            product_images(*)
          `);

        if (productsError) throw productsError;

        // Get unique categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('name');

        if (categoriesError) throw categoriesError;

        if (categoriesData && categoriesData.length > 0) {
          setCategories(['all', ...categoriesData.map(cat => cat.name)]);
        }

        // Transform data to match ProductCardProps
        const transformedProducts: ProductCardProps[] = productsData.map(product => {
          const imageUrl = product.product_images && product.product_images.length > 0
            ? product.product_images[0].image_url
            : "https://images.unsplash.com/photo-1555116505-38ab61800975?q=80&w=2670&auto=format&fit=crop&fit=crop";

          return {
            id: product.id, 
            name: product.name,
            description: product.description || "",
            price: product.regular_price,
            salePrice: product.sale_price,
            promoPrice: product.promotional_price,
            rentalPrice: product.rental_price,
            imageUrl: imageUrl,
            isRental: product.is_rental || false
          };
        });

        return transformedProducts;
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível carregar os produtos. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
        return [];
      }
    },
    // Remove any auth dependencies to ensure products load for all users
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minute
  });

  // Filter products based on search, category, price
  useEffect(() => {
    if (!products) return;
    
    let result = [...products];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          (product.description && product.description.toLowerCase().includes(query))
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
        // We can't directly subtract IDs if they might be strings
        // Instead, use a safer comparison method
        result.sort((a, b) => {
          // If IDs are numeric strings, convert them to numbers for comparison
          // Otherwise, compare them as strings
          const idA = typeof a.id === 'number' ? a.id : String(a.id);
          const idB = typeof b.id === 'number' ? b.id : String(b.id);
          
          // For numeric comparison (assuming newer items have higher IDs)
          if (typeof idA === 'number' && typeof idB === 'number') {
            return idB - idA; // Descending order
          }
          
          // For string comparison (lexicographical)
          return String(idB).localeCompare(String(idA));
        });
        break;
      default: // featured - no specific sorting
        break;
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery, priceRange, sortOption]);

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
