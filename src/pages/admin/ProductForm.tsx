
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
    material: "",
    care_instructions: "",
    size_info: ""
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
        material: product.material || "",
        care_instructions: product.care_instructions || "",
        size_info: product.size_info || ""
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
            material: productData.material || null,
            care_instructions: productData.care_instructions || null,
            size_info: productData.size_info || null
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
            material: productData.material || null,
            care_instructions: productData.care_instructions || null,
            size_info: productData.size_info || null
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
          <TabsList className="grid w-full grid-cols-6 md:grid-cols-6">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
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

          {/* Product Details */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Produto</CardTitle>
                <CardDescription>
                  Adicione informações detalhadas sobre o produto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    name="material"
                    value={productData.material}
                    onChange={handleChange}
                    placeholder="Ex: Algodão, Poliéster, Linho, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="care_instructions">Instruções de Cuidado</Label>
                  <textarea
                    id="care_instructions"
                    name="care_instructions"
                    value={productData.care_instructions}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    placeholder="Ex: Lavar à mão, Não usar alvejante, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size_info">Informações de Tamanho</Label>
                  <textarea
                    id="size_info"
                    name="size_info"
                    value={productData.size_info}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    placeholder="Ex: P (36-38), M (40-42), G (44-46)"
                  />
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
                      <Label htmlFor="color">Nova Cor</Label>
                      <Input
                        id="color"
                        value={newColor.color}
                        onChange={(e) =>
                          setNewColor((prev) => ({ ...prev, color: e.target.value }))
                        }
                        placeholder="Ex: Azul, Vermelho, Verde, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color_code">Código da Cor</Label>
                      <Input
                        id="color_code"
                        type="color"
                        value={newColor.color_code}
                        onChange={(e) =>
                          setNewColor((prev) => ({
                            ...prev,
                            color_code: e.target.value,
                          }))
                        }
                        className="h-10 w-20 p-1"
                      />
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
                  Adicione e gerencie as imagens do produto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-md border"
                    >
                      <img
                        src={image.preview || image.image_url}
                        alt={`Produto ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-white"
                            onClick={() => setPrimaryImage(index)}
                            disabled={image.is_primary}
                          >
                            {image.is_primary ? (
                              <Check size={16} className="text-green-500" />
                            ) : (
                              "Principal"
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-white text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                      {image.is_primary && (
                        <div className="absolute left-2 top-2 rounded-md bg-brand-purple px-2 py-1 text-xs text-white">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex aspect-square items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50">
                    <input
                      type="file"
                      id="image-upload"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col gap-2 p-8"
                    >
                      <Upload size={24} />
                      <span className="text-sm">Adicionar Imagens</span>
                    </Button>
                  </div>
                </div>

                {isUploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">
                        Enviando imagens...
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-brand-purple"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Atenção
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            As imagens só serão salvas quando você clicar em{" "}
                            <strong>Salvar Produto</strong>. Certifique-se de
                            marcar uma imagem como principal.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button
          type="button"
          onClick={saveProduct}
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Salvando..." : "Salvar Produto"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;
