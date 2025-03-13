
import React, { useState, useEffect } from 'react';
import { useShop } from '@/contexts/ShopContext';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface Product {
  id: string;
  name: string;
  description: string | null;
  regular_price: number;
  sale_price: number | null;
  promotional_price: number | null;
  is_rental: boolean | null;
  rental_price: number | null;
  product_images: { image_url: string; is_primary: boolean | null }[];
  categories: { name: string }[];
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(14); // Changed to 14 products per page as requested
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = supabase
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
              image_url,
              is_primary
            ),
            categories (
              name
            )
          `);

        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        if (categoryFilter.length > 0) {
          query = query.in('category_id', categoryFilter);
        }

        query = query.gte('regular_price', priceRange[0]).lte('regular_price', priceRange[1]);

        query = query.order('regular_price', { ascending: sortOrder === 'asc' });

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching products:', error);
        } else {
          setProducts(data as Product[]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [searchQuery, categoryFilter, priceRange, sortOrder]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('id, name');
        if (error) {
          console.error('Error fetching categories:', error);
        } else {
          setCategories(data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setCategoryFilter((prev) => [...prev, categoryId]);
    } else {
      setCategoryFilter((prev) => prev.filter((id) => id !== categoryId));
    }
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
    setCurrentPage(1);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'asc' | 'desc');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter([]);
    setPriceRange([0, 1000]);
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(products.length / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold font-montserrat">Nossa Loja</h1>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Pesquisar produtos..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-brand-purple"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                {/* Categories Filter */}
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Categorias</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={categoryFilter.includes(category.id)}
                          onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
                        />
                        <Label htmlFor={`category-${category.id}`} className="ml-2">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Faixa de Preço</h3>
                  <div className="flex items-center justify-between">
                    <span>{formatCurrency(priceRange[0])}</span>
                    <span>{formatCurrency(priceRange[1])}</span>
                  </div>
                  <Slider
                    defaultValue={priceRange}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={handlePriceRangeChange}
                  />
                </div>

                {/* Sort Order */}
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Ordenar por Preço</h3>
                  <select
                    value={sortOrder}
                    onChange={handleSortOrderChange}
                    className="w-full rounded-md border border-gray-300 focus:outline-none focus:border-brand-purple"
                  >
                    <option value="asc">Menor Preço</option>
                    <option value="desc">Maior Preço</option>
                  </select>
                </div>
              </div>
              <SheetFooter>
                <div className="w-full flex justify-between">
                  <Button variant="ghost" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                  <SheetClose asChild>
                    <Button className="bg-brand-purple hover:bg-brand-purple/90">
                      Aplicar Filtros
                    </Button>
                  </SheetClose>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.regular_price}
            salePrice={product.sale_price}
            promoPrice={product.promotional_price}
            imageUrl={product.product_images.find((img) => img.is_primary)?.image_url || product.product_images[0]?.image_url || '/placeholder.svg'}
            isRental={product.is_rental}
            rentalPrice={product.rental_price}
          />
        ))}
      </div>

      {/* Pagination */}
      {products.length > productsPerPage && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <div className="flex items-center mx-2">
            {pageNumbers.map((number) => (
              <Button
                key={number}
                variant={currentPage === number ? 'default' : 'outline'}
                onClick={() => paginate(number)}
                className={cn(
                  "mx-1",
                  currentPage === number && "bg-brand-purple text-white hover:bg-brand-purple/90"
                )}
              >
                {number}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={currentPage === pageNumbers.length}
            onClick={() => paginate(currentPage + 1)}
          >
            Próxima
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Shop;
