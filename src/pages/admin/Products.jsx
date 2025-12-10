import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/products";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Edit, Trash2, X, Database } from "lucide-react";

export default function Products() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => fetchProducts({ category: "all", search: "", sortBy: "newest" }),
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setShowModal(false);
    },
  });

  // Función para poblar productos de ejemplo
  const seedProducts = async () => {
    const sampleProducts = [
      {
        name: "Drone DJI Mini 3 Pro",
        description: "Drone compacto con cámara 4K, GPS preciso y vuelo inteligente. Ideal para fotografía aérea y videografía profesional.",
        price: 899.99,
        category: "drones",
        image_url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800",
        stock: 5,
        featured: true,
        variants: [
          {
            type: "color",
            name: "Color",
            options: [
              { value: "blanco", label: "Blanco", price_modifier: 0 },
              { value: "negro", label: "Negro", price_modifier: 0 },
              { value: "rojo", label: "Rojo", price_modifier: 20 }
            ]
          }
        ]
      },
      {
        name: "Termo Stanley Classic 1L",
        description: "Termo de acero inoxidable premium que mantiene la temperatura por 24 horas. Perfecto para café, té o bebidas frías.",
        price: 89.99,
        category: "termos",
        image_url: "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&q=80&w=800",
        stock: 15,
        featured: true,
        variants: [
          {
            type: "color",
            name: "Color",
            options: [
              { value: "negro", label: "Negro", price_modifier: 0 },
              { value: "blanco", label: "Blanco", price_modifier: 0 },
              { value: "rojo", label: "Rojo", price_modifier: 5 },
              { value: "azul", label: "Azul", price_modifier: 5 }
            ]
          }
        ]
      },
      {
        name: "Vaporizador SMOK Novo 4",
        description: "Vaporizador pod system con batería de 800mAh, pantalla OLED y sistema de bloqueo infantil. Incluye 2 pods.",
        price: 45.99,
        category: "vaporizadores",
        image_url: "https://images.unsplash.com/photo-1537498425277-c283d32ef9db?auto=format&fit=crop&q=80&w=800",
        stock: 20,
        featured: true,
        variants: [
          {
            type: "flavor",
            name: "Sabor",
            options: [
              { value: "menta", label: "Menta", price_modifier: 0 },
              { value: "frutilla", label: "Frutilla", price_modifier: 0 },
              { value: "uva", label: "Uva", price_modifier: 0 },
              { value: "naranja", label: "Naranja", price_modifier: 2 }
            ]
          }
        ]
      },
      {
        name: "Batería Externa Anker 20000mAh",
        description: "Power bank de alta capacidad con carga rápida USB-C y múltiples puertos. Perfecto para viajes.",
        price: 69.99,
        category: "tecnologia",
        image_url: "https://images.unsplash.com/photo-1609592806580-75ce0c2b6c0b?auto=format&fit=crop&q=80&w=800",
        stock: 8,
        featured: true,
      }
    ];

    try {
      for (const product of sampleProducts) {
        await createProduct(product);
      }
      alert("✅ Productos de ejemplo agregados exitosamente!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (error) {
      console.error("Error seeding products:", error);
      alert("❌ Error al agregar productos de ejemplo");
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setShowModal(false);
      setEditingProduct(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-2">Gestiona tu catálogo de productos</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={seedProducts}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Database className="w-4 h-4 mr-2" />
            Poblar Ejemplos
          </Button>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
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
                    Imagen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products?.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={product.image_url || "/placeholder.png"}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSave={(data) => {
            if (editingProduct) {
              updateMutation.mutate({ id: editingProduct.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category: product?.category || "drones",
    image_url: product?.image_url || "",
    stock: product?.stock || 0,
    featured: product?.featured || false,
  });

  const categories = [
    "drones",
    "vaporizadores",
    "termos",
    "tecnologia",
    "accesorios",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock *
              </label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de Imagen
            </label>
            <Input
              type="url"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
              Producto destacado
            </label>
          </div>

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

