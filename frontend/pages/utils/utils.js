function checkAuth(required = false) {
  try {
    let auth = sessionStorage.getItem("auth");
    const myAccount = document.getElementById("myAccount");
    const myLogout = document.getElementById("myLogout");
    const generalAccount = document.getElementById("generalAccount");
    
    const exercisesLink = document.getElementById("exercisesLink");
    const topLink = document.getElementById("topLink");
    if (exercisesLink) {
      exercisesLink.style.display = "none";
    }
    
    if (myAccount) {
      myAccount.style.display = "none";
    }
    if (myLogout) {
      myLogout.style.display = "none";
    }
    if (generalAccount) {
      generalAccount.style.display = "block";
    }

    if (!auth && required) {
      return (window.location.href = "../login/login.html");
    }

    const { email = null, token = null } = JSON.parse(auth);

    if (email && token) {
      myAccount.style.display = "block";
      myLogout.style.display = "block";
      generalAccount.style.display = "none";
      exercisesLink.style.display = "block";
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}
