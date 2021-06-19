const url = "http://localhost:5000/api/auth/register";
let currentImageURL = "";
var xhr = new XMLHttpRequest();

window.onload = function () {
  imgUpload = document.getElementById("imgUpload");
};

const fromImageToBase64 = (file) => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onerror = () => {
      reader.abort();
      reject(new DOMException("Problem Parsing file"));
    };

    reader.onload = (readerEvt) => {
      // resolve(`data:image/png;base64,${btoa(readerEvt.target.result)}`);
      resolve(`${btoa(readerEvt.target.result)}`);
    };
    reader.readAsBinaryString(file);
  });
};

async function addImageProfile(event) {
  if (event.target && event.target.files && event.target.files.length > 0) {
    currentImageURL = await fromImageToBase64(event.target.files[0]);
    
    if (document.getElementById("uploadImageView")) {
      document.getElementById("uploadImageView").src = `data:image/png;base64,${currentImageURL}`;
    }
  }
}

async function submitRegister(event) {
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
    photo: currentImageURL,
  };

  if (account.cpass != account.pass) {
    alert("2");
    document.getElementById("passwords-dont-match").classList.remove("hidden");
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(account),
    });
    const data = await response.json();
    const {status, error='Something went wrong with registration. Please try again later! '} = data;
     if(status === 'success'){
      window.location.href="../login/login.html"
    }
    if(status === 'failed'){
      alert(`${error}`);
    }
  } catch (err) {
    console.log(err.message)
    alert(`Something went wrong with registration. Please try again later!`);
  }
}
