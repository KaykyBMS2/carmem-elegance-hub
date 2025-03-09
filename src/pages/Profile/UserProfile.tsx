
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface ProfileFormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  birth_date: string;
}

const UserProfile = () => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, setValue, formState: { errors, isDirty } } = useForm<ProfileFormValues>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      birth_date: '',
    }
  });

  useEffect(() => {
    if (profile) {
      setValue('name', profile.name || '');
      setValue('email', profile.email || '');
      setValue('phone', profile.phone || '');
      setValue('address', profile.address || '');
      setValue('city', profile.city || '');
      setValue('state', profile.state || '');
      setValue('postal_code', profile.postal_code || '');
      setValue('birth_date', profile.birth_date ? format(new Date(profile.birth_date), 'yyyy-MM-dd') : '');
    }
  }, [profile, setValue]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await updateProfile({
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        birth_date: data.birth_date || null,
      });
      
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar suas informações.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      const avatarUrl = urlData.publicUrl;
      
      // Update profile with avatar URL
      const { error: updateError } = await updateProfile({
        avatar_url: avatarUrl,
      });
      
      if (updateError) throw updateError;
      
      await refreshProfile();
      
      toast({
        title: "Avatar atualizado",
        description: "Seu avatar foi atualizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar avatar",
        description: error.message || "Ocorreu um erro ao atualizar seu avatar.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Meu Perfil</h1>
      
      <div className="mb-8 flex items-center">
        <div className="relative mr-6">
          <div 
            className="w-24 h-24 rounded-full bg-brand-purple/20 flex items-center justify-center text-3xl font-semibold text-brand-purple cursor-pointer overflow-hidden border-2 border-brand-purple/30"
            onClick={handleAvatarClick}
          >
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.name || 'Avatar'} 
                className="w-full h-full object-cover"
              />
            ) : (
              profile?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
            
            <div className="absolute bottom-0 right-0 bg-brand-purple text-white p-1 rounded-full">
              <Camera size={16} />
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-medium">{profile?.name || 'Atualizar perfil'}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Membro desde {profile?.created_at ? format(new Date(profile.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '-'}
          </p>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Nome completo</Label>
            <Input 
              id="name"
              {...register('name', { required: "Nome é obrigatório" })}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input 
              id="email"
              type="email"
              disabled
              {...register('email')}
            />
            <p className="text-xs text-gray-500 mt-1">O e-mail não pode ser alterado</p>
          </div>
          
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input 
              id="phone"
              placeholder="(00) 00000-0000"
              {...register('phone')}
            />
          </div>
          
          <div>
            <Label htmlFor="birth_date">Data de nascimento</Label>
            <Input 
              id="birth_date"
              type="date"
              {...register('birth_date')}
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input 
              id="address"
              placeholder="Rua, número, complemento"
              {...register('address')}
            />
          </div>
          
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input 
              id="city"
              {...register('city')}
            />
          </div>
          
          <div>
            <Label htmlFor="state">Estado</Label>
            <Input 
              id="state"
              {...register('state')}
            />
          </div>
          
          <div>
            <Label htmlFor="postal_code">CEP</Label>
            <Input 
              id="postal_code"
              placeholder="00000-000"
              {...register('postal_code')}
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading || !isDirty}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar alterações'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
