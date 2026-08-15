/**
 * Client-side text extraction. Free/open libraries only — no paid APIs.
 * Supports: .txt, .md, .pdf, .docx
 */

export type ExtractResult = {
  text: string
  fileName: string
  mimeType: string
  warning?: string
}

function extOf(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
}

async function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}

async function extractTxt(file: File): Promise<string> {
  return file.text()
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const buffer = await readAsArrayBuffer(file)
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  // Vite-friendly worker
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()

  const data = new Uint8Array(await readAsArrayBuffer(file))
  const doc = await pdfjs.getDocument({ data }).promise
  const parts: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const line = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    parts.push(line)
  }
  return parts.join('\n')
}

export async function extractTextFromFile(file: File): Promise<ExtractResult> {
  const fileName = file.name
  const mimeType = file.type || 'application/octet-stream'
  const ext = extOf(fileName)

  if (ext === 'txt' || ext === 'md' || mimeType.startsWith('text/')) {
    const text = await extractTxt(file)
    return { text, fileName, mimeType: mimeType || 'text/plain' }
  }

  if (ext === 'docx' || mimeType.includes('wordprocessingml')) {
    const text = await extractDocx(file)
    return { text, fileName, mimeType: mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
  }

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    const text = await extractPdf(file)
    return {
      text,
      fileName,
      mimeType: 'application/pdf',
      warning: text.trim().length < 40
        ? 'PDF produced little text — it may be scanned/image-based. Try a text PDF or paste text.'
        : undefined,
    }
  }

  if (ext === 'doc') {
    throw new Error(
      'Legacy .doc is not supported in-browser. Save as .docx, .pdf, or .txt and try again.',
    )
  }

  throw new Error(
    `Unsupported file type (.${ext || 'unknown'}). Use PDF, DOCX, or TXT.`,
  )
}

export function extractTextFromPaste(text: string): ExtractResult {
  return {
    text,
    fileName: 'pasted-resume.txt',
    mimeType: 'text/plain',
  }
}
