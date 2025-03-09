
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileEdit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Hash,
  ShoppingBag,
  DollarSign,
  Tag
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  description: string;
  regular_price: number;
  sale_price: number | null;
  promotional_price: number | null;
  is_rental: boolean;
  rental_price: number | null;
  created_at: string;
  categories?: Array<{ id: string; name: string }>;
  primary_image?: string;
}

interface ProductWithDetails extends Omit<Product, 'categories'> {
  categories: Array<{ id: string; name: string }>;
  primary_image: string | null;
}

const Products = () => {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filterBy]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("products").select(`
        *,
        product_categories!inner (
          categories (id, name)
        ),
        product_images!inner (
          image_url,
          is_primary
        )
      `);

      // Apply filters
      if (filterBy === "rental") {
        query = query.eq("is_rental", true);
      } else if (filterBy === "sale") {
        query = query.eq("is_rental", false);
      }

      // Apply search if provided
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      // Calculate pagination
      const from = (currentPage - 1) * productsPerPage;
      const to = from + productsPerPage - 1;

      // Get count for pagination
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Set total pages
      if (count) {
        setTotalPages(Math.ceil(count / productsPerPage));
      }

      // Fetch products with pagination
      const { data, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Process data to format it correctly
      const formattedProducts = data.map((product: any) => {
        // Extract categories
        const categories = product.product_categories
          ? product.product_categories.map((pc: any) => pc.categories)
          : [];

        // Find primary image
        const primaryImage = product.product_images
          ? product.product_images.find((pi: any) => pi.is_primary)?.image_url
          : null;

        return {
          ...product,
          categories,
          primary_image: primaryImage,
        };
      });

      setProducts(formattedProducts);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleFilterChange = (filter: string) => {
    setFilterBy(filter);
    setCurrentPage(1);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id);

      if (error) throw error;

      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });

      // Refresh product list
      fetchProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      });
    } finally {
      setProductToDelete(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <AdminLayout title="Produtos">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center rounded-md bg-brand-purple px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Link>
      </div>

      <Card className="overflow-hidden border bg-white shadow-sm">
        <div className="border-b p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search input */}
            <div className="flex w-full max-w-md items-center rounded-md border bg-white shadow-sm">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full rounded-l-md border-0 px-4 py-2 focus:outline-none focus:ring-0"
              />
              <button
                onClick={handleSearch}
                className="rounded-r-md bg-gray-50 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <Search size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Filters */}
              <div className="flex items-center rounded-md border bg-white shadow-sm">
                <button
                  onClick={() => handleFilterChange("all")}
                  className={`rounded-l-md px-3 py-2 text-sm font-medium ${
                    filterBy === "all"
                      ? "bg-brand-purple text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => handleFilterChange("sale")}
                  className={`px-3 py-2 text-sm font-medium ${
                    filterBy === "sale"
                      ? "bg-brand-purple text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Vendas
                </button>
                <button
                  onClick={() => handleFilterChange("rental")}
                  className={`rounded-r-md px-3 py-2 text-sm font-medium ${
                    filterBy === "rental"
                      ? "bg-brand-purple text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Aluguéis
                </button>
              </div>

              {/* Refresh button */}
              <button
                onClick={() => fetchProducts()}
                className="rounded-md border bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700"
                title="Atualizar"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Products table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    <Hash size={14} />
                    ID
                  </div>
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    <ShoppingBag size={14} />
                    Produto
                  </div>
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    <Tag size={14} />
                    Categorias
                  </div>
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} />
                    Preço
                  </div>
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                  Tipo
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-purple border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                      {product.id.split("-")[0]}...
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {product.primary_image ? (
                            <img
                              src={product.primary_image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                              <ShoppingBag size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.description?.substring(0, 40)}
                            {product.description && product.description.length > 40
                              ? "..."
                              : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.categories && product.categories.length > 0 ? (
                          product.categories.map((category, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-gray-100"
                            >
                              {category.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">
                            Sem categorias
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {formatCurrency(product.regular_price)}
                        </p>
                        {product.sale_price && (
                          <p className="text-xs text-green-600">
                            Em promoção: {formatCurrency(product.sale_price)}
                          </p>
                        )}
                        {product.is_rental && product.rental_price && (
                          <p className="text-xs text-blue-600">
                            Aluguel: {formatCurrency(product.rental_price)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`${
                          product.is_rental
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {product.is_rental ? "Aluguel" : "Venda"}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          title="Editar"
                        >
                          <FileEdit size={18} />
                        </Link>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => setProductToDelete(product)}
                              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-500"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Excluir Produto</DialogTitle>
                              <DialogDescription>
                                Tem certeza que deseja excluir o produto "
                                {productToDelete?.name}"? Esta ação não pode ser
                                desfeita.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="mt-4 flex gap-2">
                              <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteProduct}
                              >
                                Excluir
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && products.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-gray-500">
              Mostrando{" "}
              <span className="font-medium">
                {(currentPage - 1) * productsPerPage + 1}
              </span>{" "}
              a{" "}
              <span className="font-medium">
                {Math.min(currentPage * productsPerPage, products.length)}
              </span>{" "}
              de <span className="font-medium">{products.length}</span> produtos
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-md border bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="rounded-md border bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
};

export default Products;
