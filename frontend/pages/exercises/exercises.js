const url = "http://localhost:5000/api/exercises";
var xhr = new XMLHttpRequest();

const urlPUT = "http://localhost:5000/api/users";

let exercises = [];

// Read auth data from the localstorage object
let auth = JSON.parse(localStorage.getItem("auth"));
// Template literals (Template strings)
var params = `token=${auth.token.split('"')[1]}&email=${auth.email}`;

// Submit of the forum on the page
function submitExerciseForm(event) {
  // Prevents in some cases the button from launching the event the moment the page has rendered
  event.preventDefault();

  // Reads data from our form using the event object
  let location = event.target.elements.location.value;
  let time = event.target.elements.time.value;
  let muscle = event.target.elements.grMuschi.value;

  // Builds the querry string url to call
  if (location !== "") params += `&location=${location}`;
  if (time != 0) params += `&time=${time}`;
  if (muscle !== "") params += `&muscle=${muscle}`;

  // Get request, we dont need to send any body data since we have a querry string url
  xhr.open("GET", url + "?" + params);
  xhr.send();

  // After the request ends
  xhr.onreadystatechange = function () {
    // On sucess ...
    if (this.readyState === 4 && this.status == 200) {
      // Updates an array with all of the exercises the server has returned
      exercises = JSON.parse(xhr.responseText);
      displayExercises = true;

      // makes stuff visible / invisible
      if (exercises.lenght === 0) {
        document.getElementById("no-ex-found").classList.remove("invisible");
        document.getElementById("exerciseDisplay").classList.add("invisible");

        document.getElementById("done").classList.add("invisible");
      } else {
        document
          .getElementById("exerciseDisplay")
          .classList.remove("invisible");
        document.getElementById("no-ex-found").classList.add("invisible");

        document.getElementById("done").classList.remove("invisible");
        // If all's good we render the exercises on the page
        loadExercises();
      }
    } else if (this.readyState === 4 && this.status == 404) {
      // not found
    }
  };
}

function loadExercises() {
  clearExercises();
  // Gets all the html elements from the "exerciseDisplay" id
  let container = document.getElementById("exerciseDisplay");

  // Takes all of the exercises defined above and works with them one by one
  exercises.forEach((exercise) => {
    // Works with exercise 'n'

    // Creates a html element, adds stuff onto it, etc
    var h3 = document.createElement("h3");
    h3.textContent = exercise.name;
    h3.classList.add("exercise-name");

    // Creates a html element, adds stuff onto it, etc
    var exContainer = document.createElement("div");
    exContainer.classList.add("exercise-container");

    // Creates a html element, adds stuff onto it, etc
    var instr = document.createElement("div");
    instr.classList.add("instructions");

    // Creates a html element, adds stuff onto it, etc
    var exerciseInstructions = document.createElement("ul");
    exerciseInstructions.classList.add("exercise-instructions");

    let instructions = exercise.Description.split("\n");

    instructions.forEach((element) => {
      let instruction = document.createElement("li");
      instruction.textContent = element;
      exerciseInstructions.appendChild(instruction);
    });

    let video = document.createElement("iframe");
    video.width = 800;
    video.height = 500;

    video.src = exercise.videoName;
    video.allowFullscreen = true;

    // Adds all the new elements to the container (renders them on the page)
    container.appendChild(h3);
    exContainer.appendChild(instr);
    instr.appendChild(exerciseInstructions);
    container.appendChild(video);
    container.appendChild(exContainer);
  });
}

function clearExercises() {
  let container = document.getElementById("exerciseDisplay");
  while (container.firstChild) {
    container.removeChild(container.lastChild);
  }
}

function markExercisesDone() {
  clearExercises();
  document.getElementById("done").classList.add("invisible");

  let exerciseList = [];
  exercises.forEach((exercise) => {
    exerciseList.push({ name: exercise.name });
  });

  var data = {
    exercises: exerciseList,
  };

  xhr.open("POST", url + "?" + params);
  xhr.send(JSON.stringify(data));

  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status == 201) {
      var postData = {
        antrenamente: 1,
      };
      let xml = new XMLHttpRequest();
      xml.open("POST", urlPUT + "?" + params);
      xml.send(JSON.stringify(postData));
    }
  };

}


