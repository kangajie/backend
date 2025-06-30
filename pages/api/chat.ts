import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://kangajie.site');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { message } = req.body;

  if (!message) return res.status(400).json({ 
    success: false, 
    error: 'Message is required' 
  });

  try {
    // Validasi API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY tidak ditemukan');
    }

    // Ambil model Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Kirim prompt dengan konteks
    const prompt = `Kamu adalah asisten AI KangAjieDev. Berikan jawaban yang ramah, informatif, dan membantu dalam bahasa Indonesia. Pertanyaan: ${message}`;
    
    const result = await model.generateContent([prompt]);

    // Ambil hasil
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ 
      success: true, 
      response: text 
    });
  } catch (err: any) {
    console.error('❌ Gemini error:', err.message || err);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal mengambil balasan dari Gemini. Silakan coba lagi nanti.' 
    });
  }
}
// Catatan: Pastikan untuk mengatur variabel lingkungan GEMINI_API_KEY di file .env
// dengan API key yang valid dari Google Generative AI.