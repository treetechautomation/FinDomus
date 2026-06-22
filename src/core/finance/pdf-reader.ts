import PDFParser from 'pdf2json';

export async function extractTextFromPDF(
  buffer: Buffer,
  password?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true, password);

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      const rawError = errData instanceof Error ? errData : (errData.parserError || new Error(String(errData)));
      const message = rawError.message || String(rawError);

      if (
        message.toLowerCase().includes('password') ||
        message.toLowerCase().includes('encrypted') ||
        message.toLowerCase().includes('invalid password') ||
        message.toLowerCase().includes('incorrect password') ||
        message.toLowerCase().includes('no password') ||
        rawError.name === 'PasswordException'
      ) {
        reject(new Error('PDF_PROTEGIDO_OU_SENHA_INVALIDA'));
      } else {
        reject(rawError);
      }
    });

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        const pagesText: string[] = [];

        if (pdfData && pdfData.Pages) {
          for (const page of pdfData.Pages) {
            const pageTexts: string[] = [];
            if (page.Texts) {
              for (const textObj of page.Texts) {
                if (textObj.R) {
                  const runText = textObj.R.map(run => {
                    try {
                      return decodeURIComponent(run.T || '');
                    } catch {
                      return run.T || '';
                    }
                  }).join('');
                  if (runText) {
                    pageTexts.push(runText);
                  }
                }
              }
            }
            const pageCombined = pageTexts.join(' ').trim();
            if (pageCombined) {
              pagesText.push(pageCombined);
            }
          }
        }

        const finalText = pagesText.join('\n');

        if (!finalText.trim()) {
          reject(new Error('PDF_SEM_TEXTO_EXTRAIVEL'));
          return;
        }

        resolve(finalText);
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}
