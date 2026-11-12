import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "SIN_KEY", httpOptions: { apiVersion: "v1beta" } });

async function generarConRespaldo(contents, schema) {
  const modelos = ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-flash-lite"];
  for (const modelo of modelos) {
    try {
      const response = await ai.models.generateContent({
        model: modelo,
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.1
        }
      });
      return JSON.parse(response.text);
    } catch (err) {
      console.warn(`⚠️ Modelo ${modelo} saturado o no disponible (${err.status || err.message}), intentando siguiente...`);
    }
  }
  throw new Error("Todos los modelos Gemini fallaron.");
}


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

const loteEvaluacionSchema = {
  type: Type.OBJECT,
  properties: {
    reportes_priorizados: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id_reporte: { type: Type.STRING },
          categoria: { type: Type.STRING, enum: ["BACHES", "BASURA", "ALUMBRADO", "FUGAS", "OTRO"] },
          prioridad_nivel: { type: Type.STRING, enum: ["CRITICA", "ALTA", "MEDIA", "BAJA"] },
          puntaje_urgencia: { type: Type.INTEGER },
          justificacion_comparativa: { type: Type.STRING },
          orden_atencion: { type: Type.INTEGER }
        },
        required: ["id_reporte", "categoria", "prioridad_nivel", "puntaje_urgencia", "justificacion_comparativa", "orden_atencion"]
      }
    }
  },
  required: ["reportes_priorizados"]
};

const loteValidacionSchema = {
  type: Type.OBJECT,
  properties: {
    reportes_evaluados: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id_reporte: { type: Type.STRING },
          es_valido: { type: Type.BOOLEAN },
          coincide_imagen_texto: { type: Type.BOOLEAN },
          motivo_validacion: { type: Type.STRING },
          categoria: { type: Type.STRING, enum: ["BACHES", "BASURA", "ALUMBRADO", "FUGAS", "OTRO"] },
          prioridad_nivel: { type: Type.STRING, enum: ["CRITICA", "ALTA", "MEDIA", "BAJA"] },
          puntaje_urgencia: { type: Type.INTEGER },
          nuevo_estado: { type: Type.STRING, enum: ["RECHAZADO_INCONSISTENCIA", "DESPACHO_INMEDIATO", "VALIDADO_EN_COLA"] },
          orden_atencion: { type: Type.INTEGER }
        },
        required: [
          "id_reporte", "es_valido", "coincide_imagen_texto", "motivo_validacion",
          "categoria", "prioridad_nivel", "puntaje_urgencia", "nuevo_estado", "orden_atencion"
        ]
      }
    }
  },
  required: ["reportes_evaluados"]
};

