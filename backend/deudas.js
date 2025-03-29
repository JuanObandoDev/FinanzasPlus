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
             <td>
            <button onclick="editarDeuda(${deuda.id}, ${deuda.monto}, '${deuda.fecha}', '${deuda.categoria}', '${deuda.descripcion}')">
              ✏️ Editar
            </button>
            <button onclick="eliminarDeuda(${deuda.id})" style="background-color: red; color: white;">
              🗑️ Eliminar
            </button>
          </td>
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

  function editarDeuda(id, monto, fecha, categoria, descripcion) {
    document.getElementById("editId").value = id;
    document.getElementById("editMonto").value = monto;
    document.getElementById("editFecha").value = fecha;
    document.getElementById("editCategoria").value = categoria;
    document.getElementById("editDescripcion").value = descripcion;
    document.getElementById("editFormContainer").style.display = "block";
  }
  
  function cerrarFormulario() {
    document.getElementById("editFormContainer").style.display = "none";
  }
  
  document
    .getElementById("editForm")
    .addEventListener("submit", async function (event) {
    event.preventDefault();
  
    const id = document.getElementById("editId").value;
    const monto = parseFloat(document.getElementById("editMonto").value);
    const fecha = document.getElementById("editFecha").value;
    const categoria = document.getElementById("editCategoria").value.trim();
    const descripcion = document.getElementById("editDescripcion").value.trim();
  
    if (isNaN(monto) || monto <= 0) {
      alert("El monto debe ser un número positivo.");
      return;
    }
  
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/deudas?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({ monto, fecha, categoria, descripcion }),
      });
  
      if (!response.ok) throw new Error("Error al actualizar la deuda");
  
      alert("Deuda actualizada correctamente.");
      cerrarFormulario();
      cargarDeudas();
    } catch (error) {
      console.error("Error:", error.message);
      alert("No se pudo actualizar la deuda. Inténtelo más tarde.");
    }
  });

  async function eliminarDeuda(id) {
    const confirmacion = confirm("¿Seguro que quieres eliminar esta deuda?");
    if (!confirmacion) return;
  
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/deudas?id=eq.${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
      });
  
      if (!response.ok) throw new Error("Error al eliminar la deuda");
  
      alert("Deuda eliminada correctamente.");
      cargarDeudas();
    } catch (error) {
      console.error("Error:", error.message);
      alert("No se pudo eliminar la deuda. Inténtelo más tarde.");
    }
  }
  