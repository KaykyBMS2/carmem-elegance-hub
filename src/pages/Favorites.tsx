
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useShop } from '@/contexts/ShopContext';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, ArrowLeft, Eye, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Favorites = () => {
  const { favorites, removeFromFavorites, addToCart } = useShop();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/shop" className="inline-flex items-center text-gray-600 hover:text-brand-purple mb-6 font-poppins">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Voltar para a loja</span>
          </Link>
          
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-montserrat">Meus Favoritos</h1>
            <span className="text-sm text-gray-500 font-poppins">
              {favorites.length} {favorites.length === 1 ? 'produto' : 'produtos'}
            </span>
          </div>
          
          {favorites.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <Heart className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 font-montserrat">
                Você ainda não tem produtos favoritos
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs font-poppins">
                Adicione produtos à sua lista de favoritos para encontrá-los facilmente depois.
              </p>
              <Link to="/shop">
                <Button className="bg-brand-purple hover:bg-brand-purple/90">
                  Explorar produtos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((product) => (
                <Card key={product.id} className="overflow-hidden flex flex-col border shadow-sm hover:shadow transition-all">
                  <div className="aspect-square relative">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFromFavorites(product.id)}
                      className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-brand-purple shadow hover:bg-white"
                      title="Remover dos favoritos"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="p-4 flex-grow flex flex-col">
                    <Link 
                      to={`/product/${product.id}`} 
                      className="text-lg font-medium font-montserrat text-gray-800 hover:text-brand-purple line-clamp-2 mb-2"
                    >
                      {product.name}
                    </Link>
                    
                    <div className="mb-4">
                      {product.promoPrice ? (
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-brand-purple text-lg">
                            {formatCurrency(product.promoPrice)}
                          </span>
                          <span className="text-sm line-through text-gray-500">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      ) : product.salePrice ? (
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-brand-purple text-lg">
                            {formatCurrency(product.salePrice)}
                          </span>
                          <span className="text-sm line-through text-gray-500">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-brand-purple text-lg">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                      
                      {product.isRental && product.rentalPrice && (
                        <div className="text-xs text-brand-purple mt-1">
                          Aluguel: {formatCurrency(product.rentalPrice)}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-brand-purple hover:bg-brand-purple/90"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                      <Link to={`/product/${product.id}`} className="block">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Favorites;
