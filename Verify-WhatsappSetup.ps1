# ✅ SCRIPT DE VERIFICACIÓN: WhatsApp Integration (Windows PowerShell)
# Este script verifica que todo esté configurado correctamente

Write-Host "`n🔍 INICIANDO VERIFICACIÓN DE WHATSAPP..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Contadores
$Passed = 0
$Failed = 0

# Función para mostrar resultado
function Check-Result {
    param(
        [bool]$Success,
        [string]$Message
    )

    if ($Success) {
        Write-Host "✅ PASÓ: $Message" -ForegroundColor Green
        $global:Passed++
    } else {
        Write-Host "❌ FALLÓ: $Message" -ForegroundColor Red
        $global:Failed++
    }
}

# ==========================================
# 1. VERIFICAR ARCHIVO .env
# ==========================================
Write-Host "`n📋 1. VERIFICANDO VARIABLES DE ENTORNO..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$envExists = Test-Path ".env"
Check-Result $envExists ".env existe"

if ($envExists) {
    $envContent = Get-Content ".env" -Raw

    $hasPhoneId = $envContent -match "WHATSAPP_PHONE_NUMBER_ID"
    Check-Result $hasPhoneId "WHATSAPP_PHONE_NUMBER_ID está configurado"

    $hasAccessToken = $envContent -match "WHATSAPP_ACCESS_TOKEN"
    Check-Result $hasAccessToken "WHATSAPP_ACCESS_TOKEN está configurado"

    $hasVerifyToken = $envContent -match "WHATSAPP_WEBHOOK_VERIFY_TOKEN"
    Check-Result $hasVerifyToken "WHATSAPP_WEBHOOK_VERIFY_TOKEN está configurado"
}

# ==========================================
# 2. VERIFICAR ARCHIVOS DE CÓDIGO
# ==========================================
Write-Host "`n📁 2. VERIFICANDO ARCHIVOS DE CÓDIGO..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$webhookExists = Test-Path "app/api/webhooks/whatsapp/route.ts"
Check-Result $webhookExists "Webhook en app/api/webhooks/whatsapp/route.ts existe"

$connectionExists = Test-Path "app/api/business/connections/whatsapp/route.ts"
Check-Result $connectionExists "Endpoint de conexión existe"

# ==========================================
# 3. VERIFICAR PRISMA SCHEMA
# ==========================================
Write-Host "`n🗄️  3. VERIFICANDO SCHEMA DE BASE DE DATOS..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$schemaPath = "prisma/schema.prisma"
if (Test-Path $schemaPath) {
    $schemaContent = Get-Content $schemaPath -Raw

    Check-Result ($schemaContent -match "whatsappPhoneNumberId") "Modelo Business tiene whatsappPhoneNumberId"
    Check-Result ($schemaContent -match "whatsappAccessToken") "Modelo Business tiene whatsappAccessToken"
    Check-Result ($schemaContent -match "whatsappWebhookVerifyToken") "Modelo Business tiene whatsappWebhookVerifyToken"
    Check-Result ($schemaContent -match "model Customer") "Modelo Customer existe"
    Check-Result ($schemaContent -match "model Conversation") "Modelo Conversation existe"
    Check-Result ($schemaContent -match "model Message") "Modelo Message existe"
} else {
    Write-Host "❌ Schema no encontrado" -ForegroundColor Red
    $Failed++
}

# ==========================================
# 4. VERIFICAR DOCUMENTACIÓN
# ==========================================
Write-Host "`n📚 4. VERIFICANDO DOCUMENTACIÓN..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Check-Result (Test-Path "SETUP_WHATSAPP_PRODUCCION.md") "SETUP_WHATSAPP_PRODUCCION.md existe"
Check-Result (Test-Path "GUIA_WHATSAPP_USUARIO.md") "GUIA_WHATSAPP_USUARIO.md existe"
Check-Result (Test-Path "FLUJO_TECNICO_WHATSAPP.md") "FLUJO_TECNICO_WHATSAPP.md existe"
Check-Result (Test-Path "WHATSAPP_CONEXION_RESUMEN.md") "WHATSAPP_CONEXION_RESUMEN.md existe"

# ==========================================
# 5. VERIFICAR DEPENDENCIAS
# ==========================================
Write-Host "`n📦 5. VERIFICANDO DEPENDENCIAS..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$packagePath = "package.json"
if (Test-Path $packagePath) {
    $packageContent = Get-Content $packagePath -Raw

    Check-Result ($packageContent -match '"next"') "Next.js está instalado"
    Check-Result ($packageContent -match '"@prisma/client"') "@prisma/client está instalado"
} else {
    Write-Host "❌ package.json no encontrado" -ForegroundColor Red
    $Failed++
}

# ==========================================
# RESUMEN FINAL
# ==========================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📊 RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ Pasaron: $Passed" -ForegroundColor Green
Write-Host "❌ Fallaron: $Failed" -ForegroundColor Red
Write-Host ""

if ($Failed -eq 0) {
    Write-Host "🎉 ¡TODO ESTÁ CONFIGURADO CORRECTAMENTE!" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host ""
    Write-Host "PRÓXIMOS PASOS:" -ForegroundColor Yellow
    Write-Host "1. Verifica que .env tiene los valores correctos"
    Write-Host "2. Despliega a producción: git push"
    Write-Host "3. Ejecuta el webhook setup en Meta Developers"
    Write-Host "4. Ve al Dashboard y conecta WhatsApp"
    Write-Host "5. Envía un mensaje de prueba desde WhatsApp"
    Write-Host ""
    exit 0
} else {
    Write-Host "⚠️  Hay algunos problemas que necesitan atención." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ACCIONES RECOMENDADAS:" -ForegroundColor Yellow
    Write-Host "1. Lee WHATSAPP_CONEXION_RESUMEN.md"
    Write-Host "2. Sigue los pasos en SETUP_WHATSAPP_PRODUCCION.md"
    Write-Host "3. Verifica que todas las variables de entorno estén configuradas"
    Write-Host ""
    exit 1
}

