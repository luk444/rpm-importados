# 🚀 Guía de Publicación - RPM IMPORTADOS

Guía paso a paso para publicar tu e-commerce en producción.

## 📋 Checklist Pre-Publicación

### 1. Configurar Firebase

#### a) Crear Proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Anota el **Project ID**

#### b) Habilitar Servicios
- ✅ **Firestore Database**: Crear base de datos en modo producción
- ✅ **Authentication**: Habilitar método Email/Password
- ✅ **Storage** (opcional): Si vas a subir imágenes

#### c) Configurar Firestore
1. Ve a Firestore Database → Crear base de datos
2. Elige ubicación (ej: `southamerica-east1` para Argentina)
3. Crea las colecciones:
   - `products`
   - `orders`
   - `users`
   - `payment_methods`

#### d) Configurar Reglas de Seguridad
En Firestore → Reglas, pega esto:

```javascript
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

#### e) Crear Índices
En Firestore → Índices, crea un índice compuesto:
- **Colección**: `orders`
- **Campos**: 
  - `user_id` (Ascending)
  - `created_at` (Descending)

#### f) Obtener Credenciales
1. Ve a Configuración del proyecto (⚙️)
2. En "Tus aplicaciones", selecciona la web (</>)
3. Copia las credenciales:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en `/Users/boca/rpm-importados/app/`:

```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**⚠️ IMPORTANTE**: No subas el archivo `.env` a Git. Ya está en `.gitignore`.

### 3. Crear Primer Administrador

1. Ejecuta la app localmente: `npm run dev`
2. Ve a `http://localhost:5173/admin/login`
3. Crea una cuenta con email/password
4. El sistema automáticamente asignará rol de admin al primer usuario
5. O manualmente en Firestore:
   - Ve a `users` → Crea documento con ID = `uid_del_usuario`
   - Agrega campo: `role: "admin"`

### 4. Agregar Productos de Prueba

1. Inicia sesión como admin
2. Ve a `/admin/products`
3. Crea algunos productos de prueba
4. Verifica que se muestren en el catálogo público

---

## 🌐 Opciones de Hosting

### Opción 1: Firebase Hosting (Recomendado)

#### Instalación
```bash
cd /Users/boca/rpm-importados/app
npm install -g firebase-tools
firebase login
```

#### Inicializar
```bash
firebase init hosting
```

Selecciona:
- ✅ Use an existing project (tu proyecto Firebase)
- Public directory: `dist`
- ✅ Configure as a single-page app: Yes
- ✅ Set up automatic builds: No (por ahora)

#### Crear Build
```bash
npm run build
```

#### Publicar
```bash
firebase deploy --only hosting
```

Tu sitio estará en: `https://tu-proyecto.web.app`

#### Configurar Dominio Personalizado
1. En Firebase Console → Hosting
2. Agrega dominio personalizado
3. Sigue las instrucciones de DNS

---

### Opción 2: Vercel (Muy Fácil)

#### Instalación
```bash
npm install -g vercel
```

#### Publicar
```bash
cd /Users/boca/rpm-importados/app
vercel
```

Sigue las instrucciones:
- ✅ Link to existing project? No
- ✅ Project name: rpm-importados
- ✅ Directory: `./`
- ✅ Override settings? No

#### Configurar Variables de Entorno
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Settings → Environment Variables
4. Agrega todas las variables `VITE_FIREBASE_*`

#### Redeploy
```bash
vercel --prod
```

---

### Opción 3: Netlify

#### Instalación
```bash
npm install -g netlify-cli
```

#### Publicar
```bash
cd /Users/boca/rpm-importados/app
netlify login
netlify init
```

Configura:
- Build command: `npm run build`
- Publish directory: `dist`

#### Configurar Variables
1. Netlify Dashboard → Site settings → Environment variables
2. Agrega todas las variables `VITE_FIREBASE_*`

#### Deploy
```bash
npm run build
netlify deploy --prod
```

---

## 🔧 Configuración Post-Deploy

### 1. Verificar Funcionalidades
- [ ] Catálogo de productos se muestra
- [ ] Login/registro funciona
- [ ] Dashboard de usuario funciona
- [ ] Panel admin funciona
- [ ] Crear orden funciona
- [ ] Métodos de pago configurados

### 2. Configurar Métodos de Pago

#### Transferencia Bancaria
1. Ve a `/admin/payments`
2. Configura datos bancarios:
   - Nombre del banco
   - Número de cuenta
   - CBU
   - Alias
   - Instrucciones

#### MercadoPago (Futuro)
1. Crea cuenta en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Obtén Access Token y Public Key
3. Configura en `/admin/payments`
4. Configura webhook URL

### 3. Agregar Productos Reales
1. Inicia sesión como admin
2. Ve a `/admin/products`
3. Agrega todos tus productos con:
   - Nombre, descripción, precio
   - Categoría correcta
   - Imágenes (URLs o sube a Firebase Storage)
   - Stock disponible

### 4. Configurar SEO (Opcional)

Edita `index.html`:
```html
<title>RPM IMPORTADOS - Productos Importados Premium</title>
<meta name="description" content="Vapers, Termos, Drones y más productos importados de calidad">
```

---

## 🐛 Solución de Problemas

### Error: "Firebase config incomplete"
- Verifica que todas las variables `.env` estén correctas
- En producción, verifica que las variables estén en el hosting

### Error: "Permission denied" en Firestore
- Revisa las reglas de seguridad
- Verifica que el usuario tenga el rol correcto

### Las órdenes no se muestran al usuario
- Verifica que `user_id` se guarde al crear la orden
- Revisa el índice compuesto en Firestore

### Build falla
```bash
# Limpia y reinstala
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📱 Dominio Personalizado

### Con Firebase Hosting
1. Firebase Console → Hosting → Agregar dominio
2. Agrega tu dominio (ej: `www.rpmimportados.com`)
3. Configura DNS según las instrucciones
4. Espera verificación (puede tardar horas)

### Con Vercel/Netlify
1. Dashboard → Settings → Domains
2. Agrega tu dominio
3. Configura DNS según instrucciones

---

## ✅ Checklist Final

- [ ] Firebase configurado y funcionando
- [ ] Variables de entorno configuradas en producción
- [ ] Primer admin creado
- [ ] Productos agregados
- [ ] Métodos de pago configurados
- [ ] Sitio publicado y accesible
- [ ] Dominio personalizado configurado (opcional)
- [ ] Pruebas de funcionalidad completadas

---

## 🎉 ¡Listo!

Tu e-commerce está publicado. Los usuarios pueden:
- Ver productos
- Registrarse y comprar
- Ver sus pedidos
- Y tú puedes gestionar todo desde el panel admin

**Soporte**: Si tienes problemas, revisa la consola del navegador y los logs de Firebase.

