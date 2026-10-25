import type { FileUIPart, UIMessage } from 'ai'

const MAX_DIMENSION = 1280
const JPEG_QUALITY = 0.7
const MAX_BYTES = 500 * 1024

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen'))
    }
    img.src = url
  })
}

function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Math.ceil((base64.length * 3) / 4)
}

export async function compressImage(file: File): Promise<FileUIPart> {
  const img = await loadImage(file)
  let scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  let quality = JPEG_QUALITY
  let dataUrl = ''

  // Shrink further if a very detailed photo still exceeds the byte budget.
  for (let attempt = 0; attempt < 5; attempt++) {
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.width * scale))
    canvas.height = Math.max(1, Math.round(img.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas no disponible')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    dataUrl = canvas.toDataURL('image/jpeg', quality)
    if (dataUrlBytes(dataUrl) <= MAX_BYTES) break
    scale *= 0.8
    quality = Math.max(0.5, quality - 0.05)
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'ejercicio'
  return { type: 'file', mediaType: 'image/jpeg', filename: `${baseName}.jpg`, url: dataUrl }
}

export const IMAGE_REFERENCE_TEXT = '[Imagen del ejercicio compartida anteriormente]'

// Keep images only on the newest message; earlier turns get a light text reference
// so the request payload doesn't grow with every turn.
export function lightenHistory<T extends UIMessage>(messages: T[]): T[] {
  const lastIndex = messages.length - 1
  return messages.map((message, index) => {
    if (index === lastIndex) return message
    const hasImage = message.parts.some((p) => p.type === 'file')
    if (!hasImage) return message
    const parts = message.parts.filter((p) => p.type !== 'file')
    return { ...message, parts: [...parts, { type: 'text', text: IMAGE_REFERENCE_TEXT }] }
  })
}
