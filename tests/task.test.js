const app = require('../src/app');
const request = require('supertest');
const Task=require('../src/models/tasks');
const {  setUpDB,  userOne,  userOneId,  userTwoId,  userTwo,  taskOne,  taskTwo,  taskThree } = require('./fixtures/db');

beforeEach(setUpDB)
test('Should Create a Task ' ,async ()=>{
  const response=await request(app)
  .post('/tasks')
  .set('Authorization','Bearer '+userOne.tokens[0].token)
  .send({
    description:'Testing Testing testing!!!'
  })
  .expect(201)
  const task=await Task.findById(response.body._id)
  expect(task).not.toBeNull()
  expect(task.completed).toEqual(false)

})

test('Should get all tasks for a user',async ()=>{
  const response=await request(app)
  .get('/tasks')
  .set('Authorization','Bearer '+userOne.tokens[0].token)
  .send()
  .expect(200)
  expect(response.body.length).toBe(2)
})

test('Should not delete a task if the user does not have Authorization',async ()=>{
  const response=await request(app)
  .delete('/tasks/'+taskOne._id)
  .set('Authorization','Bearer '+userTwo.tokens[0].token)
  .send()
  .expect(404)
  const task=await Task.findById(taskOne._id)
  expect(task).not.toBeNull()

})

//by default all test file run simultaneously this can be a problem if they interfere with each other so we include --runInband to run tests one by one
