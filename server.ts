import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Server-side Gemini AI Client (Initialized with User-Agent header)
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API endpoint for generating custom Informatics questions
  app.post('/api/generate-questions', async (req, res) => {
    try {
      const { prompt, targetBuilding, count = 3 } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'API Key belum dikonfigurasi di Settings > Secrets.',
          fallback: true,
        });
      }

      const systemPrompt = `Anda adalah guru pakar dan penyusun soal Informatika SMP/MTs Kelas VIII berstandar Kurikulum Merdeka (Bab 2 Berpikir Komputasional).
Materi mencakup: Fungsi (definisi, notasi matematis, fungsi dalam komputasi, dekomposisi fungsi), Konsep Himpunan Data Terstruktur, Sistem Bilangan (biner, oktal, desimal, heksadesimal, aritmetika modulo, konversi), dan Struktur Data Stack (prinsip LIFO, push, pop, contoh aplikasi praktis).
Buatlah ${count} butir soal pilihan ganda bermutu tinggi dalam bahasa Indonesia.
Setiap soal WAJIB memiliki:
- submateri: string singkat (contoh: "A.1 Definisi Fungsi", "C.3 Konsep Aritmetika Modulo", atau "D.1 Prinsip Stack LIFO")
- q: teks pertanyaan yang jelas dan mendidik
- options: array berisi tepat 4 string pilihan yang diawali dengan "A. ", "B. ", "C. ", "D. "
- key: satu huruf kapital "A", "B", "C", atau "D" yang merupakan jawaban benar
- explanation: pembahasan konsep yang mendidik dan mudah dipahami murid kelas 8 SMP`;

      const userInstruction = prompt || `Buatlah soal pilihan ganda Informatika kelas VIII tentang materi gedung target: ${targetBuilding || 'Berpikir Komputasional'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userInstruction,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                submateri: { type: Type.STRING },
                q: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                key: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['submateri', 'q', 'options', 'key', 'explanation'],
            },
          },
        },
      });

      const text = response.text || '[]';
      const parsed = JSON.parse(text);
      return res.json({ success: true, questions: parsed });
    } catch (err: any) {
      console.error('Gemini API Error in /api/generate-questions:', err);
      return res.status(500).json({
        error: err.message || 'Gagal memproses soal dengan AI',
        fallback: true,
      });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
