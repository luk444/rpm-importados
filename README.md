# RPM IMPORTADOS - E-commerce Platform

Plataforma de e-commerce para productos importados (Vapers, Termos, Drones, etc.) con panel de administración completo.

## 🚀 Características

### Frontend Público
- ✅ Catálogo de productos con filtros y búsqueda
- ✅ Página de detalles de producto
- ✅ Carrito de compras
- ✅ Checkout con transferencia bancaria
- ✅ Sistema de login/registro para usuarios
- ✅ Dashboard de usuario con pedidos y perfil
- ✅ Diseño moderno y responsive con TailwindCSS

### Panel de Administración
- ✅ Sistema de login/autenticación
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión completa de productos (CRUD)
- ✅ Gestión de órdenes y envíos
- ✅ Configuración de métodos de pago
- ✅ Métricas y análisis de ventas

### Dashboard de Usuarios
- ✅ Login y registro de usuarios
- ✅ Dashboard personal con estadísticas
- ✅ Visualización de todos los pedidos
- ✅ Seguimiento de estado de pedidos
- ✅ Número de seguimiento de envíos
- ✅ Gestión de perfil (nombre, teléfono, dirección detallada)
- ✅ Historial de compras

### Sistema de Pagos y Envíos
- ✅ Checkout completo con carrito
- ✅ Selección de dirección de envío
- ✅ Cálculo automático de costos de envío por zona
- ✅ Página de confirmación con datos bancarios
- ✅ Instrucciones claras de transferencia
- ✅ Envío de comprobantes por WhatsApp
- ✅ Copiar datos al portapapeles
- ✅ Información de contacto y soporte

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Firebase con:
  - Firestore habilitado
  - Authentication habilitado (Email/Password)

## 🛠️ Instalación

1. **Clonar e instalar dependencias:**
```bash
cd app
npm install
```

2. **Configurar Firebase:**
   - Crea un archivo `.env` en la raíz del proyecto `app/`
   - Copia las variables de `.env.example` y completa con tus credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

3. **Configurar Datos Iniciales:**

**Productos:**
```bash
cd /Users/boca/rpm-importados/app
node seed-products.js
```

**Datos de Transferencia:**
- Ve a `/admin/payments`
- Edita el método "Transferencia Bancaria"
- Completa: banco, cuenta, CBU, alias e **instrucciones personalizadas**
- Las instrucciones aparecerán automáticamente en las confirmaciones de pedido

**Zonas de Envío:**
```bash
npm run init-shipping
```
Inicializa las zonas de envío con costos por defecto

4. **Configurar Firestore:**
   - En Firebase Console, crea las siguientes colecciones:
     - `products` - Para productos
     - `orders` - Para órdenes (debe tener campo `user_id` para filtrar por usuario)
     - `users` - Para roles de usuario y perfiles
     - `payment_methods` - Para métodos de pago

   **Importante:** Crea un índice compuesto en Firestore para `orders`:
   - Campo: `user_id` (Ascending) + `created_at` (Descending)
   - O usa la consulta sin orderBy si no tienes el índice

4. **Configurar Datos de Transferencia:**

En el panel admin (`/admin/payments`), configura los datos bancarios:
- Nombre del banco
- Número de cuenta
- CBU
- Alias
- Instrucciones de pago

5. **Agregar Productos:**

**Opción A: Manualmente**
- Ve a `/admin/products`
- Crea productos con nombre, precio, categoría, imagen, stock

**Opción B: Automáticamente**
```bash
cd /Users/boca/rpm-importados/app
node seed-products.js
```

6. **Configurar Firestore Rules e Índices:**

**Opción A: Desde la consola Firebase**
- Ve a Firebase Console → Firestore → Reglas
- Pega el contenido del archivo `firestore.rules` que está en tu proyecto
- Guarda

**Opción B: Desde la línea de comandos**
```bash
cd /Users/boca/rpm-importados/app
npx firebase deploy --only firestore:rules
```

**Configurar Índices:**
```bash
npx firebase deploy --only firestore:indexes
```

**O ambos juntos:**
```bash
npx firebase deploy --only firestore
```

**Opción C: Script automático (Más fácil)**
```bash
cd /Users/boca/rpm-importados/app
./setup-firebase.sh
```
Este script configura todo automáticamente.

Las reglas permiten:
- **Productos**: Lectura pública, escritura solo admin
- **Órdenes**: Creación pública, lectura propia/admin
- **Usuarios**: Lectura/escritura propia, escritura admin
- **Métodos de pago**: Solo admin

**Índice requerido**: `orders` → `user_id` (ASC) + `created_at` (DESC)

## 🚀 Ejecutar el Proyecto

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 👤 Configurar Primer Administrador

1. Inicia sesión en `/admin/login` con cualquier email/password
2. El sistema automáticamente asignará el rol de admin al primer usuario
3. Para asignar admin manualmente, en Firebase Console:
   - Ve a Firestore → `users`
   - Crea un documento con ID = `uid_del_usuario`
   - Agrega el campo: `role: "admin"`

## 📁 Estructura del Proyecto

```
app/
├── src/
│   ├── components/
│   │   ├── ui/          # Componentes UI reutilizables
│   │   ├── Layout.jsx   # Layout principal del sitio
│   │   ├── AdminLayout.jsx  # Layout del panel admin
│   │   └── ProtectedRoute.jsx  # Protección de rutas
│   ├── pages/
│   │   ├── Home.jsx     # Página principal
│   │   ├── Store.jsx     # Catálogo
│   │   ├── ProductDetails.jsx
│   │   ├── Login.jsx    # Login admin
│   │   └── admin/        # Páginas del panel admin
│   ├── services/         # Servicios Firebase
│   ├── firebase/         # Configuración Firebase
│   └── utils/            # Utilidades
├── .env                  # Variables de entorno
└── package.json
```

