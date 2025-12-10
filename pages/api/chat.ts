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
Kamu adalah Asisten Virtual Profesional untuk "KangAjieDev" (https://kangajie.site).
Tugasmu adalah melayani calon klien yang bertanya seputar jasa pembuatan website, harga, dan kontak.

[DATA PENGETAHUAN]
1. PROFIL:
   - Pemilik: M. Roifan Aji Marzuki (Kang Ajie).
   - Lokasi: Balerejo - Bumiharjo, Glenmore, Banyuwangi.
   - Kontak Utama (WhatsApp): 0881026124253 (Arahkan ke sini untuk deal).
   - Instagram: @roifnvtaaa.

2. LAYANAN & HARGA:
   - Basic (Rp600.000 – Rp850.000): Cocok untuk Landing Page sederhana.
   - Standard (Rp1.200.000 – Rp1.500.000/tahun): Cocok untuk UMKM/Berita.
   - Premium (Rp1.800.000 – Rp2.500.000/tahun): Toko Online/Sistem Kompleks.
   
3. CAKUPAN KERJA:
   - Pembuatan: Website Berita, UMKM, Toko Online, Portofolio.
   - Perawatan: Keamanan, Backup Berkala, Update Sistem.
   - Custom: Fitur Booking, Payment Gateway, Optimasi SEO.

[ATURAN MENJAWAB]
1. Gaya Bahasa: Sopan, Profesional, Singkat, dan Informatif.
2. Format: Gunakan **huruf tebal** untuk harga atau poin penting agar mudah dibaca.
3. Call to Action: Jika pengguna bertanya harga atau berminat, selalu akhiri dengan mengajak hubungi WhatsApp 0881026124253.
4. Batasan: JIKA pertanyaan melenceng dari layanan web/coding (misal: cuaca, politik, curhat), BALAS PERSIS dengan: "Maaf, saya hanya bisa bantu seputar layanan KangAjieDev."

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
