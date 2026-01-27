import fs from 'fs/promises'

import axios from "axios";
import {PDFParse} from "pdf-parse";
// // import pdf from "pdf-parse";


/**
 * @param {string} filePath - path to the PDF file
 * @returns {Promise<{text:string,numPages:number}>}
 */

// export const extractTextFromPDF=async(filePath)=>{
//     try {
//         const dataBuffer=await axios.get(filePath);
//         // pdf parse expect
//         const parser=new PDFParse(new Uint8Array(dataBuffer));
//         const data=await parser.getText();

//         return{
//             text:data.text,
//             numPages:data.numPages,
//             info:data.info,
//         };
        
//     } catch (error) {
//         console.error("PdF parsing error:",error);
//         throw new Error("Failed to extract text from Pdf")
        
//     }
// }



import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const extractTextFromPDF = async (filePath) => {
  try {
    // 1️⃣ Download PDF
    const response = await axios.get(filePath, {
      responseType: "arraybuffer",
    });

    // 2️⃣ Convert Buffer → Uint8Array (🔴 REQUIRED)
    const uint8Array = new Uint8Array(response.data);

    // 3️⃣ Load PDF
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    let text = "";

    // 4️⃣ Extract text
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + "\n";
    }

    return {
      text,
      numPages: pdf.numPages,
    };

  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from Pdf");
  }
};







