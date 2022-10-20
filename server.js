const express = require("express");
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const dialogflow = require('dialogflow');
const chatbot = require('./chatbot/chatbot')
const token = "EAALjc2bbXNwBAG0MAo8CfzzrAK0c14C5WeEZCRO0iNeJE9DxCHpiErJhlr8jmIqNw08kt5JtKUDpZAZB9hQ7ZAzafnJ7tm2MR3SdqwzS5HfZABWerEjGCgBaujSEyLO7JWTzlRLAyYZCQX6VwCZCArWfmZBeIu5ZCUTLhGsOeSOwWcUY6ovrCBYt7O5iBJtYAGJAft24TeesE0yAfmR7u91Eu";
const axios = require("axios").default;


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
  console.log('message : cd ', resultQuery.fulfillmentText)
  res.status(200).json({ success: true, message: resultQuery.fulfillmentText })
})

app.post("/webhook", async(req, res) => {
  console.log("inside webhook!!!!!!!!!!!!!!!!!!!!!!!!!")
  let body = req.body;

  console.log("req.body####################################",JSON.stringify(body, null, 2));

  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
     

      const resultQuery = await chatbot.textQuery(msg_body, from);
      console.log('message :', resultQuery.fulfillmentText)

      
      axios({
        method: "POST", 
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: { body: resultQuery.fulfillmentText },
        },
        headers: { "Content-Type": "application/json" },
      });
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
