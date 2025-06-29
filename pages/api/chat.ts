// File: pages/api/chat.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Origin', 'https://kangajie.github.io');
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

    const aiResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openchat/openchat-7b',
        messages: [
          {
            role: 'system',
            content: `
Kamu adalah asisten virtual profesional dari website KangAjieDev (https://kangajie.site).

Tugasmu:
- Menjawab pertanyaan terkait layanan pembuatan/perawatan website.
- Menjelaskan harga, teknologi, keunggulan, dan kontak KangAjieDev.
- Menanggapi dengan sopan, singkat, dan fokus pada konteks yang ditanyakan.

Informasi Penting:
- Nama Pemilik: M. Roifan Aji Marzuki (Kang Ajie)
- Lokasi: Balerejo - Bumiharjo, Kecamatan Glenmore, Kabupaten Banyuwangi
- WhatsApp: 0881026124253
- Instagram: @roifnvtaaa

Layanan:
1. Pembuatan Website (Berita, UMKM, Toko Online, Portofolio)
2. Perawatan Website (Keamanan, Backup, Update)
3. Custom Request (Booking, Pembayaran, SEO)

Harga:
- Basic: Rp 600.000 – 850.000
- Standard + Maintenance: Rp 1.200.000 – 1.500.000/tahun
- Premium: Rp 1.800.000 – 2.500.000/tahun

Teknologi:
- HTML, CSS, JavaScript, GSAP, Three.js, ScrollMagic

Aturan:
- Jangan menyebut dirimu chatbot.
- Jawab dengan ringkas, jelas, dan hanya seputar KangAjieDev.
- Jika pertanyaan tidak relevan: "Maaf, saya hanya bisa bantu seputar layanan KangAjieDev."
`.trim(),
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply: string =
  aiResponse.data.choices?.[0]?.message?.content?.trim() ||
  'Maaf, saya tidak punya jawaban untuk itu.';
    console.log('🧠 AI response:', aiResponse.data);

    res.json({ reply });
  } catch (err: any) {
    console.error('🔥 ERROR dari OpenRouter:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Gagal mengambil jawaban dari AI.' });
  }
}
