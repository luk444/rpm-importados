import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { ArrowRight, Star, Shield, Truck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";
import { fetchFeaturedProducts } from "../services/products";

export default function Home() {
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => fetchFeaturedProducts(4),
  });

  return (
    <div className="space-y-20 pb-20">
      <section className="relative h-[85vh] min-h-[600px] flex items-center bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Nueva Colección 2025 Disponible
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
              Tecnología que <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Revoluciona
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed">
              Descubre nuestra selección exclusiva de drones, vapes y gadgets importados. Calidad premium, garantía local.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to={createPageUrl("Store")}>
                <Button className="h-14 px-8 text-lg bg-white text-black hover:bg-gray-100 rounded-full transition-transform hover:scale-105">
                  Ver Catálogo
                </Button>
              </Link>
              <Link to={`${createPageUrl("Store")}?category=drones`}>
                <Button
                  variant="outline"
                  className="h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10 rounded-full backdrop-blur-sm"
                >
                  Explorar Drones <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Garantía Oficial",
              desc: "Todos nuestros productos cuentan con garantía directa.",
            },
            {
              icon: Truck,
              title: "Envío Rápido",
              desc: "Entregas en 24-48 horas en Argentina.",
            },
            {
              icon: Zap,
              title: "Tecnología Punta",
              desc: "Importamos las últimas novedades del mercado.",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-500">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Destacados</h2>
            <p className="text-gray-500">Los productos más vendidos</p>
          </div>
          <Link to={createPageUrl("Store")}>
            <Button variant="ghost" className="hidden md:flex">
              Ver todo <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 rounded-xl h-[400px] animate-pulse"
                  />
                ))
            : featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to={createPageUrl("Store")}>
            <Button variant="outline" className="w-full">
              Ver todo el catálogo
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
          <Link
            to={`${createPageUrl("Store")}?category=drones`}
            className="group relative rounded-3xl overflow-hidden cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt="Drones"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12">
              <span className="text-white/80 text-sm font-bold uppercase tracking-wider mb-2 block">
                Explorar
              </span>
              <h3 className="text-4xl font-bold text-white mb-4">Mundo Drone</h3>
              <Button className="bg-white text-black hover:bg-gray-100 rounded-full">
                Ver Colección
              </Button>
            </div>
          </Link>

          <div className="grid grid-rows-2 gap-6">
            <Link
              to={`${createPageUrl("Store")}?category=vaporizadores`}
              className="group relative rounded-3xl overflow-hidden cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1537498425277-c283d32ef9db?auto=format&fit=crop&q=80"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Vapes"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Vaporizadores</h3>
                <span className="text-white/80 text-sm font-medium flex items-center gap-2">
                  Comprar ahora <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            <Link
              to={`${createPageUrl("Store")}?category=termos`}
              className="group relative rounded-3xl overflow-hidden cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&q=80"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Thermos"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Termos & Accesorios</h3>
                <span className="text-white/80 text-sm font-medium flex items-center gap-2">
                  Comprar ahora <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="bg-black text-white rounded-3xl p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">Únete al club</h2>
            <p className="text-gray-400 text-lg">
              Recibe ofertas exclusivas y novedades de productos antes que nadie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-4">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button className="px-8 py-4 h-auto rounded-full bg-blue-600 hover:bg-blue-700 text-lg font-bold">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

