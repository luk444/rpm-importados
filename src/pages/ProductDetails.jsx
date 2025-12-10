import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Minus, Plus, ShoppingCart, Truck, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useCart } from "../components/Layout";
import { motion } from "framer-motion";
import { fetchProductById, fetchSimilarProducts } from "../services/products";
import ProductVariants from "../components/ProductVariants";
import ProductCard from "../components/ProductCard";

export default function ProductDetails() {
  const { addToCart } = useCart();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get("id");
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    enabled: !!productId,
  });

  const { data: similarProducts, isLoading: similarLoading } = useQuery({
    queryKey: ["similar-products", product?.category, productId],
    queryFn: () => fetchSimilarProducts(product.category, productId),
    enabled: !!product?.category && !!productId,
  });

  // Calcular precio final con modificadores de variantes
  const calculateFinalPrice = () => {
    if (!product?.variants) return product?.price || 0;

    let finalPrice = product.price;
    Object.entries(selectedVariants).forEach(([variantType, optionValue]) => {
      const variant = product.variants.find(v => v.type === variantType);
      const option = variant?.options.find(opt => opt.value === optionValue);
      if (option?.price_modifier) {
        finalPrice += option.price_modifier;
      }
    });
    return finalPrice;
  };

  const finalPrice = calculateFinalPrice();

  const handleAddToCart = () => {
    const productWithVariants = {
      ...product,
      selectedVariants,
      finalPrice,
      variantDescription: Object.entries(selectedVariants).map(([type, value]) => {
        const variant = product.variants?.find(v => v.type === type);
        const option = variant?.options.find(opt => opt.value === value);
        return `${variant?.name}: ${option?.label}`;
      }).join(', ')
    };
    addToCart(productWithVariants, quantity);
  };

  if (!productId)
    return <div className="p-10 text-center">Producto no especificado</div>;
  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  if (!product) return <div className="p-10 text-center">Producto no encontrado</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to={createPageUrl("Store")}
        className="inline-flex items-center text-gray-500 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver al catálogo
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-100 rounded-3xl overflow-hidden aspect-square relative"
        >
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-3xl font-bold uppercase tracking-widest text-gray-900 border-4 border-gray-900 px-8 py-4">
                Agotado
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <div className="mb-4">
            <Badge className="mb-4 text-primary bg-primary/10 uppercase tracking-wider">
              {product.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <div className="mb-6">
              {Object.keys(selectedVariants).length === 0 ? (
                <p className="text-2xl font-bold text-gray-900">
                  ${Number(product.price || 0).toFixed(2)}
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 line-through">
                    ${Number(product.price || 0).toFixed(2)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${finalPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    Precio con personalización aplicada
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed mb-8 border-b pb-8 border-gray-100">
            {product.description}
          </p>

          {/* Variantes del producto */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <ProductVariants
                variants={product.variants}
                selectedVariants={selectedVariants}
                onVariantChange={setSelectedVariants}
              />
            </div>
          )}
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <span className="font-medium">Cantidad</span>
              <div className="flex items-center border rounded-full p-1 bg-gray-50">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="rounded-full h-8 w-8 hover:bg-white hover:shadow-sm"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.min(product.stock ?? 99, q + 1))}
                  disabled={quantity >= (product.stock ?? 99)}
                  className="rounded-full h-8 w-8 hover:bg-white hover:shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <span className="text-sm text-gray-500">
                {product.stock > 0 ? `${product.stock} unidades disponibles` : "Sin stock"}
              </span>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 h-14 bg-black text-white hover:bg-gray-800 rounded-full text-lg shadow-xl shadow-black/10"
              >
                <ShoppingCart className="mr-2 w-5 h-5" /> Agregar al Carrito
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span>Envío asegurado a todo el país</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Garantía de calidad de 12 meses</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Productos Similares */}
      {similarProducts && similarProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 border-t border-gray-100 pt-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Productos Similares
            </h2>
            <p className="text-gray-600 text-lg">
              Otros productos de la categoría {product.category} que te pueden interesar
            </p>
          </div>

          {similarLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <ProductCard key={similarProduct.id} product={similarProduct} />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

