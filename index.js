const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// app.use(cors({
//   origin: 'http://example.com' // Разрешить только example.com, localhost будет заблокирован
// }));

app.use(express.json());
app.use(cors());

// Либо настрой CORS вручную
// app.use(cors({
//   origin: 'http://example.com', // Разрешенный источник
//   methods: ['GET', 'POST'], // Разрешенные методы
//   allowedHeaders: ['Content-Type', 'Authorization'], // Разрешенные заголовки
//   credentials: true // Разрешает куксы и авторизационные заголовки
// }));




app.post("/sendMessage", async (req, res) => {
  const { name, email, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Сообщение не может быть пустым" });
  }

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await axios.post(telegramUrl, {
      chat_id: TELEGRAM_CHAT_ID,
      text: `${name} ${email} ${message}`,
    });

    res.json({ success: true, message: "Сообщение отправлено в Telegram" });
  } catch (error) {
    res.status(500).json({ error: error.response?.data?.description || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});