const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const passport = require("passport")
const app = express()

//引入user.js
const users = require("./routers/api/users")
//引入profile.js
const profiles = require("./routers/api/profiles")

//使用body-parser中间件
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())



mongoose.connect('mongodb://localhost:27017/fms_api');
//得到数据库连接句柄
const db = mongoose.connection;
//通过数据库连接句柄，监听mongoose数据库成功的事件
db.on('open',function(err){
  if(err){
    console.log('数据库连接失败');
    throw err;
  }
  console.log('数据库连接成功')
})

//passport 初始化
app.use(passport.initialize())
require("./config/passport")(passport);

app.get("/",(req,res) =>{
  res.send("Hello World!")
})
//使用routers
app.use("/api/users",users)
app.use("/api/profiles",profiles)

const port = process.env.PORT || 5000

app.listen(port,() =>{
  console.log(`Server running on port ${port}`)
})
