document.addEventListener("DOMContentLoaded", () => {
  const userEmail = localStorage.getItem("startSessionUser");
  const userId = localStorage.getItem("userId");

  if (!userEmail || !userId) {
    window.location.href = "../pages/inicio_de_sesion.html";
  }
});
