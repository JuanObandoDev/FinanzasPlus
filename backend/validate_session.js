document.addEventListener("DOMContentLoaded", () => {
  const userEmail = localStorage.getItem("startSessionUser");
  const userId = localStorage.getItem("userId");

  if (!userEmail || !userId) {
    window.location.href = "../pages/not_permissions.html";
  }
});
