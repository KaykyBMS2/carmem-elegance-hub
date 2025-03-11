
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Heart, ShoppingBag, TruckIcon, AlertCircle, Ruler } from 'lucide-react';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductRelatedItems from '@/components/ProductRelatedItems';

interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface ProductSize {
  id: string;
  size: string;
  is_universal: boolean;
}

interface ProductColor {
  id: string;
  color: string;
  color_code: string;
}

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

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
  care_instructions: string | null;
  size_info: string | null;
  width: number | null;
  height: number | null;
  depth: number | null;
  created_at: string;
  updated_at: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch product data
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (productError) throw productError;
        
        setProduct(productData);
        
        // Fetch product images
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id);
        
        if (imageError) throw imageError;
        
        setImages(imageData || []);
        
        // Fetch product sizes
        const { data: sizeData, error: sizeError } = await supabase
          .from('product_sizes')
          .select('*')
          .eq('product_id', id);
        
        if (sizeError) throw sizeError;
        
        setSizes(sizeData || []);
        
        // Fetch product colors
        const { data: colorData, error: colorError } = await supabase
          .from('product_colors')
          .select('*')
          .eq('product_id', id);
        
        if (colorError) throw colorError;
        
        setColors(colorData || []);
        
        // Fetch product categories
        const { data: categoryData, error: categoryError } = await supabase
          .from('product_categories')
          .select(`
            category_id,
            categories:category_id (id, name)
          `)
          .eq('product_id', id);
        
        if (categoryError) throw categoryError;
        
        setCategories(
          categoryData
            ? categoryData.map((item) => item.categories as Category)
            : []
        );
        
        // Fetch product tags
        const { data: tagData, error: tagError } = await supabase
          .from('product_tags')
          .select(`
            tag_id,
            tags:tag_id (id, name)
          `)
          .eq('product_id', id);
        
        if (tagError) throw tagError;
        
        setTags(
          tagData ? tagData.map((item) => item.tags as Tag) : []
        );
        
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os detalhes do produto.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);
  
  const handleAddToCart = () => {
    toast({
      title: 'Adicionado ao carrinho',
      description: `${product?.name} foi adicionado ao seu carrinho.`,
    });
  };
  
  const handleAddToWishlist = () => {
    toast({
      title: 'Adicionado à lista de desejos',
      description: `${product?.name} foi adicionado à sua lista de desejos.`,
    });
  };
  
  const getDisplayPrice = () => {
    if (!product) return '';
    
    if (product.promotional_price) {
      return (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-brand-purple">
            R$ {product.promotional_price.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-sm line-through text-gray-500">
            R$ {product.regular_price.toFixed(2).replace('.', ',')}
          </span>
        </div>
      );
    } else if (product.sale_price) {
      return (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-brand-purple">
            R$ {product.sale_price.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-sm line-through text-gray-500">
            R$ {product.regular_price.toFixed(2).replace('.', ',')}
          </span>
        </div>
      );
    } else {
      return (
        <span className="text-2xl font-semibold text-brand-purple">
          R$ {product.regular_price.toFixed(2).replace('.', ',')}
        </span>
      );
    }
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
          <AlertCircle size={48} className="text-brand-purple mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Produto não encontrado</h1>
          <p className="text-gray-600 mb-6">O produto que você está procurando não existe ou foi removido.</p>
          <Link to="/shop">
            <Button>Voltar para a loja</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:pt-24">
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-sm text-gray-500 hover:text-brand-purple">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link to="/shop" className="text-sm text-gray-500 hover:text-brand-purple">
                    Loja
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-sm text-gray-700 truncate max-w-[150px] md:max-w-xs">
                    {product.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <ProductImageGallery images={images} />
          </div>

          {/* Product Info */}
          <div className="bg-white/40 p-6 rounded-xl backdrop-blur-sm border border-gray-100 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <Badge key={category.id} variant="secondary" className="bg-gray-100 text-gray-800">
                  {category.name}
                </Badge>
              ))}
              {product.is_rental && (
                <Badge variant="default" className="bg-brand-purple text-white">
                  Aluguel
                </Badge>
              )}
            </div>
            
            <div className="mb-6">
              {getDisplayPrice()}
              {product.is_rental && product.rental_price && (
                <div className="mt-2 text-brand-purple font-medium">
                  Aluguel: R$ {product.rental_price.toFixed(2).replace('.', ',')}
                </div>
              )}
            </div>
            
            <div className="prose prose-sm max-w-none mb-6 text-gray-700">
              <p>{product.description}</p>
            </div>
            
            {(product.width || product.height || product.depth) && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg flex items-start gap-3">
                <Ruler className="h-5 w-5 text-brand-purple shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Dimensões</h3>
                  <p className="text-sm text-gray-600">
                    {product.width && `Largura: ${product.width} cm`}
                    {product.height && product.width && ' | '}
                    {product.height && `Altura: ${product.height} cm`}
                    {product.depth && (product.width || product.height) && ' | '}
                    {product.depth && `Profundidade: ${product.depth} cm`}
                  </p>
                </div>
              </div>
            )}
            
            {sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tamanho</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      className={`px-3 py-1 border rounded-md text-sm transition ${
                        selectedSize === size.id
                          ? 'bg-brand-purple text-white border-brand-purple'
                          : 'border-gray-300 hover:border-brand-purple'
                      } ${size.is_universal ? 'font-semibold' : ''}`}
                      onClick={() => setSelectedSize(selectedSize === size.id ? null : size.id)}
                    >
                      {size.size}{size.is_universal ? ' (Universal)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Cor</h3>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                        selectedColor === color.id
                          ? 'ring-2 ring-offset-2 ring-brand-purple'
                          : 'ring-1 ring-offset-1 ring-gray-300 hover:ring-brand-purple'
                      }`}
                      style={{ backgroundColor: color.color_code || '#ccc' }}
                      onClick={() => setSelectedColor(selectedColor === color.id ? null : color.id)}
                      title={color.color}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Material */}
            {product.material && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Material</h3>
                <p className="text-gray-600">{product.material}</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button className="flex-grow bg-brand-purple hover:bg-brand-purple/90" onClick={handleAddToCart}>
                <ShoppingBag className="h-5 w-5 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button variant="outline" className="border-brand-purple text-brand-purple hover:bg-brand-purple/10" onClick={handleAddToWishlist}>
                <Heart className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-3">
              <TruckIcon className="h-5 w-5 text-brand-purple shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Entrega</h4>
                <p className="text-gray-600 text-sm">
                  Enviamos para todo o Brasil. Frete grátis em compras acima de R$ 300,00.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="details" className="mb-12">
          <TabsList className="mb-6 bg-gray-100 p-1">
            <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-brand-purple">Detalhes</TabsTrigger>
            <TabsTrigger value="care" className="data-[state=active]:bg-white data-[state=active]:text-brand-purple">Cuidados</TabsTrigger>
            <TabsTrigger value="size" className="data-[state=active]:bg-white data-[state=active]:text-brand-purple">Tamanhos</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-brand-purple">Avaliações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="prose max-w-none bg-white/70 p-6 rounded-xl backdrop-blur-sm border border-gray-100 shadow-sm">
            <h3>Descrição</h3>
            <p>{product.description}</p>
            
            {product.material && (
              <>
                <h3>Material</h3>
                <p>{product.material}</p>
              </>
            )}
            
            {tags.length > 0 && (
              <>
                <h3>Tags</h3>
                <div className="flex flex-wrap gap-2 not-prose">
                  {tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="bg-white border-brand-purple text-gray-800">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="care" className="prose max-w-none bg-white/70 p-6 rounded-xl backdrop-blur-sm border border-gray-100 shadow-sm">
            <h3>Instruções de Cuidado</h3>
            {product.care_instructions ? (
              <p>{product.care_instructions}</p>
            ) : (
              <p>Não há instruções de cuidado específicas para este produto.</p>
            )}
          </TabsContent>
          
          <TabsContent value="size" className="prose max-w-none bg-white/70 p-6 rounded-xl backdrop-blur-sm border border-gray-100 shadow-sm">
            <h3>Informações de Tamanho</h3>
            {product.size_info ? (
              <p>{product.size_info}</p>
            ) : (
              <p>Não há informações de tamanho específicas para este produto.</p>
            )}
            
            {sizes.length > 0 && (
              <>
                <h4>Tamanhos Disponíveis</h4>
                <ul>
                  {sizes.map((size) => (
                    <li key={size.id}>
                      {size.size}{size.is_universal ? ' (Universal)' : ''}
                    </li>
                  ))}
                </ul>
              </>
            )}
            
            {(product.width || product.height || product.depth) && (
              <>
                <h4>Dimensões do Produto</h4>
                <ul>
                  {product.width && <li>Largura: {product.width} cm</li>}
                  {product.height && <li>Altura: {product.height} cm</li>}
                  {product.depth && <li>Profundidade: {product.depth} cm</li>}
                </ul>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="reviews" className="prose max-w-none bg-white/70 p-6 rounded-xl backdrop-blur-sm border border-gray-100 shadow-sm">
            <h3>Avaliações</h3>
            <p>Este produto ainda não possui avaliações.</p>
            
            <div className="mt-6 not-prose">
              <Button variant="outline" className="border-brand-purple text-brand-purple hover:bg-brand-purple/10">Escrever uma avaliação</Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {tags.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 font-montserrat">Você também pode gostar</h2>
            <ProductRelatedItems 
              productId={product.id} 
              tags={tags.map(tag => tag.id)} 
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
