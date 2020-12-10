const app = require('../src/app');
const request = require('supertest');
const User=require('../src/models/users');
const { setUpDB,userOne,userOneId } = require('./fixtures/db');


beforeEach(setUpDB)

test('Should create a user',async ()=>{      //its a global function that is available on files that have .test in the name ,takes the name of the test and a function to run the test
  const response=await request(app).post('/users').send({
    name:'Nikhil Ratta',
    email:'nikhilratta84@gmail.com',
    password:'11915103Nr'
  }).expect(201)
  const user=await User.findById(response.body.user._id);
  expect(user).not.toBeNull()            // .not is added to inverse the property
  expect(response.body).toMatchObject({
    user:{
      name:'Nikhil Ratta',
      email:'nikhilratta84@gmail.com',
    },
  })
  expect(response.body.user.password).not.toBe(userOne.password)
})

test('Should login  existent user',async ()=>{
  const response=await request(app).post('/users/login').send({
    email:userOne.email,
    password:userOne.password,
  }).expect(200)
  const user=await User.findById(response.body.user._id);
  expect(user.tokens[1].token).toBe(response.body.token)
})

test('Shouldnt login non existent user',async ()=>{
  await request(app).post('/users/login').send({
    email:userOne.email,
    password:'yowhatsup',
  }).expect(400)
})

test('Should get profile if authorization is provided',async ()=>{
  await request(app)
  .get('/users/me')
  .set('Authorization','Bearer '+userOne.tokens[0].token)
  .send()
  .expect(200)
})

test('Shouldnt get profile if authorization is provided is invalid',async ()=>{
  await request(app)
  .get('/users/me')
  .set('Authorization','Bearer ccascacacacdcdasde23798')
  .send()
  .expect(401)
})

test('Should delete profile if authorization is provided',async ()=>{
   await request(app)
  .delete('/users/me')
  .set('Authorization','Bearer '+userOne.tokens[0].token)
  .send()
  .expect(200)
  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test('Shouldnt delete profile if authorization is provided is invalid',async ()=>{
  await request(app)
  .delete('/users/me')
  .set('Authorization','Bearer 813218uwqisa')
  .send()
  .expect(401)
})

test('Should upload profile Picture',async ()=>{
  await request(app)
  .post('/users/me/avatar')
  .set('Authorization','Bearer '+userOne.tokens[0].token)
  .attach('avatar','tests/fixtures/profile.jpg')       //attach to upload files first argument is the name of the thing browser looks for and second is the name of the file from the root of the project
  .expect(200)
  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer))      //toEqual is different than toBe used to compare objects and other stuff it lets us check the file types
})

test('Should update profile if authorization is provided and fields are correct',async ()=>{
  await request(app)
  .patch('/users/me')
  .set('Authorization','Bearer '+userOne.tokens[0].token)
  .send({
    name:'Nicky',
    email:'emailischill87@gmail.com'
  })
  .expect(200)
  const user = await User.findById(userOneId)
  expect(user).toMatchObject({
    name:'Nicky',
    email:'emailischill87@gmail.com'
  })
})

test('Shouldnt update profile if authorization is provided and fields are incorrect',async ()=>{
  await request(app)
  .patch('/users/me')
  .set('Authorization','Bearer '+userOne.tokens[0].token)
  .send({
    name:'Nicky',
    email:'emailischill87@gmail.com',
    location:'New York'
  })
  .expect(400)
})
