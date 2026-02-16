// controllers/mlController.js
const axios = require("axios");

exports.getRecommendations = async (req, res, next) => {
  try {
    // At this point protect has already run
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id; // normalized in auth.js

    const mlBaseUrl = process.env.ML_ENGINE_URL || "http://127.0.0.1:8000";

    const response = await axios.get(
      `${mlBaseUrl}/recommendations/${userId}`
    );

    return res.status(200).json({
      success: true,
      data: response.data.recommendations,
    });
  } catch (error) {
    console.error(
      "ML Engine HTTP Error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations from ML engine",
      error: error.response?.data || error.message,
    });
  }
};
