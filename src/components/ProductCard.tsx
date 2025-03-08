
import { useState } from 'react';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ProductProps {
  id: number;
  name: string;
  description: string;
  price: number;
  rentalPrice?: number;
  image: string;
  category: string;
  isRental?: boolean;
  rentalIncludes?: string[];
}

const ProductCard = ({ id, name, description, price, rentalPrice, image, category, isRental, rentalIncludes }: ProductProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  return (
    <div 
      className="glass-card group transition-all duration-300 hover:shadow-lg overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden h-72">
        <img 
          src={image} 
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
          {category}
        </div>
        
        {/* Favorite button */}
        <button 
          onClick={() => setIsFavorite(!isFavorite)} 
          className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-brand-purple hover:text-white"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-brand-purple text-brand-purple' : ''}`} />
        </button>
        
        {/* Quick actions */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm py-3 px-4 flex justify-between items-center transition-transform duration-300 ${
            isHovered ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-purple transition-colors duration-300 hover:bg-brand-purple hover:text-white">
            <ShoppingBag className="h-5 w-5" />
          </button>
          
          <Link to={`/product/${id}`} className="button-secondary py-2 px-4 text-sm flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalhes
          </Link>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-lg font-montserrat font-semibold mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        
        <div className="flex flex-col">
          {isRental ? (
            <>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs bg-brand-purple/10 text-brand-purple px-2 py-1 rounded">Aluguel</span>
                <div>
                  <span className="text-xl font-semibold text-brand-purple">R$ {rentalPrice?.toFixed(2)}</span>
                </div>
              </div>
              
              {rentalIncludes && rentalIncludes.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-md mt-2">
                  <p className="text-xs font-medium mb-1">Inclui:</p>
                  <ul className="text-xs text-muted-foreground">
                    {rentalIncludes.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <span className="h-1 w-1 bg-brand-purple rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Disponível</span>
              <span className="text-xl font-semibold text-brand-purple">R$ {price.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
