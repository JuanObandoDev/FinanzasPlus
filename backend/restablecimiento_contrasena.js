document
  .getElementById("recoveryPassForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const SUPABASE_URL = "https://vkmcsasohwsfhjovicsg.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbWNzYXNvaHdzZmhqb3ZpY3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3OTMwNDYsImV4cCI6MjA0NzM2OTA0Nn0.Z2aM-wmEBHNZzmPRC4SArvmLmRcLTwl9fTRSqBcyhUI";

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
    window.location.href = "../pages/Creacion_nueva_contrasena.html";
  });
