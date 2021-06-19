const User = require("../models/userModel");
const { getPostData, getBoundary, getMatching } = require("../utils");
var FormData = require("form-data");
const fs = require("fs");
const rss = require("rss");
const path = require("path");
const { v4: uuidv4, v4 } = require("uuid");
const bcrypt = require("bcryptjs");

async function login(req, res) {
  try {
    const body = await getPostData(req);
    const { email, pass } = JSON.parse(body);

    const user = {
      email,
      pass,
    };

    const token = await User.login(user);

    if (!token) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: "failed", message: "User not found" }));
    } else {
      res.writeHead(201, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "success", token }));
    }
  } catch (error) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: "failed", message: error.message }));
  }
}

function getBodyType(weight, height) {
  let bodyType = weight / ((height * height) / 10000);
  if (bodyType < 18.5) return 2; //underweight
  if (bodyType > 25) return 3; //overweight
  return 1; //normal
}
const TransformBufferToString = (req) =>
  new Promise((resolve, reject) => {
    try {
      let output = "";
      req.on("data", (buffer) => (output += buffer.toString()));
      req.on("end", () => resolve(output));
    } catch (error) {
      reject(error);
    }
  });

async function register(req, res) {
  try {
    let result = await TransformBufferToString(req);
    result = await JSON.parse(result);

    const userDb = await User.getByEmail(result.email);
    if (userDb) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({ status: "failed", error: "Email already exists" })
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(result.pass, salt);

    let gender2 = result.gender == "male" ? 1 : 2;
    let age2 = result.age < 30 ? 1 : result.age < 50 ? 2 : 3;
    let bodyType = getBodyType(result.weight, result.height);

    const data = {
      firstName: result.firstName,
      lastName: result.lastName,
      pass: hashPassword,
      gender: gender2,
      age: age2,
      bodyType,
      email: result.email,
      imagePath: result.photo,
    };

    const user = await User.register(data);
    res.statusCode = 201;
    return res.end(JSON.stringify({ status: "success", user }));
  } catch (error) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ status: "failed", error: error.message }));
  }
}

async function getTop(req, res, email, token) {
  try {
    const isValid = await User.validateToken(email, token);
    if (!isValid) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Unauthorized" }));
    } else {
      const users = await User.getTop();
      if (!users) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Users not found" }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(users));
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function updateUser(req, res, email, token) {
  try {
    const isValid = await User.validateToken(email, token);
    if (!isValid) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Unauthorized" }));
    } else {
      const user = await User.getByEmail(email);

      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "user not found" }));
      } else {
        const body = await getPostData(req);
        const {
          firstName,
          lastName,
          pass,
          bodyType,
          age,
          gender,
          antrenamente,
        } = JSON.parse(body);

        console.log(antrenamente);
        const userData = {
          firstName: firstName || user.first_name,
          lastName: lastName || user.last_name,
          password: pass || user.password,
          email: user.email,
          bodyType: bodyType || user.body_type,
          age: age || user.age,
          gender: gender ? (gender === "male" ? 1 : 2) : user.gender,
          antrenamente: antrenamente
            ? user.antrenamente + 1
            : user.antrenamente,
        };

        const updatedUser = await User.updateUser(user.id, userData);
        res.writeHead(201, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(updatedUser));
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function getUserExercises(req, res, email, token) {
  try {
    const isValid = await User.validateToken(email, token);
    if (!isValid) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Unauthorized" }));
    } else {
      const user = await User.getByEmail(email);

      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "user not found" }));
      } else {
        const exercises = await User.getUserExercises(user.id);
        if (exercises) {
          userExercises = {
            img: user.imagePath,
            exercises: exercises,
          };
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify(userExercises));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "ex not found" }));
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function getFeed(req, res, email, token) {
  try {
    const isValid = await User.validateToken(email, token);
    if (!isValid) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Unauthorized" }));
    } else {
      const user = await User.getByEmail(email);

      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "user not found" }));
      } else {
        const exercises = await User.getUserExercises(user.id);
        if (exercises) {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify(userExercises));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "ex not found" }));
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function sendEmail(req, res) {
  try {
    const body = await getPostData(req);
    const { firstName, message, email } = JSON.parse(body);
    const response = await User.sendEmail(firstName, message, email);
    if (!response) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify("Internal server error"));
    } else {
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify("ok"));
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  login,
  register,
  getTop,
  updateUser,
  getUserExercises,
  getFeed,
  sendEmail,
};
