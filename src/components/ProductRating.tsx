
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProductRating } from '@/types/rating';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProductRatingProps {
  productId: string;
  ratings: ProductRating[];
  onRatingAdded: (rating: ProductRating) => void;
}

const ProductRatingComponent = ({ productId, ratings, onRatingAdded }: ProductRatingProps) => {
  const { isAuthenticated, user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para avaliar um produto.",
        variant: "destructive"
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma classificação de 1 a 5 estrelas.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('product_ratings')
        .insert({
          product_id: productId,
          user_id: user.id,
          user_name: profile?.name || user.email?.split('@')[0] || 'Usuário',
          rating,
          comment
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Avaliação enviada",
        description: "Obrigado por compartilhar sua opinião sobre o produto!",
      });
      
      if (data) {
        onRatingAdded(data as unknown as ProductRating);
        setRating(0);
        setComment('');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message || "Ocorreu um erro ao enviar sua avaliação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const averageRating = ratings.length > 0 
    ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length 
    : 0;
  
  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold mb-4">Avaliações do Produto</h3>
      
      {ratings.length > 0 ? (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-medium">{averageRating.toFixed(1)}</span>
            <span className="text-gray-500 ml-2">({ratings.length} {ratings.length === 1 ? 'avaliação' : 'avaliações'})</span>
          </div>
          
          <div className="space-y-4">
            {ratings.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-brand-purple text-white">
                      {item.user_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{item.user_name}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(item.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= item.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {item.comment && <p className="text-gray-700">{item.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 mb-6">Este produto ainda não possui avaliações. Seja o primeiro a avaliar!</p>
      )}
      
      {isAuthenticated ? (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Avalie este produto</h4>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center mb-4">
              <p className="mr-2 text-sm">Sua avaliação:</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm mb-1">
                Seu comentário (opcional)
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Compartilhe sua experiência com este produto..."
                className="resize-none"
                rows={4}
              />
            </div>
            
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </form>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50 text-center">
          <p className="text-gray-600 mb-2">Você precisa estar logado para avaliar este produto.</p>
          <Button asChild variant="outline">
            <a href="/auth/login">Fazer Login</a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductRatingComponent;
