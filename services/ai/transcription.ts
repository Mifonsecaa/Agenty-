import OpenAI from "openai";
import { toFile } from "openai";
import fs from "fs/promises";
import path from "path";
import os from "os";

export const transcriptionService = {
    async transcribeAudio(audioBuffer: Buffer): Promise<string> {
        try {
            console.log("[TranscriptionService] Starting transcription...");
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            
            // OpenAI requiere un archivo con nombre y extensión para detectar el tipo
            // Creamos un archivo temporal
            const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.ogg`);
            await fs.writeFile(tempFilePath, audioBuffer);
            
            console.log(`[TranscriptionService] Saved temp audio file to ${tempFilePath}, sending to Whisper...`);
            
            const file = await fs.readFile(tempFilePath);
            // Necesitamos pasar un objeto File-like a la API de OpenAI
            // En Node, fs.createReadStream funciona, pero openai v4 prefiere el helper toFile o File object
            // Vamos a usar fs.createReadStream que es compatible con el SDK
            
            const translation = await openai.audio.transcriptions.create({
                file: await toFile(file, "audio.ogg"),
                model: "whisper-1",
                language: "es", // Forzar español o autodetectar
                prompt: "Transcribe este audio de WhatsApp de manera precisa."
            });

            console.log("[TranscriptionService] Transcription result:", translation.text);
            
            // Limpiar archivo temporal
            await fs.unlink(tempFilePath).catch(console.error);

            return translation.text;
        } catch (error) {
            console.error("[TranscriptionService] Error transcribing audio:", error);
            return ""; // Retornar vacío en caso de error para no romper el flujo
        }
    }
};

