document
  .getElementById("deudaForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";

    const monto = document.getElementById("monto").value;
    const categoria = document.getElementById("categoria").value;
    const fecha = document.getElementById("fecha").value;
    const descripcion = document.getElementById("descripcion").value;

    const data = {
        monto: monto,
        categoria: categoria,
        fecha: fecha,
        descripcion:descripcion,
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/deudas`, {
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

      alert("su desuda ha sido registrada exitosamente");
      window.location.href = "../pages/deudas.html";
    } catch (error) {
      alert(error.message);
    }
  });