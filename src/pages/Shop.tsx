
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// Define el tipo para un producto
type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  category?: string;
  isRental: boolean;
  rentalPrice?: number;
  rentalIncludes?: string[];
  salePrice?: number;
  promoPrice?: number;
};

type Category = {
  id: string;
  name: string;
};

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    categories: [] as string[],
    rental: false,
    purchase: false,
    priceRange: { min: 0, max: 1000 },
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            product_categories(
              categories(id, name)
            ),
            product_images(*)
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform the data to match the Product type
        const transformedProducts: Product[] = (data || []).map((item) => {
          // Find primary image or first image
          let imageUrl = '/placeholder.svg';
          if (item.product_images && item.product_images.length > 0) {
            const primaryImage = item.product_images.find((img: any) => img.is_primary);
            imageUrl = primaryImage ? primaryImage.image_url : item.product_images[0].image_url;
          }
          
          // Extract category information
          let category = "";
          if (item.product_categories && item.product_categories.length > 0 && 
              item.product_categories[0].categories) {
            category = item.product_categories[0].categories.id;
          }

          return {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.regular_price,
            imageUrl: imageUrl,
            category: category,
            isRental: item.is_rental || false,
            rentalPrice: item.rental_price,
            salePrice: item.sale_price,
            promoPrice: item.promotional_price
          };
        });

        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os produtos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [toast]);

  // Filter products based on search term and filters
  const filteredProducts = products.filter((product) => {
    // Search term filter
    if (
      searchTerm &&
      !product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.category || "")
    ) {
      return false;
    }

    // Rental/Purchase filter
    if (filters.rental && !product.isRental) return false;
    if (filters.purchase && product.isRental) return false;

    // Price range filter
    if (
      product.price < filters.priceRange.min ||
      product.price > filters.priceRange.max
    ) {
      return false;
    }

    return true;
  });

  const toggleCategoryFilter = (categoryId: string) => {
    setFilters((prev) => {
      const categories = prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId];
      return { ...prev, categories };
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      rental: false,
      purchase: false,
      priceRange: { min: 0, max: 1000 },
    });
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-start mb-10">
            <h1 className="text-3xl font-bold font-montserrat mb-2">Loja</h1>
            <p className="text-muted-foreground mb-6">
              Explore nossa seleção de produtos e vestidos para aluguel
            </p>

            {/* Search and filter bar */}
            <div className="w-full flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  className="w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
              {(filters.categories.length > 0 ||
                filters.rental ||
                filters.purchase ||
                searchTerm) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-sm text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" /> Limpar filtros
                </Button>
              )}
            </div>

            {/* Filter panel */}
            {filtersOpen && (
              <div className="w-full mt-4 p-4 bg-white border rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Categories */}
                  <div>
                    <h3 className="font-medium mb-3">Categorias</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={filters.categories.includes(category.id)}
                            onCheckedChange={() =>
                              toggleCategoryFilter(category.id)
                            }
                          />
                          <label
                            htmlFor={`category-${category.id}`}
                            className="ml-2 text-sm font-medium"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <h3 className="font-medium mb-3">Tipo</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Checkbox
                          id="rental"
                          checked={filters.rental}
                          onCheckedChange={(checked) =>
                            setFilters({ ...filters, rental: checked === true })
                          }
                        />
                        <label
                          htmlFor="rental"
                          className="ml-2 text-sm font-medium"
                        >
                          Aluguel
                        </label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                          id="purchase"
                          checked={filters.purchase}
                          onCheckedChange={(checked) =>
                            setFilters({
                              ...filters,
                              purchase: checked === true,
                            })
                          }
                        />
                        <label
                          htmlFor="purchase"
                          className="ml-2 text-sm font-medium"
                        >
                          Compra
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium mb-3">Faixa de Preço</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Min
                          </label>
                          <Input
                            type="number"
                            value={filters.priceRange.min}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                priceRange: {
                                  ...filters.priceRange,
                                  min: Number(e.target.value),
                                },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Max
                          </label>
                          <Input
                            type="number"
                            value={filters.priceRange.max}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                priceRange: {
                                  ...filters.priceRange,
                                  max: Number(e.target.value),
                                },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-purple border-t-transparent"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
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
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar seus filtros ou buscar por outro termo.
              </p>
              <Button onClick={clearFilters}>Limpar filtros</Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
