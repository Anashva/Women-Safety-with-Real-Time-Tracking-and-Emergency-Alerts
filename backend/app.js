
const express = require('express');
const http = require("http");
const socketio = require("socket.io");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const userRoutes = require('./src/routes/userRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const policeRoutes = require('./src/routes/policeRoutes');

dotenv.config();
const app = express();

app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// CREATE SERVER + SOCKET.IO
// ===============================
const server = http.createServer(app);
const io = socketio(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET","POST"], credentials: true }
});

// Make io globally accessible
app.set("io", io);

// ===============================
// GLOBAL SOCKET STORAGE
// ===============================
global.activePoliceSockets = {}; // stationId -> Set<socketIds>
global.activeUserSockets = {};   // userId -> Set<socketIds>

// ===============================
// SOCKET.IO CONNECTION
// ===============================
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // -------------------- POLICE LOGIN --------------------
  socket.on("joinPolice", async (stationId) => {
    if (!stationId) return;
    socket.join(stationId.toString());

    if (!global.activePoliceSockets[stationId]) global.activePoliceSockets[stationId] = new Set();
    global.activePoliceSockets[stationId].add(socket.id);

    const PoliceStation = require("./src/models/PoliceStation");
    await PoliceStation.findByIdAndUpdate(stationId, { status: "online" });

    console.log(`Police joined: ${stationId} (${global.activePoliceSockets[stationId].size} active)`);

    socket.on("disconnect", async () => {
      global.activePoliceSockets[stationId].delete(socket.id);
      if (global.activePoliceSockets[stationId].size === 0) {
        await PoliceStation.findByIdAndUpdate(stationId, { status: "offline" });
      }
      console.log(`Police disconnected: ${stationId}`);
    });
  });

  // -------------------- USER LOGIN --------------------
  socket.on("joinUser", (userId) => {
    if (!userId) return;
    socket.join(userId.toString());

    if (!global.activeUserSockets[userId]) global.activeUserSockets[userId] = new Set();
    global.activeUserSockets[userId].add(socket.id);

    console.log(`User joined: ${userId}`);

    socket.on("disconnect", () => {
      global.activeUserSockets[userId].delete(socket.id);
      console.log(`User disconnected: ${userId}`);
    });
  });
});

// ===============================
// ROUTES
// ===============================
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/police', policeRoutes);

// ===============================
// DATABASE CONNECTION
// ===============================
mongoose.connect("mongodb://127.0.0.1:27017/Women-Safety")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
