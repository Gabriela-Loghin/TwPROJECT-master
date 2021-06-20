const xhr = new XMLHttpRequest();
const url = "http://localhost:5000/api/users/top";

let users = [];

let auth = JSON.parse(sessionStorage.getItem("auth"));
var params = `token=${auth.token}&email=${auth.email}`;

// async function b64toBlob(b64) {
//   let blobRes = "null";
//   let img = new Image();
//   img.src = b64;
//   await img.decode();
//   let canvas = document.createElement("canvas");
//   canvas.width = img.width;
//   canvas.height = img.height;
//   let ctx = canvas.getContext("2d");
//   ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//   blobRes = await new Promise((resolve) => canvas.toBlob(resolve));
//   blobRes = window.URL.createObjectURL(blobRes);
//   return blobRes;
// }
const b64toBlob = (base64, type = 'image/png') => 
  fetch(`data:${type};base64,${base64}`).then(res => res.blob())
// xhr.withCredentials = true; cors error
async function downloadJsonNow(data) {
  const newData =await  data.map((el) => {
    return {
      ...el,
      imagePath:''
    }
  });
  var dataStr =
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(newData));
  var dlAnchorElem = document.getElementById("buttonJson");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "data.json");
  // dlAnchorElem.click();
}



xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4 && this.status === 200) {
    let response = [];
    response = JSON.parse(xhr.responseText);
    response.forEach((element) => {
      let user = {
        first_name: element.first_name,
        antrenamente: element.antrenamente,
        imagePath: element.imagePath,
      };
      users.push(user);
    });
  }
  loadTop();
  generateStatisticsForTop();
  getStatisticsForCalories();
});

xhr.open("GET", url + "?" + params);
//xhr.setRequestHeader("Content-Type", "application/json");
xhr.send();

async function getStatisticsForCalories() {
  try {
    const url = "http://localhost:5000/api/exercises/user";
    const data = await fetch(`${url}?${params}`);
    const res = await data.json();

    const allUsersExercises = res.MainResponse;

    const total = allUsersExercises.map((user) => {
      const currentExercises = user.exercises;
      const totalCalories = currentExercises.reduce(
        (acc, curr) => acc + curr.calories * curr.count,
        0
      );
      return {
        email: user.email,
        caloriesBurned: totalCalories,
      };
    });

    const container = document.getElementById("statistictwo");

    let output = ``;

    total.map(({ email, caloriesBurned }) => {
      output += `
     <div
       class="bar"
       style="--bar-value: ${caloriesBurned / 10}%"
       data-name="${email} - ${caloriesBurned} calorii arse"
       title="${email} - ${caloriesBurned} calorii arse"
     ></div>
     `;
    });

    container.innerHTML = output;
  } catch (err) {
    console.log(err);
  }
}

function generateStatisticsForTop() {
  const container = document.getElementById("statisticone");

  let output = ``;

  users.map(({ first_name, antrenamente }) => {
    output += `
    <div
      class="bar"
      style="--bar-value: ${antrenamente * 5}%"
      data-name="${first_name} - ${antrenamente} antrenamente"
      title="${first_name} - ${antrenamente} antrenamente"
    ></div>
    `;
  });

  container.innerHTML = output;
}

function loadTop() {
  let container = document.getElementsByClassName("top")[0];
  downloadJsonNow(users);
  users.forEach((user, index) => {
    var pers = document.createElement("div");
    pers.classList.add("person");

    var photoContainer = document.createElement("div");
    photoContainer.classList.add("person-image-container");

    var img = document.createElement("img");
    img.classList.add("person-image");
    img.alt = "person-image";
    img.src = `data:image/png;base64,${user.imagePath}`;
    // img.src=user.imagePath ||"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"

    var persData = document.createElement("div");
    persData.classList.add("person-data");

    var ranking = document.createElement("span");
    ranking.classList.add("ranking-number");
    ranking.textContent = "#" + (index + 1);

    var name = document.createElement("p");
    name.classList.add("person-name");
    name.textContent = user.first_name;

    var exCount = document.createElement("p");
    exCount.classList.add("person-exercise-count");
    exCount.textContent = "Antrenamente terminate : " + user.antrenamente;

    persData.appendChild(ranking);
    persData.appendChild(name);
    persData.appendChild(exCount);

    photoContainer.appendChild(img);
    pers.appendChild(photoContainer);
    pers.appendChild(persData);
    container.appendChild(pers);
  });
}

function loadTopPDF() {
  var doc = new jsPDF();
  doc.setFontSize(22);
  doc.text(100, 20, "Top");
  doc.setFontSize(16);
  users.forEach((user, index) => {
    let y = 30 + 20 * index;

    doc.text(10, y, `${index + 1} : ${user.first_name}`);
    doc.text(10, y + 10, `Antrenamente finalizate: ${user.antrenamente}`);
  });
  doc.save("top.pdf");
}
