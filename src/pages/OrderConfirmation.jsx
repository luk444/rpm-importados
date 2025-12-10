import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchOrderById } from "../services/orders";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/client";
import { CheckCircle, CreditCard, MapPin, Phone, Mail, User, X } from "lucide-react";
import { createPageUrl } from "../utils";

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState(null);
  const [transferData, setTransferData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const orderData = await fetchOrderById(orderId);
        setOrder(orderData);

        // Obtener datos de transferencia
        let paymentMethodsSnap = await getDocs(collection(db, "payment_methods"));

        // Si no hay métodos de pago, crear uno por defecto
        if (paymentMethodsSnap.empty) {
          const { doc, setDoc } = await import("firebase/firestore");

          const defaultTransferMethod = {
            id: "transfer",
            name: "Transferencia Bancaria",
            enabled: true,
            type: "bank_transfer",
            config: {
              bank_name: "Banco Ejemplo",
              account_number: "123-456789-0",
              cbu: "1234567890123456789012",
              alias: "RPM.IMPORTADOS",
              instructions: "Realiza la transferencia bancaria usando los datos proporcionados.",
            },
          };

          try {
            await setDoc(doc(db, "payment_methods", "transfer"), defaultTransferMethod);
            paymentMethodsSnap = await getDocs(collection(db, "payment_methods"));
          } catch (error) {
            console.error("Error creating default transfer method:", error);
          }
        }

        const transferMethod = paymentMethodsSnap.docs.find(
          (doc) => doc.data().type === "bank_transfer" && doc.data().enabled
        );

        if (transferMethod) {
          setTransferData(transferMethod.data());
        }
      } catch (error) {
        console.error("Error loading order:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pedido no encontrado</h2>
          <p className="text-gray-600 mb-6">
            No se pudo encontrar el pedido solicitado.
          </p>
          <Link
            to={createPageUrl("Home")}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-blue-100 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
              ¡Pedido Confirmado!
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Gracias por tu compra. Tu pedido ha sido registrado exitosamente.
            </p>

            {/* Order ID Card */}
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl px-6 py-4 shadow-sm">
              <div className="text-left">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Número de pedido
                </div>
                <div className="text-2xl font-bold text-gray-900 font-mono">
                  #{orderId.slice(0, 8).toUpperCase()}
                </div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Estado
                </div>
                <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Pendiente de pago
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transfer Instructions */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Instrucciones de Transferencia
                </h2>
                <p className="text-gray-600">Completa tu pago para procesar el pedido</p>
              </div>
            </div>

            {transferData ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 shadow-sm">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CreditCard className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Monto total a transferir
                    </h3>
                    <p className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      ${order.total_amount?.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Incluye productos + envío</p>
                  </div>
                </div>

                <div className="text-center py-4">
                  <p className="text-gray-600">
                    Los datos bancarios se mostrarán aquí próximamente.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Los datos de transferencia no están disponibles temporalmente.
                  Contactanos para obtener las instrucciones.
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Resumen del Pedido
            </h2>

            <div className="space-y-4 mb-6">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal productos:</span>
                <span>${(order.total_amount - (order.shipping_cost || 0)).toFixed(2)}</span>
              </div>
              {order.shipping_cost && (
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>${order.shipping_cost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-bold border-t border-gray-300 pt-2">
                <span>Total:</span>
                <span>${order.total_amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            ¿Necesitas ayuda?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Email</h3>
              <p className="text-gray-600">soporte@rpmimportados.com</p>
            </div>
            <div>
              <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">WhatsApp</h3>
              <p className="text-gray-600">+54 11 1234-5678</p>
            </div>
            <div>
              <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Dirección</h3>
              <p className="text-gray-600">Buenos Aires, Argentina</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 text-center">
          <Link
            to={createPageUrl("Home")}
            className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors mr-4"
          >
            Continuar comprando
          </Link>
          {order.user_id && (
            <Link
              to="/user/dashboard"
              className="inline-block bg-gray-100 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Ver mis pedidos
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}