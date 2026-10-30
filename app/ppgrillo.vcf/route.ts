const APP_URL = "https://ppgrillo.io/app";

const VCARD = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "N:;PpGrillo;;;",
  "FN:PpGrillo",
  "ORG:PpGrillo",
  "TITLE:Tutor de tareas paso a paso",
  `URL;TYPE=WORK:${APP_URL}`,
  `NOTE:Abre ${APP_URL} para chatear con PpGrillo\\, conservar tu historial y resolver tus tareas paso a paso.`,
  "END:VCARD",
  "",
].join("\r\n");

export function GET() {
  return new Response(VCARD, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="PpGrillo.vcf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
