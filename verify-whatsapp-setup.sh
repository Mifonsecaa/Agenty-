#!/bin/bash

# ✅ SCRIPT DE VERIFICACIÓN: WhatsApp Integration
# Este script verifica que todo esté configurado correctamente

set -e

echo "🔍 INICIANDO VERIFICACIÓN DE WHATSAPP..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de chequeos
PASSED=0
FAILED=0

# Función para mostrar resultado
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASÓ:${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FALLÓ:${NC} $2"
        ((FAILED++))
    fi
}

# ==========================================
# 1. VERIFICAR ARCHIVO .env
# ==========================================
echo ""
echo "📋 1. VERIFICANDO VARIABLES DE ENTORNO..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f .env ]; then
    check_result 0 ".env existe"

    if grep -q "WHATSAPP_PHONE_NUMBER_ID" .env; then
        check_result 0 "WHATSAPP_PHONE_NUMBER_ID está configurado"
    else
        check_result 1 "WHATSAPP_PHONE_NUMBER_ID NO está configurado"
    fi

    if grep -q "WHATSAPP_ACCESS_TOKEN" .env; then
        check_result 0 "WHATSAPP_ACCESS_TOKEN está configurado"
    else
        check_result 1 "WHATSAPP_ACCESS_TOKEN NO está configurado"
    fi

    if grep -q "WHATSAPP_WEBHOOK_VERIFY_TOKEN" .env; then
        check_result 0 "WHATSAPP_WEBHOOK_VERIFY_TOKEN está configurado"
    else
        check_result 1 "WHATSAPP_WEBHOOK_VERIFY_TOKEN NO está configurado"
    fi
else
    check_result 1 ".env NO existe"
fi

# ==========================================
# 2. VERIFICAR ARCHIVOS DE CÓDIGO
# ==========================================
echo ""
echo "📁 2. VERIFICANDO ARCHIVOS DE CÓDIGO..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "app/api/webhooks/whatsapp/route.ts" ]; then
    check_result 0 "Webhook en app/api/webhooks/whatsapp/route.ts existe"
else
    check_result 1 "Webhook NO existe"
fi

if [ -f "app/api/business/connections/whatsapp/route.ts" ]; then
    check_result 0 "Endpoint de conexión existe"
else
    check_result 1 "Endpoint de conexión NO existe"
fi

# ==========================================
# 3. VERIFICAR PRISMA SCHEMA
# ==========================================
echo ""
echo "🗄️  3. VERIFICANDO SCHEMA DE BASE DE DATOS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "whatsappPhoneNumberId" prisma/schema.prisma; then
    check_result 0 "Modelo Business tiene whatsappPhoneNumberId"
else
    check_result 1 "Schema incompleto: falta whatsappPhoneNumberId"
fi

if grep -q "whatsappAccessToken" prisma/schema.prisma; then
    check_result 0 "Modelo Business tiene whatsappAccessToken"
else
    check_result 1 "Schema incompleto: falta whatsappAccessToken"
fi

if grep -q "whatsappWebhookVerifyToken" prisma/schema.prisma; then
    check_result 0 "Modelo Business tiene whatsappWebhookVerifyToken"
else
    check_result 1 "Schema incompleto: falta whatsappWebhookVerifyToken"
fi

if grep -q "Customer" prisma/schema.prisma; then
    check_result 0 "Modelo Customer existe"
else
    check_result 1 "Modelo Customer NO existe"
fi

if grep -q "Conversation" prisma/schema.prisma; then
    check_result 0 "Modelo Conversation existe"
else
    check_result 1 "Modelo Conversation NO existe"
fi

if grep -q "Message" prisma/schema.prisma; then
    check_result 0 "Modelo Message existe"
else
    check_result 1 "Modelo Message NO existe"
fi

# ==========================================
# 4. VERIFICAR DOCUMENTACIÓN
# ==========================================
echo ""
echo "📚 4. VERIFICANDO DOCUMENTACIÓN..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "SETUP_WHATSAPP_PRODUCCION.md" ]; then
    check_result 0 "SETUP_WHATSAPP_PRODUCCION.md existe"
else
    check_result 1 "SETUP_WHATSAPP_PRODUCCION.md NO existe"
fi

if [ -f "GUIA_WHATSAPP_USUARIO.md" ]; then
    check_result 0 "GUIA_WHATSAPP_USUARIO.md existe"
else
    check_result 1 "GUIA_WHATSAPP_USUARIO.md NO existe"
fi

if [ -f "FLUJO_TECNICO_WHATSAPP.md" ]; then
    check_result 0 "FLUJO_TECNICO_WHATSAPP.md existe"
else
    check_result 1 "FLUJO_TECNICO_WHATSAPP.md NO existe"
fi

if [ -f "WHATSAPP_CONEXION_RESUMEN.md" ]; then
    check_result 0 "WHATSAPP_CONEXION_RESUMEN.md existe"
else
    check_result 1 "WHATSAPP_CONEXION_RESUMEN.md NO existe"
fi

# ==========================================
# 5. VERIFICAR DEPENDENCIAS
# ==========================================
echo ""
echo "📦 5. VERIFICANDO DEPENDENCIAS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "next" package.json; then
    check_result 0 "Next.js está instalado"
else
    check_result 1 "Next.js NO está en package.json"
fi

if grep -q "@prisma/client" package.json; then
    check_result 0 "@prisma/client está instalado"
else
    check_result 1 "@prisma/client NO está instalado"
fi

# ==========================================
# RESUMEN FINAL
# ==========================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Pasaron:${NC} $PASSED"
echo -e "${RED}❌ Fallaron:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡TODO ESTÁ CONFIGURADO CORRECTAMENTE!${NC}"
    echo ""
    echo "PRÓXIMOS PASOS:"
    echo "1. Verifica que .env tiene los valores correctos"
    echo "2. Despliega a producción: git push"
    echo "3. Ejecuta el webhook setup en Meta Developers"
    echo "4. Ve al Dashboard y conecta WhatsApp"
    echo "5. Envía un mensaje de prueba desde WhatsApp"
    exit 0
else
    echo -e "${YELLOW}⚠️  Hay algunos problemas que necesitan atención.${NC}"
    echo ""
    echo "ACCIONES RECOMENDADAS:"
    echo "1. Lee WHATSAPP_CONEXION_RESUMEN.md"
    echo "2. Sigue los pasos en SETUP_WHATSAPP_PRODUCCION.md"
    echo "3. Verifica que todas las variables de entorno estén configuradas"
    exit 1
fi

