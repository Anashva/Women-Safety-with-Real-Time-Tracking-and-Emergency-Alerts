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


const server = http.createServer(app);
const io = socketio(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

app.set("io", io); 

// Track connected police
io.on("connection", (socket) => {
  console.log("Police connected:", socket.id);

  socket.on("joinPolice", (stationId) => {
    socket.join("onlinePolice");
    console.log(`Police ${stationId} joined`);
  });

  // ser joins their own room
  socket.on("joinUser", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined`);
  });


  socket.on("disconnect", () => {
    console.log("Police disconnected");
  });
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
app.use(cors({origin:['http://localhost:3000']}));
app.use(express.json())
app.use(express.urlencoded({extended:true}))





// app.get('/',(req,res)=>{
//     res.send("hello everyone 🙏")
// })




// routes
app.use('/api/users',userRoutes);
app.use('/api/alerts',alertRoutes);
app.use('/api/police',policeRoutes)
















const PORT=8080;
server.listen(process.env.PORT || PORT,()=>{
    console.log("server is running")
})
