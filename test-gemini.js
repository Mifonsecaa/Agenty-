// Carga las variables de entorno del archivo .env
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Asegúrate de que la clave de API se está cargando
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: La variable de entorno GEMINI_API_KEY no se encontró.");
  process.exit(1);
}

console.log("Clave de API encontrada. Conectando con Google...");

// Inicializa el cliente de Google
const genAI = new GoogleGenerativeAI(apiKey);

async function runTest() {
  try {
    // Usa el modelo más básico y estándar
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = "Escribe un eslogan para una empresa de IA llamada Agenty.";

    console.log("Enviando prompt a Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("\n--- ¡Éxito! ---");
    console.log("Respuesta de Gemini:", text);

  } catch (error) {
    console.error("\n--- ¡Fallo la prueba! ---");
    console.error("El error es:", error.message);
  }
}

runTest();
