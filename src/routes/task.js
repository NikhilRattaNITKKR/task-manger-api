const express = require('express');
const Task = require('../models/tasks');
const auth= require('../middleware/auth');

const router=new express.Router();       //creates a new router object basically it contains all the functions we need like get,post,delete.patchs

router.post('/tasks',auth,async (req,res)=>{
try{
  const task=new Task({
    ...req.body, //copying everything in that object to this one
    owner:req.user._id,
  });
  await task.save();
  res.status(201).send(task);
}catch(e){
  res.status(400).send(e);
}
})

router.get('/tasks',auth,async (req,res)=>{

  var match={};
  var sort={};
  if (req.query.completed) {
    match.completed=req.query.completed==='true'
  }
  if (req.query.sortBy) {
    const parts=req.query.sortBy.split(':')//splits the string into two parts and stores it into an array by the special character
    sort[parts[0]]=parts[1]==='desc'? -1:1  //using ternary operator to check the order

  }
try{
  await  req.user.populate({
  path:'tasks',
  match,
  options:{
    limit:parseInt(req.query.limit),
    skip:parseInt(req.query.skip),
    sort
  }
  }).execPopulate() //Task.find({owner:req.user._id}
        res.send(req.user.tasks)
}
catch(e){
    res.status(500).send(e);
  }
})

router.get('/tasks/:id',auth,async (req,res)=>{
  const _id=req.params.id;
  try{
    const task=await Task.findOne({_id,owner:req.user._id});
  if (!task) {
      return res.status(404).send();
    }
    res.send(task)
  }catch(e){
    res.status(500).send(e)
  }
})

router.patch('/tasks/:id',auth,async (req,res)=>{

  const updates=Object.keys(req.body);
  const allowedUpdates = ['description','completed'];
  const isValidOperation = updates.every((update) =>
  allowedUpdates.includes(update))

  if (!isValidOperation) {
   return res.status(400).send({ error: 'Invalid updates!' })
  }

  const _id=req.params.id;
  try{
    const task=await Task.findOne({_id,owner:req.user._id});
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update, i) => {
      task[update]=req.body[update];
    });
    await task.save();
    res.send(task)
  }catch(e){
    res.status(500).send(e)
  }
})

router.delete('/tasks/:id',auth,async (req,res)=>{

  const _id=req.params.id;
  try{
    const task=await Task.findOneAndDelete({_id,owner:req.user._id});

    if (!task) {
      return res.status(404).send();
    }
    res.send(task)
  }catch(e){
    res.status(500).send(e)
  }
})

module.exports=router;
