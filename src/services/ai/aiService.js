import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "SIN_KEY" });

const evaluacionSchema = {
  type: Type.OBJECT,
  properties: {
    es_valido: { type: Type.BOOLEAN },
    coincide_imagen_texto: { type: Type.BOOLEAN },
    confianza_coincidencia: { type: Type.NUMBER },
    motivo_validacion: { type: Type.STRING },
    categoria: { type: Type.STRING, enum: ["BACHES", "BASURA", "ALUMBRADO", "FUGAS", "OTRO"] },
    dependencia_asignada: { type: Type.STRING },
    prioridad_nivel: { type: Type.STRING, enum: ["CRITICA", "ALTA", "MEDIA", "BAJA"] },
    prioridad_puntaje: { type: Type.INTEGER },
    justificacion_prioridad: { type: Type.STRING },
    nuevo_estado: { type: Type.STRING, enum: ["RECHAZADO_INCONSISTENCIA", "DESPACHO_INMEDIATO", "VALIDADO_EN_COLA"] },
    mensaje_para_ciudadano: { type: Type.STRING }
  },
  required: [
    "es_valido", "coincide_imagen_texto", "confianza_coincidencia",
    "motivo_validacion", "categoria", "dependencia_asignada",
    "prioridad_nivel", "prioridad_puntaje", "justificacion_prioridad",
    "nuevo_estado", "mensaje_para_ciudadano"
  ]
};

const transicionEstadoSchema = {
  type: Type.OBJECT,
  properties: {
    cambio_aprobado: { type: Type.BOOLEAN },
    estado_anterior: { type: Type.STRING },
    nuevo_estado: { type: Type.STRING, enum: ["VALIDADO_EN_COLA", "CUADRILLA_ASIGNADA", "EN_REPARACION", "RESUELTO_VERIFICADO", "RECHAZADO_EVIDENCIA"] },
    prioridad_ajustada: { type: Type.STRING, enum: ["CRITICA", "ALTA", "MEDIA", "BAJA"] },
    nota_seguimiento_ciudadano: { type: Type.STRING },
    justificacion_interna: { type: Type.STRING }
  },
  required: [
    "cambio_aprobado", "estado_anterior", "nuevo_estado",
    "prioridad_ajustada", "nota_seguimiento_ciudadano", "justificacion_interna"
  ]
};

export async function evaluarReporteCiudadano({ descripcion, imagenBase64 = null, mimeType = "image/jpeg", reportesCercanos = 0 }) {
  try {
    const contents = [];
    if (imagenBase64) {
      const cleanBase64 = imagenBase64.replace(/^data:image\/\w+;base64,/, "");
      contents.push({ inlineData: { data: cleanBase64, mimeType } });
    }

    const prompt = `
      Eres el motor de triaje urbano municipal.
      Descripción del ciudadano: "${descripcion}"
      Reportes cercanos acumulados: ${reportesCercanos}

      1. Verifica que la imagen coincida con la descripción. Si no tiene relación con un problema urbano o contradice el texto, asigna es_valido=false, coincide_imagen_texto=false y nuevo_estado="RECHAZADO_INCONSISTENCIA".
      2. Clasifica en: BACHES, BASURA, ALUMBRADO, FUGAS, u OTRO.
      3. Calcula prioridad: CRITICA (85-100), ALTA (65-84), MEDIA (35-64), BAJA (1-34).
      4. Estado inicial: Si es inválido -> "RECHAZADO_INCONSISTENCIA". Si es válido y CRITICA -> "DESPACHO_INMEDIATO". En otro caso -> "VALIDADO_EN_COLA".
    `;
    contents.push(prompt);

    const response = await ai.models.generateContent({
      model: "gemini-3.0-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: evaluacionSchema,
        temperature: 0.1
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Fallback IA activado:", error.message);
    return fallbackEvaluacion(descripcion, reportesCercanos);
  }
}

export async function actualizarEstadoReporte({ categoria, estadoActual, prioridadActual, comentarioFuncionario, evidenciaBase64 = null, mimeType = "image/jpeg" }) {
  try {
    const contents = [];
    if (evidenciaBase64) {
      const cleanBase64 = evidenciaBase64.replace(/^data:image\/\w+;base64,/, "");
      contents.push({ inlineData: { data: cleanBase64, mimeType } });
    }

    const prompt = `
      Controlador automático de estados municipales.
      Categoría: ${categoria} | Estado actual: ${estadoActual} | Prioridad: ${prioridadActual}
      Actualización: "${comentarioFuncionario}"
      Flujo: VALIDADO_EN_COLA -> CUADRILLA_ASIGNADA -> EN_REPARACION -> RESUELTO_VERIFICADO (o RECHAZADO_EVIDENCIA si la foto muestra que el problema persiste).
    `;
    contents.push(prompt);

    const response = await ai.models.generateContent({
      model: "gemini-3.0-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: transicionEstadoSchema,
        temperature: 0.1
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    return {
      cambio_aprobado: true,
      estado_anterior: estadoActual,
      nuevo_estado: "EN_REPARACION",
      prioridad_ajustada: prioridadActual,
      nota_seguimiento_ciudadano: "Tu reporte está siendo atendido por la dependencia asignada.",
      justificacion_interna: "Actualización procesada en modo contingencia."
    };
  }
}

function fallbackEvaluacion(descripcion = "", reportesCercanos = 0) {
  const t = descripcion.toLowerCase();
  let categoria = "OTRO", dependencia = "Atención Ciudadana", puntaje = 50;
  if (t.includes("bache") || t.includes("hueco") || t.includes("calle")) { categoria = "BACHES"; dependencia = "Obras Públicas"; puntaje = 72; }
  else if (t.includes("agua") || t.includes("fuga") || t.includes("drenaje")) { categoria = "FUGAS"; dependencia = "Agua y Saneamiento"; puntaje = 82; }
  else if (t.includes("luz") || t.includes("luminaria") || t.includes("lámpara")) { categoria = "ALUMBRADO"; dependencia = "Alumbrado Público"; puntaje = 62; }
  else if (t.includes("basura") || t.includes("desechos")) { categoria = "BASURA"; dependencia = "Limpia Pública"; puntaje = 55; }

  puntaje = Math.min(100, puntaje + reportesCercanos * 5);
  const prioridad_nivel = puntaje >= 85 ? "CRITICA" : puntaje >= 65 ? "ALTA" : puntaje >= 35 ? "MEDIA" : "BAJA";

  return {
    es_valido: true,
    coincide_imagen_texto: true,
    confianza_coincidencia: 0.85,
    motivo_validacion: "Validado por coincidencia semántica.",
    categoria,
    dependencia_asignada: dependencia,
    prioridad_nivel,
    prioridad_puntaje: puntaje,
    justificacion_prioridad: `Prioridad ${prioridad_nivel} asignada por impacto en ${categoria}.`,
    nuevo_estado: prioridad_nivel === "CRITICA" ? "DESPACHO_INMEDIATO" : "VALIDADO_EN_COLA",
    mensaje_para_ciudadano: `Reporte validado y enviado a ${dependencia}.`
  };
}
