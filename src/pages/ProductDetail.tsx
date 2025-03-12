
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Box, Ruler, ShoppingBag, Heart, Clock, Check, Instagram, Star, StarHalf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductRelatedItems from '@/components/ProductRelatedItems';
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";

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

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const actionButtonsRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) {
          console.error('Error fetching product:', productError);
          return;
        }

        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('is_primary', { ascending: false });

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
    
    // Set up scroll listener for sticky buttons
    const handleScroll = () => {
      if (actionButtonsRef.current) {
        const rect = actionButtonsRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };
  
  const handleAddToCart = () => {
    toast({
      title: "Produto adicionado",
      description: `${product?.name} foi adicionado ao carrinho.`,
    });
  };
  
  const handleAddToWishlist = () => {
    toast({
      title: "Produto salvo",
      description: `${product?.name} foi adicionado aos favoritos.`,
    });
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
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
          <h1 className="text-2xl font-bold mb-4 font-montserrat">Produto não encontrado</h1>
          <p className="mb-6 text-gray-600 font-poppins">O produto que você está procurando não existe ou foi removido.</p>
          <Link to="/" className="button-primary">
            Voltar para a início
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Sticky add to cart on mobile */}
      {isSticky && (
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-white shadow-lg md:hidden p-3 animate-fade-in">
          <div className="flex gap-2">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-brand-purple text-white rounded-full py-3 px-4 font-semibold flex items-center justify-center transition hover:bg-brand-purple/90"
            >
              {product.is_rental ? 'Reservar' : 'Comprar'}
            </button>
            <button 
              onClick={handleAddToWishlist}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-brand-purple text-brand-purple hover:bg-brand-purple/5"
            >
              <Heart size={20} />
            </button>
          </div>
        </div>
      )}
      
      <main className="flex-grow pt-24 pb-20 container mx-auto px-4">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-brand-purple mb-6 font-poppins">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Voltar para a loja</span>
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* Product Images */}
          <div className="md:sticky md:top-24 self-start">
            <ProductImageGallery images={images} />
          </div>
          
          {/* Product Details */}
          <div className="flex flex-col">
            {/* Product header info */}
            <div>
              {product.is_rental && (
                <Badge className="mb-3 bg-brand-purple/10 text-brand-purple border-none hover:bg-brand-purple/20 px-3 py-1">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span className="font-medium">Disponível para Aluguel</span>
                </Badge>
              )}
              
              <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-gray-800 leading-tight">{product.name}</h1>
              
              {/* Review stars */}
              <div className="flex items-center mt-3 mb-4">
                <div className="flex text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <StarHalf className="h-4 w-4 fill-current" />
                </div>
                <span className="ml-2 text-sm text-gray-500 font-poppins">4.8 (12 avaliações)</span>
              </div>
              
              {/* Price section */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                {product.is_rental ? (
                  <div className="flex flex-col">
                    <div className="text-brand-purple text-sm font-medium font-poppins">Valor para aluguel:</div>
                    <div className="text-3xl font-bold text-brand-purple font-montserrat">
                      {formatPrice(product.rental_price)} <span className="text-sm font-normal text-gray-500">/ período</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 font-poppins">
                      Caução: {formatPrice(product.regular_price / 2)} <span className="text-xs">(reembolsável após devolução)</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {product.promotional_price ? (
                      <>
                        <div className="text-brand-purple text-sm font-medium font-poppins">Preço promocional:</div>
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold text-brand-purple font-montserrat">
                            {formatPrice(product.promotional_price)}
                          </span>
                          <span className="ml-2 text-sm text-gray-500 line-through font-poppins">
                            {formatPrice(product.regular_price)}
                          </span>
                        </div>
                        <div className="mt-1 inline-flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-0.5 rounded">
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Economia de {formatPrice(product.regular_price - product.promotional_price)}
                        </div>
                      </>
                    ) : product.sale_price ? (
                      <>
                        <div className="text-brand-purple text-sm font-medium font-poppins">Preço com desconto:</div>
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold text-brand-purple font-montserrat">
                            {formatPrice(product.sale_price)}
                          </span>
                          <span className="ml-2 text-sm text-gray-500 line-through font-poppins">
                            {formatPrice(product.regular_price)}
                          </span>
                        </div>
                        <div className="mt-1 inline-flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-0.5 rounded">
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Economia de {formatPrice(product.regular_price - product.sale_price)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-brand-purple text-sm font-medium font-poppins">Preço:</div>
                        <div className="text-3xl font-bold text-brand-purple font-montserrat">
                          {formatPrice(product.regular_price)}
                        </div>
                      </>
                    )}
                    <div className="mt-3 text-sm text-gray-600 font-poppins">
                      Em até 12x de {formatPrice((product.promotional_price || product.sale_price || product.regular_price) / 12)} sem juros
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons - add to cart, etc. */}
            <div ref={actionButtonsRef} className="mb-8">
              {/* Quantity selector */}
              {!product.is_rental && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Quantidade:</label>
                  <div className="flex items-center">
                    <button 
                      onClick={decreaseQuantity} 
                      className="w-10 h-10 rounded-l-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="w-16 h-10 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-0"
                    />
                    <button 
                      onClick={increaseQuantity} 
                      className="w-10 h-10 rounded-r-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-brand-purple text-white rounded-full py-3.5 px-6 font-bold font-montserrat hover:bg-brand-purple/90 transition shadow-lg shadow-brand-purple/20 hover:shadow-xl hover:shadow-brand-purple/30 flex items-center justify-center group"
                >
                  <ShoppingBag className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                  {product.is_rental ? 'Reservar agora' : 'Comprar agora'}
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className="sm:w-14 h-14 rounded-full border-2 border-brand-purple text-brand-purple hover:bg-brand-purple/5 flex items-center justify-center transition"
                >
                  <Heart className="h-6 w-6" />
                </button>
              </div>
              
              {/* Stock status */}
              <div className="flex items-center gap-1 text-green-600 mt-4 font-poppins">
                <Check className="h-4 w-4" />
                <span>Em estoque - pronta entrega</span>
              </div>
            </div>
            
            {/* Product information tabs */}
            <Separator className="mb-6" />
            
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="mb-4 w-full bg-gray-50">
                <TabsTrigger value="description" className="flex-1 font-montserrat">Descrição</TabsTrigger>
                <TabsTrigger value="details" className="flex-1 font-montserrat">Detalhes</TabsTrigger>
                <TabsTrigger value="care" className="flex-1 font-montserrat">Cuidados</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="text-gray-700 space-y-4 font-poppins">
                <p>{product.description || 'Sem descrição disponível.'}</p>
              </TabsContent>
              
              <TabsContent value="details" className="text-gray-700 space-y-6 font-poppins">
                {/* Dimensions */}
                {(product.width || product.height || product.depth) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center font-montserrat">
                      <Ruler className="h-5 w-5 mr-2 text-brand-purple" />
                      Dimensões
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {product.width && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm text-gray-500">Largura</div>
                          <div className="font-bold text-gray-800">{product.width} cm</div>
                        </div>
                      )}
                      {product.height && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm text-gray-500">Altura</div>
                          <div className="font-bold text-gray-800">{product.height} cm</div>
                        </div>
                      )}
                      {product.depth && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm text-gray-500">Profundidade</div>
                          <div className="font-bold text-gray-800">{product.depth} cm</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Material and Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.material && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 mb-2 font-montserrat">Material</h3>
                      <p>{product.material}</p>
                    </div>
                  )}
                  
                  {product.size_info && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 mb-2 font-montserrat">Informações de Tamanho</h3>
                      <p>{product.size_info}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="care" className="text-gray-700 space-y-4 font-poppins">
                {product.care_instructions ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 font-montserrat">Instruções de Cuidado</h3>
                    <p>{product.care_instructions}</p>
                  </div>
                ) : (
                  <p>Não há instruções de cuidado específicas para este produto.</p>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Social share */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3 font-montserrat">Compartilhar:</h3>
              <div className="flex gap-3">
                <a href="#" className="text-gray-600 hover:text-brand-purple p-2 rounded-full hover:bg-gray-100">
                  <Instagram size={20} />
                </a>
                {/* Add other social media icons as needed */}
              </div>
            </div>
          </div>
        </div>
        
        {/* Related products */}
        <div className="mt-16">
          <h2 className="text-2xl font-montserrat font-bold mb-8 relative pb-3">
            Você também pode gostar
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-brand-purple"></span>
          </h2>
          <ProductRelatedItems 
            productId={product.id} 
            isRental={product.is_rental || false} 
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
