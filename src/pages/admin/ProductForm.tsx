
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "@/hooks/use-toast";
import {
  Save,
  X,
  Plus,
  Trash2,
  ArrowLeft,
  Upload,
  Image,
  Check,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface ProductSize {
  id?: string;
  size: string;
  is_universal: boolean;
}

interface ProductColor {
  id?: string;
  color: string;
  color_code: string;
}

interface ProductImage {
  id?: string;
  image_url: string;
  is_primary: boolean;
  file?: File;
  preview?: string;
}

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    regular_price: "",
    sale_price: "",
    promotional_price: "",
    is_rental: false,
    rental_price: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [newSize, setNewSize] = useState({ size: "", is_universal: false });
  
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [newColor, setNewColor] = useState({ color: "", color_code: "#ffffff" });
  
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from("categories").select("*");
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchTags = async () => {
      try {
        const { data, error } = await supabase.from("tags").select("*");
        if (error) throw error;
        setTags(data || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchCategories();
    fetchTags();

    if (isEditMode) {
      fetchProduct();
    }
  }, [id, isEditMode]);

  const fetchProduct = async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Fetch product data
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fetch product categories
      const { data: productCategories, error: categoriesError } = await supabase
        .from("product_categories")
        .select("category_id")
        .eq("product_id", id);

      if (categoriesError) throw categoriesError;

      // Fetch product tags
      const { data: productTags, error: tagsError } = await supabase
        .from("product_tags")
        .select("tag_id")
        .eq("product_id", id);

      if (tagsError) throw tagsError;

      // Fetch product sizes
      const { data: productSizes, error: sizesError } = await supabase
        .from("product_sizes")
        .select("*")
        .eq("product_id", id);

      if (sizesError) throw sizesError;

      // Fetch product colors
      const { data: productColors, error: colorsError } = await supabase
        .from("product_colors")
        .select("*")
        .eq("product_id", id);

      if (colorsError) throw colorsError;

      // Fetch product images
      const { data: productImages, error: imagesError } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id);

      if (imagesError) throw imagesError;

      // Set product data
      setProductData({
        name: product.name || "",
        description: product.description || "",
        regular_price: product.regular_price?.toString() || "",
        sale_price: product.sale_price?.toString() || "",
        promotional_price: product.promotional_price?.toString() || "",
        is_rental: product.is_rental || false,
        rental_price: product.rental_price?.toString() || "",
      });

      // Set selected categories
      setSelectedCategories(
        productCategories ? productCategories.map((pc) => pc.category_id) : []
      );

      // Set selected tags
      setSelectedTags(
        productTags ? productTags.map((pt) => pt.tag_id) : []
      );

      // Set sizes
      setSizes(productSizes || []);

      // Set colors
      setColors(productColors || []);

      // Set images
      setImages(productImages || []);

    } catch (error: any) {
      console.error("Error fetching product:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do produto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleRental = () => {
    setProductData((prev) => ({ ...prev, is_rental: !prev.is_rental }));
  };

  const addSize = () => {
    if (!newSize.size.trim()) return;
    
    setSizes((prev) => [...prev, { ...newSize }]);
    setNewSize({ size: "", is_universal: false });
  };

  const removeSize = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const addColor = () => {
    if (!newColor.color.trim()) return;
    
    setColors((prev) => [...prev, { ...newColor }]);
    setNewColor({ color: "", color_code: "#ffffff" });
  };

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      image_url: "",
      is_primary: images.length === 0, // First image is primary by default
      file,
      preview: URL.createObjectURL(file),
    }));
    
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      // Create a copy without the removed image
      const newImages = prev.filter((_, i) => i !== index);
      
      // If removed image was primary and there are other images, set the first one as primary
      if (prev[index]?.is_primary && newImages.length > 0) {
        return newImages.map((img, i) => i === 0 ? { ...img, is_primary: true } : img);
      }
      
      return newImages;
    });
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === index }))
    );
  };

  const uploadImages = async (productId: string) => {
    const imagesToUpload = images.filter((img) => img.file);
    
    if (imagesToUpload.length === 0) return [];
    
    setIsUploading(true);
    const uploadedImages = [];
    
    try {
      for (let i = 0; i < imagesToUpload.length; i++) {
        const img = imagesToUpload[i];
        if (!img.file) continue;
        
        // Calculate progress
        const progress = Math.round(((i + 1) / imagesToUpload.length) * 100);
        setUploadProgress(progress);
        
        // Create a unique file name
        const fileName = `${productId}/${Date.now()}-${img.file.name.replace(/\s/g, "_")}`;
        
        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, img.file);
        
        if (error) throw error;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        
        uploadedImages.push({
          image_url: urlData.publicUrl,
          is_primary: img.is_primary,
        });
      }
      
      return uploadedImages;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const saveProduct = async () => {
    // Basic validation
    if (!productData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    
    if (!productData.regular_price) {
      toast({
        title: "Erro",
        description: "O preço regular é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    
    if (productData.is_rental && !productData.rental_price) {
      toast({
        title: "Erro",
        description: "O preço de aluguel é obrigatório para produtos de aluguel.",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    
    try {
      // Save product data
      let productId = id;
      
      if (isEditMode) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({
            name: productData.name,
            description: productData.description,
            regular_price: parseFloat(productData.regular_price),
            sale_price: productData.sale_price ? parseFloat(productData.sale_price) : null,
            promotional_price: productData.promotional_price ? parseFloat(productData.promotional_price) : null,
            is_rental: productData.is_rental,
            rental_price: productData.rental_price ? parseFloat(productData.rental_price) : null,
          })
          .eq("id", id);
        
        if (error) throw error;
      } else {
        // Create new product
        const { data, error } = await supabase
          .from("products")
          .insert({
            name: productData.name,
            description: productData.description,
            regular_price: parseFloat(productData.regular_price),
            sale_price: productData.sale_price ? parseFloat(productData.sale_price) : null,
            promotional_price: productData.promotional_price ? parseFloat(productData.promotional_price) : null,
            is_rental: productData.is_rental,
            rental_price: productData.rental_price ? parseFloat(productData.rental_price) : null,
          })
          .select("id")
          .single();
        
        if (error) throw error;
        productId = data.id;
      }
      
      if (!productId) throw new Error("Product ID is missing");
      
      // Upload new images
      let newUploadedImages: any[] = [];
      if (images.some((img) => img.file)) {
        newUploadedImages = await uploadImages(productId);
      }
      
      // Save images metadata to database
      if (isEditMode) {
        // Delete existing images first (only DB records, not actual files)
        const existingImageIds = images
          .filter((img) => img.id)
          .map((img) => img.id);
        
        // Delete images not in the current list
        if (existingImageIds.length > 0) {
          const { error } = await supabase
            .from("product_images")
            .delete()
            .eq("product_id", productId)
            .not("id", "in", `(${existingImageIds.join(",")})`);
          
          if (error) throw error;
          
          // Update existing images (e.g., is_primary status)
          for (const img of images.filter((img) => img.id)) {
            const { error } = await supabase
              .from("product_images")
              .update({ is_primary: img.is_primary })
              .eq("id", img.id);
            
            if (error) throw error;
          }
        }
      } else {
        // For new products, all images were just uploaded
      }
      
      // Insert new uploaded images
      if (newUploadedImages.length > 0) {
        const imagesToInsert = newUploadedImages.map((img) => ({
          product_id: productId,
          image_url: img.image_url,
          is_primary: img.is_primary,
        }));
        
        const { error } = await supabase
          .from("product_images")
          .insert(imagesToInsert);
        
        if (error) throw error;
      }
      
      // Handle categories
      if (isEditMode) {
        // Delete existing categories
        const { error: deleteCategoriesError } = await supabase
          .from("product_categories")
          .delete()
          .eq("product_id", productId);
        
        if (deleteCategoriesError) throw deleteCategoriesError;
      }
      
      // Insert categories
      if (selectedCategories.length > 0) {
        const categoriesToInsert = selectedCategories.map((categoryId) => ({
          product_id: productId,
          category_id: categoryId,
        }));
        
        const { error: insertCategoriesError } = await supabase
          .from("product_categories")
          .insert(categoriesToInsert);
        
        if (insertCategoriesError) throw insertCategoriesError;
      }
      
      // Handle tags
      if (isEditMode) {
        // Delete existing tags
        const { error: deleteTagsError } = await supabase
          .from("product_tags")
          .delete()
          .eq("product_id", productId);
        
        if (deleteTagsError) throw deleteTagsError;
      }
      
      // Insert tags
      if (selectedTags.length > 0) {
        const tagsToInsert = selectedTags.map((tagId) => ({
          product_id: productId,
          tag_id: tagId,
        }));
        
        const { error: insertTagsError } = await supabase
          .from("product_tags")
          .insert(tagsToInsert);
        
        if (insertTagsError) throw insertTagsError;
      }
      
      // Handle sizes
      if (isEditMode) {
        // Delete existing sizes
        const { error: deleteSizesError } = await supabase
          .from("product_sizes")
          .delete()
          .eq("product_id", productId);
        
        if (deleteSizesError) throw deleteSizesError;
      }
      
      // Insert sizes
      if (sizes.length > 0) {
        const sizesToInsert = sizes.map((size) => ({
          product_id: productId,
          size: size.size,
          is_universal: size.is_universal,
        }));
        
        const { error: insertSizesError } = await supabase
          .from("product_sizes")
          .insert(sizesToInsert);
        
        if (insertSizesError) throw insertSizesError;
      }
      
      // Handle colors
      if (isEditMode) {
        // Delete existing colors
        const { error: deleteColorsError } = await supabase
          .from("product_colors")
          .delete()
          .eq("product_id", productId);
        
        if (deleteColorsError) throw deleteColorsError;
      }
      
      // Insert colors
      if (colors.length > 0) {
        const colorsToInsert = colors.map((color) => ({
          product_id: productId,
          color: color.color,
          color_code: color.color_code,
        }));
        
        const { error: insertColorsError } = await supabase
          .from("product_colors")
          .insert(colorsToInsert);
        
        if (insertColorsError) throw insertColorsError;
      }
      
      toast({
        title: isEditMode ? "Produto atualizado" : "Produto criado",
        description: isEditMode
          ? "O produto foi atualizado com sucesso."
          : "O produto foi criado com sucesso.",
      });
      
      // Navigate back to products list
      navigate("/admin/products");
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o produto.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEditMode ? "Editar Produto" : "Novo Produto"}>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditMode ? "Editar Produto" : "Novo Produto"}>
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/products")}
          className="gap-1"
        >
          <ArrowLeft size={16} />
          Voltar para Produtos
        </Button>
      </div>

      <Tabs defaultValue="basic">
        <div className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="pricing">Preços</TabsTrigger>
            <TabsTrigger value="categorization">Categorias e Tags</TabsTrigger>
            <TabsTrigger value="attributes">Atributos</TabsTrigger>
            <TabsTrigger value="images">Imagens</TabsTrigger>
          </TabsList>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Defina as informações básicas do produto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={productData.name}
                    onChange={handleChange}
                    placeholder="Digite o nome do produto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={productData.description}
                    onChange={handleChange}
                    rows={5}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    placeholder="Digite a descrição do produto"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_rental"
                    checked={productData.is_rental}
                    onCheckedChange={toggleRental}
                  />
                  <Label htmlFor="is_rental">Produto para Aluguel</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Preços</CardTitle>
                <CardDescription>
                  Configure os preços do produto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="regular_price">Preço Regular *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">
                      R$
                    </span>
                    <Input
                      id="regular_price"
                      name="regular_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={productData.regular_price}
                      onChange={handleChange}
                      className="pl-9"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Preço de Venda</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">
                      R$
                    </span>
                    <Input
                      id="sale_price"
                      name="sale_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={productData.sale_price}
                      onChange={handleChange}
                      className="pl-9"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promotional_price">Preço Promocional</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">
                      R$
                    </span>
                    <Input
                      id="promotional_price"
                      name="promotional_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={productData.promotional_price}
                      onChange={handleChange}
                      className="pl-9"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                {productData.is_rental && (
                  <div className="space-y-2">
                    <Label htmlFor="rental_price">Preço de Aluguel *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">
                        R$
                      </span>
                      <Input
                        id="rental_price"
                        name="rental_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={productData.rental_price}
                        onChange={handleChange}
                        className="pl-9"
                        placeholder="0.00"
                        required={productData.is_rental}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categorization */}
          <TabsContent value="categorization">
            <Card>
              <CardHeader>
                <CardTitle>Categorias e Tags</CardTitle>
                <CardDescription>
                  Defina as categorias e tags do produto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="categories">Categorias</Label>
                  <Select
                    onValueChange={(value) => {
                      if (!selectedCategories.includes(value)) {
                        setSelectedCategories((prev) => [...prev, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCategories.map((categoryId) => {
                      const category = categories.find((c) => c.id === categoryId);
                      return (
                        <Badge key={categoryId} variant="secondary" className="gap-1">
                          {category?.name}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCategories((prev) =>
                                prev.filter((id) => id !== categoryId)
                              )
                            }
                            className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Select
                    onValueChange={(value) => {
                      if (!selectedTags.includes(value)) {
                        setSelectedTags((prev) => [...prev, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione tags" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedTags.map((tagId) => {
                      const tag = tags.find((t) => t.id === tagId);
                      return (
                        <Badge key={tagId} variant="outline" className="gap-1">
                          {tag?.name}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTags((prev) =>
                                prev.filter((id) => id !== tagId)
                              )
                            }
                            className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attributes */}
          <TabsContent value="attributes">
            <Card>
              <CardHeader>
                <CardTitle>Atributos</CardTitle>
                <CardDescription>
                  Defina os tamanhos e cores disponíveis para o produto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sizes */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Tamanhos</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`gap-1 ${
                          size.is_universal ? "border-brand-purple bg-brand-purple/10" : ""
                        }`}
                      >
                        {size.size}
                        {size.is_universal && " (Universal)"}
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="size">Novo Tamanho</Label>
                      <Input
                        id="size"
                        value={newSize.size}
                        onChange={(e) =>
                          setNewSize((prev) => ({ ...prev, size: e.target.value }))
                        }
                        placeholder="Ex: P, M, L, XL, 38, 40, etc."
                      />
                    </div>
                    <div className="mb-0.5 flex items-center space-x-2">
                      <Switch
                        id="is_universal_size"
                        checked={newSize.is_universal}
                        onCheckedChange={(checked) =>
                          setNewSize((prev) => ({ ...prev, is_universal: checked }))
                        }
                      />
                      <Label htmlFor="is_universal_size">Universal</Label>
                    </div>
                    <Button
                      type="button"
                      onClick={addSize}
                      disabled={!newSize.size.trim()}
                      size="sm"
                      className="mb-0.5"
                    >
                      <Plus size={16} className="mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Cores</h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="gap-1"
                      >
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: color.color_code }}
                        ></span>
                        {color.color}
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="color_name">Nome da Cor</Label>
                      <Input
                        id="color_name"
                        value={newColor.color}
                        onChange={(e) =>
                          setNewColor((prev) => ({ ...prev, color: e.target.value }))
                        }
                        placeholder="Ex: Preto, Branco, Vermelho, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color_code">Código da Cor</Label>
                      <div className="flex h-10 items-center gap-2 rounded-md border border-input px-3">
                        <span
                          className="inline-block h-5 w-5 rounded-full"
                          style={{ backgroundColor: newColor.color_code }}
                        ></span>
                        <input
                          type="color"
                          id="color_code"
                          value={newColor.color_code}
                          onChange={(e) =>
                            setNewColor((prev) => ({
                              ...prev,
                              color_code: e.target.value,
                            }))
                          }
                          className="h-8 w-8 cursor-pointer appearance-none border-0 bg-transparent p-0"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={addColor}
                      disabled={!newColor.color.trim()}
                      size="sm"
                      className="mb-0.5"
                    >
                      <Plus size={16} className="mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images */}
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Imagens do Produto</CardTitle>
                <CardDescription>
                  Adicione imagens do produto. A primeira imagem será usada como imagem principal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-md border border-dashed border-gray-300 p-6">
                  <div className="text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Arraste e solte arquivos de imagem aqui ou clique para
                        selecionar arquivos
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        PNG, JPG ou WEBP até 5MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4"
                    >
                      <Upload size={16} className="mr-2" />
                      Selecionar Arquivos
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                    />
                  </div>
                </div>

                {isUploading && (
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Enviando imagens...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-brand-purple transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className={`group relative rounded-md border ${
                          image.is_primary
                            ? "border-brand-purple"
                            : "border-gray-200"
                        } overflow-hidden`}
                      >
                        <div className="relative pt-[100%]">
                          <img
                            src={image.preview || image.image_url}
                            alt={`Product image ${index + 1}`}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(index)}
                              className={`rounded-full bg-white p-2 text-gray-700 hover:text-brand-purple ${
                                image.is_primary ? "text-brand-purple" : ""
                              }`}
                              title="Definir como imagem principal"
                            >
                              {image.is_primary ? (
                                <Check size={16} />
                              ) : (
                                <Image size={16} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="rounded-full bg-white p-2 text-gray-700 hover:text-red-500"
                              title="Remover imagem"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        {image.is_primary && (
                          <div className="absolute top-0 right-0 rounded-bl-md bg-brand-purple px-2 py-1 text-xs font-medium text-white">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md bg-gray-50 p-6 text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Sem imagens
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Adicione pelo menos uma imagem do produto.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <div className="mt-6 flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/products")}
        >
          Cancelar
        </Button>
        <Button onClick={saveProduct} disabled={saving}>
          {saving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Salvar Produto
            </>
          )}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;
