import nodemailer from "nodemailer";

export async function enviarCorreoConfirmacion({ to, folio, codigo, titulo, categoria, prioridad, ubicacion }) {
  if (!to || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"VERACRUZ360 - Atención Ciudadana" <${process.env.SMTP_USER}>`,
    to,
    subject: `Confirmación de reporte ${folio} - VERACRUZ360`,
    html: `<h2>Reporte ciudadano registrado</h2><p>Tu incidencia ha sido validada y canalizada correctamente.</p><ul><li><strong>Folio:</strong> ${folio}</li><li><strong>Código de seguimiento:</strong> ${codigo}</li><li><strong>Asunto:</strong> ${titulo}</li><li><strong>Categoría:</strong> ${categoria}</li><li><strong>Prioridad asignada:</strong> ${prioridad.toUpperCase()}</li><li><strong>Ubicación:</strong> ${ubicacion}</li></ul><p>Puedes consultar el avance en cualquier momento en la sección <strong>Seguimiento</strong> del portal.</p>`,
  });
}

export async function enviarWhatsAppConfirmacion({ to, folio, codigo, categoria, prioridad, ubicacion }) {
  if (!to || !process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) return;
  const numeroLimpio = to.replace(/^\+/, "");
  const url = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const payload = process.env.WHATSAPP_TEMPLATE_NAME
    ? { messaging_product: "whatsapp", to: numeroLimpio, type: "template", template: { name: process.env.WHATSAPP_TEMPLATE_NAME, language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "es_MX" } } }
    : { messaging_product: "whatsapp", to: numeroLimpio, type: "text", text: { body: `✅ *VERACRUZ360 - Reporte Registrado*\n\n*Folio:* ${folio}\n*Código:* ${codigo}\n*Categoría:* ${categoria}\n*Prioridad:* ${prioridad.toUpperCase()}\n*Ubicación:* ${ubicacion}` } };
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detalle = await res.text();
    throw new Error(`Meta WhatsApp API (${res.status}): ${detalle}`);
  }
}