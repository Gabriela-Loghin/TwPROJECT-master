const User = require("../models/userModel");
const { getPostData, getBoundary, getMatching } = require("../utils");
var FormData = require("form-data");
const fs = require("fs");
const rss = require("rss");
const path = require( "path" );
const { v4: uuidv4, v4 } = require('uuid');


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
      res.end(JSON.stringify({ message: "User not found" }));
    } else {
      res.writeHead(201, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(token));
    }
  } catch (error) {
    console.log(error);
  }
}

function getBodyType(weight, height) {
  let bodyType = weight / ((height * height) / 10000);
  if (bodyType < 18.5) return 2; //underweight
  if (bodyType > 25) return 3; //overweight
  return 1; //normal
}

async function register(req, res) {
  
  let fileFullPath ="";
  try {
    let result = {};
    let rawData = await getPostData(req)
    let boundary = getBoundary(req)
    const rawDataArray = rawData.split(boundary);
    for (let item of rawDataArray) {
      // Use non-matching groups to exclude part of the result
      let name = getMatching(item, /(?:name=")(.+?)(?:")/);
      if (!name || !(name = name.trim())) continue;
      let value = getMatching(item, /(?:\r\n\r\n)([\S\s]*)(?:\r\n--$)/);
      if (!value) continue;
      let filename = getMatching(item, /(?:filename=")(.*?)(?:")/);
      if (filename && (filename = filename.trim())) {
        // Add the file information in a files array
        let file = {};
        file[name] = value;
        file["filename"] = filename;
        let contentType = getMatching(item, /(?:Content-Type:)(.*?)(?:\r\n)/);
        if (contentType && (contentType = contentType.trim())) {
          file["Content-Type"] = contentType;
        }
        if (!result.files) {
          result.files = [];
        }
        result.files.push(file);
      } else {
        // Key/Value pair
        result[name] = value;
      }
    }

    const userDb = await User.getByEmail(result.email);
    if (userDb) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Email already exists" }));
      return;
    } 


     if (result.files) {
          fileFullPath = path.resolve('usersImages/'+ uuidv4()+'.jpg');
          const stream = fs.createWriteStream(fileFullPath)
          stream.write(result.files[0].photo, 'binary')
          stream.close()
          result.files[0].picture = 'bin'
      }


    //console.log(result.files[0].photo)


    //const { firstName, lastName, pass, gender, weight, height, age, email } = JSON.parse(result);
    //console.log(formData["sal"])

    let bodyType = getBodyType(result.weight, result.height);
    let gender2 = result.gender == "male" ? 1 : 2;
    let age2 = result.age < 30 ? 1 : result.age < 50 ? 2 : 3;

      const data = {
        firstName : result.firstName,
        lastName :result.lastName,
        pass : result.pass,
        gender : gender2,
        age : age2,
        bodyType, 
        email : result.email,
        imagePath: fileFullPath
      };

      const user = await User.register(data);

      res.writeHead(201, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(user));
  } catch (error) {
    console.log(error);
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
    console.log(error);
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

