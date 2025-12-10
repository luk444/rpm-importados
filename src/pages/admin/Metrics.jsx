import React from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/client";
import { TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";

async function fetchMetrics() {
  const [productsSnap, ordersSnap] = await Promise.all([
    getDocs(collection(db, "products")),
    getDocs(collection(db, "orders")),
  ]);

  const orders = ordersSnap.docs.map((d) => d.data());
  
  // Calcular métricas
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Órdenes por estado
  const ordersByStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  // Órdenes por método de pago
  const ordersByPayment = orders.reduce((acc, o) => {
    const method = o.payment_method || "transfer";
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  // Productos más vendidos (simplificado - en producción usaría subcolección de ventas)
  const productSales = {};
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      productSales[item.product_id] = (productSales[item.product_id] || 0) + item.quantity;
    });
  });

  return {
    totalProducts: productsSnap.size,
    totalOrders,
    totalRevenue,
    avgOrderValue,
    ordersByStatus,
    ordersByPayment,
    productSales,
  };
}

export default function Metrics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: fetchMetrics,
    refetchInterval: 60000, // Refrescar cada minuto
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Métricas</h1>
        <p className="text-gray-600 mt-2">Análisis detallado de tu tienda</p>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ingresos Totales"
          value={`$${metrics?.totalRevenue?.toFixed(2) || "0.00"}`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <MetricCard
          title="Órdenes Totales"
          value={metrics?.totalOrders || 0}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        <MetricCard
          title="Ticket Promedio"
          value={`$${metrics?.avgOrderValue?.toFixed(2) || "0.00"}`}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <MetricCard
          title="Productos"
          value={metrics?.totalProducts || 0}
          icon={Package}
          color="bg-orange-500"
        />
      </div>

      {/* Gráficos de distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Órdenes por Estado
          </h2>
          <div className="space-y-3">
            {Object.entries(metrics?.ordersByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {status}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (count / metrics?.totalOrders) * 100 || 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Órdenes por Método de Pago
          </h2>
          <div className="space-y-3">
            {Object.entries(metrics?.ordersByPayment || {}).map(
              ([method, count]) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {method === "transfer" ? "Transferencia" : method}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (count / metrics?.totalOrders) * 100 || 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg text-white`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

