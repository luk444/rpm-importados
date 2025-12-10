import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { CreditCard, Building2, CheckCircle, X } from "lucide-react";

const PAYMENT_METHODS_COLLECTION = "payment_methods";

async function fetchPaymentMethods() {
  try {
    const snap = await getDocs(collection(db, PAYMENT_METHODS_COLLECTION));
    if (snap.empty) {
      // Crear métodos por defecto si no existen
      const defaultMethods = [
        {
          id: "transfer",
          name: "Transferencia Bancaria",
          enabled: true,
          type: "bank_transfer",
          config: {
            bank_name: "Banco de Ejemplo",
            account_number: "",
            cbu: "",
            alias: "",
            instructions: "Realiza la transferencia y envía el comprobante",
          },
        },
        {
          id: "mercadopago",
          name: "MercadoPago",
          enabled: false,
          type: "mercadopago",
          config: {
            access_token: "",
            public_key: "",
            webhook_url: "",
          },
        },
      ];

      for (const method of defaultMethods) {
        await setDoc(doc(db, PAYMENT_METHODS_COLLECTION, method.id), method);
      }

      return defaultMethods;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("[payments] Error fetching payment methods:", error);
    return [];
  }
}

async function updatePaymentMethod(id, data) {
  try {
    await setDoc(
      doc(db, PAYMENT_METHODS_COLLECTION, id),
      data,
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error("[payments] Error updating payment method:", error);
    throw error;
  }
}

export default function Payments() {
  const queryClient = useQueryClient();
  const [editingMethod, setEditingMethod] = useState(null);

  const { data: methods, isLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: fetchPaymentMethods,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePaymentMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      setEditingMethod(null);
    },
  });

  const handleToggle = async (method) => {
    await updateMutation.mutateAsync({
      id: method.id,
      data: { ...method, enabled: !method.enabled },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Métodos de Pago</h1>
        <p className="text-gray-600 mt-2">
          Configura y gestiona los métodos de pago disponibles
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {methods?.map((method) => (
            <div
              key={method.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {method.type === "bank_transfer" ? (
                    <Building2 className="w-8 h-8 text-blue-600" />
                  ) : (
                    <CreditCard className="w-8 h-8 text-green-600" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {method.name}
                    </h3>
                    <p className="text-sm text-gray-500">{method.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      method.enabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {method.enabled ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              {method.type === "bank_transfer" && (
                <div className="space-y-2 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Banco: </span>
                    <span className="font-medium">
                      {method.config?.bank_name || "No configurado"}
                    </span>
                  </div>
                  {method.config?.account_number && (
                    <div>
                      <span className="text-gray-600">Cuenta: </span>
                      <span className="font-medium">
                        {method.config.account_number}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {method.type === "mercadopago" && (
                <div className="mb-4 text-sm text-gray-600">
                  {method.config?.public_key
                    ? "Configurado"
                    : "Requiere configuración"}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => setEditingMethod(method)}
                  variant="outline"
                  className="flex-1"
                >
                  Configurar
                </Button>
                <Button
                  onClick={() => handleToggle(method)}
                  variant={method.enabled ? "outline" : "default"}
                  className="flex-1"
                >
                  {method.enabled ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingMethod && (
        <PaymentMethodModal
          method={editingMethod}
          onClose={() => setEditingMethod(null)}
          onSave={(data) => {
            updateMutation.mutate({
              id: editingMethod.id,
              data: { ...editingMethod, ...data },
            });
          }}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}

function PaymentMethodModal({ method, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    enabled: method.enabled,
    config: method.config || {},
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Configurar {method.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {method.type === "bank_transfer" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Banco
                </label>
                <Input
                  value={formData.config.bank_name || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        bank_name: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Cuenta
                </label>
                <Input
                  value={formData.config.account_number || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        account_number: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CBU
                </label>
                <Input
                  value={formData.config.cbu || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, cbu: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alias
                </label>
                <Input
                  value={formData.config.alias || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, alias: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instrucciones
                </label>
                <textarea
                  value={formData.config.instructions || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        instructions: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
            </>
          )}

          {method.type === "mercadopago" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token
                </label>
                <Input
                  type="password"
                  value={formData.config.access_token || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        access_token: e.target.value,
                      },
                    })
                  }
                  placeholder="APP_USR-..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Key
                </label>
                <Input
                  value={formData.config.public_key || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        public_key: e.target.value,
                      },
                    })
                  }
                  placeholder="APP_USR_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <Input
                  value={formData.config.webhook_url || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        webhook_url: e.target.value,
                      },
                    })
                  }
                  placeholder="https://tu-dominio.com/api/webhook"
                />
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

