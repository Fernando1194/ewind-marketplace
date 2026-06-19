// Extração de texto de PDF no client usando pdf.js.
// Detecta PDFs escaneados (sem texto extraível) para avisar o usuário.

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
// Worker via CDN (evita config de bundler)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`

export interface PdfExtractResult {
  text: string
  scanned: boolean   // true = sem texto extraível (provável digitalização)
  pages: number
}

export async function extractPdfText(file: File): Promise<PdfExtractResult> {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  let fullText = ''

  const maxPages = Math.min(pdf.numPages, 15) // limite de segurança
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
      .join(' ')
    fullText += pageText + '\n'
  }

  const cleaned = fullText.replace(/\s+/g, ' ').trim()
  // Heurística: menos de 40 caracteres = provavelmente escaneado/sem texto
  const scanned = cleaned.length < 40

  return { text: cleaned, scanned, pages: pdf.numPages }
}
