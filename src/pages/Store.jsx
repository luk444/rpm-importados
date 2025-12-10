import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchProducts } from "../services/products";

export default function Store() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category") || "all";
  const initialSearch = queryParams.get("q") || "";
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (search) params.set("q", search);
    navigate(`?${params.toString()}`, { replace: true });
  }, [category, search, navigate]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", category, search, sortBy],
    queryFn: () => fetchProducts({ category, search, sortBy }),
  });

  const categories = [
    { id: "all", label: "Todos" },
    { id: "drones", label: "Drones" },
    { id: "vaporizadores", label: "Vaporizadores" },
    { id: "termos", label: "Termos" },
    { id: "tecnologia", label: "Tecnología" },
    { id: "accesorios", label: "Accesorios" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Catálogo</h1>
          <p className="text-gray-500">Explora nuestros productos premium</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar productos..."
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
          >
            <option value="newest">Más recientes</option>
            <option value="price_asc">Precio: Bajo a Alto</option>
            <option value="price_desc">Precio: Alto a Bajo</option>
          </select>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-2 mb-8 no-scrollbar">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={category === cat.id ? "default" : "outline"}
            onClick={() => setCategory(cat.id)}
            className={`rounded-full whitespace-nowrap ${
              category === cat.id
                ? "bg-black text-white hover:bg-gray-800"
                : "border-gray-200 text-gray-600"
            }`}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-[350px] animate-pulse" />
            ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No se encontraron productos</h3>
          <p className="text-gray-500 mb-6">Intenta con otros términos o cambia la categoría.</p>
          <Button variant="outline" onClick={() => { setSearch(""); setCategory("all"); }}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

