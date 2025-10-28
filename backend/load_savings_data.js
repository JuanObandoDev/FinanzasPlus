const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let idEditar = null;
const editAhorroForm = document.getElementById("editAhorroForm");
const editMonto = document.getElementById("editMonto");
const editObjetivo = document.getElementById("editObjetivo");
const editDescripcion = document.getElementById("editDescripcion");

editAhorroForm.onsubmit = async (e) => {
  e.preventDefault();
  try {
    const { data: objetivoData, error: objetivoError } = await SUPABASE.from(
      "objetivos_ahorros"
    )
      .select("id_objetivo_ahorro")
      .eq("nombre", editObjetivo.value)
      .single();

    if (objetivoError) {
      throw new Error(`Error al obtener el objetivo: ${objetivoError.message}`);
    }
    const objetivoId = objetivoData.id_objetivo_ahorro;

    if (!idEditar) {
      throw new Error("ID de ahorro no especificado para edición");
    }

    const { error: updateError } = await SUPABASE.from("ahorros")
      .update({
        monto: parseInt(editMonto.value),
        id_objetivo_ahorro: objetivoId,
        descripcion: editDescripcion.value,
      })
      .eq("id_ahorro", idEditar);
    if (updateError)
      throw new Error(`Error updating ahorro: ${updateError.message}`);
    editAhorroModal.style.display = "none";
    window.location.reload();
  } catch (error) {
    console.error(error);
  }
};

var editAhorroModal = document.getElementById("editAhorroModal");
var span = document.getElementById("closeEditAhorroModal");

span.onclick = function () {
  editAhorroModal.style.display = "none";
};

span.onclick = function () {
  editAhorroModal.style.display = "none";
};

window.addEventListener("click", function (event) {
  if (event.target == editAhorroModal) {
    editAhorroModal.style.display = "none";
  }
});

window.onclick = function (event) {
  if (event.target == editAhorroModal) {
    editAhorroModal.style.display = "none";
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

function populateSelectOptions(objetivos) {
  const selectElement = document.getElementById("editObjetivo");

  objetivos.forEach(({ nombre }) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    selectElement.appendChild(option);
  });
}

const editAhorro = async (id) => {
  idEditar = id;
  try {
    const { data: objetivos, error } = await SUPABASE.from(
      "objetivos_ahorros"
    ).select("id_objetivo_ahorro, nombre");
    if (error)
      throw new Error(`Error al obtener las categorias: ${error.message}`);

    populateSelectOptions(objetivos);

    const { data: ahorro, error: ahorroError } = await SUPABASE.from("ahorros")
      .select("monto, id_objetivo_ahorro, descripcion")
      .eq("id_ahorro", id)
      .single();

    if (ahorroError)
      throw new Error(`Error fetching ahorro: ${ahorroError.message}`);

    editMonto.value = ahorro.monto;
    editDescripcion.value = ahorro.descripcion;
    const objetivoData = await SUPABASE.from("objetivos_ahorros")
      .select("nombre")
      .eq("id_objetivo_ahorro", ahorro.id_objetivo_ahorro)
      .single();

    editObjetivo.value = objetivoData.data.nombre;

    editAhorroModal.style.display = "block";
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const performDeleteAhorro = async (id) => {
  try {
    const { error } = await SUPABASE.from("ahorros")
      .delete()
      .eq("id_ahorro", id);
    if (error) throw new Error(`Error deleting ahorro: ${error.message}`);
    window.location.reload();
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const deleteAhorro = async (id) => {
  const confirmDeleteModal = document.getElementById("confirmDeleteModal");
  confirmDeleteModal.style.display = "block";

  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

  confirmDeleteBtn.onclick = async () => {
    await performDeleteAhorro(id);
    confirmDeleteModal.style.display = "none";
  };

  cancelDeleteBtn.onclick = () => {
    confirmDeleteModal.style.display = "none";
  };
};

window.onload = async function (event) {
  const loaderContainer = document.getElementById("loader-container");
  const pageHeader = document.getElementById("header");
  const main = document.getElementById("main");
  const footer = document.getElementById("footer");
  const tableElement = document.getElementById("savingsTable");

  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("User ID not found in localStorage");
    return;
  }
  try {
    const { data: ahorros, error: ahorrosError } = await SUPABASE.from(
      "ahorros"
    )
      .select("id_ahorro, monto, id_objetivo_ahorro, descripcion")
      .eq("id_usuario", userId);

    if (ahorrosError)
      throw new Error(`Error fetching ahorros: ${ahorrosError.message}`);

    const objetivosPromises = ahorros.map((element) =>
      SUPABASE.from("objetivos_ahorros")
        .select("nombre")
        .eq("id_objetivo_ahorro", element.id_objetivo_ahorro)
        .single()
    );
    const objetivos = await Promise.all(objetivosPromises);

    const body = document.createElement("tbody");
    ahorros.forEach((element, index) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = index + 1;

      const tdMonto = document.createElement("td");
      tdMonto.textContent = `$${element.monto.toFixed(2)}`;

      const tdObjetivo = document.createElement("td");
      tdObjetivo.textContent =
        objetivos[index]?.data?.nombre || "Objetivo no encontrado";

      const tdDescripcion = document.createElement("td");
      tdDescripcion.textContent = element.descripcion;

      const tdAcciones = document.createElement("td");
      tdAcciones.classList.add("actions");
      tdAcciones.appendChild(
        createActionButton("✏️", "blue", () => editAhorro(element.id_ahorro))
      );

      tdAcciones.appendChild(
        createActionButton("🗑️", "red", () => deleteAhorro(element.id_ahorro))
      );
      tr.appendChild(tdAcciones);

      [tdId, tdMonto, tdObjetivo, tdDescripcion, tdAcciones].forEach((td) => {
        td.style.textAlign = "center";
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });

    if (!ahorros.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No hay ahorros registrados";
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
