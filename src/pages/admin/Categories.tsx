
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface CategoryFormData {
  id?: string;
  name: string;
  description: string;
}

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<CategoryFormData>({ name: '', description: '' });
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as Category[] || [];
    },
  });
  
  const createCategory = useMutation({
    mutationFn: async (categoryData: CategoryFormData) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ 
          name: categoryData.name,
          description: categoryData.description || null
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setIsDialogOpen(false);
      setCurrentCategory({ name: '', description: '' });
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar categoria",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar a categoria.",
        variant: "destructive",
      });
    }
  });
  
  const updateCategory = useMutation({
    mutationFn: async (categoryData: CategoryFormData) => {
      if (!categoryData.id) throw new Error("ID da categoria não fornecido");
      
      const { data, error } = await supabase
        .from('categories')
        .update({ 
          name: categoryData.name,
          description: categoryData.description || null
        })
        .eq('id', categoryData.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setIsDialogOpen(false);
      setCurrentCategory({ name: '', description: '' });
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar a categoria.",
        variant: "destructive",
      });
    }
  });
  
  const deleteCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir categoria",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir a categoria.",
        variant: "destructive",
      });
    }
  });
  
  const filteredCategories = categories?.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCategory.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome da categoria é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentCategory.id) {
      updateCategory.mutate(currentCategory);
    } else {
      createCategory.mutate(currentCategory);
    }
  };
  
  const openCreateDialog = () => {
    setCurrentCategory({ name: '', description: '' });
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (category: Category) => {
    setCurrentCategory({
      id: category.id,
      name: category.name,
      description: category.description || ''
    });
    setIsDialogOpen(true);
  };
  
  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory.mutate(categoryToDelete.id);
    }
  };
  
  return (
    <AdminLayout title="Categorias">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar categorias..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button onClick={openCreateDialog} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>Nova Categoria</span>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Descrição
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-center">
                  <div className="flex justify-center p-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-purple border-t-transparent"></div>
                  </div>
                </td>
              </tr>
            ) : filteredCategories && filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <tr key={category.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{category.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {category.description || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(category)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhuma categoria encontrada
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Create/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentCategory.id ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nome
                </label>
                <Input
                  id="name"
                  value={currentCategory.name}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                  placeholder="Ex: Vestidos"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Descrição
                </label>
                <Textarea
                  id="description"
                  value={currentCategory.description}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                  placeholder="Descrição da categoria"
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {currentCategory.id ? 'Salvar Alterações' : 'Criar Categoria'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Categoria</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir a categoria <strong>{categoryToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <p>
                Atenção: Os produtos associados a esta categoria perderão esta classificação.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Categories;
