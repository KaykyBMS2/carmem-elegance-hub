
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Heart } from 'lucide-react';
import { useShop } from '@/contexts/ShopContext';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  promoPrice?: number | null;
  imageUrl: string;
  isRental?: boolean;
  rentalPrice?: number | null;
  className?: string;
  description?: string;
}

const ProductCard = ({
  id,
  name,
  price,
  salePrice,
  promoPrice,
  imageUrl,
  isRental = false,
  rentalPrice,
  className = ''
}: ProductCardProps) => {
  const formattedPrice = (value: number) => 
    value.toFixed(2).replace('.', ',');
  
  const { addToFavorites, removeFromFavorites, isInFavorites } = useShop();
  const isFavorite = isInFavorites(id);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite) {
      removeFromFavorites(id);
    } else {
      addToFavorites({
        id,
        name,
        price,
        salePrice,
        promoPrice,
        imageUrl,
        isRental,
        rentalPrice
      });
    }
  };
  
  return (
    <Link to={`/product/${id}`} className={`block group ${className}`}>
      <div className="overflow-hidden rounded-lg bg-gray-100 aspect-square mb-3 relative">
        <img
          src={imageUrl || '/placeholder.svg'}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {isRental && (
          <Badge className="absolute top-2 right-2 bg-brand-purple border-brand-purple">
            Aluguel
          </Badge>
        )}
        {(promoPrice || salePrice) && (
          <Badge className="absolute top-2 left-2 bg-red-500 border-red-500">
            Oferta
          </Badge>
        )}
        
        <button 
          onClick={handleFavoriteClick}
          className={`absolute right-2 bottom-2 rounded-full p-2 transition-all duration-200 ${
            isFavorite 
              ? 'bg-brand-purple text-white' 
              : 'bg-white/80 text-gray-600 hover:bg-brand-purple/10'
          }`}
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>
      </div>
      <h3 className="text-sm font-medium text-gray-800 transition-colors group-hover:text-brand-purple line-clamp-2 font-montserrat">
        {name}
      </h3>
      <div className="mt-1">
        {promoPrice ? (
          <div className="flex flex-wrap items-baseline gap-1">
            <span className="font-medium text-brand-purple">
              R$ {formattedPrice(promoPrice)}
            </span>
            <span className="text-xs line-through text-gray-500">
              R$ {formattedPrice(price)}
            </span>
          </div>
        ) : salePrice ? (
          <div className="flex flex-wrap items-baseline gap-1">
            <span className="font-medium text-brand-purple">
              R$ {formattedPrice(salePrice)}
            </span>
            <span className="text-xs line-through text-gray-500">
              R$ {formattedPrice(price)}
            </span>
          </div>
        ) : (
          <span className="font-medium text-brand-purple">
            R$ {formattedPrice(price)}
          </span>
        )}
        
        {isRental && rentalPrice && (
          <div className="text-xs text-brand-purple mt-1">
            Aluguel: R$ {formattedPrice(rentalPrice)}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
