
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ShoppingBag, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard, { ProductCardProps } from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Shop = () => {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, priceAsc, priceDesc
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterBy, setFilterBy] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch products with their images
        const { data: productsData, error } = await supabase
          .from('products')
          .select(`
            id, 
            name, 
            description, 
            regular_price,
            sale_price,
            promotional_price,
            is_rental,
            rental_price,
            product_images (
              id,
              image_url,
              is_primary
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        console.log("Fetched products:", productsData);

        // Transform data to match ProductCardProps
        const transformedProducts: ProductCardProps[] = productsData.map(product => {
          const primaryImage = product.product_images.find(img => img.is_primary);
          const firstImage = product.product_images[0];
          const imageUrl = primaryImage ? primaryImage.image_url : 
                           firstImage ? firstImage.image_url : 
                           "/placeholder.svg";

          return {
            id: product.id, 
            name: product.name, 
            price: product.regular_price,
            salePrice: product.sale_price,
            promoPrice: product.promotional_price,
            rentalPrice: product.rental_price,
            imageUrl: imageUrl,
            isRental: product.is_rental || false
          };
        });

        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const processedProducts = () => {
    if (!products.length) return [];
    
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
    
    // Filter by type (if filters are selected)
    if (filterBy.length > 0) {
      result = result.filter(product => {
        if (filterBy.includes('rental') && product.isRental) return true;
        if (filterBy.includes('sale') && !product.isRental) return true;
        return false;
      });
    }
    
    // Sort products
    switch (sortBy) {
      case 'priceAsc':
        return result.sort((a, b) => Number(a.price) - Number(b.price));
      case 'priceDesc':
        return result.sort((a, b) => Number(b.price) - Number(a.price));
      case 'newest':
      default:
        return result;
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const toggleFilter = (filter: string) => {
    if (filterBy.includes(filter)) {
      setFilterBy(filterBy.filter(f => f !== filter));
    } else {
      setFilterBy([...filterBy, filter]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-gray-800">Nossa Coleção</h1>
          <p className="text-gray-600 mt-2">
            Explore nossa coleção exclusiva para o período mais especial da sua vida.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="w-full max-w-md relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            {/* Filter dropdown */}
            <div className="relative">
              <button 
                className="px-4 py-2 flex items-center gap-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-10">
                  <div className="p-3">
                    <div className="mb-2 font-medium text-sm text-gray-600">Tipo de Produto</div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-brand-purple mr-2"
                          checked={filterBy.includes('sale')}
                          onChange={() => toggleFilter('sale')}
                        />
                        Produtos para Venda
                      </label>
                      <label className="flex items-center text-sm cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-brand-purple mr-2"
                          checked={filterBy.includes('rental')}
                          onChange={() => toggleFilter('rental')}
                        />
                        Produtos para Aluguel
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Sort dropdown */}
            <div className="relative">
              <button 
                className="px-4 py-2 flex items-center gap-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Ordenar</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-10">
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'newest' ? 'font-semibold text-brand-purple' : ''}`}
                    onClick={() => {
                      setSortBy('newest');
                      setShowSortDropdown(false);
                    }}
                  >
                    Mais Recentes
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'priceAsc' ? 'font-semibold text-brand-purple' : ''}`}
                    onClick={() => {
                      setSortBy('priceAsc');
                      setShowSortDropdown(false);
                    }}
                  >
                    Preço: Menor para Maior
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'priceDesc' ? 'font-semibold text-brand-purple' : ''}`}
                    onClick={() => {
                      setSortBy('priceDesc');
                      setShowSortDropdown(false);
                    }}
                  >
                    Preço: Maior para Menor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
          </div>
        ) : processedProducts().length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {processedProducts().map((product) => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product.id)}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  salePrice={product.salePrice}
                  promoPrice={product.promoPrice}
                  imageUrl={product.imageUrl}
                  isRental={product.isRental}
                  rentalPrice={product.rentalPrice}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-600 mb-2">Nenhum produto encontrado</h2>
            <p className="text-gray-500 max-w-md">
              Não encontramos produtos correspondentes à sua busca. Tente outros termos ou navegue por outras categorias.
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Shop;
