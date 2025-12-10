// Script para inicializar zonas de envío por defecto
import { initializeShippingZones } from "./src/services/shipping.js";

async function initShipping() {
  try {
    console.log("🚚 Inicializando zonas de envío...");
    await initializeShippingZones();
    console.log("✅ Zonas de envío inicializadas correctamente");
    console.log("");
    console.log("📦 Zonas disponibles:");
    console.log("• CABA: $500 + $150/kg adicional");
    console.log("• GBA Norte/Sur/Oeste: $800 + $200/kg adicional");
    console.log("• Interior Buenos Aires: $1200 + $300/kg adicional");
    console.log("• Córdoba: $1500 + $350/kg adicional");
    console.log("• Santa Fe: $1400 + $330/kg adicional");
    console.log("• Mendoza: $1600 + $380/kg adicional");
    console.log("• Tucumán: $1800 + $420/kg adicional");
    console.log("• Otras provincias: $2000 + $500/kg adicional");
  } catch (error) {
    console.error("❌ Error inicializando zonas de envío:", error);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initShipping();
}

export { initShipping };

