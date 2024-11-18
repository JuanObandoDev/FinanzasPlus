document
  .getElementById("formInicioUsuario")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const SUPABASE_URL = "https://vkmcsasohwsfhjovicsg.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbWNzYXNvaHdzZmhqb3ZpY3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3OTMwNDYsImV4cCI6MjA0NzM2OTA0Nn0.Z2aM-wmEBHNZzmPRC4SArvmLmRcLTwl9fTRSqBcyhUI";

    const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const encPass = CryptoJS.MD5(password).toString();

    const { data, error } = await SUPABASE.from("usuarios")
      .select("id_usuario, username, email")
      .eq("email", email)
      .eq("password", encPass)
      .single();

    if (error) {
      alert("Credenciales inválidas. Por favor, intenta de nuevo.");
      return;
    }
    window.location.href = "../pages/inicio.html";
  });
