// File: pages/api/chat.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY || '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';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ CORS preflight response
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ Method validation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const userMessage: string = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
  }

  try {
    // ✅ Respons cepat untuk sapaan
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

    if (
      greetings.some((greet) => lowerMsg.includes(greet)) &&
      lowerMsg.trim().split(' ').length <= 6
    ) {
      return res.json({
        reply: 'Halo! Ada yang bisa saya bantu seputar layanan KangAjieDev?',
      });
    }

    if (
      thanks.some((thank) => lowerMsg.includes(thank)) &&
      lowerMsg.length <= 40
    ) {
      return res.json({
        reply:
          'Sama-sama! Jika ada pertanyaan lain seputar layanan KangAjieDev, silakan ditanyakan.',
      });
    }

    // ✅ Kirim ke OpenRouter
    const aiResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3-8b-instruct',
        messages: [
          {
  role: 'system',
  content: `
Kamu adalah KangAjieBot, asisten virtual profesional dari website KangAjieDev.

Tugas:
- Jawab pertanyaan tentang layanan pembuatan/perawatan website, harga, keunggulan, teknologi, dan kontak.
- Gunakan gaya bahasa profesional, sopan, dan tidak terlalu panjang.

Informasi Bisnis:
- Nama: M. Roifan Aji Marzuki (Kang Ajie)
- Lokasi: Balerejo, Glenmore, Banyuwangi
- Kontak WA: 0881026124253
- Instagram: @roifnvtaaa
- Website: https://kangajie.site

Layanan:
1. Pembuatan Website (UMKM, Toko Online, Portofolio, dll)
2. Perawatan Website (Keamanan, Backup, Update)
3. Request Khusus: Booking, Pembayaran, SEO, dsb.

Harga (Perkiraan):
- Basic: Rp 600.000 – 850.000
- Standard + Maintenance: Rp 1.200.000 – 1.500.000/tahun
- Premium: Rp 1.800.000 – 2.500.000/tahun

Teknologi: HTML, CSS, JavaScript, GSAP, Three.js, ScrollMagic

Aturan:
- Jangan menyebut diri sebagai chatbot atau AI.
- Jika tidak relevan, jawab: "Maaf, saya hanya bisa bantu seputar layanan KangAjieDev."
`.trim()
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
      aiResponse.data.choices?.[0]?.message?.content ||
      'Maaf, saya tidak punya jawaban untuk itu.';
    res.json({ reply });
  } catch (err: any) {
    console.error('🔥 ERROR dari OpenRouter:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Gagal mengambil jawaban dari AI.' });
  }
}
