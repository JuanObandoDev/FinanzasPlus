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
    const id_usuario = localStorage.getItem("userId");

    if (monto <= 0) {
        alert("El monto debe ser un número positivo.");
        return;
    }
  
    if (!fecha || isNaN(Date.parse(fecha))) {
        alert("Debe seleccionar una fecha válida.");
        return;
    }

    const data = {
        id_usuario: id_usuario,
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
        const errorData = await response.json();
        throw new Error(errorData.message ||"Error al guardar los datos en el servidor");
      }

      alert("su deuda ha sido registrada exitosamente");
      window.location.href = "../pages/deudas.html";
    } catch (error) {
      alert(error.message);
    }
  });