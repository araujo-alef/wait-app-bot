const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { db } = require('./db.js');

const ordersCollection = "orders";

const client = new Client();

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

client.on("ready", async () => {
  console.log("Client is ready!");

  db.collection(ordersCollection).onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if(change.type === 'modified') {
        const document = change.doc.data();
        
        if (document.lastCall === null) {
          return;
        }

        client.sendMessage(
          document.clientIdentifiers[0],
          "Seu pedido está pronto, aproveite!"
        );
      }
    })
  }, (error) => {
    console.error("Erro ao escutar Firestore:", error);
  });
});

client.on("message_create", async (message) => {
  try {
    let messageContent = message.body;
    let messageNumber = message.from;

    /*   let messageContent =
      "Oi, me avise quando meu pedido estiver pronto: qqxtPckIMpcLNn37riZNxMQgbDs2";
    let messageNumber = "554184719699@c.us"; */

    console.log(messageContent);

    if (messageContent.length > 0) {
      if(!messageContent.includes("pedido")) return;

      let words = messageContent.trim().split(" ");

      let partnerId = words[words.length - 1];

      let data = null;

      const snapshot = await db.collection(ordersCollection).get();

      snapshot.forEach((doc) => {
        if (data !== null) return;

        if (doc.data().partnerId == partnerId) {
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
            partnerId: doc.data().documentId,
          };
        }
      });

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
    console.log("erro", "=>", error);
  }
});

client.initialize();
