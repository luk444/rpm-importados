import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/client";
import { updateProfile } from "firebase/auth";
import { auth } from "../firebase/client";

const USERS_COLLECTION = "users";

/**
 * Obtiene el perfil del usuario
 */
export async function getUserProfile(userId) {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      // Crear perfil por defecto si no existe
      const defaultProfile = {
        displayName: "",
        phone: "",
        street: "",
        streetNumber: "",
        betweenStreets: "",
        city: "",
        province: "",
        postalCode: "",
        address: "", // Mantener para compatibilidad
        created_at: serverTimestamp(),
      };
      await setDoc(doc(db, USERS_COLLECTION, userId), defaultProfile);
      return defaultProfile;
    }
    return userDoc.data();
  } catch (error) {
    console.error("[user] Error fetching user profile:", error);
    return null;
  }
}

/**
 * Actualiza el perfil del usuario
 */
export async function updateUserProfile(userId, profileData) {
  try {
    const user = auth.currentUser;
    
    // Actualizar displayName en Auth si está presente
    if (profileData.displayName && user) {
      try {
        await updateProfile(user, {
          displayName: profileData.displayName,
        });
      } catch (error) {
        console.warn("[user] Could not update Auth profile:", error);
      }
    }

    // Construir dirección completa para compatibilidad
    const addressParts = [
      profileData.street,
      profileData.streetNumber,
      profileData.betweenStreets ? `Entre ${profileData.betweenStreets}` : "",
      profileData.city,
      profileData.province,
      profileData.postalCode,
    ].filter(Boolean);

    // Actualizar en Firestore
    await setDoc(
      doc(db, USERS_COLLECTION, userId),
      {
        ...profileData,
        address: addressParts.join(", "), // Dirección completa para compatibilidad
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error("[user] Error updating user profile:", error);
    throw error;
  }
}

