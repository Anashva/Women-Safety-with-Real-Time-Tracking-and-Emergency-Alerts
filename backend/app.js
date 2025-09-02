const express=require('express');
const app=express();
const mongoose=require('mongoose');
const db=require('./src/config/db');
const cors=require('cors');
const userRoutes=require('./src/routes/userRoutes');
const dotenv  = require('dotenv');


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


















const PORT=8080;
app.listen(process.env.PORT || PORT,()=>{
    console.log("server is running")
})
