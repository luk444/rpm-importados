#!/bin/bash

echo "🚀 Configuración de Firebase para RPM IMPORTADOS"
echo "================================================"

# Verificar si firebase-tools está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI no encontrado. Instalando..."
    npm install -g firebase-tools
fi

# Verificar si está autenticado
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Autenticándose con Firebase..."
    firebase login
fi

# Verificar si el proyecto existe
if ! firebase projects:list | grep -q "rpm-importados"; then
    echo "❌ Proyecto 'rpm-importados' no encontrado."
    echo "Por favor:"
    echo "1. Ve a https://console.firebase.google.com/"
    echo "2. Crea un proyecto llamado 'rpm-importados'"
    echo "3. Habilita Firestore y Authentication"
    exit 1
fi

echo "✅ Proyecto encontrado. Configurando..."

# Inicializar hosting si no está configurado
if [ ! -f ".firebaserc" ]; then
    echo "🏗️  Inicializando Firebase Hosting..."
    firebase init hosting --yes
fi

# Desplegar reglas e índices
echo "📋 Desplegando reglas de Firestore..."
firebase deploy --only firestore:rules

echo "🔍 Desplegando índices..."
firebase deploy --only firestore:indexes

echo "✅ Configuración completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Verifica que las reglas se aplicaron en Firebase Console → Firestore → Reglas"
echo "2. Ejecuta: npm run dev"
echo "3. Ve a http://localhost:5173/admin/login"
echo "4. Crea tu primera cuenta admin"
echo ""
echo "🎉 ¡Listo para usar!"

