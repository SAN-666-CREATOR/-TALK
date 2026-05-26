import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

let aiClient: GoogleGenAI | null = null;

// Lazy initialization helper for Gemini SDK to avoid startup crashes if key is missing
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("La clave GEMINI_API_KEY no está configurada. Por favor, añádela en Settings > Secrets en AI Studio.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // API Route: Interactive Chat & Speech Practice Engine
  app.post("/api/chat", async (req, res) => {
    try {
      const ai = getGeminiClient();
      const { systemPrompt, partnerCharacter, messageHistory, userInput } = req.body;

      if (!userInput) {
        return res.status(400).json({ error: "userInput is required." });
      }

      // Build context for Gemini model. We request a JSON response matching the character's persona and evaluating user's Japanese
      const contents = [
        {
          role: "user",
          parts: [{
            text: `CONTEXT AND ROLEPLAY RULES:
You are roleplaying as "${partnerCharacter}".
Your context / behavior prompt: "${systemPrompt}"

User's input: "${userInput}"

Your tasks:
1. Formulate a natural, conversational response AS "${partnerCharacter}". Keep your primary response short to maintain realistic dialogue rhythm.
   CRITICAL DIRECTIVE FOR SPANISH QUESTIONS AND DIALOGUE:
   - If the student asks you questions in Spanish, or chats/practices in Spanish (e.g. asking about Japanese culture, vocabulary differences like 'wa' vs 'ga', how to formulate a phrase, or grammatical explanations), you MUST resolve their question fully, clearly, and comprehensively in SPANISH in 'characterReplySpanish' and/or 'characterReply' without ever leaving the roleplay character as Sakura Sensei.
   - For Spanish questions, you should provide BOTH alternatives or options if appropriate:
     * A rich, helpful educational explanation in Spanish (placed inside 'characterReplySpanish')
     * A clear set of Japanese example sentences/phrases representing the answer (placed inside 'characterReply') along with their Romaji pronunciation (in 'characterReplyRomaji')
   - Never say 'I can only talk in Japanese' or refuse. Answer their inquiry inside the context of Sakura Sensei (who is proud of Colombia 🇨🇴, loves café, etc.), ensuring the student learns.

2. Provide a clean Romaji transcript of your Japanese response inside 'characterReplyRomaji'.
3. Provide a friendly Spanish translation/explanation of your response inside 'characterReplySpanish'.
4. Translate and transcribe the user's own input ("${userInput}"):
    - Provide 'userRomaji': The Romaji pronunciation reading of the user's input if they wrote in Japanese. If they wrote/asked in Spanish, provide the Romaji pronunciation of the closest Japanese translation/equivalent of their input.
    - Provide 'userSpanish': The clean Spanish translation/meaning of the user's input if they wrote in Japanese. If the user wrote/asked in Spanish, just return the user's Spanish input itself.
5. Evaluate the user's input ("${userInput}"). Is it natural? Are there grammar, spelling, or particle errors? Provide:
    - isNatural: true if the user's input is grammatically correct and natural for this scenario, false otherwise.
    - score: a rating between 0 and 100 on their input. Give 100 for perfectly natural input, or adjust down based on mistakes. If user asked a question in Spanish, rate their Spanish query kindly (typically high score, like 90-100) or provide constructive tips about the Japanese they asked about.
    - corrections: short advice or specific grammar/word correction if they made mistakes, in Spanish. Keep it empty/null if no corrections are needed.
    - naturalAlternative: a more natural way to write or say the user's response in Japanese (using correct Kanji/Kana), or null if their input was already perfect.
    - explanation: a concise linguistic tip in Spanish (max 2-3 sentences) explaining the correction, particles, or why the natural alternative is better, so they learn.
6. Provide a detailed dynamic breakdown ("characterBreakdown") of EVERY single key Japanese word, particle, symbol, or logical unit inside the 'characterReply' so the student can learn their individual pronunciation and Spanish translation. Break it down so that the entire 'characterReply' is fully accounted for.

Here is the conversation history for context:
${JSON.stringify(messageHistory || [])}

Now, generate the response in the specified JSON structure.`
          }]
        }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              characterReply: {
                type: Type.STRING,
                description: "The Japanese reply (in natural Kanji/Kana/Hiragana mix) from the character. Keep it short (1-2 sentences)."
              },
              characterReplyRomaji: {
                type: Type.STRING,
                description: "The Romaji English pronunciation guide for the character's reply."
              },
              characterReplySpanish: {
                type: Type.STRING,
                description: "Spanish translation/explanation of the character's reply."
              },
              userRomaji: {
                type: Type.STRING,
                description: "The Romaji pronunciation guide for what the USER wrote/said in Japanese. If the user wrote in Spanish, provide the Romaji of its Japanese translation/equivalent."
              },
              userSpanish: {
                type: Type.STRING,
                description: "The Spanish translation / meaning of what the USER wrote/said in Japanese. If the user wrote in Spanish, echo their Spanish input."
              },
              characterBreakdown: {
                type: Type.ARRAY,
                description: "A chronological list of every word, particle, or logical unit in 'characterReply', mapping each to its pronunciation and translation.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    japanese: { type: Type.STRING, description: "The Japanese character(s) or word, e.g. '私' or 'は' or 'ビール' or 'ください'" },
                    romaji: { type: Type.STRING, description: "The correct pronunciation / romaji reading of this part, e.g. 'watashi' or 'wa' or 'bīru' or 'kudasai'" },
                    spanish: { type: Type.STRING, description: "The Spanish translation / meaning / grammatical function of this part, e.g. 'Yo' or '(partícula de tema)' or 'cerveza' or 'por favor'" }
                  },
                  required: ["japanese", "romaji", "spanish"]
                }
              },
              userFeedback: {
                type: Type.OBJECT,
                description: "Linguistic feedback on the user's Japanese speed or typing input.",
                properties: {
                  isNatural: { type: Type.BOOLEAN },
                  score: { type: Type.INTEGER },
                  corrections: { type: Type.STRING, description: "Spelling, particle, or grammar corrections in Spanish. Null if none." },
                  naturalAlternative: { type: Type.STRING, description: "A highly natural native alternative phrase in Japanese. Null if user was perfect." },
                  explanation: { type: Type.STRING, description: "Educational tip in Spanish explaining why or how to improve. Null if user was perfect." }
                },
                required: ["isNatural", "score"]
              }
            },
            required: ["characterReply", "characterReplyRomaji", "characterReplySpanish", "userRomaji", "userSpanish", "characterBreakdown", "userFeedback"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response was returned from the model.");
      }

      const parsedResponse = JSON.parse(responseText.trim());
      res.json(parsedResponse);

    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({
        error: error.message || "Un error interno ocurrió en el servidor de práctica.",
        hasApiKey: !!process.env.GEMINI_API_KEY
      });
    }
  });

  // API Route: Oral Practice Phrase Evaluation Coach
  app.post("/api/evaluate-phrase", async (req, res) => {
    try {
      const ai = getGeminiClient();
      const { targetJapanese, targetRomaji, spokenText } = req.body;

      if (!targetJapanese || !spokenText) {
        return res.status(400).json({ error: "targetJapanese and spokenText are required." });
      }

      const prompt = `You are a Japanese Pronunciation Coach guiding a native Spanish speaker.
Target Japanese phrase to pronounce: "${targetJapanese}" (Romaji: "${targetRomaji}")
User's speech recognition output (spoken text transcript): "${spokenText}"

Task:
Compare the user's spoken transcript with the target Japanese phrase.
Determine:
1. If they pronounced it correctly / close enough (since Speech Recognition can misinterpret subtle sounds, be encouraging but point out major mistakes).
2. Calculate an accuracy score from 0 to 100 based on comparison (if they spoke the exact words, it's 100. If they said something completely different, it's low).
3. Provide a clear, polite, and encouraging phonetic audit in Spanish (max 2-3 sentences), explaining which sounds they got right and areas for improvement, particularly common mistakes Spanish speakers make (like 'u' vs 'o' vowel length, 'r' sound, double consonants/sokuon, or dropping particles).

Formulate your response in JSON format.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              accuracyScore: {
                type: Type.INTEGER,
                description: "An accuracy score from 0 to 100 comparing the spoken transcription to the target Japanese."
              },
              feedback: {
                type: Type.STRING,
                description: "Encouraging and constructive evaluation in Spanish about their pronunciation and phonetics."
              },
              matched: {
                type: Type.BOOLEAN,
                description: "true if the score is 75 or higher (deemed passed), false otherwise."
              },
              detectedWords: {
                type: Type.STRING,
                description: "What the voice recognition system read (spokenText)."
              }
            },
            required: ["accuracyScore", "feedback", "matched", "detectedWords"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No feedback response was returned from the model.");
      }

      const parsedResponse = JSON.parse(responseText.trim());
      res.json(parsedResponse);

    } catch (error: any) {
      console.error("Error in /api/evaluate-phrase:", error);
      res.status(500).json({
        error: error.message || "No se pudo conectar con el tutor de pronunciación.",
        hasApiKey: !!process.env.GEMINI_API_KEY
      });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start the full-stack server:", err);
});
