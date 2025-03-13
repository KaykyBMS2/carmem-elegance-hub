
import React from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useShop } from "@/contexts/ShopContext";
import type { CartItem as CartItemType } from "@/contexts/ShopContext";

interface CartDrawerProps {
  trigger?: React.ReactNode;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ trigger }) => {
  const { cart, removeFromCart, updateCartItemQuantity, cartTotal, cartCount } = useShop();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const defaultTrigger = (
    <Button variant="outline" size="icon" className="relative">
      <ShoppingBag className="h-5 w-5" />
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-purple text-[10px] font-bold text-white">
          {cartCount}
        </span>
      )}
    </Button>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-montserrat flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Meu Carrinho
            <span className="ml-2 text-sm font-normal text-gray-500">
              {cartCount} {cartCount === 1 ? "item" : "itens"}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-grow overflow-auto mt-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <ShoppingBag className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 font-montserrat">
                Seu carrinho está vazio
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs font-poppins">
                Parece que você ainda não adicionou nenhum produto ao seu carrinho.
              </p>
              <SheetClose asChild>
                <Link to="/shop">
                  <Button className="bg-brand-purple hover:bg-brand-purple/90">
                    Explorar produtos
                  </Button>
                </Link>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={() => removeFromCart(item.id)}
                  onUpdateQuantity={(quantity) =>
                    updateCartItemQuantity(item.id, quantity)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="mt-auto pt-4">
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex justify-between font-montserrat">
                <span className="text-base text-gray-600">Subtotal</span>
                <span className="text-base font-medium">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
              <div className="text-xs text-gray-500 font-poppins">
                Frete calculado na finalização da compra
              </div>
              <div className="grid gap-2">
                <SheetClose asChild>
                  <Link to="/checkout">
                    <Button className="w-full bg-brand-purple hover:bg-brand-purple/90">
                      Finalizar compra
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/shop">
                    <Button variant="outline" className="w-full">
                      Continuar comprando
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

const CartItem: React.FC<{
  item: CartItemType;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}> = ({ item, onRemove, onUpdateQuantity }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const effectivePrice = item.promoPrice || item.salePrice || item.price;
  const totalPrice = effectivePrice * item.quantity;

  return (
    <div className="flex gap-3 py-3">
      <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between text-sm font-medium text-gray-900">
          <Link
            to={`/product/${item.id}`}
            className="font-montserrat hover:text-brand-purple line-clamp-2"
          >
            {item.name}
          </Link>
          <button
            onClick={onRemove}
            className="ml-2 text-gray-400 hover:text-gray-500"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              className="p-1 px-2 text-gray-600 hover:bg-gray-100"
            >
              <Minus size={14} />
            </button>
            <span className="px-2 text-sm">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="p-1 px-2 text-gray-600 hover:bg-gray-100"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(totalPrice)}
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
  );
};

export default CartDrawer;
