const jwt = require("jsonwebtoken");
const PoliceStation = require("../models/PoliceStation");

const stationAuth =  async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    // Remove "Bearer " if it exists
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    const decoded = jwt.verify(token, "secretKey");
    req.user = decoded;

    const station = await PoliceStation.findById(decoded.id);
    if (!station) return res.status(401).json({ message: "Invalid station" });

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};
module.exports = stationAuth;