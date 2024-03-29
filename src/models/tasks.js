const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./users');

const taskSchema=new mongoose.Schema({
  description:{
    type:String,
    required:true,
    trim:true,
  },
  completed:{
    type:Boolean,
    default:false
  },
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'User'      //indicates mongoose that there is a relationship b/w Tasks and user
  }},{
    timestamps:true,
  })
const Task=mongoose.model('Task',taskSchema)

module.exports=Task;



