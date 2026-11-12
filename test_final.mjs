import fs from "fs";
import path from "path";
import { evaluarLoteConImagenes } from "./src/services/ai/aiService.js";

async function ejecutarPruebaTriajeCompleto() {
  const dir = "/var/www/html/Hackaton/imagenes";
  const archivo1 = path.join(dir, "bache.jpg");
  const archivo2 = path.join(dir, "bache2.jpg");
  const archivo3 = path.join(dir, "pizza.jpeg"); // Cambia este nombre si subiste otra foto

  for (const f of [archivo1, archivo2, archivo3]) {
    if (!fs.existsSync(f)) {
      console.error(`❌ Falta el archivo: ${f}`);
      process.exit(1);
    }
  }

  const img1 = fs.readFileSync(archivo1).toString("base64");
  const img2 = fs.readFileSync(archivo2).toString("base64");
  const img3 = fs.readFileSync(archivo3).toString("base64");

  const lote = [
    {
      id_reporte: "FOLIO-101",
      descripcion: "Bache profundo lleno de agua estancada en curva de carretera",
      imagenes: [img1],
      mimeType: "image/jpeg",
      reportesCercanos: 1
    },
    {
      id_reporte: "FOLIO-102",
      descripcion: "Bache enorme inundado en avenida transitada con una llanta adentro para advertir a los carros",
      imagenes: [img2],
      mimeType: "image/jpeg",
      reportesCercanos: 3
    },
    {
      id_reporte: "FOLIO-103",
      descripcion: "Fuga grave de agua potable rompiendo el pavimento en la esquina",
      imagenes: [img3],
      mimeType: "image/jpeg",
      reportesCercanos: 2
    }
  ];

  console.log("🤖 Enviando 3 reportes (2 reales + 1 inconsistente) a Gemini...");
  const resultado = await evaluarLoteConImagenes(lote);
  console.log(JSON.stringify(resultado, null, 2));
}

ejecutarPruebaTriajeCompleto();
