const express=require('express');
const app=express();
const mongoose=require('mongoose');
const db=require('./src/config/db');
const cors=require('cors');
const userRoutes = require("./src/routes/userRoutes");

const { errorHandler } = require("./src/middleware/errorMiddleware");
mongoose.connect('mongodb://127.0.0.1:27017/Women-Safety')
.then(()=>{
    console.log("db connected")
})
.catch((err)=>{
    console.log(err);
})
app.use(cors({origin:['http://localhost:3000']}));
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/api/users", userRoutes);
app.use(errorHandler)


app.listen(8080,()=>{
    console.log("server is running")
})
