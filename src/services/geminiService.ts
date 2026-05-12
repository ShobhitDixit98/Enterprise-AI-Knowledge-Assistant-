import { GoogleGenAI } from "@google/genai";
import { Book } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getAssistantResponse(query: string, context: Book[]) {
  const model = "gemini-3-flash-preview";
  
  const contextText = context.map(doc => 
    `Source: ${doc.title} by ${doc.author}\nTopics: ${doc.topics.join(', ')}\nContent: ${doc.content}`
  ).join('\n\n');

  const systemInstruction = `You are a highly advanced Enterprise AI Knowledge Assistant specializing in Machine Learning. 
  You have access to a curated library of ML books.
  Your goal is to answer the user's questions based strictly on the provided context.
  If the answer is not in the context, tell the user that you don't have that specific information in your current knowledge base, but offer to provide a general explanation based on your training data if they wish.
  Always cite your sources clearly.
  Format your response using Markdown. Use bold for key terms and lists for structured information.`;

  const prompt = `Context:\n${contextText}\n\nUser Question: ${query}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature for more factual RAG responses
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
