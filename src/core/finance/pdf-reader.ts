import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function extractTextFromPDF(
  buffer: Buffer,
  password?: string
): Promise<string> {
  try {
    const loadingTask = getDocument({
      data: new Uint8Array(buffer),
      password,
      worker: null,
      disableWorker: true,
      useWorkerFetch: false,
      disableFontFace: true,
      isEvalSupported: false,
      useSystemFonts: false,
    } as any);

    const pdf = await loadingTask.promise;

    const pagesText: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);

      const content = await page.getTextContent();

      const text = content.items
        .map((item: any) => item.str || '')
        .join(' ')
        .trim();

      if (text) {
        pagesText.push(text);
      }
    }

    await loadingTask.destroy();

    const finalText = pagesText.join('\n');

    if (!finalText.trim()) {
      throw new Error('PDF_SEM_TEXTO_EXTRAIVEL');
    }

    return finalText;
  } catch (error: any) {
    const message = String(error?.message || error || '');

    if (
      message.toLowerCase().includes('password') ||
      message.toLowerCase().includes('incorrect password') ||
      message.toLowerCase().includes('no password') ||
      error?.name === 'PasswordException'
    ) {
      throw new Error('PDF_PROTEGIDO_OU_SENHA_INVALIDA');
    }

    throw error;
  }
}
