
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard, { ProductCardProps } from './ProductCard';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductRelatedItemsProps {
  productId: string;
  tags?: string[];
  limit?: number;
}

const ProductRelatedItems = ({ productId, tags = [], limit = 8 }: ProductRelatedItemsProps) => {
  const [relatedProducts, setRelatedProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const productsPerView = 4;

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        
        if (!tags || tags.length === 0) {
          // If no tags, fetch random products excluding current product
          const { data, error } = await supabase
            .from('products')
            .select(`
              id, 
              name, 
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
            .neq('id', productId)
            .limit(limit);
            
          if (error) throw error;
          
          transformProductsData(data);
        } else {
          // If there are tags, fetch products with matching tags
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
                product_images (
                  id,
                  image_url,
                  is_primary
                )
              )
            `)
            .in('tag_id', tags)
            .not('product_id', 'eq', productId)
            .limit(limit);
            
          if (error) throw error;
          
          // Extract unique products (since the same product can match multiple tags)
          const uniqueProductIds = new Set();
          const uniqueProducts = [];
          
          for (const item of data) {
            if (item.products && !uniqueProductIds.has(item.products.id)) {
              uniqueProductIds.add(item.products.id);
              uniqueProducts.push(item.products);
            }
          }
          
          transformProductsData(uniqueProducts);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    const transformProductsData = (data: any[]) => {
      if (!data || data.length === 0) {
        setRelatedProducts([]);
        return;
      }
      
      const transformed = data.map(product => {
        const images = product.product_images || [];
        // Find primary image, fallback to first image or placeholder
        const primaryImage = images.find((img: any) => img.is_primary);
        const firstImage = images[0];
        const imageUrl = primaryImage ? primaryImage.image_url : 
                         firstImage ? firstImage.image_url : 
                         "/placeholder.svg";
        
        return {
          id: product.id,
          name: product.name,
          price: product.regular_price,
          salePrice: product.sale_price,
          promoPrice: product.promotional_price,
          imageUrl: imageUrl,
          isRental: product.is_rental,
          rentalPrice: product.rental_price
        };
      });
      
      setRelatedProducts(transformed);
    };
    
    if (productId) {
      fetchRelatedProducts();
    }
  }, [productId, tags, limit]);
  
  const totalSlides = Math.ceil(relatedProducts.length / productsPerView);
  
  const handlePrev = () => {
    setCurrentIndex(prevIndex => 
      prevIndex <= 0 ? totalSlides - 1 : prevIndex - 1
    );
  };
  
  const handleNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex >= totalSlides - 1 ? 0 : prevIndex + 1
    );
  };
  
  const visibleProducts = relatedProducts.slice(
    currentIndex * productsPerView,
    (currentIndex * productsPerView) + productsPerView
  );

  if (loading) {
    return <div className="h-64 flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-purple"></div>
    </div>;
  }
  
  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Produtos relacionados</h3>
        
        {totalSlides > 1 && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrev}
              className="h-8 w-8 p-0 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNext}
              className="h-8 w-8 p-0 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {visibleProducts.map(product => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            salePrice={product.salePrice}
            promoPrice={product.promoPrice}
            imageUrl={product.imageUrl}
            isRental={product.isRental}
            rentalPrice={product.rentalPrice}
            className="product-suggestion-card"
          />
        ))}
      </div>
    </div>
  );
};

export default ProductRelatedItems;
