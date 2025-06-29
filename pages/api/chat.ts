import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { message } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    // Ambil model Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Kirim prompt
    const result = await model.generateContent([message]);

    // Ambil hasil
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });
  } catch (err: any) {
    console.error('❌ Gemini error:', err.message || err);
    res.status(500).json({ error: 'Gagal mengambil balasan dari Gemini.' });
  }
}