## 👤 Dashboard de Usuarios

### Acceso
- Los usuarios pueden registrarse o iniciar sesión en `/user/login`
- Una vez autenticados, acceden a su dashboard en `/user/dashboard`

### Funcionalidades
- **Mi Cuenta**: Estadísticas rápidas (total de pedidos, pendientes, total gastado)
- **Mis Pedidos**: 
  - Lista completa de todos los pedidos del usuario
  - Estado de cada pedido (Pendiente, Enviado, Entregado, Cancelado)
  - Fecha de cada pedido
  - Número de seguimiento (si está disponible)
  - Detalles expandibles con productos incluidos
- **Mi Perfil**:
  - Editar nombre completo
  - Agregar/editar teléfono
  - Agregar/editar dirección de envío
  - Email (no editable, solo lectura)

### Características
- Las órdenes se vinculan automáticamente al usuario cuando está logueado
- Los usuarios pueden ver el estado de sus pedidos en tiempo real
- Interfaz intuitiva y responsive

## 🎯 Funcionalidades del Admin

### Dashboard
- Resumen de productos, órdenes, ingresos
- Órdenes pendientes
- Actualización en tiempo real

### Productos
- Crear, editar, eliminar productos
- Gestionar stock
- Marcar productos destacados
- Categorías: drones, vaporizadores, termos, tecnología, accesorios

### Órdenes
- Ver todas las órdenes
- Filtrar por estado (pendiente, enviado, entregado, cancelado)
- Actualizar estado de envío
- Agregar número de seguimiento

### Métodos de Pago
- Configurar transferencia bancaria (banco, cuenta, CBU, alias)
- Configurar MercadoPago (Access Token, Public Key, Webhook)
- Activar/desactivar métodos

### Métricas
- Ingresos totales
- Ticket promedio
- Órdenes por estado
- Órdenes por método de pago

## 🔐 Seguridad

- Rutas protegidas con verificación de rol admin
- Autenticación con Firebase Auth
- Validación de datos en formularios
- Manejo de errores en todas las operaciones

## 📝 Próximos Pasos

- [ ] Integración completa de MercadoPago
- [ ] Subida de imágenes a Firebase Storage
- [ ] Notificaciones por email
- [ ] Exportación de reportes
- [ ] Sistema de cupones/descuentos
- [ ] Multi-idioma

## 💳 Flujo de Pago por Transferencia

### Para el Usuario:
1. **Hace pedido** → Se crea orden en estado "pending"
2. **Redirige a confirmación** → `/order-confirmation?order={id}`
3. **Ve datos bancarios** → Puede copiar al portapapeles
4. **Ve instrucciones personalizadas** → Configuradas por el admin
5. **Realiza transferencia** → Envía comprobante por WhatsApp
6. **Recibe confirmación** → Admin actualiza estado

### Para el Admin:
1. **Ve órdenes pendientes** → En `/admin/orders`
2. **Actualiza estado** → De "pending" a "shipped"
3. **Agrega tracking** → Si corresponde
4. **Usuario ve cambios** → En tiempo real

### Configurar Datos Bancarios:
- Ve a `/admin/payments`
- Selecciona "Transferencia Bancaria"
- Completa: banco, cuenta, CBU, alias, instrucciones
- Activa el método de pago

## 🐛 Solución de Problemas

**Error: "Configuración incompleta de Firebase"**
- Verifica que todas las variables en `.env` estén correctas
- Asegúrate de que el archivo se llame `.env` (no `.env.example`)

**No puedo acceder al panel admin**
- Verifica que el usuario tenga el rol `admin` en Firestore (`users/{uid}`)
- Asegúrate de estar autenticado

**Los productos no se muestran**
- Verifica que existan productos en la colección `products`
- Revisa las reglas de Firestore
- Verifica la consola del navegador para errores

**Error en checkout**
- Verifica que los datos de transferencia estén configurados en `/admin/payments`
- Asegúrate de que haya un método de pago activo
- Revisa la consola para errores de Firebase

**WhatsApp no funciona**
- Verifica que tengas WhatsApp instalado/web
- El número está configurado como +54 9 11 2321-3938
- Si no se abre automáticamente, copia el mensaje manualmente

## 🚚 Sistema de Envíos

### Zonas de Envío Disponibles:
- **CABA**: $500 base + $150/kg adicional (3-5 días)
- **GBA Norte/Sur/Oeste**: $800 base + $200/kg adicional (3-5 días)
- **Interior Buenos Aires**: $1200 base + $300/kg adicional (5-7 días)
- **Córdoba**: $1500 base + $350/kg adicional (5-7 días)
- **Santa Fe**: $1400 base + $330/kg adicional (5-7 días)
- **Mendoza**: $1600 base + $380/kg adicional (5-7 días)
- **Tucumán**: $1800 base + $420/kg adicional (7-10 días)
- **Otras Provincias**: $2000 base + $500/kg adicional (7-10 días)

### Cómo Funciona:
1. **Usuario selecciona dirección** en checkout
2. **Sistema calcula automáticamente** costo por código postal
3. **Muestra zona y tiempo estimado** de entrega
4. **Incluye costo de envío** en total del pedido
5. **Admin puede modificar** zonas y costos desde código

### Personalización:
Edita `src/services/shipping.js` para:
- Agregar nuevas zonas
- Modificar costos
- Cambiar tiempos de entrega
- Ajustar lógica de cálculo

## 📄 Licencia

Este proyecto es privado para RPM IMPORTADOS.
