import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllOrders,
  updateOrderStatus,
} from "../../services/orders";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Package, Truck, CheckCircle, XCircle } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { value: "shipped", label: "Enviado", color: "bg-blue-100 text-blue-800" },
  { value: "delivered", label: "Entregado", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-100 text-red-800" },
];

export default function Orders() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders", selectedStatus],
    queryFn: () => fetchAllOrders(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, trackingNumber }) =>
      updateOrderStatus(id, status, trackingNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders?.filter((o) => o.status === selectedStatus);

  const getStatusBadge = (status) => {
    const statusOption = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <Badge className={statusOption?.color || "bg-gray-100 text-gray-800"}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Órdenes</h1>
          <p className="text-gray-600 mt-2">Gestiona envíos y estado de órdenes</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={selectedStatus === "all" ? "default" : "outline"}
          onClick={() => setSelectedStatus("all")}
        >
          Todas
        </Button>
        {STATUS_OPTIONS.map((status) => (
          <Button
            key={status.value}
            variant={selectedStatus === status.value ? "default" : "outline"}
            onClick={() => setSelectedStatus(status.value)}
          >
            {status.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders?.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onUpdate={updateMutation.mutateAsync}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderRow({ order, onUpdate, getStatusBadge }) {
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");

  const handleUpdate = async () => {
    await onUpdate({
      id: order.id,
      status: newStatus,
      trackingNumber: trackingNumber || null,
    });
    setShowModal(false);
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          #{order.id.slice(0, 8)}
        </td>
        <td className="px-6 py-4">
          <div className="text-sm font-medium text-gray-900">
            {order.customer_name || "N/A"}
          </div>
          <div className="text-sm text-gray-500">{order.customer_email}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {order.items?.length || 0} items
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          ${order.total_amount?.toFixed(2)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {order.payment_method === "transfer" ? "Transferencia" : order.payment_method}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <Button
            onClick={() => setShowModal(true)}
            variant="outline"
            size="sm"
          >
            Gestionar
          </Button>
        </td>
      </tr>

      {showModal && (
        <OrderModal
          order={order}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          trackingNumber={trackingNumber}
          setTrackingNumber={setTrackingNumber}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
}

function OrderModal({
  order,
  newStatus,
  setNewStatus,
  trackingNumber,
  setTrackingNumber,
  onClose,
  onUpdate,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Gestionar Orden #{order.id.slice(0, 8)}</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {newStatus === "shipped" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Seguimiento
              </label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="ABC123456789"
              />
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={onUpdate}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              Actualizar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

