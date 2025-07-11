import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi Gemini API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://kangajie.site');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'Pesan tidak valid.' });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY belum diatur di environment variables.');
    }

    // Ganti model di sini jika ingin upgrade:
   const model = genAI.getGenerativeModel({
  model: 'models/gemini-1.5-flash' // Atau 'models/gemini-1.5-pro' jika ingin kualitas lebih tinggi
});


    const prompt = `
    Kamu adalah asisten virtual profesional dari website KangAjieDev (https://kangajie.site).
    Tugasmu adalah menjawab pertanyaan tentang:
    - Jasa pembuatan dan perawatan website.
    - Harga, teknologi, dan keunggulan KangAjieDev.
    - Cara menghubungi KangAjieDev.
    - Detail layanan, proses pemesanan, dan konsultasi.
    - Testimoni pelanggan, portofolio, dan keunggulan dibanding kompetitor.
    - Teknologi yang digunakan (Next.js, React, Node.js, Tailwind, dsb).
    - Sistem keamanan, backup, dan update berkala.
    - Custom request seperti booking, pembayaran online, SEO, dan fitur tambahan.

    Berikan jawaban yang sopan, informatif, dan responsif. Jika pertanyaan umum seperti "apa itu portofolio?", "apa itu website?", atau topik terkait teknologi dan layanan web, berikan penjelasan singkat dan relevan. Jika diajak ngobrol, usahakan responsif dan nyambung dengan topik sebelumnya.

    Informasi penting:
    - Nama: M. Roifan Aji Marzuki (Kang Ajie)
    - Lokasi: Balerejo - Bumiharjo, Glenmore, Banyuwangi
    - WhatsApp: 0881026124253
    - Instagram: @roifnvtaaa
    - Email: roifanmarzuki@gmail.com
    - Website: https://kangajie.site

    Layanan:
    1. Pembuatan Website (Berita, UMKM, Toko Online, Portofolio, Sekolah, Organisasi)
    2. Perawatan Website (Keamanan, Backup, Update, Monitoring)
    3. Custom Request (Booking, Pembayaran, SEO, Integrasi API, Fitur khusus)
    4. Konsultasi gratis sebelum pemesanan

    Harga:
    - Basic: Rp600.000–850.000 (website sederhana, landing page, portofolio)
    - Standard: Rp1.200.000–1.500.000/tahun (fitur lengkap, toko online, UMKM)
    - Premium: Rp1.800.000–2.500.000/tahun (fitur custom, maintenance, support prioritas)

    Keunggulan:
    - Proses cepat & transparan
    - Teknologi terbaru & responsif di semua perangkat
    - Support after sales & maintenance rutin
    - Bisa konsultasi gratis sebelum order
    - Portofolio & testimoni nyata

    Jika ada pertanyaan yang benar-benar tidak relevan dengan layanan, balas: "Maaf, saya hanya bisa bantu seputar layanan KangAjieDev."

    Pertanyaan: ${message}
    `.trim();

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const reply = result.response.text();

    res.status(200).json({
      success: true,
      reply // ini agar frontend membaca dari `data.reply`
    });

  } catch (error: any) {
    console.error("❌ Gemini Error:", error?.message || error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil balasan dari Gemini. Silakan coba lagi nanti."
    });
  }
}
