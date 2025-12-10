// Script para resetear métodos de pago por defecto
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./src/firebase/client.js";

async function resetPayments() {
  try {
    console.log("🔄 Reseteando métodos de pago...");

    // Eliminar métodos existentes
    const snap = await getDocs(collection(db, "payment_methods"));
    for (const docSnap of snap.docs) {
      await deleteDoc(doc(db, "payment_methods", docSnap.id));
      console.log(`🗑️  Eliminado: ${docSnap.id}`);
    }

    // Crear método por defecto
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
        instructions: "Realiza la transferencia bancaria usando los datos proporcionados. Una vez completada, envía el comprobante por WhatsApp al +54 9 11 2321-3938 con el número de pedido.",
      },
    };

    await setDoc(doc(db, "payment_methods", "transfer"), defaultTransferMethod);
    console.log("✅ Método de pago por defecto creado");

    console.log("🎉 ¡Métodos de pago reseteados!");
    console.log("");
    console.log("📝 Ahora puedes:");
    console.log("1. Ir a /admin/payments");
    console.log("2. Editar 'Transferencia Bancaria'");
    console.log("3. Configurar tus datos reales");
    console.log("4. Las instrucciones aparecerán en las confirmaciones de pedido");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  resetPayments();
}

export { resetPayments };

