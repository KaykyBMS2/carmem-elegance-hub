
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

interface ProductRelatedItemsProps {
  productId: string;
  tags: string[];
}

interface Product {
  id: string;
  name: string;
  regular_price: number;
  sale_price: number | null;
  promotional_price: number | null;
  primary_image: string | null;
  is_rental: boolean | null;
  rental_price: number | null;
}

const ProductRelatedItems = ({ productId, tags }: ProductRelatedItemsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!tags || tags.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Get products with matching tags
        const { data, error } = await supabase
          .from('product_tags')
          .select(`
            product_id,
            products:product_id (
              id,
              name,
              regular_price,
              sale_price,
              promotional_price,
              is_rental,
              rental_price,
              primary_image:product_images(image_url)
            )
          `)
          .in('tag_id', tags)
          .neq('product_id', productId)
          .limit(10);

        if (error) throw error;

        // Format the data
        const formattedProducts = data
          .filter(item => item.products) // Filter out nulls
          .map(item => {
            // Extract the image URL safely from the array of objects
            let primaryImage = null;
            if (Array.isArray(item.products.primary_image) && 
                item.products.primary_image.length > 0 && 
                item.products.primary_image[0] && 
                typeof item.products.primary_image[0].image_url === 'string') {
              primaryImage = item.products.primary_image[0].image_url;
            }
            
            return {
              ...item.products,
              primary_image: primaryImage
            };
          })
          .filter((product, index, self) => 
            // Remove duplicates
            index === self.findIndex(p => p.id === product.id)
          );

        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, tags]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Produtos Relacionados</h3>
        <div className="flex space-x-2">
          <button 
            onClick={scrollLeft}
            className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-opacity-50"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={scrollRight}
            className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-opacity-50"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map(product => (
          <div 
            key={product.id} 
            className="flex-none w-[calc(33.333%-16px)] sm:w-64 md:w-1/3 lg:w-1/4 xl:w-1/5 snap-start"
          >
            <ProductCard 
              id={product.id}
              name={product.name}
              price={product.regular_price}
              salePrice={product.sale_price}
              promoPrice={product.promotional_price}
              imageUrl={product.primary_image || '/placeholder.svg'}
              isRental={product.is_rental || false}
              rentalPrice={product.rental_price}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRelatedItems;
