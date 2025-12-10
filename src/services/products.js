import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit as fsLimit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/client";

const PRODUCTS_COLLECTION = "products";

export async function fetchFeaturedProducts(limit = 4) {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where("featured", "==", true),
      orderBy("created_at", "desc"),
      fsLimit(limit)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("[products] Error fetching featured products:", error);
    return [];
  }
}

export async function fetchProducts({ category = "all", search = "", sortBy = "newest" }) {
  try {
    const filters = [];
    if (category && category !== "all") {
      filters.push(where("category", "==", category));
    }

    const sort =
      sortBy === "price_asc"
        ? ["price", "asc"]
        : sortBy === "price_desc"
        ? ["price", "desc"]
        : ["created_at", "desc"];

    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      ...filters,
      orderBy(sort[0], sort[1]),
      fsLimit(100)
    );
    const snap = await getDocs(q);
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (search) {
      const lower = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name?.toLowerCase().includes(lower) ||
          i.description?.toLowerCase().includes(lower)
      );
    }

    if (sortBy === "price_asc") items.sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") items.sort((a, b) => b.price - a.price);
    return items;
  } catch (error) {
    console.error("[products] Error fetching products:", error);
    return [];
  }
}

export async function fetchProductById(id) {
  try {
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error("[products] Error fetching product by id:", error);
    return null;
  }
}

export async function fetchSimilarProducts(category, currentProductId, limit = 4) {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where("category", "==", category),
      where("stock", ">", 0),
      limit(limit + 1) // +1 para excluir el producto actual
    );
    const snap = await getDocs(q);
    const products = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => p.id !== currentProductId);

    return products.slice(0, limit);
  } catch (error) {
    console.error("[products] Error fetching similar products:", error);
    return [];
  }
}

export async function createProduct(productData) {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("[products] Error creating product:", error);
    throw error;
  }
}

export async function updateProduct(id, productData) {
  try {
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(ref, {
      ...productData,
      updated_at: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("[products] Error updating product:", error);
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error("[products] Error deleting product:", error);
    throw error;
  }
}

