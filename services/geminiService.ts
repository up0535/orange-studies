import { GoogleGenAI, Tool } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are "OranjeStudie", an expert Dutch language tutor specifically designed for native Chinese speakers. 
The user is learning at a CEFR A2 to B1 level.

Your goal is to analyze the provided input (Text, Image, or URL content) and generate a comprehensive, structured study guide in Markdown format.

**Rules for Content Generation:**
1.  **Audience:** All explanations must be in simplified Chinese (zh-CN). The tone should be encouraging, clear, and educational.
2.  **Level:** Focus on vocabulary and grammar suitable for A2-B1. 
3.  **Formatting:** Use standard Markdown. 
    *   Use **bold** for key Dutch vocabulary (A2/B1 level).
    *   Use *italics* for emphasis.
    *   Use > Blockquotes for translation notes.
4.  **Structure:**
    *   **# 学习摘要 (Summary):** A brief summary of the content in Chinese.
    *   **## 沉浸式阅读 (Immersion Reading):** 
        *   If the input is text/article/sentences: Present the Dutch text line-by-line. Immediately below each Dutch line, provide the Chinese translation.
        *   Example:
            > Het is vandaag mooi weer.
            > 今天天气很好。
        *   If the input is an image of objects: List the items identified with their Dutch names (with article 'de'/'het') and Chinese translations.
    *   **## 重点词汇 (Key Vocabulary):** A table or list of 5-10 key words found in the content. Columns: Dutch Word (highlighted), Part of Speech, Chinese Meaning, Plural form (if noun).
    *   **## 语法解析 (Grammar Notes):** Explain 1-3 grammar points found in the text (e.g., Inversion, Separable verbs, Perfect tense) in Chinese.
    *   **## 练习 (Practice):** 2 short questions or a translation exercise based on the content to test understanding.

**Special Handling:**
*   If the input is a URL, read the content of the page and then perform the analysis.
*   If the input is an image, describe what is happening in the image in Dutch (A2/B1 level) in the "Immersion Reading" section, then analyze that text.
`;

export const analyzeContent = async (
  inputText: string, 
  imageFile?: File
): Promise<{ text: string; sources?: string[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Configure tools
    // We enable Google Search if it looks like a URL or the user explicitly asks for external info.
    // However, for general text analysis, we might not need it. 
    // To support the "URL input" requirement robustly, we will always enable it if the input looks like a URL.
    const isUrl = /^(http|https):\/\/[^ "]+$/.test(inputText.trim());
    
    const tools: Tool[] = [];
    if (isUrl) {
        tools.push({ googleSearch: {} });
    }

    // Determine model based on image presence or complexity
    // User requested gemini-3-pro-preview for image understanding and quality.
    const modelId = 'gemini-3-pro-preview';

    const parts: any[] = [];

    // Add Image if present
    if (imageFile) {
      const base64Data = await fileToBase64(imageFile);
      parts.push({
        inlineData: {
          mimeType: imageFile.type,
          data: base64Data,
        },
      });
      // If there is text with the image, add it as a prompt
      if (inputText) {
          parts.push({ text: `Analyze this image. Context/User Note: ${inputText}` });
      } else {
          parts.push({ text: "Analyze this image and generate a Dutch study guide." });
      }
    } else {
      // Just Text or URL
      parts.push({ text: inputText });
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: tools.length > 0 ? tools : undefined,
        temperature: 0.4, // Lower temperature for more structured/educational output
      },
    });

    const text = response.text || "无法生成内容，请重试。";
    
    // Extract sources if available (from Google Search)
    const sources: string[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
            if (chunk.web?.uri) {
                sources.push(chunk.web.uri);
            }
        });
    }

    return { text, sources };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "An error occurred while communicating with Gemini.");
  }
};

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};
