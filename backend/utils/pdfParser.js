// utils/pdfParser.js
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export const extractTextFromPDF = async (buffer) => {
  try {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Expected a Buffer');
    }

    // Convert buffer to Uint8Array — required by pdfjs
    const uint8Array = new Uint8Array(buffer);

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    console.log(`📄 PDF loaded: ${pdf.numPages} pages`);

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map(item => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText.trim()) {
      throw new Error('No text could be extracted');
    }

    console.log(`✅ Extracted ${fullText.length} characters`);
    return { text: fullText.trim() };

  } catch (error) {
    console.error('PDF parse error:', error.message);
    throw new Error('Failed to extract text from PDF');
  }
};