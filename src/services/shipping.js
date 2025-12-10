// Servicio de envíos y cálculo de costos
import { collection, getDocs, doc, setDoc, query, where } from "firebase/firestore";
import { db } from "../firebase/client";

const SHIPPING_ZONES_COLLECTION = "shipping_zones";
const SHIPPING_COSTS_COLLECTION = "shipping_costs";

/**
 * Zonas de envío en Argentina con códigos postales aproximados
 */
const DEFAULT_ZONES = [
  {
    id: "caba",
    name: "Ciudad Autónoma de Buenos Aires",
    postal_codes: ["1000", "1999"],
    base_cost: 500,
    additional_per_kg: 150,
  },
  {
    id: "gba_norte",
    name: "Gran Buenos Aires Norte",
    postal_codes: ["1600", "1699"],
    base_cost: 800,
    additional_per_kg: 200,
  },
  {
    id: "gba_sur",
    name: "Gran Buenos Aires Sur",
    postal_codes: ["1700", "1999"],
    base_cost: 800,
    additional_per_kg: 200,
  },
  {
    id: "gba_oeste",
    name: "Gran Buenos Aires Oeste",
    postal_codes: ["1400", "1699"],
    base_cost: 800,
    additional_per_kg: 200,
  },
  {
    id: "interior_buenos_aires",
    name: "Interior Buenos Aires",
    postal_codes: ["6000", "7999", "8000", "8999"],
    base_cost: 1200,
    additional_per_kg: 300,
  },
  {
    id: "cordoba",
    name: "Córdoba",
    postal_codes: ["5000", "5999"],
    base_cost: 1500,
    additional_per_kg: 350,
  },
  {
    id: "santa_fe",
    name: "Santa Fe",
    postal_codes: ["2000", "3999"],
    base_cost: 1400,
    additional_per_kg: 330,
  },
  {
    id: "mendoza",
    name: "Mendoza",
    postal_codes: ["5500", "5999"],
    base_cost: 1600,
    additional_per_kg: 380,
  },
  {
    id: "tucuman",
    name: "Tucumán",
    postal_codes: ["4000", "4999"],
    base_cost: 1800,
    additional_per_kg: 420,
  },
  {
    id: "otros",
    name: "Otras Provincias",
    postal_codes: [], // Todas las demás
    base_cost: 2000,
    additional_per_kg: 500,
  },
];

/**
 * Inicializar zonas de envío por defecto
 */
export async function initializeShippingZones() {
  try {
    const snap = await getDocs(collection(db, SHIPPING_ZONES_COLLECTION));
    if (snap.empty) {
      console.log("Initializing default shipping zones...");
      for (const zone of DEFAULT_ZONES) {
        await setDoc(doc(db, SHIPPING_ZONES_COLLECTION, zone.id), zone);
      }
    }
  } catch (error) {
    console.error("Error initializing shipping zones:", error);
  }
}

/**
 * Calcular costo de envío basado en código postal
 */
export async function calculateShippingCost(postalCode, weightKg = 1) {
  try {
    // Asegurar que las zonas estén inicializadas
    await initializeShippingZones();

    const zonesSnap = await getDocs(collection(db, SHIPPING_ZONES_COLLECTION));
    const zones = zonesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Buscar zona por código postal
    let zone = zones.find(z =>
      z.postal_codes.some(prefix =>
        postalCode.startsWith(prefix)
      )
    );

    // Si no encuentra zona específica, usar "otros"
    if (!zone) {
      zone = zones.find(z => z.id === "otros");
    }

    if (!zone) {
      // Costo por defecto si no hay zonas configuradas
      return {
        zone: "Desconocida",
        base_cost: 2500,
        additional_cost: weightKg * 600,
        total_cost: 2500 + (weightKg * 600),
        estimated_days: "7-10 días hábiles"
      };
    }

    const baseCost = zone.base_cost;
    const additionalCost = Math.max(0, weightKg - 1) * zone.additional_per_kg; // Primer kg incluido
    const totalCost = baseCost + additionalCost;

    // Estimación de tiempo basada en la zona
    let estimatedDays = "3-5 días hábiles"; // CABA/GBA
    if (["cordoba", "santa_fe", "mendoza", "tucuman"].includes(zone.id)) {
      estimatedDays = "5-7 días hábiles";
    } else if (zone.id === "otros") {
      estimatedDays = "7-10 días hábiles";
    }

    return {
      zone: zone.name,
      base_cost: baseCost,
      additional_cost: additionalCost,
      total_cost: totalCost,
      estimated_days: estimatedDays,
      zone_id: zone.id
    };
  } catch (error) {
    console.error("Error calculating shipping cost:", error);
    return {
      zone: "Error en cálculo",
      base_cost: 0,
      additional_cost: 0,
      total_cost: 0,
      estimated_days: "Contactar soporte"
    };
  }
}

/**
 * Validar dirección completa
 */
export function validateShippingAddress(address) {
  const required = ["street", "streetNumber", "city", "province", "postalCode"];

  for (const field of required) {
    if (!address[field] || address[field].trim() === "") {
      return {
        valid: false,
        error: `El campo ${field} es obligatorio`
      };
    }
  }

  // Validar código postal (debe ser numérico y tener longitud razonable)
  if (!/^\d{4,5}$/.test(address.postalCode)) {
    return {
      valid: false,
      error: "Código postal inválido"
    };
  }

  return { valid: true };
}

/**
 * Formatear dirección para display
 */
export function formatShippingAddress(address) {
  if (!address) return "Dirección no especificada";

  const parts = [
    address.street,
    address.streetNumber,
    address.betweenStreets ? `entre ${address.betweenStreets}` : null,
    address.city,
    address.province,
    address.postalCode ? `CP: ${address.postalCode}` : null,
  ].filter(Boolean);

  return parts.join(", ");
}

