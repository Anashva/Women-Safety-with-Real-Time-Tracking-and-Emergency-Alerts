const express=require('express');
const app=express();
const http = require("http");
const socketio = require("socket.io");

const mongoose=require('mongoose');
// const db=require('./src/config/db');
const cors=require('cors');
const userRoutes=require('./src/routes/userRoutes');
const dotenv  = require('dotenv');
const alertRoutes=require('./src/routes/alertRoutes')
const policeRoutes=require('./src/routes/policeRoutes');
const path = require('path');

const server = http.createServer(app);
const io = socketio(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"], credentials: true  },
});



app.set("io", io); 


// ===============================
// GLOBAL SOCKET STORAGE
// ===============================
global.activePoliceSockets = {}; // stationId -> Set<socketIds>
global.activeUserSockets = {};   // userId -> Set<socketIds>


// Track connected police
io.on("connection", (socket) => {
  // console.log("Police connected:", socket.id);
  console.log(" police Socket connected:", socket.id);


  socket.on("joinPolice", async (stationId) => {
    // socket.join("onlinePolice");
    if (!stationId) return;
    socket.join(stationId.toString());
    console.log(`Police ${stationId} joined`);


    if (!global.activePoliceSockets[stationId]) global.activePoliceSockets[stationId] = new Set();
    global.activePoliceSockets[stationId].add(socket.id);

    const PoliceStation = require("./src/models/PoliceStation");
    await PoliceStation.findByIdAndUpdate(stationId, { status: "online" });

    console.log(`Police joined: ${stationId} (${global.activePoliceSockets[stationId].size} active)`)


    socket.on("disconnect", async () => {
      global.activePoliceSockets[stationId].delete(socket.id);
      if (global.activePoliceSockets[stationId].size === 0) {
        await PoliceStation.findByIdAndUpdate(stationId, { status: "offline" });
      }
      console.log(`Police disconnected: ${stationId}`);
    });
  });




  // ser joins their own room
  socket.on("joinUser", (userId) => {
    // socket.join(userId);
    // console.log(`User ${userId} joined`);

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


  // socket.on("disconnect", () => {
  //   console.log("Police disconnected");
  // });
});





dotenv.config();








// databse connection
mongoose.connect('mongodb://127.0.0.1:27017/Women-Safety')
.then(()=>{
    console.log("db connected");

})
.catch((err)=>{
    console.log(err);
})





// middleware
// app.use(cors({origin:['http://localhost:3000']}));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['Content-Range', 'Content-Length', 'Content-Type']
}));
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/uploads', (req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Accept-Ranges', 'bytes');
  
  // Set proper content type based on file extension
  const ext = req.path.split('.').pop().toLowerCase();
  if (ext === 'webm') {
    res.header('Content-Type', 'video/webm');
  }
  
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  acceptRanges: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// app.get('/',(req,res)=>{
//     res.send("hello everyone 🙏")
// })


// Debug endpoint to test file serving
app.get('/test-upload', (req, res) => {
  const fs = require('fs');
  const files = fs.readdirSync('./uploads');
  res.json({
    message: 'Files in uploads folder',
    files: files,
    path: path.join(__dirname, 'uploads')
  });
});

// routes
app.use('/api/users',userRoutes);
app.use('/api/alerts',alertRoutes);
app.use('/api/police',policeRoutes)
















const PORT=8080;
server.listen(process.env.PORT || PORT,()=>{
    console.log("server is running")
})
