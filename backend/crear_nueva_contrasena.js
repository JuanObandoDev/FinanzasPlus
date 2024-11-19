document
  .getElementById("createNewPassForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const SUPABASE_URL = "https://vkmcsasohwsfhjovicsg.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbWNzYXNvaHdzZmhqb3ZpY3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3OTMwNDYsImV4cCI6MjA0NzM2OTA0Nn0.Z2aM-wmEBHNZzmPRC4SArvmLmRcLTwl9fTRSqBcyhUI";

    const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const newPass = document.getElementById("new-password").value;
    const confirmPass = document.getElementById("confirm-password").value;

    if (newPass != confirmPass) {
      alert("Las contraseñas no coinciden");
      return;
    }

    let email = localStorage.getItem("userEmail");
    if (!email) {
      email = localStorage.getItem("startSessionUser");
      if (!email) {
        return;
      }
    }

    const encPass = CryptoJS.MD5(newPass).toString();

    const { data, error } = await SUPABASE.from("usuarios")
      .update({ password: encPass })
      .eq("email", email);

    if (error) {
      alert("Ups! algo salió mal, vuelve a intentarlo");
      return;
    }
    localStorage.removeItem("userEmail");
    localStorage.removeItem("startSessionUser");
    alert("La contraseña ha sido actualizada exitosamente");
    window.location.href = "../pages/inicio_de_sesion.html";
  });
