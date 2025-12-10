// Script para poblar productos de ejemplo (ejecutar desde navegador)
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./src/firebase/client.js";

const products = [
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
      },
      {
        type: "size",
        name: "Capacidad",
        options: [
          { value: "1l", label: "1 Litro", price_modifier: 0 },
          { value: "500ml", label: "500ml", price_modifier: -15 }
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
          { value: "naranja", label: "Naranja", price_modifier: 2 },
          { value: "sandia", label: "Sandía", price_modifier: 2 }
        ]
      },
      {
        type: "nicotine",
        name: "Nicotine",
        options: [
          { value: "0mg", label: "0mg", price_modifier: 0 },
          { value: "3mg", label: "3mg", price_modifier: 5 },
          { value: "6mg", label: "6mg", price_modifier: 10 }
        ]
      }
    ]
  },
  {
    name: "Drone Parrot Anafi",
    description: "Drone profesional con cámara 4K HDR, zoom 32x y estabilización avanzada. Control remoto incluido.",
    price: 1299.99,
    category: "drones",
    image_url: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&q=80&w=800",
    stock: 3,
    featured: false,
  },
  {
    name: "Termo Hydro Flask 1.2L",
    description: "Termo aislante de doble pared con boquilla deportiva. Mantiene el frío por 24h y el calor por 12h.",
    price: 49.99,
    category: "termos",
    image_url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800",
    stock: 12,
    featured: false,
  },
  {
    name: "Vaporizador JUUL Compatible",
    description: "Pods compatibles con JUUL, sabores variados disponibles. Mayor autonomía y mejor sabor.",
    price: 19.99,
    category: "vaporizadores",
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800",
    stock: 50,
    featured: false,
  },
  {
    name: "Batería Externa Anker 20000mAh",
    description: "Power bank de alta capacidad con carga rápida USB-C y múltiples puertos. Perfecto para viajes.",
    price: 69.99,
    category: "tecnologia",
    image_url: "https://images.unsplash.com/photo-1609592806580-75ce0c2b6c0b?auto=format&fit=crop&q=80&w=800",
    stock: 8,
    featured: true,
  },
  {
    name: "Auriculares Sony WH-1000XM4",
    description: "Auriculares inalámbricos con cancelación de ruido líder en la industria. Hasta 30 horas de batería.",
    price: 299.99,
    category: "tecnologia",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    stock: 6,
    featured: false,
  },
];

async function seedProducts() {
  try {
    console.log("🌱 Poblando productos de ejemplo...");

    for (const product of products) {
      await addDoc(collection(db, "products"), {
        ...product,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      console.log(`✅ Agregado: ${product.name}`);
    }

    console.log("🎉 ¡Productos agregados exitosamente!");
  } catch (error) {
    console.error("❌ Error al poblar productos:", error);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProducts();
}

export { seedProducts };

