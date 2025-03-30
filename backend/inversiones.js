document
    .addEventListener("DOMContentLoaded", async function () {
    const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
    const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const tableBody = document.getElementById("inversionesTabla");
  
    async function cargarInversiones() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/inversiones`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_KEY}`,
            apikey: SUPABASE_KEY,
          },
        });
  
        if (!response.ok) throw new Error("Error al cargar las inversiones");
  
        const inversiones = await response.json();
        tableBody.innerHTML = "";

        let contador = 1;
  
        inversiones.forEach(async(inversion) => {
          const id_tipo = await SUPABASE.from("tipos_inversiones").select("nombre").eq("id_tipo_inversion",inversion.id_tipo_inversion).single();
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${contador}</td>
            <td>$${inversion.monto.toFixed(2)}</td>
            <td>${id_tipo.data.nombre}</td>
            <td>${inversion.descripcion}</td>
             <td>
            <button onclick="editarInversion(${inversion.id}, ${inversion.monto}, '${inversion.tipo}', '${inversion.descripcion}')">
              ✏️ Editar
            </button>
            <button onclick="eliminarInversion(${inversion.id})" style="background-color: red; color: white;">
              🗑️ Eliminar
          </td>
          `;
          tableBody.appendChild(fila);
          contador++;
        });
      } catch (error) {
        console.error("Error:", error.message);
        alert("No se pudieron cargar las inversiones. Inténtelo más tarde.");
      }
    }
    
    cargarInversiones(); 
  });

  function editarInversion(id, monto, tipo, descripcion) {
    document.getElementById("editId").value = id;
    document.getElementById("editMonto").value = monto;
    document.getElementById("editTipo").value = tipo;
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
    const tipo = document.getElementById("editTipo").value.trim();
    const descripcion = document.getElementById("editDescripcion").value.trim();
  
    if (monto <= 0) {
      alert("El monto debe ser un número positivo.");
      return;
    }
  
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/inversiones?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({ monto, tipo, descripcion }),
      });
  
      if (!response.ok) throw new Error("Error al actualizar la inversion");
  
      alert("Inversion actualizada correctamente.");
      cerrarFormulario();
      cargarInversiones();
    } catch (error) {
      console.error("Error:", error.message);
      alert("No se pudo actualizar la inversion. Inténtelo más tarde.");
    }
  });

  async function eliminarInversion(id) {
    const confirmacion = confirm("¿Seguro que quieres eliminar esta inversion?");
    if (!confirmacion) return;
  
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/inversiones?id=eq.${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
      });
  
      if (!response.ok) throw new Error("Error al eliminar la inversion");
  
      alert("Inversion eliminada correctamente.");
      cargarInversiones();
    } catch (error) {
      console.error("Error:", error.message);
      alert("No se pudo eliminar la inversion. Inténtelo más tarde.");
    }
  }