
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

  // Filter products based on search query
  const filteredProducts = () => {
    if (!products) return [];
    
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
    
    return result;
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
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
            <button className="px-4 py-2 flex items-center gap-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <button className="px-4 py-2 flex items-center gap-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Ordenar</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
          </div>
        ) : filteredProducts().length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts().map((product) => (
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
