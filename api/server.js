const http = require("http");
require("events").EventEmitter.prototype._maxListeners = 100;

const {
  login,
  register,
  getTop,
  updateUser,
  getUserExercises,
  getFeed,
  sendEmail,
} = require("./controllers/userController");

const {
  getExercises,
  addExercisesUser,
} = require("./controllers/exerciseController");

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
  res.setHeader("Content-Type", "application/json"); // Set Content Type to return JSON

  if (req.url.match(/\/api\/auth\/([0-9 a-z A-Z]+)/)) {
    if (req.url === "/api/auth/login" && req.method === "POST") {
     return await login(req, res);
    } else if (req.url === "/api/auth/register" && req.method === "POST") {
     return await register(req, res);
    }
  } else if (req.url === "/api/contact" && req.method === "POST") {
    sendEmail(req, res);
  } else {
    let params = req.url.split("?token=");
    let token;
    if (params[1] && params[1].split("&email=")[1]) {
      let authParams = params[1].split("&email=");
      token = authParams[0];
      email = authParams[1];

      let other = [];
      other = email.split("&");
      email = other[0];
      let otherParams;
      other.shift();
      otherParams = [];
      other.forEach((element) => {
        otherParams.push(element);
      });

      let newUrl = params[0];
      if (newUrl == "/api/feed" && req.method === "GET") {
        getTop(req, res, email, token);
      } else if (newUrl == "/api/users/top" && req.method === "GET") {
        getTop(req, res, email, token);
      } else if (newUrl == "/api/users" && req.method === "POST") {
        updateUser(req, res, email, token);
      } else if (newUrl === "/api/exercises" && req.method === "GET") {
        getExercises(req, res, email, token, otherParams);
      } else if (newUrl === "/api/exercises/user" && req.method === "GET") {
        getUserExercises(req, res, email, token, otherParams);
      } else if (newUrl === "/api/exercises" && req.method === "POST") {
        addExercisesUser(req, res, email, token);
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Not found" }));
      }
    } else {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Unauthorized" }));
    }
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
