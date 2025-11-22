
const jwt = require("jsonwebtoken");
const PoliceStation = require("../models/PoliceStation");
require("dotenv").config();

const stationAuth = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded;

    const station = await PoliceStation.findById(decoded.id);
    if (!station) return res.status(401).json({ message: "Invalid station" });

    next();
  } catch (err) {
    console.error("Auth Error:", err.message); 
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = stationAuth;
