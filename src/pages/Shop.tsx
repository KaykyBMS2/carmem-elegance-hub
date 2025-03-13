
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard, { ProductCardProps } from '@/components/ProductCard';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  ShoppingBag,
  Sliders,
  X
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import CartDrawer from '@/components/CartDrawer';

interface Category {
  id: string;
  name: string;
  description?: string;
}

const Shop = () => {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'rental'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  const productsPerPage = 14;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [currentPage, selectedCategories, searchQuery, filterType, sortOrder, priceRange]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        variant: 'destructive',
      });
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products')
        .select(`
          id,
          name,
          regular_price,
          sale_price,
          promotional_price,
          is_rental,
          rental_price,
          product_categories!inner (
            category_id,
            categories (
              id,
              name
            )
          ),
          product_images (
            id,
            image_url,
            is_primary
          )
        `, { count: 'exact' });

      // Apply filter type
      if (filterType === 'sale') {
        query = query.eq('is_rental', false);
      } else if (filterType === 'rental') {
        query = query.eq('is_rental', true);
      }

      // Apply search query
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Apply category filter
      if (selectedCategories.length > 0) {
        query = query.in('product_categories.category_id', selectedCategories);
      }

      // Apply price range filter
      query = query
        .gte('regular_price', priceRange[0])
        .lte('regular_price', priceRange[1]);

      // Apply sorting
      if (sortOrder === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortOrder === 'price_asc') {
        query = query.order('regular_price', { ascending: true });
      } else if (sortOrder === 'price_desc') {
        query = query.order('regular_price', { ascending: false });
      }

      // Calculate pagination
      const from = (currentPage - 1) * productsPerPage;
      const to = from + productsPerPage - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      
      if (count !== null) {
        setTotalProducts(count);
      }

      // Process data to format it correctly
      const formattedProducts = data.map((product: any) => {
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

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange([min, max]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    setFilterType('all');
    setPriceRange([0, 10000]);
    setSortOrder('newest');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4">
          {/* Hero Banner */}
          <div className="mb-8 bg-gradient-to-r from-gray-100 to-purple-50 rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold font-montserrat text-gray-800 mb-2">
                Loja Carmem Bezerra
              </h1>
              <p className="text-gray-600 max-w-lg font-poppins mb-6">
                Descubra nossa coleção exclusiva de produtos que combinam elegância e sofisticação para momentos especiais.
              </p>
              <Button className="bg-brand-purple hover:bg-brand-purple/90">
                Novidades
              </Button>
            </div>
            <div className="absolute right-0 top-0 w-64 h-full opacity-10">
              <img
                src="/lovable-uploads/0d678570-3b5f-4d61-83d2-3cc41bd837f5.png"
                alt="Carmem Bezerra Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          {/* Filters and Search Bar */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 pl-4 h-11 w-full"
                />
                <button 
                  type="submit" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-brand-purple"
                >
                  <Search size={18} />
                </button>
              </form>
            </div>
            
            <div className="flex gap-2">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden px-3 gap-1.5">
                    <Filter size={16} />
                    <span>Filtros</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-md">
                  <SheetHeader className="text-left mb-6">
                    <SheetTitle className="text-xl font-montserrat flex items-center">
                      <Sliders className="mr-2 h-5 w-5" />
                      Filtrar produtos
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="space-y-6">
                    {/* Filter by Type */}
                    <div>
                      <h3 className="text-sm font-medium mb-3 font-montserrat">Tipo de produto</h3>
                      <div className="space-y-2">
                        <Button
                          variant={filterType === 'all' ? 'default' : 'outline'}
                          size="sm"
                          className={`mr-2 ${filterType === 'all' ? 'bg-brand-purple hover:bg-brand-purple/90' : ''}`}
                          onClick={() => setFilterType('all')}
                        >
                          Todos
                        </Button>
                        <Button
                          variant={filterType === 'sale' ? 'default' : 'outline'}
                          size="sm"
                          className={`mr-2 ${filterType === 'sale' ? 'bg-brand-purple hover:bg-brand-purple/90' : ''}`}
                          onClick={() => setFilterType('sale')}
                        >
                          Venda
                        </Button>
                        <Button
                          variant={filterType === 'rental' ? 'default' : 'outline'}
                          size="sm"
                          className={`mr-2 ${filterType === 'rental' ? 'bg-brand-purple hover:bg-brand-purple/90' : ''}`}
                          onClick={() => setFilterType('rental')}
                        >
                          Aluguel
                        </Button>
                      </div>
                    </div>
                    
                    {/* Filter by Category */}
                    <div>
                      <h3 className="text-sm font-medium mb-3 font-montserrat">Categorias</h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center">
                            <Checkbox
                              id={`mobile-category-${category.id}`}
                              checked={selectedCategories.includes(category.id)}
                              onCheckedChange={() => handleCategoryChange(category.id)}
                              className="mr-2 data-[state=checked]:bg-brand-purple data-[state=checked]:border-brand-purple"
                            />
                            <label
                              htmlFor={`mobile-category-${category.id}`}
                              className="text-sm font-poppins cursor-pointer"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Filter by Price */}
                    <div>
                      <h3 className="text-sm font-medium mb-3 font-montserrat">Faixa de preço</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePriceRangeChange(0, 100)}
                          className={priceRange[0] === 0 && priceRange[1] === 100 ? 'border-brand-purple text-brand-purple' : ''}
                        >
                          Até R$ 100
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePriceRangeChange(100, 300)}
                          className={priceRange[0] === 100 && priceRange[1] === 300 ? 'border-brand-purple text-brand-purple' : ''}
                        >
                          R$ 100 - R$ 300
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePriceRangeChange(300, 500)}
                          className={priceRange[0] === 300 && priceRange[1] === 500 ? 'border-brand-purple text-brand-purple' : ''}
                        >
                          R$ 300 - R$ 500
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePriceRangeChange(500, 10000)}
                          className={priceRange[0] === 500 && priceRange[1] === 10000 ? 'border-brand-purple text-brand-purple' : ''}
                        >
                          Acima de R$ 500
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={clearFilters}>
                        Limpar filtros
                      </Button>
                      <SheetClose asChild>
                        <Button className="bg-brand-purple hover:bg-brand-purple/90">
                          Ver resultados
                        </Button>
                      </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Sort Order */}
              <div>
                <Select 
                  value={sortOrder} 
                  onValueChange={(value) => setSortOrder(value as any)}
                >
                  <SelectTrigger className="h-11 w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais recentes</SelectItem>
                    <SelectItem value="price_asc">Menor preço</SelectItem>
                    <SelectItem value="price_desc">Maior preço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Cart Button */}
              <CartDrawer />
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(selectedCategories.length > 0 || filterType !== 'all' || searchQuery || priceRange[0] > 0 || priceRange[1] < 10000) && (
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 font-poppins">Filtros ativos:</span>
                
                {filterType !== 'all' && (
                  <Badge variant="outline" className="flex items-center gap-1 font-poppins">
                    {filterType === 'sale' ? 'Venda' : 'Aluguel'}
                    <button onClick={() => setFilterType('all')} className="ml-1 text-gray-500 hover:text-gray-700">
                      <X size={14} />
                    </button>
                  </Badge>
                )}
                
                {searchQuery && (
                  <Badge variant="outline" className="flex items-center gap-1 font-poppins">
                    Busca: {searchQuery}
                    <button onClick={() => setSearchQuery('')} className="ml-1 text-gray-500 hover:text-gray-700">
                      <X size={14} />
                    </button>
                  </Badge>
                )}
                
                {selectedCategories.map(categoryId => {
                  const category = categories.find(c => c.id === categoryId);
                  return category ? (
                    <Badge key={categoryId} variant="outline" className="flex items-center gap-1 font-poppins">
                      {category.name}
                      <button onClick={() => handleCategoryChange(categoryId)} className="ml-1 text-gray-500 hover:text-gray-700">
                        <X size={14} />
                      </button>
                    </Badge>
                  ) : null;
                })}
                
                {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                  <Badge variant="outline" className="flex items-center gap-1 font-poppins">
                    Preço: R${priceRange[0]} - R${priceRange[1]}
                    <button onClick={() => setPriceRange([0, 10000])} className="ml-1 text-gray-500 hover:text-gray-700">
                      <X size={14} />
                    </button>
                  </Badge>
                )}
                
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm font-poppins">
                  Limpar todos
                </Button>
              </div>
            </div>
          )}
          
          {/* Desktop Sidebar and Products Grid */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-60 flex-shrink-0 space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 font-montserrat">Tipo de produto</h3>
                <div className="space-y-2">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className={`w-full justify-start ${filterType === 'all' ? 'bg-brand-purple hover:bg-brand-purple/90' : ''}`}
                    onClick={() => setFilterType('all')}
                  >
                    Todos os produtos
                  </Button>
                  <Button
                    variant={filterType === 'sale' ? 'default' : 'outline'}
                    size="sm"
                    className={`w-full justify-start ${filterType === 'sale' ? 'bg-brand-purple hover:bg-brand-purple/90' : ''}`}
                    onClick={() => setFilterType('sale')}
                  >
                    Produtos para venda
                  </Button>
                  <Button
                    variant={filterType === 'rental' ? 'default' : 'outline'}
                    size="sm"
                    className={`w-full justify-start ${filterType === 'rental' ? 'bg-brand-purple hover:bg-brand-purple/90' : ''}`}
                    onClick={() => setFilterType('rental')}
                  >
                    Produtos para aluguel
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4 font-montserrat">Categorias</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryChange(category.id)}
                        className="mr-2 data-[state=checked]:bg-brand-purple data-[state=checked]:border-brand-purple"
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-poppins cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4 font-montserrat">Faixa de preço</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePriceRangeChange(0, 100)}
                    className={`w-full justify-start ${priceRange[0] === 0 && priceRange[1] === 100 ? 'border-brand-purple text-brand-purple' : ''}`}
                  >
                    Até R$ 100
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePriceRangeChange(100, 300)}
                    className={`w-full justify-start ${priceRange[0] === 100 && priceRange[1] === 300 ? 'border-brand-purple text-brand-purple' : ''}`}
                  >
                    R$ 100 - R$ 300
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePriceRangeChange(300, 500)}
                    className={`w-full justify-start ${priceRange[0] === 300 && priceRange[1] === 500 ? 'border-brand-purple text-brand-purple' : ''}`}
                  >
                    R$ 300 - R$ 500
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePriceRangeChange(500, 10000)}
                    className={`w-full justify-start ${priceRange[0] === 500 && priceRange[1] === 10000 ? 'border-brand-purple text-brand-purple' : ''}`}
                  >
                    Acima de R$ 500
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                className="w-full"
              >
                Limpar filtros
              </Button>
            </div>
            
            {/* Products Grid */}
            <div className="flex-grow">
              {loading ? (
                <div className="py-16 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="py-16 flex flex-col items-center text-center">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2 font-montserrat">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md font-poppins">
                    Não encontramos produtos que correspondam aos seus critérios de busca. 
                    Tente ajustar os filtros ou realizar uma nova busca.
                  </p>
                  <Button onClick={clearFilters} className="bg-brand-purple hover:bg-brand-purple/90">
                    Limpar filtros
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-poppins">
                      Mostrando {(currentPage - 1) * productsPerPage + 1} - {Math.min(currentPage * productsPerPage, totalProducts)} de {totalProducts} produtos
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product) => (
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
                      />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="mr-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Show current page, first page, last page, and one page on either side of current
                            return (
                              page === 1 ||
                              page === totalPages ||
                              Math.abs(page - currentPage) <= 1
                            );
                          })
                          .map((page, i, array) => (
                            <React.Fragment key={page}>
                              {i > 0 && array[i - 1] !== page - 1 && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={currentPage === page ? "bg-brand-purple hover:bg-brand-purple/90" : ""}
                              >
                                {page}
                              </Button>
                            </React.Fragment>
                          ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="ml-2"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Shop;
