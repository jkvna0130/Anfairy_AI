require('dotenv').config(); // Load konfigurasi dari file .env
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const path = require("path");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.static("public"));

// Mengambil API Key dari .env supaya aman saat di-upload ke GitHub
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Menggunakan model terbaru Maret 2026
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

app.post("/tanya", upload.single("file"), async (req, res) => {
  try {
    const { pesan, persona } = req.body;
    
    // Logging untuk memantau aktivitas (Berguna saat demo ke dosen!)
    console.log(`[${new Date().toLocaleTimeString()}] Input: ${pesan} | Role: ${persona}`);

    let promptParts = [`Instruksi: Bertindaklah sebagai ${persona}. Jawablah pertanyaan ini dengan gaya bahasa tersebut: ${pesan}`];

    // Logika jika ada file yang di-upload
    if (req.file) {
      promptParts.push({
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype
        }
      });
    }

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const teksJawaban = response.text();

    res.json({ jawaban: teksJawaban });
  } catch (error) {
    console.error("Gagal memproses permintaan:", error);
    res.status(500).json({ jawaban: "Aduh Bestie, koneksi AI-nya lagi ngambek! Coba cek API Key di .env ya! 🥀" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  🌸------------------------------------------🌸
     Server ANFAIRY AI is Running!
     Akses di: http://localhost:${PORT}
  🌸------------------------------------------🌸
  `);
});