const User = require('../models/users');
const jbt= require('jsonwebtoken')

const auth=async (req,res,next)=>{

  try {
    const token=req.header('Authorization').replace('Bearer ','')
    const decoded=jbt.verify(token,process.env.JWT_SECRET);
    const user=await User.findOne({_id:decoded._id,'tokens.token':token})  //we are using second arg name in quotes because we are using a special character inside it
    if(!user){
      throw new Error()
    }
    req.token=token;
    req.user=user;
  } catch (e) {
    res.status(401).send('Please authenticate')
  }
  next()
}


module.exports=auth;
