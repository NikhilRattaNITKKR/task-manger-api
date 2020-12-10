const User=require('../../src/models/users');
const Task=require('../../src/models/tasks');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


const userOneId= new mongoose.Types.ObjectId();
const userOne={
  _id:userOneId,
  name:'Nick',
  email:'nicklodean@gmail.com',
  password:'1234567890',
  tokens:[{
    token:jwt.sign({_id:userOneId},process.env.JWT_SECRET)
  }]
}

const userTwoId= new mongoose.Types.ObjectId();
const userTwo={
  _id:userTwoId,
  name:'Nicky Minaj',
  email:'nicklodean123@gmail.com',
  password:'123451233',
  tokens:[{
    token:jwt.sign({_id:userTwoId},process.env.JWT_SECRET)
  }]
}

const taskOne={
  _id:new mongoose.Types.ObjectId(),
  description:'First Task',
  completed:false,
  owner:userOneId
}

const taskTwo={
  _id:new mongoose.Types.ObjectId(),
  description:'Second Task',
  completed:true,
  owner:userOneId
}

const taskThree={
  _id:new mongoose.Types.ObjectId(),
  description:'Third Task',
  completed:false,
  owner:userTwoId
}

const setUpDB=async ()=>{
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
}

module.exports={
  setUpDB,
  userOne,
  userOneId,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree
}
