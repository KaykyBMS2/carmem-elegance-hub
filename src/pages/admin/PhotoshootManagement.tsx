
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Image, Plus, Trash2, Upload, Instagram, Edit, Loader2, X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface PhotoshootData {
  id: string;
  title: string;
  description: string | null;
  instagram_handle: string | null;
  image_url: string;
  created_at: string;
}

const PhotoshootManagement = () => {
  const [photoshoots, setPhotoshoots] = useState<PhotoshootData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instagram_handle: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPhotoshoots();
  }, []);

  const fetchPhotoshoots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('maternity_photoshoots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotoshoots(data || []);
    } catch (error) {
      console.error('Error fetching photoshoots:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar ensaios',
        description: 'Não foi possível carregar os ensaios de gestante.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Formato de arquivo inválido',
        description: 'Por favor, selecione uma imagem nos formatos JPEG, PNG ou WEBP.',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      instagram_handle: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleOpenDialog = (photoshoot?: PhotoshootData) => {
    if (photoshoot) {
      setFormData({
        title: photoshoot.title,
        description: photoshoot.description || '',
        instagram_handle: photoshoot.instagram_handle || '',
      });
      setImagePreview(photoshoot.image_url);
      setEditingId(photoshoot.id);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUploading(true);
      
      let imageUrl = '';
      
      // If we're editing and no new image was selected, use the existing one
      if (editingId && !imageFile) {
        const existingPhotoshoot = photoshoots.find(p => p.id === editingId);
        if (existingPhotoshoot) {
          imageUrl = existingPhotoshoot.image_url;
        }
      } else if (imageFile) {
        // Convert image to WebP if it's not already
        let fileToUpload = imageFile;
        
        // Generate a unique filename
        const fileExt = 'webp';
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        // Upload image to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photoshoots')
          .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            upsert: false,
          });
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('photoshoots')
          .getPublicUrl(filePath);
          
        imageUrl = urlData.publicUrl;
      } else {
        throw new Error('Nenhuma imagem selecionada');
      }
      
      // Prepare Instagram handle (ensure it starts with @)
      let instagramHandle = formData.instagram_handle;
      if (instagramHandle && !instagramHandle.startsWith('@')) {
        instagramHandle = `@${instagramHandle}`;
      }
      
      // Update or create the photoshoot record
      if (editingId) {
        const { error } = await supabase
          .from('maternity_photoshoots')
          .update({
            title: formData.title,
            description: formData.description || null,
            instagram_handle: instagramHandle || null,
            ...(imageUrl && { image_url: imageUrl }),
          })
          .eq('id', editingId);
          
        if (error) throw error;
        
        toast({
          title: 'Ensaio atualizado',
          description: 'O ensaio foi atualizado com sucesso!',
        });
      } else {
        const { error } = await supabase
          .from('maternity_photoshoots')
          .insert({
            title: formData.title,
            description: formData.description || null,
            instagram_handle: instagramHandle || null,
            image_url: imageUrl,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Ensaio adicionado',
          description: 'O novo ensaio foi adicionado com sucesso!',
        });
      }
      
      // Refresh the photoshoots list
      fetchPhotoshoots();
      handleCloseDialog();
      
    } catch (error: any) {
      console.error('Error submitting photoshoot:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar ensaio',
        description: error.message || 'Ocorreu um erro ao salvar o ensaio.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este ensaio? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      // Get the photoshoot to find the image URL
      const photoshoot = photoshoots.find(p => p.id === id);
      if (!photoshoot) return;
      
      // Extract the filename from the image URL
      const imageUrl = photoshoot.image_url;
      const fileName = imageUrl.split('/').pop();
      
      // Delete the record from the database
      const { error } = await supabase
        .from('maternity_photoshoots')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Delete the image from storage
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('photoshoots')
          .remove([fileName]);
          
        if (storageError) console.error('Error deleting image:', storageError);
      }
      
      // Update the UI
      setPhotoshoots(photoshoots.filter(p => p.id !== id));
      
      toast({
        title: 'Ensaio excluído',
        description: 'O ensaio foi excluído com sucesso.',
      });
      
    } catch (error) {
      console.error('Error deleting photoshoot:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir ensaio',
        description: 'Ocorreu um erro ao excluir o ensaio.',
      });
    }
  };

  return (
    <AdminLayout title="Gerenciar Ensaios de Gestante">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Ensaios de Gestante</h2>
          <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
            <Plus size={16} />
            Adicionar Ensaio
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photoshoots.map((photoshoot) => (
              <Card key={photoshoot.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img 
                    src={photoshoot.image_url} 
                    alt={photoshoot.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-1">{photoshoot.title}</h3>
                  {photoshoot.instagram_handle && (
                    <a 
                      href={`https://instagram.com/${photoshoot.instagram_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-pink-600 mb-2"
                    >
                      <Instagram size={14} className="mr-1" />
                      {photoshoot.instagram_handle}
                    </a>
                  )}
                  {photoshoot.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{photoshoot.description}</p>
                  )}
                  <div className="flex justify-end gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenDialog(photoshoot)}
                      className="text-xs h-8"
                    >
                      <Edit size={14} className="mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(photoshoot.id)}
                      className="text-xs h-8"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {photoshoots.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                <Image className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum ensaio cadastrado</h3>
                <p className="text-sm text-gray-500 max-w-md mb-4">
                  Comece adicionando seu primeiro ensaio de gestante para exibir na galeria.
                </p>
                <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                  <Plus size={16} />
                  Adicionar Ensaio
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Ensaio' : 'Adicionar Novo Ensaio'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Ensaio *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Título do ensaio"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instagram_handle">Instagram</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Instagram size={16} />
                </span>
                <Input
                  id="instagram_handle"
                  name="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={handleInputChange}
                  placeholder="@usuario.instagram"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descrição do ensaio (opcional)"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Imagem do Ensaio {!editingId && '*'}</Label>
              {imagePreview ? (
                <div className="relative border rounded-md overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center mb-2">
                    Arraste uma imagem ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-400 text-center mb-3">
                    PNG, JPG ou WEBP (será convertido para WEBP)
                  </p>
                  <Input
                    id="image"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image')?.click()}
                  >
                    Selecionar Imagem
                  </Button>
                </div>
              )}
              {!imageFile && editingId && (
                <p className="text-xs text-gray-500">
                  A imagem atual será mantida se nenhuma nova imagem for selecionada.
                </p>
              )}
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseDialog}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading || (!editingId && !imageFile) || !formData.title}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {editingId ? 'Salvar Alterações' : 'Adicionar Ensaio'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default PhotoshootManagement;
