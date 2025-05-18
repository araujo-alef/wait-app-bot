import dotenv from 'dotenv';
const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { db } = require("./db.js");

const ordersCollection = "orders";

const client = new Client();

let clients = [];

dotenv.config();

client.on("qr", async (qr) => {
  qrcode.generate(qr, { small: true });

  try {
    await db.collection("sessions").doc("whatsapp").set({
      qr,
      createdAt: new Date()
    });

    console.log("QR code salvo no Firestore com sucesso!");
  } catch (err) {
    console.error("Erro ao salvar o QR code no Firestore:", err);
  }
});

client.on("ready", async () => {
  db.collection(ordersCollection).onSnapshot(
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
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
            client.sendMessage(
              number,
              "Olá, que bom ter você conosco. Fique atento, avisaremos assim que seu pedido estiver pronto"
            );

            clients = [...clients, number];
            return;
          }

          if (document.lastCall === null) {
            return;
          }

          client.sendMessage(
            document.clientIdentifiers[0],
            "Seu pedido está pronto, aproveite!"
          );
        }
      });
    },
    (error) => {
      console.error("Erro ao escutar Firestore:", error);
    }
  );
});

client.on("message_create", async (message) => {
  let messageContent = message.body;
  let messageNumber = message.from;

  try {
    /*   let messageContent =
      "Oi, me avise quando meu pedido estiver pronto: qqxtPckIMpcLNn37riZNxMQgbDs2";
    let messageNumber = "554184719699@c.us"; */

    if (messageContent.length > 0) {
      if (!messageContent.includes("pedido")) return;

      let words = messageContent.trim().split(" ");

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
              messageNumber,
            ],
            documentId: doc.data().documentId,
            partnerId: doc.data().partnerId,
          };
        }
      });

      clients = [...clients, messageNumber];

      const resposta = await db
        .collection(ordersCollection)
        .doc(data.documentId)
        .set(data);

      client.sendMessage(
        messageNumber,
        "Olá, que bom ter você conosco. Fique atento, avisaremos assim que seu pedido estiver pronto"
      );
    }
  } catch (error) {
    if (clients.includes(messageNumber)) {
      let newClients = clients.filter((client) => client !== messageNumber);
      clients = newClients;
    }

    console.log("erro", "=>", error);
  }
});

client.initialize();
