import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  Instagram,
  Facebook,
  Twitter,
  Trash2,
  Plus,
  Minus,
  User,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { createPageUrl } from "../utils";
import { createOrder } from "../services/orders";
import { listenAuth } from "../services/auth";
import { isAdmin } from "../services/admin";
import CheckoutModal from "./CheckoutModal";

export const CartContext = createContext();

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default function Layout({ children, currentPageName }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Auth listener
  useEffect(() => {
    const unsub = listenAuth(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const admin = await isAdmin(currentUser.uid);
        setUserIsAdmin(admin);
      } else {
        setUserIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch {
        // ignore parse error
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    if (!product) return;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock ?? 99, existing.quantity + qty);
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: nextQty } : i
        );
      }
      return [...prev, { ...product, quantity: Math.min(product.stock ?? 99, qty) }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.max(1, Math.min((i.stock ?? 99), i.quantity + delta)) }
          : i
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0),
    [cartItems]
  );
  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const handleCheckout = () => {
    if (!cartItems.length) return;
    setIsCartOpen(false);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    clearCart();
    setShowCheckout(false);
  };

  const links = [
    { label: "Inicio", to: createPageUrl("Home"), key: "Home" },
    { label: "Catálogo", to: createPageUrl("Store"), key: "Store" },
    { label: "Drones", to: `${createPageUrl("Store")}?category=drones` },
    { label: "Vapes", to: `${createPageUrl("Store")}?category=vaporizadores` },
  ];

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, setIsCartOpen }}
    >
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <img
                src="/assets/rpmlogo.png"
                alt="RPM Importados Logo"
                className="w-8 h-8 object-contain rounded-md"
              />
              <span className="font-bold text-xl tracking-tight">
                RPM IMPORTADOS
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors ${
                    currentPageName === link.key ||
                    location.pathname === link.to
                      ? "text-primary"
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {userIsAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="hidden md:block text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/user/dashboard"
                    className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mi Cuenta
                  </Link>
                </>
              ) : (
                <Link
                  to="/user/login"
                  className="hidden md:block text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                >
                  Iniciar Sesión
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-[10px] text-white">
                    {cartCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-gray-200 p-4 animate-slide-in">
              <div className="flex flex-col gap-4">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm font-medium p-2 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      to="/user/dashboard"
                      className="text-sm font-medium p-2 hover:bg-gray-100 rounded-md flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Mi Cuenta
                    </Link>
                    {userIsAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="text-sm font-medium p-2 hover:bg-gray-100 rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Panel Admin
                      </Link>
                    )}
                  </>
                ) : (
                  <Link
                    to="/user/login"
                    className="text-sm font-medium p-2 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>

        <Sheet open={isCartOpen}>
          <SheetContent onOpenChange={setIsCartOpen} className="bg-white">
            <SheetHeader className="border-b pb-4">
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Tu Carrito
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ShoppingCart className="w-16 h-16 opacity-20" />
                  <p>Tu carrito está vacío</p>
                  <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                    Seguir comprando
                  </Button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium line-clamp-2 text-sm">{item.name}</h4>
                        <p className="text-sm text-gray-500">${item.price}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 border rounded-md p-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <SheetFooter className="border-t pt-4 flex-col gap-4">
              <div className="space-y-2 w-full">
                <div className="flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Pagá por transferencia (MercadoPago pronto).
                </p>
              </div>
              <Button
                className="w-full bg-primary hover:bg-sky-500 text-black h-12 text-lg"
                disabled={cartItems.length === 0}
                onClick={handleCheckout}
              >
                Finalizar compra
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <main className="flex-grow">{children}</main>

        <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/rpmlogo.png"
                    alt="RPM Importados Logo"
                    className="w-6 h-6 object-contain rounded"
                  />
                  <span className="font-bold text-lg">RPM IMPORTADOS</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Tecnología importada, garantía local y envíos rápidos en todo Argentina.
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-6">Comprar</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li>
                    <Link to={createPageUrl("Store")} className="hover:text-primary transition-colors">
                      Todos los productos
                    </Link>
                  </li>
                  <li>
                    <Link to={`${createPageUrl("Store")}?category=drones`} className="hover:text-primary transition-colors">
                      Drones
                    </Link>
                  </li>
                  <li>
                    <Link to={`${createPageUrl("Store")}?category=vaporizadores`} className="hover:text-primary transition-colors">
                      Vaporizadores
                    </Link>
                  </li>
                  <li>
                    <Link to={`${createPageUrl("Store")}?category=termos`} className="hover:text-primary transition-colors">
                      Termos
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-6">Soporte</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-primary transition-colors">Rastrea tu pedido</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Envíos y devoluciones</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Preguntas frecuentes</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-6">Síguenos</h4>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-50 hover:text-primary transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-50 hover:text-primary transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-50 hover:text-primary transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>© 2025 RPM IMPORTADOS. Todos los derechos reservados.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-gray-600">Privacidad</a>
                <a href="#" className="hover:text-gray-600">Términos</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cartItems={cartItems}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </CartContext.Provider>
  );
}

