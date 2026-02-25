const mongoose = require("mongoose");
const InventoryLog = require("./models/InventoryLog"); // Adjust path
const Product = require("./models/Product");       // Adjust path
const User = require("./models/User");             // Adjust path
require("dotenv").config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected for seeding...");

    // 1. Get a valid user and some products from your DB
    const user = await User.findOne(); 
    const products = await Product.find().limit(3);

    if (!user || products.length === 0) {
      console.log("Error: You need at least one user and one product in your DB first!");
      process.exit();
    }

    // 2. Clear existing logs (Optional)
    await InventoryLog.deleteMany({ user: user._id });

    // 3. Define dummy movements
    const dummyLogs = [
      {
        user: user._id,
        product: products[0]._id,
        changeType: "RESTOCK",
        quantityChanged: 50,
        stockAfter: 150,
        note: "Bulk shipment received"
      },
      {
        user: user._id,
        product: products[0]._id,
        changeType: "SALE",
        quantityChanged: -10,
        stockAfter: 140,
        note: "Order #1002"
      },
      {
        user: user._id,
        product: products[1] ? products[1]._id : products[0]._id,
        changeType: "EXPIRED",
        quantityChanged: -5,
        stockAfter: 25,
        note: "Damaged packaging"
      },
      {
        user: user._id,
        product: products[2] ? products[2]._id : products[0]._id,
        changeType: "RETURN",
        quantityChanged: 2,
        stockAfter: 12,
        note: "Customer return - unused"
      }
    ];

    await InventoryLog.insertMany(dummyLogs);
    console.log("Successfully seeded 4 inventory logs!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();