const dotenv = require('dotenv');
dotenv.config();

const express = require("express");
const axios = require("axios");
const { db } = require("./db.js");

const ordersCollection = "orders";

let clients = [];

const app = express();
app.use(express.json());

const TOKEN = process.env.TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const API_KEY = process.env.API_KEY;

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado com sucesso!");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
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

app.post("/send", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const { to, message } = req.body;
  await sendMessage(to, message);
  res.json({ success: true });
});

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
          doc.data().partnerId == partnerId &&
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
            partnerId: doc.data().partnerId,
          };
        }
      });

      clients = [...clients, phoneNumber];

      await db
        .collection(ordersCollection)
        .doc(data.documentId)
        .set(data);

      await sendMessage(phoneNumber, "Olá, que bom ter você conosco. Fique atento, avisaremos assim que seu pedido estiver pronto");
    }
  } catch (error) {
    if (clients.includes(phoneNumber)) {
      let newClients = clients.filter((client) => client !== phoneNumber);
      clients = newClients;
    }

    console.log("erro", "=>", error);
  }
}

db.collection(ordersCollection).onSnapshot(
    async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        const document = change.doc.data();

        if (change.type === "removed") {
          let number = document.clientIdentifiers[0];

          if (clients.includes(number)) {
            let newClients = clients.filter((client) => client !== number);
            clients = newClients;
          }
          return;
        }

        if (change.type === "modified") {
          let number = document.clientIdentifiers[0];

          if (!clients.includes(number)) {
            await sendMessage(number, "Olá, que bom ter você conosco. Fique atento, avisaremos assim que seu pedido estiver pronto");
            clients = [...clients, number];
            return;
          }

          if (document.lastCall === null) {
            return;
          }

          await sendMessage(document.clientIdentifiers[0], "Seu pedido está pronto, aproveite!");
        }
      };
    },
    (error) => {
      console.error("Erro ao escutar Firestore:", error);
    }
  );

app.listen(3000, () => console.log("Servidor rodando na porta 3000 🚀"));
