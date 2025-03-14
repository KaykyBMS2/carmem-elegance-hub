
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useShop } from '@/contexts/ShopContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductRelatedItems from '@/components/ProductRelatedItems';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, ShoppingCart, Ruler, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import ProductRatingComponent from '@/components/ProductRating';
import { ProductRating } from '@/types/rating';

interface Product {
  id: string;
  name: string;
  description: string;
  regular_price: number;
  sale_price: number | null;
  promotional_price: number | null;
  is_rental: boolean;
  rental_price: number | null;
  material: string | null;
  size_info: string | null;
  care_instructions: string | null;
  width: number | null;
  height: number | null;
  depth: number | null;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [ratings, setRatings] = useState<ProductRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentalStartDate, setRentalStartDate] = useState<Date | undefined>(undefined);
  const [rentalEndDate, setRentalEndDate] = useState<Date | undefined>(undefined);
  const { addToCart } = useShop();
  const minimumRentalDays = 3; // Minimum rental period
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch product data
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (productError) throw productError;
        
        // Fetch product images
        const { data: imagesData, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('is_primary', { ascending: false });
        
        if (imagesError) throw imagesError;
        
        // Fetch product ratings
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('product_ratings')
          .select('*')
          .eq('product_id', id)
          .order('created_at', { ascending: false });
        
        if (ratingsError) throw ratingsError;
        
        setProduct(productData as Product);
        setImages(imagesData as ProductImage[]);
        setRatings(ratingsData as unknown as ProductRating[]);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleAddToCart = () => {
    if (!product) return;
    
    const primaryImage = images.find(img => img.is_primary)?.image_url || 
                         (images.length > 0 ? images[0].image_url : '/placeholder.svg');
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.regular_price,
      salePrice: product.sale_price,
      promoPrice: product.promotional_price,
      imageUrl: primaryImage,
      isRental: !!rentalStartDate && !!rentalEndDate,
      rentalPrice: product.rental_price
    });
  };
  
  const handleAddRating = (newRating: ProductRating) => {
    setRatings(prev => [newRating, ...prev]);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  // Calculate the rental price based on the number of days
  const calculateRentalTotal = () => {
    if (!product?.rental_price || !rentalStartDate || !rentalEndDate) return 0;
    
    const days = Math.max(
      1,
      Math.ceil((rentalEndDate.getTime() - rentalStartDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    
    return product.rental_price * days;
  };
  
  // Calculate the minimum end date based on start date
  const getMinimumEndDate = () => {
    if (!rentalStartDate) return undefined;
    
    const minDate = new Date(rentalStartDate);
    minDate.setDate(minDate.getDate() + minimumRentalDays);
    return minDate;
  };

  // Disable past dates and dates less than minimum rental period
  const isDateDisabled = (date: Date, type: 'start' | 'end') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (type === 'start') {
      return date < today;
    } else {
      if (!rentalStartDate) return true;
      
      const minEndDate = getMinimumEndDate();
      return date < (minEndDate || today);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-purple border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center p-4">
          <h1 className="text-2xl font-bold mb-2">Produto não encontrado</h1>
          <p className="text-gray-600 mb-6">
            Não foi possível encontrar o produto solicitado.
          </p>
          <Button asChild>
            <Link to="/shop">Voltar para a loja</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-6 md:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Product Images */}
            <div>
              <ProductImageGallery images={images.map(img => ({ url: img.image_url }))} />
            </div>
            
            {/* Product Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 font-montserrat">{product.name}</h1>
              
              <div className="mb-6">
                {product.promotional_price ? (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-2xl font-bold text-brand-purple">
                      {formatCurrency(product.promotional_price)}
                    </span>
                    <span className="text-lg line-through text-gray-500">
                      {formatCurrency(product.regular_price)}
                    </span>
                    <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded">
                      {Math.round((1 - product.promotional_price / product.regular_price) * 100)}% OFF
                    </span>
                  </div>
                ) : product.sale_price ? (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-2xl font-bold text-brand-purple">
                      {formatCurrency(product.sale_price)}
                    </span>
                    <span className="text-lg line-through text-gray-500">
                      {formatCurrency(product.regular_price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-brand-purple">
                    {formatCurrency(product.regular_price)}
                  </span>
                )}
                
                <div className="text-sm text-gray-500 mt-1">
                  ou em até 12x de {formatCurrency((product.promotional_price || product.sale_price || product.regular_price) / 12)}
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">{product.description}</p>
                
                {product.is_rental && product.rental_price && (
                  <Card className="mb-4">
                    <CardContent className="pt-4">
                      <h3 className="font-semibold mb-2">Opção de Aluguel</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Este produto está disponível para aluguel por {formatCurrency(product.rental_price)} por dia.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Data de Retirada</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !rentalStartDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {rentalStartDate ? (
                                  format(rentalStartDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione a data</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={rentalStartDate}
                                onSelect={(date) => {
                                  setRentalStartDate(date);
                                  // Reset end date if start date changes
                                  if (date && rentalEndDate && date > rentalEndDate) {
                                    setRentalEndDate(undefined);
                                  }
                                }}
                                disabled={(date) => isDateDisabled(date, 'start')}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Data de Devolução</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !rentalEndDate && "text-muted-foreground"
                                )}
                                disabled={!rentalStartDate}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {rentalEndDate ? (
                                  format(rentalEndDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione a data</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={rentalEndDate}
                                onSelect={setRentalEndDate}
                                disabled={(date) => isDateDisabled(date, 'end')}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      {rentalStartDate && rentalEndDate && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Valor Total do Aluguel:</span>
                            <span className="font-semibold text-brand-purple">
                              {formatCurrency(calculateRentalTotal())}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            De {format(rentalStartDate, "dd/MM/yyyy")} até {format(rentalEndDate, "dd/MM/yyyy")}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Adicionar ao Carrinho
                  </Button>
                  
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      handleAddToCart();
                      // Navigate to checkout
                      window.location.href = '/checkout';
                    }}
                  >
                    Comprar Agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <Tabs defaultValue="details">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
                  <TabsTrigger value="dimensions" className="flex-1">Dimensões</TabsTrigger>
                  <TabsTrigger value="care" className="flex-1">Cuidados</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="pt-4">
                  <div className="space-y-3">
                    {product.material && (
                      <div>
                        <h4 className="font-medium text-gray-800">Material</h4>
                        <p className="text-gray-600">{product.material}</p>
                      </div>
                    )}
                    
                    {product.size_info && (
                      <div>
                        <h4 className="font-medium text-gray-800">Informações de Tamanho</h4>
                        <p className="text-gray-600">{product.size_info}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="dimensions" className="pt-4">
                  {(product.width || product.height || product.depth) ? (
                    <div className="grid grid-cols-3 gap-4">
                      {product.width && (
                        <div className="text-center p-3 border rounded-md">
                          <Ruler className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                          <p className="text-sm text-gray-500">Largura</p>
                          <p className="font-medium">{product.width} cm</p>
                        </div>
                      )}
                      
                      {product.height && (
                        <div className="text-center p-3 border rounded-md">
                          <Ruler className="h-5 w-5 mx-auto mb-1 text-gray-500 transform rotate-90" />
                          <p className="text-sm text-gray-500">Altura</p>
                          <p className="font-medium">{product.height} cm</p>
                        </div>
                      )}
                      
                      {product.depth && (
                        <div className="text-center p-3 border rounded-md">
                          <Ruler className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                          <p className="text-sm text-gray-500">Profundidade</p>
                          <p className="font-medium">{product.depth} cm</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-2">Dimensões não especificadas</p>
                  )}
                </TabsContent>
                
                <TabsContent value="care" className="pt-4">
                  {product.care_instructions ? (
                    <div className="prose max-w-none">
                      <p className="text-gray-600">{product.care_instructions}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-2">
                      Instruções de cuidados não especificadas
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Product Ratings */}
          <ProductRatingComponent 
            productId={product.id} 
            ratings={ratings}
            onRatingAdded={handleAddRating}
          />
          
          {/* Related Products */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Produtos Relacionados</h2>
            <ProductRelatedItems currentProductId={product.id} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
