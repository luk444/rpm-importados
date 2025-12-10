import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "../../firebase/client";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/auth";
import { fetchUserOrders } from "../../services/orders";
import { getUserProfile, updateUserProfile } from "../../services/user";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Package,
  User,
  ShoppingBag,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Edit,
  ArrowLeft,
  Home,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  pending: "Pendiente",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const user = auth.currentUser;

  const { data: orders, isLoading } = useQuery({
    queryKey: ["user-orders", user?.uid],
    queryFn: () => fetchUserOrders(user?.uid),
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const pendingOrders = orders?.filter((o) => o.status === "pending") || [];
  const totalSpent = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              to={createPageUrl("Home")}
              className="flex items-center gap-1 hover:text-gray-900 transition-colors"
            >
              <Home className="w-4 h-4" />
              Inicio
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Mi Cuenta</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mi Cuenta
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenido, {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("Home")}>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Inicio
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pedidos Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingOrders.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Gastado</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "orders"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Mis Pedidos
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "profile"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Mi Perfil
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "orders" && (
              <OrdersTab orders={orders} isLoading={isLoading} />
            )}
            {activeTab === "profile" && <ProfileTab user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ orders, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tienes pedidos aún
        </h3>
        <p className="text-gray-600 mb-6">
          Cuando realices tu primera compra, aparecerá aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const orderDate = order.created_at?.toDate?.() || new Date(order.created_at);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <div>
              <p className="text-sm text-gray-600">Pedido #{order.id.slice(0, 8)}</p>
              <p className="text-xs text-gray-500">
                {orderDate.toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Badge className={STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}>
              {STATUS_LABELS[order.status] || order.status}
            </Badge>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>{order.items?.length || 0} productos</span>
            <span className="font-bold text-gray-900">
              ${order.total_amount?.toFixed(2)}
            </span>
            {order.payment_method && (
              <span className="capitalize">
                {order.payment_method === "transfer"
                  ? "Transferencia"
                  : order.payment_method}
              </span>
            )}
          </div>

          {order.tracking_number && (
            <div className="mt-2 text-sm">
              <span className="text-gray-600">Seguimiento: </span>
              <span className="font-medium text-blue-600">
                {order.tracking_number}
              </span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Ocultar" : "Ver Detalles"}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Productos:</h4>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
              >
                <span>{item.name}</span>
                <span className="text-gray-600">
                  {item.quantity} x ${item.price?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileTab({ user }) {
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", user?.uid],
    queryFn: () => getUserProfile(user?.uid),
    enabled: !!user?.uid,
  });

  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    street: "",
    streetNumber: "",
    betweenStreets: "",
    city: "",
    province: "",
    postalCode: "",
    address: "", // Para compatibilidad
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || user?.displayName || "",
        phone: profile.phone || "",
        street: profile.street || "",
        streetNumber: profile.streetNumber || "",
        betweenStreets: profile.betweenStreets || "",
        city: profile.city || "",
        province: profile.province || "",
        postalCode: profile.postalCode || "",
        address: profile.address || "",
      });
    }
  }, [profile, user]);

  const updateMutation = useMutation({
    mutationFn: (data) => updateUserProfile(user.uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", user?.uid] });
      setEditing(false);
    },
  });

  const handleSave = async (e) => {
    e?.preventDefault();
    try {
      await updateMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error al guardar los cambios. Por favor intenta de nuevo.");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Información Personal</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditing(!editing)}
        >
          <Edit className="w-4 h-4 mr-2" />
          {editing ? "Cancelar" : "Editar"}
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            El email no se puede cambiar
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Nombre Completo
          </label>
          {editing ? (
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
              {formData.displayName || "No especificado"}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Teléfono
          </label>
          {editing ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+54 11 1234-5678"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
              {formData.phone || "No especificado"}
            </div>
          )}
        </div>

        {/* Dirección Detallada */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Dirección de Envío
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calle *
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  placeholder="Nombre de la calle"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  {formData.street || "No especificado"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.streetNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, streetNumber: e.target.value })
                  }
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  {formData.streetNumber || "No especificado"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entre Calles
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.betweenStreets}
                  onChange={(e) =>
                    setFormData({ ...formData, betweenStreets: e.target.value })
                  }
                  placeholder="Calle A y Calle B"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  {formData.betweenStreets || "No especificado"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad *
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Buenos Aires"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  {formData.city || "No especificado"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provincia *
              </label>
              {editing ? (
                <select
                  value={formData.province}
                  onChange={(e) =>
                    setFormData({ ...formData, province: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona una provincia</option>
                  <option value="Buenos Aires">Buenos Aires</option>
                  <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
                  <option value="Catamarca">Catamarca</option>
                  <option value="Chaco">Chaco</option>
                  <option value="Chubut">Chubut</option>
                  <option value="Córdoba">Córdoba</option>
                  <option value="Corrientes">Corrientes</option>
                  <option value="Entre Ríos">Entre Ríos</option>
                  <option value="Formosa">Formosa</option>
                  <option value="Jujuy">Jujuy</option>
                  <option value="La Pampa">La Pampa</option>
                  <option value="La Rioja">La Rioja</option>
                  <option value="Mendoza">Mendoza</option>
                  <option value="Misiones">Misiones</option>
                  <option value="Neuquén">Neuquén</option>
                  <option value="Río Negro">Río Negro</option>
                  <option value="Salta">Salta</option>
                  <option value="San Juan">San Juan</option>
                  <option value="San Luis">San Luis</option>
                  <option value="Santa Cruz">Santa Cruz</option>
                  <option value="Santa Fe">Santa Fe</option>
                  <option value="Santiago del Estero">Santiago del Estero</option>
                  <option value="Tierra del Fuego">Tierra del Fuego</option>
                  <option value="Tucumán">Tucumán</option>
                </select>
              ) : (
                <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  {formData.province || "No especificado"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Postal
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  placeholder="1234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  {formData.postalCode || "No especificado"}
                </div>
              )}
            </div>
          </div>
        </div>

        {editing && (
          <div className="pt-6 border-t border-gray-200 flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

