const express = require('express');
const User = require('../models/users');
const auth=require('../middleware/auth')
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail } = require('../email/accounts');
const { sendDeleteEmail } = require('../email/accounts');


const router=new express.Router();       //creates a new router object basically it contains all the functions we need like get,post,delete.patchs

router.post('/users',async (req,res)=>{

try {
  const user=User(req.body);
  sendWelcomeEmail(user.email,user.name);
  const token=await user.generateAuthToken();
  await user.save();
  res.status(201).send({user,token});
} catch (e) {
  res.status(400).send(e)
}
})

router.post('/users/login',async(req,res)=>{
  try {
    const user=await User.findByCredentials(req.body.email,req.body.password);
    const token=await user.generateAuthToken();
  await res.send({user,token})
  } catch (e) {
    res.status(400).send(e);

  }
})


router.post('/users/logout',auth,async (req,res)=>{
try {
  req.user.tokens=req.user.tokens.filter((token)=>{
    return token.token !==req.token;
  })
await  req.user.save();
  res.send()
} catch (e) {
res.status(500).send();
}
})


router.post('/users/logoutall',auth,async (req,res)=>{
  try {
    req.user.tokens=[];
  await req.user.save();
    res.send()
  } catch (e) {
    res.status(500).send();
  }
})


router.get('/users/me',auth,async (req,res)=>{       //we can pass middleware as the 2nd arhument if we want to run it for specific routes
  res.send(req.user);
})

/*
router.get('/users/:id',async (req,res)=>{

  const _id=req.params.id;
  try {
    const user =await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user)
  } catch (e) {
    res.status(500).send(e)
}
})*/



router.patch('/users/me',auth,async (req,res)=>{     //patch is used for updating data

  const updates = Object.keys(req.body)  //.keys method returns an array containing every key
const allowedUpdates = ['name', 'email', 'password', 'age']   //array to store the properties we want to update
const isValidOperation = updates.every((update) =>          //every method runs an operation on each array element and returns true only if all of them succeed(returns true)
allowedUpdates.includes(update))
if (!isValidOperation) {
 return res.status(400).send({ error: 'Invalid updates!' })
}
  try {

    updates.forEach((update, i) => {        //we have to do it a more traditional way to be able to use middleware
        req.user[update]=req.body[update];
    });

    await req.user.save()
    return res.send(req.user);

    //const user =await User.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true});    //takes three args id , update details and options array

  } catch (e) {
    res.status(400).send(e)
}
})

router.delete('/users/me',auth,async (req,res)=>{

  const _id=req.user._id;
  try {
      await req.user.remove();
      sendDeleteEmail(req.user.email,req.user.name);
      res.send(req.user);

  } catch (e) {
    res.status(500).send(e);
}
})

const avatar=multer({        //initializing the multer function with an options array
  // dest:'avatar',             //tells it where to store them if isnt specified it stores it on req.file.buffer
  limits:{
    fileSize:1000000,         //limits the size of file to 1mb
  },fileFilter(req,file,cb){
    if (!(file.originalname.endsWith('.jpeg')||file.originalname.endsWith('.jpg')||file.originalname.endsWith('.png'))) {
        return cb(new Error('please select an image'));
    }
    cb(undefined,true)
  }
  /*
  fileFilter(req,file,cb){       //its a function that runs to fiulter files automatically we get access to request, file objects and a callback function
    if (!(file.originalname.endsWith('.docx')||file.originalname.endsWith('.doc'))) {  //checks if the file ends with that extension
      return cb(new Error('please select a document'));                        //first arg of callback is used to throw errors
    }
    cb(undefined,true)                                                               //second arg tells whether to accept or reject the file
  }
  */


})

router.post('/users/me/avatar',auth,avatar.single('avatar'),async (req,res)=>{    //we get access to middleware single which takes the name of the key which it looks to search for the file
  const buffer= await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
  req.user.avatar=buffer;
  await req.user.save();
  res.status(200).send();
},(error,req,res,next)=>{                                            //a fourth argument that setsup our own error handling function as oppose to the standard one
  res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
  req.user.avatar=undefined;
  await req.user.save();
  res.status(200).send();
})

router.get('/users/:id/avatar',async (req,res)=>{
try {
  const user=await User.findById(req.params.id);
    if (!user||!user.avatar) {
      throw new Error();
    }
    res.set('Content-Type', 'image/png') //here we set the response header Content-Type to image/png
    res.send(user.avatar);
} catch (e) {
  res.status(404).send(e);
}
})

module.exports=router;
