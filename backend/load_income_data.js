const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let idEditar = null;
const editIngresoForm = document.getElementById("editIngresoForm");
const editMonto = document.getElementById("editMonto");
const editFuente = document.getElementById("editFuente");
const editDescripcion = document.getElementById("editDescripcion");

editIngresoForm.onsubmit = async (e) => {
  e.preventDefault();
  try {
    const { data: fuentesData, error: fuentesError } = await SUPABASE.from(
      "fuentes_ingresos"
    )
      .select("id_fuente_ingreso")
      .eq("nombre", editFuente.value)
      .single();

    if (fuentesError) {
      throw new Error(`Error al obtener la fuente: ${fuentesError.message}`);
    }
    const fuenteId = fuentesData.id_fuente_ingreso;

    if (!idEditar) {
      throw new Error("ID de ingreso no especificado para edición");
    }

    const { error: updateError } = await SUPABASE.from("ingresos")
      .update({
        monto: parseInt(editMonto.value),
        id_fuente_ingreso: fuenteId,
        descripcion: editDescripcion.value,
      })
      .eq("id_ingreso", idEditar);
    if (updateError)
      throw new Error(`Error updating ingreso: ${updateError.message}`);
    editIngresoModal.style.display = "none";
    window.location.reload();
  } catch (error) {
    console.error(error);
  }
};

var editIngresoModal = document.getElementById("editIngresoModal");
var span = document.getElementById("closeEditIngresoModal");

span.onclick = function () {
  editIngresoModal.style.display = "none";
};

span.onclick = function () {
  editIngresoModal.style.display = "none";
};

window.addEventListener("click", function (event) {
  if (event.target == editIngresoModal) {
    editIngresoModal.style.display = "none";
  }
});

window.onclick = function (event) {
  if (event.target == editIngresoModal) {
    editIngresoModal.style.display = "none";
  }
};

const createActionButton = (text, color, onClick) => {
  const button = document.createElement("button");
  button.textContent = text;
  button.classList.add("btn");
  if (color === "blue") {
    button.classList.add("edit");
  }
  if (color === "red") {
    button.classList.add("delete");
  }
  button.onclick = onClick;
  return button;
};

function populateSelectOptions(fuentes) {
  const selectElement = document.getElementById("editFuente");

  fuentes.forEach(({ nombre }) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    selectElement.appendChild(option);
  });
}

const editIngreso = async (id) => {
  idEditar = id;
  try {
    const { data: fuentes, error } = await SUPABASE.from(
      "fuentes_ingresos"
    ).select("id_fuente_ingreso, nombre");
    if (error)
      throw new Error(`Error al obtener las fuentes: ${error.message}`);

    populateSelectOptions(fuentes);

    const { data: ingreso, error: ingresoError } = await SUPABASE.from(
      "ingresos"
    )
      .select("monto, id_fuente_ingreso, descripcion")
      .eq("id_ingreso", id)
      .single();

    if (ingresoError)
      throw new Error(`Error fetching ingreso: ${ingresoError.message}`);

    editMonto.value = ingreso.monto;
    editDescripcion.value = ingreso.descripcion;
    const fuenteData = await SUPABASE.from("fuentes_ingresos")
      .select("nombre")
      .eq("id_fuente_ingreso", ingreso.id_fuente_ingreso)
      .single();

    editFuente.value = fuenteData.data.nombre;

    editIngresoModal.style.display = "block";
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const performDeleteIngreso = async (id) => {
  try {
    const { error } = await SUPABASE.from("ingresos")
      .delete()
      .eq("id_ingreso", id);
    if (error) throw new Error(`Error deleting ingreso: ${error.message}`);
    window.location.reload();
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const deleteIngreso = async (id) => {
  const confirmDeleteModal = document.getElementById("confirmDeleteModal");
  confirmDeleteModal.style.display = "block";

  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

  confirmDeleteBtn.onclick = async () => {
    await performDeleteIngreso(id);
    confirmDeleteModal.style.display = "none";
  };

  cancelDeleteBtn.onclick = () => {
    confirmDeleteModal.style.display = "none";
  };
};

window.onload = async function () {
  const loaderContainer = document.getElementById("loader-container");
  const pageHeader = document.getElementById("header");
  const main = document.getElementById("main");
  const footer = document.getElementById("footer");
  const tableElement = document.getElementById("incomeTable");

  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("User ID not found in localStorage");
    return;
  }

  try {
    const { data: ingresos, error: ingresosError } = await SUPABASE.from(
      "ingresos"
    )
      .select("id_ingreso, monto, id_fuente_ingreso, descripcion")
      .eq("id_usuario", userId);

    if (ingresosError)
      throw new Error(`Error fetching ingresos: ${ingresosError.message}`);

    const fuentesPromises = ingresos.map((element) =>
      SUPABASE.from("fuentes_ingresos")
        .select("nombre")
        .eq("id_fuente_ingreso", element.id_fuente_ingreso)
        .single()
    );
    const fuentesResults = await Promise.all(fuentesPromises);

    const body = document.createElement("tbody");
    ingresos.forEach((element, index) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = index + 1;

      const tdMonto = document.createElement("td");
      tdMonto.textContent = `$${element.monto.toFixed(2)}`;

      const tdFuente = document.createElement("td");
      tdFuente.textContent =
        fuentesResults[index]?.data?.nombre || "Fuente no encontrada";

      const tdDescripcion = document.createElement("td");
      tdDescripcion.textContent = element.descripcion;

      const tdAcciones = document.createElement("td");
      tdAcciones.classList.add("actions");
      tdAcciones.appendChild(
        createActionButton("✏️", "blue", () => editIngreso(element.id_ingreso))
      );
      tdAcciones.appendChild(
        createActionButton("🗑️", "red", () => deleteIngreso(element.id_ingreso))
      );
      tr.appendChild(tdAcciones);
      [tdId, tdMonto, tdFuente, tdDescripcion, tdAcciones].forEach((td) => {
        td.style.textAlign = "center";
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });

    if (!ingresos.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No hay ingresos registrados";
      td.style.textAlign = "center";
      tr.appendChild(td);
      body.appendChild(tr);
    }

    tableElement.appendChild(body);

    loaderContainer.style.display = "none";
    pageHeader.classList.remove("hidden");
    main.classList.remove("hidden");
    footer.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error.message);
  }
};
