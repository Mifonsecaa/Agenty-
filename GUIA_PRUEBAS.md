# 🧪 Guía de Pruebas: Validaciones y Optimizaciones

Aquí tienes cómo probar que todo lo que arreglamos funciona correctamente.

---

## 1. 🚀 Probar Optimizaciones de Carga (Velocidad)

**Objetivo:** Verificar que los botones "Iniciar" y "Prueba Gratis" aparecen rápido.

1.  Asegúrate de que el servidor esté corriendo:
    ```bash
    npm run dev
    ```
2.  Abre tu navegador en [http://localhost:3000](http://localhost:3000).
3.  Presiona **Ctrl + Shift + R** (o Cmd + Shift + R en Mac) para recargar limpiando caché.
4.  **Observa:** Los botones del encabezado deberían aparecer casi instantáneamente (< 1 segundo), incluso antes de que termine de cargar la animación de fondo.

---

## 2. 🛡️ Probar Validación Zod (Seguridad de API)

Hemos protegido las APIs para que rechacen datos incorrectos. Vamos a probar la API pública `/api/improve-description`.

### Prueba A: Enviar datos inválidos (Debería fallar)
Ejecuta este comando en tu terminal WSL (mientras el servidor corre):

```bash
curl -X POST http://localhost:3000/api/improve-description \
  -H "Content-Type: application/json" \
  -d '{"text": "hola"}'
```

**Resultado Esperado:**
Un error JSON detallado indicando que el texto es muy corto (validación: mínimo 5 caracteres).
```json
{
  "success": false,
  "error": "Datos inválidos",
  "details": [
    {
      "field": "text",
      "message": "El texto debe tener al menos 5 caracteres"
    }
  ]
}
```

### Prueba B: Enviar datos correctos
Ahora probemos con un texto válido:

```bash
curl -X POST http://localhost:3000/api/improve-description \
  -H "Content-Type: application/json" \
  -d '{"text": "vendo zapatillas deportivas de alta calidad para correr maratones"}'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "improved": "..." // Texto mejorado por la IA
  }
}
```

---

## 3. 📦 Probar Validación en la UI (Onboarding)

Esta prueba verifica que la API `/api/onboarding` esté protegida, usando la interfaz real.

1.  Ve a [http://localhost:3000](http://localhost:3000).
2.  Abre las **Herramientas de Desarrollador** (F12) y ve a la pestaña **Network** (Red).
3.  En la caja de texto "Magic Box", escribe algo muy corto (ej: "test") y trata de enviar (si el botón te deja).
    *   *Nota: Es probable que el frontend también tenga validaciones que impidan el clic, pero si pudieras enviar la petición "a la fuerza", el backend ahora la rechazaría.*
4.  La forma más segura de saber que funciona es que **si el servidor recibe basura, no se rompe (Error 500)**, sino que devuelve un **Error 400 (Bad Request)** controlado.

---

## 4. 🏗️ Probar el Build (Estabilidad)

Ya lo hicimos, pero es la prueba definitiva de que no hay errores de código o tipos.

```bash
npm run build
```

Si termina con `✓ Compiled successfully`, todo el código está sano.

