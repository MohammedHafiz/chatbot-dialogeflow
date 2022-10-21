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
  let msg_body, resultQuery,result
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
          // resultQuery = await chatbot.textQuery(msg_body, from);
          // console.log('message ::::::::::::::::::::::', resultQuery.fulfillmentText)
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

          function distance() {
            let lat1 = 10.112092428012724
            let lon1 = 76.3523477247899 
            let lat2 = 9.984466855381317
            let lon2 = 76.3121483517723
             

            // The math module contains a function
            // named toRadians which converts from
            // degrees to radians.
            lon1 = parseInt(lon1) * Math.PI / 180;
            lon2 = parseInt(lon2) * Math.PI / 180;
            lat1 = parseInt(lat1) * Math.PI / 180;
            lat2 = parseInt(lat2) * Math.PI / 180;

            console.log("lat1: " + lat1 + " lon1: " + lon1)
            console.log("lat2: " + lat2 + " lon2: " + lon2)
            // Haversine formula
            let dlon = parseInt(lon2) - parseInt(lon1);
            let dlat = parseInt(lat2) - parseInt(lat1);
            let a = Math.pow(Math.sin(dlat / 2), 2)
              + Math.cos(lat1) * Math.cos(lat2)
              * Math.pow(Math.sin(dlon / 2), 2);
            console.log("a", a)

            let c = 2 * Math.asin(Math.sqrt(a));
            console.log("c", c)

            // Radius of earth in kilometers.Use 3956
            // for mile
            let r = 6371;
            result = c * r
            // calculate the result
            console.log("result is " + result)
            return (c * r);
          }

          const distanceFunctionCall = await distance()
          console.log("distanceFunctionCall", distanceFunctionCall)
          SendTextMessage(from, phone_number_id, result)

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
          // const lat1 = req.body.entry[0].changes[0].value.messages[0].location.latitude
          // const long1 = req.body.entry[0].changes[0].value.messages[0].location.longitude



          // function distance() {
          //   const lat1 = 9.989914657534852
          //   const lon1 = 76.31635282478837
          //   const lat2 = 9.98688211319266
          //   const lon2 = 76.31682833077215

          //   // The math module contains a function
          //   // named toRadians which converts from
          //   // degrees to radians.
          //   lon1 = parseInt(lon1) * Math.PI / 180;
          //   lon2 = parseInt(lon2) * Math.PI / 180;
          //   lat1 = parseInt(lat1) * Math.PI / 180;
          //   lat2 = parseInt(lat2) * Math.PI / 180;

          //   console.log("lat1: " + lat1 + " lon1: " + lon1)
          //   console.log("lat2: " + lat2 + " lon2: " + lon2)
          //   // Haversine formula
          //   let dlon = parseInt(lon2) - parseInt(lon1);
          //   let dlat = parseInt(lat2) - parseInt(lat1);
          //   let a = Math.pow(Math.sin(dlat / 2), 2)
          //     + Math.cos(lat1) * Math.cos(lat2)
          //     * Math.pow(Math.sin(dlon / 2), 2);
          //   console.log("a", a)

          //   let c = 2 * Math.asin(Math.sqrt(a));
          //   console.log("c", c)

          //   // Radius of earth in kilometers.Use 3956
          //   // for mile
          //   let r = 6371;
          //   const result = c * r
          //   // calculate the result
          //   console.log("result is " + result)
          //   return (c * r);
          // }

          // const distanceFunctionCall = await distance()
          // console.log("distanceFunctionCall", distanceFunctionCall)
          // SendTextMessage(from, phone_number_id, result)


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
