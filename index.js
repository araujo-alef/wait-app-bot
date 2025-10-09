const dotenv = require('dotenv');
dotenv.config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { db } = require("./db.js");

const ordersCollection = "orders";

let clients = [];

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const TOKEN = process.env.TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const API_KEY = process.env.API_KEY;

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado com sucesso!");
    res.status(200).send(challenge);
  } else {
    console.log("❌ Falha na verificação do webhook!");
    res.sendStatus(403);
  }
});

app.post("/", async (req, res) => {
  try {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (message && message.text) {
      const phoneNumber = message.from;
      const text = message.text.body;

      console.log(`Mensagem recebida de ${phoneNumber}: ${text}`);
      await onReceiveMessage(phoneNumber, text)
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("Erro no webhook:", err.response?.data || err.message);
    res.sendStatus(500);
  }
});

app.post("/sendOrderNotification", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const { to, partnerName } = req.body;
  await sendMessageTemplate(
    to,
    'order_ready',
    partnerName,
  );
  res.json({ success: true });
});

app.post("/sendAddedClientNotification", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const { to, partnerName } = req.body;
  await sendMessageTemplate(
    to,
    'welcome',
    partnerName,
  );
  res.json({ success: true });
});

app.post("/send", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const { to, message } = req.body;
  await sendMessage(to, message);
  res.json({ success: true });
});

async function sendMessageTemplate(phoneNumber, templateName, clientName) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "template",
        template: {
          name: templateName,
          language: { code: "pt_BR" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: clientName }
              ],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Template enviado com sucesso:", response.data);
  } catch (error) {
    console.error(
      "❌ Erro ao enviar template:",
      error.response?.data || error.message
    );
  }
}

async function sendMessage(phoneNumber, text) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Mensagem enviada com sucesso:", response.data);
  } catch (error) {
    console.error(
      "Erro ao enviar mensagem:",
      error.response?.data || error.message
    );
  }
}

async function onReceiveMessage(phoneNumber, text) {
  try {
    if (text.length > 0) {
      if (!text.includes("pedido")) return;

      let words = text.trim().split(" ");

      let partnerId = words[words.length - 1];

      let data = null;

      const snapshot = await db.collection(ordersCollection).get();

      snapshot.forEach((doc) => {
        if (data !== null) return;

        if (
          doc.data().partner.id == partnerId &&
          doc.data().clientIdentifiers.length === 0
        ) {
          data = {
            id: doc.data().id,
            creationTime: doc.data().creationTime,
            lastCall: doc.data().lastCall,
            predictedTime: doc.data().predictedTime,
            clientIdentifiers: [
              ...doc.data()["clientIdentifiers"],
              phoneNumber,
            ],
            documentId: doc.data().documentId,
            partner: {
              id: doc.data().partner.id,
              name: doc.data().partner.name,
            },
          };
        }
      });

      clients = [...clients, phoneNumber];

      await db.collection(ordersCollection).doc(data.documentId).set(data);

      await sendMessageTemplate(
        phoneNumber,
        'welcome',
        data.partner.name,
      );
    }
  } catch (error) {
    if (clients.includes(phoneNumber)) {
      let newClients = clients.filter((client) => client !== phoneNumber);
      clients = newClients;
    }

    console.log("erro", "=>", error);
  }
}

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} 🚀`));
