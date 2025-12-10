# Configuración de Netlify para RPM Importados

## Problemas identificados y soluciones:

### 1. Versión de Node.js incompatible
- **Error**: Netlify usa Node.js 18, pero el proyecto requiere Node.js 20+
- **Solución**: Actualizado `netlify.toml` para usar Node.js 20

### 2. Secrets scanning de Firebase
- **Error**: Netlify detecta las variables de Firebase como secrets expuestos
- **Solución**: Configurado `netlify.toml` para ignorar estas variables válidas

## Configuración requerida en Netlify:

### Variables de entorno (Environment Variables)
Ve a tu sitio en Netlify → **Site settings** → **Environment variables** → **Add variable**

Agrega estas variables con tus valores reales de Firebase:

```
VITE_FIREBASE_API_KEY          → Tu API Key de Firebase
VITE_FIREBASE_AUTH_DOMAIN       → tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID        → tu-project-id
VITE_FIREBASE_STORAGE_BUCKET    → tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID → Tu Messaging Sender ID
VITE_FIREBASE_APP_ID            → 1:xxxxxxxxx:web:xxxxxxxxxx
```

### ¿Dónde obtener los valores de Firebase?
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Configuración del proyecto** (ícono de engranaje)
4. Baja a **Tus apps** → **Configuración del SDK**
5. Copia los valores del objeto `firebaseConfig`

### Configuración de Build
En **Site settings** → **Build & deploy**, verifica:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 20 (se configura automáticamente por netlify.toml)

## Después de configurar:

1. **Trigger deploy**: Ve a **Deploys** → **Trigger deploy**
2. Espera a que termine el build
3. Tu sitio debería funcionar correctamente con productos y rutas

## Troubleshooting:

- Si aún no cargan los productos: Verifica que las variables de Firebase sean correctas
- Si las rutas no funcionan: El `_redirects` está configurado correctamente
- Si hay errores de build: Revisa que Node.js 20 esté siendo usado

¿Necesitas ayuda con algún paso específico?
