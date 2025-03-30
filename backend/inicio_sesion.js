document
  .getElementById("formInicioUsuario")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";

    const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const encPass = CryptoJS.MD5(password).toString();

    const { data, error } = await SUPABASE.from("usuarios")
      .select("id_usuario, username, email")
      .eq("email", email)
      .eq("password", encPass)
      .single();

    console.error(error);
    if (error) {
      alert("Credenciales inválidas. Por favor, intenta de nuevo.");
      return;
    }
    localStorage.setItem("startSessionUser", email);
    localStorage.setItem("userId", data.id_usuario);
    window.location.href = "../pages/inicio.html";
  });
