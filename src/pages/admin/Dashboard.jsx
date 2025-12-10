import React from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/client";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

async function fetchStats() {
  const [productsSnap, ordersSnap, pendingOrdersSnap] = await Promise.all([
    getDocs(collection(db, "products")),
    getDocs(collection(db, "orders")),
    getDocs(query(collection(db, "orders"), where("status", "==", "pending"))),
  ]);

  const orders = ordersSnap.docs.map((d) => d.data());
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingCount = pendingOrdersSnap.size;

  return {
    totalProducts: productsSnap.size,
    totalOrders: ordersSnap.size,
    totalRevenue,
    pendingOrders: pendingCount,
  };
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchStats,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const cards = [
    {
      title: "Productos Totales",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Órdenes Totales",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      title: "Ingresos Totales",
      value: `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "bg-purple-500",
    },
    {
      title: "Órdenes Pendientes",
      value: stats?.pendingOrders || 0,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Resumen general de tu tienda</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`${card.color} p-3 rounded-lg text-white`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Bienvenido al Panel de Administración
        </h2>
        <p className="text-gray-600">
          Desde aquí puedes gestionar productos, órdenes, métodos de pago y
          ver métricas detalladas de tu tienda.
        </p>
      </div>
    </div>
  );
}

