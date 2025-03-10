import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, ChevronRight, ArrowLeft, Check, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProductProps } from '@/components/ProductCard';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');
  
  // Fetch product data from Supabase
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            product_images(*),
            product_sizes(*)
          `)
          .eq('id', id)
          .single();
          
        if (productError) throw productError;
        
        if (!productData) {
          throw new Error('Product not found');
        }
        
        // Transform to ProductProps
        const transformedProduct: ProductProps = {
          id: productData.id,
          name: productData.name,
          description: productData.description || '',
          price: productData.regular_price,
          rentalPrice: productData.rental_price,
          image: productData.product_images && productData.product_images.length > 0
            ? productData.product_images[0].image_url
            : "https://images.unsplash.com/photo-1555116505-38ab61800975?q=80&w=2670&auto=format&fit=crop",
          category: "Vestidos", // Default category, would need to fetch from joined table
          isRental: productData.is_rental || false,
          rentalIncludes: ["Vestido", "Coroa", "Terço", "Urso", "Sutiã"] // Default includes
        };
        
        return transformedProduct;
      } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
    },
  });
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Produto não encontrado",
        description: "O produto que você está procurando não existe ou foi removido.",
        variant: "destructive"
      });
      navigate('/shop');
    }
  }, [error, navigate]);
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: isFavorite ? "O produto foi removido da sua lista de desejos." : "O produto foi adicionado à sua lista de desejos.",
    });
  };
  
  const handleAddToCart = () => {
    if (product?.isRental && !selectedSize) {
      toast({
        title: "Selecione um tamanho",
        description: "Por favor, selecione um tamanho antes de adicionar ao carrinho.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: product?.isRental ? "Aluguel adicionado" : "Produto adicionado",
      description: product?.isRental 
        ? "O vestido foi adicionado ao seu carrinho de aluguel." 
        : "O produto foi adicionado ao seu carrinho de compras.",
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="loader"></div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!product) {
    return null; // Will redirect via the useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="main-container py-8">
          {/* Breadcrumb */}
          <div className="flex items-center mb-8 text-sm">
            <button 
              onClick={() => navigate('/shop')}
              className="flex items-center text-muted-foreground hover:text-brand-purple transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Voltar para a loja</span>
            </button>
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            <span>{product.category}</span>
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            <span className="text-brand-purple font-medium">{product.name}</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="glass-card p-4 rounded-2xl overflow-hidden">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                
                {product.isRental && (
                  <div className="absolute top-4 left-4 bg-brand-purple text-white px-3 py-1 rounded-full text-xs font-medium">
                    Aluguel
                  </div>
                )}
                
                <button 
                  onClick={toggleFavorite}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-white"
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-brand-purple text-brand-purple' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-montserrat font-semibold mb-2">{product.name}</h1>
                <p className="text-muted-foreground mb-4">{product.category}</p>
                
                <div className="flex items-baseline mb-6">
                  {product.isRental ? (
                    <>
                      <span className="text-3xl font-semibold text-brand-purple">R$ {product.rentalPrice?.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground ml-2">/ aluguel</span>
                    </>
                  ) : (
                    <span className="text-3xl font-semibold text-brand-purple">R$ {product.price.toFixed(2)}</span>
                  )}
                </div>
              </div>
              
              {/* Rental Includes */}
              {product.isRental && product.rentalIncludes && (
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-lg font-medium mb-4">Inclui no aluguel:</h3>
                  <ul className="space-y-2">
                    {product.rentalIncludes.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-brand-purple/10 flex items-center justify-center mr-3 flex-shrink-0">
                          <Check className="h-3 w-3 text-brand-purple" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Sizes */}
              {product.isRental && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Selecione o tamanho:</h3>
                  <div className="flex flex-wrap gap-3">
                    {['PP', 'P', 'M', 'G', 'GG'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all ${
                          selectedSize === size 
                            ? 'bg-brand-purple text-white shadow-md' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mr-2" />
                    <span>Não se preocupe com o tamanho, fazemos ajustes na entrega.</span>
                  </div>
                </div>
              )}
              
              {/* Quantity */}
              {!product.isRental && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Quantidade:</h3>
                  <div className="flex items-center">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="mx-4 w-10 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              
              {/* Add to Cart Button */}
              <button 
                onClick={handleAddToCart}
                className="button-primary w-full flex items-center justify-center"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                <span>{product.isRental ? 'Alugar agora' : 'Adicionar ao carrinho'}</span>
              </button>
              
              {/* Tabs */}
              <div>
                <div className="flex border-b">
                  <button 
                    onClick={() => setActiveTab('description')}
                    className={`py-3 px-6 text-sm font-medium ${
                      activeTab === 'description' 
                        ? 'border-b-2 border-brand-purple text-brand-purple' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    Descrição
                  </button>
                  <button 
                    onClick={() => setActiveTab('details')}
                    className={`py-3 px-6 text-sm font-medium ${
                      activeTab === 'details' 
                        ? 'border-b-2 border-brand-purple text-brand-purple' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    Detalhes
                  </button>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`py-3 px-6 text-sm font-medium ${
                      activeTab === 'reviews' 
                        ? 'border-b-2 border-brand-purple text-brand-purple' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    Avaliações
                  </button>
                </div>
                
                <div className="py-6">
                  {activeTab === 'description' && (
                    <div>
                      <p className="text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                  )}
                  
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-4 rounded-lg">
                          <h4 className="text-sm font-medium mb-1">Material</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.isRental ? 'Renda, Tule, Cetim' : 'Algodão, Poliéster'}
                          </p>
                        </div>
                        
                        <div className="glass-card p-4 rounded-lg">
                          <h4 className="text-sm font-medium mb-1">Cor</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.isRental ? 'Branco, Off-white' : 'Diversos'}
                          </p>
                        </div>
                        
                        <div className="glass-card p-4 rounded-lg">
                          <h4 className="text-sm font-medium mb-1">Tamanhos disponíveis</h4>
                          <p className="text-sm text-muted-foreground">
                            PP, P, M, G, GG
                          </p>
                        </div>
                        
                        <div className="glass-card p-4 rounded-lg">
                          <h4 className="text-sm font-medium mb-1">
                            {product.isRental ? 'Período de aluguel' : 'Garantia'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {product.isRental ? '3 dias' : '30 dias'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">Avaliações de clientes</h3>
                          <div className="flex items-center mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg 
                                  key={star}
                                  className="h-5 w-5 text-yellow-400" 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-muted-foreground">4.9 (45 avaliações)</span>
                          </div>
                        </div>
                        
                        <button className="button-secondary text-sm">Escrever avaliação</button>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Review 1 */}
                        <div className="glass-card p-6 rounded-xl">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-medium">Maria S.</h4>
                              <div className="flex mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg 
                                    key={star}
                                    className="h-4 w-4 text-yellow-400" 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">2 semanas atrás</span>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            "Amei o vestido! Ele ficou perfeito nas fotos e o atendimento foi excelente. Com certeza vou alugar novamente para as próximas sessões."
                          </p>
                        </div>
                        
                        {/* Review 2 */}
                        <div className="glass-card p-6 rounded-xl">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-medium">Ana P.</h4>
                              <div className="flex mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg 
                                    key={star}
                                    className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`} 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">1 mês atrás</span>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            "O vestido é lindo, mas precisei de alguns ajustes. A equipe foi muito prestativa e conseguiu fazer tudo a tempo para o meu ensaio. O resultado ficou incrível!"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
