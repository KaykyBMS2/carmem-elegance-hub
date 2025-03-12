import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Trash2, Upload, X, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [promotionalPrice, setPromotionalPrice] = useState('');
  const [isRental, setIsRental] = useState(false);
  const [rentalPrice, setRentalPrice] = useState('');
  const [material, setMaterial] = useState('');
  const [sizeInfo, setSizeInfo] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [depth, setDepth] = useState('');
  
  // Images state
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploading, setUploading] = useState(false);
  
  // Categories state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Loading state
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Fetch product data if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (categoriesError) throw categoriesError;
        
        setCategories(categoriesData);
        
        // If editing, fetch product data
        if (isEditing) {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
            
          if (productError) throw productError;
          
          // Set product data
          setName(productData.name);
          setDescription(productData.description || '');
          setRegularPrice(productData.regular_price.toString());
          setSalePrice(productData.sale_price ? productData.sale_price.toString() : '');
          setPromotionalPrice(productData.promotional_price ? productData.promotional_price.toString() : '');
          setIsRental(productData.is_rental || false);
          setRentalPrice(productData.rental_price ? productData.rental_price.toString() : '');
          setMaterial(productData.material || '');
          setSizeInfo(productData.size_info || '');
          setCareInstructions(productData.care_instructions || '');
          setWidth(productData.width ? productData.width.toString() : '');
          setHeight(productData.height ? productData.height.toString() : '');
          setDepth(productData.depth ? productData.depth.toString() : '');
          
          // Fetch product images
          const { data: imagesData, error: imagesError } = await supabase
            .from('product_images')
            .select('*')
            .eq('product_id', id);
            
          if (imagesError) throw imagesError;
          
          setImages(imagesData);
          
          // Fetch product categories
          const { data: productCategoriesData, error: productCategoriesError } = await supabase
            .from('product_categories')
            .select('category_id')
            .eq('product_id', id);
            
          if (productCategoriesError) throw productCategoriesError;
          
          setSelectedCategories(productCategoriesData.map(pc => pc.category_id));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar os dados do produto.',
        });
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing]);
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const productData = {
        name,
        description,
        regular_price: parseFloat(regularPrice),
        sale_price: salePrice ? parseFloat(salePrice) : null,
        promotional_price: promotionalPrice ? parseFloat(promotionalPrice) : null,
        is_rental: isRental,
        rental_price: rentalPrice ? parseFloat(rentalPrice) : null,
        material,
        size_info: sizeInfo,
        care_instructions: careInstructions,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        depth: depth ? parseFloat(depth) : null,
      };
      
      let productId = id;
      
      if (isEditing) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);
          
        if (error) throw error;
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select();
          
        if (error) throw error;
        
        productId = data[0].id;
      }
      
      // Handle image uploads
      if (uploadedFiles.length > 0) {
        await handleImageUpload(productId as string);
      }
      
      // Handle category associations
      if (isEditing) {
        // Delete existing category associations
        await supabase
          .from('product_categories')
          .delete()
          .eq('product_id', productId);
      }
      
      // Insert new category associations
      if (selectedCategories.length > 0) {
        const categoryAssociations = selectedCategories.map(categoryId => ({
          product_id: productId,
          category_id: categoryId,
        }));
        
        const { error } = await supabase
          .from('product_categories')
          .insert(categoryAssociations);
          
        if (error) throw error;
      }
      
      toast({
        title: `Produto ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso`,
        description: `O produto "${name}" foi ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso.`,
      });
      
      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar produto',
        description: error.message || 'Não foi possível salvar o produto.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };
  
  // Handle image upload
  const handleImageUpload = async (productId: string) => {
    setUploading(true);
    const uploadPromises = uploadedFiles.map(async (file, index) => {
      try {
        // Create a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${index}.${fileExt}`;
        const filePath = `products/${productId}/${fileName}`;
        
        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicURLData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        // Insert image record in database
        const { error: insertError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: publicURLData.publicUrl,
            is_primary: index === 0 && images.length === 0, // First uploaded image is primary if no existing images
          });
          
        if (insertError) throw insertError;
        
        return true;
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        return false;
      }
    });
    
    await Promise.all(uploadPromises);
    setUploading(false);
    setUploadedFiles([]);
    setUploadProgress({});
    
    // Refresh images
    if (productId) {
      const { data } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId);
        
      if (data) setImages(data);
    }
  };
  
  // Handle image deletion
  const handleDeleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);
        
      if (error) throw error;
      
      setImages(prev => prev.filter(img => img.id !== imageId));
      
      toast({
        title: 'Imagem excluída',
        description: 'A imagem foi excluída com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir imagem',
        description: 'Não foi possível excluir a imagem.',
      });
    }
  };
  
  // Handle setting an image as primary
  const handleSetPrimary = async (imageId: string) => {
    try {
      // First, set all images as not primary
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', id);
        
      // Then, set the selected image as primary
      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);
        
      if (error) throw error;
      
      // Update local state
      setImages(prev => 
        prev.map(img => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      );
      
      toast({
        title: 'Imagem principal atualizada',
        description: 'A imagem principal foi atualizada com sucesso.',
      });
    } catch (error) {
      console.error('Error setting primary image:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao definir imagem principal',
        description: 'Não foi possível definir a imagem principal.',
      });
    }
  };
  
  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  // Handle file removal from upload queue
  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
    
    const newProgress = { ...uploadProgress };
    delete newProgress[fileName];
    setUploadProgress(newProgress);
  };
  
  if (initialLoading) {
    return (
      <AdminLayout title={isEditing ? 'Carregando produto...' : 'Novo Produto'}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title={isEditing ? 'Editar Produto' : 'Novo Produto'}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Editar Produto' : 'Novo Produto'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-rental"
                  checked={isRental}
                  onCheckedChange={setIsRental}
                />
                <Label htmlFor="is-rental">Disponível para Aluguel</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="regular-price">Preço Regular *</Label>
                  <Input
                    id="regular-price"
                    type="number"
                    step="0.01"
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="sale-price">Preço Promocional</Label>
                  <Input
                    id="sale-price"
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="promotional-price">Preço Super Oferta</Label>
                  <Input
                    id="promotional-price"
                    type="number"
                    step="0.01"
                    value={promotionalPrice}
                    onChange={(e) => setPromotionalPrice(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="rental-price">Preço de Aluguel</Label>
                  <Input
                    id="rental-price"
                    type="number"
                    step="0.01"
                    value={rentalPrice}
                    onChange={(e) => setRentalPrice(e.target.value)}
                    disabled={!isRental}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="size-info">Informações de Tamanho</Label>
                <Input
                  id="size-info"
                  value={sizeInfo}
                  onChange={(e) => setSizeInfo(e.target.value)}
                />
              </div>
              
              {/* Product Dimensions */}
              <div>
                <Label className="block mb-2">Dimensões do Produto</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="width" className="text-sm text-gray-500">Largura (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-sm text-gray-500">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="depth" className="text-sm text-gray-500">Profundidade (cm)</Label>
                    <Input
                      id="depth"
                      type="number"
                      step="0.1"
                      value={depth}
                      onChange={(e) => setDepth(e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="care-instructions">Instruções de Cuidado</Label>
                <Textarea
                  id="care-instructions"
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            {/* Categories and Images */}
            <div className="space-y-6">
              <div>
                <Label className="block mb-2">Categorias</Label>
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                  {categories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <label key={category.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleCategoryChange(category.id)}
                            className="rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                          />
                          <span>{category.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhuma categoria disponível.</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="block mb-2">Imagens do Produto</Label>
                
                {/* Current Images */}
                {images.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Imagens atuais</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {images.map((image) => (
                        <div key={image.id} className="relative group">
                          <div className={`aspect-square rounded-md overflow-hidden border-2 ${image.is_primary ? 'border-brand-purple' : 'border-gray-200'}`}>
                            <img
                              src={image.image_url}
                              alt="Product"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(image.id)}
                              className="p-1.5 bg-red-500 text-white rounded-full m-1"
                            >
                              <Trash2 size={14} />
                            </button>
                            {!image.is_primary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(image.id)}
                                className="p-1.5 bg-brand-purple text-white rounded-full m-1"
                                title="Definir como imagem principal"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                          {image.is_primary && (
                            <div className="absolute top-1 right-1 bg-brand-purple text-white text-xs px-1.5 py-0.5 rounded-sm">
                              Principal
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Upload New Images */}
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                  <div className="space-y-2">
                    <Upload className="mx-auto h-10 w-10 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <label htmlFor="file-upload" className="cursor-pointer text-brand-purple font-medium hover:underline">
                        Clique para selecionar
                      </label>
                      <span> ou arraste e solte imagens aqui</span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {images.length === 0 
                        ? 'A primeira imagem adicionada será a imagem principal do produto'
                        : 'Você pode definir uma imagem como principal após o upload'}
                    </p>
                  </div>
                </div>
                
                {/* Upload Queue */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h3 className="text-sm font-medium">Arquivos para upload</h3>
                    {uploadedFiles.map((file, index) => (
                      <div key={file.name} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center space-x-3">
                          <span className="bg-brand-purple text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                            {index + 1}
                          </span>
                          <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {uploadProgress[file.name] > 0 && (
                            <span className="text-xs text-gray-500">{uploadProgress[file.name]}%</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.name)}
                            className="p-1 text-gray-400 hover:text-red-500"
                            disabled={uploading}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></div>
              ) : (
                isEditing ? 'Atualizar Produto' : 'Cadastrar Produto'
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;

