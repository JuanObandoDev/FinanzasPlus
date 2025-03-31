document
    .addEventListener("DOMContentLoaded", async function () {
    const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
    const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
  
        let contador = 1;
        
        deudas.forEach(async(deuda) => {
          const id_categoria = await SUPABASE.from("categorias_deudas").select("nombre").eq("id_categoria_deuda",deuda.id_categoria_deuda).single();
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${contador}</td>
            <td>$${deuda.monto_pagar.toFixed(2)}</td>
            <td>${new Date(deuda.fecha_vencimiento).toLocaleDateString()}</td>
            <td>${id_categoria.data.nombre}</td>
            <td>${deuda.descripcion}</td>
             <td>
            <button onclick="editarDeuda(${deuda.id}, ${deuda.monto_pagar}, '${deuda.fecha_vencimiento}', '${id_categoria.data.nombre}', '${deuda.descripcion}')">
              ✏️ Editar
            </button>
            <button onclick="eliminarDeuda(${deuda.id_deuda})" style="background-color: red; color: white;">
              🗑️ Eliminar
            </button>
            <button onclick="pagarDeuda(${deuda.id},${deuda.monto})" style="background-color: green; color: white;">
              💰 Pagar
            </button>
          </td>
          `;
          tableBody.appendChild(fila);
          contador++;
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
    const fecha = document.getElementById("editFecha").value;
    const categoria = document.getElementById("editCategoria").value.trim();
    const descripcion = document.getElementById("editDescripcion").value.trim();
  
    if (monto <= 0) {
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

  async function eliminarDeuda(id_deuda) {
    const confirmacion = confirm("¿Seguro que quieres eliminar esta deuda?");
    if (!confirmacion) return;
  
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/deudas?id=eq.${id_deuda}`, {
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
  
  function pagarDeuda(id,monto){
    document.getElementById("pagoId").value = id;
    document.getElementById("pagoMonto").value = monto;
    document.getElementById("agregarPagoForm").style.display = "block";
  }

  function cerrarFormularioPago(){
    document.getElementById("agregarPagoForm").style.display="none";
  }

  document
    .getElementById("pagoForm")
    .addEventListener("submit", async function (event) {
    event.preventDefault();
    const id = document.getElementById("pagoId").value;
    const montoPago = parseFloat(document.getElementById("montoPago").value);

    if (montoPago <= 0) {
      alert(" El monto debe ser un número positivo.");
      return;
    }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/deudas?id=eq.${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
  });

  if (!response.ok) {
    alert(" Error al obtener los datos de la deuda.");
    return;
  }

  const deuda = await response.json();
  let montoRestante = deuda[0].monto - montoPago;

  if (montoRestante < 0) {
    alert(" No puedes pagar más de lo que debes.");
    return;
  }

  try {
    const responseUpdate = await fetch(`${SUPABASE_URL}/rest/v1/deudas?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({ monto: montoRestante }),
    });

    if (!responseUpdate.ok) throw new Error("Error al actualizar la deuda");

    alert("Pago registrado correctamente.");
    cerrarFormularioPago();
    cargarDeudas();
  } catch (error) {
    console.error("Error:", error.message);
    alert("No se pudo procesar el pago. Inténtelo más tarde.");
  }
});