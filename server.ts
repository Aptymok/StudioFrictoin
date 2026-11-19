/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SFI CREATIVE COMPANION — Full-Stack Server
 * Mounts Express API proxy endpoints for:
 * - Lyria music generation (lyria-3-clip-preview / lyria-3-pro-preview)
 * - Image creation & editing (gemini-nano-banana-2.1)
 * - Video generation & image animation (gemini-omni-1.2-flash via Interactions API)
 * - Audio transcription (gemini-3.5-transcribe)
 * - Search grounding (gemini-3.8-flash with google_search)
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Google GenAI initialization with User-Agent header for telemetry
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. MUSIC GENERATION (Lyria)
// Model: lyria-3-clip-preview (up to 30s) or lyria-3-pro-preview (full tracks)
app.post('/api/gemini/music', async (req: Request, res: Response) => {
  try {
    const { prompt, modelType = 'clip', imageBase64, imageMime = 'image/jpeg' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'El prompt de música es requerido.' });
    }

    const ai = getGenAIClient();
    const model = modelType === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

    if (!ai) {
      // In air-gapped / simulated mode without API key, return a simulated procedural audio signature
      return res.json({
        success: true,
        isSimulated: true,
        model,
        provenance: 'DEMO_SYNTHETIC',
        notes: '[SIMULACIÓN SINTÉTICA DEMO]: No se detectó GEMINI_API_KEY activa. Se generó descriptor armónico de resonancia.',
        prompt,
        duration: modelType === 'pro' ? '90s' : '30s',
        audioUrl: null,
      });
    }

    const contents = imageBase64
      ? {
          parts: [
            { text: prompt },
            { inlineData: { data: imageBase64, mimeType: imageMime } },
          ],
        }
      : prompt;

    const responseStream = await ai.models.generateContentStream({
      model,
      contents,
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;

      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    return res.json({
      success: true,
      model,
      audioBase64,
      mimeType,
      lyrics,
      provenance: 'DEMO_SYNTHETIC',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error en generación de música Lyria:', error);
    return res.status(500).json({ error: msg });
  }
});

// 2. IMAGE CREATION & EDITING (gemini-nano-banana-2.1)
app.post('/api/gemini/image', async (req: Request, res: Response) => {
  try {
    const { prompt, base64Image, mimeType = 'image/png', aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'El prompt de imagen es requerido.' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.json({
        success: true,
        isSimulated: true,
        model: 'gemini-nano-banana-2.1',
        provenance: 'DEMO_SYNTHETIC',
        notes: '[SIMULACIÓN SINTÉTICA]: Modo desconectado de SFI / sin GEMINI_API_KEY. Utilice el generador de prompts editables.',
        prompt,
      });
    }

    const input = base64Image
      ? [
          {
            type: 'image' as const,
            data: base64Image,
            mime_type: mimeType,
          },
          {
            type: 'text' as const,
            text: prompt,
          },
        ]
      : prompt;

    const interaction = await ai.interactions.create({
      model: 'gemini-nano-banana-2.1',
      input,
      response_modalities: ['image', 'text'],
      generation_config: {
        image_config: {
          aspect_ratio: aspectRatio,
          image_size: '1K',
        },
      },
    });

    let generatedImageBase64 = '';
    let resultMime = 'image/png';
    let outputText = '';

    for (const step of interaction.steps) {
      if (step.type === 'model_output') {
        const imageContent = step.content?.find((c) => c.type === 'image');
        if (imageContent && imageContent.data) {
          generatedImageBase64 = imageContent.data;
          resultMime = imageContent.mime_type || 'image/png';
        }
        const textContent = step.content?.find((c) => c.type === 'text');
        if (textContent && textContent.text) {
          outputText += textContent.text;
        }
      }
    }

    return res.json({
      success: true,
      model: 'gemini-nano-banana-2.1',
      imageBase64: generatedImageBase64,
      mimeType: resultMime,
      outputText,
      provenance: 'DEMO_SYNTHETIC',
      aspectRatio,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error en generación/edición de imagen:', error);
    return res.status(500).json({ error: msg });
  }
});

// 3. ANIMATE IMAGE INTO VIDEO (gemini-omni-1.2-flash via Interactions API)
app.post('/api/gemini/video-from-image', async (req: Request, res: Response) => {
  try {
    const { base64Image, mimeType = 'image/png', prompt, aspectRatio = '16:9', duration = '10s' } = req.body;
    if (!base64Image || !prompt) {
      return res.status(400).json({ error: 'Se requiere imagen y prompt de animación.' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.json({
        success: true,
        isSimulated: true,
        model: 'gemini-omni-1.2-flash',
        provenance: 'DEMO_SYNTHETIC',
        notes: '[SIMULACIÓN SINTÉTICA]: Modo desconectado / sin GEMINI_API_KEY. Especificación de animación generada.',
        aspectRatio,
        duration,
      });
    }

    const interaction = await ai.interactions.create(
      {
        model: 'gemini-omni-1.2-flash',
        input: [
          {
            type: 'image',
            mime_type: mimeType,
            data: base64Image,
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: aspectRatio as '16:9' | '9:16',
          duration,
        },
      },
      { timeout: 300000 }
    );

    const videoPart = interaction.output_video;
    return res.json({
      success: true,
      model: 'gemini-omni-1.2-flash',
      videoData: videoPart?.data || null,
      mimeType: videoPart?.mime_type || 'video/mp4',
      aspectRatio,
      provenance: 'DEMO_SYNTHETIC',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error en Image-to-Video:', error);
    return res.status(500).json({ error: msg });
  }
});

// 4. GENERATE VIDEO FROM TEXT (gemini-omni-1.2-flash via Interactions API)
app.post('/api/gemini/video-from-text', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '16:9', duration = '10s', resolution = '720p' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'El prompt de video es requerido.' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.json({
        success: true,
        isSimulated: true,
        model: 'gemini-omni-1.2-flash',
        provenance: 'DEMO_SYNTHETIC',
        notes: '[SIMULACIÓN SINTÉTICA]: Modo desconectado / sin GEMINI_API_KEY. Directiva de renderización formulada.',
        aspectRatio,
        duration,
      });
    }

    const interaction = await ai.interactions.create(
      {
        model: 'gemini-omni-1.2-flash',
        input: prompt,
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: aspectRatio as '16:9' | '9:16',
          duration,
          resolution,
        },
      },
      { timeout: 300000 }
    );

    const videoPart = interaction.output_video;
    return res.json({
      success: true,
      model: 'gemini-omni-1.2-flash',
      videoData: videoPart?.data || null,
      mimeType: videoPart?.mime_type || 'video/mp4',
      aspectRatio,
      provenance: 'DEMO_SYNTHETIC',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error en Text-to-Video:', error);
    return res.status(500).json({ error: msg });
  }
});

// 5. TRANSCRIBE AUDIO (gemini-3.5-transcribe)
app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
  try {
    const { base64Audio, mimeType = 'audio/webm', language = 'es' } = req.body;
    if (!base64Audio) {
      return res.status(400).json({ error: 'Se requiere el audio codificado en base64.' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.json({
        success: true,
        isSimulated: true,
        model: 'gemini-3.5-transcribe',
        transcript: '[SIMULACIÓN SINTÉTICA DEMO]: Entrada de audio registrada localmente. Transcripción simulada de cuaderno de laboratorio de 1934.',
        provenance: 'DEMO_SYNTHETIC',
      });
    }

    const interaction = await ai.interactions.create({
      model: 'gemini-3.5-transcribe',
      input: [
        {
          type: 'audio',
          data: base64Audio,
          mime_type: mimeType,
        },
        {
          type: 'text',
          text: `Transcribe con total exactitud este archivo de audio en idioma ${language}. Devuelve únicamente la transcripción literal del locutor.`,
        },
      ],
    });

    let transcript = interaction.output_text || '';
    if (!transcript) {
      for (const step of interaction.steps) {
        if (step.type === 'model_output') {
          const txt = step.content?.find((c) => c.type === 'text');
          if (txt?.text) transcript += txt.text;
        }
      }
    }

    return res.json({
      success: true,
      model: 'gemini-3.5-transcribe',
      transcript,
      provenance: 'DEMO_SYNTHETIC',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error en transcripción de audio:', error);
    return res.status(500).json({ error: msg });
  }
});

// 6. SEARCH GROUNDING (gemini-3.8-flash with googleSearch tool)
app.post('/api/gemini/search-grounding', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Se requiere una consulta de búsqueda.' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.json({
        success: true,
        isSimulated: true,
        model: 'gemini-3.8-flash',
        query,
        groundedText: `[SIMULACIÓN DIDÁCTICA]: En modo desconectado de SFI, la búsqueda referencial para "${query}" se simula a partir de los expedientes de archivo depositados localmente.`,
        groundingMetadata: {
          searchSources: [
            { title: 'Archivo Histórico de Física y Minería (Referencia)', url: 'https://archive.org' },
          ],
        },
        provenance: 'DEMO_SYNTHETIC',
      });
    }

    const interaction = await ai.interactions.create({
      model: 'gemini-3.8-flash',
      input: `Investiga con fuentes académicas y científicas actualizadas la siguiente consulta y cita las fuentes verificables: ${query}`,
      tools: [{ type: 'google_search' }],
    });

    let groundedText = interaction.output_text || '';
    if (!groundedText) {
      for (const step of interaction.steps) {
        if (step.type === 'model_output') {
          const txt = step.content?.find((c) => c.type === 'text');
          if (txt?.text) groundedText += txt.text;
        }
      }
    }

    // Extract grounding sources from steps if available
    const searchResults: Array<{ title: string; url: string }> = [];
    for (const step of interaction.steps) {
      if (step.type === 'google_search_result') {
        // Collect search metadata if present
      }
    }

    return res.json({
      success: true,
      model: 'gemini-3.8-flash',
      query,
      groundedText,
      searchResults,
      provenance: 'DEMO_SYNTHETIC',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error en Search Grounding:', error);
    return res.status(500).json({ error: msg });
  }
});

// 7. MULTI-TURN GEMINI CHATBOT (gemini-4-carbon, gemini-4-argon, gemini-4-hydrogen, gemini-3.1-flash-lite)
const ALLOWED_CHAT_MODELS = new Set([
  'gemini-4-hydrogen',
  'gemini-4-argon',
  'gemini-4-carbon',
  'gemini-3.1-flash-lite',
]);

app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      history = [],
      model = 'gemini-4-hydrogen',
      systemInstruction = 'Eres un asistente creativo y metodológico para System Friction Institute (SFI) Creative Companion. Distingue siempre entre hechos observados, hipótesis, simulaciones sintéticas (DEMO_SYNTHETIC) y objetivos medibles. Nunca inventes evidencia ni dictámenes FAD.',
    } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'El mensaje para el chat es requerido.' });
    }

    const selectedModel = ALLOWED_CHAT_MODELS.has(model) ? model : 'gemini-4-hydrogen';

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error:
          'GEMINI_API_KEY no está configurada o es inválida en el servidor. Configura una clave de API válida para conversar con los modelos Gemini.',
      });
    }

    const formattedHistory = Array.isArray(history)
      ? history
          .filter(
            (turn: unknown): turn is { role: 'user' | 'model'; text: string } =>
              Boolean(
                turn &&
                  typeof turn === 'object' &&
                  'role' in turn &&
                  'text' in turn &&
                  ((turn as { role: string }).role === 'user' || (turn as { role: string }).role === 'model') &&
                  typeof (turn as { text: unknown }).text === 'string'
              )
          )
          .map((turn) => ({
            role: turn.role,
            parts: [{ text: turn.text }],
          }))
      : [];

    const chat = ai.chats.create({
      model: selectedModel,
      history: formattedHistory,
      config: {
        systemInstruction:
          typeof systemInstruction === 'string' && systemInstruction.trim()
            ? systemInstruction.trim()
            : undefined,
      },
    });

    const response = await chat.sendMessage({
      message: message.trim(),
    });

    return res.json({
      success: true,
      model: selectedModel,
      text: response.text || '',
      provenance: 'DEMO_SYNTHETIC',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error en /api/gemini/chat:', error);
    return res.status(500).json({ error: msg });
  }
});

// VITE MIDDLEWARE IN DEV OR STATIC SERVE IN PROD
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SFI Creative Companion Server corriendo en http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Fallo fatal al iniciar el servidor:', err);
  process.exit(1);
});
