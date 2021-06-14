const Exercise = require('../models/exerciseModel')
const User = require('../models/userModel')

const { getPostData } = require("../utils");


async function getExercises(req, res, email, token, params) {
  try {
    const isValid = await User.validateToken(email, token);
    if (!isValid) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Unauthorized" }));
    } else {
      const user = await User.getByEmail(email)
      const exercises = await Exercise.getExercises(user, params);
      if (!exercises) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Exercises not found" }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(exercises));
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function addExercisesUser(req, res, email, token){
  try{
    const isValid = await User.validateToken(email, token);
    if (!isValid) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Unauthorized" }));
    } else {
    const body = await getPostData(req);
    const {exercises} = JSON.parse(body)

    const user = await User.getByEmail(email)

    let userId = user.id;

    await exercises.forEach(async exercise =>  {
      let exerciseDB = await Exercise.getExercise(exercise.name)
      const response = await Exercise.addExerciseToUser(userId, exerciseDB.ID)
      if (!response) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Exercises not found" }));
        return;
      }
     })
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(exercises));
    }
  }catch (error) {
    console.log(error);
  }
}

module.exports = {
    getExercises,
    addExercisesUser
}