const xhr = new XMLHttpRequest();
const url = "http://localhost:5000/api/exercises/user";

let exercises = [];
let imagePath;

let auth = JSON.parse(localStorage.getItem("auth"));
var params = `token=${auth.token.split('"')[1]}&email=${auth.email}`;

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4 && this.status === 200) {
    let response = [];
    response = JSON.parse(xhr.responseText);
    exercises = response.exercises;
    imagePath = response.img;
  }
  loadInfo();
});

xhr.open("GET", url + "?" + params);
//xhr.setRequestHeader("Content-Type", "application/json");
xhr.send();

function loadInfo() {
  if (imagePath !== "") {
    var photoContainer = document.getElementsByClassName(
      "profile-photo-container"
    )[0];
    var photo = document.createElement("img");
    photo.src = imagePath;
    photoContainer.appendChild(photo);
  }
  var element = document.getElementsByClassName("exercise-list-container")[0];
  exercises.forEach((exercise, index) => {
    var ex = document.createElement("div");
    ex.className = "exercise";
    var exType = document.createElement("div");
    var exNo = document.createElement("div");

    exType.textContent = `${index + 1}. ${exercise.name}`;
    exNo.textContent = ` Ai facut acest exercitiu de ${exercise.count} ori `;

    exType.className = "exercise-type";
    exNo.className = "exercise-no-done";

    ex.appendChild(exType);
    ex.appendChild(exNo);
    element.appendChild(ex);
  });

}


