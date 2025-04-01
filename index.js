const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET; // Ваш SECRET_KEY

app.use(express.json());

app.use(cors({
  origin: 'https://templates-23682.web.app',
}));

app.post("/sendMessage", async (req, res) => {
  const { product_id, name, email, message, recaptchaToken } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Сообщение не может быть пустым" });
  }

  if (!recaptchaToken) {
    return res.status(400).json({ error: "Не пройдена проверка reCAPTCHA" });
  }

  // Проверка reCAPTCHA на сервере
  try {
    const recaptchaRes = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET,
          response: recaptchaToken,
        },
      }
    );

    if (!recaptchaRes.data.success || recaptchaRes.data.score < 0.5) {
      return res.status(400).json({ error: "reCAPTCHA не пройдена" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Ошибка проверки reCAPTCHA" });
  }

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(telegramUrl, {
      chat_id: TELEGRAM_CHAT_ID,
      text: `${product_id}\n${name}\n${email}\n${message}\n`,
    });

    res.json({ success: true, message: "Сообщение отправлено в Telegram" });
  } catch (error) {
    res.status(500).json({ error: error.response?.data?.description || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
