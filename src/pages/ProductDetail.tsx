
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Box, Ruler, ShoppingBag, Heart, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductRelatedItems from '@/components/ProductRelatedItems';

// Define the Product type with dimensions
interface Product {
  id: string;
  name: string;
  description: string;
  regular_price: number;
  sale_price: number;
  promotional_price: number;
  rental_price: number;
  is_rental: boolean;
  material: string;
  size_info: string;
  care_instructions: string;
  created_at: string;
  updated_at: string;
  width: number | null;
  height: number | null;
  depth: number | null;
}

interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface RelatedProductProps {
  currentProductId: string;
  isRental: boolean;
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Fetch product details
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) {
          console.error('Error fetching product:', productError);
          return;
        }

        // Fetch product images
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('is_primary', { ascending: false }); // Order by is_primary to put primary images first

        if (imageError) {
          console.error('Error fetching product images:', imageError);
          return;
        }

        setProduct(productData as Product);
        setImages(imageData as ProductImage[]);
      } catch (error) {
        console.error('Error in product fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <p className="mb-6 text-gray-600">O produto que você está procurando não existe ou foi removido.</p>
          <Link to="/shop" className="button-primary">
            Voltar para a loja
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 container mx-auto px-4">
        {/* Back button */}
        <Link to="/shop" className="inline-flex items-center text-gray-600 hover:text-brand-purple mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Voltar para a loja</span>
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Product Images */}
          <div>
            <ProductImageGallery images={images} />
          </div>
          
          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-montserrat font-bold text-gray-800">{product.name}</h1>
            
            {/* Pricing */}
            <div className="mt-4 space-y-1">
              {product.is_rental ? (
                <>
                  <div className="flex items-center text-brand-purple">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Disponível para Aluguel</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatPrice(product.rental_price)} <span className="text-sm font-normal text-gray-500">/ por período</span>
                  </div>
                </>
              ) : (
                <>
                  {product.promotional_price ? (
                    <>
                      <div className="text-2xl font-bold text-brand-purple">
                        {formatPrice(product.promotional_price)}
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(product.regular_price)}
                      </div>
                    </>
                  ) : product.sale_price ? (
                    <>
                      <div className="text-2xl font-bold text-brand-purple">
                        {formatPrice(product.sale_price)}
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(product.regular_price)}
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-brand-purple">
                      {formatPrice(product.regular_price)}
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Description */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Descrição</h3>
              <p className="text-gray-600">{product.description || 'Sem descrição disponível.'}</p>
            </div>
            
            {/* Product Dimensions */}
            {(product.width || product.height || product.depth) && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Ruler className="h-5 w-5 mr-2 text-gray-500" />
                  Dimensões
                </h3>
                <div className="grid grid-cols-3 gap-4 mt-2 text-center">
                  {product.width && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500">Largura</div>
                      <div className="font-bold">{product.width} cm</div>
                    </div>
                  )}
                  {product.height && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500">Altura</div>
                      <div className="font-bold">{product.height} cm</div>
                    </div>
                  )}
                  {product.depth && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500">Profundidade</div>
                      <div className="font-bold">{product.depth} cm</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Product Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.material && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Material</h3>
                  <p>{product.material}</p>
                </div>
              )}
              
              {product.size_info && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Informações de Tamanho</h3>
                  <p>{product.size_info}</p>
                </div>
              )}
            </div>
            
            {/* Care Instructions */}
            {product.care_instructions && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Instruções de Cuidado</h3>
                <p className="text-gray-600">{product.care_instructions}</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="button-primary flex-1 py-3 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                {product.is_rental ? 'Reservar' : 'Adicionar ao Carrinho'}
              </button>
              <button className="border border-brand-purple text-brand-purple hover:bg-brand-purple/5 rounded-full flex items-center justify-center px-6 py-3 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-montserrat font-bold mb-6">Você também pode gostar</h2>
          <ProductRelatedItems 
            currentId={product.id} 
            isRental={product.is_rental || false} 
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
