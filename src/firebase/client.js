import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Valores por defecto para desarrollo si no hay .env
const defaultConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
};

const config = {
  apiKey: firebaseConfig.apiKey || defaultConfig.apiKey,
  authDomain: firebaseConfig.authDomain || defaultConfig.authDomain,
  projectId: firebaseConfig.projectId || defaultConfig.projectId,
  storageBucket: firebaseConfig.storageBucket || defaultConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId || defaultConfig.messagingSenderId,
  appId: firebaseConfig.appId || defaultConfig.appId,
};

if (
  config.apiKey === defaultConfig.apiKey ||
  config.projectId === defaultConfig.projectId
) {
  console.warn(
    "[firebase] Usando configuración de demostración. Configura tus variables VITE_FIREBASE_* en .env"
  );
}

let app;
try {
  app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
} catch (error) {
  console.error("[firebase] Error al inicializar:", error);
  // Crear una app dummy para evitar errores
  app = getApps()[0] || initializeApp(config);
}

export const auth = getAuth(app);
export const db = getFirestore(app);

