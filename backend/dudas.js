document
    .addEventListener("DOMContentLoaded", async function () {
    const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";

    const tableBody = document.getElementById("deudasTabla");
  
    async function cargarDeudas() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/deudas`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_KEY}`,
            apikey: SUPABASE_KEY,
          },
        });
  
        if (!response.ok) throw new Error("Error al cargar las deudas");
  
        const deudas = await response.json();
        tableBody.innerHTML = "";
  
        deudas.forEach((deuda) => {
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${deuda.id}</td>
            <td>$${deuda.monto.toFixed(2)}</td>
            <td>${new Date(deuda.fecha).toLocaleDateString()}</td>
            <td>${deuda.categoria}</td>
            <td>${deuda.descripcion}</td>
          `;
          tableBody.appendChild(fila);
        });
      } catch (error) {
        console.error("Error:", error.message);
        alert("No se pudieron cargar las deudas. Inténtelo más tarde.");
      }
    }
  
    cargarDeudas(); 
  });
  