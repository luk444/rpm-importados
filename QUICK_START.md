# ⚡ Inicio Rápido - Publicar tu E-commerce

## Pasos Esenciales (15 minutos)

### 1. Configurar Firebase (5 min)
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea proyecto nuevo
3. Habilita **Firestore** y **Authentication** (Email/Password)
4. Copia las credenciales del proyecto

### 2. Configurar Variables (2 min)
Crea `.env` en `/Users/boca/rpm-importados/app/`:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 3. Configurar Firestore (3 min)
```bash
cd /Users/boca/rpm-importados/app
npx firebase deploy --only firestore
```

### 3. Configurar Firestore (3 min)
1. Crea base de datos Firestore
2. Copia las reglas de seguridad del `README.md`
3. Crea índice compuesto: `orders` → `user_id` (Asc) + `created_at` (Desc)

### 4. Crear Admin (2 min)
```bash
cd /Users/boca/rpm-importados/app
npm run dev
```
- Ve a `http://localhost:5173/admin/login`
- Crea cuenta → automáticamente será admin

### 5. Publicar (3 min)

**Opción A: Vercel (Más fácil)**
```bash
npm install -g vercel
vercel
# Agrega variables de entorno en el dashboard
```

**Opción B: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
```

---

## ✅ Listo para Producción

Después de publicar:
1. Agrega productos en `/admin/products`
2. Configura métodos de pago en `/admin/payments`
3. ¡Tu tienda está funcionando!

**Guía completa**: Ver `DEPLOY.md` para más detalles.

