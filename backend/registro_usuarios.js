document
  .getElementById("userForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const SUPABASE_URL = "https://vkmcsasohwsfhjovicsg.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbWNzYXNvaHdzZmhqb3ZpY3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3OTMwNDYsImV4cCI6MjA0NzM2OTA0Nn0.Z2aM-wmEBHNZzmPRC4SArvmLmRcLTwl9fTRSqBcyhUI";

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const encPass = CryptoJS.MD5(password).toString();

    const data = {
      username: username,
      email: email,
      password: encPass,
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al guardar los datos en el servidor");
      }

      alert("El usuario ha sido creado exitosamente");
      window.location.href = "../pages/inicio_de_sesion.html";
    } catch (error) {
      alert(error.message);
    }
  });
