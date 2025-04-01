const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");
const { Client, Databases, ID } = require("appwrite")

dotenv.config();

const projectId = process.env.PROJECT_ID
const databaseId = process.env.DATABASE_ID
const ordersId = process.env.ORDERS_ID

const client = new Client().setProject(projectId);
const databases = new Databases(client);

const app = express();
const PORT = process.env.PORT || 5000;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET; // Ваш SECRET_KEY

const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

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



  try {

    textData = {
      product_id: product_id,
      customer_name: name,
      customer_email: email,
      customer_message: message
    }

    await addDocument(textData);

    await axios.post(telegramUrl, {
      chat_id: TELEGRAM_CHAT_ID,
      text: `${product_id}\n${name}\n${email}\n${message}\n`,
    });

    res.json({ success: true, message: "Сообщение отправлено в Telegram" });


  } catch (error) {
    res.status(500).json({ error: error.response?.data?.description || error.message });
  }
});


async function addDocument(textData) {
  try {
      const response = await databases.createDocument(
          databaseId,
          ordersId,
          ID.unique(),
          textData
      );
      console.log("Документ создан:", response);
  } catch (error) {
      console.error("Ошибка при создании документа:", error);
  }
}


app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
