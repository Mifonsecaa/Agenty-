# 🚀 VERIFICACIÓN EN 3 COMANDOS

## Copia y Pega esto en tu terminal:

```bash
# Paso 1: Compilar
npm run build && echo "✅ Build OK" || echo "❌ Build Failed"

# Paso 2: Ejecutar
npm run dev &

# Paso 3: Esperar y luego abrir en navegador
# http://localhost:3000
# Presiona: Ctrl+Shift+R

# Paso 4: Verificar
# F12 → Console → No hay errores rojos ✓
# Botones "Iniciar" y "Prueba Gratis" aparecen en < 1 segundo ✓
```

---

## Verificación Rápida (1 minuto)

```bash
# Solo esto:
npm run build && npm run dev
```

Luego:
1. Abre http://localhost:3000
2. Presiona Ctrl+Shift+R (hard refresh)
3. ¿Ves "Iniciar" y "Prueba Gratis" casi al instante?
4. ✅ Si sí → Funciona perfecto

---

## Auditoría de Rendimiento (2 minutos)

```
Con npm run dev ejecutándose:
1. DevTools → F12
2. Performance tab
3. Clic en record (⚫)
4. Recarga página (F5)
5. Clic stop
6. Busca First Contentful Paint < 1s ✓
```

---

## Lista de Verificación

- [ ] npm run build → Sin errores
- [ ] npm run dev → localhost:3000 abre
- [ ] Botones visibles en < 1s
- [ ] No hay errores en Console (F12)
- [ ] Header se renderiza sin sesión
- [ ] Canvas no causa lag

---

Si TODO está marcado ✅ → ¡Listo para producción! 🎉

