declare module 'mammoth' {
  interface ExtractResult {
    value: string
    messages: Array<{ type: string; message: string }>
  }
  export function extractRawText(input: {
    arrayBuffer: ArrayBuffer
  }): Promise<ExtractResult>
}
