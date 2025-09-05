// /pages/api/speak.js (Next.js API route)
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { text } = req.body;

    const response = await axios.post(
      "https://api.play.ht/api/v2/tts", 
      {
        text,
        voice: "en-US-Male-1" // 🔧 change voice if you want
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PLAYAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({ audioUrl: response.data.audioUrl });
  } catch (error) {
    console.error("TTS Error:", error.response?.data || error.message);
    res.status(500).json({ error: "TTS failed" });
  }
}
