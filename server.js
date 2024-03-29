const express = require("express");
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const dialogflow = require('dialogflow');
const chatbot = require('./chatbot/chatbot')
const token = "EAALjc2bbXNwBAGL29Sb6RPCn32ZB3yEOdhlZBPoftAFg9V7CcILpZCZBQPsEyNJZC6D0XvZA7LNJqnSeNd66ideTjatbCv68i50IlsOuIWYO3kEReRFXV3mywDtZB8A0rjQZA2NPBzDKfk65tSpNEbZAfHK5Q1pV7oxaVGn3bkaf0HY3G0uSYLIbKtXcIQnGIj1w6nArGtMEILTkatEyxxlZAD";
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
  console.log("inside list message function", to, phone_number_id, body, rows);
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

const SendButtonMessage = async (to, phone_number_id, body, buttonContent) => {
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
          "type": "button",
          "body": {
            "text": body
          },
          "action": {
            "buttons": buttonContent
          }
        }
      },
      headers: {
        "Content-Type": "application/json"
      },
    });
  } catch (e) {
    console.error("SendButtonMessage Error", e)
  }
}


const SendTemplateMessage = async (to, phone_number_id) => {
  try {
    await axios({
      method: "POST",
      url: "https://graph.facebook.com/v12.0/" + phone_number_id + "/messages?access_token=" + token,
      data: {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "template",
        "template": {
          "name": "sample_check",
          "language": {
            "code": "en_US"
          }
        }
      },
      headers: {
        "Content-Type": "application/json"
      },
    });
  } catch (e) {
    console.error("SendTemplateMessage Error", e)
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
  let msg_body, resultQuery, result
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
      console.log("from",from)
      console.log("msg_type",msg_type)

      switch (msg_type) {
        case "text":
          msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
          console.log("msg_body",msg_body)
          resultQuery = await chatbot.textQuery(msg_body, from);
          console.log('message ::::::::::::::::::::::', resultQuery.fulfillmentText)
          // SendTextMessage(from, phone_number_id, resultQuery.fulfillmentText)
          // SendListMessage(from, phone_number_id, "This is a list demo",
          //   [{
          //     id: "1",
          //     title: "yes"
          //   },
          //   {
          //     id: "2",
          //     title: "no"
          //   }]
          // )

          //   


          SendTextMessage(from, phone_number_id, resultQuery.fulfillmentText)

          break;
        case "interactive":
          if (req.body.entry[0].changes[0].value.messages[0].interactive.list_reply) {
            msg_body = req.body.entry[0].changes[0].value.messages[0].interactive.list_reply.title
          } else {
            msg_body = req.body.entry[0].changes[0].value.messages[0].interactive.button_reply.title
          }
          resultQuery = await chatbot.textQuery(msg_body, from);
          console.log('message ::::::::::::::::::::::', resultQuery.fulfillmentText)
          SendListMessage(from, phone_number_id, "This is a list demo",
            [{
              id: "1",
              title: "test 1"
            },
            {
              id: "2",
              title: "test 2"
            }]
          )
          break;
        case "location":
          const latitude = req.body.entry[0].changes[0].value.messages[0].location.latitude
          const longtitude = req.body.entry[0].changes[0].value.messages[0].location.longitude
          console.log("latitude",latitude)
          console.log("latitude",typeof(latitude))
          console.log("longtitude",longtitude)
          console.log("longtitude",typeof(longtitude))



          function distance() {
            let lat1 = 9.99011541467442 
            let lon1 = 76.31629918060837
            let lat2 = latitude
            let lon2 = longtitude


            lon1 = lon1 * Math.PI / 180;
            lon2 = lon2 * Math.PI / 180;
            lat1 = lat1 * Math.PI / 180;
            lat2 = lat2 * Math.PI / 180;

            console.log("lat1: " + lat1 + " lon1: " + lon1)
            console.log("lat2: " + lat2 + " lon2: " + lon2)

            // Haversine formula
            let dlon = (lon2) - (lon1);
            let dlat = (lat2) - (lat1);
            let a = Math.pow(Math.sin(dlat / 2), 2)
              + Math.cos(lat1) * Math.cos(lat2)
              * Math.pow(Math.sin(dlon / 2), 2);
            console.log("a", a)

            let c = 2 * Math.asin(Math.sqrt(a));
            console.log("c", c)


            let r = 6371;
            result = c * r
            console.log("result in km " + result)
            return (c * r);
          }

          const distanceFunctionCall = await distance()
          if (result < 5) {
            SendTextMessage(from, phone_number_id,
              `Click on the link below to see all the available food items.

https://restaurant-whatsapp-business-woad.vercel.app`
            )
          } else {
            SendTextMessage(from, phone_number_id, "Distance is above 5km we cannot deliver the item")
          }



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
