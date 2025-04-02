document
  .getElementById("createNewPassForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";

    const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const newPass = document.getElementById("new-password").value;
    const confirmPass = document.getElementById("confirm-password").value;

    if (
      newPass.length < 8 ||
      !/[A-Z]/.test(newPass) ||
      !/[a-z]/.test(newPass) ||
      !/[0-9]/.test(newPass) ||
      !/[!@#$%^&*]/.test(newPass)
    ) {
      alert(
        "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial."
      );
      document.getElementById("new-password").value = "";
      document.getElementById("confirm-password").value = "";
      document.getElementById("new-password").focus();
      return;
    }

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
