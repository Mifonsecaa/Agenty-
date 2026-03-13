# Guía: Validación Zod en APIs

## ¿Qué Se Hizo?

Se implementó **validación robusta con Zod** en las APIs más críticas:
- ✅ `/api/onboarding` - POST
- ✅ `/api/knowledge` - GET & POST  
- ✅ `/api/improve-description` - POST

## Archivos Creados

### 1. `lib/validation/schemas.ts`
**Todos los schemas Zod de tu proyecto**

Incluye validación para:
- Autenticación (registro, login)
- Negocios (crear, actualizar)
- Onboarding
- Knowledge items
- Chat
- Webhooks
- Y más...

### 2. `lib/validation/validate.ts`
**Utilidades para validar**

Funciones disponibles:
```typescript
validateData(data, schema)           // Valida y retorna resultado
validationErrorResponse(errors)      // Response de error formateado
serverErrorResponse(message)         // Response de error del servidor
successResponse(data, status)        // Response de éxito estandarizado
```

## Cómo Usar en Otras APIs

### Ejemplo: `/api/chat`

**ANTES:**
```typescript
export async function POST(req: Request) {
    const { businessId, message } = await req.json();
    if (!businessId || !message) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // ...resto del código
}
```

**DESPUÉS:**
```typescript
import { chatSchema } from "@/lib/validation/schemas";
import { validateData, validationErrorResponse } from "@/lib/validation/validate";

export async function POST(req: Request) {
    const body = await req.json();
    const validation = validateData(body, chatSchema);
    
    if (!validation.success) {
        return validationErrorResponse(validation.errors!);
    }

    const { businessId, message } = validation.data!;
    // ...resto del código
}
```

## APIs que Falta Actualizar

Aquí están las APIs que deberían llevar validación:

### Críticas (Hazlo YA):
1. `GET /api/business` - businessId
2. `POST /api/chat` - businessId, message
3. `POST /api/register` - email, password, name
4. `GET /api/metrics` - businessId

### Importantes:
5. `POST /api/generate-prompt` - businessDescription
6. `POST /api/whatsapp/connect` - businessId, phoneNumber, accessToken
7. `POST /api/telegram/webhook` - validar estructura

### Opcionales:
8. `POST /api/whatsapp/webhook` - mensaje
9. `POST /api/telegram/webhook` - mensaje

## Errores Validados

Cuando alguien envía datos inválidos, obtiene:

```json
{
  "success": false,
  "error": "Datos inválidos",
  "details": [
    {
      "field": "businessId",
      "message": "El businessId es requerido"
    },
    {
      "field": "text",
      "message": "El texto debe tener al menos 5 caracteres"
    }
  ]
}
```

En lugar de:
```json
{
  "error": "Missing fields"
}
```

## Beneficios

✅ **Consistencia** - Todos los errores tienen el mismo formato  
✅ **Claridad** - El cliente sabe exactamente qué está mal  
✅ **Type Safety** - TypeScript valida tipos automáticamente  
✅ **Reutilizable** - Los schemas se usan en cliente y servidor  
✅ **Mantenible** - Un solo lugar para cambiar validación  

## Próximos Pasos

### Hoy:
```bash
npm run build
npm run dev
```

### Después:
1. Actualiza las APIs críticas (GET /api/business, POST /api/chat, etc.)
2. Agrega más tests
3. Considera agregar rate limiting

## TypeScript Integration

Los schemas Zod generan tipos TypeScript automáticamente:

```typescript
import { type ChatInput } from "@/lib/validation/schemas";

// Ahora tienes tipos seguros
const data: ChatInput = {
  businessId: "...",
  message: "...",
  conversationId: "...", // ✅ TypeScript checklist esto
};
```

## Testing

Para probar la validación:

```bash
# Debería fallar
curl -X POST http://localhost:3000/api/onboarding \
  -H "Content-Type: application/json" \
  -d '{"ownerDescription": "abc"}'

# Respuesta:
{
  "success": false,
  "error": "Datos inválidos",
  "details": [{
    "field": "ownerDescription",
    "message": "La descripción debe tener al menos 10 caracteres"
  }]
}
```

---

**¿Necesitas validación en otra API? Dímelo y la implemento.**

