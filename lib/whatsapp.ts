export const WHATSAPP_TRIAL_URL =
  'https://wa.me/5215654338979?text=Hola%20PpGrillo,%20quiero%20iniciar%20mi%20prueba%20gratis%20de%2014%20d%C3%ADas'

export const TRIAL_SHORT_PATH = '/prueba'

// The shared message shows a short, readable link (/prueba) that redirects to
// WHATSAPP_TRIAL_URL, so friends never see %20-style codes in the chat.
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
const SHARE_LINK = productionHost
  ? `https://${productionHost}${TRIAL_SHORT_PATH}`
  : WHATSAPP_TRIAL_URL

const SHARE_MESSAGE = `¡Hola! Te paso el contacto de PpGrillo, el tutor de tareas con IA que ayuda a los niños a razonar sin que te desgastes peleando en la tarde. Tienes 14 días gratis para probarlo: ${SHARE_LINK}`

export const WHATSAPP_SHARE_CONTACT_URL = `https://api.whatsapp.com/send?text=${encodeURIComponent(SHARE_MESSAGE)}`

export const WHATSAPP_RETURNING_USER_URL =
  'https://wa.me/5215654338979?text=Hola%20PpGrillo,%20ya%20estaba%20registrado%20en%20la%20app%20web'

export const WHATSAPP_PARENT_TRIAL_URL =
  'https://wa.me/5215654338979?text=Hola%20PpGrillo,%20soy%20mam%C3%A1/pap%C3%A1%20y%20quiero%20iniciar%20la%20prueba%20gratis%20de%2014%20d%C3%ADas'
