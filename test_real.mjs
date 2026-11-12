import fs from "fs";
import { evaluarReporteCiudadano } from "./src/services/ai/aiService.js";

async function verificarVision() {
  console.log("📸 Leyendo imagen local de prueba...");

  try {
    // 1. Lee una imagen real desde la VM (coloca una foto llamada 'bache.jpg' en la carpeta actual)
    const imageBuffer = fs.readFileSync("bache.jpg");
    const imagenBase64 = imageBuffer.toString("base64");

    console.log("🤖 Enviando imagen y descripción a Gemini 3.0 Flash...");

    // 2. Llama a tu función de IA
    const resultado = await evaluarReporteCiudadano({
      descripcion: "Hay un bache gigante en medio de la calle",
      imagenBase64: imagenBase64,
      mimeType: "image/jpeg",
      reportesCercanos: 2
    });

    console.log("\n✅ Respuesta JSON obtenida de la IA:");
    console.log(JSON.stringify(resultado, null, 2));

  } catch (error) {
    console.error("❌ Error al leer la imagen o ejecutar la IA:", error.message);
  }
}

verificarVision();
