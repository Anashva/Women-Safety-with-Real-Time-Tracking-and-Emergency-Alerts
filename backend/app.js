const express=require('express');
const app=express();
const mongoose=require('mongoose');
const db=require('./src/config/db');
const cors=require('cors');



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







app.get('/',(req,res)=>{
    res.send("hello everyone 🙏")
})








const PORT=8080;
app.listen(PORT,()=>{
    console.log("server is running")
})
