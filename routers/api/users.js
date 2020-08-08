const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")//加密
const jwt = require("jsonwebtoken")
const gravatar = require("gravatar")
const keys = require("../../config/keys")
const passport = require("passport")

const User = require("../../models/User")

//test
router.get("/test",(req,res) =>{
  res.json({msg:"Login works"})
})

//api/users/register 注册
router.post("/register",(req,res) =>{
  // console.log(req.body)
  User.findOne({email:req.body.email})
      .then((user) => {
        if(user){
          return res.status(400).json("邮箱已被占用！")
        }else{
          const avatar = gravatar.url(req.body.email,{s:"200",r:"pg",d:"mm"})
          const newUser = new User({
            name:req.body.name,
            email:req.body.email,
            avatar,
            password:req.body.password,
            identity:req.body.identity
          })

          //密码加密
          bcrypt.genSalt(10,function (err,salt) {
            bcrypt.hash(newUser.password,salt, (err,hash) =>{
              if(err) throw err;
              newUser.password = hash
              newUser.save()
                  .then(user => res.json(user))
                  .catch(err => console.log(err))
            })

          })
        }
      })
})

//api/users/login 登录
router.post("/login",(req,res) =>{
  const email = req.body.email;
  const password = req.body.password
  //查询数据库
  User.findOne({email})
      .then(user =>{
        if(!user){
          return res.status(404).json("用户名不存在！")
        }
        //密码匹配
        bcrypt.compare(password,user.password)
            .then(isMatch => {
              if(isMatch){
                const rule = {
                  id:user.id,
                  name:user.name,
                  avatar:user.avatar,
                  identity:user.identity
                }
                // jwt.sign("规则","加密名字","过期时间","箭头函数")
                jwt.sign(rule,keys.secretOrKey,{expiresIn:3600},(err,token) =>{
                  if(err) throw err
                  res.json({
                    success:true,
                    token:"Bearer " + token
                  })
                })
                // res.json({msg:"success"})
              }else {
                return res.status(400).json("密码错误！")
              }
            })
      })
})

//api/users/current 验证token
router.get(
    "/current",
   passport.authenticate("jwt",{ session:false}),
    (req,res) =>{
      res.json({
        // msg:"success"
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        identity: req.user.identity
      })
})

module.exports = router
