const express = require('express');
require('./db/mongoose')
const userRouter=require('./routes/user');
const taskRouter=require('./routes/task');
const bcryptjs = require('bcryptjs');     //a npm module that hashes out the password (not a reversible process)
const app=express();
const port=process.env.PORT;

/*

app.use((req,res,next)=>{     //here we are registering a new middleware(a function to run before route handlers)
  next()                      //tells it that now it can run route handler if its not run it wont
})

app.use((req,res,next)=>{
  res.status(503).send('Sorry the site is under Maintenance')
})
*/


app.use(express.json())   //express.json is also setup to parse incoming JSON into a JavaScript object which you can access on req.body.
app.use(userRouter)
app.use(taskRouter)



app.listen(port,()=>{
  console.log('server is running');
})
