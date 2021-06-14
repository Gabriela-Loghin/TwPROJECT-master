const url = "http://localhost:5000/api/auth/register";

var xhr = new XMLHttpRequest();

window.onload = function () {
  imgUpload = document.getElementById("imgUpload")
}

function submitRegister(event) {
  event.preventDefault();
  let account = {
    firstName: event.target.elements.first.value,
    lastName: event.target.elements.last.value,
    pass: event.target.elements.pass.value,
    cpass: event.target.elements.cpass.value,
    gender: event.target.elements.gender.value,
    email: event.target.elements.email.value,
    age: event.target.elements.age.value,
    weight: event.target.elements.weight.value,
    height: event.target.elements.height.value,
  };

  if (account.cpass != account.pass) {
    document.getElementById("passwords-dont-match").classList.remove("hidden")
    return;
  }
  //post

  var dataForm = new FormData();
  dataForm.append("firstName", account.firstName);
  dataForm.append("lastName", account.lastName);
  dataForm.append("pass", account.pass);
  dataForm.append("gender", account.gender);
  dataForm.append("weight", account.weight);
  dataForm.append("height", account.height);
  dataForm.append("age", account.age);
  dataForm.append("email", account.email);
  dataForm.append("photo", imgUpload.files[0], "poza.png");



xhr.addEventListener("readystatechange", function() {
  if(this.readyState === 4 && this.status === 201 ) {
    document.location.href = "../login/login.html";
  } else if (this.readyState === 4 && this.status === 404){
    document.getElementById("invalid-register").classList.remove("hidden")
  }
})

xhr.open("POST", url);
//xhr.setRequestHeader("Content-Type", "application/json");
xhr.send(dataForm)
}
