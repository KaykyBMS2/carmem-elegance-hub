import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useShop } from '@/contexts/ShopContext';
import { FavoriteItem } from '@/contexts/ShopContext';
import { Heart, HeartOff } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sale_price?: number | null;
  promo_price?: number | null;
  inventory: number;
  images: { image_url: string }[];
  categories?: { id: string; name: string }[];
  sale_start_date?: string | null;
  sale_end_date?: string | null;
  created_at: string;
  updated_at: string;
}

const Shop = () => {
  const navigate = useNavigate();
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [saleStatusFilter, setSaleStatusFilter] = useState('all');
  const { addToFavorites, removeFromFavorites, isInFavorites } = useShop();

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      return data as Product[];
    },
  });

  const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      return data;
    },
  });

  const handleAddToFavorites = (product: Product) => {
    const favoriteItem: FavoriteItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price || null,
      promoPrice: product.promo_price || null,
      imageUrl: product.images[0].image_url,
      isRental: false,
      rentalPrice: null,
    };
    addToFavorites(favoriteItem);
  };

  const handleRemoveFromFavorites = (productId: string) => {
    removeFromFavorites(productId);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Fix the deep instantiation error by simplifying the filter function
  // Replace the complex filtering logic with a simpler approach
  const filteredProducts = useMemo(() => {
    return products?.filter(product => {
      // Filter by search term
      const matchesSearch = searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by category
      const matchesCategory = selectedCategory === 'all' ||
        (product.categories && product.categories.some(cat => cat.id === selectedCategory));

      // Filter by price range
      const matchesPriceRange = (
        (product.price >= priceRange[0]) &&
        (product.price <= priceRange[1])
      );

      // Filter by availability
      const matchesAvailability = availabilityFilter === 'all' ||
        (availabilityFilter === 'in-stock' && product.inventory > 0) ||
        (availabilityFilter === 'out-of-stock' && product.inventory === 0);

      // Filter by sale status
      const matchesSaleStatus = saleStatusFilter === 'all' ||
        (saleStatusFilter === 'on-sale' && product.sale_price !== null) ||
        (saleStatusFilter === 'regular' && product.sale_price === null);

      return matchesSearch && matchesCategory && matchesPriceRange &&
        matchesAvailability && matchesSaleStatus;
    });
  }, [products, searchTerm, selectedCategory, priceRange, availabilityFilter, saleStatusFilter]);

  if (isLoading || isLoadingCategories) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (isError || isErrorCategories) {
    return <div className="flex justify-center items-center h-screen">Erro ao carregar os produtos.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Nossos Produtos</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Filters Section */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Filtrar produtos por categoria, preço e mais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Filter */}
              <div className="space-y-2">
                <Label htmlFor="search">Pesquisar</Label>
                <Input
                  type="text"
                  id="search"
                  placeholder="Pesquisar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Separator />

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <ScrollArea className="h-[200px] rounded-md border p-2">
                  <RadioGroup defaultValue={selectedCategory} onValueChange={setSelectedCategory}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="category-all" />
                      <Label htmlFor="category-all">Todas</Label>
                    </div>
                    {categories?.map((category) => (
                      <div className="flex items-center space-x-2" key={category.id}>
                        <RadioGroupItem value={category.id} id={`category-${category.id}`} />
                        <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </ScrollArea>
              </div>

              <Separator />

              {/* Price Range Filter */}
              <div className="space-y-2">
                <Label>Preço</Label>
                <div className="flex items-center justify-between">
                  <span>{formatCurrency(priceRange[0])}</span>
                  <span>{formatCurrency(priceRange[1])}</span>
                </div>
                <Slider
                  defaultValue={priceRange}
                  max={1000}
                  step={10}
                  onValueChange={(value) => setPriceRange(value)}
                />
              </div>

              <Separator />

              {/* Availability Filter */}
              <div className="space-y-2">
                <Label>Disponibilidade</Label>
                <Select defaultValue={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="in-stock">Em estoque</SelectItem>
                    <SelectItem value="out-of-stock">Esgotado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Sale Status Filter */}
              <div className="space-y-2">
                <Label>Status de Venda</Label>
                <Select defaultValue={saleStatusFilter} onValueChange={setSaleStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="on-sale">Em promoção</SelectItem>
                    <SelectItem value="regular">Preço normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Listing Section */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts?.map((product) => (
              <Card key={product.id} className="bg-white shadow-md rounded-md overflow-hidden">
                <div className="relative">
                  <img
                    src={product.images[0].image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {isInFavorites(product.id) ? (
                      <button onClick={() => handleRemoveFromFavorites(product.id)}>
                        <Heart className="text-red-500 h-6 w-6" />
                      </button>
                    ) : (
                      <button onClick={() => handleAddToFavorites(product)}>
                        <HeartOff className="text-gray-500 hover:text-red-500 h-6 w-6" />
                      </button>
                    )}
                  </div>
                  {product.sale_price !== null && (
                    <Badge className="absolute bottom-2 left-2 bg-green-500 text-white">
                      Em promoção
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-semibold line-clamp-1">{product.name}</CardTitle>
                  <CardDescription className="text-gray-500 line-clamp-2">{product.description}</CardDescription>
                  <div className="mt-2">
                    {product.sale_price !== null ? (
                      <>
                        <span className="text-red-500 font-bold">{formatCurrency(product.sale_price)}</span>
                        <span className="text-gray-500 line-through ml-2">{formatCurrency(product.price)}</span>
                      </>
                    ) : (
                      <span className="font-bold">{formatCurrency(product.price)}</span>
                    )}
                  </div>
                  <Button
                    className="mt-4 w-full bg-brand-purple hover:bg-brand-purple/90 text-white"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
