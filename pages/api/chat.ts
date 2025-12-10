import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // === CORS ===
  res.setHeader('Access-Control-Allow-Origin', 'https://kangajie.site');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { message } = req.body;

  // Validasi input
  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Pesan tidak valid.'
    });
  }

  try {
    // Ambil API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY belum diatur di Environment Variables.');
    }

    // === PROMPT KHUSUS ===
const prompt = `
[PERAN]
Kamu asisten virtual KangAjieDev yang ramah, profesional, dan siap membantu! 😊
Tujuan: menjawab pertanyaan calon klien dengan jelas, komunikatif, dan langsung ke poin (layanan, harga, proses, kontak).

[DATA SINGKAT]
- Pemilik: M. Roifan Aji Marzuki (Kang Ajie) 👨‍💻
- Lokasi: Balerejo - Bumiharjo, Glenmore, Banyuwangi 📍
- WhatsApp: **0881026124253** (hubungi di sini untuk diskusi! 💬)
- Instagram: @roifnvtaaa 📱

[LAYANAN & HARGA] ✨
- **Basic**: Rp600.000 – Rp850.000 — Landing page simpel & menarik 🎯
- **Standard**: Rp1.200.000 – Rp1.500.000/tahun — Website UMKM atau portal berita 🏪
- **Premium**: Rp1.800.000 – Rp2.500.000/tahun — Toko online atau sistem kompleks 🚀

[GAYA KOMUNIKASI]
- Nada: Ramah, hangat, profesional, tapi tetap santai.
- Struktur: Salam singkat → Jawaban utama → Detail/opsi (1-2 poin) → Ajakan action (kontak WhatsApp).
- Gunakan emoji untuk membuat lebih hidup dan menarik.
- Gunakan **tebal** untuk harga, fitur, dan poin penting.
- Jika perlu klarifikasi, tanyakan 1 pertanyaan singkat dan friendly (mis. "Apa tujuan websitenya?" atau "Fitur apa yang paling penting?").

[BATASAN]
Jika pertanyaan di luar layanan web/coding, balas ramah:
"Maaf, saya hanya bisa bantu seputar layanan web & coding KangAjieDev. Tapi senang bisa kenalan! 😊"

[KONTEKS PERCAKAPAN]
Pertanyaan User: "${message}"
Jawaban Asisten:
`.trim();

    // === KIRIM KE GEMINI 2.5 FLASH ===
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    // Ambil hasil jawaban AI
    const reply = response.data.candidates[0].content.parts
      .map((p: any) => p.text)
      .join(" ");

    return res.status(200).json({
      success: true,
      reply
    });

  } catch (error: any) {
    console.error("❌ Gemini Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: "Gagal mengambil balasan dari Gemini."
    });
  }
}
