const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = async () => {
  const loaderContainer = document.getElementById("loader-container");
  const container = document.getElementById("container");

  try {
    const { data: categorias, error } = await SUPABASE.from(
      "categorias_gastos"
    ).select("nombre");
    if (error)
      throw new Error(`Error al obtener las categorias: ${error.message}`);

    populateSelectOptions(categorias);

    loaderContainer.style.display = "none";
    container.classList.remove("hidden");
  } catch (error) {
    console.error(error.message);
    alert("Hubo un problema al cargar las categorias de gastos.");
  }
};

function populateSelectOptions(categorias) {
  const selectElement = document.getElementById("categoria");

  categorias.forEach(({ nombre }) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    selectElement.appendChild(option);
  });

  selectElement.addEventListener("change", handleSelectChange);
}

function handleSelectChange(event) {
  const isOtra = event.target.value === "Otra";
  toggleNewCategoriaInputs(isOtra);
  toggleDescripcionRequired(isOtra);
}

function toggleNewCategoriaInputs(show) {
  const parent = document.getElementById("categoria").parentNode;

  if (show) {
    if (!document.getElementById("newCategoria")) {
      const newCategoria = document.createElement("input");
      newCategoria.setAttribute("type", "text");
      newCategoria.setAttribute("id", "newCategoria");
      newCategoria.setAttribute("placeholder", "Escribe la nueva categoria");
      newCategoria.setAttribute("required", "true");

      const newLabel = document.createElement("label");
      newLabel.setAttribute("for", "newCategoria");
      newLabel.textContent = "Nueva categoria:";
      newLabel.setAttribute("id", "newCategoriaLabel");

      parent.insertBefore(
        newLabel,
        parent.querySelector("#categoria").nextSibling
      );
      parent.insertBefore(newCategoria, newLabel.nextSibling);
    }
  } else {
    const newCategoria = document.getElementById("newCategoria");
    const newLabel = document.getElementById("newCategoriaLabel");
    if (newCategoria) newCategoria.remove();
    if (newLabel) newLabel.remove();
  }
}

function toggleDescripcionRequired(required) {
  const descripcion = document.getElementById("descripcion");
  const label = document.getElementById(
    required ? "descripcionLabel" : "descripcionLabelObligatorio"
  );

  if (label) {
    label.textContent = required
      ? "Descripción (obligatorio):"
      : "Descripción (opcional):";
    label.setAttribute(
      "id",
      required ? "descripcionLabelObligatorio" : "descripcionLabel"
    );

    if (required) descripcion.setAttribute("required", "true");
    else descripcion.removeAttribute("required");
  }
}

document
  .getElementById("gastosForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const monto = parseFloat(document.getElementById("monto").value);
      const categoria = document.getElementById("categoria").value;
      const descripcionInput = document.getElementById("descripcion").value;
      const id_usuario = localStorage.getItem("userId");

      if (monto <= 0) {
        alert("El monto debe ser mayor a 0");
        document.getElementById("monto").focus();
        return;
      }

      const descripcion = await getDescripcion(categoria, descripcionInput);
      const id_categoria_gasto = await getCategoriaId(categoria);

      const data = {
        id_usuario,
        monto,
        id_categoria_gasto,
        descripcion,
      };

      await saveOutcome(data);

      alert("El gasto fue guardado exitosamente");
      window.location.href = "../pages/gastos.html";
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  });

async function getDescripcion(categoria, descripcionInput) {
  if (descripcionInput.trim().length > 0) return descripcionInput;

  const { data, error } = await SUPABASE.from("categorias_gastos")
    .select("descripcion")
    .eq("nombre", categoria)
    .single();

  if (error)
    throw new Error(`Error al obtener la descripción: ${error.message}`);
  return data.descripcion;
}

async function getCategoriaId(categoria) {
  const { data, error } = await SUPABASE.from("categorias_gastos")
    .select("id_categoria_gasto")
    .eq("nombre", categoria)
    .single();

  if (error)
    throw new Error(`Error al obtener el ID de la categoria: ${error.message}`);
  return data.id_categoria_gasto;
}

async function saveOutcome(data) {
  const { error } = await SUPABASE.from("gastos").insert([data]);
  if (error) throw new Error("Error al guardar los datos en el servidor");
}
