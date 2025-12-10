# 🔥 Configuración Rápida de Firebase

## Problema Actual
Las reglas actuales bloquean todo acceso a Firestore, por eso no funciona nada.

## Solución Rápida (3 minutos)

### 1. Copiar Reglas
Ve a [Firebase Console → Firestore → Reglas](https://console.firebase.google.com/project/rpm-importados/firestore/rules)

**Pega esto exactamente:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Productos: lectura pública, escritura solo admin
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Órdenes: creación pública, lectura propia o admin
    match /orders/{orderId} {
      allow create: if true;
      allow read: if request.auth != null && (
        resource.data.user_id == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow update: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Usuarios: lectura/escritura propia, escritura admin
    match /users/{userId} {
      allow read: if request.auth != null && (
        request.auth.uid == userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow write: if request.auth != null && (
        request.auth.uid == userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }

    // Métodos de pago: solo admin
    match /payment_methods/{methodId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

**Haz clic en "Publicar"**

### 2. Crear Índice
Ve a [Firebase Console → Firestore → Índices](https://console.firebase.google.com/project/rpm-importados/firestore/indexes)

**Crear índice compuesto:**
- **Colección**: `orders`
- **Campos**:
  - Campo 1: `user_id` → `Ascendente`
  - Campo 2: `created_at` → `Descendente`
- **Estado**: Se creará automáticamente

### 3. Verificar
```bash
cd /Users/boca/rpm-importados/app
npm run dev
```

Ve a `http://localhost:5173/admin/login` y crea tu cuenta admin.

## ✅ ¡Listo!

Ahora deberías poder:
- Registrarte e iniciar sesión
- Ver productos
- Hacer pedidos
- Gestionar todo desde el panel admin

---

## Comando Alternativo (Si prefieres línea de comandos)

```bash
cd /Users/boca/rpm-importados/app
npx firebase deploy --only firestore
```

Esto aplica tanto reglas como índices automáticamente.

---

## ¿Problemas?

Si aún no funciona:
1. Revisa que las reglas se publicaron correctamente
2. Espera 5 minutos a que el índice se cree
3. Verifica la consola del navegador para errores específicos
