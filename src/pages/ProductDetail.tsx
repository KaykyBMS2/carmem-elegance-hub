
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, ChevronRight, ArrowLeft, Check, Info, Star, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProductProps } from '@/components/ProductCard';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ProductSize {
  id: string;
  product_id: string;
  size: string;
  is_universal: boolean;
}

interface ProductDetail {
  material?: string;
  color?: string;
  duration?: string;
  size_info?: string;
  care_instructions?: string;
  available_sizes?: string[];
}

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  image: string;
  regular_price: number;
  rental_price: number | null;
  is_rental: boolean;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  
  // Fetch product data from Supabase
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        console.log("Fetching product with ID:", id);
        
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            product_images(*),
            product_sizes(*)
          `)
          .eq('id', id)
          .single();
          
        if (productError) {
          console.error("Error fetching product:", productError);
          throw productError;
        }
        
        if (!productData) {
          console.error("Product not found");
          throw new Error('Product not found');
        }
        
        console.log("Product data:", productData);
        
        // Transform to ProductProps
        const transformedProduct: ProductProps & {details?: ProductDetail, sizes?: ProductSize[]} = {
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
          rentalIncludes: ["Vestido", "Coroa", "Terço", "Urso", "Sutiã"], // Default includes
          sizes: productData.product_sizes || [],
          details: {
            material: productData.material || 'Algodão, Poliéster',
            color: productData.color || 'Diversos',
            duration: productData.is_rental ? '3 dias' : 'N/A',
            available_sizes: productData.product_sizes ? productData.product_sizes.map((size: ProductSize) => size.size) : ['PP', 'P', 'M', 'G', 'GG'],
            care_instructions: productData.care_instructions || 'Lavar à mão',
            size_info: productData.size_info || 'Medidas aproximadas'
          }
        };
        
        return transformedProduct;
      } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
    },
  });
  
  // Fetch reviews
  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('*, user_profiles(name)')
          .eq('product_id', id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        return data.map((review: any) => ({
          id: review.id,
          product_id: review.product_id,
          user_id: review.user_id,
          user_name: review.user_profiles?.name || 'Usuário anônimo',
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at
        }));
      } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }
    },
    enabled: !!id
  });
  
  // Fetch related products (products with same tags)
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related-products', id],
    queryFn: async () => {
      try {
        // First get the product's tags
        const { data: productTags } = await supabase
          .from('product_tags')
          .select('tag_id')
          .eq('product_id', id);
          
        if (!productTags || productTags.length === 0) return [];
        
        const tagIds = productTags.map(pt => pt.tag_id);
        
        // Then find other products with the same tags
        const { data: relatedProductIds } = await supabase
          .from('product_tags')
          .select('product_id')
          .in('tag_id', tagIds)
          .neq('product_id', id) // Exclude the current product
          .limit(4);
          
        if (!relatedProductIds || relatedProductIds.length === 0) return [];
        
        // Finally get the details of these related products
        const relatedIds = [...new Set(relatedProductIds.map(rp => rp.product_id))]; // Remove duplicates
        
        const { data: relatedProductsData } = await supabase
          .from('products')
          .select(`
            id, 
            name, 
            regular_price, 
            rental_price, 
            is_rental,
            product_images(image_url)
          `)
          .in('id', relatedIds)
          .limit(4);
          
        if (!relatedProductsData) return [];
        
        return relatedProductsData.map((prod: any) => ({
          id: prod.id,
          name: prod.name,
          regular_price: prod.regular_price,
          rental_price: prod.rental_price,
          is_rental: prod.is_rental,
          image: prod.product_images && prod.product_images.length > 0
            ? prod.product_images[0].image_url
            : "https://images.unsplash.com/photo-1555116505-38ab61800975?q=80&w=2670&auto=format&fit=crop"
        }));
      } catch (error) {
        console.error('Error fetching related products:', error);
        return [];
      }
    },
    enabled: !!id
  });
  
  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: async (newReview: { 
      product_id: string, 
      rating: number, 
      comment: string 
    }) => {
      if (!user) throw new Error('User must be logged in to leave a review');
      
      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: newReview.product_id,
          user_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Clear form and refetch reviews
      setReviewText('');
      refetchReviews();
      
      toast({
        title: 'Avaliação enviada',
        description: 'Obrigado por compartilhar sua opinião sobre este produto.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao enviar avaliação',
        description: error.message || 'Ocorreu um erro. Tente novamente mais tarde.',
        variant: 'destructive'
      });
    }
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
  
  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      toast({
        title: "Faça login para avaliar",
        description: "É necessário estar logado para deixar uma avaliação.",
        variant: "destructive"
      });
      return;
    }
    
    if (!reviewText.trim()) {
      toast({
        title: "Avaliação vazia",
        description: "Por favor, escreva algo sobre o produto.",
        variant: "destructive"
      });
      return;
    }
    
    addReviewMutation.mutate({
      product_id: id || '',
      rating,
      comment: reviewText
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
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
              {product.isRental && product.details?.available_sizes && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Selecione o tamanho:</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.details.available_sizes.map((size) => (
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
                            {product.details?.material || 'Não especificado'}
                          </p>
                        </div>
                        
                        <div className="glass-card p-4 rounded-lg">
                          <h4 className="text-sm font-medium mb-1">Cor</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.details?.color || 'Não especificado'}
                          </p>
                        </div>
                        
                        <div className="glass-card p-4 rounded-lg">
                          <h4 className="text-sm font-medium mb-1">Tamanhos disponíveis</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.details?.available_sizes?.join(', ') || 'Não especificado'}
                          </p>
                        </div>
                        
                        <div className="glass-card p-4 rounded-lg">
                          <h4 className="text-sm font-medium mb-1">
                            {product.isRental ? 'Período de aluguel' : 'Garantia'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {product.isRental ? product.details?.duration || '3 dias' : '30 dias'}
                          </p>
                        </div>
                        
                        <div className="glass-card p-4 rounded-lg col-span-2">
                          <h4 className="text-sm font-medium mb-1">Instruções de cuidado</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.details?.care_instructions || 'Não especificado'}
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
                                <Star 
                                  key={star}
                                  className="h-5 w-5 text-yellow-400" 
                                  fill={reviews.length > 0 ? "currentColor" : "none"}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {reviews.length > 0 
                                ? `${(reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)} (${reviews.length} avaliações)` 
                                : 'Seja o primeiro a avaliar'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Add review */}
                      <div className="glass-card p-6 rounded-xl">
                        <h4 className="font-medium mb-3">Deixe sua avaliação</h4>
                        <div className="mb-3">
                          <div className="flex items-center">
                            <div className="flex mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                  key={star}
                                  onClick={() => setRating(star)}
                                  className="focus:outline-none"
                                >
                                  <Star 
                                    className="h-6 w-6 text-yellow-400" 
                                    fill={star <= rating ? "currentColor" : "none"}
                                  />
                                </button>
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-muted-foreground">{rating} de 5 estrelas</span>
                          </div>
                        </div>
                        <Textarea 
                          placeholder="Compartilhe sua experiência com o produto..." 
                          className="mb-3"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                        />
                        <Button 
                          onClick={handleSubmitReview}
                          disabled={addReviewMutation.isPending || !reviewText.trim()}
                          className="flex items-center"
                        >
                          {addReviewMutation.isPending 
                            ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div> 
                            : <Send className="h-4 w-4 mr-2" />}
                          Enviar avaliação
                        </Button>
                      </div>
                      
                      {/* Reviews list */}
                      <div className="space-y-6">
                        {reviews.length > 0 ? (
                          reviews.map((review) => (
                            <div key={review.id} className="glass-card p-6 rounded-xl">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="font-medium">{review.user_name}</h4>
                                  <div className="flex mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star 
                                        key={star}
                                        className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                        fill="currentColor"
                                      />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString('pt-BR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <p className="text-muted-foreground text-sm">{review.comment}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            Ainda não há avaliações para este produto.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-montserrat font-semibold mb-8">Produtos relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.map((related) => (
                  <div key={related.id} className="glass-card rounded-xl overflow-hidden transition-transform hover:scale-102">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img src={related.image} alt={related.name} className="w-full h-full object-cover" />
                      {related.is_rental && (
                        <div className="absolute top-3 left-3 bg-brand-purple text-white text-xs px-2 py-1 rounded-full">
                          Aluguel
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-1 line-clamp-1">{related.name}</h3>
                      <div className="text-brand-purple font-semibold">
                        {related.is_rental && related.rental_price 
                          ? `R$ ${related.rental_price.toFixed(2)}` 
                          : `R$ ${related.regular_price.toFixed(2)}`}
                      </div>
                      <button 
                        onClick={() => navigate(`/product/${related.id}`)}
                        className="w-full mt-3 py-2 text-center text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
