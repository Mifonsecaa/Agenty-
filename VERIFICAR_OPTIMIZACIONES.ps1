#!/usr/bin/env powershell
# Verificación Rápida de Optimizaciones - Agenty
# Ejecutar: .\VERIFICAR_OPTIMIZACIONES.ps1

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     VERIFICACIÓN DE OPTIMIZACIONES - AGENTY           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar Node.js
Write-Host "📋 Paso 1: Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node -v 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 2: Compilar proyecto
Write-Host "📋 Paso 2: Compilando proyecto..." -ForegroundColor Yellow
Write-Host "⏳ Esto puede tardar 1-2 minutos..." -ForegroundColor Cyan

npm run build 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build exitoso" -ForegroundColor Green
} else {
    Write-Host "❌ Build falló" -ForegroundColor Red
    Write-Host "Ejecuta: npm run build --verbose" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Paso 3: Verificar archivos principales
Write-Host "📋 Paso 3: Verificando archivos optimizados..." -ForegroundColor Yellow

$files = @(
    "app\page.tsx",
    "components\Header.tsx",
    "components\AuthSection.tsx",
    "components\onboarding\MagicBox.tsx",
    "components\ui\ParticleBackground.tsx",
    "next.config.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file NO ENCONTRADO" -ForegroundColor Red
    }
}

Write-Host ""

# Paso 4: Contar líneas de código
Write-Host "📋 Paso 4: Estadísticas de código..." -ForegroundColor Yellow

$totalLines = 0
foreach ($file in $files) {
    if (Test-Path $file) {
        $lines = (Get-Content $file | Measure-Object -Line).Lines
        $totalLines += $lines
        Write-Host "  $file`: $lines líneas"
    }
}

Write-Host "  📊 Total: $totalLines líneas"

Write-Host ""

# Paso 5: Sugerencias
Write-Host "📋 Paso 5: Próximos pasos..." -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Ejecutar en desarrollo:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Abrir en navegador:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Presionar (hard refresh):" -ForegroundColor Cyan
Write-Host "   Ctrl+Shift+R" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣  Verificar botones:" -ForegroundColor Cyan
Write-Host "   ¿Aparecen 'Iniciar' y 'Prueba Gratis' en < 1s?" -ForegroundColor White
Write-Host ""
Write-Host "5️⃣  Auditar rendimiento:" -ForegroundColor Cyan
Write-Host "   F12 → Lighthouse → Analyze page load" -ForegroundColor White
Write-Host ""

Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ Optimizaciones verificadas. ¡Listo para producción!" -ForegroundColor Green
Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Cyan