export async function evaluarReporteCiudadano({ descripcion, imagenes = [], mimeType = "image/jpeg", reportesCercanos = 0 }) {
  try {
    const contents = [];
    if (imagenes && imagenes.length > 0) {
      imagenes.forEach((imgBase64) => {
        const cleanBase64 = imgBase64.replace(/^data:image\/\w+;base64,/, "");
        contents.push({ inlineData: { data: cleanBase64, mimeType } });
      });
    }

    const prompt = `
      Eres el motor de triaje urbano municipal.
      Descripción del ciudadano: "${descripcion}"
      Cantidad de evidencias fotográficas adjuntas: ${imagenes.length}
      Reportes cercanos acumulados: ${reportesCercanos}

      1. Analiza todas las imágenes proporcionadas en conjunto con la descripción. Si alguna contradice gravemente el problema, penaliza la validez. Si múltiples imágenes muestran un daño severo o extendido, eleva el nivel de urgencia.
      2. Clasifica en: BACHES, BASURA, ALUMBRADO, FUGAS, u OTRO.
      3. Calcula prioridad: CRITICA (85-100), ALTA (65-84), MEDIA (35-64), BAJA (1-34). (Considera que tener múltiples evidencias consistentes debe incrementar el puntaje de prioridad).
      4. Estado inicial: Si es inválido -> "RECHAZADO_INCONSISTENCIA". Si es válido y CRITICA -> "DESPACHO_INMEDIATO". En otro caso -> "VALIDADO_EN_COLA".
    `;
    contents.push(prompt);

    return await generarConRespaldo(contents, evaluacionSchema);
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
      model: "gemini-3-flash-preview",
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

export async function priorizarLoteReportes(reportesArray) {
  try {
    const prompt = `
      Eres el jefe de operaciones de la central de emergencias urbanas. 
      Tienes el siguiente conjunto de reportes ciudadanos independientes pendientes de revisión:
      ${JSON.stringify(reportesArray, null, 2)}

      Analiza el riesgo relativo de cada uno (por ejemplo, un bache profundo con varillas expuestas o una fuga masiva de agua potable tiene prioridad sobre un bache pequeño o basura acumulada).
      1. Asigna a cada reporte un puntaje de urgencia del 1 al 100.
      2. Ordénalos y asígnales un 'orden_atencion' (donde 1 es el que debe atenderse primero).
      3. Justifica por qué un reporte tiene mayor prioridad que los demás en el contexto de los recursos limitados del municipio.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [prompt],
      config: {
        responseMimeType: "application/json",
        responseSchema: loteEvaluacionSchema,
        temperature: 0.1
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Fallback de lote activado:", error.message);
    return {
      reportes_priorizados: reportesArray.map((r, index) => ({
        id_reporte: r.id_reporte || `gen-${index}`,
        categoria: "BACHES",
        prioridad_nivel: "MEDIA",
        puntaje_urgencia: 50,
        justificacion_comparativa: "Asignado por orden de llegada (modo contingencia).",
        orden_atencion: index + 1
      }))
    };
  }
}

export async function evaluarLoteConImagenes(reportesArray) {
  try {
    const contents = [
      `Eres el sistema central de triaje y auditoría visual de reportes urbanos municipales.
      Evalúa cada reporte independiente asociando ÚNICAMENTE las imágenes que aparecen inmediatamente debajo de su encabezado.
      1. Verifica si la imagen corresponde realmente al problema descrito (si no coincide, es_valido=false, coincide_imagen_texto=false y nuevo_estado="RECHAZADO_INCONSISTENCIA").
      2. Clasifica y asigna un puntaje de urgencia (1-100) considerando severidad visual (ej. tamaño, agua estancada, objetos de advertencia como llantas dentro del bache).
      3. Compara el riesgo de los reportes válidos entre sí y asígnales un 'orden_atencion' (1 = el más urgente).`
    ];

    reportesArray.forEach((rep, index) => {
      contents.push(`\n--- REPORTE ${index + 1} (ID: ${rep.id_reporte}) ---\nDescripción: "${rep.descripcion}"\nReportes cercanos: ${rep.reportesCercanos || 0}`);
      if (rep.imagenes && rep.imagenes.length > 0) {
        rep.imagenes.forEach((imgBase64) => {
          const cleanBase64 = imgBase64.replace(/^data:image\/\w+;base64,/, "");
          contents.push({ inlineData: { data: cleanBase64, mimeType: rep.mimeType || "image/jpeg" } });
        });
      }
    });

    return await generarConRespaldo(contents, loteValidacionSchema);
  } catch (error) {
    console.error("Fallback de lote multimodal activado:", error.message);
    return {
      reportes_evaluados: reportesArray.map((r, index) => ({
        id_reporte: r.id_reporte || `rep-${index}`,
        es_valido: true,
        coincide_imagen_texto: true,
        motivo_validacion: "Validado por sistema de contingencia (Fallback).",
        categoria: "OTRO",
        prioridad_nivel: "MEDIA",
        puntaje_urgencia: 50,
        nuevo_estado: "VALIDADO_EN_COLA",
        orden_atencion: index + 1
      }))
    };
  }
}

function fallbackEvaluacion(descripcion = "", reportesCercanos = 0) {
  return {
    es_valido: false,
    coincide_imagen_texto: false,
    confianza_coincidencia: 0,
    motivo_validacion: "No fue posible verificar la evidencia visual con el servicio de IA en este momento.",
    categoria: "OTRO",
    dependencia_asignada: "Atención Ciudadana",
    prioridad_nivel: "BAJA",
    prioridad_puntaje: 0,
    justificacion_prioridad: "Validación automática suspendida por indisponibilidad del motor visual.",
    nuevo_estado: "RECHAZADO_INCONSISTENCIA",
    mensaje_para_ciudadano: "El sistema de verificación visual está saturado o no disponible. Intenta enviar tu reporte nuevamente en unos segundos."
  };
}
