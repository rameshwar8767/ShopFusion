const InventoryLog = require("../models/InventoryLog.js");

const logMovement = async (userId, productId, type, change, newStock, note = "") => {
  await InventoryLog.create({
    user: userId,
    product: productId,
    changeType: type,
    quantityChanged: change,
    stockAfter: newStock,
    note: note
  });
};

module.exports = logMovement;