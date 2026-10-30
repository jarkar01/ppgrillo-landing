const VCARD = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "N:;PpGrillo;;;",
  "FN:PpGrillo",
  "ORG:PpGrillo",
  "TITLE:Tutor de tareas paso a paso",
  "TEL;TYPE=CELL,VOICE:+5215649712244",
  "URL:https://ppgrillo.io",
  "NOTE:Tu tutor de tareas con IA. Escríbenos por WhatsApp o entra a https://ppgrillo.io",
  "END:VCARD",
].join("\r\n");

export function GET() {
  return new Response(VCARD, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="PpGrillo.vcf"',
      "Cache-Control": "public, max-age=86400",
    },
  });
}
