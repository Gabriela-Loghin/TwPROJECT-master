const mysql = require("mysql2");

const con = mysql.createConnection({
  host: "localhost",
  user: "daniel",
  password: "password",
  database: "workout_generator",
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

function getExercises(user, params) {
  return new Promise((resolve, reject) => {
    let location = 0,
      time = 0,
      muscle = "";
    params.forEach((element) => {
      let nameValue = element.split("=");
      let name = nameValue[0];
      let value = nameValue[1];

      if (name === "location") {
        if (value === "inside") location = 1;
        else location = 2;
      }
      if (name === "time") time = value;
      if (name === "muscle") muscle = value;
    });
    let query = `SELECT e.name, e.Description, e.duration, videoName from exercises e`;
    if (muscle !== "")
      query +=
        " JOIN muscles_exercise me on e.id=me.idexercise JOIN muscles m on me.idmuscles=m.id";

    query += " WHERE ";
    if (location != 0) query += `(location = ${location} OR location =3) AND `;
    if (time !== 0) query += `duration < ${time} AND `;
    if (muscle !== "") query += `m.name="${muscle}" AND `;

    query += `(e.body_type = ${user.body_type} OR e.body_type=4 ) AND (e.gender = ${user.gender} OR e.gender=3) AND (e.age=${user.age} OR e.age=4)`;


    console.log(query);
    con.query(query, function (err, result, fields) {
      if (err) throw err;
      resolve(result);
    });
  });
}

function getExercise(name) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * from exercises where name = "${name}"`;

    con.query(query, function (err, result, fields) {
      if (err) throw err;
      resolve(result[0]);
    });
  });
}

function addExerciseToUser(userId, exercise) {
  return new Promise((resolve, reject) => {
    let updateQuery = `Update user_exercises set count = count + 1 where iduser=${userId} and idexercise=${exercise}`;
    con.query(updateQuery, function (err, result, fields) {
      if (err) throw err;
      if (result.affectedRows != 0) resolve(result);
      else {
        let createQuery = `INSERT into user_exercises(iduser, idexercise) values(${userId}, ${exercise})`;
        con.query(createQuery, function (err, result, fields) {
          if (err) throw err;
          resolve(result);
        });
      }
    });
  });
}

module.exports = {
  getExercises,
  addExerciseToUser,
  getExercise,
};
