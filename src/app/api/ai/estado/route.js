import { NextResponse } from "next/server";
import { actualizarEstadoReporte } from "../../../../services/ai/aiService.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const resultado = await actualizarEstadoReporte(body);
    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
