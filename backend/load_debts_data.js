const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let idEditar = null;
const editDeudaForm = document.getElementById("editDeudaForm");
const editMonto = document.getElementById("editMonto");
const editTipoDeuda = document.getElementById("editTipoDeuda");
const editDescripcion = document.getElementById("editDescripcion");

editDeudaForm.onsubmit = async (e) => {
  e.preventDefault();
  try {
    const { data: tipoDeudaData, error: tipoDeudaError } = await SUPABASE.from(
      "categorias_deudas"
    )
      .select("id_categoria_deuda")
      .eq("nombre", editTipoDeuda.value)
      .single();

    if (tipoDeudaError) {
      throw new Error(
        `Error al obtener la categoría: ${tipoDeudaError.message}`
      );
    }
    const categoriaId = tipoDeudaData.id_categoria_deuda;

    if (!idEditar) {
      throw new Error("ID de deuda no especificado para edición");
    }

    const { error: updateError } = await SUPABASE.from("deudas")
      .update({
        monto: parseInt(editMonto.value),
        id_categoria_deuda: categoriaId,
        descripcion: editDescripcion.value,
      })
      .eq("id_deuda", idEditar);
    if (updateError)
      throw new Error(`Error updating deuda: ${updateError.message}`);
    editDeudaModal.style.display = "none";
    window.location.reload();
  } catch (error) {
    console.error(error);
  }
};

var editDeudaModal = document.getElementById("editDeudaModal");
var span = document.getElementById("closeEditDeudaModal");

span.onclick = function () {
  editDeudaModal.style.display = "none";
};

span.onclick = function () {
  editDeudaModal.style.display = "none";
};

window.addEventListener("click", function (event) {
  if (event.target == editDeudaModal) {
    editDeudaModal.style.display = "none";
  }
});

window.onclick = function (event) {
  if (event.target == editDeudaModal) {
    editDeudaModal.style.display = "none";
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

function populateSelectOptions(categorias) {
  const selectElement = document.getElementById("editTipoDeuda");

  categorias.forEach(({ nombre }) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    selectElement.appendChild(option);
  });
}

const editDeuda = async (id) => {
  idEditar = id;
  try {
    const { data: categorias, error } = await SUPABASE.from(
      "categorias_deudas"
    ).select("id_categoria_deuda, nombre");
    if (error)
      throw new Error(`Error al obtener las categorias: ${error.message}`);

    populateSelectOptions(categorias);

    const { data: deuda, error: deudaError } = await SUPABASE.from("deudas")
      .select("monto, id_categoria_deuda, descripcion")
      .eq("id_deuda", id)
      .single();

    if (deudaError)
      throw new Error(`Error fetching deuda: ${deudaError.message}`);

    editMonto.value = deuda.monto;
    editDescripcion.value = deuda.descripcion;
    const categoriaData = await SUPABASE.from("categorias_deudas")
      .select("nombre")
      .eq("id_categoria_deuda", deuda.id_categoria_deuda)
      .single();

    editCategoria.value = categoriaData.data.nombre;

    editDeudaModal.style.display = "block";
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const performDeleteDeuda = async (id) => {
  try {
    const { error } = await SUPABASE.from("deudas").delete().eq("id_deuda", id);
    if (error) throw new Error(`Error deleting deuda: ${error.message}`);
    window.location.reload();
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const deleteDeuda = async (id) => {
  const confirmDeleteModal = document.getElementById("confirmDeleteModal");
  confirmDeleteModal.style.display = "block";

  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

  confirmDeleteBtn.onclick = async () => {
    await performDeleteGasto(id);
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
  const tableElement = document.getElementById("deudasTabla");

  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("User ID not found in localStorage");
    return;
  }

  try {
    const { data: deudas, error: deudasError } = await SUPABASE.from("deudas")
      .select("id_deuda, monto_pagar, id_categoria_deuda, descripcion")
      .eq("id_usuario", userId);

    if (deudasError)
      throw new Error(`Error fetching deudas: ${deudasError.message}`);

    const categoriasPromises = deudas.map((element) =>
      SUPABASE.from("categorias_deudas")
        .select("nombre")
        .eq("id_categoria_deuda", element.id_categoria_deuda)
        .single()
    );
    const categoriasResults = await Promise.all(categoriasPromises);

    const body = document.createElement("tbody");
    deudas.forEach((element, index) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = index + 1;

      const tdMonto = document.createElement("td");
      tdMonto.textContent = `$${element.monto_pagar.toFixed(2)}`;

      const tdFuente = document.createElement("td");
      tdFuente.textContent =
        categoriasResults[index]?.data?.nombre || "categoria no encontrada";

      const tdDescripcion = document.createElement("td");
      tdDescripcion.textContent = element.descripcion;

      const tdAcciones = document.createElement("td");
      tdAcciones.classList.add("actions");
      tdAcciones.appendChild(
        createActionButton("✏️", "blue", () => editDeuda(element.id_deuda))
      );
      tdAcciones.appendChild(
        createActionButton("🗑️", "red", () => deleteDeuda(element.id_deuda))
      );
      tr.appendChild(tdAcciones);

      [tdId, tdMonto, tdFuente, tdDescripcion, tdAcciones].forEach((td) => {
        td.style.textAlign = "center";
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });

    if (!deudas.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No hay deudas registradas";
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
