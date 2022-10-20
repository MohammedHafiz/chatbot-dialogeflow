const express = require("express");
const app = express();

const { WebhookClient } = require("dialogflow-fulfillment");
const getPrice = require("./helpers");

app.get("/", (req, res) => {
  res.send("Hi from server!");
});

app.post("/", express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  function handleIntent(agent) {
    const intent = agent.intent;
    const item = agent.contexts[0].parameters.item;
    const quantity = agent.contexts[0].parameters.quantity;
    const billingAmount = getPrice(intent, item, quantity);

    const response =
      intent === "Take Order - yes"
        ? `Great! Your ${quantity} ${item} and cookies will be ready in no time. Please pay ${billingAmount}$.`
        : `Okay! Your ${quantity} ${item} will be ready in no time. Please pay ${billingAmount}$.`;

    agent.add(response);
  }

  const intentMap = new Map();
  intentMap.set("Take Order - yes", handleIntent);
  intentMap.set("Take Order - no", handleIntent);
  agent.handleRequest(intentMap);
});

app.listen(8080, () => {
  console.log("server running...");
});