import { NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Valida datos contra un schema Zod y retorna errores formateados
 * @param data - Datos a validar
 * @param schema - Schema Zod
 * @returns { success: boolean, data?: T, errors?: ValidationError[] }
 */
export function validateData<T>(data: unknown, schema: ZodSchema) {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData as T };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: ValidationError[] = error.issues.map((err) => ({
        field: err.path.join(".") || "root",
        message: err.message,
      }));
      return { success: false, errors };
    }
    return {
      success: false,
      errors: [{ field: "root", message: "Error de validación desconocido" }],
    };
  }
}

/**
 * Retorna una respuesta de error JSON estandarizada
 */
export function validationErrorResponse(errors: ValidationError[]) {
  return NextResponse.json(
    {
      success: false,
      error: "Datos inválidos",
      details: errors,
    },
    { status: 400 }
  );
}

/**
 * Retorna una respuesta de error del servidor
 */
export function serverErrorResponse(message: string = "Error interno del servidor") {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 500 }
  );
}

/**
 * Retorna una respuesta de éxito estandarizada
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

