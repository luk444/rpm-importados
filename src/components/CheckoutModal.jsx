import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, MapPin, CreditCard, Truck, CheckCircle, ArrowRight, ArrowLeft, Home, Package } from "lucide-react";
import { Button } from "./ui/button";
import { calculateShippingCost, validateShippingAddress, formatShippingAddress } from "../services/shipping";
import { getUserProfile } from "../services/user";
import { createOrder } from "../services/orders";
import { auth } from "../firebase/client";

export default function CheckoutModal({ cartItems, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [customAddress, setCustomAddress] = useState({
    street: "",
    streetNumber: "",
    betweenStreets: "",
    city: "",
    province: "",
    postalCode: "",
  });
  const [shippingCost, setShippingCost] = useState(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = auth.currentUser;

  // Calcular subtotal del carrito
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    setOrderTotal(subtotal + (shippingCost?.total_cost || 0));
  }, [subtotal, shippingCost]);

  const loadUserProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);

      // Si tiene dirección guardada, pre-seleccionarla
      if (profile?.street && profile?.city && profile?.province && profile?.postalCode) {
        setSelectedAddress('saved');
      }
    }
  };

  const calculateShipping = async (address) => {
    setCalculatingShipping(true);
    try {
      const cost = await calculateShippingCost(address.postalCode, 1); // Peso estimado de 1kg
      setShippingCost(cost);
    } catch (error) {
      console.error("Error calculating shipping:", error);
    } finally {
      setCalculatingShipping(false);
    }
  };

  const handleAddressSelect = async (type) => {
    setSelectedAddress(type);

    if (type === 'saved' && userProfile) {
      const address = {
        street: userProfile.street,
        streetNumber: userProfile.streetNumber,
        betweenStreets: userProfile.betweenStreets,
        city: userProfile.city,
        province: userProfile.province,
        postalCode: userProfile.postalCode,
      };
      await calculateShipping(address);
    } else if (type === 'custom') {
      // Calcular si ya hay datos completos
      if (customAddress.postalCode && customAddress.postalCode.length >= 4) {
        const validation = validateShippingAddress(customAddress);
        if (validation.valid) {
          await calculateShipping(customAddress);
        }
      }
    }
  };

  const handleCustomAddressChange = async (field, value) => {
    const updatedAddress = { ...customAddress, [field]: value };
    setCustomAddress(updatedAddress);

    // Auto-calcular envío cuando el código postal esté completo
    if (field === 'postalCode' && value.length >= 4) {
      const validation = validateShippingAddress(updatedAddress);
      if (validation.valid) {
        await calculateShipping(updatedAddress);
      } else {
        setShippingCost(null);
      }
    }
  };

  const getSelectedAddress = () => {
    if (selectedAddress === 'saved' && userProfile) {
      return {
        street: userProfile.street,
        streetNumber: userProfile.streetNumber,
        betweenStreets: userProfile.betweenStreets,
        city: userProfile.city,
        province: userProfile.province,
        postalCode: userProfile.postalCode,
      };
    } else if (selectedAddress === 'custom') {
      return customAddress;
    }
    return null;
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !shippingCost) {
      alert("Por favor selecciona una dirección de envío y calcula el costo de envío.");
      return;
    }

    const address = getSelectedAddress();
    if (!address) {
      alert("Dirección de envío inválida.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer_name: user?.displayName || "Invitado",
        customer_email: user?.email || "invitado@rpm-importados.com",
        user_id: user?.uid || null,
        items: cartItems.map((item) => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: orderTotal,
        shipping_cost: shippingCost.total_cost,
        shipping_address: address,
        shipping_zone: shippingCost.zone,
        payment_method: "transfer",
      };

      const orderId = await createOrder(payload);
      onSuccess();
      navigate(`/order-confirmation?order=${orderId}`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error al crear el pedido. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const provinces = [
    "Buenos Aires", "Ciudad Autónoma de Buenos Aires", "Catamarca", "Chaco",
    "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy",
    "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro",
    "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
    "Santiago del Estero", "Tierra del Fuego", "Tucumán"
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === 1 ? 'bg-white/20' : 'bg-green-500'
              }`}>
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {step === 1 ? "Información de Envío" : "Confirmar Pedido"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {step === 1 ? "Completa tu dirección para calcular el envío" : "Revisa y confirma tu pedido"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mt-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              step >= 1 ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
            }`}>
              <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/40'}`}></span>
              Dirección
            </div>
            <ArrowRight className="w-4 h-4 text-white/60" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              step >= 2 ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
            }`}>
              <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/40'}`}></span>
              Confirmar
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step === 1 ? (
            // Paso 1: Seleccionar dirección
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Package className="w-6 h-6 text-blue-600" />
                  ¿Dónde quieres recibir tu pedido?
                </h3>

                {/* Dirección guardada */}
                {userProfile?.street && (
                  <div className={`border-2 rounded-xl p-5 mb-4 cursor-pointer transition-all ${
                    selectedAddress === 'saved'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}>
                    <label className="flex items-start gap-4 cursor-pointer w-full">
                      <input
                        type="radio"
                        name="address"
                        value="saved"
                        checked={selectedAddress === 'saved'}
                        onChange={() => handleAddressSelect('saved')}
                        className="mt-1 w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Home className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-gray-900">Mi Dirección Guardada</span>
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            Recomendado
                          </span>
                        </div>
                        <div className="text-gray-700 bg-white rounded-lg p-3 border border-gray-100">
                          {formatShippingAddress(userProfile)}
                        </div>
                      </div>
                    </label>
                  </div>
                )}

                {/* Nueva dirección */}
                <div className={`border-2 rounded-xl p-5 transition-all ${
                  selectedAddress === 'custom'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}>
                  <label className="flex items-center gap-4 cursor-pointer mb-6">
                    <input
                      type="radio"
                      name="address"
                      value="custom"
                      checked={selectedAddress === 'custom'}
                      onChange={() => handleAddressSelect('custom')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Nueva Dirección</span>
                    </div>
                  </label>

                  {selectedAddress === 'custom' && (
                    <div className="bg-white rounded-lg border border-gray-100 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Calle *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Av. Corrientes"
                            value={customAddress.street}
                            onChange={(e) => handleCustomAddressChange('street', e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número *
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            value={customAddress.streetNumber}
                            onChange={(e) => handleCustomAddressChange('streetNumber', e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Entre Calles
                          </label>
                          <input
                            type="text"
                            placeholder="Calles A y B"
                            value={customAddress.betweenStreets}
                            onChange={(e) => handleCustomAddressChange('betweenStreets', e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ciudad *
                          </label>
                          <input
                            type="text"
                            placeholder="Buenos Aires"
                            value={customAddress.city}
                            onChange={(e) => handleCustomAddressChange('city', e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Provincia *
                          </label>
                          <select
                            value={customAddress.province}
                            onChange={(e) => handleCustomAddressChange('province', e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="">Seleccionar Provincia</option>
                            {provinces.map(prov => (
                              <option key={prov} value={prov}>{prov}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código Postal *
                          </label>
                          <input
                            type="text"
                            placeholder="1234"
                            value={customAddress.postalCode}
                            onChange={(e) => handleCustomAddressChange('postalCode', e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Costo de envío */}
              {shippingCost && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Truck className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">
                        Costo de Envío Calculado
                      </h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Zona</div>
                          <div className="font-semibold text-gray-900">{shippingCost.zone}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Tiempo Estimado</div>
                          <div className="font-semibold text-green-600">{shippingCost.estimated_days}</div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-700">Envío base:</span>
                          <span className="font-medium">${shippingCost.base_cost}</span>
                        </div>
                        {shippingCost.additional_cost > 0 && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700">Adicional:</span>
                            <span className="font-medium">${shippingCost.additional_cost}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg text-gray-900">Total envío:</span>
                            <span className="font-bold text-xl text-green-600">${shippingCost.total_cost}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 h-12 border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  Cancelar Pedido
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedAddress || !shippingCost || calculatingShipping}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {calculatingShipping ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Calculando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Continuar
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // Paso 2: Confirmar pedido
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                  Confirma tu pedido
                </h3>

                {/* Productos */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Productos en tu pedido
                </h4>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">Cantidad: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                        <div className="text-sm text-gray-500">${item.price.toFixed(2)} c/u</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                {/* Costos */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Resumen de costos</h4>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">Subtotal productos:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-t border-gray-100">
                    <div>
                      <span className="text-gray-700">Envío</span>
                      <div className="text-sm text-gray-500">{shippingCost?.zone}</div>
                    </div>
                    <span className="font-medium">${shippingCost?.total_cost.toFixed(2)}</span>
                  </div>

                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total a pagar:</span>
                      <span className="text-2xl font-bold text-green-600">${orderTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dirección de envío */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Dirección de envío confirmada
                </h4>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <p className="text-gray-800 font-medium">
                    {formatShippingAddress(getSelectedAddress())}
                  </p>
                </div>
              </div>

              {/* Método de pago */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-900">
                  <CreditCard className="w-4 h-4" />
                  Método de pago
                </h4>
                <p className="text-green-800">
                  Transferencia bancaria (datos se mostrarán en la confirmación)
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-12 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Modificar Dirección
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Procesando pedido...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Confirmar Pedido
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

