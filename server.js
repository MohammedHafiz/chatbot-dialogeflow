const express = require("express");
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const dialogflow = require('dialogflow');
const chatbot = require('./chatbot/chatbot')
const token = "EAALjc2bbXNwBAJvyhXJTS0xQvA7Tj2PHWsoFsJZAOagEVsOuixZAy7ZAR6GLH9OsQcyzi8wVaiLL6RIitUgrZBsp714ng9ZCXeD4kjRLvf7aI2NyzZAOi7zIJcN4yhC8kSc43ShXZCcISxpEMWJHckOMz9DhZAxXEKIvaRqgirjrlkH8IBcrUli3ddJFkroYJ7NnemscG1jefNraArEp0JQ7";
const axios = require("axios").default;


const SendTextMessage = async (to, phone_number_id, body) => {
  await axios({
    method: "POST",
    url: "https://graph.facebook.com/v12.0/" + phone_number_id + "/messages?access_token=" + token,
    data: {
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": to,
      "type": "text",
      "text": {
        "body": body
      }
    },
    headers: {
      "Content-Type": "application/json"
    },
  });
}

const SendListMessage = async (to, phone_number_id, body, rows) => {
  console.log("inside list message function")
  try {
    await axios({
      method: "POST",
      url: "https://graph.facebook.com/v12.0/" + phone_number_id + "/messages?access_token=" + token,
      data: {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "interactive",
        "interactive": {
          "type": "list",
          "body": {
            "text": body
          },
          "action": {
            "button": "Click here to Select",
            "sections": [

              {
                "title": "List Item",
                "rows": rows
              }
            ]
          }
        }
      },
      headers: {
        "Content-Type": "application/json"
      },
    });
  } catch (e) {
    console.error("SendListMessage Error", e)
  }
}



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.send("Hi from server!");
});

app.get('/chat', (req, res) => {
  res.send("Hi from chat box!");

})
app.post('/chat', async (req, res) => {
  const { text, userId } = req.body;
  const resultQuery = await chatbot.textQuery(text, userId);
  console.log('message : ', resultQuery.fulfillmentText)
  res.status(200).json({ success: true, message: resultQuery.fulfillmentText })
})

app.post("/webhook", async (req, res) => {
  console.log("inside webhook!!!!!!!!!!!!!!!!!!!!!!!!!")
  let body = req.body;
  let msg_body, resultQuery

  console.log("req.body####################################", JSON.stringify(body, null, 2));

  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let msg_type = req.body.entry[0].changes[0].value.messages[0].type;

      switch (msg_type) {
        case "text":
          msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
          resultQuery = await chatbot.textQuery(msg_body, from);
          console.log('message ::::::::::::::::::::::', resultQuery.fulfillmentText)
          // SendTextMessage(from, phone_number_id, resultQuery.fulfillmentText)
          SendListMessage(from, phone_number_id, "This is a list demo",
            [{
              id: "1",
              title: resultQuery.fulfillmentText
            },
            {
              id: "2",
              title: resultQuery.fulfillmentText
            }]
          )

          break;
        case "interactive":
          if (req.body.entry[0].changes[0].value.messages[0].interactive.list_reply) {
            msg_body = req.body.entry[0].changes[0].value.messages[0].interactive.list_reply.title
          } else {
            msg_body = req.body.entry[0].changes[0].value.messages[0].interactive.button_reply.title
          }
          resultQuery = await chatbot.textQuery(msg_body, from);
          console.log('message ::::::::::::::::::::::', resultQuery.fulfillmentText)
          SendListMessage(phone_number, phone_number_id, "This is a list demo",
            [{
              id: "1",
              title: resultQuery.fulfillmentText
            },
            {
              id: "2",
              title: resultQuery.fulfillmentText
            }]
          )
          break;
        case "location":
          const latitude = req.body.entry[0].changes[0].value.messages[0].location.latitude
          const longitude = req.body.entry[0].changes[0].value.messages[0].location.longitude
          msg_body = `${latitude},${longitude}`
          resultQuery = await chatbot.textQuery(msg_body, from);
          console.log('message ::::::::::::::::::::::', resultQuery.fulfillmentText)
          SendTextMessage(from, phone_number_id, resultQuery.fulfillmentText)


      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});


app.get("/webhook", (req, res) => {

  console.log("inside webhook")
  const verify_token = "blue_panda";

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});


app.listen(port, () => {
  console.log("server running!!")
});
