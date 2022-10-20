const priceList = {
    burger: 5,
    shavarma: 7,
    cookies: 2,
  };
  
  module.exports = function (intent, item, quantity) {
    const total =
      intent === "Take Order - yes"
        ? priceList[`${item}`] * quantity + priceList["cookies"]
        : priceList[`${item}`] * quantity;
  
    return total;
  };