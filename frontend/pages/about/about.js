function logout() {
  sessionStorage.removeItem("auth");
  return (window.location.href = "./about.html");
}
(function () {
  const searchTerm = location.search;
  if (searchTerm === "?logout=true") {
    return logout();
  }
})();
