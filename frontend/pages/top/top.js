const xhr = new XMLHttpRequest();
const url = "http://localhost:5000/api/users/top";

let users = [];


let auth = JSON.parse(sessionStorage.getItem("auth"))
var params = `token=${auth.token}&email=${auth.email}`;
// xhr.withCredentials = true; cors error

xhr.addEventListener("readystatechange", function() {
  if(this.readyState === 4 && this.status === 200 ) {
  let response = [];
    response = JSON.parse(xhr.responseText);
    response.forEach((element) => {
      let user = {
        first_name: element.first_name,
        antrenamente: element.antrenamente,
        imagePath: element.imagePath
      };
      users.push(user);
    });
  }
  loadTop();
});

xhr.open("GET", url+"?"+params);
//xhr.setRequestHeader("Content-Type", "application/json");
xhr.send()


function loadTop() {
  console.log(users)
    let container = document.getElementsByClassName("top")[0];
    users.forEach((user, index) => {
        var pers = document.createElement("div");
        pers.classList.add("person");

        var photoContainer = document.createElement("div");
        photoContainer.classList.add("person-image-container");

        var img = document.createElement("img");
        img.classList.add("person-image");
        img.alt="person-image";
        img.src=user.imagePath || 'https://media.istockphoto.com/vectors/default-placeholder-man-vector-id844000412?b=1&k=6&m=844000412&s=612x612&w=0&h=C8xYIKaUQg8zdMXvbmSfu9MeXOGAI-U1wTpvKZJo_DM='

        var persData = document.createElement("div");
        persData.classList.add("person-data");

        var ranking = document.createElement("span")
        ranking.classList.add("ranking-number")
        ranking.textContent="#"+(index+1);

        var name = document.createElement("p");
        name.classList.add("person-name")
        name.textContent=user.first_name;
        

        var exCount = document.createElement("p");
        exCount.classList.add("person-exercise-count")
        exCount.textContent= "Antrenamente terminate : " + user.antrenamente

        persData.appendChild(ranking)
        persData.appendChild(name)
        persData.appendChild(exCount)
        

        photoContainer.appendChild(img);
        pers.appendChild(photoContainer);
        pers.appendChild(persData)
        container.appendChild(pers);
  });
}

function loadTopJSON() {
  var topJson = document.getElementById("topJson")
  let json=JSON.stringify(users);
  jsonArray = json.split(",");
  jsonArray.forEach(element =>{
    var line = document.createElement("div");
    line.textContent=element
    topJson.appendChild(line)

  })

  document.getElementById("buttonJson").style="display: none";
  
}

function loadTopPDF() {

  var doc = new jsPDF()
  doc.setFontSize(22);
  doc.text(100, 20, 'Top');
  doc.setFontSize(16);
  users.forEach((user, index) =>{
    let y = 30 + 20 * index;

    doc.text(10, y, `${index+1} : ${user.first_name}`);	
    doc.text(10, y+10, `Antrenamente finalizate: ${user.antrenamente}`);	
  })
  doc.save('top.pdf')


}
