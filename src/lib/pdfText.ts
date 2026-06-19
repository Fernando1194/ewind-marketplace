// Extração de texto de PDF no client usando pdf.js.
// Worker empacotado pelo Vite (sem CDN externo) — evita falha de rede/versão.

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
// Vite resolve este import para uma URL local do worker, na versão exata do pacote.
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export interface PdfExtractResult {
  text: string
  scanned: boolean
  pages: number
}

export async function extractPdfText(file: File): Promise<PdfExtractResult> {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  let fullText = ''

  const maxPages = Math.min(pdf.numPages, 15)
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
      .join(' ')
    fullText += pageText + '\n'
  }

  const cleaned = fullText.replace(/\s+/g, ' ').trim()
  const scanned = cleaned.length < 40

  return { text: cleaned, scanned, pages: pdf.numPages }
}
