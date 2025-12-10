import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/client";

const USERS_COLLECTION = "users";

/**
 * Crea o actualiza el documento del usuario en Firestore
 */
async function ensureUserInFirestore(user, additionalData = {}) {
  try {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Crear nuevo usuario en Firestore
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || "",
        created_at: serverTimestamp(),
        role: "user", // Por defecto es usuario normal
        ...additionalData,
      });
    } else {
      // Actualizar último acceso
      await setDoc(
        userRef,
        {
          last_login: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("[auth] Error ensuring user in Firestore:", error);
  }
}

export function listenAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      await ensureUserInFirestore(user);
    }
    callback(user);
  });
}

export async function login(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserInFirestore(res.user);
  return res.user;
}

export async function register(email, password, displayName = "") {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  // Actualizar displayName en Auth si se proporciona
  if (displayName) {
    try {
      await updateProfile(res.user, { displayName });
    } catch (error) {
      console.warn("[auth] Could not update displayName in Auth:", error);
    }
  }
  await ensureUserInFirestore(res.user, { displayName });
  return res.user;
}

export async function logout() {
  await signOut(auth);
}

