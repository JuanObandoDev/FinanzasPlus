document
    .addEventListener("DOMContentLoaded", async function () {
    const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";

    const tableBody = document.getElementById("gastosTabla");
  
    async function cargarGastos() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/gastos`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_KEY}`,
            apikey: SUPABASE_KEY,
          },
        });
  
        if (!response.ok) throw new Error("Error al cargar los gastos");
  
        const gastos = await response.json();
        tableBody.innerHTML = "";
  
        gastos.forEach((gasto) => {
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${gasto.id}</td>
            <td>$${gasto.monto.toFixed(2)}</td>
            <td>${gasto.categoria}</td>
            <td>${gasto.descripcion}</td>
             <td>
            <button onclick="editarGasto(${gasto.id}, ${gasto.monto}, '${gasto.categoria}', '${gasto.descripcion}')">
              ✏️ Editar
            </button>
            <button onclick="eliminarGasto(${gasto.id})" style="background-color: red; color: white;">
              🗑️ Eliminar
          </td>
          `;
          tableBody.appendChild(fila);
        });
      } catch (error) {
        console.error("Error:", error.message);
        alert("No se pudieron cargar los gastos. Inténtelo más tarde.");
      }
    }
    
    cargarGastos(); 
  });

  function editarGasto(id, monto, categoria, descripcion) {
    document.getElementById("editId").value = id;
    document.getElementById("editMonto").value = monto;
    document.getElementById("editCategoria").value = categoria;
    document.getElementById("editDescripcion").value = descripcion;
    document.getElementById("editFilaForm").style.display = "block";
  }
  
  function cerrarFormulario() {
    document.getElementById("editFilaForm").style.display = "none";
  }
  
  document
    .getElementById("editForm")
    .addEventListener("submit", async function (event) {
    event.preventDefault();
  
    const id = document.getElementById("editId").value;
    const monto = parseFloat(document.getElementById("editMonto").value);
    const categoria = document.getElementById("editCategoria").value.trim();
    const descripcion = document.getElementById("editDescripcion").value.trim();
  
    if (monto <= 0) {
      alert("El monto debe ser un número positivo.");
      return;
    }
  
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/gastos?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({ monto, categoria, descripcion }),
      });
  
      if (!response.ok) throw new Error("Error al actualizar el gasto");
  
      alert("Gasto actualizada correctamente.");
      cerrarFormulario();
      cargarGastos();
    } catch (error) {
      console.error("Error:", error.message);
      alert("No se pudo actualizar el gasto. Inténtelo más tarde.");
    }
  });

  async function eliminarGasto(id) {
    const confirmacion = confirm("¿Seguro que quieres eliminar este gasto?");
    if (!confirmacion) return;
  
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/gastos?id=eq.${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
      });
  
      if (!response.ok) throw new Error("Error al eliminar el gasto");
  
      alert("Gasto eliminada correctamente.");
      cargarGastos();
    } catch (error) {
      console.error("Error:", error.message);
      alert("No se pudo eliminar el gasto. Inténtelo más tarde.");
    }
  }
  