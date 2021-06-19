const url = "http://localhost:5000/api/auth/login";



async function submitLogin(event) {
  event.preventDefault();
  let account = {
    email: event.target.elements.email.value,
    pass: event.target.elements.pass.value,
  };

  try {
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(account),
    });
    const data = await response.json();
    console.log(data);
    const {
      status,
      error = "Something went wrong with login. Please try again later! ",
      token = null,
    } = data;
    if (status === "success") {
      const auth = {
        token,
        email: account.email,
      };
      // Stores the auth data inside the sessionStorage Object available globally on the root of the page
      sessionStorage.setItem("auth", JSON.stringify(auth));

      // Redirects to this page
      document.location.href = "../exercises/exercises.html";
    }
    if (status === "failed") {
      alert(`${error}`);
    }
  } catch (err) {
    alert(err.message);
  }
}
