require('dotenv').config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const path = require("path");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
// Melayani file statis dari folder 'public'
app.use(express.static(path.join(__dirname, "public")));

// KONFIGURASI PENTING UNTUK VERCEL:
// Memastikan halaman utama langsung mengarah ke index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

app.post("/tanya", upload.single("file"), async (req, res) => {
  try {
    const { pesan, persona } = req.body;
    
    console.log(`[${new Date().toLocaleTimeString()}] Input: ${pesan} | Role: ${persona}`);

    let promptParts = [`Instruksi: Bertindaklah sebagai ${persona}. Jawablah pertanyaan ini dengan gaya bahasa tersebut: ${pesan}`];

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
    res.status(500).json({ jawaban: "Aduh Bestie, koneksi AI-nya lagi ngambek! Coba cek API Key di dashboard Vercel ya! 🥀" });
  }
});

// Port otomatis menyesuaikan dengan lingkungan Vercel atau Localhost
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server ANFAIRY Berjalan di Port ${PORT}`);
});

// Export app agar dikenali oleh Vercel
module.exports = app;