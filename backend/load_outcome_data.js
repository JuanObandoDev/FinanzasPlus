const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let idEditar = null;
const editGastoForm = document.getElementById("editGastoForm");
const editMonto = document.getElementById("editMonto");
const editCategoria = document.getElementById("editCategoria");
const editDescripcion = document.getElementById("editDescripcion");

editGastoForm.onsubmit = async (e) => {
  e.preventDefault();
  try {
    const { data: categoriaData, error: categoriaError } = await SUPABASE.from(
      "categorias_gastos"
    )
      .select("id_categoria_gasto")
      .eq("nombre", editCategoria.value)
      .single();

    if (categoriaError) {
      throw new Error(
        `Error al obtener la categoría: ${categoriaError.message}`
      );
    }
    const categoriaId = categoriaData.id_categoria_gasto;

    if (!idEditar) {
      throw new Error("ID de gasto no especificado para edición");
    }

    const { error: updateError } = await SUPABASE.from("gastos")
      .update({
        monto: parseInt(editMonto.value),
        id_categoria_gasto: categoriaId,
        descripcion: editDescripcion.value,
      })
      .eq("id_gasto", idEditar);
    if (updateError)
      throw new Error(`Error updating gasto: ${updateError.message}`);
    editGastoModal.style.display = "none";
    window.location.reload();
  } catch (error) {
    console.error(error);
  }
};

var editGastoModal = document.getElementById("editGastoModal");
var span = document.getElementById("closeEditGastoModal");

span.onclick = function () {
  editGastoModal.style.display = "none";
};

span.onclick = function () {
  editGastoModal.style.display = "none";
};

window.addEventListener("click", function (event) {
  if (event.target == editGastoModal) {
    editGastoModal.style.display = "none";
  }
});

window.onclick = function (event) {
  if (event.target == editGastoModal) {
    editGastoModal.style.display = "none";
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
  const selectElement = document.getElementById("editCategoria");

  categorias.forEach(({ nombre }) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    selectElement.appendChild(option);
  });
}

const editGasto = async (id) => {
  idEditar = id;
  try {
    const { data: categorias, error } = await SUPABASE.from(
      "categorias_gastos"
    ).select("id_categoria_gasto, nombre");
    if (error)
      throw new Error(`Error al obtener las categorias: ${error.message}`);

    populateSelectOptions(categorias);

    const { data: gasto, error: gastoError } = await SUPABASE.from("gastos")
      .select("monto, id_categoria_gasto, descripcion")
      .eq("id_gasto", id)
      .single();

    if (gastoError)
      throw new Error(`Error fetching gasto: ${gastoError.message}`);

    editMonto.value = gasto.monto;
    editDescripcion.value = gasto.descripcion;
    const categoriaData = await SUPABASE.from("categorias_gastos")
      .select("nombre")
      .eq("id_categoria_gasto", gasto.id_categoria_gasto)
      .single();

    editCategoria.value = categoriaData.data.nombre;

    editGastoModal.style.display = "block";
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const performDeleteGasto = async (id) => {
  try {
    const { error } = await SUPABASE.from("gastos").delete().eq("id_gasto", id);
    if (error) throw new Error(`Error deleting gasto: ${error.message}`);
    window.location.reload();
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const deleteGasto = async (id) => {
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
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("User ID not found in localStorage");
    return;
  }

  const loaderContainer = document.getElementById("loader-container");
  const pageHeader = document.getElementById("header");
  const main = document.getElementById("main");
  const footer = document.getElementById("footer");
  const tableElement = document.getElementById("gastosTabla");

  try {
    const { data: gastos, error: gastosError } = await SUPABASE.from("gastos")
      .select("id_gasto, monto, id_categoria_gasto, descripcion")
      .eq("id_usuario", userId);

    if (gastosError)
      throw new Error(`Error fetching gastos: ${gastosError.message}`);

    const categoriasPromises = gastos.map((element) =>
      SUPABASE.from("categorias_gastos")
        .select("nombre")
        .eq("id_categoria_gasto", element.id_categoria_gasto)
        .single()
    );
    const categoriasResults = await Promise.all(categoriasPromises);

    const body = document.createElement("tbody");
    if (gastos.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No hay gastos registrados";
      td.style.textAlign = "center";
      tr.appendChild(td);
      body.appendChild(tr);
    } else {
      gastos.forEach((element, index) => {
        const tr = document.createElement("tr");

        const tdId = document.createElement("td");
        tdId.textContent = index + 1;

        const tdMonto = document.createElement("td");
        tdMonto.textContent = `$${element.monto.toFixed(2)}`;

        const tdCategoria = document.createElement("td");
        tdCategoria.textContent =
          categoriasResults[index]?.data?.nombre || "Categoría no encontrada";

        const tdDescripcion = document.createElement("td");
        tdDescripcion.textContent = element.descripcion;

        const tdAcciones = document.createElement("td");
        tdAcciones.classList.add("actions");
        tdAcciones.appendChild(
          createActionButton("✏️", "blue", () => editGasto(element.id_gasto))
        );
        tdAcciones.appendChild(
          createActionButton("🗑️", "red", () => deleteGasto(element.id_gasto))
        );

        [tdId, tdMonto, tdCategoria, tdDescripcion, tdAcciones].forEach(
          (td) => {
            td.style.textAlign = "center";
            tr.appendChild(td);
          }
        );
        body.appendChild(tr);
      });
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
