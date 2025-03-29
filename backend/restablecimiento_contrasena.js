document
  .getElementById("recoveryPassForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";

    const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const email = document.getElementById("email").value;

    const { data, error } = await SUPABASE.from("usuarios")
      .select("id_usuario, email")
      .eq("email", email)
      .single();

    if (error) {
      alert("El usuario no existe!");
      return;
    }
    localStorage.setItem("userEmail", email);
    window.location.href = "../pages/Creacion_nueva_contrasena.html";
  });
