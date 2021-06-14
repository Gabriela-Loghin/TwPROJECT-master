

const url = "http://localhost:5000/api/auth/login";
var xhr = new XMLHttpRequest();

let token;

function submitLogin(event) {
  // Prevents in some cases the button from launching the event the moment the page has rendered
  event.preventDefault();

  // Reads data from our form using the event object
  let email    = event.target.elements.mail.value;
  let password = event.target.elements.password.value;

  // Converts a newly created JSON to a string in order to send body data to our server
  // The request fails if a JSON with the Object type is sent raw
  let data = JSON.stringify({ "email": email, "pass": password });

  // Post request to the defined URL
  xhr.open("POST", url);
  xhr.send(data);

  // Event launched when the server responded to our request
  xhr.onreadystatechange = function () {
    // Request data such as status & other from the server can be read in the object 'this' 
    if (this.readyState === 4 && this.status == 201) {
      // Actual data manually explicitly sent by the server lays in xhr object thus why it cant be defined as a const
      response = JSON.parse(xhr.responseText);

      let auth = {
        token: this.response,
        email: email
      }

      // Redirects to this page
      document.location.href = "../exercises/exercises.html";

      // Stores the auth data inside the localstorage Object available globally on the root of the page
      localStorage.setItem("auth", JSON.stringify(auth));
      console.log(JSON.stringify(localStorage))

    } else if (this.readyState === 4 && this.status == 404) {
      // In case the request is bad change make the warning visible
      document.getElementById("invalid-login").classList.add("visible")
    }
  };

}