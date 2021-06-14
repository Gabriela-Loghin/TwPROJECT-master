const url = "http://localhost:5000/api/contact";
var xhr = new XMLHttpRequest();

function submitContact(event) {
event.preventDefault();

  let email    = event.target.elements.email.value;
  let message = event.target.elements.message.value;
  let firstName = event.target.elements.firstName.value;

  let data =JSON.stringify({
      email,
      message,
      firstName
  })

  xhr.open("POST", url);
  xhr.send(data);

  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status == 201) {
      document.location.href = "../exercises/exercises.html";

    } else if (this.readyState === 4 && this.status == 500) {
    }
  };

}