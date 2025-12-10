import {
  addDoc,
  collection,
  serverTimestamp,
  orderBy,
  limit as fsLimit,
  query,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/client";

const ORDERS_COLLECTION = "orders";

export async function createOrder(payload) {
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...payload,
    status: "pending",
    created_at: serverTimestamp(),
    payment_method: payload.payment_method || "transfer",
    user_id: payload.user_id || null, // Agregar user_id si está disponible
  });
  return docRef.id;
}

export async function fetchRecentOrders(limit = 10) {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy("created_at", "desc"),
      fsLimit(limit)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("[orders] Error fetching recent orders:", error);
    return [];
  }
}

export async function fetchAllOrders() {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy("created_at", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("[orders] Error fetching all orders:", error);
    return [];
  }
}

export async function fetchOrderById(id) {
  try {
    const ref = doc(db, ORDERS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error("[orders] Error fetching order by id:", error);
    return null;
  }
}

export async function updateOrderStatus(id, status, trackingNumber = null) {
  try {
    const ref = doc(db, ORDERS_COLLECTION, id);
    const updateData = {
      status,
      updated_at: serverTimestamp(),
    };
    if (trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }
    await updateDoc(ref, updateData);
    return true;
  } catch (error) {
    console.error("[orders] Error updating order status:", error);
    throw error;
  }
}

export async function fetchOrdersByStatus(status) {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where("status", "==", status),
      orderBy("created_at", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("[orders] Error fetching orders by status:", error);
    return [];
  }
}

export async function fetchUserOrders(userId) {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where("user_id", "==", userId),
      orderBy("created_at", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("[orders] Error fetching user orders:", error);
    // Si falla por índice, intentar sin el orderBy
    try {
      const q2 = query(
        collection(db, ORDERS_COLLECTION),
        where("user_id", "==", userId)
      );
      const snap2 = await getDocs(q2);
      const orders = snap2.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Ordenar manualmente
      return orders.sort((a, b) => {
        const dateA = a.created_at?.toDate?.() || new Date(a.created_at);
        const dateB = b.created_at?.toDate?.() || new Date(b.created_at);
        return dateB - dateA;
      });
    } catch (error2) {
      console.error("[orders] Error fetching user orders (fallback):", error2);
      return [];
    }
  }
}

