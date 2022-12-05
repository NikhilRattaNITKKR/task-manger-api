const express = require('express');
require('./db/mongoose')
const userRouter=require('./routes/user');
const taskRouter=require('./routes/task');
const bcryptjs = require('bcryptjs');     //a npm module that hashes out the password (not a reversible process)
const app=express();

app.use(express.json())   //express.json is also setup to parse incoming JSON into a JavaScript object which you can access on req.body.
app.use(userRouter)
app.use(taskRouter)

module.exports=app
