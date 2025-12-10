import React from "react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useCart } from "./Layout";
import { motion } from "framer-motion";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group h-full flex flex-col overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
        <Link
          to={`${createPageUrl("ProductDetails")}?id=${product.id}`}
          className="relative aspect-square overflow-hidden bg-gray-100 block"
        >
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-black">
              Destacado
            </Badge>
          )}
          {product.stock < 5 && product.stock > 0 && (
            <Badge className="absolute top-3 right-3 bg-orange-100 text-orange-700">
              ¡Últimas unidades!
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <Badge className="text-lg px-4 py-2">Agotado</Badge>
            </div>
          )}
        </Link>

        <CardContent className="flex-1 p-5">
          <div className="mb-2">
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              {product.category}
            </span>
          </div>
          <Link to={`${createPageUrl("ProductDetails")}?id=${product.id}`}>
            <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
        </CardContent>

        <CardFooter className="p-5 pt-0 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Precio</span>
            <span className="text-xl font-bold text-gray-900">
              ${Number(product.price || 0).toFixed(2)}
            </span>
          </div>
          <Button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="bg-black hover:bg-gray-800 rounded-full w-10 h-10 p-0 shadow-lg shadow-black/10 group-hover:shadow-black/20 transition-all"
            size="icon"
          >
            <Plus className="w-5 h-5 text-white" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

