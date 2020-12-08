const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');     //a npm module that hashes out the password (not a reversible process)
const jsonwebtoken = require('jsonwebtoken');
const Task = require('./tasks');

const userSchema=new mongoose.Schema({   //creates a schema which allows us to run middleware
  name:{
    type:String,
    required:true,
    trim:true,
  },
  email:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    lowercase:true,
    validate(value){
      if (!validator.isEmail(value)) {
        throw new Error('email is invalid');
      }
    }
  },
  age:{
    type:Number,
    default:0,
    validate(value){
      if (value<0) {
        throw new Error('age must be positive');
      }
    }
  },
  password:{
    type:String,
    required:true,
    trim:true,
    minlength:7,
    validate(value){
      if (value.includes('password')) {
        throw new Error('It mustnt include password');
      }
    }
  },
  tokens:[{
    token:{
      type:String,
      required:true
    }
  }],
  avatar:{
    type:Buffer,
    contentType:'image/png',
  }
},{
  timestamps:true,
})

userSchema.virtual('tasks',{   //sets up a 'virtual' field on the User
  ref:'Task',
  localField:'_id',          //where that value is stored here
  foreignField:'owner'      //name of the field where a value is stored
})

userSchema.methods.generateAuthToken=async function(){  //definining on methods gives us access to use it on the instance while on statics we use it on the model
  const user=this;
  const token=jsonwebtoken.sign({_id:user._id.toString()},process.env.JWT_SECRET);  //sign function defines a an authentication token with our special string that would be a secret
  user.tokens=user.tokens.concat({token});
  await user.save();
  return token;
}

userSchema.methods.toJSON=function () {    //defines a function property on the user object that runs automatically When a Mongoose document is passed to res.send, Mongoose converts the object intoJSON.
  const user=this;
  const userObject=user.toObject();
  delete userObject.tokens;
  delete userObject.password;
  delete userObject.avatar;
  return userObject;
}

userSchema.statics.findByCredentials=async (email,password)=>{   //allows us to create our own functions whic we can access in the model
  const user=await User.findOne({email:email});
  if (!user) {
    throw new Error('User does not exist');
  }
  const isMatch=await bcryptjs.compare(password,user.password)
  if (!isMatch) {
    throw new Error('Unable to login');

  }
return user;
}
userSchema.pre('save',async function (next) {    //sets up a function to run before a specific operation is performed
  const user= this;
  if (user.isModified('password')) {
    user.password=await bcryptjs.hash(user.password,8) //no. of round to run the hashing algo
  }
  next()

})
userSchema.pre('remove',async function (next) {
  const user=this;
  await Task.deleteMany({owner:user._id})

  next()
})
const User=mongoose.model('User',userSchema)

module.exports=User;
