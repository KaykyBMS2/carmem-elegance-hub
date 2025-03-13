
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { useShop } from '@/contexts/ShopContext';
import { ArrowLeft, CreditCard, ShoppingBag, Trash2 } from 'lucide-react';

const Checkout = () => {
  const { cart, removeFromCart, updateCartItemQuantity, cartTotal, clearCart } = useShop();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Placeholder for checkout form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    paymentMethod: 'credit_card',
    saveInfo: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho para finalizar a compra.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulação de processamento de pedido
    try {
      // Aqui seria feita a integração com API de pagamento e a Supabase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Pedido realizado com sucesso!",
        description: "Você receberá um email com os detalhes do seu pedido.",
      });
      
      clearCart();
      navigate('/profile/orders');
    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: "Erro ao processar pedido",
        description: "Ocorreu um erro ao processar seu pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          
          <h1 className="text-3xl font-bold font-montserrat mb-8">Finalizar Compra</h1>
          
          {cart.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <ShoppingBag className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 font-montserrat">
                Seu carrinho está vazio
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs font-poppins">
                Parece que você ainda não adicionou nenhum produto ao seu carrinho.
              </p>
              <Link to="/shop">
                <Button className="bg-brand-purple hover:bg-brand-purple/90">
                  Explorar produtos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Summary */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4 font-montserrat">Resumo do Pedido</h2>
                    
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-4 py-3 border-b">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div className="flex flex-1 flex-col">
                            <div className="flex justify-between text-gray-900">
                              <Link
                                to={`/product/${item.id}`}
                                className="font-medium font-montserrat hover:text-brand-purple line-clamp-2"
                              >
                                {item.name}
                              </Link>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="ml-2 text-gray-400 hover:text-gray-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            
                            <div className="mt-auto flex items-end justify-between">
                              <div className="flex items-center">
                                <span className="text-gray-600 text-sm mr-2 font-poppins">
                                  Qtd:
                                </span>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateCartItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                  className="w-16 h-8 text-center"
                                />
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-brand-purple">
                                  {formatCurrency((item.promoPrice || item.salePrice || item.price) * item.quantity)}
                                </p>
                                {(item.salePrice || item.promoPrice) && (
                                  <p className="text-xs text-gray-500 line-through">
                                    {formatCurrency(item.price * item.quantity)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Checkout Form */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4 font-montserrat">Dados para Entrega</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                          Nome completo
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                          Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                          Telefone
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                          Endereço
                        </label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                            Cidade
                          </label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                            Estado
                          </label>
                          <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                          CEP
                        </label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div>
                        <h3 className="text-base font-medium mb-3 font-montserrat">Método de Pagamento</h3>
                        <div className="flex items-center mb-2">
                          <input
                            type="radio"
                            id="credit_card"
                            name="paymentMethod"
                            value="credit_card"
                            checked={formData.paymentMethod === 'credit_card'}
                            onChange={handleChange}
                            className="mr-2"
                          />
                          <label htmlFor="credit_card" className="flex items-center text-sm font-poppins">
                            <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                            Cartão de Crédito
                          </label>
                        </div>
                        {/* Aqui seriam adicionados outros métodos de pagamento */}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="saveInfo" 
                          name="saveInfo"
                          checked={formData.saveInfo}
                          onCheckedChange={(checked) => 
                            setFormData({...formData, saveInfo: checked as boolean})
                          }
                        />
                        <label htmlFor="saveInfo" className="text-sm text-gray-600 font-poppins">
                          Salvar informações para próximas compras
                        </label>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-gray-600 font-poppins">
                          <span>Subtotal</span>
                          <span>{formatCurrency(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 font-poppins">
                          <span>Frete</span>
                          <span>Calculado no próximo passo</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium text-lg font-montserrat">
                          <span>Total</span>
                          <span className="text-brand-purple">{formatCurrency(cartTotal)}</span>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-brand-purple hover:bg-brand-purple/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Processando...
                          </span>
                        ) : (
                          "Finalizar Pedido"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;
