import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/client";

const USERS_COLLECTION = "users";

/**
 * Verifica si un usuario es administrador
 */
export async function isAdmin(userId) {
  if (!userId) return false;
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) return false;
    const userData = userDoc.data();
    return userData.role === "admin";
  } catch (error) {
    console.error("[admin] Error checking admin status:", error);
    return false;
  }
}

/**
 * Establece el rol de administrador para un usuario
 */
export async function setAdminRole(userId, isAdmin = true) {
  try {
    await setDoc(
      doc(db, USERS_COLLECTION, userId),
      { role: isAdmin ? "admin" : "user" },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error("[admin] Error setting admin role:", error);
    return false;
  }
}

