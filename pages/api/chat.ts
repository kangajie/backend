import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const userMessage: string = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
  }

  try {
    const greetings = [
      'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
      'halo', 'hai', 'assalamualaikum', 'assalamu\'alaikum', 'hello',
      'pagi', 'siang', 'sore', 'malam', 'good morning', 'good afternoon',
      'good evening', 'greetings', 'salam', 'salam kenal', 'permisi', 'hi',
      'hey', 'yo', 'apa kabar', 'semangat pagi'
    ];
    const thanks = [
      'terima kasih', 'makasih', 'thanks', 'thank you', 'trimakasih',
      'trims', 'tq', 'makasih banyak', 'terimakasih', 'thank u', 'makasii',
      'makasih ya', 'makasih banget', 'makasih kak', 'makasih mas',
      'makasih mbak', 'makasih gan', 'makasih bro', 'makasih min',
      'makasih admin'
    ];
    const lowerMsg = userMessage.toLowerCase();

    if (greetings.some((greet) => lowerMsg.includes(greet)) && lowerMsg.trim().split(' ').length <= 6) {
      return res.json({ reply: 'Halo! Ada yang bisa saya bantu seputar layanan KangAjieDev?' });
    }

    if (thanks.some((thank) => lowerMsg.includes(thank)) && lowerMsg.length <= 40) {
      return res.json({ reply: 'Sama-sama! Jika ada pertanyaan lain seputar layanan KangAjieDev, silakan ditanyakan.' });
    }

    const systemPrompt = `
Kamu adalah asisten virtual profesional dari website KangAjieDev (https://kangajie.site).
Tugasmu adalah menjawab pertanyaan tentang:
- Jasa pembuatan dan perawatan website.
- Harga, teknologi, dan keunggulan KangAjieDev.
- Cara menghubungi KangAjieDev.

Berikan jawaban yang sopan, singkat, dan hanya seputar layanan KangAjieDev.

Informasi penting:
- Nama: M. Roifan Aji Marzuki (Kang Ajie)
- Lokasi: Balerejo - Bumiharjo, Glenmore, Banyuwangi
- WhatsApp: 0881026124253
- Instagram: @roifnvtaaa

Layanan:
1. Pembuatan Website (Berita, UMKM, Toko Online, Portofolio)
2. Perawatan Website (Keamanan, Backup, Update)
3. Custom Request (Booking, Pembayaran, SEO)

Harga:
- Basic: Rp600.000–850.000
- Standard: Rp1.200.000–1.500.000/tahun
- Premium: Rp1.800.000–2.500.000/tahun

Jika ada pertanyaan tidak relevan, balas: "Maaf, saya hanya bisa bantu seputar layanan KangAjieDev."
    `.trim();

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nPertanyaan: ${userMessage}` }] }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const reply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      'Maaf, saya tidak punya jawaban untuk itu.';

    console.log('🧠 Gemini response:', response.data);
    res.json({ reply });

  } catch (err: any) {
    console.error('🔥 ERROR dari Gemini:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Gagal mengambil jawaban dari Gemini AI.' });
  }
}
